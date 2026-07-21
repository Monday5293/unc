import type { FormTemplate, FormRule } from '@/types/card'

// 匕首之心 (Daggerheart) 表单模板
// 字段参考 Daggerheart 公开测试版
const daggerheartRule: FormRule[] = [
  {
    type: 'title',
    title: '匕首之心 · 英雄卡',
    props: { title: '英雄档案', description: 'Daggerheart Playtest Character Sheet' },
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
            title: '姓名',
            value: '',
            props: { placeholder: '英雄姓名' },
            validate: [{ required: true, message: '请填写姓名' }],
          },
        ],
      },
      {
        type: 'col',
        props: { span: 8 },
        children: [
          {
            type: 'select',
            field: 'ancestry',
            title: '血脉',
            value: '',
            props: {
              options: [
                { label: '人类', value: 'human' },
                { label: '精灵', value: 'elf' },
                { label: '半兽人', value: 'orc' },
                { label: '矮人', value: 'dwarf' },
                { label: '半身人', value: 'halfling' },
              ],
            },
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
              options: [
                { label: '战士', value: 'warrior' },
                { label: '游侠', value: 'ranger' },
                { label: '盗贼', value: 'rogue' },
                { label: '法师', value: 'sorcerer' },
                { label: '德鲁伊', value: 'druid' },
                { label: '缚灵者', value: 'binder' },
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
        props: { span: 8 },
        children: [
          {
            type: 'inputNumber',
            field: 'level',
            title: '等级',
            value: 1,
            props: { min: 1, max: 10 },
          },
        ],
      },
      {
        type: 'col',
        props: { span: 8 },
        children: [
          {
            type: 'inputNumber',
            field: 'tier',
            title: '阶层',
            value: 1,
            props: { min: 1, max: 4 },
          },
        ],
      },
      {
        type: 'col',
        props: { span: 8 },
        children: [
          {
            type: 'input',
            field: 'community',
            title: '社群',
            value: '',
          },
        ],
      },
    ],
  },
  {
    type: 'fcGroup',
    title: '属性 ATTRIBUTES',
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
                field: 'agility',
                title: '敏捷 Agility',
                value: 0,
                props: { min: -2, max: 4 },
              },
            ],
          },
          {
            type: 'col',
            props: { span: 6 },
            children: [
              {
                type: 'inputNumber',
                field: 'strength',
                title: '力量 Strength',
                value: 0,
                props: { min: -2, max: 4 },
              },
            ],
          },
          {
            type: 'col',
            props: { span: 6 },
            children: [
              {
                type: 'inputNumber',
                field: 'finesse',
                title: '精巧 Finesse',
                value: 0,
                props: { min: -2, max: 4 },
              },
            ],
          },
          {
            type: 'col',
            props: { span: 6 },
            children: [
              {
                type: 'inputNumber',
                field: 'instinct',
                title: '本能 Instinct',
                value: 0,
                props: { min: -2, max: 4 },
              },
            ],
          },
          {
            type: 'col',
            props: { span: 6 },
            children: [
              {
                type: 'inputNumber',
                field: 'presence',
                title: '存在 Presence',
                value: 0,
                props: { min: -2, max: 4 },
              },
            ],
          },
          {
            type: 'col',
            props: { span: 6 },
            children: [
              {
                type: 'inputNumber',
                field: 'knowledge',
                title: '知识 Knowledge',
                value: 0,
                props: { min: -2, max: 4 },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    type: 'fcGroup',
    title: '生命与压力 STAMINA & STRESS',
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
                field: 'staminaMax',
                title: '最大耐力',
                value: 10,
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
                field: 'stamina',
                title: '当前耐力',
                value: 10,
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
                field: 'stressMax',
                title: '最大压力',
                value: 6,
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
                field: 'stress',
                title: '当前压力',
                value: 0,
                props: { min: 0 },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    type: 'textarea',
    field: 'experience',
    title: '经验标记 Experience',
    value: '',
    props: { rows: 3, placeholder: '已标记的经验与未标记的经验...' },
  },
  {
    type: 'textarea',
    field: 'backstory',
    title: '英雄过往',
    value: '',
    props: { rows: 4, placeholder: '英雄的出身、关系与目标...' },
  },
]

export const daggerheartTemplate: FormTemplate = {
  id: 'tpl-daggerheart',
  system: 'DAGGERHEART',
  name: 'Daggerheart 英雄卡',
  description: '匕首之心公开测试版英雄卡模板，含 6 项属性与耐力压力系统',
  rule: daggerheartRule,
  option: {
    form: { labelWidth: 'auto', labelPosition: 'top' },
    submitBtn: false,
    resetBtn: false,
  },
}
