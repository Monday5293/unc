import type { FormTemplate, FormRule } from '@/types/card'

// 克苏鲁的呼唤 (COC 7e) 表单模板
// 字段参考 COC 7th 规则书的角色卡结构
const cocRule: FormRule[] = [
  {
    type: 'title',
    title: '克苏鲁的呼唤 · 调查员卡',
    props: { title: '调查员档案', description: 'COC 7th Edition Character Sheet' },
  },
  {
    type: 'row',
    children: [
      {
        type: 'col',
        props: { span: 12 },
        children: [
          {
            type: 'input',
            field: 'name',
            title: '姓名',
            value: '',
            props: { placeholder: '调查员姓名' },
            validate: [{ required: true, message: '请填写姓名' }],
          },
        ],
      },
      {
        type: 'col',
        props: { span: 12 },
        children: [
          {
            type: 'input',
            field: 'occupation',
            title: '职业',
            value: '',
            props: { placeholder: '如：私家侦探、医生' },
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
            field: 'age',
            title: '年龄',
            value: 25,
            props: { min: 15, max: 90 },
          },
        ],
      },
      {
        type: 'col',
        props: { span: 8 },
        children: [
          {
            type: 'input',
            field: 'gender',
            title: '性别',
            value: '',
          },
        ],
      },
      {
        type: 'col',
        props: { span: 8 },
        children: [
          {
            type: 'input',
            field: 'residence',
            title: '居住地',
            value: '',
          },
        ],
      },
    ],
  },
  {
    type: 'fcGroup',
    title: '基础属性 ATTRIBUTES',
    children: [
      {
        type: 'row',
        children: [
          {
            type: 'col',
            props: { span: 6 },
            children: [
              {
                type: 'slider',
                field: 'str',
                title: '力量 STR',
                value: 50,
                props: { min: 1, max: 99, showInput: true },
              },
            ],
          },
          {
            type: 'col',
            props: { span: 6 },
            children: [
              {
                type: 'slider',
                field: 'con',
                title: '体质 CON',
                value: 50,
                props: { min: 1, max: 99, showInput: true },
              },
            ],
          },
          {
            type: 'col',
            props: { span: 6 },
            children: [
              {
                type: 'slider',
                field: 'siz',
                title: '体型 SIZ',
                value: 50,
                props: { min: 1, max: 99, showInput: true },
              },
            ],
          },
          {
            type: 'col',
            props: { span: 6 },
            children: [
              {
                type: 'slider',
                field: 'dex',
                title: '敏捷 DEX',
                value: 50,
                props: { min: 1, max: 99, showInput: true },
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
                type: 'slider',
                field: 'app',
                title: '外貌 APP',
                value: 50,
                props: { min: 1, max: 99, showInput: true },
              },
            ],
          },
          {
            type: 'col',
            props: { span: 6 },
            children: [
              {
                type: 'slider',
                field: 'int',
                title: '智力 INT',
                value: 50,
                props: { min: 1, max: 99, showInput: true },
              },
            ],
          },
          {
            type: 'col',
            props: { span: 6 },
            children: [
              {
                type: 'slider',
                field: 'pow',
                title: '意志 POW',
                value: 50,
                props: { min: 1, max: 99, showInput: true },
              },
            ],
          },
          {
            type: 'col',
            props: { span: 6 },
            children: [
              {
                type: 'slider',
                field: 'edu',
                title: '教育 EDU',
                value: 50,
                props: { min: 1, max: 99, showInput: true },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    type: 'fcGroup',
    title: '生命与理智 HEALTH & SANITY',
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
                field: 'hp',
                title: '生命值 HP',
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
                type: 'inputNumber',
                field: 'mp',
                title: '魔法值 MP',
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
                field: 'san',
                title: '理智 SAN',
                value: 60,
                props: { min: 0, max: 99 },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    type: 'fcGroup',
    title: '技能 SKILLS（部分）',
    children: [
      {
        type: 'row',
        children: [
          {
            type: 'col',
            props: { span: 6 },
            children: [
              {
                type: 'slider',
                field: 'skill_libraryUse',
                title: '图书馆使用',
                value: 55,
                props: { min: 0, max: 99, showInput: true },
              },
            ],
          },
          {
            type: 'col',
            props: { span: 6 },
            children: [
              {
                type: 'slider',
                field: 'skill_spotHidden',
                title: '侦查',
                value: 50,
                props: { min: 0, max: 99, showInput: true },
              },
            ],
          },
          {
            type: 'col',
            props: { span: 6 },
            children: [
              {
                type: 'slider',
                field: 'skill_listen',
                title: '聆听',
                value: 45,
                props: { min: 0, max: 99, showInput: true },
              },
            ],
          },
          {
            type: 'col',
            props: { span: 6 },
            children: [
              {
                type: 'slider',
                field: 'skill_dodge',
                title: '闪避',
                value: 40,
                props: { min: 0, max: 99, showInput: true },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    type: 'textarea',
    field: 'backstory',
    title: '背景故事',
    value: '',
    props: { rows: 4, placeholder: '调查员的过往、动机与遭遇过的超自然事件...' },
  },
]

export const cocTemplate: FormTemplate = {
  id: 'tpl-coc',
  system: 'COC',
  name: 'COC 7e 调查员卡',
  description: '克苏鲁的呼唤 7 版调查员角色卡模板，含 8 项基础属性、生命理智与常用技能',
  rule: cocRule,
  option: {
    form: { labelWidth: 'auto', labelPosition: 'top' },
    submitBtn: false,
    resetBtn: false,
  },
}
