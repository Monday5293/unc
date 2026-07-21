/**
 * 匕首之心 (Daggerheart) 规则模板
 * 
 * 字段参考 Daggerheart 公开测试版
 * 包含：基本信息、6项属性、耐力与压力系统、经验标记、英雄过往
 */
import type { FormRule } from '@/types/card'
import {
  createFormTemplate,
  createTitleField,
  createInputField,
  createInputNumberField,
  createGroupField,
  createRowField,
  createColField,
  createSelectField,
  createTextareaField,
} from '../common/base-template'

// ==================== Daggerheart 英雄卡表单规则 ====================
const daggerheartRule: FormRule[] = [
  // 标题
  createTitleField('匕首之心 · 英雄卡', 'Daggerheart Playtest Character Sheet'),

  // 基本信息行：姓名 + 血脉 + 职业
  createRowField([
    createColField(8, [
      createInputField('name', '姓名', '英雄姓名', true),
    ]),
    createColField(8, [
      createSelectField('ancestry', '血脉', [
        { label: '人类', value: 'human' },
        { label: '精灵', value: 'elf' },
        { label: '半兽人', value: 'orc' },
        { label: '矮人', value: 'dwarf' },
        { label: '半身人', value: 'halfling' },
      ]),
    ]),
    createColField(8, [
      createSelectField('class', '职业', [
        { label: '战士', value: 'warrior' },
        { label: '游侠', value: 'ranger' },
        { label: '盗贼', value: 'rogue' },
        { label: '法师', value: 'sorcerer' },
        { label: '德鲁伊', value: 'druid' },
        { label: '缚灵者', value: 'binder' },
      ]),
    ]),
  ]),

  // 第二行：等级 + 阶层 + 社群
  createRowField([
    createColField(8, [createInputNumberField('level', '等级', 1, 1, 10)]),
    createColField(8, [createInputNumberField('tier', '阶层', 1, 1, 4)]),
    createColField(8, [createInputField('community', '社群')]),
  ]),

  // 六项属性组（范围 -2 到 4）
  createGroupField('属性 ATTRIBUTES', [
    createRowField([
      createColField(6, [createInputNumberField('agility', '敏捷 Agility', 0, -2, 4)]),
      createColField(6, [createInputNumberField('strength', '力量 Strength', 0, -2, 4)]),
      createColField(6, [createInputNumberField('finesse', '精巧 Finesse', 0, -2, 4)]),
      createColField(6, [createInputNumberField('instinct', '本能 Instinct', 0, -2, 4)]),
      createColField(6, [createInputNumberField('presence', '存在 Presence', 0, -2, 4)]),
      createColField(6, [createInputNumberField('knowledge', '知识 Knowledge', 0, -2, 4)]),
    ]),
  ]),

  // 耐力与压力组
  createGroupField('生命与压力 STAMINA & STRESS', [
    createRowField([
      createColField(6, [createInputNumberField('staminaMax', '最大耐力', 10, 1)]),
      createColField(6, [createInputNumberField('stamina', '当前耐力', 10, 0)]),
      createColField(6, [createInputNumberField('stressMax', '最大压力', 6, 1)]),
      createColField(6, [createInputNumberField('stress', '当前压力', 0, 0)]),
    ]),
  ]),

  // 经验标记
  createTextareaField('experience', '经验标记 Experience', '已标记的经验与未标记的经验...', 3),

  // 英雄过往
  createTextareaField('backstory', '英雄过往', '英雄的出身、关系与目标...'),
]

// ==================== 导出模板 ====================
export const daggerheartTemplate = createFormTemplate(
  'tpl-daggerheart',
  'DAGGERHEART',
  'Daggerheart 英雄卡',
  '匕首之心公开测试版英雄卡模板，含 6 项属性与耐力压力系统',
  daggerheartRule,
)