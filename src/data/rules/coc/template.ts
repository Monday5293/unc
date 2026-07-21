/**
 * 克苏鲁的呼唤 (COC 7e) 规则模板
 * 
 * 字段参考 COC 7th 规则书的调查员角色卡结构
 * 包含：基本信息、8项基础属性、生命/理智、常用技能、背景故事
 */
import type { FormRule } from '@/types/card'
import {
  createFormTemplate,
  createTitleField,
  createInputField,
  createInputNumberField,
  createSliderField,
  createGroupField,
  createRowField,
  createColField,
  createTextareaField,
} from '../common/base-template'

// ==================== COC 7e 调查员卡表单规则 ====================
const cocRule: FormRule[] = [
  // 标题
  createTitleField('克苏鲁的呼唤 · 调查员卡', 'COC 7th Edition Character Sheet'),

  // 基本信息行：姓名 + 职业
  createRowField([
    createColField(12, [
      createInputField('name', '姓名', '调查员姓名', true),
    ]),
    createColField(12, [
      createInputField('occupation', '职业', '如：私家侦探、医生'),
    ]),
  ]),

  // 第二行：年龄 + 性别 + 居住地
  createRowField([
    createColField(8, [createInputNumberField('age', '年龄', 25, 15, 90)]),
    createColField(8, [createInputField('gender', '性别')]),
    createColField(8, [createInputField('residence', '居住地')]),
  ]),

  // 基础属性组（8项属性，范围 1-99）
  createGroupField('基础属性 ATTRIBUTES', [
    createRowField([
      createColField(6, [createSliderField('str', '力量 STR', 50)]),
      createColField(6, [createSliderField('con', '体质 CON', 50)]),
      createColField(6, [createSliderField('siz', '体型 SIZ', 50)]),
      createColField(6, [createSliderField('dex', '敏捷 DEX', 50)]),
    ]),
    createRowField([
      createColField(6, [createSliderField('app', '外貌 APP', 50)]),
      createColField(6, [createSliderField('int', '智力 INT', 50)]),
      createColField(6, [createSliderField('pow', '意志 POW', 50)]),
      createColField(6, [createSliderField('edu', '教育 EDU', 50)]),
    ]),
  ]),

  // 生命与理智组
  createGroupField('生命与理智 HEALTH & SANITY', [
    createRowField([
      createColField(6, [createInputNumberField('hp', '生命值 HP', 12, 0)]),
      createColField(6, [createInputNumberField('hpMax', '最大 HP', 12, 1)]),
      createColField(6, [createInputNumberField('mp', '魔法值 MP', 10, 0)]),
      createColField(6, [createInputNumberField('san', '理智 SAN', 60, 0, 99)]),
    ]),
  ]),

  // 常用技能组
  createGroupField('技能 SKILLS（部分）', [
    createRowField([
      createColField(6, [createSliderField('skill_libraryUse', '图书馆使用', 55, 0, 99)]),
      createColField(6, [createSliderField('skill_spotHidden', '侦查', 50, 0, 99)]),
      createColField(6, [createSliderField('skill_listen', '聆听', 45, 0, 99)]),
      createColField(6, [createSliderField('skill_dodge', '闪避', 40, 0, 99)]),
    ]),
  ]),

  // 背景故事
  createTextareaField('backstory', '背景故事', '调查员的过往、动机与遭遇过的超自然事件...'),
]

// ==================== 导出模板 ====================
export const cocTemplate = createFormTemplate(
  'tpl-coc',
  'COC',
  'COC 7e 调查员卡',
  '克苏鲁的呼唤 7 版调查员角色卡模板，含 8 项基础属性、生命理智与常用技能',
  cocRule,
)