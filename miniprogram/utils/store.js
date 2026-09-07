const PRESET_SYSTEMS = [
  {
    code: 'COC',
    name: '克苏鲁的呼唤',
    fullName: 'Call of Cthulhu',
    accentColor: '#3B6B4A',
    logo: '🌿',
    description: '霍华德·菲利普·洛夫克拉夫特笔下的宇宙恐怖世界，调查员在禁忌古卷与古老神祇之间挣扎求生。',
    isCustom: false,
    rule: [],
    option: {}
  },
  {
    code: 'DND',
    name: '龙与地下城',
    fullName: 'Dungeons & Dragons',
    accentColor: '#C8A046',
    logo: '🐉',
    description: '经典奇幻跑团规则，冒险者组成小队探索地下城、对抗巨龙、追寻宝藏与荣耀。',
    isCustom: false,
    rule: [],
    option: {}
  },
  {
    code: 'DAGGERHEART',
    name: '匕首之心',
    fullName: 'Daggerheart',
    accentColor: '#9BA8B5',
    logo: '🗡️',
    description: 'Critical Role 出品的奇幻跑团新规则，以双骰子系统与英雄叙事见长。',
    isCustom: false,
    rule: [],
    option: {}
  }
]

const PRESET_CARDS = [
  {
    id: 'coc-001',
    system: 'COC',
    name: '吉尔·斯汀雷',
    player: '周一',
    avatar: '',
    formData: {
      name: '吉尔·斯汀雷',
      occupation: '酒保',
      age: 27,
      gender: '女',
      residence: '美国',
      str: 40,
      con: 55,
      siz: 50,
      dex: 70,
      app: 80,
      int: 70,
      pow: 65,
      edu: 50,
      hp: 10,
      hpMax: 10,
      mp: 13,
      mpMax: 13,
      san: 65,
      sanMax: 65,
      luck: 55,
      skill_libraryUse: 50,
      skill_spotHidden: 80,
      skill_listen: 54,
      skill_dodge: 35,
      skill_accounting: 6,
      skill_anthropology: 1,
      skill_appraise: 5,
      skill_archaeology: 1,
      skill_charm: 16,
      skill_climb: 20,
      skill_computer: 5,
      skill_creditRating: 18,
      skill_cthulhuMythos: 0,
      skill_disguise: 5,
      skill_driveAuto: 20,
      skill_elecRepair: 10,
      skill_electronics: 1,
      skill_fastTalk: 5,
      skill_fightingBrawl: 26,
      skill_firearmsHandgun: 20,
      skill_firstAid: 60,
      skill_history: 5,
      skill_intimidate: 15,
      skill_jump: 20,
      skill_languageOther: 60,
      skill_languageOther_name: '法语',
      skill_languageOwn: 50,
      skill_law: 5,
      skill_locksmith: 1,
      skill_mechRepair: 10,
      skill_medicine: 1,
      skill_naturalWorld: 10,
      skill_navigate: 10,
      skill_occult: 5,
      skill_opHeavyMachine: 1,
      skill_persuade: 70,
      skill_psychoanalysis: 52,
      skill_psychology: 70,
      skill_ride: 5,
      skill_sleightOfHand: 10,
      skill_stealth: 20,
      skill_swim: 20,
      skill_throw: 20,
      skill_track: 10,
      skill_animal: 5,
      skill_diving: 1,
      skill_demolitions: 1,
      skill_lipReading: 1,
      skill_hypnosis: 1,
      skill_artillery: 1,
      backstory: '吉尔·斯汀雷，27岁女酒保，在街角酒吧valhalla工作。调制饮料改变人生是她的信条。',
      backstory_desc: '黑色偏紫长直发，斜刘海',
      backstory_belief: '调制饮料，改变人生',
      backstory_important: '酒馆老板dana，前女友lenore和她的妹妹gaby，家养黑猫fore',
      backstory_place: 'valhalla',
      backstory_treasure: '一张和lenore和gaby的合照，一只dana玩偶',
      backstory_trait: '爱喝啤酒，抽烟',
      backstory_wound: '',
      backstory_phobia: '',
      backstory_detail: '我叫朱莉安娜·斯汀雷（Julianne Stingray），当然，我更希望你能叫我吉尔·斯汀雷（jill Stingray），或者干脆叫jill也行，这该死的朱莉安娜跟我小时候看的那部魔法少女动画里的主角一个名，那帮上初中的死小孩就会拿这个嘲笑我，导致我现在听到这名字就莫名的来火。\n说回我，我目前独居，我妈，或者说前妈，整天不是酗酒就是打牌，在我还在念小学时就跟我爸分手了，我的童年是和一个每天出差的爸还有佬爷度过的，不知道为什么，虽然我妈跑了但她爸倒是对我很好，时常是骂完我爸下一秒就来和我玩，我不知道，也许这是他自己爱我们的方式吧，只不过他去年去世了，"是寿终正寝"，在接到我爸电话他很平静的和我说，嗯...总会有那么一天的，我告诉自己。\n说起学历，我真的不喜欢念书，中学也是念了个技术学校就出来了，不过那时候老师教的东西我早就忘完了，在毕业后我找过许多工作，粉刷匠，快递员，销售员。直到3年前，我来到valhalla，这是一间开在街角的酒吧，不大但是很舒适，虽然时不时会有狗尿的味道。除了老板，就只有一位员工，看起来是正缺人的样子，于是我就来试试了，这一干就是3年，不得不说，酒保的工作还是蛮有意思的，有很多陌生人能和你敞开心扉聊天，和这些形形色色的人打交道很有趣，当然，不该听在我听后就会忘记。\n在一间酒吧，你不得不注意的一点就是，别让客人把自己的身子丢店里，我处理过好几起急性酒精中毒了，不知道为什么他们不能喝还来点，这不是给我增加工作量吗！\n虽然这间酒吧能给我提供的薪水并不算多，但这边的藏书和氛围弥补了一部分，我喜欢这边关于各种酒类文化的书，关于酒的颜色味道，原材料产地，研发过程一类的。\n某次和客人聊天的时候，他和我提起一种适合在酒吧玩的桌游，他说边喝边玩，大家能放开了没有架子的聊，这勾起了我的兴趣，后来在他的推荐下，我加入了跑团的圈子，每周末不上班的时候我也会抽空去跑跑团，你还真别说，这种桌游确实有让人沉浸其中的魅力。',
      backpack: '背包：一个24寸行李箱，内含（换洗衣服、3瓶基酒、2瓶果汁、一套调酒工具、一套镂空骰子）\n衣兜：内含（一盒万宝路）'
    },
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-03-02T10:30:00Z',
    favorite: true
  },
  {
    id: 'dnd-001',
    system: 'DND',
    name: '索拉·晨星',
    player: '玩家C',
    avatar: '',
    formData: {
      name: '索拉·晨星',
      race: '精灵',
      class: 'ranger',
      level: 5,
      profBonus: 3,
      background: '猎人',
      alignment: '混乱善良',
      str: 12,
      dex: 18,
      con: 14,
      int: 12,
      wis: 16,
      cha: 10,
      ac: 16,
      hp: 38,
      hpMax: 41,
      hitDice: '5d10',
      savingThrows: ['str', 'dex'],
      skillProf: ['athletics', 'stealth', 'nature', 'perception', 'survival'],
      features: '宿敌（巨兽）、自然探索者、箭术战斗风格、法术施放（游侠）',
      backstory: '北境精灵部落的最后一名游侠，立誓守护部落遗址中的远古精灵之灵。沉默寡言，箭无虚发。',
      backstory_skill: '生存、自然',
      backstory_tool: '制革工具',
      backstory_language: '精灵语、通用语',
      backstory_equipment: '长弓、箭袋（20支）、皮甲、探索者工具包',
      backstory_special: '流浪者特性：能通过星象判断方位',
      backstory_feature: '宿敌：巨兽'
    },
    createdAt: '2026-01-20T09:15:00Z',
    updatedAt: '2026-04-01T11:20:00Z',
    favorite: true
  },
  {
    id: 'daggerheart-001',
    system: 'DAGGERHEART',
    name: '凯瑟·银刃',
    player: '玩家E',
    avatar: '',
    formData: {
      name: '凯瑟·银刃',
      ancestry: 'human',
      class: 'binder',
      level: 3,
      tier: 1,
      community: '黑石镇',
      agility: 1,
      strength: 0,
      finesse: 1,
      instinct: 2,
      presence: 2,
      knowledge: 1,
      staminaMax: 18,
      stamina: 15,
      stressMax: 6,
      stress: 2,
      experience: '已标记：通灵仪式、边境法律 / 未标记：古语研究',
      backstory: '自幼能听见亡魂低语，被族中视为异象。师从游方缚灵者，于黑石镇立誓为无主之魂寻觅归宿。',
      dh_backstory_intro: '自幼能听见亡魂低语，被族中视为异象。',
      dh_backstory_traits: '沉默寡言，直觉敏锐，对亡魂抱有同情。',
      dh_backstory_bio: '师从游方缚灵者，于黑石镇立誓为无主之魂寻觅归宿。',
      dh_backstory_milestones: '12岁：首次通灵 / 18岁：离开部落 / 22岁：成为缚灵者学徒',
      dh_adventure_log: '',
      dh_inventory: '缚灵符咒、旅行者背包、黑石镇通行证'
    },
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-04-10T18:45:00Z',
    favorite: true
  }
]

