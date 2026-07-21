/**
 * 核心类型定义：规则系统、表单模板、角色卡
 * 包含规则体系的标识、表单字段结构、以及角色卡数据模型
 */

/** 规则系统标识符，如 "COC"、"DND"、"DAGGERHEART" */
export type RuleSystem = string

/** 规则系统元信息：名称、颜色、logo、可选表单规则等 */
export interface SystemInfo {
  code: RuleSystem
  name: string
  fullName: string
  accentColor: string
  logo: string
  description: string
  isCustom?: boolean
  rule?: FormRule[]
  option?: Record<string, unknown>
}

/** 表单中单个字段规则定义，支持嵌套子字段 */
export type FormRule = Record<string, unknown> & {
  type?: string
  field?: string
  title?: string
  value?: unknown
  children?: FormRule[]
  props?: Record<string, unknown>
}

/** 表单模板：定义某个规则系统下的完整表单结构 */
export interface FormTemplate {
  id: string
  system: RuleSystem
  name: string
  description: string
  rule: FormRule[]
  option?: Record<string, unknown>
}

/** 角色卡：包含角色基础信息、表单数据及时间戳 */
export interface CharacterCard {
  id: string
  system: RuleSystem
  name: string
  player: string
  avatar: string
  description: string
  formData: Record<string, unknown>
  createdAt: string
  updatedAt: string
  favorite?: boolean
}
