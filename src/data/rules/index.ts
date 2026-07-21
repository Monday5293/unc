/**
 * 规则系统统一入口
 * 
 * 汇集所有规则系统（COC / DND / Daggerheart）的模板、角色卡数据和通用工具
 * 统一对外导出，便于 stores 和页面引用
 */
import type { FormTemplate } from '@/types/card'

// 引入各规则系统模块
import { cocTemplate, cocCards } from './coc'
import { dndTemplate, dndCards } from './dnd'
import { daggerheartTemplate, daggerheartCards } from './daggerheart'

// ==================== 导出通用模块 ====================
export * from './common'

// ==================== 导出各规则模板 ====================
export { cocTemplate, cocCards } from './coc'
export { dndTemplate, dndCards } from './dnd'
export { daggerheartTemplate, daggerheartCards } from './daggerheart'

// ==================== 预置角色卡合集 ====================
import type { CharacterCard } from '@/types/card'

/** 所有预置角色卡数据 */
export const characterCards: CharacterCard[] = [
  ...cocCards,
  ...dndCards,
  ...daggerheartCards,
]

// ==================== 预置表单模板合集 ====================
/** 所有预置表单模板 */
export const formTemplates: FormTemplate[] = [
  cocTemplate,
  dndTemplate,
  daggerheartTemplate,
]

/**
 * 根据规则系统代码获取对应的表单模板
 * @param system - 规则系统代码
 * @returns 表单模板，找不到则返回 COC 模板作为默认
 */
export function getTemplateBySystem(system: FormTemplate['system']): FormTemplate {
  return (
    formTemplates.find((t) => t.system === system) ?? cocTemplate
  )
}