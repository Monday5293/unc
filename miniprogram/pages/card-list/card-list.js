const store = require('../../utils/store.js')
const themeUtil = require('../../utils/theme.js')

// 计算缩略图4个介绍字段（复用 card-item 组件逻辑）
function buildProfileFields(card) {
  var fd = card.formData || {}
  var sys = card.system || ''

  if (sys === 'DND') {
    var ac = fd.ac || 0
    var dc = fd.dc !== undefined ? fd.dc : ac
    return [
      { label: '职业', value: classLabelDnd(fd.class) },
      { label: '种族', value: fd.race || '—' },
      { label: '等级', value: fd.level || '—' },
      { label: 'AC/DC/HP', value: ac + '/' + dc + '/' + (fd.hpMax || 0) }
    ]
  } else if (sys === 'DAGGERHEART') {
    var hasA1 = fd.ancestry && String(fd.ancestry).trim()
    var hasA2 = fd.ancestry2 && String(fd.ancestry2).trim()
    var ancestryVal = '—'
    if (hasA1 && hasA2) {
      ancestryVal = dhAncestryLabel(fd.ancestry) + ' + ' + dhAncestryLabel(fd.ancestry2)
    } else if (hasA1) {
      ancestryVal = dhAncestryLabel(fd.ancestry)
    } else if (hasA2) {
      ancestryVal = dhAncestryLabel(fd.ancestry2)
    }
    return [
      { label: '职业', value: dhClassLabel(fd.class) },
      { label: '等级', value: fd.level || '—' },
      { label: '种族', value: ancestryVal },
      { label: '社群', value: fd.community || '—' }
    ]
  } else {
    // COC 及自定义规则
    return [
      { label: '职业', value: fd.occupation || '—' },
      { label: '年龄', value: fd.age != null ? String(fd.age) : '—' },
      { label: '住地', value: fd.residence || '—' },
      { label: '年份', value: fd.year || '1920s' }
    ]
  }
}

function classLabelDnd(v) {
  var map = {
    fighter: '战士', wizard: '法师', ranger: '游侠', rogue: '盗贼',
    cleric: '牧师', paladin: '圣武士', druid: '德鲁伊', bard: '吟游诗人'
  }
  return (v && map[v]) || v || '—'
}

function dhClassLabel(v) {
  var map = {
    warrior: '战士', ranger: '游侠', rogue: '盗贼',
    sorcerer: '法师', druid: '德鲁伊', binder: '缚灵者'
  }
  return (v && map[v]) || v || '—'
}

function dhAncestryLabel(v) {
  var map = {
    human: '人类', elf: '精灵', orc: '半兽人',
    dwarf: '矮人', halfling: '半身人'
  }
  return (v && map[v]) || v || '—'
}

Page({
  data: {
    type: 'all',
    title: '',
    totalCount: 0,
    groupedCards: []
  },

  onLoad(options) {
    var type = options.type || 'all'
    var title = type === 'favorites' ? '收藏的角色卡' : '全部角色卡'
    this.setData({ type: type, title: title })
    wx.setNavigationBarTitle({ title: title })
    this.refreshData()
  },

  onShow() {
    themeUtil.applyToPage(this)
    this.refreshData()
  },

  refreshData() {
    var type = this.data.type
    var cards = type === 'favorites' ? store.getFavoriteCards() : store.getMyCards()
    var systems = store.getSystems()

    var groups = []
    for (var i = 0; i < systems.length; i++) {
      var sys = systems[i]
      var items = []
      for (var j = 0; j < cards.length; j++) {
        if (cards[j].system === sys.code) {
          var card = cards[j]
          items.push({
            id: card.id,
            name: card.name,
            player: card.player || '',
            avatar: card.avatar || '',
            favorite: card.favorite,
            system: card.system,
            fields: buildProfileFields(card)
          })
        }
      }
      if (items.length > 0) {
        groups.push({
          system: sys.code,
          name: sys.name,
          logo: sys.logo,
          accent: sys.accentColor,
          items: items
        })
      }
    }

    this.setData({ totalCount: cards.length, groupedCards: groups })
  },

  openCard(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/card-detail/card-detail?id=' + id
    })
  }
})
