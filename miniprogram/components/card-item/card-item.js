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
    displayName: '',
    displayPlayer: '',
    displayDescription: '',
    profileFields: [],
    borderColor: 'rgba(200,160,70,0.3)'
  },

  observers: {
    'card, system': function(card, system) {
      this.updateDisplay(card, system)
    }
  },

  lifetimes: {
    attached() {
      console.log('[card-item] attached, card:', this.data.card ? this.data.card.id : 'none')
      this.updateDisplay(this.data.card, this.data.system)
    },
    ready() {
      console.log('[card-item] ready, card:', this.data.card ? this.data.card.id : 'none')
      console.log('[card-item] ready, displayName:', this.data.displayName)
      // 如果 attached 时数据还没到，ready 时再补一次
      if (!this.data.displayName && this.data.card && this.data.card.name) {
        console.log('[card-item] ready 补调 updateDisplay')
        this.updateDisplay(this.data.card, this.data.system)
      }
    }
  },

  methods: {
    updateDisplay(card, system) {
      console.log('[card-item] updateDisplay 被调用')
      console.log('[card-item] card 对象:', card ? JSON.stringify({ id: card.id, name: card.name, player: card.player, hasFormData: !!card.formData, formDataKeys: card.formData ? Object.keys(card.formData) : [] }) : 'null/undefined')
      console.log('[card-item] system 对象:', system ? JSON.stringify({ code: system.code, accentColor: system.accentColor }) : 'null/undefined')

      if (!card) {
        console.log('[card-item] card 为空，清空显示')
        this.setData({
          displayName: '',
          displayPlayer: '',
          displayDescription: '',
          profileFields: []
        })
        return
      }

      const fd = card.formData || {}
      console.log('[card-item] formData (fd):', JSON.stringify(fd))
      console.log('[card-item] occupation:', fd.occupation, '| age:', fd.age, '| residence:', fd.residence, '| year:', fd.year)

      const name = fd.name || card.name || ''
      const player = fd.player || card.player || ''
      const desc = fd.description || card.description || ''
      console.log('[card-item] displayName:', name, '| displayPlayer:', player, '| displayDescription:', desc ? desc.substring(0, 20) + '...' : '(空)')

      const fields = [
        { label: '职业', value: fd.occupation || '-' },
        { label: '年龄', value: fd.age != null ? String(fd.age) : '-' },
        { label: '住地', value: fd.residence || '-' },
        { label: '年份', value: fd.year || '-' },
      ]
      console.log('[card-item] profileFields:', JSON.stringify(fields))

      const borderColor = this.hexToRgba(system ? system.accentColor : '#C8A046', 0.3)
      console.log('[card-item] borderColor:', borderColor)

      this.setData({
        displayName: name,
        displayPlayer: player,
        displayDescription: desc,
        profileFields: fields,
        borderColor: borderColor
      })
      console.log('[card-item] setData 完成，当前 data:', JSON.stringify({
        displayName: this.data.displayName,
        displayPlayer: this.data.displayPlayer,
        displayDescription: this.data.displayDescription ? this.data.displayDescription.substring(0, 20) + '...' : '(空)',
        profileFieldsCount: this.data.profileFields.length
      }))
    },

    hexToRgba(hex, alpha) {
      if (!hex) return `rgba(200,160,70,${alpha})`
      hex = hex.replace('#', '')
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return `rgba(${r},${g},${b},${alpha})`
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