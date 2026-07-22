/**
 * .st 指令解析器 (TypeScript)
 * 将 ".st 力量40str40 会计6 闪避35 ..." 格式的指令解析为 formData
 * 技能值直接存入 skill_xxx 字段（成功率），不再使用 base+occ+int 公式
 */

const ATTR_MAP: Record<string, string> = {
  '力量': 'str', 'str': 'str',
  '敏捷': 'dex', 'dex': 'dex',
  '意志': 'pow', 'pow': 'pow',
  '体质': 'con', 'con': 'con',
  '外貌': 'app', 'app': 'app',
  '教育': 'edu', 'edu': 'edu',
  '体型': 'siz', 'siz': 'siz',
  '智力': 'int', '灵感': 'int', 'int': 'int',
  'san': 'san', 'san值': 'san', '理智': 'san', '理智值': 'san',
  '幸运': 'luck', '运气': 'luck',
  'mp': 'mp', '魔法': 'mp',
  'hp': 'hp', '体力': 'hp',
  'sanMax': 'sanMax', 'hpMax': 'hpMax', 'mpMax': 'mpMax',
}

const SKILL_MAP: Record<string, string> = {
  '会计': 'skill_accounting',
  '人类学': 'skill_anthropology',
  '估价': 'skill_appraise',
  '考古学': 'skill_archaeology',
  '技艺①': 'skill_artCraft', '技艺1': 'skill_artCraft',
  '技艺②': 'skill_artCraft2', '技艺2': 'skill_artCraft2',
  '技艺③': 'skill_artCraft3', '技艺3': 'skill_artCraft3',
  '魅惑': 'skill_charm',
  '攀爬': 'skill_climb',
  '计算机': 'skill_computer', '计算机使用': 'skill_computer', '电脑': 'skill_computer',
  '信用': 'skill_creditRating', '信誉': 'skill_creditRating', '信用评级': 'skill_creditRating',
  '克苏鲁': 'skill_cthulhuMythos', '克苏鲁神话': 'skill_cthulhuMythos', 'cm': 'skill_cthulhuMythos',
  '乔装': 'skill_disguise',
  '闪避': 'skill_dodge',
  '汽车驾驶': 'skill_driveAuto', '驾驶': 'skill_driveAuto', '汽车': 'skill_driveAuto',
  '电气维修': 'skill_elecRepair',
  '电子学': 'skill_electronics',
  '话术': 'skill_fastTalk',
  '格斗①': 'skill_fightingBrawl', '格斗1': 'skill_fightingBrawl', '斗殴': 'skill_fightingBrawl',
  '格斗②': 'skill_fighting2', '格斗2': 'skill_fighting2',
  '格斗③': 'skill_fighting3', '格斗3': 'skill_fighting3',
  '射击①': 'skill_firearmsHandgun', '射击1': 'skill_firearmsHandgun', '手枪': 'skill_firearmsHandgun',
  '射击②': 'skill_firearmsRifle', '射击2': 'skill_firearmsRifle',
  '射击③': 'skill_firearms3', '射击3': 'skill_firearms3',
  '急救': 'skill_firstAid',
  '历史': 'skill_history',
  '恐吓': 'skill_intimidate',
  '跳跃': 'skill_jump',
  '外语①': 'skill_languageOther', '外语1': 'skill_languageOther',
  '外语②': 'skill_languageOther2', '外语2': 'skill_languageOther2',
  '外语③': 'skill_languageOther3', '外语3': 'skill_languageOther3',
  '母语': 'skill_languageOwn',
  '法律': 'skill_law',
  '图书馆': 'skill_libraryUse', '图书馆使用': 'skill_libraryUse',
  '聆听': 'skill_listen',
  '开锁': 'skill_locksmith', '撬锁': 'skill_locksmith', '锁匠': 'skill_locksmith',
  '机械维修': 'skill_mechRepair',
  '医学': 'skill_medicine',
  '博物学': 'skill_naturalWorld', '自然学': 'skill_naturalWorld',
  '领航': 'skill_navigate', '导航': 'skill_navigate',
  '神秘学': 'skill_occult',
  '重型操作': 'skill_opHeavyMachine', '重型机械': 'skill_opHeavyMachine', '操作重型机械': 'skill_opHeavyMachine', '重型': 'skill_opHeavyMachine',
  '说服': 'skill_persuade',
  '精神分析': 'skill_psychoanalysis',
  '心理学': 'skill_psychology',
  '骑术': 'skill_ride',
  '科学①': 'skill_science', '科学1': 'skill_science',
  '科学②': 'skill_science2', '科学2': 'skill_science2',
  '科学③': 'skill_science3', '科学3': 'skill_science3',
  '妙手': 'skill_sleightOfHand',
  '侦察': 'skill_spotHidden', '侦查': 'skill_spotHidden',
  '潜行': 'skill_stealth',
  '生存': 'skill_survival',
  '游泳': 'skill_swim',
  '投掷': 'skill_throw',
  '追踪': 'skill_track',
  '驯兽': 'skill_animal',
  '潜水': 'skill_diving',
  '爆破': 'skill_demolitions',
  '读唇': 'skill_lipReading',
  '催眠': 'skill_hypnosis',
  '炮术': 'skill_artillery',
}

