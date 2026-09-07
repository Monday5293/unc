const store = require('../../utils/store.js')
const themeUtil = require('../../utils/theme.js')

Page({
  data: {
    jsonInput: '',
    importType: 'system',
    exportType: 'system',
    systems: [],
    selectedSystemIndex: 0
  },

  onLoad() {
    const systems = store.getSystems()
    this.setData({ systems })
  },

  onShow() {
    themeUtil.applyToPage(this)
  },

  onImportTypeChange(e) {
    this.setData({ importType: e.currentTarget.dataset.type })
  },

  onExportTypeChange(e) {
    this.setData({ exportType: e.currentTarget.dataset.type })
  },

  onJsonInput(e) {
    this.setData({ jsonInput: e.detail.value })
  },

  onSystemChange(e) {
    this.setData({ selectedSystemIndex: e.detail.value })
  },

  doImport() {
    const { jsonInput, importType } = this.data
    if (!jsonInput.trim()) {
      wx.showToast({
        title: '请输入 JSON 内容',
        icon: 'none'
      })
      return
    }

    try {
      const data = JSON.parse(jsonInput)

      if (importType === 'system') {
        const newSys = store.importSystemFromData({
          name: data.name || data.fullName || '导入的规则',
          system: data.system || 'CUSTOM',
          description: data.description || '',
          rule: data.rule || data.rules || [],
          option: data.option || {}
        })
        wx.showToast({
          title: '导入成功',
          icon: 'success'
        })
        setTimeout(() => {
          wx.switchTab({ url: '/pages/home/home' })
        }, 1500)
      } else if (importType === 'card') {
        // TODO: 导入角色卡 JSON
        if (!data.system || !data.name) {
          throw new Error('JSON 格式不正确：缺少 system 或 name 字段')
        }
        const newCard = store.addCard(
          data.system,
          data.name,
          data.description || ''
        )
        if (data.formData) {
          store.updateCardFormData(newCard.id, data.formData)
        }
        wx.showToast({
          title: '导入成功',
          icon: 'success'
        })
        setTimeout(() => {
          wx.navigateTo({
            url: `/pages/card-detail/card-detail?id=${newCard.id}`,
            fail: (err) => {
              console.error('[json-io] navigateTo failed:', JSON.stringify(err))
            }
          })
        }, 1500)
      }
    } catch (e) {
      wx.showModal({
        title: '导入失败',
        content: e.message || 'JSON 解析错误',
        showCancel: false
      })
    }
  },

  doExport() {
    const { exportType, systems, selectedSystemIndex } = this.data
    let exportData = {}

    if (exportType === 'system') {
      // TODO: 导出规则系统 JSON
      const system = systems[selectedSystemIndex]
      if (!system) {
        wx.showToast({ title: '请选择规则系统', icon: 'none' })
        return
      }
      exportData = {
        name: system.name,
        fullName: system.fullName,
        description: system.description,
        logo: system.logo,
        accentColor: system.accentColor,
        isCustom: system.isCustom,
        system: system.code,
        exportTime: new Date().toISOString(),
        rule: system.rule || [],
        option: system.option || {}
      }
    } else if (exportType === 'allCards') {
      // TODO: 导出所有角色卡 JSON
      const cards = store.getMyCards()
      exportData = {
        type: 'character-cards',
        exportTime: new Date().toISOString(),
        count: cards.length,
        cards
      }
    }

    const jsonStr = JSON.stringify(exportData, null, 2)

    wx.setClipboardData({
      data: jsonStr,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        })
      }
    })
  },

  pasteFromClipboard() {
    wx.getClipboardData({
      success: (res) => {
        this.setData({ jsonInput: res.data })
        wx.showToast({
          title: '已粘贴',
          icon: 'success'
        })
      }
    })
  },

  clearInput() {
    this.setData({ jsonInput: '' })
  },

  goBack() {
    wx.navigateBack()
  }
})
