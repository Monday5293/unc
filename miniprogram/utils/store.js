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
    name: '艾琳·哈丁',
    player: '玩家A',
    avatar: '',
    description: '1920年代波士顿的私家侦探，因一桩离奇失踪案被卷入神秘学世界。',
    formData: {
      name: '艾琳·哈丁',
      occupation: '私家侦探',
      age: 32,
      gender: '女',
      residence: '波士顿',
      str: 60,
      con: 70,
      siz: 55,
      dex: 65,
      app: 50,
      int: 75,
      pow: 60,
      edu: 80,
      hp: 12,
      hpMax: 12,
      mp: 12,
      san: 60,
      skill_libraryUse: 70,
      skill_spotHidden: 65,
      skill_listen: 55,
      skill_dodge: 50,
      backstory: '前警探转行私家侦探，三年前接手一桩艺术商失踪案，从此开始接触禁忌古籍与不可名状之物。'
    },
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-03-02T10:30:00Z',
    favorite: true
  },
  {
    id: 'coc-002',
    system: 'COC',
    name: '维克多·克莱因',
    player: '玩家B',
    avatar: '',
    description: '米斯卡托尼克大学考古学教授，对古老文明有着近乎病态的执念。',
    formData: {
      name: '维克多·克莱因',
      occupation: '大学教授',
      age: 48,
      gender: '男',
      residence: '阿卡姆',
      str: 45,
      con: 50,
      siz: 60,
      dex: 50,
      app: 55,
      int: 85,
      pow: 55,
      edu: 90,
      hp: 11,
      hpMax: 11,
      mp: 11,
      san: 55,
      skill_libraryUse: 85,
      skill_spotHidden: 50,
      skill_listen: 40,
      skill_dodge: 35,
      backstory: '专攻美索不达米亚文明的考古学教授，曾在乌尔遗址发掘出无法解读的泥板，从此被禁忌知识所吸引。'
    },
    createdAt: '2026-02-10T14:00:00Z',
    updatedAt: '2026-02-10T14:00:00Z',
    favorite: false
  },
  {
    id: 'dnd-001',
    system: 'DND',
    name: '索拉·晨星',
    player: '玩家C',
    avatar: '',
    description: '木精灵游侠，守望北境边境的孤狼，与森林中的精灵之灵立下盟约。',
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
      features: '宿敌（巨兽）、自然探索者、箭术战斗风格、法术施放（游侠）',
      backstory: '北境精灵部落的最后一名游侠，立誓守护部落遗址中的远古精灵之灵。沉默寡言，箭无虚发。'
    },
    createdAt: '2026-01-20T09:15:00Z',
    updatedAt: '2026-04-01T11:20:00Z',
    favorite: true
  },
  {
    id: 'dnd-002',
    system: 'DND',
    name: '达格·铁砧',
    player: '玩家D',
    avatar: '',
    description: '山地矮人战士，曾是一名矿山工头，如今为了族人荣耀踏上冒险之路。',
    formData: {
      name: '达格·铁砧',
      race: '矮人',
      class: 'fighter',
      level: 4,
      profBonus: 2,
      background: '士兵',
      alignment: '守序中立',
      str: 18,
      dex: 10,
      con: 17,
      int: 10,
      wis: 12,
      cha: 8,
      ac: 18,
      hp: 40,
      hpMax: 44,
      hitDice: '4d10',
      features: '战斗风格（防御）、回气、动作涌泉（1/Rest）、副职：战斗大师',
      backstory: '失落的铁砧氏族后裔，背负族旗四处寻找重振部落的契机，最爱在战后畅饮麦酒。'
    },
    createdAt: '2026-02-05T16:30:00Z',
    updatedAt: '2026-03-25T09:00:00Z',
    favorite: false
  },
  {
    id: 'daggerheart-001',
    system: 'DAGGERHEART',
    name: '凯瑟·银刃',
    player: '玩家E',
    avatar: '',
    description: '人类缚灵者，能与逝者灵魂沟通，在边境村庄为亡魂寻求公正。',
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
      backstory: '自幼能听见亡魂低语，被族中视为异象。师从游方缚灵者，于黑石镇立誓为无主之魂寻觅归宿。'
    },
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-04-10T18:45:00Z',
    favorite: true
  },
  {
    id: 'daggerheart-002',
    system: 'DAGGERHEART',
    name: '伊洛·叶影',
    player: '玩家F',
    avatar: '',
    description: '精灵德鲁伊，林间隐居者，与古树之灵共享记忆。',
    formData: {
      name: '伊洛·叶影',
      ancestry: 'elf',
      class: 'druid',
      level: 2,
      tier: 1,
      community: '苍叶林地',
      agility: 2,
      strength: 0,
      finesse: 1,
      instinct: 2,
      presence: 1,
      knowledge: 2,
      staminaMax: 14,
      stamina: 14,
      stressMax: 6,
      stress: 0,
      experience: '已标记：森林秘语、季节轮回 / 未标记：星辰识读',
      backstory: '苍叶林地最后的德鲁伊学徒，师长化为古树后独自守护林间秘法，能化为银狼巡游夜林。'
    },
    createdAt: '2026-03-15T12:00:00Z',
    updatedAt: '2026-03-15T12:00:00Z',
    favorite: false
  }
]

