const store = require('./utils/store.js')

App({
  onLaunch() {
    // 初始化微信云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-d0gwarelhb75141fd',
        traceUser: true
      })
    }
    store.init()
  },
  globalData: {
    userInfo: null
  }
})
