Component({
  properties: {
    systems: {
      type: Array,
      value: []
    },
    current: {
      type: String,
      value: ''
    }
  },

  data: {
    pressingCode: ''
  },

  methods: {
    onSystemTap(e) {
      const system = e.currentTarget.dataset.system
      if (this.data.pressingCode === system.code) {
        this.setData({ pressingCode: '' })
        return
      }
      this.triggerEvent('change', { system: system.code })
    },

    onSystemLongPress(e) {
      const system = e.currentTarget.dataset.system
      this.setData({ pressingCode: system.code })
      this.triggerEvent('pressSystem', { system })
      wx.vibrateShort({ type: 'light' })
    },

    onAddTap() {
      this.triggerEvent('add')
    }
  }
})
