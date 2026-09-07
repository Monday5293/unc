/**
 * Daggerheart DHSheet JSON 解析器
 * 将 https://github.com/RidRisR/DaggerHeart-CharacterSheet 导出的 JSON 解析为 formData
 */

/**
 * 计算HP/Stress/Armor的当前值（boolean数组中true的数量）
 */
function countBoxes(arr) {
  if (!arr || !Array.isArray(arr)) return 0
  var count = 0
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) count++
  }
  return count
}

/**
 * 构建经历列表
 */
function buildExperiences(json) {
  var exps = json.experience || []
  var vals = json.experienceValues || []
  var result = []
  for (var i = 0; i < Math.max(exps.length, vals.length); i++) {
    var label = exps[i] || ''
    if (label || (vals[i] !== undefined && vals[i] !== '')) {
      result.push({
        key: 'dhexp_' + i,
        label: label,
        value: Number(vals[i]) || 0,
      })
    }
  }
  // 确保至少5条
  while (result.length < 5) {
    result.push({ key: 'dhexp_' + result.length, label: '', value: 0 })
  }
  return result.slice(0, 5)
}

/**
 * 构建武器列表
 */
function buildWeapons(json) {
  var result = []
  var eq = json.equipment || {}
  var ws = eq.weaponSlots || {}

  if (ws.primary && ws.primary.name) {
    result.push({
      key: 'dhwep_0',
      name: cleanMarkdown(ws.primary.name || ''),
      info: cleanMarkdown(ws.primary.trait || ''),
      dice: cleanMarkdown(ws.primary.damage || ''),
      hand: '',
      properties: cleanMarkdown(ws.primary.feature || ''),
    })
  }
  if (ws.secondary && ws.secondary.name) {
    result.push({
      key: 'dhwep_1',
      name: cleanMarkdown(ws.secondary.name || ''),
      info: cleanMarkdown(ws.secondary.trait || ''),
      dice: cleanMarkdown(ws.secondary.damage || ''),
      hand: '',
      properties: cleanMarkdown(ws.secondary.feature || ''),
    })
  }
  var inv = ws.inventory || []
  for (var i = 0; i < inv.length; i++) {
    if (inv[i] && inv[i].name) {
      result.push({
        key: 'dhwep_' + result.length,
        name: cleanMarkdown(inv[i].name || ''),
        info: cleanMarkdown(inv[i].trait || ''),
        dice: cleanMarkdown(inv[i].damage || ''),
        hand: '',
        properties: cleanMarkdown(inv[i].feature || ''),
      })
    }
  }
  // 确保至少2个
  if (result.length === 0) {
    result.push({ key: 'dhwep_0', name: '', info: '', dice: '', hand: '', properties: '' })
  }
  if (result.length === 1) {
    result.push({ key: 'dhwep_1', name: '', info: '', dice: '', hand: '', properties: '' })
  }
  return result
}

/**
 * 构建护甲列表
 */
function buildArmors(json) {
  var eq = json.equipment || {}
  var armor = eq.armorSlot || {}
  var thresholds = armor.baseThresholds || {}
  var result = []
  if (armor.name) {
    result.push({
      key: 'dharm_0',
      name: cleanMarkdown(armor.name || ''),
      value: Number(armor.baseArmorMax) || 0,
      threshold: Number(thresholds.minor) || 0,
      thresholdMax: Number(thresholds.major) || 0,
      properties: cleanMarkdown(armor.feature || ''),
    })
  } else {
    result.push({ key: 'dharm_0', name: '', value: 0, threshold: 0, thresholdMax: 0, properties: '' })
  }
  return result
}

/**
 * 构建职业特性（从cards中筛选profession和subclass类型的）
 */
function buildClassFeatures(json) {
  var cards = json.cards || []
  var result = []
  for (var i = 0; i < cards.length; i++) {
    var c = cards[i]
    if ((c.type === 'profession' || c.type === 'subclass') && c.name && c.name.trim()) {
      result.push({
        key: 'dhcf_' + result.length,
        name: cleanMarkdown(c.name || ''),
        description: cleanMarkdown(c.description || ''),
      })
    }
  }
  // 确保至少空位
  if (result.length === 0) {
    result.push({ key: 'dhcf_0', name: '', description: '' })
  }
  return result
}

/**
 * 构建种族特性
 */
function buildRaceFeatures(json) {
  var cards = json.cards || []
  var result = []
  for (var i = 0; i < cards.length; i++) {
    var c = cards[i]
    if (c.type === 'ancestry' && c.name && c.name.trim()) {
      result.push({
        key: 'dhrf_' + result.length,
        name: cleanMarkdown(c.name || ''),
        description: cleanMarkdown(c.description || ''),
      })
    }
  }
  if (result.length === 0) {
    result.push({ key: 'dhrf_0', name: '', description: '' })
  }
  return result
}

