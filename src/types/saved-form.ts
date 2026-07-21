// 服务器端保存的表单 JSON 类型定义
import type { RuleSystem, FormRule } from '@/types/card'

// 表单列表项（不含 rule 主体）
export interface SavedFormItem {
  id: string
  name: string
  system: RuleSystem
  description: string
  createdAt: string
  updatedAt: string
  fieldCount: number
}

// 完整的已保存表单（含 rule 主体）
export interface SavedForm extends SavedFormItem {
  rule: FormRule[]
  option?: Record<string, unknown>
}

// 保存表单时的请求体
export interface SaveFormPayload {
  id?: string
  name: string
  system: RuleSystem
  description?: string
  rule: FormRule[]
  option?: Record<string, unknown>
}
