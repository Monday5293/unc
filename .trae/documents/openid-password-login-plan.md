# OpenID + 密码登录方案

## 摘要

将当前基于手机号+验证码的登录方式，改为基于微信 OpenID + 密码的登录方式。OpenID 由 `wx.login()` 获得，在同一微信账号下所有设备上一致，搭配用户自设密码实现安全的跨设备登录和云同步。

## 当前状态分析

### 现有登录流程（有问题）
```
用户打开登录弹窗 → 输入姓名 → 输入手机号 → 点击获取验证码 → 输入验证码 → 登录
                                                            ↓
                                              getPhoneNumber 按钮（个人小程序不可用，弹窗闪退）
```
- 手机号依赖 `getPhoneNumber` API，个人小程序无权限
- 验证码是前端模拟生成，没有真实短信发送
- 手机号作为账号标识，仅存本地 `trpg-phone-accounts`，不支持跨设备

### 现有云数据库
- `cards` 集合：PRIVATE 权限，通过 `_openid` 自动区分用户，已支持跨设备卡片同步
- `users` 集合：尚未创建

### 涉及文件
| 文件 | 角色 |
|---|---|
| [store.js](file:///i:/unc/miniprogram/utils/store.js) | 登录状态管理、账号持久化 |
| [profile.wxml](file:///i:/unc/miniprogram/pages/profile/profile.wxml) | 我的页面 + 登录弹窗 UI |
| [profile.js](file:///i:/unc/miniprogram/pages/profile/profile.js) | 登录弹窗交互逻辑 |
| [home.wxml](file:///i:/unc/miniprogram/pages/home/home.wxml) | 首页登录弹窗 UI |
| [home.js](file:///i:/unc/miniprogram/pages/home/home.js) | 首页登录弹窗交互逻辑 |
| [card-detail.wxml](file:///i:/unc/miniprogram/pages/card-detail/card-detail.wxml) | 卡片详情登录弹窗 UI |
| [card-detail.js](file:///i:/unc/miniprogram/pages/card-detail/card-detail.js) | 卡片详情登录弹窗交互逻辑 |
| [app.js](file:///i:/unc/miniprogram/app.js) | 云开发初始化 |

## 方案设计

### 整体流程

```
用户打开小程序
       │
       ▼
  wx.login() → code → 云函数 auth → 获取 openid
       │
       ├── openid 已有账号 → 显示"登录"弹窗（密码）
       │         │
       │         ▼
       │    输入密码 → 云函数验证 → 登录成功
       │
       └── openid 无账号 → 显示"注册"弹窗（姓名 + 密码）
                 │
                 ▼
            输入姓名+密码 → 云函数创建账号 → 登录成功
       │
       ▼
  登录成功 → 本地缓存 openid → 后续启动自动恢复登录态
```

### 账号存储（云数据库 `users` 集合）

```
users 集合（PRIVATE 权限）
┌──────────────────────────────────────────────┐
│ _id:         自动生成                          │
│ _openid:     自动（微信用户唯一标识）           │
│ name:        用户昵称                          │
│ passwordHash: 密码哈希（SHA-256）              │
│ avatar:      头像路径                          │
│ createdAt:   创建时间                          │
│ updatedAt:   更新时间                          │
└──────────────────────────────────────────────┘
```

### 密码安全

- 密码不在前端明文传输：密码在客户端 SHA-256 哈希后传给云函数
- 云函数存储哈希值，不做明文比对
- 云函数中再次哈希（加盐）后存储

### 自动登录

- 首次登录成功后，将 openid 存入本地 `STORAGE_KEY_LOGIN`
- 下次启动时，`init()` 读取本地 openid，直接恢复登录态（无需再输密码）
- 退出登录时清除本地 openid

## 具体改动

### 1. 创建云数据库集合 `users`

- 权限：PRIVATE（仅创建者可读写）
- 无需预设索引

### 2. 创建云函数 `auth`

文件：`miniprogram/cloudfunctions/auth/index.js`

```javascript
const cloud = require('wx-server-sdk')
const crypto = require('crypto')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex')
}

exports.main = async (event, context) => {
  const { action, code, name, passwordHash } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) return { errMsg: '获取 openid 失败' }

  const usersCol = db.collection('users')
  const userRes = await usersCol.where({ _openid: openid }).get()
  const user = userRes.data[0]

  if (action === 'check') {
    // 检查 openid 是否已有账号
    return { exists: !!user, name: user ? user.name : '' }
  }

  if (action === 'register') {
    if (user) return { errMsg: '账号已存在' }
    if (!name || !passwordHash) return { errMsg: '缺少参数' }
    const hashed = sha256(passwordHash + openid) // 加盐哈希
    const now = new Date().toISOString()
    await usersCol.add({
      data: { name, passwordHash: hashed, avatar: '', createdAt: now, updatedAt: now }
    })
    return { success: true, name }
  }

  if (action === 'login') {
    if (!user) return { errMsg: '账号不存在，请先注册' }
    if (!passwordHash) return { errMsg: '请输入密码' }
    const hashed = sha256(passwordHash + openid)
    if (hashed !== user.passwordHash) return { errMsg: '密码错误' }
    return { success: true, name: user.name }
  }

  return { errMsg: '未知操作' }
}
```

### 3. 改造 `store.js`

**删除**：
- `generateVerificationCode()`、`verifyCode()`、`clearVerificationCode()` — 验证码相关
- `loadPhoneAccounts()`、`savePhoneAccounts()`、`getAccountByPhone()` — 手机号映射
- 状态中的 `_verificationCodes`、`currentAccountPhone`

**新增**：
- `cloudLogin(action, name, password)` — 异步调用云函数 `auth`，返回 `{ success, errMsg }`
- `cloudCheckAccount()` — 异步调用云函数 `auth` 检查是否有账号

**修改**：
- `doLogin()` — 改为接收 `openid` + `name`，不再处理手机号，存储 openid 到本地
- `logout()` — 清除本地 openid
- `init()` — 恢复登录态：读取本地 openid，如果有则直接设为已登录（无需密码）
- `isLoggedIn()` — 不变

**自动登录逻辑**：
```
init() 读取 STORAGE_KEY_LOGIN
  → 有 openid → state.isLoggedIn = true → 直接恢复登录态
  → 无 openid → state.isLoggedIn = false → 显示未登录
```

### 4. 改造登录弹窗 UI

**三个页面（profile/home/card-detail）统一改造**：

**删除**：
- 手机号输入框 + `getPhoneNumber` 按钮
- 验证码输入框 + 获取验证码按钮  
- `onPhoneFieldTap`、`onGetPhoneNumber`、`onSendCode`、`onLoginCodeInput` 方法

**新增**：
- 密码输入框（`type="password"`）
- 注册/登录两种模式切换

**弹窗结构**：
```xml
<view class="login-dialog">
  <view class="dialog-header">
    <text class="dialog-title">{{isRegisterMode ? '注册' : '登录'}}</text>
  </view>
  <view class="dialog-body">
    <!-- 注册模式：显示姓名 -->
    <view class="login-field" wx:if="{{isRegisterMode}}">
      <text class="login-field-label">姓名</text>
      <input placeholder="请输入昵称" value="{{loginName}}" bindinput="onLoginNameInput" />
    </view>
    <!-- 登录/注册都显示密码 -->
    <view class="login-field">
      <text class="login-field-label">密码</text>
      <input type="password" placeholder="请输入密码" value="{{loginPassword}}" bindinput="onLoginPasswordInput" />
    </view>
    <button bindtap="doLoginSubmit">登录</button>
    <view class="login-toggle" bindtap="toggleLoginMode">
      {{isRegisterMode ? '已有账号？去登录' : '没有账号？去注册'}}
    </view>
  </view>
</view>
```

### 5. 改造 JS 交互逻辑

**简化 data**：
```javascript
data: {
  loginDialogVisible: false,
  isRegisterMode: false,  // 注册/登录模式
  loginName: '',
  loginPassword: '',
  loginPendingAction: null,
}
```

**核心流程**：
```javascript
// 打开弹窗时
openLoginDialog() {
  this.setData({ loginDialogVisible: true, loginName: '', loginPassword: '' })
  // 先检查是否已有账号
  store.cloudCheckAccount().then(res => {
    this.setData({ isRegisterMode: !res.exists })
    if (res.exists) {
      this.setData({ loginName: res.name })
    }
  })
}

// 提交登录/注册
doLoginSubmit() {
  var action = this.data.isRegisterMode ? 'register' : 'login'
  var name = this.data.loginName.trim()
  var password = this.data.loginPassword
  if (!password) { wx.showToast({ title: '请输入密码', icon: 'none' }); return }
  if (action === 'register' && !name) { wx.showToast({ title: '请输入姓名', icon: 'none' }); return }
  
  wx.showLoading({ title: '登录中...' })
  store.cloudLogin(action, name, password).then(res => {
    wx.hideLoading()
    if (res.success) {
      this.setData({ loginDialogVisible: false })
      this.refreshData()
      // 执行待处理操作
      if (this.data.loginPendingAction === 'add') { this.doAddCard() }
    } else {
      wx.showToast({ title: res.errMsg, icon: 'none' })
    }
  })
}
```

### 6. 卡片数据关联

卡片已通过 `_openid` 存储在云数据库 `cards` 集合中（PRIVATE 权限），登录后自动加载，无需额外改动。

## 前提与假设

- **个人小程序可用**：`wx.login()` 和 `cloud.openapi` 个人小程序均可正常使用
- **密码最低要求**：前端校验至少 4 位
- **测试账号保留**：姓名和密码都为 `A` 时跳过云函数，直接本地登录（方便开发调试）
- **自动登录**：一次登录后本地缓存 openid，下次启动无需密码
- 用户退出登录后，下次需要重新输入密码

## 验证步骤

1. 上传部署云函数 `auth`
2. 创建 `users` 云数据库集合
3. 重新编译，打开"我的"页面
4. 点击名称 → 弹出登录弹窗 → 显示"注册"模式（首次）
5. 输入姓名和密码 → 点击登录 → 注册成功
6. 退出登录 → 再次点击名称 → 显示"登录"模式
7. 输入密码 → 登录成功
8. 关闭小程序再打开 → 自动恢复登录态
9. 新建角色卡 → 云数据库 cards 中出现新卡片
10. 退出登录 → 卡片隐藏（仅显示预设卡）