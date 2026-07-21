<script setup lang="ts">
/**
 * 龙与地下城 — 5e 冒险者卡
 * 经典奇幻中世纪风格 / 金色纹饰
 */
import type { CharacterCard } from '@/types/card'
import { getDndClassLabel } from '@/data/rules/common/labels'
import { computed } from 'vue'

const props = defineProps<{
  card: CharacterCard
  accentColor: string
}>()

const fd = props.card.formData

/** 属性调整值 */
function mod(score: number): string {
  const m = Math.floor((score - 10) / 2)
  return m >= 0 ? `+${m}` : `${m}`
}

/** 调整值着色 */
function modColor(score: number): string {
  const m = Math.floor((score - 10) / 2)
  if (m >= 4) return '#f59e0b'
  if (m >= 2) return props.accentColor
  if (m >= 0) return '#94a3b8'
  return '#ef4444'
}

/** 6 项属性 */
const abilities = [
  { key: 'str', label: '力量', abbr: 'STR', value: fd.str as number ?? 10 },
  { key: 'dex', label: '敏捷', abbr: 'DEX', value: fd.dex as number ?? 10 },
  { key: 'con', label: '体质', abbr: 'CON', value: fd.con as number ?? 10 },
  { key: 'int', label: '智力', abbr: 'INT', value: fd.int as number ?? 10 },
  { key: 'wis', label: '感知', abbr: 'WIS', value: fd.wis as number ?? 10 },
  { key: 'cha', label: '魅力', abbr: 'CHA', value: fd.cha as number ?? 10 },
]

/** 职业中文名 */
const classLabel = computed(() => {
  const cls = fd.class as string
  return cls ? getDndClassLabel(cls) : '-'
})

/** 熟练豁免 */
const savingThrows = (fd.savingThrows as string[]) ?? []
const saveLabels: Record<string, string> = {
  str: '力量', dex: '敏捷', con: '体质', int: '智力', wis: '感知', cha: '魅力',
}

/** 熟练技能 */
const skillProf = (fd.skillProf as string[]) ?? []
const skillLabels: Record<string, string> = {
  athletics: '运动', acrobatics: '杂技', sleight: '巧手', stealth: '隐匿',
  arcana: '奥秘', history: '历史', investigation: '调查', nature: '自然', religion: '宗教',
  animal: '驯兽', insight: '洞悉', medicine: '医药', perception: '察觉', survival: '生存',
  deception: '欺瞒', intimidation: '威吓', performance: '表演', persuasion: '说服',
}

/** HP 百分比 */
const hpPercent = computed(() => {
  const hp = fd.hp as number
  const hpMax = fd.hpMax as number
  if (!hpMax || hpMax === 0) return 0
  return Math.min((hp / hpMax) * 100, 100)
})

/** HP 颜色 */
const hpColor = computed(() => {
  if (hpPercent.value > 50) return '#22c55e'
  if (hpPercent.value > 25) return '#f59e0b'
  return '#ef4444'
})
</script>

