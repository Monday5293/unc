/**
 * 规则系统通用标签映射
 * 各规则系统的职业、种族、血脉等枚举值的中文标签映射
 * 这些映射被 CardDetail 等页面引用，用于将枚举值转为可读中文
 */

// ==================== DND 5e 职业标签 ====================
export const DND_CLASS_LABELS: Record<string, string> = {
  fighter: '战士',
  wizard: '法师',
  ranger: '游侠',
  rogue: '盗贼',
  cleric: '牧师',
  paladin: '圣武士',
  druid: '德鲁伊',
  bard: '吟游诗人',
}

// ==================== Daggerheart 职业标签 ====================
export const DAGGERHEART_CLASS_LABELS: Record<string, string> = {
  warrior: '战士',
  ranger: '游侠',
  rogue: '盗贼',
  sorcerer: '法师',
  druid: '德鲁伊',
  binder: '缚灵者',
}

// ==================== Daggerheart 血脉/种族标签 ====================
export const DAGGERHEART_ANCESTRY_LABELS: Record<string, string> = {
  human: '人类',
  elf: '精灵',
  orc: '半兽人',
  dwarf: '矮人',
  halfling: '半身人',
}

// ==================== 通用标签获取函数 ====================

/**
 * 根据 DND 职业枚举值获取中文标签
 * @param v - 职业枚举值（如 'fighter'）
 * @returns 中文标签，找不到则返回原值
 */
export function getDndClassLabel(v?: string): string {
  if (!v) return '—'
  return DND_CLASS_LABELS[v] || v
}

/**
 * 根据 Daggerheart 职业枚举值获取中文标签
 * @param v - 职业枚举值（如 'warrior'）
 * @returns 中文标签，找不到则返回原值
 */
export function getDaggerheartClassLabel(v?: string): string {
  if (!v) return '—'
  return DAGGERHEART_CLASS_LABELS[v] || v
}

/**
 * 根据 Daggerheart 血脉枚举值获取中文标签
 * @param v - 血脉枚举值（如 'human'）
 * @returns 中文标签，找不到则返回原值
 */
export function getDaggerheartAncestryLabel(v?: string): string {
  if (!v) return '—'
  return DAGGERHEART_ANCESTRY_LABELS[v] || v
}