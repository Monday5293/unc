/**
 * 预览统计工具函数
 * 用于在卡片列表和卡片详情页中展示角色的关键属性摘要
 * 各规则系统有不同的关键属性组合，这里统一处理
 */
import type { CharacterCard, RuleSystem } from '@/types/card'
import { getDndClassLabel, getDaggerheartClassLabel, getDaggerheartAncestryLabel } from './labels'
import { loggerPreviewStats } from '@/utils/logger'

// ==================== 预览统计项类型 ====================
export interface PreviewStat {
  label: string
  value: string | number
}

// ==================== 各规则系统预览统计 ====================

/**
 * 计算 COC 调查员的预览统计
 * 显示：职业、年龄、SAN、HP
 */
function getCocPreviewStats(fd: Record<string, unknown>): PreviewStat[] {
  loggerPreviewStats.debug('getCocPreviewStats', { occupation: fd.occupation, san: fd.san, hp: `${fd.hp}/${fd.hpMax}` })
  return [
    { label: '职业', value: fd.occupation ?? '—' },
    { label: '年龄', value: fd.age ?? '—' },
    { label: 'SAN', value: fd.san ?? '—' },
    { label: 'HP', value: `${fd.hp ?? 0}/${fd.hpMax ?? 0}` },
  ]
}

/**
 * 计算 DND 冒险者的预览统计
 * 显示：职业、种族、等级、AC/HP
 */
function getDndPreviewStats(fd: Record<string, unknown>): PreviewStat[] {
  loggerPreviewStats.debug('getDndPreviewStats', { class: fd.class, level: fd.level })
  return [
    { label: '职业', value: getDndClassLabel(fd.class as string) },
    { label: '种族', value: fd.race ?? '—' },
    { label: '等级', value: fd.level ?? '—' },
    { label: 'AC/HP', value: `${fd.ac ?? 0}/${fd.hp ?? 0}` },
  ]
}

/**
 * 计算 Daggerheart 英雄的预览统计
 * 显示：职业、血脉、阶层、耐力
 */
function getDaggerheartPreviewStats(fd: Record<string, unknown>): PreviewStat[] {
  loggerPreviewStats.debug('getDaggerheartPreviewStats', { class: fd.class, tier: fd.tier })
  return [
    { label: '职业', value: getDaggerheartClassLabel(fd.class as string) },
    { label: '血脉', value: getDaggerheartAncestryLabel(fd.ancestry as string) },
    { label: '阶层', value: fd.tier ?? '—' },
    { label: '耐力', value: `${fd.stamina ?? 0}/${fd.staminaMax ?? 0}` },
  ]
}

/**
 * 通用预览统计：取 formData 的前 4 个简单值字段
 * 用于自定义规则系统
 */
function getGenericPreviewStats(fd: Record<string, unknown>): PreviewStat[] {
  const entries = Object.entries(fd).filter(
    ([, v]) => v !== '' && v !== null && v !== undefined && typeof v !== 'object',
  )
  loggerPreviewStats.debug('getGenericPreviewStats', { fieldCount: entries.length })
  return entries.slice(0, 4).map(([k, v]) => ({
    label: k,
    value: String(v),
  }))
}

// ==================== 统一入口 ====================

/**
 * 根据角色卡数据计算预览统计项
 * 按规则系统自动选择对应的统计方式
 * @param card - 角色卡数据
 * @returns 预览统计项数组（最多 4 项）
 */
export function computePreviewStats(card: CharacterCard): PreviewStat[] {
  loggerPreviewStats.info('computePreviewStats', { system: card.system, cardId: card.id })
  const fd = card.formData
  const sys = card.system as RuleSystem

  switch (sys) {
    case 'COC':
      return getCocPreviewStats(fd)
    case 'DND':
      return getDndPreviewStats(fd)
    case 'DAGGERHEART':
      return getDaggerheartPreviewStats(fd)
    default:
      return getGenericPreviewStats(fd)
  }
}

/**
 * 获取规则系统对应的预览统计项（无角色卡数据时使用）
 * @param system - 规则系统代码
 * @returns 默认预览统计项
 */
export function getDefaultPreviewStats(system: RuleSystem): PreviewStat[] {
  switch (system) {
    case 'COC':
      return [
        { label: '职业', value: '—' },
        { label: '年龄', value: '—' },
        { label: 'SAN', value: '—' },
        { label: 'HP', value: '0/0' },
      ]
    case 'DND':
      return [
        { label: '职业', value: '—' },
        { label: '种族', value: '—' },
        { label: '等级', value: '—' },
        { label: 'AC/HP', value: '0/0' },
      ]
    case 'DAGGERHEART':
      return [
        { label: '职业', value: '—' },
        { label: '血脉', value: '—' },
        { label: '阶层', value: '—' },
        { label: '耐力', value: '0/0' },
      ]
    default:
      return []
  }
}