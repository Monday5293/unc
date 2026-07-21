/**
 * 龙与地下城 (D&D 5e) 规则模板
 * 
 * 字段参考 D&D 5e 玩家手册的角色卡结构
 * 包含：基本信息、六项属性、战斗数据、豁免与技能、特性、背景故事
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
  createCheckboxField,
  createTextareaField,
} from '../common/base-template'

// ==================== D&D 5e 冒险者卡表单规则 ====================
const dndRule: FormRule[] = [
  // 标题
  createTitleField('龙与地下城 · 冒险者卡', 'D&D 5th Edition Character Sheet'),

  // 基本信息行：角色名 + 种族 + 职业
  createRowField([
    createColField(8, [
      createInputField('name', '角色名', '冒险者姓名', true),
    ]),
    createColField(8, [
      createInputField('race', '种族', '如：人类、精灵、矮人'),
    ]),
    createColField(8, [
      createSelectField('class', '职业', [
        { label: '战士 Fighter', value: 'fighter' },
        { label: '法师 Wizard', value: 'wizard' },
        { label: '游侠 Ranger', value: 'ranger' },
        { label: '盗贼 Rogue', value: 'rogue' },
        { label: '牧师 Cleric', value: 'cleric' },
        { label: '圣武士 Paladin', value: 'paladin' },
        { label: '德鲁伊 Druid', value: 'druid' },
        { label: '吟游诗人 Bard', value: 'bard' },
      ], '选择职业'),
    ]),
  ]),

  // 第二行：等级 + 熟练加值 + 背景 + 阵营
  createRowField([
    createColField(6, [createInputNumberField('level', '等级', 1, 1, 20)]),
    createColField(6, [createInputNumberField('profBonus', '熟练加值', 2, 2, 6)]),
    createColField(6, [
      createInputField('background', '背景', '如：贵族、罪犯'),
    ]),
    createColField(6, [
      createInputField('alignment', '阵营', '如：守序善良'),
    ]),
  ]),

  // 六项属性组
  createGroupField('六项属性 ABILITY SCORES', [
    createRowField([
      createColField(4, [createInputNumberField('str', '力量 STR', 10, 1, 30)]),
      createColField(4, [createInputNumberField('dex', '敏捷 DEX', 10, 1, 30)]),
      createColField(4, [createInputNumberField('con', '体质 CON', 10, 1, 30)]),
      createColField(4, [createInputNumberField('int', '智力 INT', 10, 1, 30)]),
      createColField(4, [createInputNumberField('wis', '感知 WIS', 10, 1, 30)]),
      createColField(4, [createInputNumberField('cha', '魅力 CHA', 10, 1, 30)]),
    ]),
  ]),

  // 战斗数据组
  createGroupField('战斗数据 COMBAT', [
    createRowField([
      createColField(6, [createInputNumberField('ac', '护甲等级 AC', 12, 1)]),
      createColField(6, [createInputNumberField('hp', '当前 HP', 12, 0)]),
      createColField(6, [createInputNumberField('hpMax', '最大 HP', 12, 1)]),
      createColField(6, [createInputField('hitDice', '生命骰', '1d10')]),
    ]),
  ]),

  // 豁免与技能组
  createGroupField('豁免与技能 SAVES & SKILLS', [
    createCheckboxField('savingThrows', '熟练豁免', [
      { label: '力量', value: 'str' },
      { label: '敏捷', value: 'dex' },
      { label: '体质', value: 'con' },
      { label: '智力', value: 'int' },
      { label: '感知', value: 'wis' },
      { label: '魅力', value: 'cha' },
    ]),
    createCheckboxField('skillProf', '熟练技能（部分）', [
      { label: '运动', value: 'athletics' },
      { label: '杂技', value: 'acrobatics' },
      { label: '巧手', value: 'sleight' },
      { label: '隐匿', value: 'stealth' },
      { label: '奥秘', value: 'arcana' },
      { label: '历史', value: 'history' },
      { label: '调查', value: 'investigation' },
      { label: '自然', value: 'nature' },
      { label: '宗教', value: 'religion' },
      { label: '驯兽', value: 'animal' },
      { label: '洞悉', value: 'insight' },
      { label: '医药', value: 'medicine' },
      { label: '察觉', value: 'perception' },
      { label: '生存', value: 'survival' },
      { label: '欺瞒', value: 'deception' },
      { label: '威吓', value: 'intimidation' },
      { label: '表演', value: 'performance' },
      { label: '说服', value: 'persuasion' },
    ]),
  ]),

  // 特性与专长
  createTextareaField('features', '特性与专长', '职业特性、种族天赋、专长...'),

  // 背景故事
  createTextareaField('backstory', '背景故事', '冒险者的过往与冒险动机...'),
]

// ==================== 导出模板 ====================
export const dndTemplate = createFormTemplate(
  'tpl-dnd',
  'DND',
  'D&D 5e 冒险者卡',
  '龙与地下城 5 版冒险者卡模板，含六项属性、战斗数据与豁免技能',
  dndRule,
)