/**
 * 构建领域卡
 */
function buildDomainCards(json) {
  var cards = json.cards || []
  var result = []
  for (var i = 0; i < cards.length; i++) {
    var c = cards[i]
    if (c.type === 'domain' && c.name && c.name.trim() &&
        c.id.indexOf('empty-') !== 0) {
      result.push({
        key: 'dhdc_' + result.length,
        name: cleanMarkdown(c.name || ''),
        domain: cleanMarkdown(c.class || ''),
        ability: cleanMarkdown(c.cardSelectDisplay ? (c.cardSelectDisplay.item2 || '') : ''),
        rc: extractRC(c),
        description: cleanMarkdown(c.description || ''),
      })
    }
  }
  if (result.length === 0) {
    result.push({ key: 'dhdc_0', name: '', domain: '', ability: '', rc: 0, description: '' })
  }
  return result
}

/**
 * 提取 RC 值（从cardSelectDisplay.item3 "RC.X" 中）
 */
function extractRC(card) {
  var display = card.cardSelectDisplay
  if (!display) return 0
  var rcStr = display.item3 || ''
  var match = rcStr.match(/RC\.(\d+)/i)
  return match ? parseInt(match[1], 10) : 0
}

/**
 * 构建宝库卡（从inventory_cards中筛选domain类型的）
 */
function buildTreasuryCards(json) {
  var cards = json.inventory_cards || []
  var result = []
  for (var i = 0; i < cards.length; i++) {
    var c = cards[i]
    if (c.type === 'domain' && c.name && c.name.trim() &&
        c.id.indexOf('empty-') !== 0) {
      result.push({
        key: 'dhtc_' + result.length,
        name: cleanMarkdown(c.name || ''),
        domain: cleanMarkdown(c.class || ''),
        ability: cleanMarkdown(c.cardSelectDisplay ? (c.cardSelectDisplay.item2 || '') : ''),
        rc: extractRC(c),
        description: cleanMarkdown(c.description || ''),
      })
    }
  }
  if (result.length === 0) {
    result.push({ key: 'dhtc_0', name: '', domain: '', ability: '', rc: 0, description: '' })
    result.push({ key: 'dhtc_1', name: '', domain: '', ability: '', rc: 0, description: '' })
  }
  return result
}

/**
 * 提取 - 号前的内容并 trim
 * e.g. "干员（午夜/勇气）  -  午夜&勇气" → "干员（午夜/勇气）"
 */
function extractNameBeforeDash(name) {
  if (!name) return ''
  var idx = name.indexOf('-')
  if (idx > 0) return name.substring(0, idx).trim()
  return name.trim()
}

/**
 * 计算 proficiency 数组中 true 的个数（熟练值）
 */
function countProficiency(arr) {
  if (!arr || !Array.isArray(arr)) return 0
  var count = 0
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) count++
  }
  return count
}

/**
 * 清理 Markdown 标记，去除 ** ** 和 * * 等语法
 * e.g. "**bold** text *italic*" → "bold text italic"
 */
function cleanMarkdown(text) {
  if (!text || typeof text !== 'string') return text || ''
  // 去除 ** ** 加粗标记
  var result = text.replace(/\*\*([^*]+)\*\*/g, '$1')
  // 去除单个 * 斜体标记（非 ** 的情况）
  result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '$1')
  return result
}

/**
 * 在 cards 数组中查找匹配 ID 的卡牌，返回其 class 字段（种族/社群名）
 */
function findCardClass(json, id) {
  if (!id || !json.cards || !Array.isArray(json.cards)) return ''
  for (var i = 0; i < json.cards.length; i++) {
    if (json.cards[i].id === id) {
      return json.cards[i].class || ''
    }
  }
  return ''
}

/**
 * 将冒险履历数组格式化为文本
 */
function buildAdventureLog(json) {
  var logs = (json.adventureNotes && json.adventureNotes.adventureLog) || []
  if (!Array.isArray(logs) || logs.length === 0) return ''
  var lines = []
  for (var i = 0; i < logs.length; i++) {
    var entry = logs[i]
    if (!entry || !entry.name) continue
    var parts = [entry.name]
    if (entry.levelRange) parts.push('Lv.' + entry.levelRange)
    if (entry.trauma) parts.push(entry.trauma)
    if (entry.date) parts.push(entry.date)
    lines.push(parts.join(' | '))
  }
  return lines.join('\n')
}

/**
 * 解析 DHSheet 导出的 JSON
 * @param {string} jsonText - JSON 文本
 * @returns {object} - formData 对象
 */
