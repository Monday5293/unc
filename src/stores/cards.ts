/**
 * 角色卡状态管理 Store
 * 管理角色卡数据、规则系统、搜索过滤、收藏等核心状态
 * 使用 Pinia 的 Composition API 风格
 */
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { CharacterCard, RuleSystem, SystemInfo, FormRule } from '@/types/card'
import { characterCards, cocTemplate, dndTemplate, daggerheartTemplate } from '@/data/rules'
import systemsData from '@/data/systems.json'
import { loggerCards } from '@/utils/logger'

// ==================== localStorage 存储键名 ====================
const STORAGE_KEY_SYSTEMS = 'trpg-custom-systems'         // 自定义规则系统
const STORAGE_KEY_CARDS = 'trpg-custom-cards'             // 自定义角色卡
const STORAGE_KEY_HIDDEN_SYSTEMS = 'trpg-hidden-systems'  // 已隐藏的规则系统

// ==================== 本地存储读写函数 ====================

/** 读取已隐藏的规则系统列表 */
function loadHiddenSystems(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HIDDEN_SYSTEMS)
    if (raw) {
      const parsed = JSON.parse(raw)
      loggerCards.info('loadHiddenSystems 成功', { count: parsed.length })
      return parsed
    }
  } catch (e) {
    loggerCards.error('loadHiddenSystems 解析失败', e)
  }
  return []
}

function saveHiddenSystems(codes: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY_HIDDEN_SYSTEMS, JSON.stringify(codes))
  } catch {}
}

// ==================== 预置规则系统构建 ====================

/**
 * 构建预置规则系统列表
 * 从 systems.json 读取基础信息，并注入各规则模板的 rule 和 option
 */
function buildPresetSystems(): SystemInfo[] {
  const systems = (systemsData as SystemInfo[]).map((s) => ({ ...s }))
  const tmplMap: Record<string, { rule: FormRule[]; option?: Record<string, unknown> }> = {
    COC: { rule: cocTemplate.rule, option: cocTemplate.option },
    DND: { rule: dndTemplate.rule, option: dndTemplate.option },
    DAGGERHEART: { rule: daggerheartTemplate.rule, option: daggerheartTemplate.option },
  }
  for (const s of systems) {
    const t = tmplMap[s.code]
    if (t) {
      s.rule = t.rule
      s.option = t.option
    }
  }
  return systems
}

const PRESET_SYSTEMS = buildPresetSystems()

function loadCustomSystems(): SystemInfo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SYSTEMS)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveCustomSystems(systems: SystemInfo[]) {
  try {
    localStorage.setItem(STORAGE_KEY_SYSTEMS, JSON.stringify(systems))
    loggerCards.debug('saveCustomSystems 成功', { count: systems.length })
  } catch (e) {
    loggerCards.error('saveCustomSystems 失败', e)
  }
}

function loadCustomCards(): CharacterCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CARDS)
    if (raw) {
      const parsed = JSON.parse(raw)
      loggerCards.info('loadCustomCards 成功', { count: parsed.length })
      return parsed
    }
  } catch (e) {
    loggerCards.error('loadCustomCards 解析失败', e)
  }
  return []
}

function saveCustomCards(cards: CharacterCard[]) {
  try {
    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cards))
  } catch {}
}

// ==================== 辅助函数 ====================

