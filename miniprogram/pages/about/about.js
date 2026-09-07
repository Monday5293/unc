const themeUtil = require('../../utils/theme.js')

// 更新日志（新版本放最上面）
const CHANGELOG = [
  {
    version: 'v1.3.0',
    date: '2026-09-07',
    items: [
      '新增：设置页面（外观 / 邀请码管理）',
      '新增：浅色模式，可在设置中切换',
      '新增：关于页面（更新日志 / 作者的话）',
      '新增：注册需邀请码机制',
      '修复：修改昵称后云端未同步的问题',
      '修复：修改昵称后原密码无法登录的问题'
    ]
  },
  {
    version: 'v1.2.0',
    date: '2026-08-03',
    items: [
      '新增：昵称 + 密码登录，账号数据云端同步',
      '新增：角色卡云同步，支持跨设备使用',
      '优化：COC / DND / DAGGERHEART 预设范例卡'
    ]
  },
  {
    version: 'v1.0.0',
    date: '2026-01-15',
    items: [
      '首个版本发布',
      '支持 COC / DND / DAGGERHEART 三大规则系统',
      '支持 .st 指令与 DHSheet JSON 导入',
      '支持自定义规则系统与表单'
    ]
  }
]

const AUTHOR_NOTE = '你好，跑团爱好者！\n\n这个小程序诞生于一次次跑团时翻找角色卡的烦恼——纸质卡容易丢，截图不好找，换张表就要重抄一遍。于是我把它做成了随身携带的卡包。\n\n无论你是守秘人还是调查员，希望它能让你把精力放回故事本身。如果用得顺手，欢迎推荐给车里的伙伴；遇到问题或有想法，也随时欢迎反馈。\n\n愿骰子永远眷顾你。'

const PRIVACY_TEXT = '1. 信息收集\n我们仅在你主动注册时收集你填写的昵称与密码（密码经单向加密存储，任何人包括开发者都无法还原明文）。\n\n2. 数据存储\n你的角色卡数据存储于腾讯云开发数据库中，仅与你本人账号关联，其他用户无法访问。\n\n3. 数据使用\n我们不会将你的任何数据用于商业用途，不会向第三方出售或共享你的个人信息。\n\n4. 本地存储\n主题偏好等设置仅保存在你的设备本地，卸载小程序即自动清除。\n\n5. 账号注销\n如需删除账号与全部数据，请联系开发者，我们将在核实后删除云端全部相关数据。'

const AGREEMENT_TEXT = '欢迎使用跑团角色卡小程序。\n\n1. 服务说明\n本小程序为跑团（桌上角色扮演游戏）爱好者提供角色卡管理工具，包括角色卡创建、编辑、收藏与云端同步功能。\n\n2. 用户行为\n请勿利用本小程序存储违反法律法规或公序良俗的内容。我们保留对违规内容与账号进行处置的权利。\n\n3. 账号安全\n请妥善保管你的账号密码。因主动泄露密码造成的损失由用户自行承担。\n\n4. 服务变更与中断\n本小程序为兴趣项目，可能存在功能调整、维护或停止服务的情形，重要数据建议自行备份（小程序内支持导出）。\n\n5. 免责声明\n在法律允许的范围内，本小程序不对因不可抗力或非人为因素导致的数据丢失承担责任。'

Page({
  data: {
    theme: 'dark',
    changelog: CHANGELOG,
    authorNote: AUTHOR_NOTE,
    // 法律文本弹窗
    legalDialogVisible: false,
    legalDialogTitle: '',
    legalDialogContent: ''
  },

  onShow() {
    themeUtil.applyToPage(this)
  },

  showPrivacy() {
    this.setData({
      legalDialogVisible: true,
      legalDialogTitle: '隐私政策',
      legalDialogContent: PRIVACY_TEXT
    })
  },

  showAgreement() {
    this.setData({
      legalDialogVisible: true,
      legalDialogTitle: '用户协议',
      legalDialogContent: AGREEMENT_TEXT
    })
  },

  closeLegalDialog() {
    this.setData({ legalDialogVisible: false })
  },

  stopPropagation() {}
})
