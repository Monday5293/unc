const store = require('../../utils/store.js')
const { parseStCommand } = require('../../utils/st-parser.js')

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
    editDndAttrs: {},
    // Daggerheart
    dhAttributes: [],
    dhStaminaPct: 0,
    dhStressPct: 0,
  },

  onLoad(options) {
    console.log('[card-detail] onLoad options:', JSON.stringify(options))
    this.cardId = options.id
    this.loadCard()
  },

  onShow() {
    console.log('[card-detail] onShow cardId:', this.cardId)
    if (this.cardId) {
      this.loadCard()
    }
  },

  loadCard() {
    try {
      console.log('[card-detail] loadCard cardId:', this.cardId)
      // 调试：列出所有卡片ID
      const allCards = store.getState().cards
      console.log('[card-detail] allCards count:', allCards.length, 'ids:', allCards.map(c => c.id).join(', '))
      const card = store.getCardById(this.cardId)
      console.log('[card-detail] getCardById result:', card ? card.id : 'NOT FOUND')
      if (!card) {
        this.setData({ cardNotFound: true, card: null, systemInfo: null })
        return
      }

      let systemInfo = store.getSystemInfo(card.system)
      console.log('[card-detail] getSystemInfo result:', systemInfo ? systemInfo.code : 'NOT FOUND')
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

      this.setData({
        card,
        systemInfo,
        system,
        previewStats,
        accentColor,
        createdAtText: this.formatDate(card.createdAt),
        updatedAtText: this.formatDate(card.updatedAt),
        cardNotFound: false,
        ...sheetData,
        experienceItems: this.buildExperienceItems(card),
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
    const fd = card.formData || {}

    if (system === 'COC') {
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

      return {
        dndAbilities: abilities,
        dndSavingThrows: saves,
        dndSkillProfs: skills,
        dndHpPercent: hpPct,
        dndHpColor: hpColor,
        dndAc: ac,
        dndDc: dc,
        dndSpellSlots: spellSlots,
        dndClassLabel: this.classLabel(fd.class),
      }
    }

    if (system === 'DAGGERHEART') {
      const attrs = [
        { key: 'agility',   label: '敏捷', abbr: 'AGI', value: fd.agility ?? 0 },
        { key: 'strength',  label: '力量', abbr: 'STR', value: fd.strength ?? 0 },
        { key: 'finesse',   label: '精巧', abbr: 'FIN', value: fd.finesse ?? 0 },
        { key: 'instinct',  label: '本能', abbr: 'INS', value: fd.instinct ?? 0 },
        { key: 'presence',  label: '存在', abbr: 'PRE', value: fd.presence ?? 0 },
        { key: 'knowledge', label: '知识', abbr: 'KNO', value: fd.knowledge ?? 0 },
      ].map(a => ({
        ...a,
        fmt: a.value >= 0 ? '+' + a.value : String(a.value),
        color: this.dhAttrColor(a.value),
        barPct: Math.min(((a.value + 2) / 6) * 100, 100),
      }))

      const stamina = fd.stamina || 0
      const staminaMax = fd.staminaMax || 0
      const stress = fd.stress || 0
      const stressMax = fd.stressMax || 0

      return {
        dhAttributes: attrs,
        dhStaminaPct: staminaMax ? Math.min((stamina / staminaMax) * 100, 100) : 0,
        dhStressPct: stressMax ? Math.min((stress / stressMax) * 100, 100) : 0,
      }
    }

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
        occupation: fd.occupation || '',
        age: fd.age || '',
        gender: fd.gender || '',
        class: fd.class || '',
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
        { label: 'AC/DC/HP', value: `${ac}/${dc}/${fd.hp || 0}` }
      ]
    }

    if (sys === 'DAGGERHEART') {
      return [
        { label: '职业', value: this.dhClassLabel(fd.class) },
        { label: '血脉', value: this.dhAncestryLabel(fd.ancestry) },
        { label: '阶层', value: fd.tier || '—' },
        { label: '耐力', value: `${fd.stamina || 0}/${fd.staminaMax || 0}` }
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
      wx.showToast({ title: '请粘贴 .st 指令', icon: 'none' })
      return
    }
    const parsed = parseStCommand(stText)
    if (!parsed || Object.keys(parsed).length === 0) {
      wx.showToast({ title: '未能解析指令', icon: 'none' })
      return
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
        console.log('[card-detail] chooseImage 成功, path:', tempFilePath)
        // 检查 wx.cropImage 是否可用
        if (!wx.cropImage) {
          console.log('[card-detail] wx.cropImage 不可用，直接使用原图')
          const card = that.data.card
          if (card) {
            card.avatar = tempFilePath
            that.setData({ card })
            store.updateCardAvatar(card.id, tempFilePath)
          }
          return
        }
        // 打开裁剪界面，让玩家手动框选区域
        wx.cropImage({
          src: tempFilePath,
          cropScale: '1:1',
          success(cropRes) {
            console.log('[card-detail] cropImage 成功, path:', cropRes.tempFilePath)
            const card = that.data.card
            if (card) {
              card.avatar = cropRes.tempFilePath
              that.setData({ card })
              store.updateCardAvatar(card.id, cropRes.tempFilePath)
            }
          },
          fail(err) {
            console.error('[card-detail] cropImage 失败:', JSON.stringify(err))
            const card = that.data.card
            if (card) {
              card.avatar = tempFilePath
              that.setData({ card })
              store.updateCardAvatar(card.id, tempFilePath)
            }
          }
        })
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
    wx.showToast({ title: '技能已更新', icon: 'success' })
    this.loadCard()
  },

  // ===== 基本信息编辑 =====
  startEditBasicInfo() {
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
    wx.showToast({ title: '基本信息已更新', icon: 'success' })
    this.loadCard()
  },

  // ===== 基础属性编辑 =====
  startEditAttrs() {
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
    wx.showToast({ title: '属性已更新', icon: 'success' })
    this.loadCard()
  },

  // ===== 当前状态编辑 =====
  startEditStatus() {
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
    wx.showToast({ title: '状态已更新', icon: 'success' })
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
    // 同步到 formData
    const fd = { ...this.data.card.formData }
    fd.experiences = items.map(it => ({ key: it.key, label: it.label, value: it.value }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ experienceItems: items })
  },

  /** 切换经历管理模式 */
  toggleExperienceManage() {
    this.setData({ experienceManaging: !this.data.experienceManaging })
  },

  /** 删除经历条目 */
  onDeleteExperienceEntry(e) {
    const { key } = e.currentTarget.dataset
    const items = this.data.experienceItems.filter(it => it.key !== key)
    const fd = { ...this.data.card.formData }
    fd.experiences = items.map(it => ({ key: it.key, label: it.label, value: it.value }))
    store.updateCardFormData(this.cardId, fd)
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
    const fd = { ...this.data.card.formData }
    fd.experiences = items.map(it => ({ key: it.key, label: it.label, value: it.value }))
    store.updateCardFormData(this.cardId, fd)
    this.setData({ experienceDialogVisible: false, experienceDialogEditing: false, experienceItems: items })
    wx.showToast({ title: '已保存', icon: 'success' })
    this.loadCard()
  },

  stopPropagation() {}
})