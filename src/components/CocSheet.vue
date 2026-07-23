<script setup lang="ts">
/**
 * 克苏鲁的呼唤 — 7e 调查员卡
 * 按 COC 7e 标准角色卡结构手动渲染
 *
 * 区块：
 *   1. 顶部头像（可上传/默认规则Logo）
 *   2. 基本信息（4行2列）：姓名、职业、玩家、年龄、性别、年份、居住地
 *   3. 4个突出摘要词条：职业、年龄、住地、年份
 *   4. 基础属性（3x3网格）：力量、敏捷、意志、体质、外貌、教育、体型、智力、幸运
 *   5. 当前状态（1行4列）：体力HP、理智SAN、魔法MP、护甲AC
 *   6. 技能表（详细/简单模式切换）：表格形式，列=技能名·初始值·职业点·兴趣点·成功率
 */
import type { CharacterCard } from '@/types/card'
import { ref, computed } from 'vue'
import { useCardStore } from '@/stores/cards'

const props = defineProps<{
  card: CharacterCard
  accentColor: string
  systemLogo: string
}>()

const fd = props.card.formData

const cardStore = useCardStore()

// ==================== 背景故事 ====================
const backstoryItems = [
  { key: 'backstory_desc', label: '个人描述' },
  { key: 'backstory_belief', label: '思想/信念' },
  { key: 'backstory_important', label: '重要之人' },
  { key: 'backstory_place', label: '非凡之地' },
  { key: 'backstory_treasure', label: '宝贵植物' },
  { key: 'backstory_trait', label: '特点' },
  { key: 'backstory_wound', label: '伤口/伤痕' },
  { key: 'backstory_phobia', label: '恐惧/狂躁症' },
]
const backstoryDialogVisible = ref(false)
const backstoryDialogTitle = ref('')
const backstoryDialogContent = ref('')
const backstoryDialogKey = ref('')
const backstoryDialogEditing = ref(false)
const backstoryIsDetail = ref(false)

function onBackstoryEntryTap(item: { key: string; label: string }) {
  backstoryDialogTitle.value = item.label
  backstoryDialogContent.value = (props.card.formData as any)[item.key] || ''
  backstoryDialogKey.value = item.key
  backstoryDialogEditing.value = false
  backstoryIsDetail.value = false
  backstoryDialogVisible.value = true
}

function onBackstoryDetailPreview() {
  backstoryDialogTitle.value = '详细故事'
  backstoryDialogContent.value = (props.card.formData as any).backstory_detail || ''
  backstoryDialogKey.value = 'backstory_detail'
  backstoryDialogEditing.value = false
  backstoryIsDetail.value = true
  backstoryDialogVisible.value = true
}

function closeBackstoryDialog() {
  backstoryDialogVisible.value = false
}

function startBackstoryEdit() {
  backstoryDialogEditing.value = true
}

function cancelBackstoryEdit() {
  backstoryDialogContent.value = (props.card.formData as any)[backstoryDialogKey.value] || ''
  backstoryDialogEditing.value = false
}

function applyBackstoryEdit() {
  const fd = { ...props.card.formData } as Record<string, unknown>
  fd[backstoryDialogKey.value] = backstoryDialogContent.value
  cardStore.updateCardFormData(props.card.id, fd)
  backstoryDialogVisible.value = false
  backstoryDialogEditing.value = false
}

/** 复制背景故事条目 */
function copyBackstoryEntry(item: { key: string; label: string }) {
  const text = (props.card.formData as any)[item.key] || ''
  if (!text) return
  navigator.clipboard.writeText(text).then(() => {
    // copied silently
  }).catch(() => {})
}

/** 复制详细故事 */
function copyBackstoryDetail() {
  const text = (props.card.formData as any).backstory_detail || ''
  if (!text) return
  navigator.clipboard.writeText(text).then(() => {}).catch(() => {})
}

// ==================== 背包 ====================
const backpackDialogVisible = ref(false)
const backpackDialogContent = ref('')
const backpackDialogEditing = ref(false)

function onBackpackPreview() {
  backpackDialogContent.value = (props.card.formData as any).backpack || ''
  backpackDialogEditing.value = false
  backpackDialogVisible.value = true
}

function closeBackpackDialog() {
  backpackDialogVisible.value = false
}

function startBackpackEdit() {
  backpackDialogEditing.value = true
}

function cancelBackpackEdit() {
  backpackDialogContent.value = (props.card.formData as any).backpack || ''
  backpackDialogEditing.value = false
}

function applyBackpackEdit() {
  const fd = { ...props.card.formData } as Record<string, unknown>
  fd.backpack = backpackDialogContent.value
  cardStore.updateCardFormData(props.card.id, fd)
  backpackDialogVisible.value = false
  backpackDialogEditing.value = false
}

/** 复制背包内容 */
function copyBackpack() {
  const text = (props.card.formData as any).backpack || ''
  if (!text) return
  navigator.clipboard.writeText(text).then(() => {}).catch(() => {})
}

// ==================== 经历 ====================
const experienceDialogVisible = ref(false)
const experienceDialogType = ref<'label' | 'value'>('label')
const experienceDialogTitle = ref('')
const experienceDialogLabel = ref('')
const experienceDialogContent = ref('')
const experienceDialogKey = ref('')
const experienceDialogEditing = ref(false)

const experienceItems = computed(() => {
  const fd = props.card.formData as any
  const exps = fd.experiences
  if (exps && Array.isArray(exps) && exps.length > 0) {
    return exps.map((exp: any, i: number) => ({
      key: exp.key || 'exp_' + i,
      label: exp.label || '',
      value: exp.value || '',
    }))
  }
  return [
    { key: 'exp_0', label: '', value: '' },
    { key: 'exp_1', label: '', value: '' },
  ]
})

