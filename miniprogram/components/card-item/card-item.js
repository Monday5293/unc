Component({
  properties: {
    card: {
      type: Object,
      value: {}
    },
    system: {
      type: Object,
      value: {}
    }
  },

  data: {
    pressing: false,
    firstFields: []
  },

  observers: {
    'card': function(card) {
      this.computeFirstFields(card)
    }
  },

  lifetimes: {
    attached() {
      this.computeFirstFields(this.data.card)
    }
  },

  methods: {
    computeFirstFields(card) {
      if (!card || !card.formData) {
        this.setData({ firstFields: [] })
        return
      }
      const fd = card.formData
      const keys = Object.keys(fd)
      const firstFields = []
      let count = 0
      for (let i = 0; i < keys.length && count < 3; i++) {
        const k = keys[i]
        const v = fd[k]
        if (v !== '' && v !== null && v !== undefined && typeof v !== 'object') {
          firstFields.push({
            label: k,
            value: String(v)
          })
          count++
        }
      }
      this.setData({ firstFields })
    },

    onTouchStart() {
      this.setData({ pressing: true })
      this._longPressed = false
      this.pressTimer = setTimeout(() => {
        if (this.data.pressing) {
          this._longPressed = true
          this.triggerEvent('longPress', { card: this.data.card })
          wx.vibrateShort({ type: 'light' })
        }
      }, 500)
    },

    onTouchEnd() {
      this.setData({ pressing: false })
      if (this.pressTimer) {
        clearTimeout(this.pressTimer)
        this.pressTimer = null
      }
    },

    onTouchCancel() {
      this.onTouchEnd()
    },

    onClickCard() {
      if (this._longPressed) {
        this._longPressed = false
        return
      }
      this.triggerEvent('click', { card: this.data.card })
    },

    onToggleFav() {
      this.triggerEvent('toggleFav', { card: this.data.card })
    }
  }
})
