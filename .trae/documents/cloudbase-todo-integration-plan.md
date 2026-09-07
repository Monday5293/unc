# 云开发环境连接 + 待办事项集成计划

## 概述
将微信云开发环境（`cloud1-d0gwarelhb75141fd`）连接到现有跑团角色卡小程序，并在其中新增一个待办事项功能模块，使用云开发文档数据库存储数据。

## 当前状态分析

### 项目结构
- **类型**：微信小程序（原生开发，非框架）
- **AppID**：`wx107d07d8d5ee759a`
- **小程序根目录**：`miniprogram/`
- **现有页面**：home（卡面）、profile（我的）、card-detail、card-list、import-list、custom-form、json-io
- **TabBar**：2 个 tab（卡面、我的），使用自定义 tabBar
- **数据存储**：当前全部使用 `wx.setStorageSync` 本地存储（`store.js`）
- **无云开发配置**：`project.config.json` 中无云函数/云开发相关配置

### 关键文件
- `i:\unc\project.config.json` — 项目配置，需添加云开发配置
- `i:\unc\miniprogram\app.js` — 入口文件，需初始化云开发
- `i:\unc\miniprogram\app.json` — 页面注册，需注册新页面
- `i:\unc\miniprogram\utils\store.js` — 当前数据管理（仅限本地存储，不动）
- `i:\unc\miniprogram\pages\profile\profile.wxml` — 我的页面，添加入口

## 实施步骤

### 步骤 1：CloudBase 环境登录与绑定

**操作**：通过 MCP `mcp_cloudbase` 的 auth 工具登录并绑定环境
- 使用 `auth` action=`start_auth` 发起登录
- 使用 `auth` action=`set_env` 绑定 `envId=cloud1-d0gwarelhb75141fd`
- 使用 `envQuery` action=`info` 验证环境信息
- 使用 `envQuery` action=`domains` 获取安全域名配置

**验证**：确认环境状态为 NORMAL，确认数据库类型（NoSQL）

### 步骤 2：配置项目云开发

#### 2.1 修改 `project.config.json`
在根级别添加云函数根目录配置：
```json
"cloudfunctionRoot": "miniprogram/cloudfunctions/",
"cloudbaseRoot": "miniprogram/cloudfunctions/"
```

#### 2.2 修改 `miniprogram/app.js`
在 `App({})` 中初始化云开发环境：
```javascript
App({
  onLaunch() {
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-d0gwarelhb75141fd',
        traceUser: true
      })
    }
    store.init()
  },
  globalData: {
    userInfo: null
  }
})
```

#### 2.3 创建云函数目录
创建 `miniprogram/cloudfunctions/` 目录（预留，本期待办事项不使用云函数，直接使用客户端数据库 API）

**验证**：在微信开发者工具中点击"云开发"按钮，确认能正常打开云开发控制台

### 步骤 3：创建 NoSQL 数据库集合

#### 3.1 通过 MCP 创建集合
使用 `writeNoSqlDatabaseStructure` action=`createCollection`：
- **集合名**：`todos`
- **索引**：无需额外索引（_id 自动建索引，_openid 自动建索引）

#### 3.2 数据权限配置
通过 MCP `managePermissions` 配置集合权限：
- 读权限：仅创建者可读（`doc._openid == auth.openid`）
- 写权限：仅创建者可写

#### 3.3 数据模型设计
```
todos 集合文档结构：
{
  _id: string,           // 自动生成
  _openid: string,       // 自动填充（用户标识）
  title: string,         // 待办事项标题（必填）
  completed: boolean,    // 是否完成（默认 false）
  createdAt: string,     // 创建时间 ISO 格式
  updatedAt: string      // 更新时间 ISO 格式
}
```

**验证**：在云开发控制台 → 数据库中确认 `todos` 集合已创建

### 步骤 4：创建待办事项页面

#### 4.1 新建文件
在 `miniprogram/pages/todo/` 下创建 4 个文件：

**`todo.json`**
```json
{
  "navigationBarTitleText": "待办事项",
  "backgroundColor": "#1A1714",
  "usingComponents": {}
}
```

**`todo.wxml`** — 页面布局
- 顶部输入区：输入框 + 添加按钮
- 待办列表：每项显示标题、完成状态切换、删除按钮
- 统计栏：显示 总数/已完成/未完成
- 空状态提示

**`todo.wxss`** — 样式
- 沿用项目深色主题（`#1A1714` 背景色）
- 使用项目通用样式变量和类名
- 已完成项用删除线 + 灰色文字
- 添加按钮使用系统 accent color

**`todo.js`** — 逻辑
- `onLoad`：初始化云数据库引用
- `loadTodos`：从云数据库查询当前用户的待办事项
- `addTodo`：插入新文档到云数据库
- `toggleTodo`：更新文档的 `completed` 字段
- `deleteTodo`：从云数据库删除文档
- 使用 `wx.cloud.database().collection('todos')` 操作数据

#### 4.2 在 `app.json` 中注册页面
在 `pages` 数组中添加 `"pages/todo/todo"`

#### 4.3 在"我的"页面添加入口
在 `profile.wxml` 的菜单列表中，在"设置"上方添加"待办事项"菜单项：
```xml
<view class="menu-item" bindtap="goTodo">
  <text class="menu-icon">📋</text>
  <view class="menu-info">
    <text class="menu-title">待办事项</text>
    <text class="menu-desc">云同步的待办清单</text>
  </view>
  <text class="menu-arrow">›</text>
</view>
```

在 `profile.js` 中添加导航方法：
```javascript
goTodo() {
  wx.navigateTo({
    url: '/pages/todo/todo'
  })
}
```

### 步骤 5：安全域名配置

通过 MCP `envDomainManagement` 配置安全域名（如需要）：
- 添加 `https://cloud1-d0gwarelhb75141fd.service.tcloudbase.com` 到安全域名列表

**验证**：在微信开发者工具中测试待办事项的 增/删/改/查 功能，确认数据正确存储到云数据库

## 验证步骤

1. 打开微信开发者工具，确认云开发已初始化（Console 无报错）
2. 进入"我的"页面 → 点击"待办事项"
3. 添加几条待办事项
4. 切换完成状态
5. 删除一条待办事项
6. 在云开发控制台 → 数据库 → todos 集合中确认数据存在
7. 退出登录后重新登录，确认待办事项数据仍然存在

## 假设与决策

- **数据存储**：待办事项使用云数据库，现有角色卡数据暂时保持本地存储（后续可迁移）
- **权限模型**：使用云数据库的行级安全规则，每个用户只能读写自己的待办事项
- **入口位置**：待办事项从"我的"页面菜单进入，不修改现有 TabBar
- **不创建云函数**：本期待办事项直接使用客户端 SDK（`wx.cloud.database()`）操作数据库，无需云函数
- **云环境**：假设 `cloud1-d0gwarelhb75141fd` 是有效的 NoSQL 类型云开发环境