function onExperienceLabelTap(item: { key: string; label: string; value: string }) {
  experienceDialogType.value = 'label'
  experienceDialogTitle.value = '经历模组'
  experienceDialogLabel.value = item.label
  experienceDialogContent.value = ''
  experienceDialogKey.value = item.key
  experienceDialogEditing.value = false
  experienceDialogVisible.value = true
}

function onExperienceValueTap(item: { key: string; label: string; value: string }) {
  experienceDialogType.value = 'value'
  experienceDialogTitle.value = '人物变化描述'
  experienceDialogLabel.value = ''
  experienceDialogContent.value = item.value
  experienceDialogKey.value = item.key
  experienceDialogEditing.value = false
  experienceDialogVisible.value = true
}

function onAddExperienceEntry() {
  const items = experienceItems.value.map(it => ({ ...it }))
  const nextIdx = items.length
  items.push({ key: 'exp_' + nextIdx, label: '', value: '' })
  const fd = { ...props.card.formData } as Record<string, unknown>
  fd.experiences = items
  cardStore.updateCardFormData(props.card.id, fd)
}

function closeExperienceDialog() {
  experienceDialogVisible.value = false
}

function startExperienceEdit() {
  experienceDialogEditing.value = true
}

function cancelExperienceEdit() {
  const item = experienceItems.value.find(it => it.key === experienceDialogKey.value)
  if (experienceDialogType.value === 'label') {
    experienceDialogLabel.value = item ? item.label : ''
  } else {
    experienceDialogContent.value = item ? item.value : ''
  }
  experienceDialogEditing.value = false
}

function applyExperienceEdit() {
  const items = experienceItems.value.map(it => {
    if (it.key === experienceDialogKey.value) {
      if (experienceDialogType.value === 'label') {
        return { ...it, label: experienceDialogLabel.value }
      } else {
        return { ...it, value: experienceDialogContent.value }
      }
    }
    return it
  })
  const fd = { ...props.card.formData } as Record<string, unknown>
  fd.experiences = items
  cardStore.updateCardFormData(props.card.id, fd)
  experienceDialogVisible.value = false
  experienceDialogEditing.value = false
}

function copyExperienceEntry(item: { key: string; label: string; value: string }) {
  if (!item.value) return
  navigator.clipboard.writeText(item.value).then(() => {}).catch(() => {})
}

// ==================== 技能表模式 ====================
const skillMode = ref<'simple' | 'detailed'>('detailed')
function toggleSkillMode() {
  skillMode.value = skillMode.value === 'simple' ? 'detailed' : 'simple'
}

// ==================== 属性值着色 ====================
function attrColor(v: number, base: string): string {
  if (v >= 80) return '#f59e0b'
  if (v >= 60) return base
  if (v >= 40) return '#94a3b8'
  return '#ef4444'
}

// ==================== 9 项基础属性（3x3） ====================
const attributes = [
  { key: 'str',  label: '力量', abbr: 'STR', value: fd.str  as number ?? 50 },
  { key: 'dex',  label: '敏捷', abbr: 'DEX', value: fd.dex  as number ?? 50 },
  { key: 'pow',  label: '意志', abbr: 'POW', value: fd.pow  as number ?? 50 },
  { key: 'con',  label: '体质', abbr: 'CON', value: fd.con  as number ?? 50 },
  { key: 'app',  label: '外貌', abbr: 'APP', value: fd.app  as number ?? 50 },
  { key: 'edu',  label: '教育', abbr: 'EDU', value: fd.edu  as number ?? 80 },
  { key: 'siz',  label: '体型', abbr: 'SIZ', value: fd.siz  as number ?? 50 },
  { key: 'int',  label: '智力', abbr: 'INT', value: fd.int  as number ?? 75 },
  { key: 'luck', label: '幸运', abbr: 'LUK', value: fd.luck as number ?? 50 },
]

// ==================== COC 7e 完整技能表（按文件定义左右列顺序） ====================
interface CocSkillDef {
  key: string
  nameZh: string
  nameEn: string
  base: number
  isHeader?: boolean
}

