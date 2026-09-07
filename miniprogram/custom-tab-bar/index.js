const themeUtil = require('../utils/theme.js')

Component({
  options: {
    // 允许 app.wxss 的 .theme-light 变量覆盖规则作用于组件内
    styleIsolation: 'apply-shared'
  },
  data: {
    selected: 0,
    theme: 'dark',
    list: [
      {
        pagePath: '/pages/home/home',
        text: '卡面'
      },
      {
        pagePath: '/pages/profile/profile',
        text: '我的'
      }
    ]
  },

  lifetimes: {
    attached() {
      this.setData({ theme: themeUtil.getTheme() })
    }
  },

  pageLifetimes: {
    show() {
      this.setData({ theme: themeUtil.getTheme() })
    }
  },

  methods: {
    switchTab(e) {
      const index = e.currentTarget.dataset.index
      const item = this.data.list[index]
      if (this.data.selected === index) return
      wx.switchTab({
        url: item.pagePath
      })
    }
  }
})