const STORAGE_KEY_SYSTEMS = 'trpg-custom-systems'
const STORAGE_KEY_CARDS = 'trpg-custom-cards'
const STORAGE_KEY_HIDDEN_SYSTEMS = 'trpg-hidden-systems'
const STORAGE_KEY_USER = 'trpg-user-info'

let state = {
  customSystems: [],
  customCards: [],
  hiddenSystems: [],
  cards: [],
  currentSystem: 'COC',
  searchKeyword: '',
  userName: '跑团旅人',
  userAvatar: '',
  cachedForms: {}
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

function loadCustomCards() {
  try {
    const raw = wx.getStorageSync(STORAGE_KEY_CARDS)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return []
}

function saveCustomCards(cards) {
  try {
    wx.setStorageSync(STORAGE_KEY_CARDS, JSON.stringify(cards))
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

function init() {
  state.customSystems = loadCustomSystems()
  state.customCards = loadCustomCards()
  state.hiddenSystems = loadHiddenSystems()
  state.cards = [...PRESET_CARDS, ...state.customCards]

  try {
    const userInfo = wx.getStorageSync(STORAGE_KEY_USER)
    if (userInfo) {
      const parsed = JSON.parse(userInfo)
      state.userName = parsed.name || '跑团旅人'
      state.userAvatar = parsed.avatar || ''
    }
  } catch (e) {}
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

function getFilteredCards() {
  const keyword = state.searchKeyword.trim().toLowerCase()
  return state.cards.filter(c => {
    if (c.system !== state.currentSystem) return false
    if (!keyword) return true
    return (
      c.name.toLowerCase().includes(keyword) ||
      c.description.toLowerCase().includes(keyword) ||
      Object.values(c.formData)
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    )
  })
}

function getFavoriteCards() {
  return state.cards.filter(c => c.favorite)
}

function getMyCards() {
  return state.cards
}

function getStats() {
  const counts = {}
  for (const c of state.cards) {
    counts[c.system] = (counts[c.system] || 0) + 1
  }
  return {
    total: state.cards.length,
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

function addCard(system, name, description = '') {
  const sysInfo = getSystemInfo(system)
  const newCard = {
    id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    system,
    name,
    player: '我',
    avatar: '',
    description,
    rule: sysInfo ? (sysInfo.rule || []) : [],
    formData: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    favorite: false
  }
  state.cards.push(newCard)
  state.customCards.push(newCard)
  persistCustomCards()
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
}

function updateCardFormData(cardId, formData) {
  const card = state.cards.find(c => c.id === cardId)
  if (card) {
    card.formData = { ...formData }
    card.updatedAt = new Date().toISOString()
    persistCustomCards()
  }
}

function persistCustomCards() {
  saveCustomCards(state.customCards)
}

function getState() {
  return state
}

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
  getState
}
