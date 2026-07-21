import type { FormTemplate, FormRule } from '@/types/card'

// 龙与地下城 (D&D 5e) 表单模板
// 字段参考 D&D 5e 玩家手册的角色卡结构
const dndRule: FormRule[] = [
  {
    type: 'title',
    title: '龙与地下城 · 冒险者卡',
    props: { title: '冒险者档案', description: 'D&D 5th Edition Character Sheet' },
  },
  {
    type: 'row',
    children: [
      {
        type: 'col',
        props: { span: 8 },
        children: [
          {
            type: 'input',
            field: 'name',
            title: '角色名',
            value: '',
            props: { placeholder: '冒险者姓名' },
            validate: [{ required: true, message: '请填写角色名' }],
          },
        ],
      },
      {
        type: 'col',
        props: { span: 8 },
        children: [
          {
            type: 'input',
            field: 'race',
            title: '种族',
            value: '',
            props: { placeholder: '如：人类、精灵、矮人' },
          },
        ],
      },
      {
        type: 'col',
        props: { span: 8 },
        children: [
          {
            type: 'select',
            field: 'class',
            title: '职业',
            value: '',
            props: {
              placeholder: '选择职业',
              options: [
                { label: '战士 Fighter', value: 'fighter' },
                { label: '法师 Wizard', value: 'wizard' },
                { label: '游侠 Ranger', value: 'ranger' },
                { label: '盗贼 Rogue', value: 'rogue' },
                { label: '牧师 Cleric', value: 'cleric' },
                { label: '圣武士 Paladin', value: 'paladin' },
                { label: '德鲁伊 Druid', value: 'druid' },
                { label: '吟游诗人 Bard', value: 'bard' },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    type: 'row',
    children: [
      {
        type: 'col',
        props: { span: 6 },
        children: [
          {
            type: 'inputNumber',
            field: 'level',
            title: '等级',
            value: 1,
            props: { min: 1, max: 20 },
          },
        ],
      },
      {
        type: 'col',
        props: { span: 6 },
        children: [
          {
            type: 'inputNumber',
            field: 'profBonus',
            title: '熟练加值',
            value: 2,
            props: { min: 2, max: 6 },
          },
        ],
      },
      {
        type: 'col',
        props: { span: 6 },
        children: [
          {
            type: 'input',
            field: 'background',
            title: '背景',
            value: '',
            props: { placeholder: '如：贵族、罪犯' },
          },
        ],
      },
      {
        type: 'col',
        props: { span: 6 },
        children: [
          {
            type: 'input',
            field: 'alignment',
            title: '阵营',
            value: '',
            props: { placeholder: '如：守序善良' },
          },
        ],
      },
    ],
  },
  {
    type: 'fcGroup',
    title: '六项属性 ABILITY SCORES',
    children: [
      {
        type: 'row',
        children: [
          {
            type: 'col',
            props: { span: 4 },
            children: [
              {
                type: 'inputNumber',
                field: 'str',
                title: '力量 STR',
                value: 10,
                props: { min: 1, max: 30 },
              },
            ],
          },
          {
            type: 'col',
            props: { span: 4 },
            children: [
              {
                type: 'inputNumber',
                field: 'dex',
                title: '敏捷 DEX',
                value: 10,
                props: { min: 1, max: 30 },
              },
            ],
          },
          {
            type: 'col',
            props: { span: 4 },
            children: [
              {
                type: 'inputNumber',
                field: 'con',
                title: '体质 CON',
                value: 10,
                props: { min: 1, max: 30 },
              },
            ],
          },
          {
            type: 'col',
            props: { span: 4 },
            children: [
              {
                type: 'inputNumber',
                field: 'int',
                title: '智力 INT',
                value: 10,
                props: { min: 1, max: 30 },
              },
            ],
          },
          {
            type: 'col',
            props: { span: 4 },
            children: [
              {
                type: 'inputNumber',
                field: 'wis',
                title: '感知 WIS',
                value: 10,
                props: { min: 1, max: 30 },
              },
            ],
          },
          {
            type: 'col',
            props: { span: 4 },
            children: [
              {
                type: 'inputNumber',
                field: 'cha',
                title: '魅力 CHA',
                value: 10,
                props: { min: 1, max: 30 },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    type: 'fcGroup',
    title: '战斗数据 COMBAT',
    children: [
      {
        type: 'row',
        children: [
          {
            type: 'col',
            props: { span: 6 },
            children: [
              {
                type: 'inputNumber',
                field: 'ac',
                title: '护甲等级 AC',
                value: 12,
                props: { min: 1 },
              },
            ],
          },
          {
            type: 'col',
            props: { span: 6 },
            children: [
              {
                type: 'inputNumber',
                field: 'hp',
                title: '当前 HP',
                value: 12,
                props: { min: 0 },
              },
            ],
          },
          {
            type: 'col',
            props: { span: 6 },
            children: [
              {
                type: 'inputNumber',
                field: 'hpMax',
                title: '最大 HP',
                value: 12,
                props: { min: 1 },
              },
            ],
          },
          {
            type: 'col',
            props: { span: 6 },
            children: [
              {
                type: 'input',
                field: 'hitDice',
                title: '生命骰',
                value: '1d10',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    type: 'fcGroup',
    title: '豁免与技能 SAVES & SKILLS',
    children: [
      {
        type: 'checkbox',
        field: 'savingThrows',
        title: '熟练豁免',
        value: [],
        props: {
          options: [
            { label: '力量', value: 'str' },
            { label: '敏捷', value: 'dex' },
            { label: '体质', value: 'con' },
            { label: '智力', value: 'int' },
            { label: '感知', value: 'wis' },
            { label: '魅力', value: 'cha' },
          ],
        },
      },
      {
        type: 'checkbox',
        field: 'skillProf',
        title: '熟练技能（部分）',
        value: [],
        props: {
          options: [
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
          ],
        },
      },
    ],
  },
  {
    type: 'textarea',
    field: 'features',
    title: '特性与专长',
    value: '',
    props: { rows: 4, placeholder: '职业特性、种族天赋、专长...' },
  },
  {
    type: 'textarea',
    field: 'backstory',
    title: '背景故事',
    value: '',
    props: { rows: 4, placeholder: '冒险者的过往与冒险动机...' },
  },
]

export const dndTemplate: FormTemplate = {
  id: 'tpl-dnd',
  system: 'DND',
  name: 'D&D 5e 冒险者卡',
  description: '龙与地下城 5 版冒险者卡模板，含六项属性、战斗数据与豁免技能',
  rule: dndRule,
  option: {
    form: { labelWidth: 'auto', labelPosition: 'top' },
    submitBtn: false,
    resetBtn: false,
  },
}
