const store = require('../../utils/store.js')
const { parseStCommand } = require('../../utils/st-parser.js')

Page({
  data: {
    systems: [],
    currentSystem: 'COC',
    searchInput: '',
    filteredCards: [],
    currentSystemInfo: {},
    addDialogVisible: false,
    newCardName: '',
    newCardModule: '',
    newCardSt: '',
    deleteDialogVisible: false,
    cardToDelete: null,
    systemActionDialogVisible: false,
    systemActionTarget: null,
    deleteSystemDialogVisible: false,
    systemToDelete: null
  },

  onLoad() {
    this.refreshData()
  },

  onShow() {
    this.refreshData()
  },

  refreshData() {
    const systems = store.getSystems()
    const currentSystemInfo = store.getCurrentSystemInfo()
    const filteredCards = store.getFilteredCards()
    this.setData({
      systems,
      currentSystem: store.getState().currentSystem,
      currentSystemInfo,
      filteredCards
    })
  },

  onSearchInput(e) {
    const value = e.detail.value
    this.setData({ searchInput: value })
    store.setSearch(value)
    this.refreshData()
  },

  onClearSearch() {
    this.setData({ searchInput: '' })
    store.setSearch('')
    this.refreshData()
  },

  onSystemChange(e) {
    const { system } = e.detail
    store.setSystem(system)
    this.setData({ searchInput: '' })
    store.setSearch('')
    this.refreshData()
  },

  onSystemPress(e) {
    const { system } = e.detail
    this.setData({
      systemActionTarget: system,
      systemActionDialogVisible: true
    })
  },

  onCardClick(e) {
    const { card } = e.detail
    console.log('[home] onCardClick card:', card ? card.id : 'NO CARD')
    wx.navigateTo({
      url: `/pages/card-detail/card-detail?id=${card.id}`,
      success: () => {
        console.log('[home] onCardClick navigateTo success')
      },
      fail: (err) => {
        console.error('[home] onCardClick navigateTo failed:', JSON.stringify(err))
      }
    })
  },

  onToggleFav(e) {
    const { card } = e.detail
    store.toggleFavorite(card.id)
    this.refreshData()
  },

  onCardLongPress(e) {
    const { card } = e.detail
    this.setData({
      cardToDelete: card,
      deleteDialogVisible: true
    })
  },

  goImport() {
    wx.navigateTo({
      url: '/pages/import-list/import-list'
    })
  },

  openAddDialog() {
    this.setData({
      newCardName: '',
      newCardModule: '',
      newCardSt: '',
      addDialogVisible: true
    })
  },

  onNewCardNameInput(e) {
    this.setData({ newCardName: e.detail.value })
  },

  onNewCardModuleInput(e) {
    this.setData({ newCardModule: e.detail.value })
  },

  onNewCardStInput(e) {
    this.setData({ newCardSt: e.detail.value })
  },

  doAddCard() {
    if (!this.data.newCardName.trim()) return
    console.log('[home] doAddCard name:', this.data.newCardName.trim(), 'module:', this.data.newCardModule.trim(), 'st:', this.data.newCardSt.trim().slice(0, 100))
    const stFormData = this.data.newCardSt.trim() ? parseStCommand(this.data.newCardSt.trim()) : {}
    // 如果填写了参与模组，写入经历模块的第一个条目
    const moduleName = this.data.newCardModule.trim()
    if (moduleName) {
      stFormData.experiences = [
        { key: 'exp_0', label: moduleName, value: '' },
        { key: 'exp_1', label: '', value: '' },
      ]
    }
    console.log('[home] doAddCard stFormData keys:', Object.keys(stFormData).length)
    const card = store.addCard(
      this.data.currentSystem,
      this.data.newCardName.trim(),
      stFormData
    )
    console.log('[home] doAddCard created card:', card.id, 'system:', card.system, 'name:', card.name)
    this.setData({ addDialogVisible: false })
    this.refreshData()
    wx.navigateTo({
      url: `/pages/card-detail/card-detail?id=${card.id}`,
      success: () => {
        console.log('[home] navigateTo success to card:', card.id)
      },
      fail: (err) => {
        console.error('[home] navigateTo after addCard failed:', JSON.stringify(err))
      }
    })
  },

  cancelAddDialog() {
    this.setData({ addDialogVisible: false })
  },

  confirmDelete() {
    if (this.data.cardToDelete) {
      store.deleteCard(this.data.cardToDelete.id)
    }
    this.setData({
      deleteDialogVisible: false,
      cardToDelete: null
    })
    this.refreshData()
  },

  cancelDeleteDialog() {
    this.setData({
      deleteDialogVisible: false,
      cardToDelete: null
    })
  },

  exportCurrentSystem() {
    if (!this.data.systemActionTarget) return
    const sys = this.data.systemActionTarget
    const rule = sys.rule || []
    const option = sys.option || {}
    const exportData = {
      name: sys.name,
      fullName: sys.fullName,
      description: sys.description,
      logo: sys.logo,
      accentColor: sys.accentColor,
      isCustom: sys.isCustom,
      exportTime: new Date().toISOString(),
      rule,
      option
    }
    // TODO: 导出 JSON - 预留位置
    // 在微信小程序中可使用 wx.setClipboardData 复制到剪贴板
    // 或使用 wx.saveFile 保存到本地
    wx.setClipboardData({
      data: JSON.stringify(exportData, null, 2),
      success: () => {
        wx.showToast({
          title: 'JSON已复制到剪贴板',
          icon: 'success'
        })
      }
    })
    this.setData({ systemActionDialogVisible: false })
  },

  openDeleteSystemDialog() {
    if (this.data.systemActionTarget) {
      this.setData({
        systemToDelete: this.data.systemActionTarget,
        systemActionDialogVisible: false,
        deleteSystemDialogVisible: true
      })
    }
  },

  confirmDeleteSystem() {
    if (this.data.systemToDelete) {
      store.deleteSystem(this.data.systemToDelete.code)
    }
    this.setData({
      deleteSystemDialogVisible: false,
      systemToDelete: null
    })
    this.refreshData()
  },

  cancelDeleteSystemDialog() {
    this.setData({
      deleteSystemDialogVisible: false,
      systemToDelete: null
    })
  },

  cancelSystemActionDialog() {
    this.setData({
      systemActionDialogVisible: false,
      systemActionTarget: null
    })
  },

  stopPropagation() {}
})
