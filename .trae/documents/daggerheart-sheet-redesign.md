# 匕首之心角色卡详情页重构计划

## 概述
删除现有 Daggerheart 属性模块和耐力·压力模块，新增 8 个全新模块：属性(3x3)、当前情况(阈值+闪避等)、经历、武器与护甲、库存、背景故事、特性、领域卡。

## 当前状态分析
- 现有 DH 模块位于 `card-detail.wxml` L1035-L1135：基本信息(已改) + 六项属性 + 耐力与压力 + 经验标记 + 英雄过往
- `buildSheetData` 中 DH 分支返回 `dhAttributes`(6项)、`dhStaminaPct`、`dhStressPct`
- 现有 CSS: `.dh-attr-grid`, `.dh-attr-cell`, `.dh-attr-top`, `.dh-attr-label`, `.dh-attr-abbr`, `.dh-attr-val`
- 可复用模式：DND 特性模块(职业/种族/专长)、DND 武器模块、DND 装备模块

---

## 修改计划

### 文件 1: `card-detail.js` — 数据字段

在 `data` 对象中新增以下 DH 相关字段（约 L190 附近）：

```js
// Daggerheart 属性
dhAttributes: [],
dhAttrFilled: {},        // 四角星填满状态 { agility: true, ... }
editingDhAttrs: false,

// Daggerheart 当前情况
dhMark1HP: 0,            // 轻伤阈值
dhMark2HP: 0,            // 重伤阈值
dhMark3HP: 0,            // 严重阈值
dhEvasion: 0,            // 闪避值
dhProficiency: 0,        // 熟练值
dhArmor: 0,              // 护甲值
dhArmorMax: 0,           // 护甲上限
dhHP: 0,                 // 生命
dhHPMax: 0,              // 生命上限
dhStress: 0,             // 压力
dhStressMax: 0,          // 压力上限
dhHope: 0,               // 希望
dhHopeMax: 0,            // 希望上限
editingDhStatus: false,

// Daggerheart 经历
dhExperiences: [],
editingDhExperiences: false,
dhExperiencesSnapshot: [],

// Daggerheart 武器
dhWeapons: [],
editingDhWeapons: false,
dhWeaponsSnapshot: [],
dhWeaponDialogVisible: false,
dhWeaponDialogEditing: false,
dhWeaponDialogKey: '',
dhWeaponDialogName: '',
dhWeaponDialogInfo: '',
dhWeaponDialogDice: '',
dhWeaponDialogHand: '主手',
dhWeaponDialogProperties: '',

// Daggerheart 护甲
dhArmors: [],
editingDhArmors: false,
dhArmorsSnapshot: [],
dhArmorDialogVisible: false,
dhArmorDialogEditing: false,
dhArmorDialogKey: '',
dhArmorDialogName: '',
dhArmorDialogValue: 0,
dhArmorDialogThreshold: 0,
dhArmorDialogThresholdMax: 0,
dhArmorDialogProperties: '',

// Daggerheart 库存
dhInventory: '',
editingDhInventory: false,

// Daggerheart 背景故事
dhBackstoryIntro: '',
dhBackstoryTraits: '',
dhAdventureNotes: [],    // [{ key, text }]
editingDhBackstory: false,
dhBackstoryDialogVisible: false,
dhBackstoryDialogType: '', // 'intro' | 'traits' | 'note'
dhBackstoryDialogContent: '',

// Daggerheart 特性
dhClassFeatures: [],
dhRaceFeatures: [],
editingDhClassFeatures: false,
dhClassFeaturesSnapshot: [],
editingDhRaceFeatures: false,
dhRaceFeaturesSnapshot: [],
dhFeatureDialogVisible: false,
dhFeatureDialogEditing: false,
dhFeatureDialogKey: '',
dhFeatureDialogType: '', // 'class' | 'race'
dhFeatureDialogName: '',
dhFeatureDialogDesc: '',

// Daggerheart 领域卡
dhDomainCards: [],
editingDhDomainCards: false,
dhDomainCardsSnapshot: [],
dhDomainDialogVisible: false,
dhDomainDialogEditing: false,
dhDomainDialogKey: '',
dhDomainDialogDomain: '',
dhDomainDialogAbility: '',
dhDomainDialogRC: 0,
dhDomainDialogDesc: '',
```

