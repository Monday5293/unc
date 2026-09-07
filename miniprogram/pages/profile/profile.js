const store = require('../../utils/store.js')
const themeUtil = require('../../utils/theme.js')
const { sha256 } = require('../../utils/sha256.js')

Page({
  data: {
    isLoggedIn: false,
    userId: '',
    userName: '',
    userAvatar: '',
    editingName: false,
    editNameValue: '',
    stats: { total: 0, favorites: 0 },
    // 登录弹窗
    loginDialogVisible: false,
    isRegisterMode: false,
    loginName: '',
    loginPassword: '',
    // 头像裁剪
    cropDialogVisible: false,
    cropImageSrc: '',
    cropImageW: 0,
    cropImageH: 0,
    cropX: 0,
    cropY: 0,
    cropBoxSize: 200,
  },

  onShow() {
    themeUtil.applyToPage(this)
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
    this.refreshData()
  },

  refreshData() {
    var state = store.getState()
    var stats = store.getStats()
    this.setData({
      isLoggedIn: state.isLoggedIn,
      userId: state.userId,
      userName: state.userName,
      userAvatar: state.userAvatar,
      stats: { total: stats.total, favorites: stats.favorites }
    })
  },

  // ===== 点击名称 → 打开登录弹窗 =====
  onNameClick() {
    if (this.data.isLoggedIn) return
    console.log('[profile] onNameClick, opening login dialog')
    this.setData({
      loginDialogVisible: true,
      loginName: '',
      loginPassword: '',
      isRegisterMode: true
    })
  },

  // ===== 昵称输入 =====
  onLoginNameInput(e) {
    console.log('[profile] onLoginNameInput value:', e.detail.value)
    this.setData({ loginName: e.detail.value })
  },

  onLoginNameBlur(e) {
    var name = (e.detail.value || '').trim()
    console.log('[profile] onLoginNameBlur value:', name)
    this.setData({ loginName: name })
    if (!name) return
    var that = this
    store.cloudCheckAccount(name).then(function (res) {
      console.log('[profile] cloudCheckAccount result:', res)
      that.setData({ isRegisterMode: !res.exists })
    })
  },

  // ===== 密码输入 =====
  onLoginPasswordInput(e) {
    this.setData({ loginPassword: e.detail.value })
  },

  // ===== 邀请码输入（注册时） =====
  onLoginInviteInput(e) {
    this.setData({ loginInviteCode: e.detail.value })
  },

  // ===== 切换登录/注册模式 =====
  toggleLoginMode() {
    this.setData({
      isRegisterMode: !this.data.isRegisterMode,
      loginPassword: '',
      loginInviteCode: ''
    })
  },

  // ===== 提交登录/注册 =====
  doLoginSubmit() {
    console.log('[profile] doLoginSubmit loginName:', this.data.loginName, 'loginPassword:', this.data.loginPassword ? '***' : '')
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
        wx.showToast({ title: action === 'register' ? '注册成功' : '登录成功', icon: 'success' })
      } else {
        wx.showToast({ title: res.errMsg || '登录失败', icon: 'none' })
      }
    })
  },

  cancelLoginDialog() {
    this.setData({ loginDialogVisible: false, loginName: '', loginPassword: '', loginInviteCode: '' })
  },

  // ===== 名称编辑 =====
  onEditName() {
    this.setData({
      editingName: true,
      editNameValue: this.data.userName
    })
  },

  onNameInput(e) {
    this.setData({ editNameValue: e.detail.value })
  },

  confirmEditName() {
    var name = this.data.editNameValue.trim()
    if (!name) return
    var that = this
    wx.showLoading({ title: '保存中...' })
    store.updateUserName(name).then(function (res) {
      wx.hideLoading()
      if (res.success) {
        that.setData({ userName: name, editingName: false })
        wx.showToast({ title: '修改成功', icon: 'success' })
      } else {
        wx.showToast({ title: res.errMsg || '修改失败', icon: 'none' })
      }
    })
  },

  cancelEditName() {
    this.setData({ editingName: false })
  },

  // ===== 头像裁剪（圆形裁剪） =====
  onChooseAvatar() {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        var tempFilePath = res.tempFilePaths[0]
        wx.getImageInfo({
          src: tempFilePath,
          success(info) {
            var screenWidth = wx.getSystemInfoSync().windowWidth
            var dialogWidth = screenWidth * 0.85
            var contentWidth = dialogWidth - 28 * 2 * (screenWidth / 750)
            var imageW = contentWidth
            var imageH = (info.height / info.width) * contentWidth
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
    this.setData({ cropX: e.detail.x, cropY: e.detail.y })
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
    var dx = e.touches[0].pageX - this._resizeStartX
    var dy = e.touches[0].pageY - this._resizeStartY
    var delta = Math.max(dx, dy)
    var maxSize = Math.min(this.data.cropImageW, this.data.cropImageH)
    var newSize = Math.max(60, Math.min(this._resizeStartSize + delta, maxSize))
    this.setData({ cropBoxSize: newSize })
  },

  onResizeEnd() {
    this._resizeStartSize = null
  },

  confirmCrop() {
    var that = this
    var cropX = this.data.cropX || 0
    var cropY = this.data.cropY || 0
    var cropImageSrc = this.data.cropImageSrc
    var cropBoxSize = this.data.cropBoxSize
    var screenWidth = wx.getSystemInfoSync().windowWidth

    wx.getImageInfo({
      src: cropImageSrc,
      success(info) {
        var imgW = info.width
        var dialogWidth = screenWidth * 0.85
        var contentWidth = dialogWidth - 28 * 2 * (screenWidth / 750)
        var displayW = contentWidth
        var ratio = imgW / displayW
        var sx = cropX * ratio
        var sy = cropY * ratio
        var sw = cropBoxSize * ratio
        var sh = cropBoxSize * ratio

        var ctx = wx.createCanvasContext('profileCropCanvas', that)
        var canvasSize = 300

        ctx.beginPath()
        ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(cropImageSrc, sx, sy, sw, sh, 0, 0, canvasSize, canvasSize)
        ctx.draw(false, function () {
          wx.canvasToTempFilePath({
            canvasId: 'profileCropCanvas',
            x: 0, y: 0,
            width: canvasSize, height: canvasSize,
            destWidth: canvasSize, destHeight: canvasSize,
            success(res2) {
              that.setData({ userAvatar: res2.tempFilePath, cropDialogVisible: false })
              store.updateUserAvatar(res2.tempFilePath)
            },
            fail() {
              that.setData({ userAvatar: cropImageSrc, cropDialogVisible: false })
              store.updateUserAvatar(cropImageSrc)
            }
          }, that)
        })
      },
      fail() {
        that.setData({ userAvatar: cropImageSrc, cropDialogVisible: false })
        store.updateUserAvatar(cropImageSrc)
      }
    })
  },

  // ===== 统计卡片导航 =====
  goAllCards() {
    wx.navigateTo({
      url: '/pages/card-list/card-list?type=all'
    })
  },

  goFavorites() {
    wx.navigateTo({
      url: '/pages/card-list/card-list?type=favorites'
    })
  },

  // ===== 菜单项 =====
  goSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  goAbout() {
    wx.navigateTo({
      url: '/pages/about/about'
    })
  },

  doLogout() {
    var that = this
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success(res) {
        if (res.confirm) {
          store.logout()
          that.setData({ editingName: false, editNameValue: '' })
          that.refreshData()
          wx.showToast({ title: '已退出登录', icon: 'none' })
        }
      }
    })
  },

  stopPropagation() {}
})