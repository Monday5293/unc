/**
 * 表单模板基类
 * 所有规则系统的表单模板共享相同的结构
 * 提供通用的 option 配置和模板构建辅助函数
 */
import type { FormRule, FormTemplate } from '@/types/card'

// ==================== 通用表单选项 ====================

/**
 * 默认表单选项配置
 * 所有规则模板共享此基础配置
 * - labelPosition: 'top'  标签在字段上方
 * - submitBtn: false      隐藏提交按钮（只读展示用）
 * - resetBtn: false       隐藏重置按钮
 */
export const DEFAULT_FORM_OPTION = {
  form: { labelWidth: 'auto', labelPosition: 'top' },
  submitBtn: false,
  resetBtn: false,
}

// ==================== 模板构建辅助 ====================

/**
 * 构建规则模板对象
 * @param id - 模板 ID（如 'tpl-coc'）
 * @param system - 规则系统代码（如 'COC'）
 * @param name - 模板名称
 * @param description - 模板描述
 * @param rule - 表单规则数组
 * @param option - 表单选项（可选，默认使用 DEFAULT_FORM_OPTION）
 * @returns FormTemplate 对象
 */
export function createFormTemplate(
  id: string,
  system: string,
  name: string,
  description: string,
  rule: FormRule[],
  option?: Record<string, unknown>,
): FormTemplate {
  return {
    id,
    system,
    name,
    description,
    rule,
    option: option ?? DEFAULT_FORM_OPTION,
  }
}

// ==================== 通用表单字段辅助 ====================

/**
 * 创建标题组件（用于表单顶部）
 */
export function createTitleField(title: string, description: string): FormRule {
  return {
    type: 'title',
    title,
    props: { title, description },
  }
}

/**
 * 创建文本输入组件
 */
export function createInputField(field: string, title: string, placeholder = '', required = false): FormRule {
  const rule: FormRule = {
    type: 'input',
    field,
    title,
    value: '',
    props: { placeholder },
  }
  if (required) {
    rule.validate = [{ required: true, message: `请填写${title}` }]
  }
  return rule
}

/**
 * 创建数字输入组件
 */
export function createInputNumberField(
  field: string,
  title: string,
  defaultValue = 0,
  min?: number,
  max?: number,
): FormRule {
  const rule: FormRule = {
    type: 'inputNumber',
    field,
    title,
    value: defaultValue,
    props: {} as Record<string, unknown>,
  }
  if (min !== undefined) rule.props = { ...rule.props, min }
  if (max !== undefined) rule.props = { ...rule.props, max }
  return rule
}

/**
 * 创建滑块组件
 */
export function createSliderField(
  field: string,
  title: string,
  defaultValue = 50,
  min = 1,
  max = 99,
): FormRule {
  return {
    type: 'slider',
    field,
    title,
    value: defaultValue,
    props: { min, max, showInput: true },
  }
}

/**
 * 创建下拉选择组件
 */
export function createSelectField(
  field: string,
  title: string,
  options: { label: string; value: string }[],
  placeholder = '请选择',
): FormRule {
  return {
    type: 'select',
    field,
    title,
    value: '',
    props: { placeholder, options },
  }
}

/**
 * 创建多行文本组件
 */
export function createTextareaField(
  field: string,
  title: string,
  placeholder = '',
  rows = 4,
): FormRule {
  return {
    type: 'textarea',
    field,
    title,
    value: '',
    props: { rows, placeholder },
  }
}

/**
 * 创建折叠分组组件
 */
export function createGroupField(title: string, children: FormRule[]): FormRule {
  return {
    type: 'fcGroup',
    title,
    children,
  }
}

/**
 * 创建栅格行组件
 */
export function createRowField(children: FormRule[]): FormRule {
  return {
    type: 'row',
    children,
  }
}

/**
 * 创建栅格列组件
 */
export function createColField(span: number, children: FormRule[]): FormRule {
  return {
    type: 'col',
    props: { span },
    children,
  }
}

/**
 * 创建复选框组
 */
export function createCheckboxField(
  field: string,
  title: string,
  options: { label: string; value: string }[],
): FormRule {
  return {
    type: 'checkbox',
    field,
    title,
    value: [],
    props: { options },
  }
}