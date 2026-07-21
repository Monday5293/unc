const store = require('../../utils/store.js')

Page({
  data: {
    card: null,
    systemInfo: null,
    system: '',        // 当前规则系统代码（COC/DND/DAGGERHEART）
    previewStats: [],
    accentColor: '#C8A046',
    createdAtText: '',
    updatedAtText: '',
    cardNotFound: false,

    // ===== 手动属性表数据 =====
    // COC
    cocAttributes: [],
    cocSkills: [],
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
      return {
        cocAttributes: [
          { key: 'str', label: '力量', abbr: 'STR', value: fd.str ?? 50, color: this.cocAttrColor(fd.str ?? 50) },
          { key: 'con', label: '体质', abbr: 'CON', value: fd.con ?? 50, color: this.cocAttrColor(fd.con ?? 50) },
          { key: 'siz', label: '体型', abbr: 'SIZ', value: fd.siz ?? 50, color: this.cocAttrColor(fd.siz ?? 50) },
          { key: 'dex', label: '敏捷', abbr: 'DEX', value: fd.dex ?? 50, color: this.cocAttrColor(fd.dex ?? 50) },
          { key: 'app', label: '外貌', abbr: 'APP', value: fd.app ?? 50, color: this.cocAttrColor(fd.app ?? 50) },
          { key: 'int', label: '智力', abbr: 'INT', value: fd.int ?? 75, color: this.cocAttrColor(fd.int ?? 75) },
          { key: 'pow', label: '意志', abbr: 'POW', value: fd.pow ?? 60, color: this.cocAttrColor(fd.pow ?? 60) },
          { key: 'edu', label: '教育', abbr: 'EDU', value: fd.edu ?? 80, color: this.cocAttrColor(fd.edu ?? 80) },
        ],
        cocSkills: [
          { key: 'skill_libraryUse', label: '图书馆使用', value: fd.skill_libraryUse ?? 0 },
          { key: 'skill_spotHidden', label: '侦查',       value: fd.skill_spotHidden ?? 0 },
          { key: 'skill_listen',     label: '聆听',       value: fd.skill_listen ?? 0 },
          { key: 'skill_dodge',      label: '闪避',       value: fd.skill_dodge ?? 0 },
        ],
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
        { label: 'SAN', value: fd.san || '—' },
        { label: 'HP', value: `${fd.hp || 0}/${fd.hpMax || 0}` }
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
  }
})