---

### 文件 2: `card-detail.js` — buildSheetData 方法

修改 `buildSheetData` 中 `DAGGERHEART` 分支（L575-L600），替换为：

```js
if (system === 'DAGGERHEART') {
  // 属性 3x3（6项）
  const attrDefs = [
    { key: 'agility', label: '敏捷', abbr: 'AGI', subs: ['冲刺', '跳跃', '机动'] },
    { key: 'strength', label: '力量', abbr: 'STR', subs: ['举起', '猛击', '擒抱'] },
    { key: 'finesse', label: '灵巧', abbr: 'FIN', subs: ['控制', '隐藏', '巧手'] },
    { key: 'instinct', label: '本能', abbr: 'INS', subs: ['感知', '察觉', '导航'] },
    { key: 'presence', label: '风度', abbr: 'PRE', subs: ['魅力', '表演', '欺骗'] },
    { key: 'knowledge', label: '知识', abbr: 'KNO', subs: ['回忆', '分析', '理解'] },
  ]
  const attrs = attrDefs.map(a => ({
    ...a,
    value: fd['dh_' + a.key] ?? 0,
    fmt: (fd['dh_' + a.key] ?? 0) >= 0 ? '+' + (fd['dh_' + a.key] ?? 0) : String(fd['dh_' + a.key] ?? 0),
    color: this.dhAttrColor(fd['dh_' + a.key] ?? 0),
  }))

  // 四角星填满状态
  const attrFilled = fd.dh_attr_filled || {}
  const dhAttrFilled = {}
  attrDefs.forEach(a => { dhAttrFilled[a.key] = !!attrFilled[a.key] })

  // 阈值
  const dhMark1HP = fd.dh_mark1_hp ?? 0
  const dhMark2HP = fd.dh_mark2_hp ?? 0
  const dhMark3HP = fd.dh_mark3_hp ?? 0

  // 闪避/熟练/护甲/生命/压力/希望
  const dhEvasion = fd.dh_evasion ?? 0
  const dhProficiency = fd.dh_proficiency ?? 0
  const dhArmor = fd.dh_armor ?? 0
  const dhArmorMax = fd.dh_armor_max ?? 0
  const dhHP = fd.dh_hp ?? 0
  const dhHPMax = fd.dh_hp_max ?? 0
  const dhStress = fd.dh_stress ?? 0
  const dhStressMax = fd.dh_stress_max ?? 0
  const dhHope = fd.dh_hope ?? 0
  const dhHopeMax = fd.dh_hope_max ?? 0

  return {
    dhAttributes: attrs,
    dhAttrFilled,
    dhMark1HP, dhMark2HP, dhMark3HP,
    dhEvasion, dhProficiency,
    dhArmor, dhArmorMax, dhHP, dhHPMax,
    dhStress, dhStressMax, dhHope, dhHopeMax,
  }
}
```

同时在 `loadCard` 中新增 build 函数调用：
```js
dhExperiences: this.buildDhExperiences(card),
dhWeapons: this.buildDhWeapons(card),
dhArmors: this.buildDhArmors(card),
dhInventory: (card.formData && card.formData.dh_inventory) || '',
dhBackstoryIntro: (card.formData && card.formData.dh_backstory_intro) || '',
dhBackstoryTraits: (card.formData && card.formData.dh_backstory_traits) || '',
dhAdventureNotes: this.buildDhAdventureNotes(card),
dhClassFeatures: this.buildDhClassFeatures(card),
dhRaceFeatures: this.buildDhRaceFeatures(card),
dhDomainCards: this.buildDhDomainCards(card),
```

---

### 文件 3: `card-detail.js` — 新增 Build 方法

