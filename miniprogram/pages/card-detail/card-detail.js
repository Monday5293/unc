const store = require('../../utils/store.js')
const themeUtil = require('../../utils/theme.js')
const { parseStCommand } = require('../../utils/st-parser.js')
const { parseDhJson } = require('../../utils/dh-json-parser.js')
const { sha256 } = require('../../utils/sha256.js')

// Daggerheart Build 工具函数（模块级，避免 WeChat 编译器 "not a function" 错误）
function buildDhExperiences(card) {
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
}

function buildDhWeapons(card) {
  const fd = card.formData || {}
  const weapons = fd.dh_weapons
  if (weapons && Array.isArray(weapons) && weapons.length > 0) {
    return weapons.map((w, i) => ({
      key: w.key || 'dhwpn_' + i, name: w.name || '', info: w.info || '',
      dice: w.dice || '', hand: w.hand || '主手', properties: w.properties || '',
    }))
  }
  return [
    { key: 'dhwpn_0', name: '', info: '', dice: '', hand: '主手', properties: '' },
    { key: 'dhwpn_1', name: '', info: '', dice: '', hand: '副手', properties: '' },
  ]
}

function buildDhArmors(card) {
  const fd = card.formData || {}
  const armors = fd.dh_armors
  if (armors && Array.isArray(armors) && armors.length > 0) {
    return armors.map((a, i) => ({
      key: a.key || 'dharm_' + i, name: a.name || '', value: a.value ?? 0,
      threshold: a.threshold ?? 0, thresholdMax: a.thresholdMax ?? 0, properties: a.properties || '',
    }))
  }
  return [
    { key: 'dharm_0', name: '', value: 0, threshold: 0, thresholdMax: 0, properties: '' },
    { key: 'dharm_1', name: '', value: 0, threshold: 0, thresholdMax: 0, properties: '' },
  ]
}

function buildDhAdventureNote(card) {
  const fd = card.formData || {}
  return fd.dh_adventure_note || ''
}

function buildDhClassFeatures(card) {
  const fd = card.formData || {}
  const features = fd.dh_class_features
  if (features && Array.isArray(features) && features.length > 0) {
    return features.map((f, i) => ({ key: f.key || 'dhcf_' + i, name: f.name || '', description: f.description || '' }))
  }
  return [
    { key: 'dhcf_0', name: '', description: '' },
    { key: 'dhcf_1', name: '', description: '' },
  ]
}

function buildDhRaceFeatures(card) {
  const fd = card.formData || {}
  const features = fd.dh_race_features
  if (features && Array.isArray(features) && features.length > 0) {
    return features.map((f, i) => ({ key: f.key || 'dhrf_' + i, name: f.name || '', description: f.description || '' }))
  }
  return [
    { key: 'dhrf_0', name: '', description: '' },
    { key: 'dhrf_1', name: '', description: '' },
  ]
}

function buildDhDomainCards(card) {
  const fd = card.formData || {}
  const cards = fd.dh_domain_cards
  if (cards && Array.isArray(cards) && cards.length > 0) {
    return cards.map((c, i) => ({
      key: c.key || 'dhdc_' + i, name: c.name || c.domain || '', domain: c.domain || '',
      ability: c.ability || '', rc: c.rc ?? 0, description: c.description || '',
    }))
  }
  return [
    { key: 'dhdc_0', name: '', domain: '', ability: '', rc: 0, description: '' },
    { key: 'dhdc_1', name: '', domain: '', ability: '', rc: 0, description: '' },
  ]
}

function buildDhTreasuryCards(card) {
  const fd = card.formData || {}
  const cards = fd.dh_treasury_cards
  if (cards && Array.isArray(cards) && cards.length > 0) {
    return cards.map((c, i) => ({
      key: c.key || 'dhtc_' + i, name: c.name || '', domain: c.domain || '',
      ability: c.ability || '', rc: c.rc ?? 0, description: c.description || '',
    }))
  }
  return [
    { key: 'dhtc_0', name: '', domain: '', ability: '', rc: 0, description: '' },
    { key: 'dhtc_1', name: '', domain: '', ability: '', rc: 0, description: '' },
  ]
}

var _dhKeySeq = 0
function _dhNextKey(prefix) {
  return prefix + (Date.now()) + '_' + (_dhKeySeq++)
}