const STORAGE_KEY_SYSTEMS = 'trpg-custom-systems'
const STORAGE_KEY_CARDS_PREFIX = 'trpg-cards-'
const STORAGE_KEY_HIDDEN_SYSTEMS = 'trpg-hidden-systems'
const STORAGE_KEY_USER = 'trpg-user-info'
const STORAGE_KEY_LOGIN = 'trpg-login-state'
const STORAGE_KEY_CLOUD_MIGRATED = 'trpg-cloud-migrated'

// ===== 云数据库辅助函数（通过云函数代理） =====

function _callCardsCloud(action, data) {
  if (!state.isLoggedIn || !state.userId) return
  return wx.cloud.callFunction({
    name: 'cards',
    data: Object.assign({ action: action, userId: state.userId }, data)
  }).then(function (res) {
    console.log('[store] _callCardsCloud', action, 'success')
    return res.result
  }).catch(function (err) {
    console.error('[store] _callCardsCloud', action, 'error:', err)
  })
}

function _syncCardsFromCloud() {
  if (!state.isLoggedIn || !state.userId) return
  console.log('[store] _syncCardsFromCloud start')
  _callCardsCloud('sync', {}).then(function (result) {
    if (!result || !result.success) return
    var cloudData = result.data || []
    console.log('[store] _syncCardsFromCloud got', cloudData.length, 'cards from cloud')
    if (cloudData.length > 0) {
      var cloudCards = cloudData.map(function (doc) {
        return {
          id: doc.cardId,
          system: doc.system,
          name: doc.name,
          player: doc.player,
          avatar: doc.avatar || '',
          description: '',
          formData: doc.formData || {},
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
          favorite: doc.favorite || false
        }
      })
      state.customCards = cloudCards
      state.cards = [].concat(PRESET_CARDS, state.customCards)
      saveCustomCards(state.currentOpenid, state.customCards)
      console.log('[store] _syncCardsFromCloud updated state, customCards:', state.customCards.length)
    } else {
      var localCards = loadCustomCards(state.currentOpenid)
      if (localCards.length > 0) {
        console.log('[store] _syncCardsFromCloud migrating', localCards.length, 'local cards to cloud')
        _migrateLocalCardsToCloud(localCards)
      }
    }
  })
}

