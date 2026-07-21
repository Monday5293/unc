# TRPG 角色卡全栈项目 — 架构文档

> 基于 Vue 3 + Pinia + form-create-designer 的 TRPG 角色卡管理与表单设计系统，支持 COC / DND / Daggerheart 三种规则。

---

## 目录

- [项目总览](#项目总览)
- [技术栈](#技术栈)
- [启动命令](#启动命令)
- [目录结构](#目录结构)
- [核心模块详解](#核心模块详解)
  - [src/data/rules/ — 规则系统数据层](#srcdatarules--规则系统数据层)
  - [src/types/ — 类型定义](#srctypes--类型定义)
  - [src/stores/ — 状态管理](#srcstores--状态管理)
  - [src/api/ — API 通信层](#srcapi--api-通信层)
  - [src/utils/ — 工具库](#srcutils--工具库)
  - [src/router/ — 路由配置](#srcrouter--路由配置)
  - [src/pages/ — 页面组件](#srcpages--页面组件)
  - [src/components/ — 通用组件](#srccomponents--通用组件)
  - [src/data/ — 静态数据](#srcdata--静态数据)
  - [server/ — Express 后端](#server--express-后端)
  - [miniprogram/ — 微信小程序端](#miniprogram--微信小程序端)
- [数据流图](#数据流图)
- [调用关系矩阵](#调用关系矩阵)

---

## 项目总览

本项目是一个 **双端 TRPG 角色卡系统**：

| 端 | 技术 | 入口 | 说明 |
|----|------|------|------|
| **Web 端** | Vue 3 + Vite | [src/main.ts](file:///i:/unc/src/main.ts) | 表单设计器 + 小程序模拟预览 |
| **服务端** | Express 5 | [server/index.js](file:///i:/unc/server/index.js) | 表单 JSON 存储 API |
| **小程序端** | 微信原生 | [miniprogram/app.js](file:///i:/unc/miniprogram/app.js) | 角色卡展示与管理 |

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3 (Composition API + `<script setup>`) |
| 状态管理 | Pinia 4 |
| 路由 | Vue Router 4 |
| UI 框架 | Element Plus + Tailwind CSS 3 |
| 表单设计器 | form-create-designer 3 |
| 后端 | Express 5 |
| 语言 | TypeScript 5.3 |
| 构建工具 | Vite 5 |

---

## 启动命令

```bash
pnpm dev          # 同时启动 Web (Vite) + Server (Express)
pnpm run web      # 仅启动 Web 前端，端口 5173
pnpm run server   # 仅启动后端 API，端口 3001
pnpm run build    # 生产构建
pnpm run check    # TypeScript 类型检查
```

---

## 目录结构

```
i:\unc\
├── index.html                          # Vite 入口 HTML
├── package.json                         # 依赖与脚本
├── vite.config.ts                       # Vite 构建配置（含 API 代理）
├── tsconfig.json                        # TypeScript 配置
├── tailwind.config.js                   # Tailwind CSS 配置
├── ARCHITECTURE.md                      # ← 本文档
│
├── src/                                 # ===== Vue 前端源码 =====
│   ├── main.ts                          # 应用入口：注册插件、挂载
│   ├── App.vue                          # 根组件（仅 router-view）
│   ├── style.css                        # 全局样式 + 主题变量
│   │
│   ├── api/                             # API 通信层
│   │   └── form.ts                      # 表单 CRUD → [详情](#srcapi--api-通信层)
│   │
│   ├── types/                           # TypeScript 类型定义
│   │   ├── card.ts                      # 核心类型 → [详情](#srctypes--类型定义)
│   │   └── saved-form.ts               # 已保存表单类型
│   │
│   ├── stores/                          # Pinia 状态管理
│   │   ├── cards.ts                     # 角色卡 & 规则系统 Store → [详情](#srcstores--状态管理)
│   │   └── customForms.ts              # 自定义表单 Store
│   │
│   ├── router/                          # 路由配置
│   │   └── index.ts                     # 双端路由 → [详情](#srcrouter--路由配置)
│   │
│   ├── pages/                           # 页面组件
│   │   ├── DesignerPage.vue             # 表单设计器页 → [详情](#srcpages--页面组件)
│   │   └── miniapp/                     # 小程序模拟端页面
│   │       ├── MiniAppShell.vue         # 外壳容器（手机框 + TabBar）
│   │       ├── MiniAppHome.vue          # 首页（卡片列表 + 搜索）
│   │       ├── MiniAppProfile.vue       # 个人中心
│   │       ├── CardDetail.vue           # 角色卡详情 + 表单渲染
│   │       ├── CustomCardDetail.vue     # 自定义表单渲染（已隐藏路由）
│   │       └── ImportFormList.vue       # 导入服务器表单（已隐藏路由）
│   │
│   ├── components/                      # 通用组件
│   │   ├── CardItem.vue                 # 角色卡片 → [详情](#srccomponents--通用组件)
│   │   └── RuleTab.vue                  # 规则系统 Tab 切换器
│   │
│   ├── utils/                           # 工具库
│   │   └── logger.ts                    # 统一日志工具 → [详情](#srcutils--工具库)
│   │
│   └── data/                            # 静态数据层
│       ├── cards.ts                     # 角色卡数据桥接 → [详情](#srcdata--静态数据)
│       ├── systems.json                 # 规则系统元信息
│       └── rules/                       # ★ 规则系统核心数据 ★
│           ├── index.ts                 # 统一入口 → [详情](#datarulesindex---统一入口)
│           ├── common/                  # 通用代码
│           │   ├── index.ts
│           │   ├── labels.ts            # 标签映射 → [详情](#commonlabelsts---标签映射)
│           │   ├── preview-stats.ts     # 预览统计 → [详情](#commonpreview-statsts---预览统计)
│           │   └── base-template.ts     # 表单模板基类 → [详情](#commonbase-templatets---表单模板基类)
│           ├── coc/                     # COC 克苏鲁的呼唤
│           │   ├── index.ts
│           │   ├── template.ts          # COC 7e 调查员卡模板
│           │   └── cards.ts             # 2 张预置 COC 角色卡
│           ├── dnd/                     # DND 龙与地下城
│           │   ├── index.ts
│           │   ├── template.ts          # D&D 5e 冒险者卡模板
│           │   └── cards.ts             # 2 张预置 DND 角色卡
│           └── daggerheart/             # Daggerheart 匕首之心
│               ├── index.ts
│               ├── template.ts          # Daggerheart 英雄卡模板
│               └── cards.ts             # 2 张预置 Daggerheart 角色卡
│       └── templates/                   # 旧模板桥接（兼容）
│           ├── index.ts
│           ├── coc-template.ts
│           ├── dnd-template.ts
│           └── daggerheart-template.ts
│
├── server/                              # ===== Express 后端 =====
│   ├── index.js                         # API 服务入口 → [详情](#server--express-后端)
│   └── data/saved-forms/                # 已保存的表单 JSON 文件
│
└── miniprogram/                         # ===== 微信小程序端 =====
    ├── app.js                           # 小程序入口 → [详情](#miniprogram--微信小程序端)
    ├── app.json                         # 页面路由 + TabBar 配置
    ├── utils/
    │   ├── store.js                     # 状态管理（小程序版）
    │   └── api.js                       # API 请求封装
    ├── pages/                           # 小程序页面
    │   ├── home/                        # 首页（角色卡列表）
    │   ├── profile/                     # 个人中心
    │   ├── card-detail/                 # 角色卡详情
    │   ├── custom-form/                 # 自定义表单渲染
    │   ├── import-list/                 # 导入服务器表单
    │   └── json-io/                     # JSON 导入导出
    └── components/                      # 小程序组件
        ├── card-item/                   # 角色卡片组件
        ├── rule-tab/                    # 规则系统 Tab 切换器
        └── dynamic-form/                # 动态表单渲染组件
```

---

## 核心模块详解

### src/data/rules/ — 规则系统数据层

这是重构后的核心数据层，每个 TRPG 规则系统独立为一个文件夹，通用代码提取到 `common/`。

#### `data/rules/index.ts` — 统一入口

**导出内容：**
- `characterCards` — 所有预置角色卡（COC + DND + Daggerheart 合集）
- `formTemplates` — 所有预置表单模板
- `getTemplateBySystem(system)` — 根据规则代码获取模板
- 重新导出 `coc/`、`dnd/`、`daggerheart/`、`common/` 全部内容

**被谁引用：**
- [stores/cards.ts](file:///i:/unc/src/stores/cards.ts) — 导入 `characterCards`、`cocTemplate`、`dndTemplate`、`daggerheartTemplate`
- [data/cards.ts](file:///i:/unc/src/data/cards.ts) — 桥接导出 `characterCards`
- [data/templates/index.ts](file:///i:/unc/src/data/templates/index.ts) — 桥接导出 `formTemplates`、`getTemplateBySystem`

#### `common/labels.ts` — 标签映射

**导出函数：**

| 函数 | 用途 | 被调用者 |
|------|------|----------|
| `getDndClassLabel(v)` | 将 DND 职业枚举转为中文 | [preview-stats.ts](file:///i:/unc/src/data/rules/common/preview-stats.ts) |
| `getDaggerheartClassLabel(v)` | 将 Daggerheart 职业枚举转为中文 | [preview-stats.ts](file:///i:/unc/src/data/rules/common/preview-stats.ts) |
| `getDaggerheartAncestryLabel(v)` | 将 Daggerheart 血脉枚举转为中文 | [preview-stats.ts](file:///i:/unc/src/data/rules/common/preview-stats.ts) |

**导出常量：**
- `DND_CLASS_LABELS` — `{ fighter: '战士', wizard: '法师', ... }`
- `DAGGERHEART_CLASS_LABELS` — `{ warrior: '战士', ... }`
- `DAGGERHEART_ANCESTRY_LABELS` — `{ human: '人类', elf: '精灵', ... }`

#### `common/preview-stats.ts` — 预览统计

**核心函数：**

| 函数 | 用途 | 内部调用 |
|------|------|----------|
| `computePreviewStats(card)` | 根据角色卡数据计算预览统计项（最多 4 项） | 按 system 分派到 `getCocPreviewStats` / `getDndPreviewStats` / `getDaggerheartPreviewStats` / `getGenericPreviewStats` |
| `getDefaultPreviewStats(system)` | 获取默认（空）预览统计项 | — |

**被谁引用：**
- [CardDetail.vue](file:///i:/unc/src/pages/miniapp/CardDetail.vue) #L11 — `import { computePreviewStats } from '@/data/rules/common/preview-stats'`

**日志：** 使用 `loggerPreviewStats`（来自 [logger.ts](file:///i:/unc/src/utils/logger.ts)），在入口和每个分支记录 debug 日志。

#### `common/base-template.ts` — 表单模板基类

**导出常量和函数：**

| 导出 | 类型 | 用途 |
|------|------|------|
| `DEFAULT_FORM_OPTION` | 常量 | 通用表单选项 `{ labelPosition: 'top', submitBtn: false, resetBtn: false }` |
| `createFormTemplate(...)` | 函数 | 构建 FormTemplate 对象 |
| `createTitleField(title, desc)` | 函数 | 创建标题组件 |
| `createInputField(field, title, placeholder, required)` | 函数 | 创建文本输入 |
| `createInputNumberField(field, title, default, min, max)` | 函数 | 创建数字输入 |
| `createSliderField(field, title, default, min, max)` | 函数 | 创建滑块 |
| `createSelectField(field, title, options, placeholder)` | 函数 | 创建下拉选择 |
| `createTextareaField(field, title, placeholder, rows)` | 函数 | 创建多行文本 |
| `createGroupField(title, children)` | 函数 | 创建折叠分组 |
| `createRowField(children)` | 函数 | 创建栅格行 |
| `createColField(span, children)` | 函数 | 创建栅格列 |
| `createCheckboxField(field, title, options)` | 函数 | 创建复选框组 |

**被谁引用：**
- [coc/template.ts](file:///i:/unc/src/data/rules/coc/template.ts) — 使用全部辅助函数构建 COC 表单
- [dnd/template.ts](file:///i:/unc/src/data/rules/dnd/template.ts) — 使用全部辅助函数构建 DND 表单
- [daggerheart/template.ts](file:///i:/unc/src/data/rules/daggerheart/template.ts) — 使用全部辅助函数构建 Daggerheart 表单

#### `coc/` — 克苏鲁的呼唤

| 文件 | 导出 | 说明 |
|------|------|------|
| `template.ts` | `cocTemplate: FormTemplate` | COC 7e 调查员卡表单模板，含 8 属性 + HP/SAN + 技能 + 背景 |
| `cards.ts` | `cocCards: CharacterCard[]` | 2 张预置调查员卡（艾琳·哈丁、维克多·克莱因） |
| `index.ts` | re-export | 统一导出 `cocTemplate`、`cocCards` |

**模板构建方式：** 使用 `common/base-template.ts` 的辅助函数，避免手写重复的字段配置。

#### `dnd/` — 龙与地下城

| 文件 | 导出 | 说明 |
|------|------|------|
| `template.ts` | `dndTemplate: FormTemplate` | D&D 5e 冒险者卡，含 6 属性 + AC/HP + 豁免 + 技能 + 特性 |
| `cards.ts` | `dndCards: CharacterCard[]` | 2 张预置冒险者卡（索拉·晨星、达格·铁砧） |
| `index.ts` | re-export | 统一导出 |

#### `daggerheart/` — 匕首之心

| 文件 | 导出 | 说明 |
|------|------|------|
| `template.ts` | `daggerheartTemplate: FormTemplate` | Daggerheart 英雄卡，含 6 属性 + 耐力/压力系统 |
| `cards.ts` | `daggerheartCards: CharacterCard[]` | 2 张预置英雄卡（凯瑟·银刃、伊洛·叶影） |
| `index.ts` | re-export | 统一导出 |

---

### src/types/ — 类型定义

#### [types/card.ts](file:///i:/unc/src/types/card.ts)

| 类型 | 说明 | 关键字段 |
|------|------|----------|
| `RuleSystem` | 规则系统标识符（string 别名） | — |
| `SystemInfo` | 规则系统元信息 | `code, name, fullName, accentColor, logo, description, isCustom, rule[], option` |
| `FormRule` | 表单字段规则定义 | `type, field, title, value, children[], props, validate` |
| `FormTemplate` | 表单模板 | `id, system, name, description, rule[], option` |
| `CharacterCard` | 角色卡 | `id, system, name, player, avatar, description, formData, createdAt, updatedAt, favorite` |

**被谁引用：** 几乎所有 `.ts` 和 `.vue` 文件都通过 `import type { ... } from '@/types/card'` 引用。

#### [types/saved-form.ts](file:///i:/unc/src/types/saved-form.ts)

| 类型 | 说明 |
|------|------|
| `SavedFormItem` | 表单列表项（不含 rule 主体） |
| `SavedForm` | 完整表单（含 rule 主体） |
| `SaveFormPayload` | 保存表单时的请求体 |

**被谁引用：**
- [api/form.ts](file:///i:/unc/src/api/form.ts) — 所有 API 函数的返回值类型
- [stores/customForms.ts](file:///i:/unc/src/stores/customForms.ts) — 状态类型

---

### src/stores/ — 状态管理

#### [stores/cards.ts](file:///i:/unc/src/stores/cards.ts) — 角色卡 Store

**Pinia Store ID:** `cards`

**核心状态：**

| 状态 | 类型 | 说明 |
|------|------|------|
| `cards` | `CharacterCard[]` | 所有角色卡（预置 + 自定义） |
| `currentSystem` | `RuleSystem` | 当前选中规则系统 |
| `systems` | `SystemInfo[]` (computed) | 可见规则系统列表（排除隐藏） |
| `filteredCards` | `CharacterCard[]` (computed) | 按规则 + 关键词过滤后的卡片 |
| `favoriteCards` | `CharacterCard[]` (computed) | 收藏的卡片 |
| `stats` | 对象 (computed) | 统计数据 { total, favorites, perSystem } |

**核心方法：**

| 方法 | 日志 | 说明 |
|------|------|------|
| `setSystem(system)` | `loggerCards.info` | 切换规则系统 |
| `toggleFavorite(cardId)` | `loggerCards.info` | 切换收藏状态 |
| `addCard(system, name, desc)` | `loggerCards.info` | 创建新角色卡 |
| `deleteCard(cardId)` | `loggerCards.info` | 删除角色卡 |
| `updateCardFormData(cardId, data)` | `loggerCards.debug` | 更新表单数据 |
| `addCustomSystem(info)` | `loggerCards.info` | 添加自定义规则系统 |
| `deleteSystem(code)` | `loggerCards.info` | 删除/隐藏规则系统 |
| `getCardById(id)` | — | 按 ID 查找卡片 |
| `getSystemInfo(system)` | — | 按代码查找规则系统 |

**数据持久化：** 使用 `localStorage` 存储自定义规则和卡片，键名 `trpg-custom-systems`、`trpg-custom-cards`、`trpg-hidden-systems`。

**被谁引用：**
- [MiniAppHome.vue](file:///i:/unc/src/pages/miniapp/MiniAppHome.vue) — `useCardStore()` 获取所有卡片和系统
- [CardDetail.vue](file:///i:/unc/src/pages/miniapp/CardDetail.vue) — `useCardStore()` 获取单张卡片和表单数据
- [MiniAppProfile.vue](file:///i:/unc/src/pages/miniapp/MiniAppProfile.vue) — `useCardStore()` 获取统计数据
- [CustomCardDetail.vue](file:///i:/unc/src/pages/miniapp/CustomCardDetail.vue) — `useCardStore()` 获取规则系统信息
- [ImportFormList.vue](file:///i:/unc/src/pages/miniapp/ImportFormList.vue) — `useCardStore()` 导入自定义规则
- [RuleTab.vue](file:///i:/unc/src/components/RuleTab.vue) — 通过 props 接收 systems 和 current

#### [stores/customForms.ts](file:///i:/unc/src/stores/customForms.ts) — 自定义表单 Store

**Pinia Store ID:** `customForms`

| 状态 | 说明 |
|------|------|
| `forms` | 服务器上的表单列表 `SavedFormItem[]` |
| `loading` | 加载状态 |
| `error` | 错误信息 |
| `cachedForms` | 已下载的完整表单缓存 |

**方法：**

| 方法 | 日志 | 说明 |
|------|------|------|
| `fetchList()` | `loggerCustomForms.info` | 从服务器拉取表单列表 |
| `downloadForm(id)` | `loggerCustomForms.info` | 下载单个表单完整 JSON |
| `clearCache()` | `loggerCustomForms.info` | 清空缓存 |

**被谁引用：**
- [ImportFormList.vue](file:///i:/unc/src/pages/miniapp/ImportFormList.vue) — 获取和导入服务器表单

---

### src/api/ — API 通信层

#### [api/form.ts](file:///i:/unc/src/api/form.ts)

**基础请求函数：** `request<T>(url, init?)` — 封装 fetch，统一处理响应格式 `{ code, message, data }`。

**API 函数：**

| 函数 | 方法 | 路径 | 日志 | 返回值 | 后端对应 |
|------|------|------|------|--------|----------|
| `checkHealth()` | GET | `/api/health` | `loggerApi.debug` | `{ ok, service, time }` | [server: GET /api/health](#服务器-api) |
| `listForms()` | GET | `/api/forms` | `loggerApi.info` | `SavedFormItem[]` | [server: GET /api/forms](#服务器-api) |
| `getForm(id)` | GET | `/api/forms/:id` | `loggerApi.info` | `SavedForm` | [server: GET /api/forms/:id](#服务器-api) |
| `saveForm(payload)` | POST | `/api/forms` | `loggerApi.info` | `SavedForm` | [server: POST /api/forms](#服务器-api) |
| `deleteForm(id)` | DELETE | `/api/forms/:id` | `loggerApi.info` | `{ code }` | [server: DELETE /api/forms/:id](#服务器-api) |

**代理配置：** [vite.config.ts](file:///i:/unc/vite.config.ts) 将 `/api` 请求代理到 `http://localhost:3001`。

**被谁引用：**
- [stores/customForms.ts](file:///i:/unc/src/stores/customForms.ts) — `listForms()`、`getForm()`
- [DesignerPage.vue](file:///i:/unc/src/pages/DesignerPage.vue) — `saveForm()`、`listForms()`、`getForm()`
- [CustomCardDetail.vue](file:///i:/unc/src/pages/miniapp/CustomCardDetail.vue) — `getForm()`

---

### src/utils/ — 工具库

#### [utils/logger.ts](file:///i:/unc/src/utils/logger.ts) — 统一日志工具

**核心函数：**

| 函数 | 用途 |
|------|------|
| `createLogger(namespace)` | 创建带命名空间的 Logger 实例 |

**返回的 Logger 接口：**
```ts
interface Logger {
  debug(msg: string, ...data: unknown[]): void
  info(msg: string, ...data: unknown[]): void
  warn(msg: string, ...data: unknown[]): void
  error(msg: string, ...data: unknown[]): void
}
```

**预设 Logger 实例：**

| 实例 | 命名空间 | 使用者 |
|------|----------|--------|
| `loggerCards` | `Store:cards` | [stores/cards.ts](file:///i:/unc/src/stores/cards.ts) |
| `loggerCustomForms` | `Store:customForms` | [stores/customForms.ts](file:///i:/unc/src/stores/customForms.ts) |
| `loggerApi` | `API:form` | [api/form.ts](file:///i:/unc/src/api/form.ts) |
| `loggerPreviewStats` | `PreviewStats` | [preview-stats.ts](file:///i:/unc/src/data/rules/common/preview-stats.ts) |
| `loggerPage(name)` | `Page:{name}` | [CardDetail.vue](file:///i:/unc/src/pages/miniapp/CardDetail.vue)、[MiniAppHome.vue](file:///i:/unc/src/pages/miniapp/MiniAppHome.vue) |
| `loggerComp(name)` | `Comp:{name}` | [CardItem.vue](file:///i:/unc/src/components/CardItem.vue) |

**日志级别：** `debug < info < warn < error`，默认 `info`。可通过 `localStorage.setItem('trpg-log-level', 'debug')` 动态切换。

**输出格式：** `[Store:cards] setSystem { from: 'COC', to: 'DND' }`

---

### src/router/ — 路由配置

#### [router/index.ts](file:///i:/unc/src/router/index.ts)

**路由表：**

| 路径 | 组件 | 名称 | 说明 |
|------|------|------|------|
| `/` | — | — | 重定向到 `/designer` |
| `/designer` | `DesignerPage` | `designer` | 表单设计器 |
| `/miniapp/home` | `MiniAppHome` | `miniapp-home` | 小程序首页（卡片列表） |
| `/miniapp/profile` | `MiniAppProfile` | `miniapp-profile` | 个人中心 |
| `/miniapp/card/:id` | `CardDetail` | `miniapp-card` | 角色卡详情 |
| ~~`/miniapp/import`~~ | ~~`ImportFormList`~~ | ~~`miniapp-import`~~ | **已隐藏**（TODO: 暂时隐藏新增规则功能） |
| ~~`/miniapp/custom/:formId`~~ | ~~`CustomCardDetail`~~ | ~~`miniapp-custom-card`~~ | **已隐藏** |

**路由守卫：** 无全局守卫，页面级由各组件自行处理。

---

### src/pages/ — 页面组件

#### [DesignerPage.vue](file:///i:/unc/src/pages/DesignerPage.vue) — 表单设计器

**功能模块：**

| 模块 | 触发函数 | 说明 |
|------|----------|------|
| 清空画布 | `clearDesigner()` | 调用 `designerRef.value.clearDragRule()` |
| 导入 JSON | `triggerImportJson()` → `onImportJson(e)` | 支持多种 JSON 格式解析 |
| 预览 JSON | `previewJson()` | 展示 Rule Schema + Option 双栏 |
| 导出 JSON 文件 | `exportCard()` | 通过 POST `/api/download/json` 下载 |
| 保存到服务器 | `openSaveDialog()` → `doSaveToServer()` | 调用 `saveForm()` API |
| 已保存列表 | `openSavedList()` → `loadSavedForm(item)` | 加载服务器表单到设计器 |
| 小程序预览 | `goMiniApp()` | 保存后跳转至 `/miniapp/custom/:formId` |

**依赖：**
- `@form-create/designer` — `<fc-designer ref="designerRef">` 组件
- [api/form.ts](file:///i:/unc/src/api/form.ts) — `saveForm()`、`listForms()`、`getForm()`

#### [MiniAppShell.vue](file:///i:/unc/src/pages/miniapp/MiniAppShell.vue) — 小程序外壳

**功能：** 提供手机模拟外框 + 底部 Tab Bar（卡面 / 我的），通过 `<router-view>` 渲染子页面。

#### [MiniAppHome.vue](file:///i:/unc/src/pages/miniapp/MiniAppHome.vue) — 小程序首页

**核心功能：**

| 功能 | 触发函数 | 日志 |
|------|----------|------|
| 切换规则系统 | `changeSystem(sys)` → `store.setSystem(sys)` | `logger.info('changeSystem', ...)` |
| 搜索角色卡 | `onSearch()` → `store.setSearch(keyword)` | — |
| 打开角色卡 | `openCard(card)` → `router.push(...)` | `logger.info('openCard', ...)` |
| 收藏切换 | `toggleFav(card)` → `store.toggleFavorite(...)` | `logger.info('toggleFav', ...)` |
| 新建角色卡 | `openAddDialog()` → `doAddCard()` → `store.addCard(...)` | `logger.info('doAddCard', ...)` |
| 长按删除 | `onLongPress(card)` → `confirmDelete()` → `store.deleteCard(...)` | `logger.info('confirmDelete', ...)` |
| 长按规则系统 | `onPressSystem(system)` → 弹出操作菜单 | `logger.info('onPressSystem', ...)` |
| 导出规则系统 | `exportCurrentSystem()` → POST `/api/download/json` | `logger.info('exportCurrentSystem', ...)` |
| 删除/隐藏规则 | `confirmDeleteSystem()` → `store.deleteSystem(...)` | `logger.info('confirmDeleteSystem', ...)` |

**依赖：**
- [stores/cards.ts](file:///i:/unc/src/stores/cards.ts) — `useCardStore()`
- [RuleTab.vue](file:///i:/unc/src/components/RuleTab.vue) — 规则系统 Tab 切换器
- [CardItem.vue](file:///i:/unc/src/components/CardItem.vue) — 角色卡片展示

#### [CardDetail.vue](file:///i:/unc/src/pages/miniapp/CardDetail.vue) — 角色卡详情

**核心功能：**

| 功能 | 实现 | 日志 |
|------|------|------|
| 加载角色卡 | `watch(card, ...)` → 同步 `formData` | `logger.info('card加载', ...)` |
| 表单渲染 | `<FormCreate v-model="formData" :rule="formRule" :option="formOption">` | — |
| 预览统计 | `computePreviewStats(card)`（来自 [preview-stats.ts](file:///i:/unc/src/data/rules/common/preview-stats.ts)） | `logger.debug('previewStats computed', ...)` |
| 表单数据变更 | `watch(formData, ...)` → `store.updateCardFormData(...)` | `logger.info('onFormChange', ...)` |
| 收藏切换 | `toggleFav()` → `store.toggleFavorite(...)` | `logger.info('toggleFav', ...)` |

**依赖：**
- [stores/cards.ts](file:///i:/unc/src/stores/cards.ts) — `useCardStore()` 获取卡片和表单数据
- [preview-stats.ts](file:///i:/unc/src/data/rules/common/preview-stats.ts) — `computePreviewStats()` 计算预览统计
- `form-create` — `<FormCreate>` 组件渲染表单

#### [MiniAppProfile.vue](file:///i:/unc/src/pages/miniapp/MiniAppProfile.vue) — 个人中心

**功能：** 展示用户信息、统计数据、按规则系统分组的角色卡列表。

**依赖：** [stores/cards.ts](file:///i:/unc/src/stores/cards.ts) — `useCardStore()` 的 `myCards`、`stats`、`systems`。

---

### src/components/ — 通用组件

#### [CardItem.vue](file:///i:/unc/src/components/CardItem.vue) — 角色卡片

**Props:** `{ card: CharacterCard, system: SystemInfo }`

**Emits:** `click`、`toggleFav`、`longPress`

| 交互 | 实现 | 日志 |
|------|------|------|
| 点击 | `onClickCard()` → emit `click` | `logger.info('onClickCard', ...)` |
| 收藏 | `onToggleFav()` → emit `toggleFav` | `logger.info('toggleFav', ...)` |
| 长按 | `onTouchStart()` → 500ms 定时器 → emit `longPress` | `logger.debug('onTouchStart', ...)` |

**预览字段：** `firstFields` 计算属性取 formData 前 3 个非空简单值，展示在卡片底部。

#### [RuleTab.vue](file:///i:/unc/src/components/RuleTab.vue) — 规则系统 Tab 切换器

**Props:** `{ systems: SystemInfo[], current: RuleSystem }`

**Emits:** `change`、`add`、`pressSystem`

| 交互 | 实现 |
|------|------|
| 切换规则 | 点击 → emit `change` |
| 长按规则 | 500ms 长按 → emit `pressSystem` |
| 拖拽滚动 | mousedown/move/up 实现横向拖拽 |
| 新增按钮 | **已隐藏**（HTML 注释） |

---

### src/data/ — 静态数据

#### [data/cards.ts](file:///i:/unc/src/data/cards.ts) — 角色卡数据桥接

**内容：** 仅一行 re-export：`export { characterCards } from '@/data/rules'`

**用途：** 保持旧引用路径兼容。

#### [data/systems.json](file:///i:/unc/src/data/systems.json) — 规则系统元信息

**内容：** 3 套规则的基本信息（code、name、accentColor、logo、description），不含表单模板 rule。

**被谁引用：** [stores/cards.ts](file:///i:/unc/src/stores/cards.ts) — `buildPresetSystems()` 从 systems.json 读取基础信息，注入各模板的 rule 和 option。

#### [data/templates/index.ts](file:///i:/unc/src/data/templates/index.ts) — 模板桥接

**内容：** 一行 re-export：`export { formTemplates, getTemplateBySystem } from '@/data/rules'`

---

### server/ — Express 后端

#### [server/index.js](file:///i:/unc/server/index.js) — API 服务

**端口：** 3001（可通过 `PORT` 环境变量覆盖）

**存储：** JSON 文件，目录 `server/data/saved-forms/`

**API 路由：**

| 方法 | 路径 | 说明 | 前端调用 |
|------|------|------|----------|
| GET | `/api/health` | 健康检查 | [api/form.ts](file:///i:/unc/src/api/form.ts) `checkHealth()` |
| GET | `/api/forms` | 获取表单列表（不含 rule） | [api/form.ts](file:///i:/unc/src/api/form.ts) `listForms()` |
| GET | `/api/forms/:id` | 获取完整表单（含 rule） | [api/form.ts](file:///i:/unc/src/api/form.ts) `getForm()` |
| POST | `/api/forms` | 保存表单（新建或更新） | [api/form.ts](file:///i:/unc/src/api/form.ts) `saveForm()` |
| DELETE | `/api/forms/:id` | 删除表单 | [api/form.ts](file:///i:/unc/src/api/form.ts) `deleteForm()` |
| POST | `/api/download/json` | 通用 JSON 文件下载 | [DesignerPage.vue](file:///i:/unc/src/pages/DesignerPage.vue) `exportCard()`、[MiniAppHome.vue](file:///i:/unc/src/pages/miniapp/MiniAppHome.vue) `exportCurrentSystem()` |

---

### miniprogram/ — 微信小程序端

#### [app.js](file:///i:/unc/miniprogram/app.js) — 小程序入口

**功能：** `onLaunch()` 中调用 `store.init()` 初始化状态。

#### [app.json](file:///i:/unc/miniprogram/app.json) — 页面配置

**页面列表：** `home → profile → card-detail → import-list → custom-form → json-io`

**TabBar：** 卡面（home）/ 我的（profile），金色主题 `#C8A046`。

#### [utils/store.js](file:///i:/unc/miniprogram/utils/store.js) — 小程序版状态管理

**与 Vue 版 `stores/cards.ts` 功能对应，区别：**

| 差异 | Vue 版 | 小程序版 |
|------|--------|----------|
| 存储 | `localStorage` | `wx.setStorageSync` / `wx.getStorageSync` |
| 响应式 | Pinia ref/computed | 普通对象 + 手动 getter/setter |
| 额外方法 | — | `importSystemFromData(data)` — 从 JSON 导入规则系统 |

**核心函数：** `init, getSystems, setSystem, getFilteredCards, toggleFavorite, getCardById, addCard, deleteCard, updateCardFormData, addCustomSystem, deleteSystem, importSystemFromData`

#### [utils/api.js](file:///i:/unc/miniprogram/utils/api.js) — 小程序 API 封装

**与 Vue 版 `api/form.ts` 功能对应，区别：**

| 差异 | Vue 版 | 小程序版 |
|------|--------|----------|
| 请求方式 | `fetch()` | `wx.request()` |
| 基础 URL | 通过 Vite 代理 `/api` | 硬编码 `http://localhost:3001/api` |

**导出函数：** `listForms, getForm, saveForm, deleteForm, checkHealth`

#### 小程序组件

| 组件 | 路径 | 对应 Vue 版 |
|------|------|-------------|
| `card-item` | [components/card-item/](file:///i:/unc/miniprogram/components/card-item/card-item.js) | [CardItem.vue](file:///i:/unc/src/components/CardItem.vue) |
| `rule-tab` | [components/rule-tab/](file:///i:/unc/miniprogram/components/rule-tab/rule-tab.js) | [RuleTab.vue](file:///i:/unc/src/components/RuleTab.vue) |
| `dynamic-form` | [components/dynamic-form/](file:///i:/unc/miniprogram/components/dynamic-form/dynamic-form.js) | `<FormCreate>` 组件 |

---

## 数据流图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          数据流架构                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐     ┌──────────────────┐     ┌─────────────────┐  │
│  │  data/rules/     │     │  data/systems.json│     │  server/        │  │
│  │  - coc/template  │     │  (规则元信息)      │     │  data/          │  │
│  │  - dnd/template  │────▶│                    │     │  saved-forms/   │  │
│  │  - dh/template   │     └────────┬───────────┘     │  *.json         │  │
│  │  - coc/cards     │              │                  └────────┬────────┘  │
│  │  - dnd/cards     │              │                           │          │
│  │  - dh/cards      │              │                           │          │
│  └────────┬─────────┘              │                           │          │
│           │                        │                           │          │
│           ▼                        ▼                           ▼          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    stores/cards.ts (Pinia)                       │    │
│  │  buildPresetSystems() → 合并 systems.json + 各模板 rule/option   │    │
│  │  cards = [预置角色卡] + [自定义角色卡]                            │    │
│  │  systems = [预置系统] + [自定义系统] - [隐藏系统]                  │    │
│  └──────────────┬──────────────────────────────────────────────────┘    │
│                 │                                                       │
│     ┌───────────┼───────────┬──────────────┐                           │
│     ▼           ▼           ▼              ▼                           │
│  ┌────────┐ ┌────────┐ ┌────────┐  ┌──────────────┐                   │
│  │ Home   │ │Profile │ │Card    │  │DesignerPage  │                   │
│  │ Page   │ │Page    │ │Detail  │  │(form-create) │                   │
│  │        │ │        │ │Page    │  │              │                   │
│  └────────┘ └────────┘ └────┬───┘  └──────┬───────┘                   │
│                             │              │                           │
│                             ▼              ▼                           │
│                    ┌────────────────────────────────┐                   │
│                    │  common/preview-stats.ts       │                   │
│                    │  computePreviewStats(card)     │                   │
│                    │  → 调用 common/labels.ts       │                   │
│                    └────────────────────────────────┘                   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  api/form.ts ←→ Vite Proxy (/api) ←→ server/index.js (3001)     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 调用关系矩阵

### 数据层 → 状态层

| 数据源 | 导入方式 | 目标 |
|--------|----------|------|
| `data/rules` → `characterCards` | `import { characterCards } from '@/data/rules'` | [stores/cards.ts](file:///i:/unc/src/stores/cards.ts) |
| `data/rules` → `cocTemplate` | `import { cocTemplate } from '@/data/rules'` | [stores/cards.ts](file:///i:/unc/src/stores/cards.ts) |
| `data/rules` → `dndTemplate` | `import { dndTemplate } from '@/data/rules'` | [stores/cards.ts](file:///i:/unc/src/stores/cards.ts) |
| `data/rules` → `daggerheartTemplate` | `import { daggerheartTemplate } from '@/data/rules'` | [stores/cards.ts](file:///i:/unc/src/stores/cards.ts) |
| `data/systems.json` | `import systemsData from '@/data/systems.json'` | [stores/cards.ts](file:///i:/unc/src/stores/cards.ts) |

### 状态层 → 页面层

| Store | 页面/组件 | 使用的属性/方法 |
|-------|-----------|----------------|
| `useCardStore()` | [CardDetail.vue](file:///i:/unc/src/pages/miniapp/CardDetail.vue) | `getCardById`, `getSystemInfo`, `toggleFavorite`, `updateCardFormData` |
| `useCardStore()` | [MiniAppHome.vue](file:///i:/unc/src/pages/miniapp/MiniAppHome.vue) | `systems`, `currentSystem`, `filteredCards`, `setSystem`, `setSearch`, `toggleFavorite`, `addCard`, `deleteCard`, `deleteSystem` |
| `useCardStore()` | [MiniAppProfile.vue](file:///i:/unc/src/pages/miniapp/MiniAppProfile.vue) | `myCards`, `stats`, `systems`, `userName`, `userAvatar` |
| `useCardStore()` | [ImportFormList.vue](file:///i:/unc/src/pages/miniapp/ImportFormList.vue) | `addCustomSystem`, `setSystem`, `getSystemInfo` |
| `useCardStore()` | [CustomCardDetail.vue](file:///i:/unc/src/pages/miniapp/CustomCardDetail.vue) | `getSystemInfo` |
| `useCustomFormStore()` | [ImportFormList.vue](file:///i:/unc/src/pages/miniapp/ImportFormList.vue) | `forms`, `loading`, `error`, `fetchList`, `downloadForm` |

### 通用工具 → 页面/组件

| 工具 | 使用者 |
|------|--------|
| [common/preview-stats.ts](file:///i:/unc/src/data/rules/common/preview-stats.ts) `computePreviewStats` | [CardDetail.vue](file:///i:/unc/src/pages/miniapp/CardDetail.vue) |
| [common/labels.ts](file:///i:/unc/src/data/rules/common/labels.ts) 标签函数 | [common/preview-stats.ts](file:///i:/unc/src/data/rules/common/preview-stats.ts)（间接） |
| [common/base-template.ts](file:///i:/unc/src/data/rules/common/base-template.ts) 辅助函数 | [coc/template.ts](file:///i:/unc/src/data/rules/coc/template.ts)、[dnd/template.ts](file:///i:/unc/src/data/rules/dnd/template.ts)、[daggerheart/template.ts](file:///i:/unc/src/data/rules/daggerheart/template.ts) |
| [utils/logger.ts](file:///i:/unc/src/utils/logger.ts) `createLogger` / 预设实例 | 所有核心模块（stores, api, pages, components, rules） |

### API 层 → 后端

| 前端函数 | 后端路由 | 数据流 |
|----------|----------|--------|
| `checkHealth()` | `GET /api/health` | 前端 → Vite Proxy → server:3001 |
| `listForms()` | `GET /api/forms` | 前端 → Vite Proxy → server:3001 → 读 `saved-forms/*.json` |
| `getForm(id)` | `GET /api/forms/:id` | 前端 → Vite Proxy → server:3001 → 读 `saved-forms/{id}.json` |
| `saveForm(payload)` | `POST /api/forms` | 前端 → Vite Proxy → server:3001 → 写 `saved-forms/{id}.json` |
| `deleteForm(id)` | `DELETE /api/forms/:id` | 前端 → Vite Proxy → server:3001 → 删 `saved-forms/{id}.json` |
| 下载 JSON | `POST /api/download/json` | 前端 → Vite Proxy → server:3001 → 返回文件下载响应 |

---

## 已隐藏功能（TODO）

以下功能入口已被注释隐藏，取消注释即可恢复：

| 隐藏内容 | 位置 | 恢复方式 |
|----------|------|----------|
| 新增规则按钮（Vue 端） | [RuleTab.vue](file:///i:/unc/src/components/RuleTab.vue)#L147-L157 | 取消 HTML 注释 |
| 新增规则按钮（小程序端） | [rule-tab.wxml](file:///i:/unc/miniprogram/components/rule-tab/rule-tab.wxml)#L16-L19 | 取消 WXML 注释 |
| 导入路由 `/miniapp/import` | [router/index.ts](file:///i:/unc/src/router/index.ts)#L52-L57 | 取消注释 |
| 自定义表单路由 `/miniapp/custom/:formId` | [router/index.ts](file:///i:/unc/src/router/index.ts)#L58-L63 | 取消注释 |
| 导入页面跳转 | [MiniAppHome.vue](file:///i:/unc/src/pages/miniapp/MiniAppHome.vue) `goImport()` | 取消注释 |
| 服务器表单菜单项 | [MiniAppProfile.vue](file:///i:/unc/src/pages/miniapp/MiniAppProfile.vue)#L90-L100 | 取消 HTML 注释 |