```js
// === Daggerheart Build 工具 ===
buildDhExperiences(card) {
  const fd = card.formData || {}
  const exps = fd.dh_experiences
  if (exps && Array.isArray(exps) && exps.length > 0) {
    return exps.map((e, i) => ({ key: e.key || 'dhexp_' + i, label: e.label || '', value: e.value ?? 0 }))
  }
  return [
    { key: 'dhexp_0', label: '', value: 0 },
    { key: 'dhexp_1', label: '', value: 0 },
    { key: 'dhexp_2', label: '', value: 0 },
    { key: 'dhexp_3', label: '', value: 0 },
    { key: 'dhexp_4', label: '', value: 0 },
  ]
},

buildDhWeapons(card) {
  const fd = card.formData || {}
  const weapons = fd.dh_weapons
  if (weapons && Array.isArray(weapons) && weapons.length > 0) {
    return weapons.map((w, i) => ({
      key: w.key || 'dhwpn_' + i,
      name: w.name || '',
      info: w.info || '',
      dice: w.dice || '',
      hand: w.hand || '主手',
      properties: w.properties || '',
    }))
  }
  return [
    { key: 'dhwpn_0', name: '', info: '', dice: '', hand: '主手', properties: '' },
    { key: 'dhwpn_1', name: '', info: '', dice: '', hand: '主手', properties: '' },
  ]
},

buildDhArmors(card) {
  const fd = card.formData || {}
  const armors = fd.dh_armors
  if (armors && Array.isArray(armors) && armors.length > 0) {
    return armors.map((a, i) => ({
      key: a.key || 'dharm_' + i,
      name: a.name || '',
      value: a.value ?? 0,
      threshold: a.threshold ?? 0,
      thresholdMax: a.thresholdMax ?? 0,
      properties: a.properties || '',
    }))
  }
  return [
    { key: 'dharm_0', name: '', value: 0, threshold: 0, thresholdMax: 0, properties: '' },
    { key: 'dharm_1', name: '', value: 0, threshold: 0, thresholdMax: 0, properties: '' },
  ]
},

buildDhAdventureNotes(card) {
  const fd = card.formData || {}
  const notes = fd.dh_adventure_notes
  if (notes && Array.isArray(notes) && notes.length > 0) {
    return notes.map((n, i) => ({ key: n.key || 'dhnote_' + i, text: n.text || '' }))
  }
  return [{ key: 'dhnote_0', text: '' }]
},

buildDhClassFeatures(card) {
  const fd = card.formData || {}
  const features = fd.dh_class_features
  if (features && Array.isArray(features) && features.length > 0) {
    return features.map((f, i) => ({ key: f.key || 'dhcf_' + i, name: f.name || '', description: f.description || '' }))
  }
  return [
    { key: 'dhcf_0', name: '', description: '' },
    { key: 'dhcf_1', name: '', description: '' },
  ]
},

buildDhRaceFeatures(card) {
  const fd = card.formData || {}
  const features = fd.dh_race_features
  if (features && Array.isArray(features) && features.length > 0) {
    return features.map((f, i) => ({ key: f.key || 'dhrf_' + i, name: f.name || '', description: f.description || '' }))
  }
  return [
    { key: 'dhrf_0', name: '', description: '' },
    { key: 'dhrf_1', name: '', description: '' },
  ]
},

buildDhDomainCards(card) {
  const fd = card.formData || {}
  const cards = fd.dh_domain_cards
  if (cards && Array.isArray(cards) && cards.length > 0) {
    return cards.map((c, i) => ({
      key: c.key || 'dhdc_' + i,
      domain: c.domain || '',
      ability: c.ability || '',
      rc: c.rc ?? 0,
      description: c.description || '',
    }))
  }
  return [
    { key: 'dhdc_0', domain: '', ability: '', rc: 0, description: '' },
    { key: 'dhdc_1', domain: '', ability: '', rc: 0, description: '' },
  ]
},
```

---

### 文件 4: `card-detail.js` — 编辑方法