function _cardToCloudData(card) {
  return {
    cardId: card.id,
    system: card.system,
    name: card.name,
    player: card.player,
    avatar: card.avatar || '',
    formData: card.formData || {},
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
    favorite: card.favorite || false
  }
}

function _uploadCardToCloud(card) {
  _callCardsCloud('add', { card: _cardToCloudData(card) })
}

function _updateCardInCloud(card) {
  _callCardsCloud('update', { cardId: card.id, card: _cardToCloudData(card) })
}

function _deleteCardFromCloud(cardId) {
  _callCardsCloud('delete', { cardId: cardId })
}

function _migrateLocalCardsToCloud(cards) {
  if (!state.isLoggedIn || !state.userId) return
  console.log('[store] _migrateLocalCardsToCloud uploading', cards.length, 'cards')
  var cloudCards = cards.map(function (c) { return _cardToCloudData(c) })
  _callCardsCloud('migrate', { cards: cloudCards })
}

// ===== 状态 =====
let state = {
  customSystems: [],
  customCards: [],
  hiddenSystems: [],
  cards: [],
  currentSystem: 'COC',
  searchKeyword: '',
  userName: '跑团旅人',
  userAvatar: '',
  userId: '',
  isLoggedIn: false,
  currentOpenid: '',
  cachedForms: {},
}

