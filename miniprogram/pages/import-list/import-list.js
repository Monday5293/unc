const api = require('../../utils/api.js')
const store = require('../../utils/store.js')

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getSystemLogo(system) {
  const s = store.getSystemInfo(system)
  return s ? s.logo : ''
}

function getSystemColor(system) {
  const s = store.getSystemInfo(system)
  return s ? s.accentColor : '#666666'
}

function importSystemFromData(data) {
  return store.importSystemFromData(data)
}

Page({
  data: {
    forms: [],
    filteredList: [],
    filterSystem: 'ALL',
    loading: false,
    error: '',
    importingId: '',
    showJsonDialog: false,
    jsonInput: '',
    jsonImporting: false,
    showPreviewDialog: false,
    previewJsonText: '',
    previewRule: [],
    previewAccentColor: '#C8A046',
    previewLogo: '●',
    previewSystemName: '',
    showJsonEditor: false
  },

  onLoad() {
    this.refresh()
  },

  async refresh() {
    this.setData({ loading: true, error: '' })
    try {
      const forms = await api.listForms()
      const processed = forms.map(form => ({
        ...form,
        fieldCount: form.rule ? form.rule.length : 0,
        updatedAtText: formatDate(form.updatedAt),
        systemLogo: getSystemLogo(form.system),
        systemColor: getSystemColor(form.system)
      }))
      this.setData({ forms: processed })
      this.filterList()
    } catch (e) {
      this.setData({ error: e.message || '加载失败' })
    } finally {
      this.setData({ loading: false })
    }
  },

  filterList() {
    const { forms, filterSystem } = this.data
    if (filterSystem === 'ALL') {
      this.setData({ filteredList: forms })
    } else {
      this.setData({
        filteredList: forms.filter(f => f.system === filterSystem)
      })
    }
  },

  async importAsSystem(e) {
    const formId = e.currentTarget.dataset.id
    this.setData({ importingId: formId })
    try {
      const form = await api.getForm(formId)
      importSystemFromData({
        id: form.id,
        name: form.name,
        system: form.system,
        description: form.description,
        rule: form.rule,
        option: form.option
      })
      wx.showToast({
        title: '导入成功',
        icon: 'success'
      })
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/home/home'
        })
      }, 1500)
    } catch (e) {
      wx.showModal({
        title: '导入失败',
        content: e.message || '未知错误',
        showCancel: false
      })
    } finally {
      this.setData({ importingId: '' })
    }
  },

  openJsonImport() {
    this.setData({
      showJsonDialog: true,
      jsonInput: '',
      jsonImporting: false
    })
  },

  cancelJsonImport() {
    this.setData({ showJsonDialog: false })
  },

  onJsonInput(e) {
    this.setData({ jsonInput: e.detail.value })
  },

  pasteJson() {
    wx.getClipboardData({
      success: (res) => {
        this.setData({ jsonInput: res.data })
      }
    })
  },

  chooseJsonFile() {
    const that = this
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['json'],
      success(res) {
        const filePath = res.tempFiles[0].path
        const fs = wx.getFileSystemManager()
        try {
          const fileContent = fs.readFileSync(filePath, 'utf8')
          that.setData({ jsonInput: fileContent })
        } catch (e) {
          wx.showToast({
            title: '文件读取失败',
            icon: 'none'
          })
        }
      }
    })
  },

  previewJson() {
    const { jsonInput } = this.data
    if (!jsonInput.trim()) {
      wx.showToast({ title: '请输入 JSON 内容', icon: 'none' })
      return
    }

    try {
      const data = JSON.parse(jsonInput)
      const formatted = JSON.stringify(data, null, 2)

      // 提取规则和样式信息
      let rule = data.rule || []
      if (!Array.isArray(rule) && data.props && data.props.rule) {
        rule = data.props.rule
      }

      // 尝试从数据中提取系统信息
      const accentColor = data.accentColor || data.color || '#C8A046'
      const logo = data.logo || data.icon || '●'
      const systemName = data.name || data.system || '自定义规则'

      this.setData({
        showJsonDialog: false,
        showPreviewDialog: true,
        previewJsonText: formatted,
        previewRule: rule,
        previewAccentColor: accentColor,
        previewLogo: logo,
        previewSystemName: systemName,
        showJsonEditor: false
      })
    } catch (e) {
      wx.showModal({
        title: 'JSON 格式错误',
        content: e.message || '请检查 JSON 格式',
        showCancel: false
      })
    }
  },

  onPreviewJsonInput(e) {
    this.setData({ previewJsonText: e.detail.value })
  },

  cancelPreview() {
    this.setData({
      showPreviewDialog: false,
      previewJsonText: '',
      previewRule: [],
      showJsonEditor: false
    })
  },

  toggleJsonEditor() {
    this.setData({ showJsonEditor: !this.data.showJsonEditor })
  },

  confirmJsonImport() {
    const { previewJsonText } = this.data
    if (!previewJsonText.trim()) {
      wx.showToast({
        title: 'JSON 内容为空',
        icon: 'none'
      })
      return
    }

    this.setData({ jsonImporting: true })
    try {
      const data = JSON.parse(previewJsonText)
      importSystemFromData(data)
      this.setData({ showPreviewDialog: false })
      wx.showToast({
        title: '导入成功',
        icon: 'success'
      })
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/home/home'
        })
      }, 1500)
    } catch (e) {
      wx.showModal({
        title: '导入失败',
        content: e.message || 'JSON 解析错误',
        showCancel: false
      })
    } finally {
      this.setData({ jsonImporting: false })
    }
  },

  goBack() {
    wx.navigateBack()
  },

  clearJsonInput() {
    this.setData({ jsonInput: '' })
  },

  stopPropagation() {}
})
