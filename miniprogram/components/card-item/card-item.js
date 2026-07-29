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
      this.updateDisplay(this.data.card, this.data.system)
    },
    ready() {
      if (!this.data.displayName && this.data.card && this.data.card.name) {
        this.updateDisplay(this.data.card, this.data.system)
      }
    }
  },

  methods: {
    updateDisplay(card, system) {
      if (!card) {
        this.setData({
          displayName: '',
          displayPlayer: '',
          displayDescription: '',
          profileFields: []
        })
        return
      }

      const fd = card.formData || {}
      const sys = card.system || ''

      const name = fd.name || card.name || ''
      const player = fd.player || card.player || ''
      const desc = fd.description || card.description || ''

      // 根据规则系统计算缩略图字段
      let fields = []
      if (sys === 'DND') {
        const ac = fd.ac || 0
        const dc = fd.dc !== undefined ? fd.dc : ac
        fields = [
          { label: '职业', value: this._classLabel(fd.class) },
          { label: '种族', value: fd.race || '—' },
          { label: '等级', value: fd.level || '—' },
          { label: 'AC/DC/HP', value: `${ac}/${dc}/${fd.hpMax || 0}` }
        ]
      } else if (sys === 'DAGGERHEART') {
        const hasA1 = fd.ancestry && String(fd.ancestry).trim()
        const hasA2 = fd.ancestry2 && String(fd.ancestry2).trim()
        let ancestryVal = '—'
        if (hasA1 && hasA2) {
          ancestryVal = this._dhAncestryLabel(fd.ancestry) + ' + ' + this._dhAncestryLabel(fd.ancestry2)
        } else if (hasA1) {
          ancestryVal = this._dhAncestryLabel(fd.ancestry)
        } else if (hasA2) {
          ancestryVal = this._dhAncestryLabel(fd.ancestry2)
        }
        fields = [
          { label: '职业', value: this._dhClassLabel(fd.class) },
          { label: '等级', value: fd.level || '—' },
          { label: '种族', value: ancestryVal },
          { label: '社群', value: fd.community || '—' }
        ]
      } else {
        // COC 及自定义规则
        fields = [
          { label: '职业', value: fd.occupation || '—' },
          { label: '年龄', value: fd.age != null ? String(fd.age) : '—' },
          { label: '住地', value: fd.residence || '—' },
          { label: '年份', value: fd.year || '1920s' }
        ]
      }

      const borderColor = this.hexToRgba(system ? system.accentColor : '#C8A046', 0.3)

      this.setData({
        displayName: name,
        displayPlayer: player,
        displayDescription: desc,
        profileFields: fields,
        borderColor: borderColor
      })
    },

    hexToRgba(hex, alpha) {
      if (!hex) return `rgba(200,160,70,${alpha})`
      hex = hex.replace('#', '')
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return `rgba(${r},${g},${b},${alpha})`
    },

    _classLabel(v) {
      const map = {
        fighter: '战士', wizard: '法师', ranger: '游侠', rogue: '盗贼',
        cleric: '牧师', paladin: '圣武士', druid: '德鲁伊', bard: '吟游诗人'
      }
      return (v && map[v]) || v || '—'
    },

    _dhClassLabel(v) {
      const map = {
        warrior: '战士', ranger: '游侠', rogue: '盗贼',
        sorcerer: '法师', druid: '德鲁伊', binder: '缚灵者'
      }
      return (v && map[v]) || v || '—'
    },

    _dhAncestryLabel(v) {
      const map = {
        human: '人类', elf: '精灵', orc: '半兽人',
        dwarf: '矮人', halfling: '半身人'
      }
      return (v && map[v]) || v || '—'
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
      this._pressing = false
      this.setData({ pressing: false })
      if (this.pressTimer) {
        clearTimeout(this.pressTimer)
        this.pressTimer = null
      }
    },

    onTouchCancel() {
      this._pressing = false
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