/** 根据字符串种子生成 HSL 颜色值，用于自定义规则系统 */
function generateColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 45%, 45%)`
}

// ==================== Pinia Store 定义 ====================
export const useCardStore = defineStore('cards', () => {
  // ---- 状态 ----
  const customSystems = ref<SystemInfo[]>(loadCustomSystems())
  const customCards = ref<CharacterCard[]>(loadCustomCards())
  const hiddenSystems = ref<string[]>(loadHiddenSystems())

  const cards = ref<CharacterCard[]>([...characterCards, ...customCards.value])
  const currentSystem = ref<RuleSystem>('COC')
  const searchKeyword = ref('')
  const userName = ref('跑团旅人')
  const userAvatar = ref('')

  // ---- 计算属性 ----
  /** 可见的规则系统列表（排除已隐藏的） */
  const systems = computed<SystemInfo[]>(() => {
    const all = [...PRESET_SYSTEMS, ...customSystems.value]
    return all.filter((s) => !hiddenSystems.value.includes(s.code))
  })

  const currentSystemInfo = computed<SystemInfo>(() => {
    return systems.value.find((s) => s.code === currentSystem.value) ?? systems.value[0]
  })

  const filteredCards = computed<CharacterCard[]>(() => {
    const keyword = searchKeyword.value.trim().toLowerCase()
    return cards.value.filter((c) => {
      if (c.system !== currentSystem.value) return false
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
  })

  const favoriteCards = computed<CharacterCard[]>(() =>
    cards.value.filter((c) => c.favorite),
  )

  const myCards = computed<CharacterCard[]>(() => cards.value)

  const stats = computed(() => {
    const counts: Record<string, number> = {}
    for (const c of cards.value) {
      counts[c.system] = (counts[c.system] || 0) + 1
    }
    return {
      total: cards.value.length,
      favorites: favoriteCards.value.length,
      perSystem: counts,
    }
  })

  // ---- 方法（Actions） ----

  /** 切换当前规则系统 */
  function setSystem(system: RuleSystem) {
    loggerCards.info('setSystem', { from: currentSystem.value, to: system })
    currentSystem.value = system
  }

  function setSearch(keyword: string) {
    searchKeyword.value = keyword
  }

  function toggleFavorite(cardId: string) {
    const card = cards.value.find((c) => c.id === cardId)
    if (card) {
      card.favorite = !card.favorite
      card.updatedAt = new Date().toISOString()
      loggerCards.info('toggleFavorite', { cardId, name: card.name, favorite: card.favorite })
      persistCustomCards()
    } else {
      loggerCards.warn('toggleFavorite 未找到卡片', { cardId })
    }
  }

  function getCardById(id: string): CharacterCard | undefined {
    return cards.value.find((c) => c.id === id)
  }

  function getSystemInfo(system: RuleSystem): SystemInfo | undefined {
    return systems.value.find((s) => s.code === system)
  }

  function addCustomSystem(info: {
    id: string
    name: string
    system: RuleSystem
    description?: string
    rule: FormRule[]
    option?: Record<string, unknown>
  }) {
    const code = `CUSTOM-${info.id}`
    if (customSystems.value.find((s) => s.code === code)) {
      loggerCards.warn('addCustomSystem 已存在，跳过', { code })
      return
    }
    const color = generateColor(code)
    loggerCards.info('addCustomSystem', { code, name: info.name, ruleCount: info.rule.length })
    const newSys: SystemInfo = {
      code,
      name: info.name,
      fullName: info.name,
      accentColor: color,
      logo: '📜',
      description: info.description || '自定义规则系统',
      isCustom: true,
      rule: info.rule,
      option: info.option,
    }
    customSystems.value.push(newSys)
    saveCustomSystems(customSystems.value)
    return newSys
  }

  function deleteSystem(code: string) {
    // 先检查是否是自定义规则
    const customIdx = customSystems.value.findIndex((s) => s.code === code)
    loggerCards.info('deleteSystem', { code, isCustom: customIdx > -1 })
    if (customIdx > -1) {
      // 自定义规则：直接删除
      customSystems.value.splice(customIdx, 1)
      saveCustomSystems(customSystems.value)
      // 同时删除该规则下的所有自定义角色卡
      const toRemove = customCards.value.filter((c) => c.system === code)
      for (const card of toRemove) {
        const cIdx = cards.value.findIndex((c) => c.id === card.id)
        if (cIdx > -1) cards.value.splice(cIdx, 1)
        const ccIdx = customCards.value.findIndex((c) => c.id === card.id)
        if (ccIdx > -1) customCards.value.splice(ccIdx, 1)
      }
      persistCustomCards()
    } else {
      // 预置规则：加入隐藏列表
      if (!hiddenSystems.value.includes(code)) {
        hiddenSystems.value.push(code)
        saveHiddenSystems(hiddenSystems.value)
      }
    }
    // 如果当前选中的是被删除的规则，切换到第一个规则
    if (currentSystem.value === code && systems.value.length > 0) {
      currentSystem.value = systems.value[0].code
    }
    return true
  }

  function addCard(system: RuleSystem, name: string, description = ''): CharacterCard {
    const newCard: CharacterCard = {
      id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      system,
      name,
      player: '我',
      avatar: '',
      description,
      formData: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorite: false,
    }
    loggerCards.info('addCard', { id: newCard.id, system, name, totalCards: cards.value.length + 1 })
    cards.value.push(newCard)
    customCards.value.push(newCard)
    persistCustomCards()
    return newCard
  }

  function deleteCard(cardId: string) {
    const cardName = cards.value.find((c) => c.id === cardId)?.name || '未知'
    const idx = cards.value.findIndex((c) => c.id === cardId)
    if (idx > -1) {
      cards.value.splice(idx, 1)
    }
    const cIdx = customCards.value.findIndex((c) => c.id === cardId)
    if (cIdx > -1) {
      customCards.value.splice(cIdx, 1)
    }
    loggerCards.info('deleteCard', { cardId, name: cardName, remainingCards: cards.value.length })
    persistCustomCards()
  }

  function updateCardFormData(cardId: string, formData: Record<string, unknown>) {
    const card = cards.value.find((c) => c.id === cardId)
    if (card) {
      const fieldCount = Object.keys(formData).length
      loggerCards.debug('updateCardFormData', { cardId, name: card.name, fieldCount })
      card.formData = { ...formData }
      card.updatedAt = new Date().toISOString()
      persistCustomCards()
    } else {
      loggerCards.warn('updateCardFormData 未找到卡片', { cardId })
    }
  }

  function persistCustomCards() {
    loggerCards.debug('persistCustomCards', { count: customCards.value.length })
    saveCustomCards(customCards.value)
  }

  watch(
    customSystems,
    (v) => saveCustomSystems(v),
    { deep: true },
  )

  return {
    cards,
    currentSystem,
    currentSystemInfo,
    systems,
    searchKeyword,
    userName,
    userAvatar,
    filteredCards,
    favoriteCards,
    myCards,
    stats,
    setSystem,
    setSearch,
    toggleFavorite,
    getCardById,
    getSystemInfo,
    addCustomSystem,
    deleteSystem,
    addCard,
    deleteCard,
    updateCardFormData,
  }
})