为每个模块添加编辑方法(取消/保存/新增/删除/弹窗)模式，遵循 DND 模块的 snapshot + cancel/save 模式：

**属性模块** — `onToggleDhAttrFilled(e)` 切换四角星填满状态
**当前情况模块** — `startEditDhStatus` / `cancelEditDhStatus` / `saveDhStatus` / `onDhStatusInput`
**经历模块** — `startEditDhExperiences` / `cancelEditDhExperiences` / `saveDhExperiences` / `onAddDhExperience` / `onDeleteDhExperience` / `onDhExperienceTap` 等
**武器模块** — `startEditDhWeapons` / `cancelEditDhWeapons` / `saveDhWeapons` / `onAddDhWeapon` / `onDeleteDhWeapon` / `onDhWeaponTap` / `openDhWeaponDialog` 等
**护甲模块** — 同上模式
**库存模块** — `startEditDhInventory` / `cancelEditDhInventory` / `saveDhInventory` / `onDhInventoryInput`
**背景故事模块** — 弹窗编辑模式
**特性模块** — 遵循 DND 特性 pattern
**领域卡模块** — 遵循 weapons pattern

---

### 文件 5: `card-detail.wxml` — 替换 DH 区块

删除 L1085-L1134（六项属性 + 耐力与压力 + 经验标记 + 英雄过往），替换为 8 个新模块的 WXML。

**模块 1: 属性(3x3)**
```html
<view class="sheet-card">
  <view class="sheet-card-header">
    <text class="sheet-card-title">属性 · ATTRIBUTES</text>
    <text class="section-edit-btn">✎</text>
  </view>
  <view class="dh-attr-grid-3x2">
    <block wx:for="{{dhAttributes}}" wx:key="key">
      <view class="dh-attr-cell-v2">
        <view class="dh-attr-star" catchtap="onToggleDhAttrFilled" data-key="{{item.key}}">
          <text>{{dhAttrFilled[item.key] ? '✦' : '✧'}}</text>
        </view>
        <text class="dh-attr-label">{{item.label}}</text>
        <text class="dh-attr-abbr">{{item.abbr}}</text>
        <text class="dh-attr-val" style="color: {{item.color}};">{{item.fmt}}</text>
        <view class="dh-attr-subs">
          <text wx:for="{{item.subs}}" wx:for-item="sub" wx:key="*this">{{sub}}</text>
        </view>
      </view>
    </block>
  </view>
</view>
```

**模块 2: 当前情况**
- 阈值5列：轻伤 | 数字 | 重伤 | 数字 | 严重
- 闪避/熟练/护甲/生命/压力/希望：方框+条状布局

**模块 3-8**: 按用户描述实现，遵循 DND 模块的 edit/snapshot/cancel/save 模式

---

### 文件 6: `card-detail.wxss` — 新增样式

删除现有 `.dh-attr-grid` 等旧样式，新增：
- `.dh-attr-grid-3x2` — 3x2 网格
- `.dh-attr-cell-v2` — 属性单元格(含四角星)
- `.dh-attr-star` — 四角星按钮
- `.dh-attr-subs` — 子技能小字
- `.dh-threshold-row` — 阈值5列布局
- `.dh-threshold-cell` — 阈值单元格
- `.dh-stat-box` — 闪避/熟练方框
- `.dh-stat-bar` — 护甲/生命/压力/希望条状
- `.dh-stat-bar-dot` — 条状内的独立方格
- `.dh-experience-entry` — 经历条目
- `.dh-weapon-entry` / `.dh-armor-entry` — 武器/护甲条目
- `.dh-domain-card` — 领域卡条目
- 及其他模块样式

---

## 执行顺序
1. JS data 字段注册
2. JS buildSheetData 修改 + build 方法新增
3. JS 编辑方法新增
4. WXML 旧 DH 模块删除 + 新模块写入
5. WXSS 旧样式删除 + 新样式添加

## 验证
- 编译无报错
- 匕首之心角色卡详情页正常显示 8 个模块
- 各模块编辑/取消/保存功能正常
- 四角星点击切换正常