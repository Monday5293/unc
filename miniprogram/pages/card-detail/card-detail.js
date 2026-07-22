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
    // DND
    dndAbilities: [],
    dndSavingThrows: [],
    dndSkillProfs: [],
    dndHpPercent: 0,
    dndHpColor: '#22c55e',
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
      ].map(ab => ({
        ...ab,
        mod: this.dndMod(ab.value),
        modColor: this.dndModColor(ab.value),
      }))

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

      return {
        dndAbilities: abilities,
        dndSavingThrows: saves,
        dndSkillProfs: skills,
        dndHpPercent: hpPct,
        dndHpColor: hpColor,
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

  // === DND 工具函数 ===
  dndMod(score) {
    const m = Math.floor((score - 10) / 2)
    return m >= 0 ? '+' + m : String(m)
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
      return [
        { label: '职业', value: this.classLabel(fd.class) },
        { label: '种族', value: fd.race || '—' },
        { label: '等级', value: fd.level || '—' },
        { label: 'AC/HP', value: `${fd.ac || 0}/${fd.hp || 0}` }
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
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePath = res.tempFiles[0].tempFilePath
        const card = that.data.card
        if (card) {
          card.avatar = tempFilePath
          that.setData({ card })
          store.updateCardAvatar(card.id, tempFilePath)
        }
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

  stopPropagation() {}
})