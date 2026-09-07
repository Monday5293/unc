# 搜索机制分析报告

## 搜索入口
- **位置**: `home` 页面顶部搜索框 (`home.wxml` L12-24)
- **输入**: 提示文字"搜索角色名 / 职业 / 关键词..."

## 搜索流程

```
用户输入 → onSearchInput(e) → store.setSearch(value) → refreshData() → getFilteredCards() → 渲染
```

## 核心匹配逻辑（`store.js` `getFilteredCards`）

### 两级过滤
1. **系统过滤**: 只搜索当前选中的规则系统（`c.system === currentSystem`）下的卡片
2. **关键词匹配**: 当关键词非空时，对以下 3 个维度做 **OR 匹配**（命中任一即匹配）：

### 搜索的数据字段

| 维度 | 字段 | 匹配方式 |
|------|------|----------|
| **角色名** | `card.name` | `.toLowerCase().includes(keyword)` |
| **角色描述** | `card.description` | `.toLowerCase().includes(keyword)` |
| **所有表单数据** | `card.formData` 的全部值 | `Object.values().join(' ').toLowerCase().includes(keyword)` |

### formData 覆盖的范围
DAGGERHEART 系统下，`formData` 包含 `name`, `player`, `age`, `gender`, `class`, `subclass`, `ancestry`, `ancestry2`, `community`, `level`, `birthplace`, `dh_agility` ~ `dh_knowledge`, `dh_evasion`, `dh_proficiency`, `dh_armor`, `dh_armor_max`, `dh_hp`, `dh_hp_max`, `dh_stress`, `dh_stress_max`, `dh_hope`, `dh_hope_max`, `dh_mark1_hp` ~ `dh_mark3_hp`, `dh_experiences`（数组序列化）, `dh_weapons`（数组序列化）, `dh_armors`（数组序列化）, `dh_inventory`, `dh_backstory_intro`, `dh_backstory_traits`, `dh_backstory_bio`, `dh_backstory_milestones`, `dh_adventure_log`, `dh_adventure_note`, `dh_class_features`（数组序列化）, `dh_race_features`（数组序列化）, `dh_domain_cards`（数组序列化）, `dh_treasury_cards`（数组序列化）等。

### 其他特性
- **不区分大小写**: 关键词和所有字段均调用 `.toLowerCase()`
- **不支持拼音**: 没有拼音转换层
- **部分匹配**: 使用 `includes()`，子串即可命中
- **无搜索历史/联想**: 仅实时过滤，无缓存
- **切换系统自动清空**: `onSystemChange` 会清空搜索词
