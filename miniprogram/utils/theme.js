/**
 * 主题工具：深色/浅色模式切换
 * 用法：
 *   页面 js:  var themeUtil = require('../../utils/theme.js')
 *             onShow() { themeUtil.applyToPage(this) }
 *   页面 wxml 根节点: <view class="xxx-page {{theme === 'light' ? 'theme-light' : ''}}">
 */
const THEME_KEY = 'trpg-theme'

var _theme = 'dark'

// 模块加载时读取本地偏好（含热重载场景）
try {
  var saved = wx.getStorageSync(THEME_KEY)
  if (saved === 'light' || saved === 'dark') _theme = saved
} catch (e) {}

function getTheme() {
  return _theme
}

function setTheme(t) {
  _theme = (t === 'light') ? 'light' : 'dark'
  try { wx.setStorageSync(THEME_KEY, _theme) } catch (e) {}
}

/**
 * 将主题应用到页面：注入 data.theme、同步导航栏与窗口背景色
 */
function applyToPage(page) {
  page.setData({ theme: _theme })
  var isLight = _theme === 'light'
  var bg = isLight ? '#F4EFE6' : '#1A1714'
  var front = isLight ? '#000000' : '#ffffff'
  wx.setNavigationBarColor({
    frontColor: front,
    backgroundColor: bg,
    fail: function () {}
  })
  if (wx.setBackgroundColor) {
    wx.setBackgroundColor({
      backgroundColor: bg,
      backgroundColorTop: bg,
      backgroundColorBottom: bg,
      fail: function () {}
    })
  }
}

module.exports = {
  getTheme: getTheme,
  setTheme: setTheme,
  applyToPage: applyToPage
}
