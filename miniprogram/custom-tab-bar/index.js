Component({
  data: {
    selected: 0,
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