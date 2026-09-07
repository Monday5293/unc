# 全局账号方案：跨设备登录 + 多账号支持

## 核心问题

1. **同一微信号多账号**：当前 `_openid` 唯一标识，一个微信号只能有一个账号
2. **跨设备登录**：`_openid` 绑定设备微信号，换个设备 OpenID 不同，无法登录自己的账号

## 解决方案

**账号 = 昵称 + 密码（全局唯一）**，不再绑定 OpenID。所有数据库操作通过云函数（admin 权限）代理，绕过 `_openid` 隔离。

### 账号标识体系

| 场景 | 旧逻辑 | 新逻辑 |
|------|--------|--------|
| 注册 | `_openid` 唯一，同微信号只能注册一个 | `name` 全局唯一，同名不可重复注册 |
| 登录 | 查 `_openid` 验密码 | 查 `name` 验密码，返回 `userId` |
| 跨设备 | 不可行（不同设备不同 OpenID） | 可行（name + password 全局登录） |
| 数据隔离 | 按 `_openid`（PRIVATE 权限自动） | 按 `userId`（云函数手动过滤） |

### 数据库权限变更

- `users` 集合：`PRIVATE` → `ADMIN_ONLY`（仅云函数可读写）
- `cards` 集合：`PRIVATE` → `ADMIN_ONLY`（仅云函数可读写）
- 所有 CRUD 操作通过云函数执行，云函数拥有 admin 权限，可访问任意文档

---

## 实施步骤

### 步骤 1：修改 auth 云函数

**文件：** `i:\unc\miniprogram\cloudfunctions\auth\index.js`

**check 动作：**
- 改为按 `name` 查询（不按 `_openid`）
- 返回 `{ exists: boolean, name: string }`

**register 动作：**
- 按 `name` 查询是否已存在（全局唯一）
- 不存在时生成 `userId`（`sha256(Date.now() + Math.random() + name)`）
- 存入 `{ name, passwordHash, userId, avatar: '', createdAt, updatedAt }`
- 返回 `{ success: true, name, userId }`

**login 动作：**
- 按 `name` 查询（不按 `_openid`）
- 验密码
- 返回 `{ success: true, name, userId }`

### 步骤 2：新建 cards 云函数

**文件：** `i:\unc\miniprogram\cloudfunctions\cards\index.js`（新建）

**功能：** 代理所有卡片 CRUD 操作，按 `userId` 过滤

| 动作 | 参数 | 操作 |
|------|------|------|
| `sync` | `userId` | 查询 `cards` 集合中 `userId` 匹配的所有卡片，按 `createdAt` 降序 |
| `add` | `userId`, `card` | 新增卡片文档 |
| `update` | `userId`, `cardId`, `card` | 更新指定卡片 |
| `delete` | `userId`, `cardId` | 删除指定卡片 |
| `migrate` | `userId`, `cards` | 批量迁移本地卡片到云端 |

```js
// cards 云函数骨架
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { action, userId, cardId, card, cards } = event
  if (!userId) return { errMsg: '缺少 userId' }

  const col = db.collection('cards')

  if (action === 'sync') {
    const res = await col.where({ userId }).orderBy('createdAt', 'desc').get()
    return { success: true, data: res.data }
  }
  if (action === 'add') {
    if (!card) return { errMsg: '缺少卡片数据' }
    await col.add({ data: { ...card, userId } })
    return { success: true }
  }
  if (action === 'update') {
    if (!cardId) return { errMsg: '缺少 cardId' }
    await col.where({ cardId, userId }).update({ data: card })
    return { success: true }
  }
  if (action === 'delete') {
    if (!cardId) return { errMsg: '缺少 cardId' }
    await col.where({ cardId, userId }).remove()
    return { success: true }
  }
  if (action === 'migrate') {
    if (!cards || !cards.length) return { success: true }
    for (const c of cards) {
      await col.add({ data: { ...c, userId } })
    }
    return { success: true }
  }
  return { errMsg: '未知操作' }
}
```

### 步骤 3：修改 store.js

**文件：** `i:\unc\miniprogram\utils\store.js`

**`cloudLogin`：**
- 从云函数响应中获取 `userId`，传给 `_doLoginCallback(userId, name)`

**`_doLoginCallback(userId, name)`：**
- 接受 `userId` 参数，不再本地生成
- `state.userId = userId`
- `state.currentOpenid = userId`（本地存储 key 用 userId）

**`_syncCardsFromCloud`：**
- 改为调用云函数 `cards`，action `sync`，参数 `{ userId: state.userId }`
- 不再直接操作 `db.collection('cards')`

**`_uploadCardToCloud`：**
- 改为调用云函数 `cards`，action `add`

**`_updateCardInCloud`：**
- 改为调用云函数 `cards`，action `update`

**`_deleteCardFromCloud`：**
- 改为调用云函数 `cards`，action `delete`

**`_migrateLocalCardsToCloud`：**
- 改为调用云函数 `cards`，action `migrate`

**`cloudCheckAccount`：**
- 需要传入 `name` 参数（按 name 查）
- 登录弹窗中先输入昵称，再调用 check

### 步骤 4：修改 UI 层

**涉及文件：**
- `i:\unc\miniprogram\pages\profile\profile.js`
- `i:\unc\miniprogram\pages\home\home.js`
- `i:\unc\miniprogram\pages\card-detail\card-detail.js`

**`cloudCheckAccount` 调用时机调整：**
- 旧逻辑：打开弹窗立即调用 check（无参数）
- 新逻辑：用户在昵称输入框输入/选择昵称后，失焦时调用 `cloudCheckAccount(name)` 检查该昵称是否存在
- 如果存在 → 切换为登录模式
- 如果不存在 → 保持注册模式

**`onLoginNameBlur`：**
- 失焦时调用 `store.cloudCheckAccount(loginName)` 
- 根据返回的 `exists` 设置 `isRegisterMode`

### 步骤 5：云数据库权限设置

在云开发控制台：
1. `users` 集合 → 权限设置 → 改为「仅云函数可读写」
2. `cards` 集合 → 权限设置 → 改为「仅云函数可读写」

### 步骤 6：部署

- 右键 `cloudfunctions/auth` → 「上传并部署：云端安装依赖」
- 右键 `cloudfunctions/cards` → 「创建并部署：云端安装依赖」

---

## 验证步骤

1. 用名字 "张三" 密码 "1234" 注册 → 创建角色卡 A
2. 退出登录
3. 用名字 "李四" 密码 "5678" 注册 → 创建角色卡 B
4. 退出登录
5. 用名字 "张三" 密码 "1234" 登录 → 应该只看到角色卡 A
6. 退出登录
7. 用名字 "李四" 密码 "5678" 登录 → 应该只看到角色卡 B
8. （换个设备/微信号）用名字 "张三" 密码 "1234" 登录 → 应该看到角色卡 A（跨设备验证）