Page({
  data: {
    card: null,
    systemInfo: null,
    system: '',
    previewStats: [],
    accentColor: '#C8A046',
    createdAtText: '',
    updatedAtText: '',
    cardNotFound: false,

    // st 指令对话框
    stDialogVisible: false,
    stCommandText: '',

    // ===== 手动属性表数据 =====
    // COC
    cocAttributes: [],
    cocSkills: [],
    cocSkillMode: 'detailed',  // 默认详细模式（显示所有技能）
    cocSkillLeft: [],
    cocSkillRight: [],
    // 编辑模式
    cocSkillEditing: false,
    editingBasicInfo: false,
    editingAttrs: false,
    editingStatus: false,
    editBasicInfo: {},
    editAttrs: {},
    editStatus: {},
    attrEditList: [
      { key: 'str', label: '力量' },
      { key: 'dex', label: '敏捷' },
      { key: 'pow', label: '意志' },
      { key: 'con', label: '体质' },
      { key: 'app', label: '外貌' },
      { key: 'edu', label: '教育' },
      { key: 'siz', label: '体型' },
      { key: 'int', label: '智力' },
      { key: 'luck', label: '幸运' },
    ],
    // 背景故事
    backstoryItems: [
      { key: 'backstory_desc', label: '个人描述', formDataKey: 'backstory_desc' },
      { key: 'backstory_belief', label: '思想/信念', formDataKey: 'backstory_belief' },
      { key: 'backstory_important', label: '重要之人', formDataKey: 'backstory_important' },
      { key: 'backstory_place', label: '非凡之地', formDataKey: 'backstory_place' },
      { key: 'backstory_treasure', label: '宝贵植物', formDataKey: 'backstory_treasure' },
      { key: 'backstory_trait', label: '特点', formDataKey: 'backstory_trait' },
      { key: 'backstory_wound', label: '伤口/伤痕', formDataKey: 'backstory_wound' },
      { key: 'backstory_phobia', label: '恐惧/狂躁症', formDataKey: 'backstory_phobia' },
    ],
    dndBackstoryItems: [
      { key: 'backstory_skill', label: '背景技能熟练' },
      { key: 'backstory_tool', label: '背景工具熟练' },
      { key: 'backstory_language', label: '背景语言' },
      { key: 'backstory_equipment', label: '背景装备' },
      { key: 'backstory_special', label: '背景特殊选项' },
      { key: 'backstory_feature', label: '背景特性' },
    ],
    backstoryDialogVisible: false,
    backstoryDialogTitle: '',
    backstoryDialogContent: '',
    backstoryDialogKey: '',
    backstoryDialogEditing: false,
    backstoryIsDetail: false,
    // 背包
    backpackDialogVisible: false,
    backpackDialogContent: '',
    backpackDialogEditing: false,
    // 背包（DND财富）
    editingWealth: false,
    editWealth: { pp: 0, ep: 0, gp: 0, sp: 0, cp: 0 },
    wealthTotalGP: 0,
    wealthCoins: [
      { key: 'pp', label: '铂金币 PP' },
      { key: 'ep', label: '银金币 EP' },
      { key: 'gp', label: '金币 GP' },
      { key: 'sp', label: '银币 SP' },
      { key: 'cp', label: '铜币 CP' },
    ],
    // 背包（DND物品）
    dndBackpackContent: '',
    dndBackpackDialogVisible: false,
    dndBackpackDialogContent: '',
    dndBackpackDialogEditing: false,
    // 经历
    experienceItems: [],
    experienceDialogVisible: false,
    experienceDialogType: 'label', // 'label' | 'value'
    experienceDialogTitle: '',
    experienceDialogLabel: '',
    experienceDialogContent: '',
    experienceDialogKey: '',
    experienceDialogEditing: false,
    experienceManaging: false,
    experienceItemsSnapshot: [],
    // DND
    dndAbilities: [],
    dndSavingThrows: [],
    dndAbilities: [],
    dndHpPercent: 0,
    dndHpColor: '#22c55e',
    // DND 当前状态
    editingDndStatus: false,
    editDndStatus: {},
    dndSpellSlots: [],
    dndAc: 0,
    dndDc: 0,
    dndClassLabel: '',
    editingDndBasicInfo: false,
    editDndBasicInfo: {},
    editingDndAttrs: false,
    editingDndSkills: false,
    editDndSkills: {},
    editDndAttrs: {},
    // 武器
    weaponItems: [],
    editingWeapons: false,
    weaponItemsSnapshot: [],
    weaponDialogVisible: false,
    weaponDialogEditing: false,
    weaponDialogKey: '',
    weaponDialogName: '',
    weaponDialogAttuned: false,
    weaponDialogProperties: '',
    weaponDialogAbility: '',
    weaponDialogHitBonus: '',
    weaponDialogDamage: '',
    weaponDialogDamageType: '',
    // 装备
    equipmentItems: [],
    editingEquipment: false,
    equipmentItemsSnapshot: [],
    equipmentDialogVisible: false,
    equipmentDialogEditing: false,
    equipmentDialogKey: '',
    equipmentDialogName: '',
    equipmentDialogAttuned: false,
    equipmentDialogProperties: '',
    equipmentDialogWeight: '',
    equipmentDialogSlot: '',
    // 特性
    classFeatures: [],
    raceFeatures: [],
    feats: [],
    editingClassFeatures: false,
    classFeaturesSnapshot: [],
    editingRaceFeatures: false,
    raceFeaturesSnapshot: [],
    editingFeats: false,
    featsSnapshot: [],
    featureDialogVisible: false,
    featureDialogEditing: false,
    featureDialogKey: '',
    featureDialogType: '', // 'classFeature' | 'raceFeature' | 'feat'
    featureDialogLevel: '',
    featureDialogName: '',
    featureDialogDescription: '',
    // 法术
    spellItems: [],
    editingSpells: false,
    spellItemsSnapshot: [],
    spellCollapsed: {},
    spellDialogVisible: false,
    spellDialogEditing: false,
    spellDialogKey: '',
    spellDialogName: '',
    spellDialogAttackBonus: '',
    spellDialogDamage: '',
    spellDialogDamageType: '',
    spellDialogAbility: '',
    spellDialogRitual: false,
    spellDialogVerbal: false,
    spellDialogSomatic: false,
    spellDialogMaterial: false,
    spellDialogLevel: '',
    spellDialogSchool: '',
    spellDialogCastingTime: '',
    spellDialogRange: '',
    spellDialogDuration: '',
    spellDialogEffect: '',
    spellDialogMaterials: '',
    // Daggerheart
    dhAttributes: [],
    dhAttrFilled: {},
    editingDhAttrs: false,
    editDhAttrs: {},
    // Daggerheart 当前情况
    dhMark1HP: 0,
    dhMark2HP: 0,
    dhMark3HP: 0,
    dhEvasion: 0,
    dhProficiency: 0,
    dhArmor: 0,
    dhArmorMax: 0,
    dhHP: 0,
    dhHPMax: 0,
    dhStress: 0,
    dhStressMax: 0,
    dhHope: 0,
    dhHopeMax: 6,
    editingDhStatus: false,
    editDhStatus: {},
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
    editDhInventory: '',
    // Daggerheart 背景故事
    dhBackstoryIntro: '',
    dhBackstoryTraits: '',
    dhBackstoryBio: '',
    dhBackstoryMilestones: '',
    dhAdventureLog: '',
    dhAdventureNote: '',
    editingDhBackstory: false,
    editDhBackstoryIntro: '',
    editDhBackstoryTraits: '',
    editDhBackstoryBio: '',
    editDhBackstoryMilestones: '',
    editDhAdventureLog: '',
    editDhAdventureNote: '',
    dhBackstoryDialogVisible: false,
    dhBackstoryDialogType: '',
    dhBackstoryDialogContent: '',
    dhBackstoryDialogEditing: false,
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
    dhFeatureDialogType: '',
    dhFeatureDialogName: '',
    dhFeatureDialogDesc: '',
    // Daggerheart 领域卡
    dhDomainCards: [],
    editingDhDomainCards: false,
    dhDomainCardsSnapshot: [],
    dhDomainDialogVisible: false,
    dhDomainDialogEditing: false,
    dhDomainDialogKey: '',
    dhDomainDialogName: '',
    dhDomainDialogDomain: '',
    dhDomainDialogAbility: '',
    dhDomainDialogRC: 0,
    dhDomainDialogDesc: '',
    // Daggerheart 宝库
    dhTreasuryCards: [],
    editingDhTreasuryCards: false,
    dhTreasuryCardsSnapshot: [],
    // Daggerheart 编辑
    editingDhBasicInfo: false,
    editDhBasicInfo: {},
    // 模块折叠
    collapsedSections: {},
    // 头像裁剪弹窗
    cropDialogVisible: false,
    cropImageSrc: '',
    cropImageW: 0,
    cropImageH: 0,
    cropX: 0,
    cropY: 0,
    cropBoxSize: 200,
    // 登录弹窗
    loginDialogVisible: false,
    loginName: '',
    loginPassword: '',
    isRegisterMode: false,
  },

  onLoad(options) {
    this.cardId = options.id
    this._ready = false
    this.loadCard()
  },

  onReady() {
    this._ready = true
  },

  onShow() {
    themeUtil.applyToPage(this)
    if (this.cardId && this._ready) {
      this.loadCard()
    }
  },

  toggleSection(e) {
    const key = e.currentTarget.dataset.section
    const collapsed = { ...this.data.collapsedSections }
    collapsed[key] = !collapsed[key]
    this.setData({ collapsedSections: collapsed })
  },

  loadCard() {
    try {
      const card = store.getCardById(this.cardId)
      if (!card) {
        this.setData({ cardNotFound: true, card: null, systemInfo: null })
        return
      }

      let systemInfo = store.getSystemInfo(card.system)
      if (!systemInfo) {
        systemInfo = {
          code: card.system || 'CUSTOM',
          name: card.system || '自定义',
          fullName: card.system || '自定义规则',
          accentColor: '#C8A046',
          logo: '●',
          isCustom: true,
          rule: card.rule || [],
          option: {},
        }
      }
      const accentColor = systemInfo ? systemInfo.accentColor : '#C8A046'
      const system = card.system || ''

      const previewStats = this.computePreviewStats(card)

      // 构建手动属性表数据
      const sheetData = this.buildSheetData(card, system)

      // 将所有函数调用提前到 setData 外部，避免 WeChat 编译器 "not a function" 错误
      const createdAtText = this.formatDate(card.createdAt)
      const updatedAtText = this.formatDate(card.updatedAt)
      const experienceItems = this.buildExperienceItems(card)
      const weaponItems = this.buildWeaponItems(card)
      const classFeatures = this.buildClassFeatures(card)
      const raceFeatures = this.buildRaceFeatures(card)
      const feats = this.buildFeats(card)
      const spellItems = this.buildSpellItems(card)

      const cardFd = card.formData || {}
      const equipmentRaw = cardFd.equipment
      var equipmentItems
      if (equipmentRaw && Array.isArray(equipmentRaw) && equipmentRaw.length > 0) {
        equipmentItems = equipmentRaw.map((eq, i) => ({
          key: eq.key || 'equip_' + i,
          name: eq.name || '',
          attuned: !!eq.attuned,
          properties: eq.properties || '',
          weight: eq.weight || '',
          slot: eq.slot || '',
        }))
      } else {
        equipmentItems = [
          { key: 'equip_0', name: '', attuned: false, properties: '', weight: '', slot: '' },
          { key: 'equip_1', name: '', attuned: false, properties: '', weight: '', slot: '' },
        ]
      }

      var editWealth = {}
      ;['pp','ep','gp','sp','cp'].forEach(function(k) { editWealth[k] = parseInt(cardFd['wealth_' + k]) || 0 })
      const wealthPP = parseInt(cardFd.wealth_pp) || 0
      const wealthEP = parseInt(cardFd.wealth_ep) || 0
      const wealthGP = parseInt(cardFd.wealth_gp) || 0
      const wealthSP = parseInt(cardFd.wealth_sp) || 0
      const wealthCP = parseInt(cardFd.wealth_cp) || 0
      const wealthTotalGP = Math.round((wealthPP * 100 + wealthEP * 10 + wealthGP * 1 + wealthSP * 0.1 + wealthCP * 0.01) * 100) / 100
      const dndBackpackContent = cardFd.dndBackpack || ''

      // Daggerheart 数据
      const dhExperiences = buildDhExperiences(card)
      const dhWeapons = buildDhWeapons(card)
      const dhArmors = buildDhArmors(card)
      const dhInventory = cardFd.dh_inventory || ''
      const dhBackstoryIntro = cardFd.dh_backstory_intro || ''
      const dhBackstoryTraits = cardFd.dh_backstory_traits || ''
      const dhBackstoryBio = cardFd.dh_backstory_bio || ''
      const dhBackstoryMilestones = cardFd.dh_backstory_milestones || ''
      const dhAdventureLog = cardFd.dh_adventure_log || ''
      const dhAdventureNote = buildDhAdventureNote(card)
      const dhClassFeatures = buildDhClassFeatures(card)
      const dhRaceFeatures = buildDhRaceFeatures(card)
      const dhDomainCards = buildDhDomainCards(card)
      const dhTreasuryCards = buildDhTreasuryCards(card)

      console.log('[loadCard] calling setData, data size ~' +
        JSON.stringify({ cardId: card.id, system: system }).length + ' chars')
      // 克隆 card 对象，确保 setData 检测到引用变化
      var cardForSetData = {}
      var cardKeys = Object.keys(card)
      for (var cki = 0; cki < cardKeys.length; cki++) {
        var ck = cardKeys[cki]
        cardForSetData[ck] = card[ck]
      }
      this.setData({
        card: cardForSetData,
        systemInfo,
        system,
        previewStats,
        accentColor,
        createdAtText,
        updatedAtText,
        cardNotFound: false,
        ...sheetData,
        experienceItems,
        weaponItems,
        equipmentItems,
        classFeatures,
        raceFeatures,
        feats,
        spellItems,
        editWealth,
        wealthTotalGP,
        dndBackpackContent,
        dhExperiences,
        dhWeapons,
        dhArmors,
        dhInventory,
        dhBackstoryIntro,
        dhBackstoryTraits,
        dhBackstoryBio,
        dhBackstoryMilestones,
        dhAdventureLog,
        dhAdventureNote,
        dhClassFeatures,
        dhRaceFeatures,
        dhDomainCards,
        dhTreasuryCards,
      })

      wx.setNavigationBarTitle({
        title: card.name || '角色卡详情'
      })
    } catch (err) {
      console.error('[card-detail] loadCard error:', err)
      this.setData({ cardNotFound: true, card: null, systemInfo: null })
    }
  },

  /** 构建手动属性表数据 */
  buildSheetData(card, system) {
    console.log('[buildSheetData] start, system:', system)
    const fd = card.formData || {}

    if (system === 'COC') {
      console.log('[buildSheetData] building COC data')
      // 9 项基础属性（3x3网格）
      const attrs = [
        { key: 'str',  label: '力量', abbr: 'STR', value: fd.str  ?? 50 },
        { key: 'dex',  label: '敏捷', abbr: 'DEX', value: fd.dex  ?? 50 },
        { key: 'pow',  label: '意志', abbr: 'POW', value: fd.pow  ?? 50 },
        { key: 'con',  label: '体质', abbr: 'CON', value: fd.con  ?? 50 },
        { key: 'app',  label: '外貌', abbr: 'APP', value: fd.app  ?? 50 },
        { key: 'edu',  label: '教育', abbr: 'EDU', value: fd.edu  ?? 80 },
        { key: 'siz',  label: '体型', abbr: 'SIZ', value: fd.siz  ?? 50 },
        { key: 'int',  label: '智力', abbr: 'INT', value: fd.int  ?? 75 },
        { key: 'luck', label: '幸运', abbr: 'LUK', value: fd.luck ?? 50 },
      ].map(a => ({ ...a, color: this.cocAttrColor(a.value) }))

      // 左列技能定义（按文件顺序）
      const leftDefs = [
        { key: 'skill_accounting',       zh: '会计',       base: 5 },
        { key: 'skill_anthropology',     zh: '人类学',     base: 1 },
        { key: 'skill_appraise',         zh: '估价',       base: 5 },
        { key: 'skill_archaeology',      zh: '考古学',     base: 1 },
        { key: 'skill_artCraft',         zh: '技艺①',     base: 5 },
        { key: 'skill_artCraft2',        zh: '技艺②',     base: 5 },
        { key: 'skill_artCraft3',        zh: '技艺③',     base: 5 },
        { key: 'skill_charm',            zh: '魅惑',       base: 15 },
        { key: 'skill_climb',            zh: '攀爬',       base: 20 },
        { key: 'skill_computer',         zh: '计算机使用', base: 5 },
        { key: 'skill_creditRating',     zh: '信用评级',   base: 0 },
        { key: 'skill_cthulhuMythos',    zh: '克苏鲁神话', base: 0 },
        { key: 'skill_disguise',         zh: '乔装',       base: 5 },
        { key: 'skill_dodge',            zh: '闪避',       base: Math.floor((fd.dex ?? 50) / 2) },
        { key: 'skill_driveAuto',        zh: '汽车驾驶',   base: 20 },
        { key: 'skill_elecRepair',       zh: '电气维修',   base: 10 },
        { key: 'skill_electronics',      zh: '电子学',     base: 1 },
        { key: 'skill_fastTalk',         zh: '话术',       base: 5 },
        { key: 'skill_fightingBrawl',    zh: '格斗：斗殴', base: 25 },
        { key: 'skill_fighting2',        zh: '格斗②',     base: 25 },
        { key: 'skill_fighting3',        zh: '格斗③',     base: 25 },
        { key: 'skill_firearmsHandgun',  zh: '射击：手枪', base: 20 },
        { key: 'skill_firearmsRifle',    zh: '射击②',     base: 25 },
        { key: 'skill_firearms3',        zh: '射击③',     base: 25 },
        { key: 'skill_firstAid',         zh: '急救',       base: 30 },
        { key: 'skill_history',          zh: '历史',       base: 5 },
        { key: 'skill_intimidate',       zh: '恐吓',       base: 15 },
        { key: 'skill_jump',             zh: '跳跃',       base: 20 },
        { key: 'skill_languageOther',    zh: '外语①',     base: 1 },
        { key: 'skill_languageOther2',   zh: '外语②',     base: 1 },
        { key: 'skill_languageOther3',   zh: '外语③',     base: 1 },
        { key: 'skill_languageOwn',      zh: '母语',       base: fd.edu ?? 80 },
      ]

      // 右列技能定义（按文件顺序）
      const rightDefs = [
        { key: 'skill_law',              zh: '法律',       base: 5 },
        { key: 'skill_libraryUse',       zh: '图书馆使用', base: 20 },
        { key: 'skill_listen',           zh: '聆听',       base: 20 },
        { key: 'skill_locksmith',        zh: '锁匠',       base: 1 },
        { key: 'skill_mechRepair',       zh: '机械维修',   base: 10 },
        { key: 'skill_medicine',         zh: '医学',       base: 1 },
        { key: 'skill_naturalWorld',     zh: '博物学',     base: 10 },
        { key: 'skill_navigate',         zh: '领航',       base: 10 },
        { key: 'skill_occult',           zh: '神秘学',     base: 5 },
        { key: 'skill_opHeavyMachine',   zh: '操作重型机械',base: 1 },
        { key: 'skill_persuade',         zh: '说服',       base: 10 },
        { key: 'skill_pilot',           zh: '驾驶：',     base: 1 },
        { key: 'skill_psychoanalysis',   zh: '精神分析',   base: 1 },
        { key: 'skill_psychology',       zh: '心理学',     base: 10 },
        { key: 'skill_ride',             zh: '骑术',       base: 5 },
        { key: 'skill_science',          zh: '科学①',     base: 1 },
        { key: 'skill_science2',         zh: '科学②',     base: 1 },
        { key: 'skill_science3',         zh: '科学③',     base: 1 },
        { key: 'skill_sleightOfHand',    zh: '妙手',       base: 10 },
        { key: 'skill_spotHidden',       zh: '侦查',       base: 25 },
        { key: 'skill_stealth',          zh: '潜行',       base: 20 },
        { key: 'skill_survival',        zh: '生存：',     base: 10 },
        { key: 'skill_swim',             zh: '游泳',       base: 20 },
        { key: 'skill_throw',            zh: '投掷',       base: 20 },
        { key: 'skill_track',            zh: '追踪',       base: 10 },
        { key: 'skill_animal',           zh: '驯兽',       base: 5 },
        { key: 'skill_diving',           zh: '潜水',       base: 1 },
        { key: 'skill_demolitions',      zh: '爆破',       base: 1 },
        { key: 'skill_lipReading',       zh: '读唇',       base: 1 },
        { key: 'skill_hypnosis',         zh: '催眠',       base: 1 },
        { key: 'skill_artillery',        zh: '炮术',       base: 1 },
        { key: 'skill_lore',            zh: '学问：',     base: 1 },
        { key: 'skill_custom',           zh: '自定义技能', base: 0 },
      ]

      const accentColor = this.data ? (this.data.accentColor || '#C8A046') : '#C8A046'

      function fmtSkill(s) {
        if (s.isHeader) return { ...s, current: 0, growth: 0, occ: 0, int: 0, changed: false, color: '' }
        const growth = fd[s.key + '_growth'] || 0
        const occ = fd[s.key + '_occ'] || 0
        const int = fd[s.key + '_int'] || 0
        const current = fd[s.key] !== undefined ? fd[s.key] : s.base
        const changed = current !== s.base || growth > 0 || occ > 0 || int > 0
        // 外语技能：如果 st 导入时指定了具体语言名，用语言名替换默认的"外语①/②/③"
        const langName = fd[s.key + '_name']
        const zh = langName || s.zh
        const displayName = zh.length === 4 ? zh.substring(0, 2) + '\n' + zh.substring(2) : zh
        let color
        if (changed && current >= 50) {
          color = '#f59e0b'
        } else if (changed) {
          color = '#22c55e'
        } else {
          color = '#94a3b8'
        }
        return { ...s, zh, displayName, current, growth, occ, int, changed, color }
      }

      return {
        cocAttributes: attrs,
        cocSkillLeft: leftDefs.map(fmtSkill),
        cocSkillRight: rightDefs.map(fmtSkill),
      }
    }

    if (system === 'DND') {
      console.log('[buildSheetData] building DND data')
      const abilities = [
        { key: 'str', label: '力量', abbr: 'STR', value: fd.str ?? 10 },
        { key: 'dex', label: '敏捷', abbr: 'DEX', value: fd.dex ?? 10 },
        { key: 'con', label: '体质', abbr: 'CON', value: fd.con ?? 10 },
        { key: 'int', label: '智力', abbr: 'INT', value: fd.int ?? 10 },
        { key: 'wis', label: '感知', abbr: 'WIS', value: fd.wis ?? 10 },
        { key: 'cha', label: '魅力', abbr: 'CHA', value: fd.cha ?? 10 },
      ].map(ab => {
        const modRaw = fd[ab.key + '_mod'] !== undefined ? fd[ab.key + '_mod'] : this.dndMod(ab.value)
        const mod = typeof modRaw === 'string' ? modRaw.replace(/^\+/, '') : String(modRaw)
        const saveRaw = fd[ab.key + '_save'] !== undefined ? fd[ab.key + '_save'] : mod
        const save = typeof saveRaw === 'string' ? saveRaw.replace(/^\+/, '') : String(saveRaw)
        return {
          ...ab,
          mod,
          modColor: this.dndModColor(ab.value),
          save,
          saveColor: this.dndModColor(ab.value),
        }
      })

      const saves = (fd.savingThrows || []).map(sv => ({
        key: sv,
        label: this.saveLabel(sv),
      }))
      const skills = (fd.skillProf || []).map(sk => ({
        key: sk,
        label: this.skillLabel(sk),
      }))

      // 18 项技能定义（按顺序）
      const profBonus = parseInt(fd.profBonus) || 2
      const skillDefs = [
        { key: 'skill_athletics',     name: '运动', ability: 'str', group: 'con' },
        { key: 'skill_acrobatics',    name: '特技', ability: 'dex', group: 'dex' },
        { key: 'skill_sleightOfHand', name: '巧手', ability: 'dex', group: 'dex' },
        { key: 'skill_stealth',       name: '隐匿', ability: 'dex', group: 'dex' },
        { key: 'skill_investigation', name: '调查', ability: 'int', group: 'int' },
        { key: 'skill_arcana',        name: '奥秘', ability: 'int', group: 'int' },
        { key: 'skill_history',       name: '历史', ability: 'int', group: 'int' },
        { key: 'skill_nature',        name: '自然', ability: 'int', group: 'int' },
        { key: 'skill_religion',      name: '宗教', ability: 'int', group: 'int' },
        { key: 'skill_perception',    name: '察觉', ability: 'wis', group: 'wis' },
        { key: 'skill_insight',       name: '洞悉', ability: 'wis', group: 'wis' },
        { key: 'skill_animal',        name: '驯兽', ability: 'wis', group: 'wis' },
        { key: 'skill_medicine',      name: '医药', ability: 'wis', group: 'wis' },
        { key: 'skill_survival',      name: '生存', ability: 'wis', group: 'wis' },
        { key: 'skill_persuasion',    name: '游说', ability: 'cha', group: 'cha' },
        { key: 'skill_deception',     name: '欺瞒', ability: 'cha', group: 'cha' },
        { key: 'skill_intimidation',  name: '威吓', ability: 'cha', group: 'cha' },
        { key: 'skill_performance',   name: '表演', ability: 'cha', group: 'cha' },
      ]

      const GROUP_COLORS = {
        con: 'rgba(239,68,68,0.25)',
        dex: 'rgba(34,197,94,0.25)',
        int: 'rgba(59,130,246,0.25)',
        wis: 'rgba(168,85,247,0.25)',
        cha: 'rgba(234,179,8,0.25)',
      }

      const getGroupIndex = (defs, i, group) => {
        let idx = 0
        for (let j = 0; j <= i; j++) {
          if (defs[j].group === group) idx++
        }
        return idx - 1
      }
      const getGroupSize = (defs, group) => defs.filter(d => d.group === group).length

      const skillRows = skillDefs.map((sd, i) => {
        const abilityVal = fd[sd.ability] ?? 10
        const baseMod = this.dndModValue(abilityVal)
        // 调整值：支持手动覆盖
        const modOverride = fd[sd.key + '_mod']
        const mod = modOverride !== undefined ? parseInt(modOverride) : baseMod
        // 总值：独立存储，无覆盖时默认计算 baseMod + profBonus（兼容旧数据）
        const totalOverride = fd[sd.key + '_total']
        const prof = (fd.skillProf || []).includes(sd.key)
        const total = totalOverride !== undefined ? parseInt(totalOverride) : (mod + (prof ? profBonus : 0))
        const modFmt = mod >= 0 ? '+' + mod : String(mod)
        const groupIdx = getGroupIndex(skillDefs, i, sd.group)
        const groupSize = getGroupSize(skillDefs, sd.group)
        return {
          key: sd.key,
          name: sd.name,
          ability: sd.ability,
          group: sd.group,
          modFmt,
          modRaw: mod,
          modColor: this.dndModColor(abilityVal),
          total,
          groupColor: GROUP_COLORS[sd.group],
          firstInGroup: groupIdx === 0,
          lastInGroup: groupIdx === groupSize - 1,
        }
      })

      // 拆分为 3 列，每列 6 个
      const dndSkillColumns = [
        skillRows.slice(0, 6),
        skillRows.slice(6, 12),
        skillRows.slice(12, 18),
      ]

      const hp = fd.hp || 0
      const hpMax = fd.hpMax || 0
      const hpPct = hpMax ? Math.min((hp / hpMax) * 100, 100) : 0
      let hpColor = '#22c55e'
      if (hpPct <= 25) hpColor = '#ef4444'
      else if (hpPct <= 50) hpColor = '#f59e0b'

      const ac = fd.ac || 0
      const dc = fd.dc !== undefined ? fd.dc : ac

      const spellSlots = fd.spellSlots && Array.isArray(fd.spellSlots) && fd.spellSlots.length > 0
        ? fd.spellSlots.map((s, i) => {
            if (typeof s === 'object') return { used: s.used ?? 0, total: s.total ?? 0 }
            return { used: 0, total: s ?? 0 }
          })
        : Array.from({ length: 9 }, () => ({ used: 0, total: 0 }))

      const classLabel = this.classLabel(fd.class)

      return {
        dndAbilities: abilities,
        dndSavingThrows: saves,
        dndSkillProfs: skills,
        dndSkillColumns,
        dndHpPercent: hpPct,
        dndHpColor: hpColor,
        dndAc: ac,
        dndDc: dc,
        dndSpellSlots: spellSlots,
        dndClassLabel: classLabel,
      }
    }

    if (system === 'DAGGERHEART') {
      console.log('[buildSheetData] building DAGGERHEART data, dh_armor:', fd.dh_armor, 'dh_armor_max:', fd.dh_armor_max)
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
        fmt: String(fd['dh_' + a.key] ?? 0),
        color: this.dhAttrColor(fd['dh_' + a.key] ?? 0),
      }))
      const attrFilled = fd.dh_attr_filled || {}
      const dhAttrFilled = {}
      attrDefs.forEach(a => { dhAttrFilled[a.key] = !!attrFilled[a.key] })
      const armorMax = fd.dh_armor_max ?? 0

      return {
        dhAttributes: attrs,
        dhAttrFilled,
        dhMark1HP: fd.dh_mark1_hp ?? 0,
        dhMark2HP: fd.dh_mark2_hp ?? 0,
        dhMark3HP: fd.dh_mark3_hp ?? 0,
        dhEvasion: fd.dh_evasion ?? 0,
        dhProficiency: fd.dh_proficiency ?? 0,
        dhArmor: fd.dh_armor ?? 0,
        dhArmorMax: armorMax,
        dhHP: fd.dh_hp ?? 0,
        dhHPMax: fd.dh_hp_max ?? 0,
        dhStress: fd.dh_stress ?? 0,
        dhStressMax: fd.dh_stress_max ?? 0,
        dhHope: fd.dh_hope ?? 0,
        dhHopeMax: fd.dh_hope_max ?? 6,
      }
    }

    console.log('[buildSheetData] done, returning data for system:', system)
    return {}
  },

  // === COC 工具函数 ===
  cocAttrColor(v) {
    if (v >= 80) return '#f59e0b'
    if (v >= 60) return this.data.accentColor || '#C8A046'
    if (v >= 40) return '#94a3b8'
    return '#ef4444'
  },

  // === DND 编辑处理 ===
  /** 开启/关闭 DND 基本信息编辑 */
  onToggleDndBasicInfoEdit() {
    if (!this.guardLogin()) return
    if (this.data.editingDndBasicInfo) {
      this.setData({ editingDndBasicInfo: false })
      return
    }
    const fd = this.data.card.formData || {}
    this.setData({
      editingDndBasicInfo: true,
      editDndBasicInfo: {
        name: fd.name || '',
        player: fd.player || '',
        age: fd.age || '',
        gender: fd.gender || '',
        class: fd.class || '',
        multiclass: fd.multiclass || '',
        level: fd.level || '',
        race: fd.race || '',
        alignment: fd.alignment || '',
        background: fd.background || '',
      }
    })
  },

  onDndBasicInfoInput(e) {
    const { key } = e.currentTarget.dataset
    const edit = { ...this.data.editDndBasicInfo }
    edit[key] = e.detail.value
    this.setData({ editDndBasicInfo: edit })
  },

  saveDndBasicInfo() {
    const fd = { ...this.data.card.formData }
    const edit = this.data.editDndBasicInfo
    Object.keys(edit).forEach(k => {
      if (edit[k] !== undefined && edit[k] !== '') fd[k] = edit[k]
    })
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingDndBasicInfo: false })
    this.loadCard()
  },

  cancelDndBasicInfoEdit() {
    this.setData({ editingDndBasicInfo: false })
  },

  /** 开启/关闭 DND 属性编辑 */
  onToggleDndAttrEdit() {
    if (this.data.editingDndAttrs) {
      this.setData({ editingDndAttrs: false })
      return
    }
    const fd = this.data.card.formData || {}
    this.setData({
      editingDndAttrs: true,
      editDndAttrs: {
        str: fd.str ?? 10,
        str_mod: fd.str_mod !== undefined ? fd.str_mod : this.dndMod(fd.str ?? 10),
        str_save: fd.str_save !== undefined ? fd.str_save : this.dndMod(fd.str ?? 10),
        dex: fd.dex ?? 10,
        dex_mod: fd.dex_mod !== undefined ? fd.dex_mod : this.dndMod(fd.dex ?? 10),
        dex_save: fd.dex_save !== undefined ? fd.dex_save : this.dndMod(fd.dex ?? 10),
        con: fd.con ?? 10,
        con_mod: fd.con_mod !== undefined ? fd.con_mod : this.dndMod(fd.con ?? 10),
        con_save: fd.con_save !== undefined ? fd.con_save : this.dndMod(fd.con ?? 10),
        int: fd.int ?? 10,
        int_mod: fd.int_mod !== undefined ? fd.int_mod : this.dndMod(fd.int ?? 10),
        int_save: fd.int_save !== undefined ? fd.int_save : this.dndMod(fd.int ?? 10),
        wis: fd.wis ?? 10,
        wis_mod: fd.wis_mod !== undefined ? fd.wis_mod : this.dndMod(fd.wis ?? 10),
        wis_save: fd.wis_save !== undefined ? fd.wis_save : this.dndMod(fd.wis ?? 10),
        cha: fd.cha ?? 10,
        cha_mod: fd.cha_mod !== undefined ? fd.cha_mod : this.dndMod(fd.cha ?? 10),
        cha_save: fd.cha_save !== undefined ? fd.cha_save : this.dndMod(fd.cha ?? 10),
      }
    })
  },

  onDndAttrInput(e) {
    const { key } = e.currentTarget.dataset
    const edit = { ...this.data.editDndAttrs }
    edit[key] = e.detail.value
    this.setData({ editDndAttrs: edit })
  },

  saveDndAttrs() {
    const fd = { ...this.data.card.formData }
    const edit = this.data.editDndAttrs
    Object.keys(edit).forEach(k => {
      fd[k] = edit[k]
    })
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingDndAttrs: false })
    this.loadCard()
  },

  cancelDndAttrEdit() {
    this.setData({ editingDndAttrs: false })
  },

  // === DND 技能编辑 ===
  onToggleDndSkillEdit() {
    if (this.data.editingDndSkills) {
      this.setData({ editingDndSkills: false })
      return
    }
    const fd = this.data.card.formData || {}
    const columns = this.data.dndSkillColumns || []
    const edit = {}
    const profBonus = parseInt(fd.profBonus) || 2
    columns.forEach(col => {
      col.forEach(s => {
        edit[s.key + '_mod'] = fd[s.key + '_mod'] !== undefined ? fd[s.key + '_mod'] : s.modRaw
        const prof = (fd.skillProf || []).includes(s.key)
        edit[s.key + '_total'] = fd[s.key + '_total'] !== undefined ? fd[s.key + '_total'] : (s.modRaw + (prof ? profBonus : 0))
      })
    })
    this.setData({ editingDndSkills: true, editDndSkills: edit })
  },

  onDndSkillModInput(e) {
    const key = e.currentTarget.dataset.key
    const edit = { ...this.data.editDndSkills }
    edit[key] = parseInt(e.detail.value) || 0
    this.setData({ editDndSkills: edit })
  },

  cancelDndSkillEdit() {
    this.setData({ editingDndSkills: false })
  },

  saveDndSkills() {
    const edit = this.data.editDndSkills
    const fd = { ...this.data.card.formData }
    const skillDefs = [
      'skill_athletics','skill_acrobatics','skill_sleightOfHand','skill_stealth',
      'skill_investigation','skill_arcana','skill_history','skill_nature','skill_religion',
      'skill_perception','skill_insight','skill_animal','skill_medicine','skill_survival',
      'skill_persuasion','skill_deception','skill_intimidation','skill_performance',
    ]
    skillDefs.forEach(k => {
      fd[k + '_mod'] = edit[k + '_mod']
      fd[k + '_total'] = edit[k + '_total']
    })
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingDndSkills: false })
    this.loadCard()
  },

  // === DND 当前状态编辑 ===
  onToggleDndStatusEdit() {
    const fd = this.data.card.formData || {}
    this.setData({
      editingDndStatus: !this.data.editingDndStatus,
      editDndStatus: {
        hp: fd.hp ?? 0,
        hpMax: fd.hpMax ?? 0,
        initiative: fd.initiative ?? 0,
        hitDiceUsed: fd.hitDiceUsed ?? 0,
        hitDiceCount: fd.hitDiceCount ?? 0,
        hitDice: fd.hitDice ?? '',
        ac: fd.ac ?? 0,
        dc: fd.dc ?? 0,
        passivePerception: fd.passivePerception ?? 0,
        speed: fd.speed ?? 30,
      },
      dndSpellSlots: fd.spellSlots && Array.isArray(fd.spellSlots) && fd.spellSlots.length > 0
        ? fd.spellSlots.map(s => {
            if (typeof s === 'object') return { used: s.used ?? 0, total: s.total ?? 0 }
            return { used: 0, total: s ?? 0 }
          })
        : Array.from({ length: 9 }, () => ({ used: 0, total: 0 })),
    })
  },

  onDndStatusInput(e) {
    const field = e.currentTarget.dataset.field
    const edit = { ...this.data.editDndStatus }
    edit[field] = e.detail.value
    this.setData({ editDndStatus: edit })
  },

  onDndSpellSlotInput(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    const field = e.currentTarget.dataset.field
    const slots = [...this.data.dndSpellSlots]
    slots[index] = { ...slots[index], [field]: parseInt(e.detail.value) || 0 }
    this.setData({ dndSpellSlots: slots })
  },

  onSpellSlotDelta(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    const delta = parseInt(e.currentTarget.dataset.delta)
    const slots = [...this.data.dndSpellSlots]
    const newVal = Math.max(0, (slots[index].used || 0) + delta)
    if (newVal > (slots[index].total || 0)) return
    slots[index] = { ...slots[index], used: newVal }
    this.setData({ dndSpellSlots: slots })
    // 非编辑模式下直接保存
    if (!this.data.editingDndStatus) {
      const fd = { ...this.data.card.formData }
      fd.spellSlots = slots.map(s => ({ used: s.used || 0, total: s.total || 0 }))
      store.updateCardFormData(this.cardId, fd)
      this.loadCard()
    }
  },

  cancelDndStatusEdit() {
    this.setData({ editingDndStatus: false })
  },

  saveDndStatus() {
    const edit = this.data.editDndStatus
    const fd = { ...this.data.card.formData }
    fd.hp = parseInt(edit.hp) || 0
    fd.hpMax = parseInt(edit.hpMax) || 0
    fd.initiative = parseInt(edit.initiative) || 0
    fd.hitDiceUsed = parseInt(edit.hitDiceUsed) || 0
    fd.hitDiceCount = parseInt(edit.hitDiceCount) || 0
    fd.hitDice = edit.hitDice
    fd.ac = parseInt(edit.ac) || 0
    fd.dc = parseInt(edit.dc) || 0
    fd.passivePerception = parseInt(edit.passivePerception) || 0
    fd.speed = parseInt(edit.speed) || 30
    fd.spellSlots = this.data.dndSpellSlots.map(s => ({ used: parseInt(s.used) || 0, total: parseInt(s.total) || 0 }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingDndStatus: false })
    this.loadCard()
  },

  // === DND 工具函数 ===
  dndMod(score) {
    const m = Math.floor((score - 10) / 2)
    return m > 0 ? String(m) : m === 0 ? '0' : String(m)
  },

  dndModValue(score) {
    return Math.floor((score - 10) / 2)
  },
  dndModColor(score) {
    const m = Math.floor((score - 10) / 2)
    if (m >= 4) return '#f59e0b'
    if (m >= 2) return this.data.accentColor || '#C8A046'
    if (m >= 0) return '#94a3b8'
    return '#ef4444'
  },
  saveLabel(v) {
    const map = { str: '力量', dex: '敏捷', con: '体质', int: '智力', wis: '感知', cha: '魅力' }
    return map[v] || v
  },
  skillLabel(v) {
    const map = {
      athletics: '运动', acrobatics: '杂技', sleight: '巧手', stealth: '隐匿',
      arcana: '奥秘', history: '历史', investigation: '调查', nature: '自然', religion: '宗教',
      animal: '驯兽', insight: '洞悉', medicine: '医药', perception: '察觉', survival: '生存',
      deception: '欺瞒', intimidation: '威吓', performance: '表演', persuasion: '说服',
    }
    return map[v] || v
  },

  // === Daggerheart 工具函数 ===
  dhAttrColor(v) {
    if (v >= 3) return '#f59e0b'
    if (v >= 1) return this.data.accentColor || '#9BA8B5'
    if (v >= 0) return '#94a3b8'
    return '#ef4444'
  },

  // === 预览统计 ===
  computePreviewStats(card) {
    const fd = card.formData
    const sys = card.system

    if (sys === 'COC') {
      return [
        { label: '职业', value: fd.occupation || '—' },
        { label: '年龄', value: fd.age || '—' },
        { label: '住地', value: fd.residence || '—' },
        { label: '年份', value: fd.year || '1920s' }
      ]
    }

    if (sys === 'DND') {
      const ac = fd.ac || 0
      const dc = fd.dc !== undefined ? fd.dc : ac
      return [
        { label: '职业', value: this.classLabel(fd.class) },
        { label: '种族', value: fd.race || '—' },
        { label: '等级', value: fd.level || '—' },
        { label: 'AC/DC/HP', value: `${ac}/${dc}/${fd.hpMax || 0}` }
      ]
    }

    if (sys === 'DAGGERHEART') {
      const hasA1 = fd.ancestry && String(fd.ancestry).trim()
      const hasA2 = fd.ancestry2 && String(fd.ancestry2).trim()
      let ancestryVal, ancestrySubVal
      if (hasA1 && hasA2) {
        ancestryVal = this.dhAncestryLabel(fd.ancestry)
        ancestrySubVal = this.dhAncestryLabel(fd.ancestry2)
      } else if (hasA1) {
        ancestryVal = this.dhAncestryLabel(fd.ancestry)
        ancestrySubVal = null
      } else if (hasA2) {
        ancestryVal = this.dhAncestryLabel(fd.ancestry2)
        ancestrySubVal = null
      } else {
        ancestryVal = '—'
        ancestrySubVal = null
      }
      return [
        { label: '职业', value: this.dhClassLabel(fd.class) },
        { label: '等级', value: fd.level || '—' },
        { label: '种族', value: ancestryVal, subValue: ancestrySubVal },
        { label: '社群', value: fd.community || '—' }
      ]
    }

    const entries = Object.entries(fd).filter(
      ([, v]) => v !== '' && v !== null && v !== undefined && typeof v !== 'object'
    )
    return entries.slice(0, 4).map(([k, v]) => ({
      label: k,
      value: String(v)
    }))
  },

  classLabel(v) {
    const map = {
      fighter: '战士', wizard: '法师', ranger: '游侠', rogue: '盗贼',
      cleric: '牧师', paladin: '圣武士', druid: '德鲁伊', bard: '吟游诗人'
    }
    return (v && map[v]) || v || '—'
  },

  dhClassLabel(v) {
    const map = {
      warrior: '战士', ranger: '游侠', rogue: '盗贼',
      sorcerer: '法师', druid: '德鲁伊', binder: '缚灵者'
    }
    return (v && map[v]) || v || '—'
  },

  dhAncestryLabel(v) {
    const map = {
      human: '人类', elf: '精灵', orc: '半兽人',
      dwarf: '矮人', halfling: '半身人'
    }
    return (v && map[v]) || v || '—'
  },

  // === Daggerheart 编辑处理 ===
  onToggleDhBasicInfoEdit() {
    if (!this.guardLogin()) return
    if (this.data.editingDhBasicInfo) {
      this.setData({ editingDhBasicInfo: false })
      return
    }
    const fd = this.data.card.formData || {}
    this.setData({
      editingDhBasicInfo: true,
      editDhBasicInfo: {
        name: fd.name || '',
        player: fd.player || '',
        age: fd.age || '',
        gender: fd.gender || '',
        class: fd.class || '',
        subclass: fd.subclass || '',
        community: fd.community || '',
        birthplace: fd.birthplace || '',
        ancestry: fd.ancestry || '',
        ancestry2: fd.ancestry2 || '',
        level: fd.level || '',
      }
    })
  },

  onDhBasicInfoInput(e) {
    const { field } = e.currentTarget.dataset
    const edit = { ...this.data.editDhBasicInfo }
    edit[field] = e.detail.value
    this.setData({ editDhBasicInfo: edit })
  },

  saveDhBasicInfo() {
    const fd = { ...this.data.card.formData }
    const edit = this.data.editDhBasicInfo
    Object.keys(edit).forEach(k => {
      fd[k] = edit[k]
    })
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingDhBasicInfo: false })
    this.loadCard()
  },

  cancelDhBasicInfoEdit() {
    this.setData({ editingDhBasicInfo: false })
  },

  formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d} ${hh}:${mm}`
  },

  toggleSkillMode() {
    const next = this.data.cocSkillMode === 'simple' ? 'detailed' : 'simple'
    this.setData({ cocSkillMode: next })
  },

  goBack() {
    wx.navigateBack()
  },

  toggleFav() {
    if (this.data.card) {
      store.toggleFavorite(this.data.card.id)
      this.loadCard()
    }
  },

  exportCard() {
    if (!this.data.card) return
    const exportData = {
      ...this.data.card,
      systemInfo: this.data.systemInfo,
      exportTime: new Date().toISOString()
    }
    wx.setClipboardData({
      data: JSON.stringify(exportData, null, 2),
      success: () => {
        wx.showToast({
          title: 'JSON已复制',
          icon: 'success'
        })
      }
    })
  },

  // ===== st 指令 =====
  openStDialog() {
    if (!this.guardLogin()) return
    this.setData({ stDialogVisible: true, stCommandText: '' })
  },

  closeStDialog() {
    this.setData({ stDialogVisible: false, stCommandText: '' })
  },

  onStCommandInput(e) {
    this.setData({ stCommandText: e.detail.value })
  },

  applyStCommand() {
    const stText = this.data.stCommandText.trim()
    if (!stText) {
      wx.showToast({ title: '请粘贴指令或 JSON', icon: 'none' })
      return
    }
    // DAGGERHEART 系统：检测是否为 DHSheet JSON 导入
    var parsed
    if (this.data.system === 'DAGGERHEART' && stText.charAt(0) === '{') {
      parsed = parseDhJson(stText)
      if (!parsed) {
        wx.showToast({ title: 'JSON 格式无效', icon: 'none' })
        return
      }
    } else {
      parsed = parseStCommand(stText)
      if (!parsed || Object.keys(parsed).length === 0) {
        wx.showToast({ title: '未能解析指令', icon: 'none' })
        return
      }
    }
    const merged = { ...this.data.card.formData, ...parsed }
    store.updateCardFormData(this.cardId, merged)
    wx.showToast({ title: '数据已更新', icon: 'success' })
    this.setData({ stDialogVisible: false, stCommandText: '' })
    this.loadCard()
  },

  // ===== 头像上传 =====
  onChooseAvatar() {
    const that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePath = res.tempFilePaths[0]
        // 获取图片尺寸信息
        wx.getImageInfo({
          src: tempFilePath,
          success(info) {
            // 计算图片在弹窗中的显示尺寸（宽度撑满弹窗内容区）
            const screenWidth = wx.getSystemInfoSync().windowWidth
            const dialogWidth = screenWidth * 0.85  // 85vw
            const contentWidth = dialogWidth - 28 * 2 * (screenWidth / 750)  // 减去 padding
            const imageW = contentWidth
            const imageH = (info.height / info.width) * contentWidth
            that.setData({
              cropImageSrc: tempFilePath,
              cropImageW: imageW,
              cropImageH: imageH,
              cropX: 0,
              cropY: 0,
              cropBoxSize: Math.min(imageW, imageH) * 0.6,
              cropDialogVisible: true
            })
          },
          fail() {
            // 获取尺寸失败，使用默认值
            that.setData({
              cropImageSrc: tempFilePath,
              cropImageW: 300,
              cropImageH: 300,
              cropX: 0,
              cropY: 0,
              cropBoxSize: 180,
              cropDialogVisible: true
            })
          }
        })
      }
    })
  },

  onCropBoxChange(e) {
    if (!this.data.cropDialogVisible) return
    this.setData({
      cropX: e.detail.x,
      cropY: e.detail.y
    })
  },

  cancelCrop() {
    this.setData({ cropDialogVisible: false })
  },

  onResizeStart(e) {
    this._resizeStartX = e.touches[0].pageX
    this._resizeStartY = e.touches[0].pageY
    this._resizeStartSize = this.data.cropBoxSize
  },

  onResizeMove(e) {
    if (this._resizeStartSize == null) return
    const dx = e.touches[0].pageX - this._resizeStartX
    const dy = e.touches[0].pageY - this._resizeStartY
    // 取对角线方向的最大偏移作为新尺寸增量
    const delta = Math.max(dx, dy)
    const { cropImageW, cropImageH } = this.data
    const maxSize = Math.min(cropImageW, cropImageH)
    const newSize = Math.max(60, Math.min(this._resizeStartSize + delta, maxSize))
    this.setData({ cropBoxSize: newSize })
  },

  onResizeEnd() {
    this._resizeStartSize = null
  },

  confirmCrop() {
    const that = this
    const cropX = this.data.cropX || 0
    const cropY = this.data.cropY || 0
    const { cropImageSrc, cropBoxSize } = this.data
    const card = this.data.card
    if (!card) {
      this.setData({ cropDialogVisible: false })
      return
    }

    const screenWidth = wx.getSystemInfoSync().windowWidth

    // 使用 canvas 裁剪
    wx.getImageInfo({
      src: cropImageSrc,
      success(info) {
        const imgW = info.width
        // 图片在弹窗中的显示尺寸
        const dialogWidth = screenWidth * 0.85
        const contentWidth = dialogWidth - 28 * 2 * (screenWidth / 750)
        const displayW = contentWidth
        // 裁剪框在原始图片上的坐标
        const ratio = imgW / displayW
        const sx = cropX * ratio
        const sy = cropY * ratio
        const sw = cropBoxSize * ratio
        const sh = cropBoxSize * ratio

        const ctx = wx.createCanvasContext('cropCanvas', that)
        const canvasSize = 300  // 输出头像尺寸
        ctx.drawImage(cropImageSrc, sx, sy, sw, sh, 0, 0, canvasSize, canvasSize)
        ctx.draw(false, () => {
          wx.canvasToTempFilePath({
            canvasId: 'cropCanvas',
            x: 0,
            y: 0,
            width: canvasSize,
            height: canvasSize,
            destWidth: canvasSize,
            destHeight: canvasSize,
            success(res2) {
              card.avatar = res2.tempFilePath
              that.setData({ card, cropDialogVisible: false })
              store.updateCardAvatar(card.id, res2.tempFilePath)
            },
            fail(err) {
              console.error('[card-detail] canvasToTempFilePath 失败:', err)
              card.avatar = cropImageSrc
              that.setData({ card, cropDialogVisible: false })
              store.updateCardAvatar(card.id, cropImageSrc)
            }
          }, that)
        })
      },
      fail() {
        card.avatar = cropImageSrc
        that.setData({ card, cropDialogVisible: false })
        store.updateCardAvatar(card.id, cropImageSrc)
      }
    })
  },

  // ===== 技能编辑 =====
  toggleSkillEdit() {
    if (this.data.cocSkillMode === 'simple') return // 简单模式不可用
    this.setData({ cocSkillEditing: !this.data.cocSkillEditing })
  },

  /** 技能编辑 - 成长值变化 */
  onSkillGrowthInput(e) {
    const { col, idx } = e.currentTarget.dataset
    const arrKey = col === 'left' ? 'cocSkillLeft' : 'cocSkillRight'
    const list = this.data[arrKey]
    const item = list[idx]
    if (!item) return
    const val = parseInt(e.detail.value) || 0
    item.growth = val
    item.changed = true
    const update = {}
    update[arrKey] = list
    this.setData(update)
  },

  /** 技能编辑 - 职业值变化 */
  onSkillOccInput(e) {
    const { col, idx } = e.currentTarget.dataset
    const arrKey = col === 'left' ? 'cocSkillLeft' : 'cocSkillRight'
    const list = this.data[arrKey]
    const item = list[idx]
    if (!item) return
    const val = parseInt(e.detail.value) || 0
    item.occ = val
    item.changed = true
    const update = {}
    update[arrKey] = list
    this.setData(update)
  },

  /** 技能编辑 - 兴趣值变化 */
  onSkillIntInput(e) {
    const { col, idx } = e.currentTarget.dataset
    const arrKey = col === 'left' ? 'cocSkillLeft' : 'cocSkillRight'
    const list = this.data[arrKey]
    const item = list[idx]
    if (!item) return
    const val = parseInt(e.detail.value) || 0
    item.int = val
    item.changed = true
    const update = {}
    update[arrKey] = list
    this.setData(update)
  },

  /** 技能编辑 - 成功率变化 */
  onSkillCurrentInput(e) {
    const { col, idx } = e.currentTarget.dataset
    const arrKey = col === 'left' ? 'cocSkillLeft' : 'cocSkillRight'
    const list = this.data[arrKey]
    const item = list[idx]
    if (!item) return
    const val = parseInt(e.detail.value) || 0
    item.current = val
    item.changed = val !== (item.base || 0)
    const changed = item.changed
    item.color = changed && val >= 50 ? '#f59e0b' : (changed ? '#22c55e' : '#94a3b8')
    const update = {}
    update[arrKey] = list
    this.setData(update)
  },

  /** 应用技能编辑 */
  applySkillEdit() {
    const fd = { ...this.data.card.formData }
    const allSkills = [...this.data.cocSkillLeft, ...this.data.cocSkillRight]
    for (const s of allSkills) {
      if (s.key && s.changed) {
        fd[s.key] = s.current
        fd[s.key + '_growth'] = s.growth || 0
        fd[s.key + '_occ'] = s.occ || 0
        fd[s.key + '_int'] = s.int || 0
      }
    }
    store.updateCardFormData(this.cardId, fd)
    this.setData({ cocSkillEditing: false })
    this.loadCard()
  },

  // ===== 基础属性编辑 =====
  startEditBasicInfo() {
    if (!this.guardLogin()) return
    const fd = this.data.card.formData || {}
    this.setData({
      editingBasicInfo: true,
      editBasicInfo: {
        name: fd.name || '',
        occupation: fd.occupation || '',
        player: fd.player || this.data.card.player || '',
        age: fd.age || '',
        gender: fd.gender || '',
        year: fd.year || '1920s',
        residence: fd.residence || '',
      }
    })
  },

  onEditBasicInput(e) {
    const { field } = e.currentTarget.dataset
    const edit = { ...this.data.editBasicInfo }
    edit[field] = e.detail.value
    this.setData({ editBasicInfo: edit })
  },

  cancelEditBasicInfo() {
    this.setData({ editingBasicInfo: false })
  },

  applyEditBasicInfo() {
    const fd = { ...this.data.card.formData }
    const edit = this.data.editBasicInfo
    fd.name = edit.name
    fd.occupation = edit.occupation
    fd.player = edit.player
    fd.age = edit.age
    fd.gender = edit.gender
    fd.year = edit.year
    fd.residence = edit.residence
    store.updateCardFormData(this.cardId, fd)
    // 同步顶层 card.name / card.player
    this.data.card.name = edit.name
    this.data.card.player = edit.player
    this.setData({ editingBasicInfo: false })
    this.loadCard()
  },

  // ===== 基础属性编辑 =====
  startEditAttrs() {
    if (!this.guardLogin()) return
    const fd = this.data.card.formData || {}
    this.setData({
      editingAttrs: true,
      editAttrs: {
        str: fd.str ?? 50,
        dex: fd.dex ?? 50,
        pow: fd.pow ?? 50,
        con: fd.con ?? 50,
        app: fd.app ?? 50,
        edu: fd.edu ?? 80,
        siz: fd.siz ?? 50,
        int: fd.int ?? 75,
        luck: fd.luck ?? 50,
      }
    })
  },

  onEditAttrInput(e) {
    const { field } = e.currentTarget.dataset
    const edit = { ...this.data.editAttrs }
    edit[field] = parseInt(e.detail.value) || 0
    this.setData({ editAttrs: edit })
  },

  cancelEditAttrs() {
    this.setData({ editingAttrs: false })
  },

  applyEditAttrs() {
    const fd = { ...this.data.card.formData }
    const edit = this.data.editAttrs
    fd.str = edit.str
    fd.dex = edit.dex
    fd.pow = edit.pow
    fd.con = edit.con
    fd.app = edit.app
    fd.edu = edit.edu
    fd.siz = edit.siz
    fd.int = edit.int
    fd.luck = edit.luck
    // 重新计算派生值
    fd.hp = Math.floor((edit.con + edit.siz) / 10)
    fd.hpMax = fd.hp
    fd.mp = Math.floor(edit.pow / 5)
    fd.mpMax = fd.mp
    fd.san = edit.pow
    fd.sanMax = edit.pow
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingAttrs: false })
    this.loadCard()
  },

  // ===== 当前状态编辑 =====
  startEditStatus() {
    if (!this.guardLogin()) return
    const fd = this.data.card.formData || {}
    this.setData({
      editingStatus: true,
      editStatus: {
        hp: fd.hp ?? 0,
        hpMax: fd.hpMax ?? 0,
        san: fd.san ?? 0,
        sanMax: fd.sanMax ?? 0,
        mp: fd.mp ?? 0,
        mpMax: fd.mpMax ?? 0,
        ac: fd.ac ?? 0,
      }
    })
  },

  onEditStatusInput(e) {
    const { field } = e.currentTarget.dataset
    const edit = { ...this.data.editStatus }
    edit[field] = parseInt(e.detail.value) || 0
    this.setData({ editStatus: edit })
  },

  cancelEditStatus() {
    this.setData({ editingStatus: false })
  },

  /** 状态快速增减 */
  onStatIncrement(e) {
    this.adjustStat(e.currentTarget.dataset.field, 1)
  },

  onStatDecrement(e) {
    this.adjustStat(e.currentTarget.dataset.field, -1)
  },

  adjustStat(field, delta) {
    const fd = { ...this.data.card.formData }
    const current = fd[field] ?? 0
    const newVal = Math.max(0, current + delta)
    fd[field] = newVal
    store.updateCardFormData(this.cardId, fd)
    this.loadCard()
  },

  applyEditStatus() {
    const fd = { ...this.data.card.formData }
    const edit = this.data.editStatus
    fd.hp = edit.hp
    fd.hpMax = edit.hpMax
    fd.san = edit.san
    fd.sanMax = edit.sanMax
    fd.mp = edit.mp
    fd.mpMax = edit.mpMax
    fd.ac = edit.ac
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingStatus: false })
    this.loadCard()
  },

  // ===== 背景故事 =====

  /** 点击条目行 → 直接弹出弹窗 */
  onBackstoryEntryTap(e) {
    if (this._copyLocked) return
    const { key, label } = e.currentTarget.dataset
    const fd = this.data.card.formData || {}
    this.setData({
      backstoryDialogVisible: true,
      backstoryDialogTitle: label,
      backstoryDialogContent: fd[key] || '',
      backstoryDialogKey: key,
      backstoryDialogEditing: false,
      backstoryIsDetail: false,
    })
  },

  /** 点击详细故事预览 → 弹出放大弹窗 */
  onBackstoryDetailPreview() {
    if (this._copyLocked) return
    const fd = this.data.card.formData || {}
    this.setData({
      backstoryDialogVisible: true,
      backstoryDialogTitle: '详细故事',
      backstoryDialogContent: fd.backstory_detail || '',
      backstoryDialogKey: 'backstory_detail',
      backstoryDialogEditing: false,
      backstoryIsDetail: true,
    })
  },

  /** 关闭弹窗 */
  closeBackstoryDialog() {
    this.setData({ backstoryDialogVisible: false })
  },

  /** 弹窗内进入编辑模式 */
  startBackstoryEdit() {
    this.setData({ backstoryDialogEditing: true })
  },

  /** 弹窗内取消编辑 */
  cancelBackstoryEdit() {
    const fd = this.data.card.formData || {}
    this.setData({
      backstoryDialogEditing: false,
      backstoryDialogContent: fd[this.data.backstoryDialogKey] || '',
    })
  },

  /** 弹窗内文本输入 */
  onBackstoryDialogInput(e) {
    this.setData({ backstoryDialogContent: e.detail.value })
  },

  /** 弹窗内保存编辑 */
  applyBackstoryEdit() {
    const fd = { ...this.data.card.formData }
    fd[this.data.backstoryDialogKey] = this.data.backstoryDialogContent
    store.updateCardFormData(this.cardId, fd)
    this.setData({ backstoryDialogVisible: false, backstoryDialogEditing: false })
    wx.showToast({ title: '已保存', icon: 'success' })
    this.loadCard()
  },

  /** 长按背景故事条目 → 复制内容 */
  onCopyBackstoryEntry(e) {
    const { key } = e.currentTarget.dataset
    const fd = this.data.card.formData || {}
    const text = fd[key] || ''
    if (!text) return
    wx.setClipboardData({ data: text })
    this._copyLocked = true
    setTimeout(() => { this._copyLocked = false }, 300)
  },

  /** 长按详细故事 → 复制内容 */
  onCopyBackstoryDetail() {
    const fd = this.data.card.formData || {}
    const text = fd.backstory_detail || ''
    if (!text) return
    wx.setClipboardData({ data: text })
    this._copyLocked = true
    setTimeout(() => { this._copyLocked = false }, 300)
  },

  // ===== 背包 =====

  /** 点击背包预览 → 弹出弹窗 */
  onBackpackPreview() {
    if (this._copyLocked) return
    const fd = this.data.card.formData || {}
    this.setData({
      backpackDialogVisible: true,
      backpackDialogContent: fd.backpack || '',
      backpackDialogEditing: false,
    })
  },

  /** 关闭背包弹窗 */
  closeBackpackDialog() {
    this.setData({ backpackDialogVisible: false })
  },

  /** 背包弹窗内进入编辑模式 */
  startBackpackEdit() {
    this.setData({ backpackDialogEditing: true })
  },

  /** 背包弹窗内取消编辑 */
  cancelBackpackEdit() {
    const fd = this.data.card.formData || {}
    this.setData({
      backpackDialogEditing: false,
      backpackDialogContent: fd.backpack || '',
    })
  },

  /** 背包弹窗内文本输入 */
  onBackpackDialogInput(e) {
    this.setData({ backpackDialogContent: e.detail.value })
  },

  /** 背包弹窗内保存编辑 */
  applyBackpackEdit() {
    const fd = { ...this.data.card.formData }
    fd.backpack = this.data.backpackDialogContent
    store.updateCardFormData(this.cardId, fd)
    this.setData({ backpackDialogVisible: false, backpackDialogEditing: false })
    wx.showToast({ title: '已保存', icon: 'success' })
    this.loadCard()
  },

  /** 长按背包 → 复制内容 */
  onCopyBackpack() {
    const fd = this.data.card.formData || {}
    const text = fd.backpack || ''
    if (!text) return
    wx.setClipboardData({ data: text })
    this._copyLocked = true
    setTimeout(() => { this._copyLocked = false }, 300)
  },

  // ===== 背包（DND财富） =====

  /** 开始编辑财富 */
  startEditWealth() {
    this.setData({ editingWealth: true })
  },

  /** 取消编辑财富 */
  cancelEditWealth() {
    const card = this.data.card
    const fd = card.formData || {}
    const editWealth = {}
    ;['pp','ep','gp','sp','cp'].forEach(k => { editWealth[k] = parseInt(fd['wealth_' + k]) || 0 })
    const raw = editWealth.pp * 100 + editWealth.ep * 10 + editWealth.gp * 1 + editWealth.sp * 0.1 + editWealth.cp * 0.01
    const wealthTotalGP = Math.round(raw * 100) / 100
    this.setData({ editingWealth: false, editWealth, wealthTotalGP })
  },

  /** 财富输入 */
  onWealthInput(e) {
    const field = e.currentTarget.dataset.field
    const val = parseInt(e.detail.value) || 0
    const editWealth = { ...this.data.editWealth, [field]: val }
    const raw = editWealth.pp * 100 + editWealth.ep * 10 + editWealth.gp * 1 + editWealth.sp * 0.1 + editWealth.cp * 0.01
    const wealthTotalGP = Math.round(raw * 100) / 100
    this.setData({ editWealth, wealthTotalGP })
  },

  /** 保存财富编辑 */
  saveEditWealth() {
    const fd = { ...this.data.card.formData }
    const w = this.data.editWealth
    fd.wealth_pp = w.pp; fd.wealth_ep = w.ep; fd.wealth_gp = w.gp
    fd.wealth_sp = w.sp; fd.wealth_cp = w.cp
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingWealth: false })
    wx.showToast({ title: '已保存', icon: 'success' })
    this.loadCard()
  },

  // ===== 背包（DND物品） =====

  /** 点击背包物品 → 弹窗 */
  onDndBackpackTap() {
    if (this._copyLocked) return
    const content = this.data.dndBackpackContent || ''
    this.setData({
      dndBackpackDialogVisible: true,
      dndBackpackDialogContent: content,
      dndBackpackDialogEditing: false,
    })
  },

  /** 关闭 DND 背包弹窗 */
  closeDndBackpackDialog() {
    this.setData({ dndBackpackDialogVisible: false })
  },

  /** DND 背包弹窗进入编辑 */
  startDndBackpackEdit() {
    this.setData({ dndBackpackDialogEditing: true })
  },

  /** DND 背包弹窗取消编辑 */
  cancelDndBackpackEdit() {
    this.setData({
      dndBackpackDialogEditing: false,
      dndBackpackDialogContent: this.data.dndBackpackContent || '',
    })
  },

  /** DND 背包弹窗文本输入 */
  onDndBackpackDialogInput(e) {
    this.setData({ dndBackpackDialogContent: e.detail.value })
  },

  /** DND 背包弹窗保存 */
  applyDndBackpackEdit() {
    const fd = { ...this.data.card.formData }
    fd.dndBackpack = this.data.dndBackpackDialogContent
    store.updateCardFormData(this.cardId, fd)
    this.setData({ dndBackpackDialogVisible: false, dndBackpackDialogEditing: false })
    wx.showToast({ title: '已保存', icon: 'success' })
    this.loadCard()
  },

  // ===== 经历 =====

  /** 构建经历条目列表 */
  buildExperienceItems(card) {
    const fd = card.formData || {}
    const exps = fd.experiences
    if (exps && Array.isArray(exps) && exps.length > 0) {
      return exps.map((exp, i) => ({
        key: exp.key || 'exp_' + i,
        label: exp.label || '',
        value: exp.value || '',
      }))
    }
    // 默认2栏，标签留空让玩家自己填
    return [
      { key: 'exp_0', label: '', value: '' },
      { key: 'exp_1', label: '', value: '' },
    ]
  },

  /** 点击经历左列（经历模组）→ 弹出弹窗 */
  onExperienceLabelTap(e) {
    if (this._copyLocked) return
    const { key, label } = e.currentTarget.dataset
    const item = this.data.experienceItems.find(it => it.key === key)
    this.setData({
      experienceDialogVisible: true,
      experienceDialogType: 'label',
      experienceDialogTitle: '经历模组',
      experienceDialogLabel: item ? item.label : '',
      experienceDialogContent: '',
      experienceDialogKey: key,
      experienceDialogEditing: false,
    })
  },

  /** 点击经历右列（人物变化描述）→ 弹出弹窗 */
  onExperienceValueTap(e) {
    if (this._copyLocked) return
    const { key, label } = e.currentTarget.dataset
    const item = this.data.experienceItems.find(it => it.key === key)
    this.setData({
      experienceDialogVisible: true,
      experienceDialogType: 'value',
      experienceDialogTitle: '人物变化描述',
      experienceDialogLabel: '',
      experienceDialogContent: item ? item.value : '',
      experienceDialogKey: key,
      experienceDialogEditing: false,
    })
  },

  /** 长按经历条目 → 复制 */
  onCopyExperienceEntry(e) {
    const { key } = e.currentTarget.dataset
    const item = this.data.experienceItems.find(it => it.key === key)
    const text = item ? item.value : ''
    if (!text) return
    wx.setClipboardData({ data: text })
    this._copyLocked = true
    setTimeout(() => { this._copyLocked = false }, 300)
  },

  /** 新增经历条目 */
  onAddExperienceEntry() {
    const items = [...this.data.experienceItems]
    const nextIdx = items.length
    items.push({
      key: 'exp_' + nextIdx,
      label: '',
      value: '',
    })
    this.setData({ experienceItems: items })
  },

  /** 切换经历管理模式 */
  toggleExperienceManage() {
    if (this.data.experienceManaging) {
      this.cancelExperienceManage()
      return
    }
    // 进入管理模式：保存快照
    const items = this.data.experienceItems
    const snapshot = []
    for (let i = 0; i < items.length; i++) {
      snapshot.push({ key: items[i].key, label: items[i].label, value: items[i].value })
    }
    this.setData({
      experienceManaging: true,
      experienceItemsSnapshot: snapshot
    })
  },

  /** 取消经历管理 → 恢复快照 */
  cancelExperienceManage() {
    const snapshot = this.data.experienceItemsSnapshot || []
    const items = []
    for (let i = 0; i < snapshot.length; i++) {
      items.push({ key: snapshot[i].key, label: snapshot[i].label, value: snapshot[i].value })
    }
    this.setData({
      experienceManaging: false,
      experienceItems: items
    })
  },

  /** 保存经历 → 持久化到 store */
  saveExperienceManage() {
    const items = this.data.experienceItems
    const fd = { ...this.data.card.formData }
    fd.experiences = items.map(it => ({ key: it.key, label: it.label, value: it.value }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ experienceManaging: false })
  },

  /** 删除经历条目（仅本地状态） */
  onDeleteExperienceEntry(e) {
    const { key } = e.currentTarget.dataset
    const items = this.data.experienceItems.filter(it => it.key !== key)
    this.setData({ experienceItems: items })
  },

  /** 关闭经历弹窗 */
  closeExperienceDialog() {
    this.setData({ experienceDialogVisible: false })
  },

  /** 经历弹窗内进入编辑 */
  startExperienceEdit() {
    this.setData({ experienceDialogEditing: true })
  },

  /** 经历弹窗内取消编辑 */
  cancelExperienceEdit() {
    const item = this.data.experienceItems.find(it => it.key === this.data.experienceDialogKey)
    if (this.data.experienceDialogType === 'label') {
      this.setData({ experienceDialogEditing: false, experienceDialogLabel: item ? item.label : '' })
    } else {
      this.setData({ experienceDialogEditing: false, experienceDialogContent: item ? item.value : '' })
    }
  },

  /** 经历弹窗内模组名称输入 */
  onExperienceLabelInput(e) {
    this.setData({ experienceDialogLabel: e.detail.value })
  },

  /** 经历弹窗内文本输入 */
  onExperienceDialogInput(e) {
    this.setData({ experienceDialogContent: e.detail.value })
  },

  /** 经历弹窗内保存 */
  applyExperienceEdit() {
    const items = this.data.experienceItems.map(it => {
      if (it.key === this.data.experienceDialogKey) {
        if (this.data.experienceDialogType === 'label') {
          return { ...it, label: this.data.experienceDialogLabel }
        } else {
          return { ...it, value: this.data.experienceDialogContent }
        }
      }
      return it
    })
    this.setData({ experienceDialogVisible: false, experienceDialogEditing: false, experienceItems: items })
    // 持久化到 store
    const fd = { ...this.data.card.formData }
    fd.experiences = items.map(it => ({ key: it.key, label: it.label, value: it.value }))
    store.updateCardFormData(this.cardId, fd)
  },

  // === 武器模块 ===
  buildWeaponItems(card) {
    try {
      const fd = card.formData || {}
      const weapons = fd.weapons
      if (weapons && Array.isArray(weapons) && weapons.length > 0) {
        return weapons.map((w, i) => ({
          key: w.key || 'wpn_' + i,
          name: w.name || '',
          attuned: !!w.attuned,
          properties: w.properties || '',
          ability: w.ability || '',
          hitBonus: w.hitBonus || '',
          damage: w.damage || '',
          damageType: w.damageType || '',
        }))
      }
      return [
        { key: 'wpn_0', name: '', attuned: false, properties: '', ability: '', hitBonus: '', damage: '', damageType: '' },
        { key: 'wpn_1', name: '', attuned: false, properties: '', ability: '', hitBonus: '', damage: '', damageType: '' },
      ]
    } catch (err) {
      console.error('[weapon] buildWeaponItems ERROR:', err)
      return [
        { key: 'wpn_0', name: '', attuned: false, properties: '', ability: '', hitBonus: '', damage: '', damageType: '' },
        { key: 'wpn_1', name: '', attuned: false, properties: '', ability: '', hitBonus: '', damage: '', damageType: '' },
      ]
    }
  },

  startEditWeapons() {
    this.setData({
      weaponItemsSnapshot: JSON.parse(JSON.stringify(this.data.weaponItems)),
      editingWeapons: true
    })
  },

  cancelEditWeapons() {
    this.setData({
      weaponItems: JSON.parse(JSON.stringify(this.data.weaponItemsSnapshot)),
      editingWeapons: false
    })
  },

  applyEditWeapons() {
    const fd = { ...this.data.card.formData }
    fd.weapons = this.data.weaponItems.map(it => ({
      key: it.key, name: it.name, attuned: it.attuned,
      properties: it.properties, ability: it.ability,
      hitBonus: it.hitBonus, damage: it.damage, damageType: it.damageType,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingWeapons: false })
  },

  onWeaponTap(e) {
    if (this.data.editingWeapons) return
    const { key } = e.currentTarget.dataset
    const item = this.data.weaponItems.find(it => it.key === key)
    if (!item) { wx.showToast({ title: '武器未找到', icon: 'none' }); return }
    this.setData({
      weaponDialogVisible: true,
      weaponDialogEditing: false,
      weaponDialogKey: key,
      weaponDialogName: item.name,
      weaponDialogAttuned: item.attuned,
      weaponDialogProperties: item.properties,
      weaponDialogAbility: item.ability,
      weaponDialogHitBonus: item.hitBonus,
      weaponDialogDamage: item.damage,
      weaponDialogDamageType: item.damageType,
    })
  },

  onAddWeaponEntry() {
    const items = [...this.data.weaponItems]
    const nextIdx = items.length
    items.push({
      key: 'wpn_' + nextIdx,
      name: '',
      attuned: false,
      properties: '',
      ability: '',
      hitBonus: '',
      damage: '',
      damageType: '',
    })
    if (!this.data.editingWeapons) {
      const fd = { ...this.data.card.formData }
      fd.weapons = items.map(it => ({
        key: it.key, name: it.name, attuned: it.attuned,
        properties: it.properties, ability: it.ability,
        hitBonus: it.hitBonus, damage: it.damage, damageType: it.damageType,
      }))
      store.updateCardFormData(this.cardId, fd)
    }
    this.setData({ weaponItems: items })
  },

  onDeleteWeaponEntry(e) {
    const { key } = e.currentTarget.dataset
    const items = this.data.weaponItems.filter(it => it.key !== key)
    this.setData({ weaponItems: items })
  },

  onCopyWeapon(e) {
    if (this.data.editingWeapons) return
    const { key } = e.currentTarget.dataset
    const item = this.data.weaponItems.find(it => it.key === key)
    if (!item) return
    const parts = []
    if (item.name) parts.push(item.name)
    if (item.attuned) parts.push('同调')
    if (item.properties) parts.push(item.properties)
    if (item.ability) parts.push(item.ability)
    if (item.hitBonus) parts.push(item.hitBonus)
    if (item.damage) parts.push(item.damage)
    if (item.damageType) parts.push(item.damageType)
    const text = parts.join(' · ')
    if (!text) return
    wx.setClipboardData({ data: text })
  },

  closeWeaponDialog() {
    this.setData({ weaponDialogVisible: false })
  },

  startWeaponEdit() {
    this.setData({ weaponDialogEditing: true })
  },

  cancelWeaponEdit() {
    const item = this.data.weaponItems.find(it => it.key === this.data.weaponDialogKey)
    if (item) {
      this.setData({
        weaponDialogEditing: false,
        weaponDialogName: item.name,
        weaponDialogAttuned: item.attuned,
        weaponDialogProperties: item.properties,
        weaponDialogAbility: item.ability,
        weaponDialogHitBonus: item.hitBonus,
        weaponDialogDamage: item.damage,
        weaponDialogDamageType: item.damageType,
      })
    } else {
      this.setData({ weaponDialogEditing: false })
    }
  },

  applyWeaponEdit() {
    const items = this.data.weaponItems.map(it => {
      if (it.key === this.data.weaponDialogKey) {
        return {
          ...it,
          name: this.data.weaponDialogName,
          attuned: this.data.weaponDialogAttuned,
          properties: this.data.weaponDialogProperties,
          ability: this.data.weaponDialogAbility,
          hitBonus: this.data.weaponDialogHitBonus,
          damage: this.data.weaponDialogDamage,
          damageType: this.data.weaponDialogDamageType,
        }
      }
      return it
    })
    const fd = { ...this.data.card.formData }
    fd.weapons = items.map(it => ({
      key: it.key, name: it.name, attuned: it.attuned,
      properties: it.properties, ability: it.ability,
      hitBonus: it.hitBonus, damage: it.damage, damageType: it.damageType,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ weaponDialogVisible: false, weaponDialogEditing: false, weaponItems: items })
  },

  onWeaponDialogInput(e) {
    const field = e.currentTarget.dataset.field
    const key = 'weaponDialog' + field.charAt(0).toUpperCase() + field.slice(1)
    this.setData({ [key]: e.detail.value })
  },

  onWeaponAttuneToggle() {
    if (!this.data.weaponDialogEditing) return
    this.setData({ weaponDialogAttuned: !this.data.weaponDialogAttuned })
  },

  onWeaponAttuneDirect(e) {
    if (this.data.editingWeapons) return
    const { key } = e.currentTarget.dataset
    const items = this.data.weaponItems.map(it => {
      if (it.key === key) return { ...it, attuned: !it.attuned }
      return it
    })
    const fd = { ...this.data.card.formData }
    fd.weapons = items.map(it => ({
      key: it.key, name: it.name, attuned: it.attuned,
      properties: it.properties, ability: it.ability,
      hitBonus: it.hitBonus, damage: it.damage, damageType: it.damageType,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ weaponItems: items })
  },

  onDeleteWeaponFromDialog() {
    const key = this.data.weaponDialogKey
    const items = this.data.weaponItems.filter(it => it.key !== key)
    const fd = { ...this.data.card.formData }
    fd.weapons = items.map(it => ({
      key: it.key, name: it.name, attuned: it.attuned,
      properties: it.properties, ability: it.ability,
      hitBonus: it.hitBonus, damage: it.damage, damageType: it.damageType,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ weaponDialogVisible: false, weaponItems: items })
  },

  // === 装备模块 ===
  buildEquipmentItems(card) {
    try {
      const fd = card.formData || {}
      const equipment = fd.equipment
      if (equipment && Array.isArray(equipment) && equipment.length > 0) {
        return equipment.map((eq, i) => ({
          key: eq.key || 'equip_' + i,
          name: eq.name || '',
          attuned: !!eq.attuned,
          properties: eq.properties || '',
          weight: eq.weight || '',
          slot: eq.slot || '',
        }))
      }
      return [
        { key: 'equip_0', name: '', attuned: false, properties: '', weight: '', slot: '' },
        { key: 'equip_1', name: '', attuned: false, properties: '', weight: '', slot: '' },
      ]
    } catch (err) {
      console.error('[equipment] buildEquipmentItems ERROR:', err)
      return [
        { key: 'equip_0', name: '', attuned: false, properties: '', weight: '', slot: '' },
        { key: 'equip_1', name: '', attuned: false, properties: '', weight: '', slot: '' },
      ]
    }
  },

  startEditEquipment() {
    this.setData({
      equipmentItemsSnapshot: JSON.parse(JSON.stringify(this.data.equipmentItems)),
      editingEquipment: true
    })
  },

  cancelEditEquipment() {
    this.setData({
      equipmentItems: JSON.parse(JSON.stringify(this.data.equipmentItemsSnapshot)),
      editingEquipment: false
    })
  },

  applyEditEquipment() {
    const fd = { ...this.data.card.formData }
    fd.equipment = this.data.equipmentItems.map(it => ({
      key: it.key, name: it.name, attuned: it.attuned,
      properties: it.properties, weight: it.weight, slot: it.slot,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingEquipment: false })
  },

  onEquipmentTap(e) {
    if (this.data.editingEquipment) return
    const { key } = e.currentTarget.dataset
    const item = this.data.equipmentItems.find(it => it.key === key)
    if (!item) { wx.showToast({ title: '装备未找到', icon: 'none' }); return }
    this.setData({
      equipmentDialogVisible: true,
      equipmentDialogEditing: false,
      equipmentDialogKey: key,
      equipmentDialogName: item.name,
      equipmentDialogAttuned: item.attuned,
      equipmentDialogProperties: item.properties,
      equipmentDialogWeight: item.weight,
      equipmentDialogSlot: item.slot,
    })
  },

  onAddEquipmentEntry() {
    const items = [...this.data.equipmentItems]
    const nextIdx = items.length
    items.push({
      key: 'equip_' + nextIdx,
      name: '',
      attuned: false,
      properties: '',
      weight: '',
      slot: '',
    })
    if (!this.data.editingEquipment) {
      const fd = { ...this.data.card.formData }
      fd.equipment = items.map(it => ({
        key: it.key, name: it.name, attuned: it.attuned,
        properties: it.properties, weight: it.weight, slot: it.slot,
      }))
      store.updateCardFormData(this.cardId, fd)
    }
    this.setData({ equipmentItems: items })
  },

  onDeleteEquipmentEntry(e) {
    const { key } = e.currentTarget.dataset
    const items = this.data.equipmentItems.filter(it => it.key !== key)
    this.setData({ equipmentItems: items })
  },

  onCopyEquipment(e) {
    if (this.data.editingEquipment) return
    const { key } = e.currentTarget.dataset
    const item = this.data.equipmentItems.find(it => it.key === key)
    if (!item) return
    const parts = []
    if (item.name) parts.push(item.name)
    if (item.attuned) parts.push('同调')
    if (item.properties) parts.push(item.properties)
    if (item.weight) parts.push(item.weight)
    if (item.slot) parts.push(item.slot)
    const text = parts.join(' · ')
    if (!text) return
    wx.setClipboardData({ data: text })
  },

  closeEquipmentDialog() {
    this.setData({ equipmentDialogVisible: false })
  },

  startEquipmentEdit() {
    this.setData({ equipmentDialogEditing: true })
  },

  cancelEquipmentEdit() {
    const item = this.data.equipmentItems.find(it => it.key === this.data.equipmentDialogKey)
    if (item) {
      this.setData({
        equipmentDialogEditing: false,
        equipmentDialogName: item.name,
        equipmentDialogAttuned: item.attuned,
        equipmentDialogProperties: item.properties,
        equipmentDialogWeight: item.weight,
        equipmentDialogSlot: item.slot,
      })
    } else {
      this.setData({ equipmentDialogEditing: false })
    }
  },

  applyEquipmentEdit() {
    const items = this.data.equipmentItems.map(it => {
      if (it.key === this.data.equipmentDialogKey) {
        return {
          ...it,
          name: this.data.equipmentDialogName,
          attuned: this.data.equipmentDialogAttuned,
          properties: this.data.equipmentDialogProperties,
          weight: this.data.equipmentDialogWeight,
          slot: this.data.equipmentDialogSlot,
        }
      }
      return it
    })
    const fd = { ...this.data.card.formData }
    fd.equipment = items.map(it => ({
      key: it.key, name: it.name, attuned: it.attuned,
      properties: it.properties, weight: it.weight, slot: it.slot,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ equipmentDialogVisible: false, equipmentDialogEditing: false, equipmentItems: items })
  },

  onEquipmentDialogInput(e) {
    const field = e.currentTarget.dataset.field
    const key = 'equipmentDialog' + field.charAt(0).toUpperCase() + field.slice(1)
    this.setData({ [key]: e.detail.value })
  },

  onEquipmentAttuneToggle() {
    if (!this.data.equipmentDialogEditing) return
    this.setData({ equipmentDialogAttuned: !this.data.equipmentDialogAttuned })
  },

  onEquipmentAttuneDirect(e) {
    if (this.data.editingEquipment) return
    const { key } = e.currentTarget.dataset
    const items = this.data.equipmentItems.map(it => {
      if (it.key === key) return { ...it, attuned: !it.attuned }
      return it
    })
    const fd = { ...this.data.card.formData }
    fd.equipment = items.map(it => ({
      key: it.key, name: it.name, attuned: it.attuned,
      properties: it.properties, weight: it.weight, slot: it.slot,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ equipmentItems: items })
  },

  onDeleteEquipmentFromDialog() {
    const key = this.data.equipmentDialogKey
    const items = this.data.equipmentItems.filter(it => it.key !== key)
    const fd = { ...this.data.card.formData }
    fd.equipment = items.map(it => ({
      key: it.key, name: it.name, attuned: it.attuned,
      properties: it.properties, weight: it.weight, slot: it.slot,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ equipmentDialogVisible: false, equipmentItems: items })
  },

  // ===== 登录守卫 =====
  guardLogin() {
    if (!store.isLoggedIn()) {
      this.setData({
        loginDialogVisible: true,
        loginName: '',
        loginPassword: '',
        isRegisterMode: true
      })
      return false
    }
    return true
  },

  onLoginNameInput(e) {
    console.log('[card-detail] onLoginNameInput value:', e.detail.value)
    this.setData({ loginName: e.detail.value })
  },

  onLoginNameBlur(e) {
    var name = (e.detail.value || '').trim()
    console.log('[card-detail] onLoginNameBlur value:', name)
    this.setData({ loginName: name })
    if (!name) return
    var that = this
    store.cloudCheckAccount(name).then(function (res) {
      console.log('[card-detail] cloudCheckAccount result:', res)
      that.setData({ isRegisterMode: !res.exists })
    })
  },

  onLoginPasswordInput(e) {
    this.setData({ loginPassword: e.detail.value })
  },

  onLoginInviteInput(e) {
    this.setData({ loginInviteCode: e.detail.value })
  },

  toggleLoginMode() {
    this.setData({
      isRegisterMode: !this.data.isRegisterMode,
      loginPassword: '',
      loginInviteCode: ''
    })
  },

  doLoginSubmit() {
    console.log('[card-detail] doLoginSubmit loginName:', this.data.loginName, 'loginPassword:', this.data.loginPassword ? '***' : '')
    var action = this.data.isRegisterMode ? 'register' : 'login'
    var name = this.data.loginName.trim()
    var password = this.data.loginPassword
    var inviteCode = (this.data.loginInviteCode || '').trim()

    if (!name) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }
    if (!password || password.length < 4) {
      wx.showToast({ title: '密码至少4位', icon: 'none' })
      return
    }
    if (action === 'register' && !inviteCode) {
      wx.showToast({ title: '请输入邀请码', icon: 'none' })
      return
    }

    wx.showLoading({ title: '登录中...' })
    var passwordHash = sha256(password)
    var that = this
    store.cloudLogin(action, name, passwordHash, inviteCode).then(function (res) {
      wx.hideLoading()
      if (res.success) {
        that.setData({ loginDialogVisible: false, loginName: '', loginPassword: '', loginInviteCode: '' })
        wx.showToast({ title: action === 'register' ? '注册成功' : '登录成功', icon: 'success' })
      } else {
        wx.showToast({ title: res.errMsg || '登录失败', icon: 'none' })
      }
    })
  },

  cancelLoginDialog() {
    this.setData({ loginDialogVisible: false, loginName: '', loginPassword: '', loginInviteCode: '' })
  },

  stopPropagation() {},

  // === 法术模块 ===
  buildSpellItems(card) {
    try {
      const fd = card.formData || {}
      const spells = fd.spells
      if (spells && Array.isArray(spells) && spells.length > 0) {
        return spells.map((s, i) => {
          const key = s.key || 'spell_' + i
          return {
            key,
            name: s.name || '',
            attackBonus: s.attackBonus || '',
            damage: s.damage || '',
            damageType: s.damageType || '',
            ability: s.ability || '',
            ritual: !!s.ritual,
            verbal: !!s.verbal,
            somatic: !!s.somatic,
            material: !!s.material,
            level: s.level || '',
            school: s.school || '',
            castingTime: s.castingTime || '',
            range: s.range || '',
            duration: s.duration || '',
            effect: s.effect || '',
            materials: s.materials || '',
          }
        })
      }
      return []
    } catch (err) {
      console.error('[spell] buildSpellItems ERROR:', err)
      return []
    }
  },

  startEditSpells() {
    this.setData({
      spellItemsSnapshot: JSON.parse(JSON.stringify(this.data.spellItems)),
      editingSpells: true
    })
  },

  cancelEditSpells() {
    this.setData({
      spellItems: JSON.parse(JSON.stringify(this.data.spellItemsSnapshot)),
      editingSpells: false
    })
  },

  applyEditSpells() {
    const fd = { ...this.data.card.formData }
    fd.spells = this.data.spellItems.map(it => ({
      key: it.key, name: it.name, attackBonus: it.attackBonus,
      damage: it.damage, damageType: it.damageType, ability: it.ability,
      ritual: it.ritual || false,
      verbal: it.verbal || false,
      somatic: it.somatic || false,
      material: it.material || false,
      level: it.level, school: it.school, castingTime: it.castingTime,
      range: it.range, duration: it.duration, effect: it.effect, materials: it.materials,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingSpells: false })
  },

  onSpellTap(e) {
    if (this.data.editingSpells) return
    const { key } = e.currentTarget.dataset
    const item = this.data.spellItems.find(it => it.key === key)
    if (!item) { wx.showToast({ title: '法术未找到', icon: 'none' }); return }
    this.setData({
      spellDialogVisible: true,
      spellDialogEditing: false,
      spellDialogKey: key,
      spellDialogName: item.name,
      spellDialogAttackBonus: item.attackBonus,
      spellDialogDamage: item.damage,
      spellDialogDamageType: item.damageType,
      spellDialogAbility: item.ability,
      spellDialogRitual: item.ritual || false,
      spellDialogVerbal: item.verbal || false,
      spellDialogSomatic: item.somatic || false,
      spellDialogMaterial: item.material || false,
      spellDialogLevel: item.level,
      spellDialogSchool: item.school,
      spellDialogCastingTime: item.castingTime,
      spellDialogRange: item.range,
      spellDialogDuration: item.duration,
      spellDialogEffect: item.effect,
      spellDialogMaterials: item.materials,
    })
  },

  onAddSpellEntry() {
    const items = [...this.data.spellItems]
    const nextIdx = items.length
    const newKey = 'spell_' + nextIdx
    items.push({
      key: newKey,
      name: '', attackBonus: '', damage: '', damageType: '', ability: '',
      ritual: false, verbal: false, somatic: false, material: false,
      level: '', school: '', castingTime: '', range: '', duration: '',
      effect: '', materials: '',
    })
    if (!this.data.editingSpells) {
      const fd = { ...this.data.card.formData }
      fd.spells = items.map(it => ({
        key: it.key, name: it.name, attackBonus: it.attackBonus,
        damage: it.damage, damageType: it.damageType, ability: it.ability,
        ritual: it.ritual || false,
        verbal: it.verbal || false,
        somatic: it.somatic || false,
        material: it.material || false,
        level: it.level, school: it.school, castingTime: it.castingTime,
        range: it.range, duration: it.duration, effect: it.effect, materials: it.materials,
      }))
      store.updateCardFormData(this.cardId, fd)
    }
    this.setData({ spellItems: items })
  },

  onDeleteSpellEntry(e) {
    const { key } = e.currentTarget.dataset
    const items = this.data.spellItems.filter(it => it.key !== key)
    this.setData({ spellItems: items })
  },

  onCopySpell(e) {
    if (this.data.editingSpells) return
    const { key } = e.currentTarget.dataset
    const item = this.data.spellItems.find(it => it.key === key)
    if (!item) return
    const parts = []
    if (item.name) parts.push(item.name)
    if (item.level) parts.push(item.level + '环')
    if (item.school) parts.push(item.school)
    const text = parts.join(' · ')
    if (!text) return
    wx.setClipboardData({ data: text })
  },

  closeSpellDialog() {
    this.setData({ spellDialogVisible: false })
  },

  startSpellEdit() {
    this.setData({ spellDialogEditing: true })
  },

  cancelSpellEdit() {
    const key = this.data.spellDialogKey
    const item = this.data.spellItems.find(it => it.key === key)
    if (item) {
      this.setData({
        spellDialogEditing: false,
        spellDialogName: item.name,
        spellDialogAttackBonus: item.attackBonus,
        spellDialogDamage: item.damage,
        spellDialogDamageType: item.damageType,
        spellDialogAbility: item.ability,
        spellDialogRitual: item.ritual || false,
        spellDialogVerbal: item.verbal || false,
        spellDialogSomatic: item.somatic || false,
        spellDialogMaterial: item.material || false,
        spellDialogLevel: item.level,
        spellDialogSchool: item.school,
        spellDialogCastingTime: item.castingTime,
        spellDialogRange: item.range,
        spellDialogDuration: item.duration,
        spellDialogEffect: item.effect,
        spellDialogMaterials: item.materials,
      })
    } else {
      this.setData({ spellDialogEditing: false })
    }
  },

  applySpellEdit() {
    const key = this.data.spellDialogKey
    const items = this.data.spellItems.map(it => {
      if (it.key === key) {
        return {
          ...it,
          name: this.data.spellDialogName,
          attackBonus: this.data.spellDialogAttackBonus,
          damage: this.data.spellDialogDamage,
          damageType: this.data.spellDialogDamageType,
          ability: this.data.spellDialogAbility,
          ritual: this.data.spellDialogRitual,
          verbal: this.data.spellDialogVerbal,
          somatic: this.data.spellDialogSomatic,
          material: this.data.spellDialogMaterial,
          level: this.data.spellDialogLevel,
          school: this.data.spellDialogSchool,
          castingTime: this.data.spellDialogCastingTime,
          range: this.data.spellDialogRange,
          duration: this.data.spellDialogDuration,
          effect: this.data.spellDialogEffect,
          materials: this.data.spellDialogMaterials,
        }
      }
      return it
    })
    const fd = { ...this.data.card.formData }
    fd.spells = items.map(it => ({
      key: it.key, name: it.name, attackBonus: it.attackBonus,
      damage: it.damage, damageType: it.damageType, ability: it.ability,
      ritual: it.ritual || false,
      verbal: it.verbal || false,
      somatic: it.somatic || false,
      material: it.material || false,
      level: it.level, school: it.school, castingTime: it.castingTime,
      range: it.range, duration: it.duration, effect: it.effect, materials: it.materials,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ spellDialogVisible: false, spellDialogEditing: false, spellItems: items })
  },

  onSpellDialogInput(e) {
    const field = e.currentTarget.dataset.field
    const key = 'spellDialog' + field.charAt(0).toUpperCase() + field.slice(1)
    this.setData({ [key]: e.detail.value })
  },

  onSpellDialogToggle(e) {
    if (!this.data.spellDialogEditing) return
    const field = e.currentTarget.dataset.field
    const key = 'spellDialog' + field.charAt(0).toUpperCase() + field.slice(1)
    this.setData({ [key]: !this.data[key] })
  },

  onSpellToggleDirect(e) {
    if (this.data.editingSpells) return
    const { key, field } = e.currentTarget.dataset
    const idx = this.data.spellItems.findIndex(it => it.key === key)
    if (idx < 0) return
    const newVal = !this.data.spellItems[idx][field]
    this.setData({ [`spellItems[${idx}].${field}`]: newVal })
    // 同步到 store：用显式 newVal 构建，不依赖 setData 后的 this.data
    const fd = { ...this.data.card.formData }
    fd.spells = this.data.spellItems.map((it, i) => ({
      key: it.key, name: it.name, attackBonus: it.attackBonus,
      damage: it.damage, damageType: it.damageType, ability: it.ability,
      ritual: (i === idx && field === 'ritual') ? newVal : (it.ritual || false),
      verbal: (i === idx && field === 'verbal') ? newVal : (it.verbal || false),
      somatic: (i === idx && field === 'somatic') ? newVal : (it.somatic || false),
      material: (i === idx && field === 'material') ? newVal : (it.material || false),
      level: it.level, school: it.school, castingTime: it.castingTime,
      range: it.range, duration: it.duration, effect: it.effect, materials: it.materials,
    }))
    setTimeout(() => {
      store.updateCardFormData(this.cardId, fd)
    }, 0)
  },

  toggleSpellDetail(e) {
    const { key } = e.currentTarget.dataset
    const collapsed = { ...this.data.spellCollapsed }
    collapsed[key] = !collapsed[key]
    this.setData({ spellCollapsed: collapsed })
  },

  onDeleteSpellFromDialog() {
    const key = this.data.spellDialogKey
    const items = this.data.spellItems.filter(it => it.key !== key)
    const fd = { ...this.data.card.formData }
    fd.spells = items.map(it => ({
      key: it.key, name: it.name, attackBonus: it.attackBonus,
      damage: it.damage, damageType: it.damageType, ability: it.ability,
      ritual: it.ritual || false,
      verbal: it.verbal || false,
      somatic: it.somatic || false,
      material: it.material || false,
      level: it.level, school: it.school, castingTime: it.castingTime,
      range: it.range, duration: it.duration, effect: it.effect, materials: it.materials,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ spellDialogVisible: false, spellItems: items })
  },

  // === 特性模块 ===
  buildClassFeatures(card) {
    try {
      const fd = card.formData || {}
      const items = fd.classFeatures
      if (items && Array.isArray(items) && items.length > 0) {
        return items.map((f, i) => ({
          key: f.key || 'cf_' + i,
          level: f.level || '',
          name: f.name || '',
          description: f.description || '',
        }))
      }
      return [
        { key: 'cf_0', level: '', name: '', description: '' },
        { key: 'cf_1', level: '', name: '', description: '' },
      ]
    } catch (err) {
      console.error('[feature] buildClassFeatures ERROR:', err)
      return [{ key: 'cf_0', level: '', name: '', description: '' }, { key: 'cf_1', level: '', name: '', description: '' }]
    }
  },

  buildRaceFeatures(card) {
    try {
      const fd = card.formData || {}
      const items = fd.raceFeatures
      if (items && Array.isArray(items) && items.length > 0) {
        return items.map((f, i) => ({
          key: f.key || 'rf_' + i,
          name: f.name || '',
          description: f.description || '',
        }))
      }
      return [
        { key: 'rf_0', name: '', description: '' },
        { key: 'rf_1', name: '', description: '' },
      ]
    } catch (err) {
      console.error('[feature] buildRaceFeatures ERROR:', err)
      return [{ key: 'rf_0', name: '', description: '' }, { key: 'rf_1', name: '', description: '' }]
    }
  },

  buildFeats(card) {
    try {
      const fd = card.formData || {}
      const items = fd.feats
      if (items && Array.isArray(items) && items.length > 0) {
        return items.map((f, i) => ({
          key: f.key || 'ft_' + i,
          level: f.level || '',
          name: f.name || '',
          description: f.description || '',
        }))
      }
      return [
        { key: 'ft_0', level: '', name: '', description: '' },
        { key: 'ft_1', level: '', name: '', description: '' },
      ]
    } catch (err) {
      console.error('[feature] buildFeats ERROR:', err)
      return [{ key: 'ft_0', level: '', name: '', description: '' }, { key: 'ft_1', level: '', name: '', description: '' }]
    }
  },

  // 职业特性
  startEditClassFeatures() {
    this.setData({
      classFeaturesSnapshot: JSON.parse(JSON.stringify(this.data.classFeatures)),
      editingClassFeatures: true,
    })
  },

  cancelEditClassFeatures() {
    this.setData({
      classFeatures: JSON.parse(JSON.stringify(this.data.classFeaturesSnapshot)),
      editingClassFeatures: false,
    })
  },

  applyEditClassFeatures() {
    const fd = { ...this.data.card.formData }
    fd.classFeatures = this.data.classFeatures.map(it => ({
      key: it.key, level: it.level, name: it.name, description: it.description,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingClassFeatures: false })
  },

  onAddClassFeature() {
    const items = [...this.data.classFeatures]
    const nextIdx = items.length
    items.push({ key: 'cf_' + nextIdx, level: '', name: '', description: '' })
    if (!this.data.editingClassFeatures) {
      const fd = { ...this.data.card.formData }
      fd.classFeatures = items.map(it => ({ key: it.key, level: it.level, name: it.name, description: it.description }))
      store.updateCardFormData(this.cardId, fd)
    }
    this.setData({ classFeatures: items })
  },

  onDeleteClassFeature(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ classFeatures: this.data.classFeatures.filter(it => it.key !== key) })
  },

  onClassFeatureTap(e) {
    if (this.data.editingClassFeatures) return
    const { key } = e.currentTarget.dataset
    const item = this.data.classFeatures.find(it => it.key === key)
    if (!item) return
    this.setData({
      featureDialogVisible: true,
      featureDialogEditing: false,
      featureDialogKey: key,
      featureDialogType: 'classFeature',
      featureDialogLevel: item.level,
      featureDialogName: item.name,
      featureDialogDescription: item.description,
    })
  },

  onCopyClassFeature(e) {
    if (this.data.editingClassFeatures) return
    const { key } = e.currentTarget.dataset
    const item = this.data.classFeatures.find(it => it.key === key)
    if (!item) return
    const parts = []
    if (item.level) parts.push('Lv.' + item.level)
    if (item.name) parts.push(item.name)
    if (item.description) parts.push(item.description)
    const text = parts.join(' · ')
    if (!text) return
    wx.setClipboardData({ data: text })
  },

  // 种族特性
  startEditRaceFeatures() {
    this.setData({
      raceFeaturesSnapshot: JSON.parse(JSON.stringify(this.data.raceFeatures)),
      editingRaceFeatures: true,
    })
  },

  cancelEditRaceFeatures() {
    this.setData({
      raceFeatures: JSON.parse(JSON.stringify(this.data.raceFeaturesSnapshot)),
      editingRaceFeatures: false,
    })
  },

  applyEditRaceFeatures() {
    const fd = { ...this.data.card.formData }
    fd.raceFeatures = this.data.raceFeatures.map(it => ({
      key: it.key, name: it.name, description: it.description,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingRaceFeatures: false })
  },

  onAddRaceFeature() {
    const items = [...this.data.raceFeatures]
    const nextIdx = items.length
    items.push({ key: 'rf_' + nextIdx, name: '', description: '' })
    if (!this.data.editingRaceFeatures) {
      const fd = { ...this.data.card.formData }
      fd.raceFeatures = items.map(it => ({ key: it.key, name: it.name, description: it.description }))
      store.updateCardFormData(this.cardId, fd)
    }
    this.setData({ raceFeatures: items })
  },

  onDeleteRaceFeature(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ raceFeatures: this.data.raceFeatures.filter(it => it.key !== key) })
  },

  onRaceFeatureTap(e) {
    if (this.data.editingRaceFeatures) return
    const { key } = e.currentTarget.dataset
    const item = this.data.raceFeatures.find(it => it.key === key)
    if (!item) return
    this.setData({
      featureDialogVisible: true,
      featureDialogEditing: false,
      featureDialogKey: key,
      featureDialogType: 'raceFeature',
      featureDialogLevel: '',
      featureDialogName: item.name,
      featureDialogDescription: item.description,
    })
  },

  onCopyRaceFeature(e) {
    if (this.data.editingRaceFeatures) return
    const { key } = e.currentTarget.dataset
    const item = this.data.raceFeatures.find(it => it.key === key)
    if (!item) return
    const parts = []
    if (item.name) parts.push(item.name)
    if (item.description) parts.push(item.description)
    const text = parts.join(' · ')
    if (!text) return
    wx.setClipboardData({ data: text })
  },

  // 专长
  startEditFeats() {
    this.setData({
      featsSnapshot: JSON.parse(JSON.stringify(this.data.feats)),
      editingFeats: true,
    })
  },

  cancelEditFeats() {
    this.setData({
      feats: JSON.parse(JSON.stringify(this.data.featsSnapshot)),
      editingFeats: false,
    })
  },

  applyEditFeats() {
    const fd = { ...this.data.card.formData }
    fd.feats = this.data.feats.map(it => ({
      key: it.key, level: it.level, name: it.name, description: it.description,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingFeats: false })
  },

  onAddFeat() {
    const items = [...this.data.feats]
    const nextIdx = items.length
    items.push({ key: 'ft_' + nextIdx, level: '', name: '', description: '' })
    if (!this.data.editingFeats) {
      const fd = { ...this.data.card.formData }
      fd.feats = items.map(it => ({ key: it.key, level: it.level, name: it.name, description: it.description }))
      store.updateCardFormData(this.cardId, fd)
    }
    this.setData({ feats: items })
  },

  onDeleteFeat(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ feats: this.data.feats.filter(it => it.key !== key) })
  },

  onFeatTap(e) {
    if (this.data.editingFeats) return
    const { key } = e.currentTarget.dataset
    const item = this.data.feats.find(it => it.key === key)
    if (!item) return
    this.setData({
      featureDialogVisible: true,
      featureDialogEditing: false,
      featureDialogKey: key,
      featureDialogType: 'feat',
      featureDialogLevel: item.level,
      featureDialogName: item.name,
      featureDialogDescription: item.description,
    })
  },

  onCopyFeat(e) {
    if (this.data.editingFeats) return
    const { key } = e.currentTarget.dataset
    const item = this.data.feats.find(it => it.key === key)
    if (!item) return
    const parts = []
    if (item.level) parts.push('Lv.' + item.level)
    if (item.name) parts.push(item.name)
    if (item.description) parts.push(item.description)
    const text = parts.join(' · ')
    if (!text) return
    wx.setClipboardData({ data: text })
  },

  // 特性弹窗
  closeFeatureDialog() {
    this.setData({ featureDialogVisible: false })
  },

  startFeatureEdit() {
    this.setData({ featureDialogEditing: true })
  },

  cancelFeatureEdit() {
    const type = this.data.featureDialogType
    const list = type === 'classFeature' ? this.data.classFeatures : type === 'raceFeature' ? this.data.raceFeatures : this.data.feats
    const item = list.find(it => it.key === this.data.featureDialogKey)
    if (item) {
      this.setData({
        featureDialogEditing: false,
        featureDialogLevel: item.level || '',
        featureDialogName: item.name || '',
        featureDialogDescription: item.description || '',
      })
    } else {
      this.setData({ featureDialogEditing: false })
    }
  },

  saveFeature() {
    const type = this.data.featureDialogType
    const listKey = type === 'classFeature' ? 'classFeatures' : type === 'raceFeature' ? 'raceFeatures' : 'feats'
    const items = this.data[listKey].map(it => {
      if (it.key === this.data.featureDialogKey) {
        const base = { key: it.key, name: this.data.featureDialogName, description: this.data.featureDialogDescription }
        if (type !== 'raceFeature') base.level = this.data.featureDialogLevel
        return base
      }
      return it
    })
    const fd = { ...this.data.card.formData }
    fd[listKey] = items.map(it => {
      const base = { key: it.key, name: it.name, description: it.description }
      if (type !== 'raceFeature') base.level = it.level || ''
      return base
    })
    store.updateCardFormData(this.cardId, fd)
    this.setData({ featureDialogVisible: false, featureDialogEditing: false, [listKey]: items })
  },

  onFeatureDialogInput(e) {
    const { field } = e.currentTarget.dataset
    const key = 'featureDialog' + field.charAt(0).toUpperCase() + field.slice(1)
    this.setData({ [key]: e.detail.value })
  },

  onDeleteFeatureFromDialog() {
    const type = this.data.featureDialogType
    const listKey = type === 'classFeature' ? 'classFeatures' : type === 'raceFeature' ? 'raceFeatures' : 'feats'
    const key = this.data.featureDialogKey
    const items = this.data[listKey].filter(it => it.key !== key)
    const fd = { ...this.data.card.formData }
    fd[listKey] = items.map(it => {
      const base = { key: it.key, name: it.name, description: it.description }
      if (type !== 'raceFeature') base.level = it.level || ''
      return base
    })
    store.updateCardFormData(this.cardId, fd)
    this.setData({ featureDialogVisible: false, [listKey]: items })
  },

  // ============================================================
  // Daggerheart 编辑方法
  // ============================================================

  // === 属性四角星切换 ===
  onToggleDhAttrFilled(e) {
    const { key } = e.currentTarget.dataset
    const filled = { ...this.data.dhAttrFilled }
    filled[key] = !filled[key]
    this.setData({ dhAttrFilled: filled })
    const fd = { ...this.data.card.formData }
    fd.dh_attr_filled = filled
    store.updateCardFormData(this.cardId, fd)
  },

  // === 属性编辑 ===
  startEditDhAttrs() {
    const edit = {}
    this.data.dhAttributes.forEach(a => {
      edit[a.key] = a.value
    })
    this.setData({ editingDhAttrs: true, editDhAttrs: edit })
  },

  cancelEditDhAttrs() {
    this.setData({ editingDhAttrs: false, editDhAttrs: {} })
  },

  saveDhAttrs() {
    const fd = { ...this.data.card.formData }
    const edit = this.data.editDhAttrs
    Object.keys(edit).forEach(key => {
      fd['dh_' + key] = Number(edit[key]) || 0
    })
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingDhAttrs: false, editDhAttrs: {} })
    this.loadCard()
  },

  onDhAttrInput(e) {
    const { key } = e.currentTarget.dataset
    const edit = { ...this.data.editDhAttrs }
    edit[key] = Number(e.detail.value) || 0
    this.setData({ editDhAttrs: edit })
  },

  // === 当前情况编辑 ===
  startEditDhStatus() {
    this.setData({
      editingDhStatus: true,
      editDhStatus: {
        mark1HP: this.data.dhMark1HP,
        mark2HP: this.data.dhMark2HP,
        mark3HP: this.data.dhMark3HP,
        evasion: this.data.dhEvasion,
        proficiency: this.data.dhProficiency,
        armor: this.data.dhArmor,
        armorMax: this.data.dhArmorMax,
        hp: this.data.dhHP,
        hpMax: this.data.dhHPMax,
        stress: this.data.dhStress,
        stressMax: this.data.dhStressMax,
        hope: this.data.dhHope,
        hopeMax: this.data.dhHopeMax,
      }
    })
  },

  cancelEditDhStatus() {
    this.setData({ editingDhStatus: false })
  },

  saveDhStatus() {
    const fd = { ...this.data.card.formData }
    const e = this.data.editDhStatus
    fd.dh_mark1_hp = parseInt(e.mark1HP) || 0
    fd.dh_mark2_hp = parseInt(e.mark2HP) || 0
    fd.dh_mark3_hp = parseInt(e.mark3HP) || 0
    fd.dh_evasion = parseInt(e.evasion) || 0
    fd.dh_proficiency = parseInt(e.proficiency) || 0
    fd.dh_armor = parseInt(e.armor) || 0
    fd.dh_armor_max = parseInt(e.armorMax) || 0
    fd.dh_hp = parseInt(e.hp) || 0
    fd.dh_hp_max = parseInt(e.hpMax) || 0
    fd.dh_stress = parseInt(e.stress) || 0
    fd.dh_stress_max = parseInt(e.stressMax) || 0
    fd.dh_hope = parseInt(e.hope) || 0
    fd.dh_hope_max = parseInt(e.hopeMax) || 0
    // 护甲/生命/压力/希望：左侧不能超过右侧
    if (fd.dh_armor > fd.dh_armor_max) fd.dh_armor = fd.dh_armor_max
    if (fd.dh_hp > fd.dh_hp_max) fd.dh_hp = fd.dh_hp_max
    if (fd.dh_stress > fd.dh_stress_max) fd.dh_stress = fd.dh_stress_max
    if (fd.dh_hope > fd.dh_hope_max) fd.dh_hope = fd.dh_hope_max
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingDhStatus: false })
    this.loadCard()
  },

  onDhStatusInput(e) {
    const { field } = e.currentTarget.dataset
    const edit = { ...this.data.editDhStatus }
    edit[field] = parseInt(e.detail.value) || 0
    this.setData({ editDhStatus: edit })
  },

  onDhStatDelta(e) {
    const { field, delta } = e.currentTarget.dataset
    const d = parseInt(delta)
    const fd = { ...this.data.card.formData }
    const key = 'dh_' + field
    const current = fd[key] ?? 0
    let newVal = Math.max(0, current + d)
    console.log('[onDhStatDelta] field:', field, 'delta:', d, 'current:', current, 'newVal:', newVal)
    // 护甲/生命/压力/希望：左侧不能超过右侧
    const fieldsWithMax = ['armor', 'hp', 'stress', 'hope']
    if (fieldsWithMax.indexOf(field) !== -1) {
      const maxVal = fd[key + '_max'] ?? 0
      newVal = Math.min(newVal, maxVal)
    }
    fd[key] = newVal
    store.updateCardFormData(this.cardId, fd)
    this.loadCard()
  },

  // === 经历模块 ===
  startEditDhExperiences() {
    const items = this.data.dhExperiences
    const snapshot = []
    for (let i = 0; i < items.length; i++) {
      snapshot.push({ key: items[i].key, label: items[i].label, value: items[i].value })
    }
    this.setData({ editingDhExperiences: true, dhExperiencesSnapshot: snapshot })
  },

  cancelEditDhExperiences() {
    const snapshot = this.data.dhExperiencesSnapshot || []
    const items = []
    for (let i = 0; i < snapshot.length; i++) {
      items.push({ key: snapshot[i].key, label: snapshot[i].label, value: snapshot[i].value })
    }
    this.setData({ editingDhExperiences: false, dhExperiences: items })
  },

  saveDhExperiences() {
    const fd = { ...this.data.card.formData }
    fd.dh_experiences = this.data.dhExperiences.map(it => ({ key: it.key, label: it.label, value: it.value }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingDhExperiences: false })
  },

  onAddDhExperience() {
    const items = [...this.data.dhExperiences]
    const nextIdx = items.length
    items.push({ key: 'dhexp_' + nextIdx, label: '', value: 0 })
    this.setData({ dhExperiences: items })
  },

  onDeleteDhExperience(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ dhExperiences: this.data.dhExperiences.filter(it => it.key !== key) })
  },

  onDhExperienceFieldInput(e) {
    const { key, field } = e.currentTarget.dataset
    const items = this.data.dhExperiences.map(it => {
      if (it.key === key) {
        const val = field === 'value' ? (parseInt(e.detail.value) || 0) : e.detail.value
        return { ...it, [field]: val }
      }
      return it
    })
    this.setData({ dhExperiences: items })
  },

  // === 武器模块 ===
  startEditDhWeapons() {
    const items = this.data.dhWeapons
    const snapshot = []
    for (let i = 0; i < items.length; i++) {
      snapshot.push({ key: items[i].key, name: items[i].name, info: items[i].info, dice: items[i].dice, hand: items[i].hand, properties: items[i].properties })
    }
    this.setData({ editingDhWeapons: true, dhWeaponsSnapshot: snapshot })
  },

  cancelEditDhWeapons() {
    const snapshot = this.data.dhWeaponsSnapshot || []
    const items = []
    for (let i = 0; i < snapshot.length; i++) {
      items.push({ key: snapshot[i].key, name: snapshot[i].name, info: snapshot[i].info, dice: snapshot[i].dice, hand: snapshot[i].hand, properties: snapshot[i].properties })
    }
    this.setData({ editingDhWeapons: false, dhWeapons: items })
  },

  saveDhWeapons() {
    const fd = { ...this.data.card.formData }
    fd.dh_weapons = this.data.dhWeapons.map(it => ({
      key: it.key, name: it.name, info: it.info, dice: it.dice, hand: it.hand, properties: it.properties,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingDhWeapons: false })
  },

  onAddDhWeapon() {
    const items = [...this.data.dhWeapons]
    const nextIdx = items.length
    items.push({ key: 'dhwpn_' + nextIdx, name: '', info: '', dice: '', hand: '主手', properties: '' })
    this.setData({ dhWeapons: items })
  },

  onDeleteDhWeapon(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ dhWeapons: this.data.dhWeapons.filter(it => it.key !== key) })
  },

  onDhWeaponTap(e) {
    if (this.data.editingDhWeapons) return
    const { key } = e.currentTarget.dataset
    const item = this.data.dhWeapons.find(it => it.key === key)
    if (!item) return
    this.setData({
      dhWeaponDialogVisible: true,
      dhWeaponDialogEditing: false,
      dhWeaponDialogKey: key,
      dhWeaponDialogName: item.name,
      dhWeaponDialogInfo: item.info,
      dhWeaponDialogDice: item.dice,
      dhWeaponDialogHand: item.hand,
      dhWeaponDialogProperties: item.properties,
    })
  },

  closeDhWeaponDialog() {
    this.setData({ dhWeaponDialogVisible: false })
  },

  startDhWeaponEdit() {
    this.setData({ dhWeaponDialogEditing: true })
  },

  cancelDhWeaponEdit() {
    const item = this.data.dhWeapons.find(it => it.key === this.data.dhWeaponDialogKey)
    if (item) {
      this.setData({
        dhWeaponDialogEditing: false,
        dhWeaponDialogName: item.name,
        dhWeaponDialogInfo: item.info,
        dhWeaponDialogDice: item.dice,
        dhWeaponDialogHand: item.hand,
        dhWeaponDialogProperties: item.properties,
      })
    } else {
      this.setData({ dhWeaponDialogEditing: false })
    }
  },

  applyDhWeaponEdit() {
    const items = this.data.dhWeapons.map(it => {
      if (it.key === this.data.dhWeaponDialogKey) {
        return {
          ...it,
          name: this.data.dhWeaponDialogName,
          info: this.data.dhWeaponDialogInfo,
          dice: this.data.dhWeaponDialogDice,
          hand: this.data.dhWeaponDialogHand,
          properties: this.data.dhWeaponDialogProperties,
        }
      }
      return it
    })
    const fd = { ...this.data.card.formData }
    fd.dh_weapons = items.map(it => ({
      key: it.key, name: it.name, info: it.info, dice: it.dice, hand: it.hand, properties: it.properties,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ dhWeaponDialogVisible: false, dhWeaponDialogEditing: false, dhWeapons: items })
  },

  onDhWeaponDialogInput(e) {
    const { field } = e.currentTarget.dataset
    const key = 'dhWeaponDialog' + field.charAt(0).toUpperCase() + field.slice(1)
    this.setData({ [key]: e.detail.value })
  },

  onDeleteDhWeaponFromDialog() {
    const key = this.data.dhWeaponDialogKey
    const items = this.data.dhWeapons.filter(it => it.key !== key)
    const fd = { ...this.data.card.formData }
    fd.dh_weapons = items.map(it => ({
      key: it.key, name: it.name, info: it.info, dice: it.dice, hand: it.hand, properties: it.properties,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ dhWeaponDialogVisible: false, dhWeapons: items })
  },

  // === 护甲模块 ===
  startEditDhArmors() {
    const items = this.data.dhArmors
    const snapshot = []
    for (let i = 0; i < items.length; i++) {
      snapshot.push({ key: items[i].key, name: items[i].name, value: items[i].value, threshold: items[i].threshold, thresholdMax: items[i].thresholdMax, properties: items[i].properties })
    }
    this.setData({ editingDhArmors: true, dhArmorsSnapshot: snapshot })
  },

  cancelEditDhArmors() {
    const snapshot = this.data.dhArmorsSnapshot || []
    const items = []
    for (let i = 0; i < snapshot.length; i++) {
      items.push({ key: snapshot[i].key, name: snapshot[i].name, value: snapshot[i].value, threshold: snapshot[i].threshold, thresholdMax: snapshot[i].thresholdMax, properties: snapshot[i].properties })
    }
    this.setData({ editingDhArmors: false, dhArmors: items })
  },

  saveDhArmors() {
    const fd = { ...this.data.card.formData }
    fd.dh_armors = this.data.dhArmors.map(it => ({
      key: it.key, name: it.name, value: it.value, threshold: it.threshold, thresholdMax: it.thresholdMax, properties: it.properties,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingDhArmors: false })
  },

  onAddDhArmor() {
    const items = [...this.data.dhArmors]
    const nextIdx = items.length
    items.push({ key: 'dharm_' + nextIdx, name: '', value: 0, threshold: 0, thresholdMax: 0, properties: '' })
    this.setData({ dhArmors: items })
  },

  onDeleteDhArmor(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ dhArmors: this.data.dhArmors.filter(it => it.key !== key) })
  },

  onDhArmorTap(e) {
    if (this.data.editingDhArmors) return
    const { key } = e.currentTarget.dataset
    const item = this.data.dhArmors.find(it => it.key === key)
    if (!item) return
    this.setData({
      dhArmorDialogVisible: true,
      dhArmorDialogEditing: false,
      dhArmorDialogKey: key,
      dhArmorDialogName: item.name,
      dhArmorDialogValue: item.value,
      dhArmorDialogThreshold: item.threshold,
      dhArmorDialogThresholdMax: item.thresholdMax,
      dhArmorDialogProperties: item.properties,
    })
  },

  closeDhArmorDialog() {
    this.setData({ dhArmorDialogVisible: false })
  },

  startDhArmorEdit() {
    this.setData({ dhArmorDialogEditing: true })
  },

  cancelDhArmorEdit() {
    const item = this.data.dhArmors.find(it => it.key === this.data.dhArmorDialogKey)
    if (item) {
      this.setData({
        dhArmorDialogEditing: false,
        dhArmorDialogName: item.name,
        dhArmorDialogValue: item.value,
        dhArmorDialogThreshold: item.threshold,
        dhArmorDialogThresholdMax: item.thresholdMax,
        dhArmorDialogProperties: item.properties,
      })
    } else {
      this.setData({ dhArmorDialogEditing: false })
    }
  },

  applyDhArmorEdit() {
    const items = this.data.dhArmors.map(it => {
      if (it.key === this.data.dhArmorDialogKey) {
        return {
          ...it,
          name: this.data.dhArmorDialogName,
          value: this.data.dhArmorDialogValue,
          threshold: this.data.dhArmorDialogThreshold,
          thresholdMax: this.data.dhArmorDialogThresholdMax,
          properties: this.data.dhArmorDialogProperties,
        }
      }
      return it
    })
    const fd = { ...this.data.card.formData }
    fd.dh_armors = items.map(it => ({
      key: it.key, name: it.name, value: it.value, threshold: it.threshold, thresholdMax: it.thresholdMax, properties: it.properties,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ dhArmorDialogVisible: false, dhArmorDialogEditing: false, dhArmors: items })
  },

  onDhArmorDialogInput(e) {
    const { field } = e.currentTarget.dataset
    const key = 'dhArmorDialog' + field.charAt(0).toUpperCase() + field.slice(1)
    const val = (field === 'value' || field === 'threshold' || field === 'thresholdMax') ? (parseInt(e.detail.value) || 0) : e.detail.value
    this.setData({ [key]: val })
  },

  onDeleteDhArmorFromDialog() {
    const key = this.data.dhArmorDialogKey
    const items = this.data.dhArmors.filter(it => it.key !== key)
    const fd = { ...this.data.card.formData }
    fd.dh_armors = items.map(it => ({
      key: it.key, name: it.name, value: it.value, threshold: it.threshold, thresholdMax: it.thresholdMax, properties: it.properties,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ dhArmorDialogVisible: false, dhArmors: items })
  },

  // === 库存模块 ===
  startEditDhInventory() {
    this.setData({ editingDhInventory: true, editDhInventory: this.data.dhInventory })
  },

  cancelEditDhInventory() {
    this.setData({ editingDhInventory: false, editDhInventory: '' })
  },

  saveDhInventory() {
    const fd = { ...this.data.card.formData }
    fd.dh_inventory = this.data.editDhInventory
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingDhInventory: false, dhInventory: this.data.editDhInventory })
  },

  onDhInventoryInput(e) {
    this.setData({ editDhInventory: e.detail.value })
  },

  // === 背景故事模块 ===
  startEditDhBackstory() {
    this.setData({
      editingDhBackstory: true,
      editDhBackstoryIntro: this.data.dhBackstoryIntro,
      editDhBackstoryTraits: this.data.dhBackstoryTraits,
      editDhBackstoryBio: this.data.dhBackstoryBio,
      editDhBackstoryMilestones: this.data.dhBackstoryMilestones,
      editDhAdventureLog: this.data.dhAdventureLog,
      editDhAdventureNote: this.data.dhAdventureNote,
    })
  },

  cancelEditDhBackstory() {
    this.setData({ editingDhBackstory: false })
  },

  onDhBackstoryIntroInput(e) {
    this.setData({ editDhBackstoryIntro: e.detail.value })
  },

  onDhBackstoryTraitsInput(e) {
    this.setData({ editDhBackstoryTraits: e.detail.value })
  },

  onDhAdventureNoteInput(e) {
    this.setData({ editDhAdventureNote: e.detail.value })
  },

  onDhBackstoryBioInput(e) {
    this.setData({ editDhBackstoryBio: e.detail.value })
  },

  onDhBackstoryMilestonesInput(e) {
    this.setData({ editDhBackstoryMilestones: e.detail.value })
  },

  onDhAdventureLogInput(e) {
    this.setData({ editDhAdventureLog: e.detail.value })
  },

  saveDhBackstoryNotes() {
    const fd = { ...this.data.card.formData }
    fd.dh_backstory_intro = this.data.editDhBackstoryIntro
    fd.dh_backstory_traits = this.data.editDhBackstoryTraits
    fd.dh_backstory_bio = this.data.editDhBackstoryBio
    fd.dh_backstory_milestones = this.data.editDhBackstoryMilestones
    fd.dh_adventure_log = this.data.editDhAdventureLog
    fd.dh_adventure_note = this.data.editDhAdventureNote
    store.updateCardFormData(this.cardId, fd)
    this.setData({
      editingDhBackstory: false,
      dhBackstoryIntro: this.data.editDhBackstoryIntro,
      dhBackstoryTraits: this.data.editDhBackstoryTraits,
      dhBackstoryBio: this.data.editDhBackstoryBio,
      dhBackstoryMilestones: this.data.editDhBackstoryMilestones,
      dhAdventureLog: this.data.editDhAdventureLog,
      dhAdventureNote: this.data.editDhAdventureNote,
    })
  },

  // === 特性模块 ===
  startEditDhClassFeatures() {
    const items = this.data.dhClassFeatures
    const snapshot = []
    for (let i = 0; i < items.length; i++) {
      snapshot.push({ key: items[i].key, name: items[i].name, description: items[i].description })
    }
    this.setData({ editingDhClassFeatures: true, dhClassFeaturesSnapshot: snapshot })
  },

  cancelEditDhClassFeatures() {
    const snapshot = this.data.dhClassFeaturesSnapshot || []
    const items = []
    for (let i = 0; i < snapshot.length; i++) {
      items.push({ key: snapshot[i].key, name: snapshot[i].name, description: snapshot[i].description })
    }
    this.setData({ editingDhClassFeatures: false, dhClassFeatures: items })
  },

  saveDhClassFeatures() {
    const fd = { ...this.data.card.formData }
    fd.dh_class_features = this.data.dhClassFeatures.map(it => ({ key: it.key, name: it.name, description: it.description }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingDhClassFeatures: false })
  },

  onAddDhClassFeature() {
    const items = [...this.data.dhClassFeatures]
    const nextIdx = items.length
    items.push({ key: 'dhcf_' + nextIdx, name: '', description: '' })
    this.setData({ dhClassFeatures: items })
  },

  onDeleteDhClassFeature(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ dhClassFeatures: this.data.dhClassFeatures.filter(it => it.key !== key) })
  },

  startEditDhRaceFeatures() {
    const items = this.data.dhRaceFeatures
    const snapshot = []
    for (let i = 0; i < items.length; i++) {
      snapshot.push({ key: items[i].key, name: items[i].name, description: items[i].description })
    }
    this.setData({ editingDhRaceFeatures: true, dhRaceFeaturesSnapshot: snapshot })
  },

  cancelEditDhRaceFeatures() {
    const snapshot = this.data.dhRaceFeaturesSnapshot || []
    const items = []
    for (let i = 0; i < snapshot.length; i++) {
      items.push({ key: snapshot[i].key, name: snapshot[i].name, description: snapshot[i].description })
    }
    this.setData({ editingDhRaceFeatures: false, dhRaceFeatures: items })
  },

  saveDhRaceFeatures() {
    const fd = { ...this.data.card.formData }
    fd.dh_race_features = this.data.dhRaceFeatures.map(it => ({ key: it.key, name: it.name, description: it.description }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingDhRaceFeatures: false })
  },

  onAddDhRaceFeature() {
    const items = [...this.data.dhRaceFeatures]
    const nextIdx = items.length
    items.push({ key: 'dhrf_' + nextIdx, name: '', description: '' })
    this.setData({ dhRaceFeatures: items })
  },

  onDeleteDhRaceFeature(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ dhRaceFeatures: this.data.dhRaceFeatures.filter(it => it.key !== key) })
  },

  onDhFeatureTap(e) {
    const { key, type } = e.currentTarget.dataset
    const list = type === 'class' ? this.data.dhClassFeatures : this.data.dhRaceFeatures
    const item = list.find(it => it.key === key)
    if (!item) return
    this.setData({
      dhFeatureDialogVisible: true,
      dhFeatureDialogEditing: false,
      dhFeatureDialogKey: key,
      dhFeatureDialogType: type,
      dhFeatureDialogName: item.name,
      dhFeatureDialogDesc: item.description,
    })
  },

  closeDhFeatureDialog() {
    this.setData({ dhFeatureDialogVisible: false })
  },

  startDhFeatureEdit() {
    this.setData({ dhFeatureDialogEditing: true })
  },

  cancelDhFeatureEdit() {
    const type = this.data.dhFeatureDialogType
    const list = type === 'class' ? this.data.dhClassFeatures : this.data.dhRaceFeatures
    const item = list.find(it => it.key === this.data.dhFeatureDialogKey)
    if (item) {
      this.setData({
        dhFeatureDialogEditing: false,
        dhFeatureDialogName: item.name,
        dhFeatureDialogDesc: item.description,
      })
    } else {
      this.setData({ dhFeatureDialogEditing: false })
    }
  },

  saveDhFeature() {
    const type = this.data.dhFeatureDialogType
    const listKey = type === 'class' ? 'dhClassFeatures' : 'dhRaceFeatures'
    const items = this.data[listKey].map(it => {
      if (it.key === this.data.dhFeatureDialogKey) {
        return { key: it.key, name: this.data.dhFeatureDialogName, description: this.data.dhFeatureDialogDesc }
      }
      return it
    })
    const fd = { ...this.data.card.formData }
    const storeKey = type === 'class' ? 'dh_class_features' : 'dh_race_features'
    fd[storeKey] = items.map(it => ({ key: it.key, name: it.name, description: it.description }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ dhFeatureDialogVisible: false, dhFeatureDialogEditing: false, [listKey]: items })
  },

  onDhFeatureDialogInput(e) {
    const { field } = e.currentTarget.dataset
    const key = 'dhFeatureDialog' + field.charAt(0).toUpperCase() + field.slice(1)
    this.setData({ [key]: e.detail.value })
  },

  onDeleteDhFeatureFromDialog() {
    const type = this.data.dhFeatureDialogType
    const listKey = type === 'class' ? 'dhClassFeatures' : 'dhRaceFeatures'
    const key = this.data.dhFeatureDialogKey
    const items = this.data[listKey].filter(it => it.key !== key)
    const fd = { ...this.data.card.formData }
    const storeKey = type === 'class' ? 'dh_class_features' : 'dh_race_features'
    fd[storeKey] = items.map(it => ({ key: it.key, name: it.name, description: it.description }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ dhFeatureDialogVisible: false, [listKey]: items })
  },

  // === 领域卡模块 ===
  startEditDhDomainCards() {
    const items = this.data.dhDomainCards
    const snapshot = []
    for (let i = 0; i < items.length; i++) {
      snapshot.push({ key: items[i].key, name: items[i].name, domain: items[i].domain, ability: items[i].ability, rc: items[i].rc, description: items[i].description })
    }
    const treasuryItems = this.data.dhTreasuryCards
    const treasurySnapshot = []
    for (let i = 0; i < treasuryItems.length; i++) {
      treasurySnapshot.push({ key: treasuryItems[i].key, name: treasuryItems[i].name, domain: treasuryItems[i].domain, ability: treasuryItems[i].ability, rc: treasuryItems[i].rc, description: treasuryItems[i].description })
    }
    this.setData({ editingDhDomainCards: true, dhDomainCardsSnapshot: snapshot, dhTreasuryCardsSnapshot: treasurySnapshot })
  },

  cancelEditDhDomainCards() {
    const snapshot = this.data.dhDomainCardsSnapshot || []
    const items = []
    for (let i = 0; i < snapshot.length; i++) {
      items.push({ key: snapshot[i].key, name: snapshot[i].name, domain: snapshot[i].domain, ability: snapshot[i].ability, rc: snapshot[i].rc, description: snapshot[i].description })
    }
    const treasurySnapshot = this.data.dhTreasuryCardsSnapshot || []
    const treasuryItems = []
    for (let i = 0; i < treasurySnapshot.length; i++) {
      treasuryItems.push({ key: treasurySnapshot[i].key, name: treasurySnapshot[i].name, domain: treasurySnapshot[i].domain, ability: treasurySnapshot[i].ability, rc: treasurySnapshot[i].rc, description: treasurySnapshot[i].description })
    }
    this.setData({ editingDhDomainCards: false, dhDomainCards: items, dhTreasuryCards: treasuryItems })
  },

  saveDhDomainCards() {
    const fd = { ...this.data.card.formData }
    fd.dh_domain_cards = this.data.dhDomainCards.map(it => ({
      key: it.key, name: it.name, domain: it.domain, ability: it.ability, rc: it.rc, description: it.description,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingDhDomainCards: false })
  },

  onAddDhDomainCard() {
    const items = [...this.data.dhDomainCards]
    items.push({ key: _dhNextKey('dhdc'), name: '', domain: '', ability: '', rc: 0, description: '' })
    this.setData({ dhDomainCards: items })
  },

  onDeleteDhDomainCard(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ dhDomainCards: this.data.dhDomainCards.filter(it => it.key !== key) })
  },

  onDhDomainCardTap(e) {
    if (this.data.editingDhDomainCards) return
    const { key } = e.currentTarget.dataset
    const item = this.data.dhDomainCards.find(it => it.key === key)
    if (!item) return
    this.setData({
      dhDomainDialogVisible: true,
      dhDomainDialogEditing: false,
      dhDomainDialogKey: key,
      dhDomainDialogName: item.name,
      dhDomainDialogDomain: item.domain,
      dhDomainDialogAbility: item.ability,
      dhDomainDialogRC: item.rc,
      dhDomainDialogDesc: item.description,
    })
  },

  closeDhDomainDialog() {
    this.setData({ dhDomainDialogVisible: false })
  },

  startDhDomainEdit() {
    this.setData({ dhDomainDialogEditing: true })
  },

  cancelDhDomainEdit() {
    const item = this.data.dhDomainCards.find(it => it.key === this.data.dhDomainDialogKey)
    if (item) {
      this.setData({
        dhDomainDialogEditing: false,
        dhDomainDialogName: item.name,
        dhDomainDialogDomain: item.domain,
        dhDomainDialogAbility: item.ability,
        dhDomainDialogRC: item.rc,
        dhDomainDialogDesc: item.description,
      })
    } else {
      this.setData({ dhDomainDialogEditing: false })
    }
  },

  applyDhDomainEdit() {
    const items = this.data.dhDomainCards.map(it => {
      if (it.key === this.data.dhDomainDialogKey) {
        return {
          ...it,
          name: this.data.dhDomainDialogName,
          domain: this.data.dhDomainDialogDomain,
          ability: this.data.dhDomainDialogAbility,
          rc: this.data.dhDomainDialogRC,
          description: this.data.dhDomainDialogDesc,
        }
      }
      return it
    })
    const fd = { ...this.data.card.formData }
    fd.dh_domain_cards = items.map(it => ({
      key: it.key, name: it.name, domain: it.domain, ability: it.ability, rc: it.rc, description: it.description,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ dhDomainDialogVisible: false, dhDomainDialogEditing: false, dhDomainCards: items })
  },

  onDhDomainDialogInput(e) {
    const { field } = e.currentTarget.dataset
    const key = 'dhDomainDialog' + field.charAt(0).toUpperCase() + field.slice(1)
    const val = field === 'RC' ? (parseInt(e.detail.value) || 0) : e.detail.value
    this.setData({ [key]: val })
  },

  onDeleteDhDomainFromDialog() {
    const key = this.data.dhDomainDialogKey
    const items = this.data.dhDomainCards.filter(it => it.key !== key)
    const fd = { ...this.data.card.formData }
    fd.dh_domain_cards = items.map(it => ({
      key: it.key, name: it.name, domain: it.domain, ability: it.ability, rc: it.rc, description: it.description,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ dhDomainDialogVisible: false, dhDomainCards: items })
  },

  // === 宝库模块 ===
  startEditDhTreasuryCards() {
    const items = this.data.dhTreasuryCards
    const snapshot = []
    for (let i = 0; i < items.length; i++) {
      snapshot.push({ key: items[i].key, name: items[i].name, domain: items[i].domain, ability: items[i].ability, rc: items[i].rc, description: items[i].description })
    }
    const domainItems = this.data.dhDomainCards
    const domainSnapshot = []
    for (let i = 0; i < domainItems.length; i++) {
      domainSnapshot.push({ key: domainItems[i].key, name: domainItems[i].name, domain: domainItems[i].domain, ability: domainItems[i].ability, rc: domainItems[i].rc, description: domainItems[i].description })
    }
    this.setData({ editingDhTreasuryCards: true, dhTreasuryCardsSnapshot: snapshot, dhDomainCardsSnapshot: domainSnapshot })
  },

  cancelEditDhTreasuryCards() {
    const snapshot = this.data.dhTreasuryCardsSnapshot || []
    const items = []
    for (let i = 0; i < snapshot.length; i++) {
      items.push({ key: snapshot[i].key, name: snapshot[i].name, domain: snapshot[i].domain, ability: snapshot[i].ability, rc: snapshot[i].rc, description: snapshot[i].description })
    }
    const domainSnapshot = this.data.dhDomainCardsSnapshot || []
    const domainItems = []
    for (let i = 0; i < domainSnapshot.length; i++) {
      domainItems.push({ key: domainSnapshot[i].key, name: domainSnapshot[i].name, domain: domainSnapshot[i].domain, ability: domainSnapshot[i].ability, rc: domainSnapshot[i].rc, description: domainSnapshot[i].description })
    }
    this.setData({ editingDhTreasuryCards: false, dhTreasuryCards: items, dhDomainCards: domainItems })
  },

  saveDhTreasuryCards() {
    const fd = { ...this.data.card.formData }
    fd.dh_treasury_cards = this.data.dhTreasuryCards.map(it => ({
      key: it.key, name: it.name, domain: it.domain, ability: it.ability, rc: it.rc, description: it.description,
    }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ editingDhTreasuryCards: false })
  },

  onAddDhTreasuryCard() {
    const items = [...this.data.dhTreasuryCards]
    items.push({ key: _dhNextKey('dhtc'), name: '', domain: '', ability: '', rc: 0, description: '' })
    this.setData({ dhTreasuryCards: items })
  },

  onDeleteDhTreasuryCard(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ dhTreasuryCards: this.data.dhTreasuryCards.filter(it => it.key !== key) })
  },

  // === 转移 ===
  onTransferDhToTreasury(e) {
    const { key } = e.currentTarget.dataset
    const domainCards = this.data.dhDomainCards
    const idx = domainCards.findIndex(it => it.key === key)
    if (idx < 0) return
    const item = domainCards[idx]
    const newDomainCards = domainCards.filter(it => it.key !== key)
    const treasuryCards = this.data.dhTreasuryCards
    const insertIdx = this._findLastFilledIdx(treasuryCards) + 1
    treasuryCards.splice(insertIdx, 0, { ...item, key: _dhNextKey('dhtc') })
    this.setData({ dhDomainCards: newDomainCards, dhTreasuryCards: treasuryCards })
  },

  onTransferTreasuryToDh(e) {
    const { key } = e.currentTarget.dataset
    const treasuryCards = this.data.dhTreasuryCards
    const idx = treasuryCards.findIndex(it => it.key === key)
    if (idx < 0) return
    const item = treasuryCards[idx]
    const newTreasuryCards = treasuryCards.filter(it => it.key !== key)
    const domainCards = this.data.dhDomainCards
    const insertIdx = this._findLastFilledIdx(domainCards) + 1
    domainCards.splice(insertIdx, 0, { ...item, key: _dhNextKey('dhdc') })
    this.setData({ dhDomainCards: domainCards, dhTreasuryCards: newTreasuryCards })
  },

  _findLastFilledIdx(items) {
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].name || items[i].domain || items[i].ability || items[i].description) return i
    }
    return -1
  },
})