// 外语关键词：匹配到这些词时，按顺序分配到 外语①/②/③，最多3门
const FOREIGN_LANG_KEYWORDS = new Set([
  '法语', '英语', '德语', '徳语', '拉丁语', '日语', '中文', '俄语', '西班牙语', '意大利语',
  '阿拉伯语', '希腊语', '韩语', '葡萄牙语', '荷兰语', '瑞典语', '挪威语', '丹麦语',
])

// 外语对应的 skill key（按顺序）
const FOREIGN_SKILL_KEYS = ['skill_languageOther', 'skill_languageOther2', 'skill_languageOther3']

export function parseStCommand(stText: string): Record<string, unknown> {
  if (!stText || typeof stText !== 'string') return {}

  let text = stText.replace(/^\.st\s*/i, '').trim()
  if (!text) return {}

  const formData: Record<string, unknown> = {}
  const processedSkills: Record<string, boolean> = {}
  let foreignLangCount = 0  // 外语计数器，最多3门

  const cnRegex = /([\u4e00-\u9fa5①②③]+)(\d+)/g
  let match: RegExpExecArray | null

  while ((match = cnRegex.exec(text)) !== null) {
    const keyword = match[1]
    const value = parseInt(match[2], 10)

    if (ATTR_MAP[keyword] !== undefined) {
      const key = ATTR_MAP[keyword]
      if (key === 'hp') { formData.hp = value; formData.hpMax = value }
      else if (key === 'mp') { formData.mp = value; formData.mpMax = value }
      else if (key === 'san') { formData.san = value; formData.sanMax = value }
      else { formData[key] = value }
      continue
    }

    // 外语关键词检测：法语/英语等 → 外语①②③，最多3门
    if (FOREIGN_LANG_KEYWORDS.has(keyword) && foreignLangCount < 3) {
      const skillKey = FOREIGN_SKILL_KEYS[foreignLangCount]
      foreignLangCount++
      if (!processedSkills[skillKey]) {
        processedSkills[skillKey] = true
        formData[skillKey] = value
        formData[skillKey + '_name'] = keyword  // 存储语言名称，用于显示
        console.log('[st-parser] 外语匹配:', keyword, '→', skillKey, '=', value, '_name:', keyword)
      }
      continue
    }

    if (SKILL_MAP[keyword] !== undefined) {
      const skillKey = SKILL_MAP[keyword]
      if (processedSkills[skillKey]) continue
      processedSkills[skillKey] = true
      formData[skillKey] = value
      continue
    }
  }

  const enRegex = /([a-zA-Z]+)(\d+)/g
  while ((match = enRegex.exec(text)) !== null) {
    const keyword = match[1].toLowerCase()
    const value = parseInt(match[2], 10)

    if (ATTR_MAP[keyword] !== undefined) {
      const key = ATTR_MAP[keyword]
      if (formData[key] !== undefined) continue
      if (key === 'hp') { formData.hp = value; formData.hpMax = value }
      else if (key === 'mp') { formData.mp = value; formData.mpMax = value }
      else if (key === 'san') { formData.san = value; formData.sanMax = value }
      else { formData[key] = value }
      continue
    }

    if (SKILL_MAP[keyword] !== undefined) {
      const skillKey = SKILL_MAP[keyword]
      if (processedSkills[skillKey]) continue
      processedSkills[skillKey] = true
      formData[skillKey] = value
      continue
    }
  }

  if (formData.hp === undefined && formData.con !== undefined && formData.siz !== undefined) {
    const hpMax = Math.floor((Number(formData.con) + Number(formData.siz)) / 10)
    formData.hp = hpMax; formData.hpMax = hpMax
  }
  if (formData.mp === undefined && formData.pow !== undefined) {
    const mpMax = Math.floor(Number(formData.pow) / 5)
    formData.mp = mpMax; formData.mpMax = mpMax
  }
  if (formData.san === undefined && formData.pow !== undefined) {
    formData.san = formData.pow; formData.sanMax = formData.pow
  }
  if (formData.luck === undefined) {
    formData.luck = 50
  }

  console.log('[st-parser] parsed formData:', JSON.stringify(formData, null, 2))
  return formData
}