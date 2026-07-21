export type RuleSystem = string

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

export type FormRule = Record<string, unknown> & {
  type?: string
  field?: string
  title?: string
  value?: unknown
  children?: FormRule[]
  props?: Record<string, unknown>
}

export interface FormTemplate {
  id: string
  system: RuleSystem
  name: string
  description: string
  rule: FormRule[]
  option?: Record<string, unknown>
}

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
