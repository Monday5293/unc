const store = require('../../utils/store.js')

Page({
  data: {
    card: null,
    systemInfo: null,
    formData: {},
    previewStats: [],
    accentColor: '#C8A046',
    createdAtText: '',
    updatedAtText: '',
    cardNotFound: false
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
      // 如果系统不存在，构造回退 systemInfo
      if (!systemInfo) {
        systemInfo = {
          code: card.system || 'CUSTOM',
          name: card.system || '自定义',
          fullName: card.system || 'Custom',
          accentColor: '#C8A046',
          logo: '●',
          isCustom: true,
          rule: card.rule || [],
          option: {}
        }
      }
      const accentColor = systemInfo ? systemInfo.accentColor : '#C8A046'

      const effectiveRule = (systemInfo && systemInfo.rule && systemInfo.rule.length > 0)
        ? systemInfo.rule
        : (card.rule || [])

      const previewStats = this.computePreviewStats(card)

      this.setData({
        card,
        systemInfo,
        effectiveRule,
        formData: { ...card.formData },
        previewStats,
        accentColor,
        createdAtText: this.formatDate(card.createdAt),
        updatedAtText: this.formatDate(card.updatedAt),
        cardNotFound: false
      })

      wx.setNavigationBarTitle({
        title: card.name || '角色卡详情'
      })
    } catch (err) {
      console.error('[card-detail] loadCard error:', err)
      this.setData({ cardNotFound: true, card: null, systemInfo: null })
    }
  },

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

  onFormChange(e) {
    const formData = e.detail
    this.setData({ formData })
    if (this.data.card) {
      store.updateCardFormData(this.data.card.id, formData)
    }
  },

  exportCard() {
    if (!this.data.card) return
    const exportData = {
      ...this.data.card,
      systemInfo: this.data.systemInfo,
      exportTime: new Date().toISOString()
    }
    // TODO: 导出 JSON - 预留位置
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