function loadHiddenSystems() {
  try {
    const raw = wx.getStorageSync(STORAGE_KEY_HIDDEN_SYSTEMS)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return []
}

function saveHiddenSystems(codes) {
  try {
    wx.setStorageSync(STORAGE_KEY_HIDDEN_SYSTEMS, JSON.stringify(codes))
  } catch (e) {}
}

function loadCustomSystems() {
  try {
    const raw = wx.getStorageSync(STORAGE_KEY_SYSTEMS)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return []
}

function saveCustomSystems(systems) {
  try {
    wx.setStorageSync(STORAGE_KEY_SYSTEMS, JSON.stringify(systems))
  } catch (e) {}
}

function loadCustomCards(phone) {
  if (!phone) return []
  try {
    var raw = wx.getStorageSync(STORAGE_KEY_CARDS_PREFIX + phone)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  // 迁移旧数据：如果存在旧的 trpg-custom-cards 且当前账号无数据，则迁移
  try {
    var oldRaw = wx.getStorageSync('trpg-custom-cards')
    if (oldRaw) {
      var oldCards = JSON.parse(oldRaw)
      if (oldCards.length > 0) {
        wx.setStorageSync(STORAGE_KEY_CARDS_PREFIX + phone, JSON.stringify(oldCards))
        wx.removeStorageSync('trpg-custom-cards')
        return oldCards
      }
    }
  } catch (e) {}
  return []
}

function saveCustomCards(phone, cards) {
  if (!phone) return
  try {
    wx.setStorageSync(STORAGE_KEY_CARDS_PREFIX + phone, JSON.stringify(cards))
  } catch (e) {}
}

function generateColor(seed) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 45%, 45%)`
}

function init(skipCloud) {
  state.customSystems = loadCustomSystems()
  state.hiddenSystems = loadHiddenSystems()

  // 加载登录状态（基于 userId）
  try {
    const loginData = wx.getStorageSync(STORAGE_KEY_LOGIN)
    if (loginData) {
      const parsed = JSON.parse(loginData)
      if (parsed.openid) {
        state.currentOpenid = parsed.openid
        state.userId = parsed.userId || ''
        state.isLoggedIn = true
        state.customCards = loadCustomCards(parsed.openid)
      }
    } else {
      state.customCards = []
    }
  } catch (e) {
    state.customCards = []
  }
  state.cards = [...PRESET_CARDS, ...state.customCards]

  // 加载用户信息
  try {
    const userInfo = wx.getStorageSync(STORAGE_KEY_USER)
    if (userInfo) {
      const parsed = JSON.parse(userInfo)
      state.userName = parsed.name || '跑团旅人'
      state.userAvatar = parsed.avatar || ''
    }
  } catch (e) {}

  // 异步从云端同步卡片数据（模块加载时跳过，等 app.js 中 wx.cloud.init 完成后调用）
  if (!skipCloud) {
    _syncCardsFromCloud()
  }
}

function getSystems() {
  const all = [...PRESET_SYSTEMS, ...state.customSystems]
  return all.filter(s => !state.hiddenSystems.includes(s.code))
}

function getCurrentSystemInfo() {
  const systems = getSystems()
  return systems.find(s => s.code === state.currentSystem) || systems[0]
}

function setSystem(system) {
  state.currentSystem = system
}

function setSearch(keyword) {
  state.searchKeyword = keyword
}

// COC 属性缩写→中文名映射
var COC_ATTR_MAP = {
  str: '力量', dex: '敏捷', pow: '意志', con: '体质',
  app: '外貌', edu: '教育', siz: '体型', int: '智力', luck: '幸运'
}

/**
 * 构建卡片的扩展搜索文本（包含属性中文名+值、经历模组/描述等）
 */
function buildSearchText(card) {
  try {
    var fd = card.formData
    if (!fd || typeof fd !== 'object') fd = {}
    var parts = [card.name || '', card.description || '']

    // 遍历 formData：对简单值直接拼接，对数组提取 label/value
    var fdKeys = Object.keys(fd)
    for (var i = 0; i < fdKeys.length; i++) {
      var k = fdKeys[i]
      var v = fd[k]
      if (v === null || v === undefined) continue

      if (k === 'experiences' && Array.isArray(v)) {
        // 调查员经历：提取模组名和变化描述
        for (var j = 0; j < v.length; j++) {
          if (v[j] && typeof v[j] === 'object') {
            parts.push(v[j].label || '')
            parts.push(v[j].value || '')
          }
        }
      } else if (typeof v === 'string' || typeof v === 'number') {
        parts.push(String(v))
        // COC 属性：同时加入 缩写+值 和 中文名+值（如 "edu80" "教育80"）
        var attrName = COC_ATTR_MAP[k]
        if (attrName) {
          parts.push(k + String(v))
          parts.push(attrName + String(v))
        }
      }
    }

    return parts.join(' ').toLowerCase()
  } catch (err) {
    console.error('[store] buildSearchText error:', err)
    // 出错时回退到简单搜索：只匹配 name + description + formData 值拼接
    var fd = card.formData || {}
    var simpleValues = Object.keys(fd).map(function (k) { return String(fd[k] || '') })
    return [card.name || '', card.description || ''].concat(simpleValues).join(' ').toLowerCase()
  }
}

function getFilteredCards() {
  var keyword = state.searchKeyword.trim().toLowerCase()
  return state.cards.filter(function (c) {
    if (c.system !== state.currentSystem) return false
    if (!state.isLoggedIn && c.id.indexOf('card-') === 0) return false
    if (!keyword) return true

    // 使用扩展搜索文本
    var searchText = buildSearchText(c)
    return searchText.indexOf(keyword) !== -1
  })
}

function getFavoriteCards() {
  return state.cards.filter(function (c) {
    if (!state.isLoggedIn && c.id.indexOf('card-') === 0) return false
    return c.favorite
  })
}

function getMyCards() {
  if (!state.isLoggedIn) return state.cards.filter(function (c) { return c.id.indexOf('card-') !== 0 })
  return state.cards
}

function getStats() {
  var visibleCards = state.isLoggedIn ? state.cards : state.cards.filter(function (c) { return c.id.indexOf('card-') !== 0 })
  const counts = {}
  for (const c of visibleCards) {
    counts[c.system] = (counts[c.system] || 0) + 1
  }
  return {
    total: visibleCards.length,
    favorites: getFavoriteCards().length,
    perSystem: counts
  }
}

function toggleFavorite(cardId) {
  const card = state.cards.find(c => c.id === cardId)
  if (card) {
    card.favorite = !card.favorite
    card.updatedAt = new Date().toISOString()
    persistCustomCards()
    _updateCardInCloud(card)
  }
}

function getCardById(id) {
  const result = state.cards.find(c => c.id === id)
  if (!result) {
    console.log('[store] getCardById NOT FOUND, id:', id, 'cards count:', state.cards.length)
  }
  return result
}

function getSystemInfo(system) {
  return getSystems().find(s => s.code === system)
}

function addCustomSystem(info) {
  const code = `CUSTOM-${info.id}`
  if (state.customSystems.find(s => s.code === code)) return
  const color = generateColor(code)
  const newSys = {
    code,
    name: info.name,
    fullName: info.name,
    accentColor: color,
    logo: '●',
    description: info.description || '自定义规则系统',
    isCustom: true,
    rule: info.rule,
    option: info.option
  }
  state.customSystems.push(newSys)
  saveCustomSystems(state.customSystems)
  return newSys
}

function importSystemFromData(data) {
  const rule = data.rule || data.rules || []
  if (!Array.isArray(rule) || rule.length === 0) {
    throw new Error('JSON 格式不正确：缺少 rule 字段或规则为空')
  }

  const id = `import-${Date.now()}`
  const newSys = addCustomSystem({
    id,
    name: data.name || data.fullName || '导入的规则',
    system: data.system || 'CUSTOM',
    description: data.description || '',
    rule: rule,
    option: data.option || {}
  })

  if (!newSys) {
    throw new Error('规则系统创建失败，可能已存在同名系统')
  }

  setSystem(newSys.code)
  return newSys
}

function deleteSystem(code) {
  const customIdx = state.customSystems.findIndex(s => s.code === code)
  if (customIdx > -1) {
    state.customSystems.splice(customIdx, 1)
    saveCustomSystems(state.customSystems)
    const toRemove = state.customCards.filter(c => c.system === code)
    for (const card of toRemove) {
      const cIdx = state.cards.findIndex(c => c.id === card.id)
      if (cIdx > -1) state.cards.splice(cIdx, 1)
      const ccIdx = state.customCards.findIndex(c => c.id === card.id)
      if (ccIdx > -1) state.customCards.splice(ccIdx, 1)
    }
    persistCustomCards()
  } else {
    if (!state.hiddenSystems.includes(code)) {
      state.hiddenSystems.push(code)
      saveHiddenSystems(state.hiddenSystems)
    }
  }
  if (state.currentSystem === code && getSystems().length > 0) {
    state.currentSystem = getSystems()[0].code
  }
  return true
}

function addCard(system, name, formData = {}) {
  console.log('[store] addCard START:', system, name, JSON.stringify(formData).slice(0, 200))
  const sysInfo = getSystemInfo(system)
  const newCard = {
    id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    system,
    name,
    player: state.userName,
    avatar: '',
    description: '',
    rule: sysInfo ? (sysInfo.rule || []) : [],
    formData: { name: name, player: state.userName, ...formData },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    favorite: false
  }
  console.log('[store] addCard newCard.id:', newCard.id)
  state.cards.push(newCard)
  state.customCards.push(newCard)
  console.log('[store] addCard state.cards.length:', state.cards.length)
  persistCustomCards()
  _uploadCardToCloud(newCard)
  console.log('[store] addCard DONE, returning card')
  return newCard
}

function deleteCard(cardId) {
  const idx = state.cards.findIndex(c => c.id === cardId)
  if (idx > -1) {
    state.cards.splice(idx, 1)
  }
  const cIdx = state.customCards.findIndex(c => c.id === cardId)
  if (cIdx > -1) {
    state.customCards.splice(cIdx, 1)
  }
  persistCustomCards()
  _deleteCardFromCloud(cardId)
}

function updateCardFormData(cardId, formData) {
  const card = state.cards.find(c => c.id === cardId)
  if (card) {
    card.formData = { ...formData }
    card.updatedAt = new Date().toISOString()
    persistCustomCards()
    _updateCardInCloud(card)
  }
}

function updateCardAvatar(cardId, avatarPath) {
  const card = state.cards.find(c => c.id === cardId)
  if (card) {
    card.avatar = avatarPath
    card.updatedAt = new Date().toISOString()
    persistCustomCards()
    _updateCardInCloud(card)
  }
}

function persistCustomCards() {
  saveCustomCards(state.currentOpenid, state.customCards)
}

function _persistUserName(name) {
  try {
    var userInfo = wx.getStorageSync(STORAGE_KEY_USER)
    var parsed = userInfo ? JSON.parse(userInfo) : {}
    parsed.name = name
    wx.setStorageSync(STORAGE_KEY_USER, JSON.stringify(parsed))
  } catch (e) {}
}

function updateUserName(name) {
  return new Promise(function (resolve) {
    // 云端校验通过后才更新本地，保证两边一致
    if (!state.userId) {
      state.userName = name
      _persistUserName(name)
      resolve({ success: true })
      return
    }
    wx.cloud.callFunction({
      name: 'auth',
      data: { action: 'updateName', userId: state.userId, newName: name }
    }).then(function (cloudRes) {
      var result = cloudRes.result || {}
      if (result.success) {
        state.userName = name
        _persistUserName(name)
        resolve({ success: true })
      } else {
        resolve({ success: false, errMsg: result.errMsg || '修改失败' })
      }
    }).catch(function (err) {
      console.error('[store] updateUserName error:', err)
      resolve({ success: false, errMsg: '网络错误，请重试' })
    })
  })
}

function updateUserAvatar(avatarPath) {
  state.userAvatar = avatarPath
  try {
    var userInfo = wx.getStorageSync(STORAGE_KEY_USER)
    var parsed = userInfo ? JSON.parse(userInfo) : {}
    parsed.avatar = avatarPath
    wx.setStorageSync(STORAGE_KEY_USER, JSON.stringify(parsed))
  } catch (e) {}
}

// ===== 全局账号登录相关 =====

/**
 * 检查昵称是否已被注册（全局查询，不绑定 OpenID）
 * @param {string} name - 用户昵称
 * @returns {Promise<{exists: boolean, name: string}>}
 */
function cloudCheckAccount(name) {
  return new Promise(function (resolve, reject) {
    if (!name || !name.trim()) { resolve({ exists: false, name: '' }); return }
    wx.cloud.callFunction({
      name: 'auth',
      data: { action: 'check', name: name.trim() }
    }).then(function (cloudRes) {
      resolve({
        exists: cloudRes.result.exists || false,
        name: cloudRes.result.name || ''
      })
    }).catch(function (err) {
      console.error('[store] cloudCheckAccount error:', err)
      resolve({ exists: false, name: '' })
    })
  })
}

/**
 * 云函数登录/注册
 * @param {string} action - 'register' 或 'login'
 * @param {string} name - 用户昵称
 * @param {string} passwordHash - 前端 SHA-256 哈希后的密码
 * @param {string} [inviteCode] - 邀请码（注册时必填）
 * @returns {Promise<{success: boolean, errMsg: string}>}
 */
function cloudLogin(action, name, passwordHash, inviteCode) {
  return new Promise(function (resolve, reject) {
    wx.cloud.callFunction({
      name: 'auth',
      data: {
        action: action,
        name: name,
        passwordHash: passwordHash,
        inviteCode: inviteCode || ''
      }
    }).then(function (cloudRes) {
      var result = cloudRes.result
      console.log('[store] cloudLogin result:', JSON.stringify(result))
      if (result.success) {
        _doLoginCallback(result.userId, result.name)
        resolve({ success: true })
      } else {
        resolve({ success: false, errMsg: result.errMsg || '登录失败' })
      }
    }).catch(function (err) {
      console.error('[store] cloudLogin error:', err)
      resolve({ success: false, errMsg: '网络错误，请重试' })
    })
  })
}

/**
 * 登录成功后的状态更新
 */
function _doLoginCallback(userId, name) {
  state.userId = userId
  state.userName = name || '跑团旅人'
  state.userAvatar = ''
  state.isLoggedIn = true
  state.currentOpenid = userId // 使用 userId 作为本地会话标识

  state.customCards = loadCustomCards(state.currentOpenid)
  state.cards = [...PRESET_CARDS, ...state.customCards]

  // 异步从云端同步
  _syncCardsFromCloud()

  // 持久化登录状态
  try {
    wx.setStorageSync(STORAGE_KEY_LOGIN, JSON.stringify({
      userId: state.userId,
      openid: state.currentOpenid,
      loggedAt: new Date().toISOString()
    }))
  } catch (e) {
    console.error('[store] persist login state failed:', e)
  }

  // 持久化用户信息
  try {
    wx.setStorageSync(STORAGE_KEY_USER, JSON.stringify({
      name: state.userName,
      avatar: state.userAvatar
    }))
  } catch (e) {
    console.error('[store] persist user info failed:', e)
  }
}

/**
 * 退出登录
 */
function logout() {
  console.log('[store] logout')
  state.isLoggedIn = false
  state.userId = ''
  state.currentOpenid = ''
  state.userName = '跑团旅人'
  state.userAvatar = ''
  try {
    wx.removeStorageSync(STORAGE_KEY_LOGIN)
  } catch (e) {}
  state.cards = PRESET_CARDS.slice()
}

function isLoggedIn() {
  return state.isLoggedIn
}

function getUserId() {
  return state.userId
}

function getState() {
  return state
}

// 模块加载时自动初始化，确保热重载后 state 仍被填充
init(true)

module.exports = {
  init,
  getSystems,
  getCurrentSystemInfo,
  setSystem,
  setSearch,
  getFilteredCards,
  getFavoriteCards,
  getMyCards,
  getStats,
  toggleFavorite,
  getCardById,
  getSystemInfo,
  addCustomSystem,
  importSystemFromData,
  deleteSystem,
  addCard,
  deleteCard,
  updateCardFormData,
  updateCardAvatar,
  updateUserName,
  cloudCheckAccount,
  cloudLogin,
  logout,
  isLoggedIn,
  getUserId,
  getState
}
