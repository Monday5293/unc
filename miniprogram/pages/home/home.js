const store = require('../../utils/store.js')
const themeUtil = require('../../utils/theme.js')
const { parseStCommand } = require('../../utils/st-parser.js')
const { parseDhJson } = require('../../utils/dh-json-parser.js')
const { sha256 } = require('../../utils/sha256.js')

/**
 * 保存角色头像：将 base64 数据写入本地文件并更新卡片 avatar 字段
 */
function saveCharAvatar(cardId, base64Data) {
  var fs = wx.getFileSystemManager()
  var filePath = wx.env.USER_DATA_PATH + '/avatar_' + cardId + '.jpg'
  fs.writeFile({
    filePath: filePath,
    data: base64Data,
    encoding: 'base64',
    success: function () {
      console.log('[home] avatar saved to:', filePath)
      store.updateCardAvatar(cardId, filePath)
    },
    fail: function (err) {
      console.error('[home] save avatar failed:', err)
    }
  })
}

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
    systemToDelete: null,
    loginDialogVisible: false,
    loginPendingAction: null,
    loginName: '',
    loginPassword: '',
    isRegisterMode: false
  },

  onLoad() {
    this.refreshData()
  },

  onShow() {
    themeUtil.applyToPage(this)
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
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
    wx.navigateTo({
      url: `/pages/card-detail/card-detail?id=${card.id}`,
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
    var val = e.detail.value
    this.setData({ newCardSt: val })
    // DAGGERHEART 系统：如果粘贴了 JSON，自动读取名字填入名称栏
    if (this.data.currentSystem === 'DAGGERHEART' && val && val.trim().charAt(0) === '{') {
      try {
        var json = JSON.parse(val.trim())
        if (json.name) {
          this.setData({ newCardName: json.name })
        }
      } catch (err) { /* 不是有效 JSON 忽略 */ }
    }
  },

  doAddCard() {
    if (!store.isLoggedIn()) {
      this.setData({
        loginDialogVisible: true,
        loginPendingAction: 'add',
        loginName: '',
        loginPassword: '',
        isRegisterMode: true
      })
      return
    }
    if (!this.data.newCardName.trim()) return
    var stText = this.data.newCardSt.trim()
    console.log('[home] doAddCard name:', this.data.newCardName.trim(), 'module:', this.data.newCardModule.trim(), 'st:', stText.slice(0, 100))
    
    var stFormData = {}
    // DAGGERHEART 系统：检测是否为 DHSheet JSON 导入
    if (this.data.currentSystem === 'DAGGERHEART' && stText && stText.charAt(0) === '{') {
      var dhParsed = parseDhJson(stText)
      if (dhParsed) {
        stFormData = dhParsed
        console.log('[home] doAddCard DH JSON parsed, keys:', Object.keys(stFormData).length)
      } else {
        wx.showToast({ title: 'JSON 格式无效', icon: 'none' })
        return
      }
    } else if (stText) {
      stFormData = parseStCommand(stText) || {}
    }
    // 如果填写了参与模组
    const moduleName = this.data.newCardModule.trim()
    if (moduleName) {
      if (this.data.currentSystem === 'DAGGERHEART') {
        // DAGGERHEART：写入冒险履历，若已有内容则追加
        var existingLog = stFormData.dh_adventure_log || ''
        stFormData.dh_adventure_log = existingLog ? (existingLog + '\n' + moduleName) : moduleName
      } else {
        stFormData.experiences = [
          { key: 'exp_0', label: moduleName, value: '' },
          { key: 'exp_1', label: '', value: '' },
        ]
      }
    }
    console.log('[home] doAddCard stFormData keys:', Object.keys(stFormData).length)
    const card = store.addCard(
      this.data.currentSystem,
      this.data.newCardName.trim(),
      stFormData
    )
    console.log('[home] doAddCard created card:', card.id, 'system:', card.system, 'name:', card.name)
    
    // 如果从 JSON 中提取了角色照片，保存为头像
    if (stFormData._characterImage) {
      saveCharAvatar(card.id, stFormData._characterImage)
      delete stFormData._characterImage
    }
    
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

  // ===== 登录弹窗 =====
  onLoginNameInput(e) {
    console.log('[home] onLoginNameInput value:', e.detail.value)
    this.setData({ loginName: e.detail.value })
  },

  onLoginNameBlur(e) {
    var name = (e.detail.value || '').trim()
    console.log('[home] onLoginNameBlur value:', name)
    this.setData({ loginName: name })
    if (!name) return
    var that = this
    store.cloudCheckAccount(name).then(function (res) {
      console.log('[home] cloudCheckAccount result:', res)
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
    console.log('[home] doLoginSubmit loginName:', this.data.loginName, 'loginPassword:', this.data.loginPassword ? '***' : '')
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
        that.refreshData()
        that._executePendingAction()
        wx.showToast({ title: action === 'register' ? '注册成功' : '登录成功', icon: 'success' })
      } else {
        wx.showToast({ title: res.errMsg || '登录失败', icon: 'none' })
      }
    })
  },

  _executePendingAction() {
    var action = this.data.loginPendingAction
    this.setData({ loginPendingAction: null })
    if (action === 'add') {
      this.doAddCard()
    }
  },

  cancelLoginDialog() {
    this.setData({ loginDialogVisible: false, loginPendingAction: null, loginName: '', loginPassword: '' })
  },

  stopPropagation() {}
})