const leftSkillDefs: CocSkillDef[] = [
  { key: 'skill_accounting',       nameZh: '会计',       nameEn: 'Accounting',       base: 5 },
  { key: 'skill_anthropology',     nameZh: '人类学',     nameEn: 'Anthropology',     base: 1 },
  { key: 'skill_appraise',         nameZh: '估价',       nameEn: 'Appraise',         base: 5 },
  { key: 'skill_archaeology',      nameZh: '考古学',     nameEn: 'Archaeology',      base: 1 },
  { key: 'skill_artCraft',         nameZh: '技艺①',     nameEn: 'Art/Craft 1',      base: 5 },
  { key: 'skill_artCraft2',        nameZh: '技艺②',     nameEn: 'Art/Craft 2',      base: 5 },
  { key: 'skill_artCraft3',        nameZh: '技艺③',     nameEn: 'Art/Craft 3',      base: 5 },
  { key: 'skill_charm',            nameZh: '魅惑',       nameEn: 'Charm',            base: 15 },
  { key: 'skill_climb',            nameZh: '攀爬',       nameEn: 'Climb',            base: 20 },
  { key: 'skill_computer',         nameZh: '计算机使用', nameEn: 'Computer Use',     base: 5 },
  { key: 'skill_creditRating',     nameZh: '信用评级',   nameEn: 'Credit Rating',    base: 0 },
  { key: 'skill_cthulhuMythos',    nameZh: '克苏鲁神话', nameEn: 'Cthulhu Mythos',   base: 0 },
  { key: 'skill_disguise',         nameZh: '乔装',       nameEn: 'Disguise',         base: 5 },
  { key: 'skill_dodge',            nameZh: '闪避',       nameEn: 'Dodge',            base: Math.floor((fd.dex as number ?? 50) / 2) },
  { key: 'skill_driveAuto',        nameZh: '汽车驾驶',   nameEn: 'Drive Auto',       base: 20 },
  { key: 'skill_elecRepair',       nameZh: '电气维修',   nameEn: 'Electrical Repair',base: 10 },
  { key: 'skill_electronics',      nameZh: '电子学',     nameEn: 'Electronics',      base: 1 },
  { key: 'skill_fastTalk',         nameZh: '话术',       nameEn: 'Fast Talk',        base: 5 },
  { key: 'skill_fightingBrawl',    nameZh: '格斗：斗殴', nameEn: 'Fighting 1',       base: 25 },
  { key: 'skill_fighting2',        nameZh: '格斗②',     nameEn: 'Fighting 2',       base: 25 },
  { key: 'skill_fighting3',        nameZh: '格斗③',     nameEn: 'Fighting 3',       base: 25 },
  { key: 'skill_firearmsHandgun',  nameZh: '射击：手枪', nameEn: 'Firearms 1',       base: 20 },
  { key: 'skill_firearmsRifle',    nameZh: '射击②',     nameEn: 'Firearms 2',       base: 25 },
  { key: 'skill_firearms3',        nameZh: '射击③',     nameEn: 'Firearms 3',       base: 25 },
  { key: 'skill_firstAid',         nameZh: '急救',       nameEn: 'First Aid',        base: 30 },
  { key: 'skill_history',          nameZh: '历史',       nameEn: 'History',          base: 5 },
  { key: 'skill_intimidate',       nameZh: '恐吓',       nameEn: 'Intimidate',       base: 15 },
  { key: 'skill_jump',             nameZh: '跳跃',       nameEn: 'Jump',             base: 20 },
  { key: 'skill_languageOther',    nameZh: '外语①',     nameEn: 'Language 1',       base: 1 },
  { key: 'skill_languageOther2',   nameZh: '外语②',     nameEn: 'Language 2',       base: 1 },
  { key: 'skill_languageOther3',   nameZh: '外语③',     nameEn: 'Language 3',       base: 1 },
  { key: 'skill_languageOwn',      nameZh: '母语',       nameEn: 'Language (Own)',   base: fd.edu as number ?? 80 },
]

const rightSkillDefs: CocSkillDef[] = [
  { key: 'skill_law',              nameZh: '法律',       nameEn: 'Law',              base: 5 },
  { key: 'skill_libraryUse',       nameZh: '图书馆使用', nameEn: 'Library Use',      base: 20 },
  { key: 'skill_listen',           nameZh: '聆听',       nameEn: 'Listen',           base: 20 },
  { key: 'skill_locksmith',        nameZh: '锁匠',       nameEn: 'Locksmith',        base: 1 },
  { key: 'skill_mechRepair',       nameZh: '机械维修',   nameEn: 'Mechanical Repair',base: 10 },
  { key: 'skill_medicine',         nameZh: '医学',       nameEn: 'Medicine',         base: 1 },
  { key: 'skill_naturalWorld',     nameZh: '博物学',     nameEn: 'Natural World',    base: 10 },
  { key: 'skill_navigate',         nameZh: '领航',       nameEn: 'Navigate',         base: 10 },
  { key: 'skill_occult',           nameZh: '神秘学',     nameEn: 'Occult',           base: 5 },
  { key: 'skill_opHeavyMachine',   nameZh: '操作重型机械',nameEn: 'Op. Heavy Mach.',  base: 1 },
  { key: 'skill_persuade',         nameZh: '说服',       nameEn: 'Persuade',         base: 10 },
  { key: 'skill_pilot',           nameZh: '驾驶：',     nameEn: 'Pilot',            base: 1 },
  { key: 'skill_psychoanalysis',   nameZh: '精神分析',   nameEn: 'Psychoanalysis',   base: 1 },
  { key: 'skill_psychology',       nameZh: '心理学',     nameEn: 'Psychology',       base: 10 },
  { key: 'skill_ride',             nameZh: '骑术',       nameEn: 'Ride',             base: 5 },
  { key: 'skill_science',          nameZh: '科学①',     nameEn: 'Science 1',        base: 1 },
  { key: 'skill_science2',         nameZh: '科学②',     nameEn: 'Science 2',        base: 1 },
  { key: 'skill_science3',         nameZh: '科学③',     nameEn: 'Science 3',        base: 1 },
  { key: 'skill_sleightOfHand',    nameZh: '妙手',       nameEn: 'Sleight of Hand',  base: 10 },
  { key: 'skill_spotHidden',       nameZh: '侦查',       nameEn: 'Spot Hidden',      base: 25 },
  { key: 'skill_stealth',          nameZh: '潜行',       nameEn: 'Stealth',          base: 20 },
  { key: 'skill_survival',        nameZh: '生存：',     nameEn: 'Survival',         base: 10 },
  { key: 'skill_swim',             nameZh: '游泳',       nameEn: 'Swim',             base: 20 },
  { key: 'skill_throw',            nameZh: '投掷',       nameEn: 'Throw',            base: 20 },
  { key: 'skill_track',            nameZh: '追踪',       nameEn: 'Track',            base: 10 },
  { key: 'skill_animal',           nameZh: '驯兽',       nameEn: 'Animal Handling',  base: 5 },
  { key: 'skill_diving',           nameZh: '潜水',       nameEn: 'Diving',           base: 1 },
  { key: 'skill_demolitions',      nameZh: '爆破',       nameEn: 'Demolitions',      base: 1 },
  { key: 'skill_lipReading',       nameZh: '读唇',       nameEn: 'Lip Reading',      base: 1 },
  { key: 'skill_hypnosis',         nameZh: '催眠',       nameEn: 'Hypnosis',         base: 1 },
  { key: 'skill_artillery',        nameZh: '炮术',       nameEn: 'Artillery',        base: 1 },
  { key: 'skill_lore',            nameZh: '学问：',     nameEn: 'Lore',             base: 1 },
  { key: 'skill_custom',           nameZh: '自定义技能', nameEn: 'Custom Skill',     base: 0 },
]

