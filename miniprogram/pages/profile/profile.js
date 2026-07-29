const store = require('../../utils/store.js')

Page({
  data: {
    userName: '',
    userAvatar: '',
    systems: [],
    stats: {},
    topStats: [],
    groupedMyCards: []
  },

  onLoad() {
    this.refreshData()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
    this.refreshData()
  },

  refreshData() {
    const state = store.getState()
    const systems = store.getSystems()
    const myCards = store.getMyCards()
    const stats = store.getStats()

    const perSystem = stats.perSystem
    const systemStats = systems
      .filter(s => perSystem[s.code])
      .slice(0, 1)
      .map(s => ({
        label: s.name,
        value: perSystem[s.code],
        color: s.accentColor
      }))

    const topStats = [
      { label: '总卡数', value: stats.total, color: '#C8A046' },
      { label: '收藏', value: stats.favorites, color: '#3B6B4A' },
      ...systemStats
    ]

    const groups = []
    for (const sys of systems) {
      const items = myCards.filter(c => c.system === sys.code)
      if (items.length) {
        groups.push({
          system: sys.code,
          name: sys.name,
          logo: sys.logo,
          accent: sys.accentColor,
          items
        })
      }
    }

    this.setData({
      userName: state.userName,
      userAvatar: state.userAvatar,
      systems,
      stats,
      topStats,
      groupedMyCards: groups
    })
  },

  openCard(e) {
    const id = e.currentTarget.dataset.id
    console.log('[profile] openCard id:', id)
    wx.navigateTo({
      url: `/pages/card-detail/card-detail?id=${id}`,
      fail: (err) => {
        console.error('[profile] navigateTo failed:', JSON.stringify(err))
      }
    })
  },

  goHome() {
    wx.switchTab({
      url: '/pages/home/home'
    })
  },

  goDesigner() {
    wx.showToast({
      title: '网页设计器功能开发中',
      icon: 'none'
    })
  },

  goImport() {
    wx.navigateTo({
      url: '/pages/import-list/import-list'
    })
  },

  goSettings() {
    wx.showToast({
      title: '设置功能开发中',
      icon: 'none'
    })
  },

  goAbout() {
    wx.showToast({
      title: 'v1.0.0 · 跑团角色卡',
      icon: 'none'
    })
  },

  goJsonIO() {
    wx.navigateTo({
      url: '/pages/json-io/json-io'
    })
  }
})
