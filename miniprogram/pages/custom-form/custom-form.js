const api = require('../../utils/api.js')
const store = require('../../utils/store.js')

const CACHE_KEY_PREFIX = 'custom-form-'

Page({
  data: {
    card: null,
    rule: [],
    option: {},
    systemInfo: null,
    accentColor: '#3B6B4A',
    loading: false,
    loadError: '',
    formData: {}
  },

  onLoad(options) {
    this.formId = options.formId
    this.loadForm()
  },

  async loadForm() {
    if (!this.formId) return

    const cacheKey = CACHE_KEY_PREFIX + this.formId
    try {
      const cached = wx.getStorageSync(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        this.setFormData(parsed)
        return
      }
    } catch (e) {}

    this.setData({ loading: true, loadError: '' })
    try {
      const saved = await api.getForm(this.formId)
      const mockCard = {
        id: saved.id,
        system: saved.system,
        name: saved.name,
        player: '设计器导出',
        avatar: '',
        description: saved.description || '',
        formData: {},
        favorite: false,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt
      }
      const data = {
        card: mockCard,
        rule: saved.rule || [],
        option: saved.option || { submitBtn: false, resetBtn: false }
      }
      try {
        wx.setStorageSync(cacheKey, JSON.stringify(data))
      } catch (e) {}
      this.setFormData(data)
    } catch (e) {
      this.setData({ loadError: e.message || '加载失败' })
    } finally {
      this.setData({ loading: false })
    }
  },

  setFormData(data) {
    const systemInfo = data.card ? store.getSystemInfo(data.card.system) : null
    const accentColor = systemInfo ? systemInfo.accentColor : '#3B6B4A'
    this.setData({
      card: data.card,
      rule: data.rule || [],
      option: data.option || {},
      systemInfo,
      accentColor,
      formData: data.card ? { ...data.card.formData } : {}
    })
  },

  goBack() {
    wx.navigateBack()
  },

  toggleFav() {
    if (!this.data.card) return
    const card = { ...this.data.card }
    card.favorite = !card.favorite
    card.updatedAt = new Date().toISOString()
    this.setData({ card })

    const cacheKey = CACHE_KEY_PREFIX + this.formId
    try {
      const cached = wx.getStorageSync(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        parsed.card = card
        wx.setStorageSync(cacheKey, JSON.stringify(parsed))
      }
    } catch (e) {}
  },

  onFormChange(e) {
    const formData = e.detail
    this.setData({ formData })
  }
})