function parseDhJson(jsonText) {
  if (!jsonText || !jsonText.trim()) return null

  try {
    var json = JSON.parse(jsonText.trim())
  } catch (e) {
    return null
  }

  if (!json.schemaVersion) return null

  var formData = {
    // 角色基本信息
    name: json.name || '',
    level: json.level || '',
    gender: (json.adventureNotes && json.adventureNotes.characterProfile && json.adventureNotes.characterProfile.gender) || '',
    age: (json.adventureNotes && json.adventureNotes.characterProfile && json.adventureNotes.characterProfile.age) || '',
    birthplace: (json.adventureNotes && json.adventureNotes.characterProfile && json.adventureNotes.characterProfile.birthplace) || '',
    // 玩家名：优先使用 JSON 中的昵称，无则留空（小程序会使用默认用户名）
    player: (json.adventureNotes && json.adventureNotes.playerInfo && json.adventureNotes.playerInfo.nickname) || '',
    // 职业使用 professionRef.name，只保留 - 号前的内容
    class: extractNameBeforeDash((json.professionRef && json.professionRef.name) || json.profession || ''),
    subclass: extractNameBeforeDash((json.subclassRef && json.subclassRef.name) || json.subclass || ''),
    // 种族/社群：从 cards 中匹配 ID，读取 class 字段
    ancestry: findCardClass(json, json.ancestry1) || '',
    ancestry2: findCardClass(json, json.ancestry2) || '',
    community: findCardClass(json, json.community) || '',

    // 属性
    dh_agility: Number((json.agility && json.agility.value) || 0),
    dh_strength: Number((json.strength && json.strength.value) || 0),
    dh_finesse: Number((json.finesse && json.finesse.value) || 0),
    dh_instinct: Number((json.instinct && json.instinct.value) || 0),
    dh_presence: Number((json.presence && json.presence.value) || 0),
    dh_knowledge: Number((json.knowledge && json.knowledge.value) || 0),

    // 熟练星星（右上角）：spellcasting=true 代表该属性为施法属性
    dh_attr_filled: {
      agility: !!((json.agility && json.agility.spellcasting) || false),
      strength: !!((json.strength && json.strength.spellcasting) || false),
      finesse: !!((json.finesse && json.finesse.spellcasting) || false),
      instinct: !!((json.instinct && json.instinct.spellcasting) || false),
      presence: !!((json.presence && json.presence.spellcasting) || false),
      knowledge: !!((json.knowledge && json.knowledge.spellcasting) || false),
    },

    // 当前情况
    dh_evasion: Number(json.evasion) || 0,
    dh_proficiency: countProficiency(json.proficiency),
    dh_armor: countBoxes(json.armorBoxes),
    dh_armor_max: Number(json.armorMax) || 0,
    dh_hp: countBoxes(json.hp),
    dh_hp_max: Number(json.hpMax) || 0,
    dh_stress: countBoxes(json.stress),
    dh_stress_max: Number(json.stressMax) || 0,
    dh_hope: Number(json.hope) || 0,
    dh_hope_max: Number(json.hopeMax) || 6,
    dh_mark1_hp: Number(json.minorThreshold) || 0,
    dh_mark2_hp: Number(json.majorThreshold) || 0,
    dh_mark3_hp: 0,

    // 经历
    dh_experiences: buildExperiences(json),

    // 武器
    dh_weapons: buildWeapons(json),

    // 护甲
    dh_armors: buildArmors(json),

    // 库存
    dh_inventory: cleanMarkdown((json.inventory || []).filter(function (s) { return s && s.trim() }).join('\n')),

    // 背景故事
    dh_backstory_intro: cleanMarkdown(json.characterBackground || ''),
    dh_backstory_traits: cleanMarkdown(json.characterAppearance || ''),
    dh_backstory_bio: cleanMarkdown(json.adventureNotes ? (json.adventureNotes.backstory || '') : ''),
    dh_backstory_milestones: cleanMarkdown(json.adventureNotes ? (json.adventureNotes.milestones || '') : ''),
    dh_adventure_log: cleanMarkdown(buildAdventureLog(json)),
    dh_adventure_note: cleanMarkdown(json.characterMotivation || ''),

    // 职业特性
    dh_class_features: buildClassFeatures(json),

    // 种族特性
    dh_race_features: buildRaceFeatures(json),

    // 领域卡
    dh_domain_cards: buildDomainCards(json),

    // 宝库卡
    dh_treasury_cards: buildTreasuryCards(json),
  }

  // 如果玩家名为空，删除该字段，让小程序使用默认用户名
  if (!formData.player) {
    delete formData.player
  }

  // 提取角色照片（base64 data URL → 原始 base64）
  var charImage = json.characterImage
  if (charImage && typeof charImage === 'string' && charImage.indexOf('base64,') !== -1) {
    formData._characterImage = charImage.substring(charImage.indexOf('base64,') + 7)
  }

  return formData
}

module.exports = { parseDhJson }