/** 格式化单列技能 */
function formatSkills(defs: CocSkillDef[]) {
  const formData = props.card.formData
  return defs.map(skill => {
    if (skill.isHeader) return { ...skill, current: 0, growth: 0, occ: 0, int: 0, changed: false, color: '' }
    const growth = (formData[skill.key + '_growth'] as number) || 0
    const occ = (formData[skill.key + '_occ'] as number) || 0
    const int = (formData[skill.key + '_int'] as number) || 0
    const current = (formData[skill.key] as number) ?? skill.base
    const changed = current !== skill.base || growth > 0 || occ > 0 || int > 0
    // 外语技能：如果 st 导入时指定了具体语言名，用语言名替换默认的"外语①/②/③"
    const langName = (formData[skill.key + '_name'] as string) || ''
    const nameZh = langName || skill.nameZh
    if (langName) {
      console.log('[CocSheet] 外语名称覆盖:', skill.key, skill.nameZh, '→', langName)
    }
    const displayName = nameZh.length === 4 ? nameZh.substring(0, 2) + '\n' + nameZh.substring(2) : nameZh
    let color
    if (changed && current >= 50) {
      color = '#f59e0b'
    } else if (changed) {
      color = '#22c55e'
    } else {
      color = '#94a3b8'
    }
    return { ...skill, nameZh, displayName, current, growth, occ, int, changed, color }
  })
}

/** 左右列技能数据 */
const skillColumns = computed(() => ({
  left: formatSkills(leftSkillDefs),
  right: formatSkills(rightSkillDefs),
}))

/** 简单模式：仅显示更改过的技能（排除表头） */
const filteredColumns = computed(() => {
  if (skillMode.value === 'detailed') return skillColumns.value
  return {
    left: skillColumns.value.left.filter(s => s.isHeader || s.changed),
    right: skillColumns.value.right.filter(s => s.isHeader || s.changed),
  }
})
</script>

