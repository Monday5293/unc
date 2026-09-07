const themeUtil = require('../../utils/theme.js')

Page({
  data: {
    theme: 'dark'
  },

  onShow() {
    themeUtil.applyToPage(this)
  },

  // ===== 主题切换 =====
  onThemeToggle(e) {
    var t = e.detail.value ? 'light' : 'dark'
    themeUtil.setTheme(t)
    themeUtil.applyToPage(this)
  },

  stopPropagation() {}
})