<template>
  <div class="space-y-3">
    <!-- ===== 身份徽章 ===== -->
    <div class="relative overflow-hidden rounded-lg p-4"
      :style="{
        background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}06 100%)`,
        border: `1px solid ${accentColor}28`,
      }">
      <!-- 装饰边框 -->
      <div class="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-5"
        :style="{ background: accentColor }" />
      <div class="absolute -bottom-4 -left-4 h-14 w-14 rounded-full opacity-5"
        :style="{ background: accentColor }" />

      <div class="relative flex items-center gap-4">
        <div class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl text-3xl"
          :style="{
            background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}0A)`,
            boxShadow: `0 0 0 2px ${accentColor}33, inset 0 0 12px ${accentColor}10`,
          }">
          🐉
        </div>
        <div class="min-w-0 flex-1">
          <div class="font-cinzel text-xl font-bold text-parchment-200">
            {{ fd.name || '无名冒险者' }}
          </div>
          <div class="mt-1 flex items-center gap-2 text-xs">
            <span class="rounded-full px-2 py-0.5 text-[10px]"
              :style="{ background: `${accentColor}18`, color: accentColor }">
              Lv.{{ fd.level ?? '?' }}
            </span>
            <span class="text-parchment-200/60">{{ fd.race || '?' }} · {{ classLabel }}</span>
          </div>
          <div class="mt-1.5 flex flex-wrap gap-x-3 text-[10px] text-parchment-200/40">
            <span>{{ fd.background || '?' }}</span>
            <span class="text-parchment-200/20">·</span>
            <span>{{ fd.alignment || '?' }}</span>
            <span class="text-parchment-200/20">·</span>
            <span>熟练 +{{ fd.profBonus ?? '?' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 六项属性 ===== -->
    <div class="rounded-lg p-3"
      :style="{ background: `${accentColor}08`, border: `1px solid ${accentColor}15` }">
      <h3 class="mb-3 font-cinzel text-[11px] font-semibold tracking-wider" :style="{ color: accentColor }">
        六项属性 · ABILITY SCORES
      </h3>
      <div class="grid grid-cols-6 gap-1.5">
        <div v-for="ab in abilities" :key="ab.key"
          class="flex flex-col items-center rounded-md px-1 py-2 text-center"
          :style="{ background: `${accentColor}0A` }">
          <!-- 调整值（大号） -->
          <span class="font-cinzel text-lg font-bold leading-none"
            :style="{ color: modColor(ab.value) }">
            {{ mod(ab.value) }}
          </span>
          <!-- 属性值（小号） -->
          <span class="mt-0.5 text-[13px] font-semibold text-parchment-200/70">{{ ab.value }}</span>
          <!-- 缩写 -->
          <span class="mt-0.5 text-[8px] tracking-widest text-parchment-200/30">{{ ab.abbr }}</span>
        </div>
      </div>
    </div>

    <!-- ===== 战斗数据 ===== -->
    <div class="rounded-lg p-3"
      :style="{ background: `${accentColor}08`, border: `1px solid ${accentColor}15` }">
      <h3 class="mb-3 font-cinzel text-[11px] font-semibold tracking-wider" :style="{ color: accentColor }">
        战斗数据 · COMBAT
      </h3>
      <!-- HP 条 -->
      <div class="mb-3">
        <div class="mb-1 flex justify-between text-[10px]">
          <span class="text-parchment-200/50">生命值 HP</span>
          <span class="font-mono font-bold" :style="{ color: hpColor }">
            {{ fd.hp ?? '-' }} / {{ fd.hpMax ?? '-' }}
          </span>
        </div>
        <div class="h-2.5 overflow-hidden rounded-full bg-ink-800">
          <div class="h-full rounded-full transition-all duration-300"
            :style="{ width: hpPercent + '%', background: hpColor }" />
        </div>
      </div>
      <!-- 数据卡片 -->
      <div class="grid grid-cols-3 gap-2">
        <div class="rounded-md p-2 text-center"
          :style="{ background: `${accentColor}0C` }">
          <div class="font-cinzel text-lg font-bold" :style="{ color: accentColor }">{{ fd.ac ?? '-' }}</div>
          <div class="text-[8px] tracking-wider text-parchment-200/30">ARMOR CLASS</div>
        </div>
        <div class="rounded-md p-2 text-center"
          :style="{ background: `${accentColor}0C` }">
          <div class="font-cinzel text-lg font-bold" :style="{ color: accentColor }">{{ fd.hitDice || '-' }}</div>
          <div class="text-[8px] tracking-wider text-parchment-200/30">HIT DICE</div>
        </div>
        <div class="rounded-md p-2 text-center"
          :style="{ background: `${accentColor}0C` }">
          <div class="font-cinzel text-lg font-bold" :style="{ color: accentColor }">+{{ fd.profBonus ?? '?' }}</div>
          <div class="text-[8px] tracking-wider text-parchment-200/30">PROF BONUS</div>
        </div>
      </div>
    </div>

    <!-- ===== 豁免 & 技能 ===== -->
    <div class="rounded-lg p-3"
      :style="{ background: `${accentColor}08`, border: `1px solid ${accentColor}15` }">
      <h3 class="mb-2 font-cinzel text-[11px] font-semibold tracking-wider" :style="{ color: accentColor }">
        豁免 · 技能 · SAVES &amp; SKILLS
      </h3>

      <!-- 熟练豁免 -->
      <div v-if="savingThrows.length" class="mb-2">
        <span class="text-[9px] tracking-wider text-parchment-200/30">SAVING THROWS</span>
        <div class="mt-1 flex flex-wrap gap-1">
          <span v-for="sv in savingThrows" :key="sv"
            class="inline-block rounded px-2 py-0.5 text-[9px]"
            :style="{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}22` }">
            {{ saveLabels[sv] || sv }}
          </span>
        </div>
      </div>

      <!-- 熟练技能 -->
      <div v-if="skillProf.length">
        <span class="text-[9px] tracking-wider text-parchment-200/30">SKILL PROFICIENCIES</span>
        <div class="mt-1 flex flex-wrap gap-1">
          <span v-for="sk in skillProf" :key="sk"
            class="inline-block rounded px-2 py-0.5 text-[9px]"
            :style="{ background: `${accentColor}10`, color: accentColor, border: `1px solid ${accentColor}18` }">
            {{ skillLabels[sk] || sk }}
          </span>
        </div>
      </div>
    </div>

    <!-- ===== 特性与专长 ===== -->
    <div v-if="fd.features" class="rounded-lg p-3"
      :style="{ background: `${accentColor}08`, border: `1px solid ${accentColor}15` }">
      <h3 class="mb-2 font-cinzel text-[11px] font-semibold tracking-wider" :style="{ color: accentColor }">
        特性与专长 · FEATURES
      </h3>
      <p class="text-[11px] leading-relaxed text-parchment-200/60">{{ fd.features }}</p>
    </div>

    <!-- ===== 背景故事 ===== -->
    <div v-if="fd.backstory"
      class="rounded-lg p-3"
      :style="{
        background: `linear-gradient(90deg, ${accentColor}08 0%, transparent 100%)`,
        borderLeft: `3px solid ${accentColor}55`,
      }">
      <div class="mb-2 flex items-center gap-1.5">
        <span class="text-[10px] opacity-30">⚔️</span>
        <h3 class="font-cinzel text-[11px] font-semibold tracking-wider" :style="{ color: accentColor }">
          背景故事
        </h3>
      </div>
      <p class="text-[11px] leading-relaxed text-parchment-200/60">{{ fd.backstory }}</p>
    </div>

    <!-- 时间戳 -->
    <div class="flex justify-between text-[9px] text-parchment-200/20">
      <span>创建：{{ new Date(card.createdAt).toLocaleDateString('zh-CN') }}</span>
      <span>更新：{{ new Date(card.updatedAt).toLocaleDateString('zh-CN') }}</span>
    </div>
  </div>
</template>