<template>
  <div class="space-y-3">
    <!-- ================================================================ -->
    <!-- 1. 顶部头像 + 身份卡 -->
    <!-- ================================================================ -->
    <div class="flex items-start gap-4 rounded-lg p-4"
      :style="{ background: `linear-gradient(135deg, ${accentColor}15 0%, ${accentColor}05 100%)`, border: `1px solid ${accentColor}22` }">

      <!-- 左侧可上传图片框架 -->
      <div class="relative flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg"
        :style="{ background: `${accentColor}12`, boxShadow: `0 0 0 2px ${accentColor}33` }">
        <img
          v-if="card.avatar"
          :src="card.avatar"
          class="h-full w-full object-cover"
          alt="avatar"
        />
        <span v-else class="text-3xl opacity-40">{{ systemLogo || '🔍' }}</span>
      </div>

      <!-- 右侧身份信息 -->
      <div class="min-w-0 flex-1">
        <div class="font-cinzel text-lg font-bold text-parchment-200">{{ fd.name || '无名调查员' }}</div>
        <div class="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-parchment-200/50">
          <span>{{ fd.occupation || '-' }}</span>
          <span class="text-parchment-200/25">·</span>
          <span>{{ fd.player || props.card.player || '-' }}</span>
          <span class="text-parchment-200/25">·</span>
          <span>{{ fd.age ?? '-' }}岁</span>
          <span class="text-parchment-200/25">·</span>
          <span>{{ fd.gender || '-' }}</span>
        </div>
        <div class="mt-0.5 text-[10px] text-parchment-200/30">
          {{ fd.year || '1920s' }} · {{ fd.residence || '-' }}
        </div>
      </div>
    </div>

    <!-- ================================================================ -->
    <!-- 2. 基本信息网格（4行2列） -->
    <!-- ================================================================ -->
    <div class="rounded-lg p-3"
      :style="{ background: `${accentColor}08`, border: `1px solid ${accentColor}15` }">
      <h3 class="mb-2 font-cinzel text-[11px] font-semibold tracking-wider" :style="{ color: accentColor }">
        基本信息
      </h3>
      <div class="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <div class="flex justify-between text-[11px]">
          <span class="text-parchment-200/40">姓名</span>
          <span class="text-parchment-200">{{ fd.name || '-' }}</span>
        </div>
        <div class="flex justify-between text-[11px]">
          <span class="text-parchment-200/40">职业</span>
          <span class="text-parchment-200">{{ fd.occupation || '-' }}</span>
        </div>
        <div class="flex justify-between text-[11px]">
          <span class="text-parchment-200/40">玩家</span>
          <span class="text-parchment-200">{{ fd.player || props.card.player || '-' }}</span>
        </div>
        <div class="flex justify-between text-[11px]">
          <span class="text-parchment-200/40">年龄</span>
          <span class="text-parchment-200">{{ fd.age ?? '-' }}</span>
        </div>
        <div class="flex justify-between text-[11px]">
          <span class="text-parchment-200/40">性别</span>
          <span class="text-parchment-200">{{ fd.gender || '-' }}</span>
        </div>
        <div class="flex justify-between text-[11px]">
          <span class="text-parchment-200/40">年份</span>
          <span class="text-parchment-200">{{ fd.year || '1920s' }}</span>
        </div>
        <div class="col-span-2 flex justify-between text-[11px]">
          <span class="text-parchment-200/40">居住地</span>
          <span class="text-parchment-200">{{ fd.residence || '-' }}</span>
        </div>
      </div>
    </div>

    <!-- ================================================================ -->
    <!-- 3. 4个突出摘要词条 -->
    <!-- ================================================================ -->
    <div class="grid grid-cols-4 gap-2">
      <div class="flex flex-col items-center gap-1">
        <div class="text-[9px] text-parchment-200/35">职业</div>
        <div class="w-full rounded-lg px-2 py-3 text-center flex items-center justify-center"
          :style="{ background: `${accentColor}0F`, boxShadow: `0 0 0 1px ${accentColor}28` }">
          <div class="font-cinzel text-base font-bold" :style="{ color: accentColor }">{{ fd.occupation || '-' }}</div>
        </div>
      </div>
      <div class="flex flex-col items-center gap-1">
        <div class="text-[9px] text-parchment-200/35">年龄</div>
        <div class="w-full rounded-lg px-2 py-3 text-center flex items-center justify-center"
          :style="{ background: `${accentColor}0F`, boxShadow: `0 0 0 1px ${accentColor}28` }">
          <div class="font-cinzel text-base font-bold" :style="{ color: accentColor }">{{ fd.age ?? '-' }}</div>
        </div>
      </div>
      <div class="flex flex-col items-center gap-1">
        <div class="text-[9px] text-parchment-200/35">住地</div>
        <div class="w-full rounded-lg px-2 py-3 text-center flex items-center justify-center"
          :style="{ background: `${accentColor}0F`, boxShadow: `0 0 0 1px ${accentColor}28` }">
          <div class="font-cinzel text-base font-bold" :style="{ color: accentColor }">{{ fd.residence || '-' }}</div>
        </div>
      </div>
      <div class="flex flex-col items-center gap-1">
        <div class="text-[9px] text-parchment-200/35">年份</div>
        <div class="w-full rounded-lg px-2 py-3 text-center flex items-center justify-center"
          :style="{ background: `${accentColor}0F`, boxShadow: `0 0 0 1px ${accentColor}28` }">
          <div class="font-cinzel text-base font-bold" :style="{ color: accentColor }">{{ fd.year || '1920s' }}</div>
        </div>
      </div>
    </div>

    <!-- ================================================================ -->
    <!-- 4. 基础属性（3x3 网格） -->
    <!-- ================================================================ -->
    <div class="rounded-lg p-3"
      :style="{ background: `${accentColor}08`, border: `1px solid ${accentColor}15` }">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="font-cinzel text-[11px] font-semibold tracking-wider" :style="{ color: accentColor }">
          基础属性
        </h3>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <div v-for="attr in attributes" :key="attr.key"
          class="flex flex-col items-center rounded-md px-1 py-2 text-center"
          :style="{ background: `${accentColor}0A` }">
          <span class="text-[8px] tracking-widest text-parchment-200/25">{{ attr.abbr }}</span>
          <span class="font-cinzel text-lg font-bold leading-none"
            :style="{ color: attrColor(attr.value, accentColor) }">
            {{ attr.value }}
          </span>
          <span class="mt-0.5 text-[9px] text-parchment-200/45">{{ attr.label }}</span>
          <div class="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-ink-800">
            <div class="h-full rounded-full transition-all"
              :style="{ width: Math.min(attr.value, 99) + '%', background: attrColor(attr.value, accentColor), opacity: 0.45 }" />
          </div>
        </div>
      </div>
    </div>

    <!-- ================================================================ -->
    <!-- 5. 当前状态（1行4列） -->
    <!-- ================================================================ -->
    <div class="rounded-lg p-3"
      :style="{ background: `${accentColor}08`, border: `1px solid ${accentColor}15` }">
      <h3 class="mb-2 font-cinzel text-[11px] font-semibold tracking-wider" :style="{ color: accentColor }">
        当前状态
      </h3>
      <div class="grid grid-cols-4 gap-2">
        <!-- 体力 HP -->
        <div class="rounded-lg px-2 py-2 text-center"
          :style="{ background: `linear-gradient(180deg, #ef444414 0%, #ef444406 100%)`, boxShadow: `0 0 0 1px #ef444433` }">
          <div class="font-cinzel text-lg font-bold text-red-400">
            {{ fd.hp ?? '-' }}<span class="text-[10px] text-parchment-200/25">/{{ fd.hpMax ?? '-' }}</span>
          </div>
          <div class="text-[9px] text-parchment-200/35">体力 HP</div>
        </div>
        <!-- 理智 SAN -->
        <div class="rounded-lg px-2 py-2 text-center"
          :style="{ background: `linear-gradient(180deg, #8b5cf614 0%, #8b5cf606 100%)`, boxShadow: `0 0 0 1px #8b5cf633` }">
          <div class="font-cinzel text-lg font-bold text-purple-400">{{ fd.san ?? '-' }}</div>
          <div class="text-[9px] text-parchment-200/35">理智 SAN</div>
        </div>
        <!-- 魔法 MP -->
        <div class="rounded-lg px-2 py-2 text-center"
          :style="{ background: `linear-gradient(180deg, #6366f114 0%, #6366f106 100%)`, boxShadow: `0 0 0 1px #6366f133` }">
          <div class="font-cinzel text-lg font-bold text-indigo-400">{{ fd.mp ?? '-' }}</div>
          <div class="text-[9px] text-parchment-200/35">魔法 MP</div>
        </div>
        <!-- 护甲 AC -->
        <div class="rounded-lg px-2 py-2 text-center"
          :style="{ background: `linear-gradient(180deg, #22c55e14 0%, #22c55e06 100%)`, boxShadow: `0 0 0 1px #22c55e33` }">
          <div class="font-cinzel text-lg font-bold text-emerald-400">{{ fd.ac ?? 0 }}</div>
          <div class="text-[9px] text-parchment-200/35">护甲 AC</div>
        </div>
      </div>
    </div>

    <!-- ================================================================ -->
    <!-- 6. 技能表 -->
    <!-- ================================================================ -->
    <div class="rounded-lg p-3"
      :style="{ background: `${accentColor}08`, border: `1px solid ${accentColor}15` }">
      <div class="mb-2 flex items-center justify-between">
        <h3 class="font-cinzel text-[11px] font-semibold tracking-wider" :style="{ color: accentColor }">
          技能表
        </h3>
        <button
          class="rounded px-2 py-0.5 text-[9px] transition"
          :style="{ color: accentColor, background: `${accentColor}15`, border: `1px solid ${accentColor}28` }"
          @click="toggleSkillMode"
        >
          {{ skillMode === 'detailed' ? '☰ 简单模式' : '☰ 详细模式' }}
        </button>
      </div>

      <!-- ===== 技能表（2列布局，保留初始/职业/兴趣/成功率） ===== -->
      <div class="grid grid-cols-2 gap-1.5">
        <!-- 左列 -->
        <div>
          <div class="mb-1 flex text-[8px] tracking-wider text-parchment-200/25"
            :style="{ borderBottom: `1px solid ${accentColor}15` }">
            <span class="w-8 flex-shrink-0 py-1">技能</span>
            <span class="flex-1 text-center py-1">成长</span>
            <span class="flex-1 text-center py-1">职业</span>
            <span class="flex-1 text-center py-1">兴趣</span>
            <span class="flex-1 text-center py-1">成功率</span>
          </div>
          <template v-for="skill in filteredColumns.left" :key="skill.key">
            <div
              v-if="skill.isHeader"
              class="flex items-center text-[8px] font-bold"
              :style="{ color: accentColor, borderBottom: `1px solid ${accentColor}15`, paddingTop: '2px' }"
            >{{ skill.nameZh }}</div>
            <div
              v-else
              class="flex items-center text-[10px] transition-colors"
              :style="{ borderBottom: `1px solid ${accentColor}08` }"
            >
              <span class="w-8 flex-shrink-0 py-0.5 text-parchment-200/70 leading-tight" style="word-break: keep-all; overflow-wrap: break-word; line-height: 1.15; white-space: pre-line;">{{ skill.displayName }}</span>
              <span class="flex-1 text-center" :style="{ color: skill.growth > 0 ? accentColor : 'rgba(232,220,196,0.2)' }">{{ skill.growth || 0 }}</span>
              <span class="flex-1 text-center" :style="{ color: skill.occ > 0 ? accentColor : 'rgba(232,220,196,0.2)' }">{{ skill.occ || '-' }}</span>
              <span class="flex-1 text-center" :style="{ color: skill.int > 0 ? accentColor : 'rgba(232,220,196,0.2)' }">{{ skill.int || '-' }}</span>
              <span class="flex-1 text-center font-bold" :style="{ color: skill.color }">{{ skill.current }}%</span>
            </div>
          </template>
        </div>
        <!-- 右列 -->
        <div>
          <div class="mb-1 flex text-[8px] tracking-wider text-parchment-200/25"
            :style="{ borderBottom: `1px solid ${accentColor}15` }">
            <span class="w-8 flex-shrink-0 py-1">技能</span>
            <span class="flex-1 text-center py-1">成长</span>
            <span class="flex-1 text-center py-1">职业</span>
            <span class="flex-1 text-center py-1">兴趣</span>
            <span class="flex-1 text-center py-1">成功率</span>
          </div>
          <template v-for="skill in filteredColumns.right" :key="skill.key">
            <div
              v-if="skill.isHeader"
              class="flex items-center text-[8px] font-bold"
              :style="{ color: accentColor, borderBottom: `1px solid ${accentColor}15`, paddingTop: '2px' }"
            >{{ skill.nameZh }}</div>
            <div
              v-else
              class="flex items-center text-[10px] transition-colors"
              :style="{ borderBottom: `1px solid ${accentColor}08` }"
            >
              <span class="w-8 flex-shrink-0 py-0.5 text-parchment-200/70 leading-tight" style="word-break: keep-all; overflow-wrap: break-word; line-height: 1.15; white-space: pre-line;">{{ skill.displayName }}</span>
              <span class="flex-1 text-center" :style="{ color: skill.growth > 0 ? accentColor : 'rgba(232,220,196,0.2)' }">{{ skill.growth || 0 }}</span>
              <span class="flex-1 text-center" :style="{ color: skill.occ > 0 ? accentColor : 'rgba(232,220,196,0.2)' }">{{ skill.occ || '-' }}</span>
              <span class="flex-1 text-center" :style="{ color: skill.int > 0 ? accentColor : 'rgba(232,220,196,0.2)' }">{{ skill.int || '-' }}</span>
              <span class="flex-1 text-center font-bold" :style="{ color: skill.color }">{{ skill.current }}%</span>
            </div>
          </template>
        </div>
      </div>

      <div v-if="filteredColumns.left.length === 0 && filteredColumns.right.length === 0" class="py-6 text-center text-[10px] text-parchment-200/25">
        {{ skillMode === 'simple' ? '暂无更改过的技能（切换到详细模式查看全部）' : '暂无技能数据' }}
      </div>
    </div>

    <!-- ================================================================ -->
    <!-- 背景故事 -->
    <!-- ================================================================ -->
    <div class="rounded-lg p-3" :style="{ background: `${accentColor}08`, border: `1px solid ${accentColor}15` }">
      <h3 class="mb-3 font-cinzel text-[11px] font-semibold tracking-wider" :style="{ color: accentColor }">背景故事</h3>

      <!-- 8栏条目列表 -->
      <div class="flex flex-col gap-0.5">
        <div
          v-for="item in backstoryItems"
          :key="item.key"
          class="flex items-center px-3 py-2.5 rounded-lg border cursor-pointer transition-colors hover:bg-parchment-200/5"
          :style="{ borderColor: `${accentColor}15` }"
          @click="onBackstoryEntryTap(item)"
          @contextmenu.prevent="copyBackstoryEntry(item)"
        >
          <span class="w-[88px] flex-shrink-0 text-[11px] font-medium" style="color: rgba(232,220,196,0.7)">{{ item.label }}</span>
          <span class="flex-1 text-[11px] truncate" style="color: rgba(232,220,196,0.35)">{{ (card.formData as any)[item.key] || '暂无' }}</span>
        </div>
      </div>

      <!-- 详细故事 -->
      <div class="mt-3">
        <span class="text-[10px] block mb-1.5" style="color: rgba(232,220,196,0.6)">详细故事</span>
        <div
          class="min-h-[240px] p-2.5 rounded-lg border cursor-pointer overflow-y-auto"
          :style="{ borderColor: `${accentColor}22`, background: `${accentColor}06` }"
          @click="onBackstoryDetailPreview"
          @contextmenu.prevent="copyBackstoryDetail"
        >
          <p v-if="(card.formData as any).backstory_detail" class="text-[11px] leading-relaxed whitespace-pre-wrap break-all" style="color: rgba(232,220,196,0.7)">{{ (card.formData as any).backstory_detail }}</p>
          <p v-else class="text-[11px] flex items-center justify-center h-full" style="color: rgba(232,220,196,0.2)">点击查看详细故事</p>
        </div>
      </div>
    </div>

    <!-- ================================================================ -->
    <!-- 背包 -->
    <!-- ================================================================ -->
    <div class="rounded-lg p-3" :style="{ background: `${accentColor}08`, border: `1px solid ${accentColor}15` }">
      <h3 class="mb-3 font-cinzel text-[11px] font-semibold tracking-wider" :style="{ color: accentColor }">背包</h3>
      <div class="mt-1">
        <span class="text-[10px] block mb-1.5" style="color: rgba(232,220,196,0.6)">物品清单</span>
        <div
          class="h-[240px] p-2.5 rounded-lg border cursor-pointer overflow-y-auto"
          :style="{ borderColor: `${accentColor}22`, background: `${accentColor}06` }"
          @click="onBackpackPreview"
          @contextmenu.prevent="copyBackpack"
        >
          <p v-if="(card.formData as any).backpack" class="text-[11px] leading-relaxed whitespace-pre-wrap break-all" style="color: rgba(232,220,196,0.7)">{{ (card.formData as any).backpack }}</p>
          <p v-else class="text-[11px] flex items-center justify-center h-full" style="color: rgba(232,220,196,0.2)">点击编辑背包</p>
        </div>
      </div>
    </div>

    <!-- ================================================================ -->
    <!-- 经历 -->
    <!-- ================================================================ -->
    <div class="rounded-lg p-3" :style="{ background: `${accentColor}08`, border: `1px solid ${accentColor}15` }">
      <h3 class="mb-3 font-cinzel text-[11px] font-semibold tracking-wider" :style="{ color: accentColor }">调查员经历</h3>
      <!-- 列标题 -->
      <div class="flex items-center px-3 pb-2 mb-1 border-b" :style="{ borderColor: `${accentColor}08` }">
        <span class="w-[140rpx] flex-shrink-0 text-[10px]" style="color: rgba(232,220,196,0.25)">经历模组</span>
        <span class="flex-1 ml-[25rpx] text-[10px]" style="color: rgba(232,220,196,0.25)">人物变化描述</span>
      </div>
      <div class="flex flex-col gap-0.5">
        <div
          v-for="item in experienceItems"
          :key="item.key"
          class="flex items-center px-3 py-2.5 rounded-lg border"
          :style="{ borderColor: `${accentColor}15` }"
        >
          <span
            class="w-[140rpx] flex-shrink-0 text-[11px] truncate cursor-pointer"
            :style="{ color: item.label ? 'rgba(232,220,196,0.7)' : 'rgba(232,220,196,0.25)' }"
            @click="onExperienceLabelTap(item)"
            @contextmenu.prevent="copyExperienceEntry(item)"
          >{{ item.label || '暂无' }}</span>
          <div class="w-px h-4 mx-2 flex-shrink-0" :style="{ background: `${accentColor}12` }" />
          <span
            class="flex-1 text-[11px] truncate cursor-pointer"
            style="color: rgba(232,220,196,0.35)"
            @click="onExperienceValueTap(item)"
            @contextmenu.prevent="copyExperienceEntry(item)"
          >{{ item.value || '暂无' }}</span>
        </div>
      </div>
      <div
        class="mt-2 py-2.5 rounded-lg border border-dashed text-center cursor-pointer transition-colors hover:bg-parchment-200/5 text-[11px]"
        :style="{ borderColor: `${accentColor}33`, color: accentColor }"
        @click="onAddExperienceEntry"
      >
        + 新增项目
      </div>
    </div>

    <!-- 背景故事弹窗 -->
    <Teleport to="body">
      <div v-if="backstoryDialogVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="closeBackstoryDialog">
        <div class="w-[85vw] max-h-[80vh] rounded-xl flex flex-col" :style="{ background: '#1A1714', border: `1px solid ${accentColor}33` }">
          <div class="flex items-center justify-between px-4 py-3 border-b" :style="{ borderColor: `${accentColor}15` }">
            <span class="text-[14px] font-semibold" :style="{ color: accentColor }">{{ backstoryDialogTitle }}</span>
            <template v-if="backstoryDialogEditing">
              <div class="flex items-center gap-3">
                <button class="text-[12px] px-2 py-0.5 rounded border" style="color: rgba(232,220,196,0.5); border-color: rgba(232,220,196,0.15); background: rgba(232,220,196,0.06)" @click="cancelBackstoryEdit">取消</button>
                <button class="text-[12px] px-2 py-0.5 rounded border font-semibold" :style="{ color: accentColor, borderColor: `${accentColor}44`, background: `${accentColor}15` }" @click="applyBackstoryEdit">保存</button>
              </div>
            </template>
            <button v-else class="text-[16px] px-1 text-green-400 hover:text-green-300" @click="startBackstoryEdit">✎</button>
          </div>
          <div class="flex-1 overflow-y-auto p-4">
            <textarea
              v-if="backstoryDialogEditing"
              v-model="backstoryDialogContent"
              class="w-full min-h-[300px] text-[13px] leading-relaxed rounded-lg p-3 resize-none"
              :style="{ background: `${accentColor}08`, color: 'rgba(232,220,196,0.8)', border: `1px solid ${accentColor}22` }"
              placeholder="输入内容..."
            ></textarea>
            <p v-else class="text-[13px] leading-relaxed whitespace-pre-wrap break-all" style="color: rgba(232,220,196,0.7)">{{ backstoryDialogContent || '暂无内容' }}</p>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 背包弹窗 -->
    <Teleport to="body">
      <div v-if="backpackDialogVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="closeBackpackDialog">
        <div class="w-[85vw] max-h-[80vh] rounded-xl flex flex-col" :style="{ background: '#1A1714', border: `1px solid ${accentColor}33` }">
          <div class="flex items-center justify-between px-4 py-3 border-b" :style="{ borderColor: `${accentColor}15` }">
            <span class="text-[14px] font-semibold" :style="{ color: accentColor }">背包</span>
            <template v-if="backpackDialogEditing">
              <div class="flex items-center gap-3">
                <button class="text-[12px] px-2 py-0.5 rounded border" style="color: rgba(232,220,196,0.5); border-color: rgba(232,220,196,0.15); background: rgba(232,220,196,0.06)" @click="cancelBackpackEdit">取消</button>
                <button class="text-[12px] px-2 py-0.5 rounded border font-semibold" :style="{ color: accentColor, borderColor: `${accentColor}44`, background: `${accentColor}15` }" @click="applyBackpackEdit">保存</button>
              </div>
            </template>
            <button v-else class="text-[16px] px-1 text-green-400 hover:text-green-300" @click="startBackpackEdit">✎</button>
          </div>
          <div class="flex-1 overflow-y-auto p-4">
            <textarea
              v-if="backpackDialogEditing"
              v-model="backpackDialogContent"
              class="w-full min-h-[300px] text-[13px] leading-relaxed rounded-lg p-3 resize-none"
              :style="{ background: `${accentColor}08`, color: 'rgba(232,220,196,0.8)', border: `1px solid ${accentColor}22` }"
              placeholder="输入背包物品..."
            ></textarea>
            <p v-else class="text-[13px] leading-relaxed whitespace-pre-wrap break-all" style="color: rgba(232,220,196,0.7)">{{ backpackDialogContent || '暂无内容' }}</p>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 经历弹窗 -->
    <Teleport to="body">
      <div v-if="experienceDialogVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="closeExperienceDialog">
        <div class="w-[85vw] max-h-[80vh] rounded-xl flex flex-col" :style="{ background: '#1A1714', border: `1px solid ${accentColor}33` }">
          <div class="flex items-center justify-between px-4 py-3 border-b" :style="{ borderColor: `${accentColor}15` }">
            <span class="text-[14px] font-semibold" :style="{ color: accentColor }">{{ experienceDialogType === 'value' ? '人物变化描述' : '经历模组' }}</span>
            <template v-if="experienceDialogEditing">
              <div class="flex items-center gap-3">
                <button class="text-[12px] px-2 py-0.5 rounded border" style="color: rgba(232,220,196,0.5); border-color: rgba(232,220,196,0.15); background: rgba(232,220,196,0.06)" @click="cancelExperienceEdit">取消</button>
                <button class="text-[12px] px-2 py-0.5 rounded border font-semibold" :style="{ color: accentColor, borderColor: `${accentColor}44`, background: `${accentColor}15` }" @click="applyExperienceEdit">保存</button>
              </div>
            </template>
            <button v-else class="text-[16px] px-1 text-green-400 hover:text-green-300" @click="startExperienceEdit">✎</button>
          </div>
          <div class="flex-1 overflow-y-auto p-4">
            <template v-if="experienceDialogEditing">
              <input
                v-if="experienceDialogType === 'label'"
                v-model="experienceDialogLabel"
                class="w-full h-9 px-3 rounded-lg text-[13px] outline-none"
                :style="{ background: `${accentColor}08`, color: 'rgba(232,220,196,0.8)', border: `1px solid ${accentColor}22` }"
                placeholder="经历模组"
              />
              <textarea
                v-if="experienceDialogType === 'value'"
                v-model="experienceDialogContent"
                class="w-full min-h-[200px] text-[13px] leading-relaxed rounded-lg p-3 resize-none"
                :style="{ background: `${accentColor}08`, color: 'rgba(232,220,196,0.8)', border: `1px solid ${accentColor}22` }"
                placeholder="人物变化描述"
              ></textarea>
            </template>
            <template v-else>
              <p class="text-[13px] leading-relaxed whitespace-pre-wrap break-all" style="color: rgba(232,220,196,0.7)">{{ experienceDialogType === 'value' ? (experienceDialogContent || '暂无内容') : (experienceDialogLabel || '暂无内容') }}</p>
            </template>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 时间戳 -->
    <div class="flex justify-between text-[9px] text-parchment-200/18">
      <span>创建：{{ new Date(card.createdAt).toLocaleDateString('zh-CN') }}</span>
      <span>更新：{{ new Date(card.updatedAt).toLocaleDateString('zh-CN') }}</span>
    </div>
  </div>
</template>