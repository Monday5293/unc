<script setup lang="ts">
/**
 * 匕首之心 — 英雄卡
 * 现代简约 TRPG 风格 / 冷暖双色系统
 */
import type { CharacterCard } from '@/types/card'
import { getDaggerheartClassLabel, getDaggerheartAncestryLabel } from '@/data/rules/common/labels'
import { computed } from 'vue'

const props = defineProps<{
  card: CharacterCard
  accentColor: string
}>()

const fd = props.card.formData

/** 血脉中文名 */
const ancestryLabel = computed(() => {
  const a = fd.ancestry as string
  return a ? getDaggerheartAncestryLabel(a) : '-'
})

/** 职业中文名 */
const classLabel = computed(() => {
  const c = fd.class as string
  return c ? getDaggerheartClassLabel(c) : '-'
})

/** 6 项属性（范围 -2 到 4） */
const attributes = [
  { key: 'agility',   label: '敏捷', abbr: 'AGI', value: fd.agility as number ?? 0 },
  { key: 'strength',  label: '力量', abbr: 'STR', value: fd.strength as number ?? 0 },
  { key: 'finesse',   label: '精巧', abbr: 'FIN', value: fd.finesse as number ?? 0 },
  { key: 'instinct',  label: '本能', abbr: 'INS', value: fd.instinct as number ?? 0 },
  { key: 'presence',  label: '存在', abbr: 'PRE', value: fd.presence as number ?? 0 },
  { key: 'knowledge', label: '知识', abbr: 'KNO', value: fd.knowledge as number ?? 0 },
]

/** 属性值 +/- 格式 */
function fmtAttr(v: number): string {
  return v >= 0 ? `+${v}` : `${v}`
}

/** 属性颜色 */
function attrColor(v: number): string {
  if (v >= 3) return '#f59e0b'
  if (v >= 1) return props.accentColor
  if (v >= 0) return '#94a3b8'
  return '#ef4444'
}

/** 耐力/压力百分比 */
const staminaPct = computed(() => {
  const cur = fd.stamina as number
  const max = fd.staminaMax as number
  if (!max || max === 0) return 0
  return Math.min((cur / max) * 100, 100)
})

const stressPct = computed(() => {
  const cur = fd.stress as number
  const max = fd.stressMax as number
  if (!max || max === 0) return 0
  return Math.min((cur / max) * 100, 100)
})
</script>

<template>
  <div class="space-y-3">
    <!-- ===== 身份卡 ===== -->
    <div class="relative overflow-hidden rounded-lg p-4"
      :style="{ background: `linear-gradient(135deg, ${accentColor}15 0%, ${accentColor}05 100%)`, border: `1px solid ${accentColor}22` }">
      <div class="flex items-center gap-4">
        <div class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl text-3xl"
          :style="{
            background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}0A)`,
            boxShadow: `0 0 0 2px ${accentColor}33`,
          }">
          🗡️
        </div>
        <div class="min-w-0 flex-1">
          <div class="font-cinzel text-xl font-bold text-parchment-200">
            {{ fd.name || '无名英雄' }}
          </div>
          <div class="mt-1 flex items-center gap-2 text-xs">
            <span class="rounded-full px-2 py-0.5 text-[10px]"
              :style="{ background: `${accentColor}18`, color: accentColor }">
              阶层 {{ fd.tier ?? '?' }}
            </span>
            <span class="text-parchment-200/60">{{ ancestryLabel }} · {{ classLabel }}</span>
          </div>
          <div class="mt-1.5 flex flex-wrap gap-x-3 text-[10px] text-parchment-200/40">
            <span>Lv.{{ fd.level ?? '?' }}</span>
            <span class="text-parchment-200/20">·</span>
            <span>{{ fd.community || '?' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 六项属性 ===== -->
    <div class="rounded-lg p-3"
      :style="{ background: `${accentColor}08`, border: `1px solid ${accentColor}15` }">
      <h3 class="mb-3 font-cinzel text-[11px] font-semibold tracking-wider" :style="{ color: accentColor }">
        属性 · ATTRIBUTES
      </h3>
      <div class="grid grid-cols-3 gap-2">
        <div v-for="attr in attributes" :key="attr.key"
          class="rounded-md p-2"
          :style="{ background: `${accentColor}0A` }">
          <div class="flex items-center justify-between">
            <span class="text-[10px] text-parchment-200/50">{{ attr.label }}</span>
            <span class="text-[8px] tracking-widest text-parchment-200/20">{{ attr.abbr }}</span>
          </div>
          <div class="mt-1 font-cinzel text-xl font-bold" :style="{ color: attrColor(attr.value) }">
            {{ fmtAttr(attr.value) }}
          </div>
          <!-- 属性条（-2 到 4 范围） -->
          <div class="mt-1 h-1 overflow-hidden rounded-full bg-ink-800">
            <div class="h-full rounded-full transition-all"
              :style="{
                width: Math.min(((attr.value + 2) / 6) * 100, 100) + '%',
                background: attrColor(attr.value),
                opacity: 0.5,
              }" />
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 耐力 · 压力（双轨系统） ===== -->
    <div class="rounded-lg p-3"
      :style="{ background: `${accentColor}08`, border: `1px solid ${accentColor}15` }">
      <h3 class="mb-3 font-cinzel text-[11px] font-semibold tracking-wider" :style="{ color: accentColor }">
        耐力 · 压力 · STAMINA &amp; STRESS
      </h3>

      <!-- 耐力条 -->
      <div class="mb-3">
        <div class="mb-1 flex justify-between text-[10px]">
          <span class="text-parchment-200/50">耐力 STAMINA</span>
          <span class="font-mono font-bold text-emerald-400">
            {{ fd.stamina ?? '-' }} / {{ fd.staminaMax ?? '-' }}
          </span>
        </div>
        <div class="h-2.5 overflow-hidden rounded-full bg-ink-800">
          <div class="h-full rounded-full bg-emerald-500/70 transition-all duration-300"
            :style="{ width: staminaPct + '%' }" />
        </div>
      </div>

      <!-- 压力条 -->
      <div>
        <div class="mb-1 flex justify-between text-[10px]">
          <span class="text-parchment-200/50">压力 STRESS</span>
          <span class="font-mono font-bold text-rose-400">
            {{ fd.stress ?? '-' }} / {{ fd.stressMax ?? '-' }}
          </span>
        </div>
        <div class="h-2.5 overflow-hidden rounded-full bg-ink-800">
          <div class="h-full rounded-full bg-rose-500/70 transition-all duration-300"
            :style="{ width: stressPct + '%' }" />
        </div>
      </div>
    </div>

    <!-- ===== 经验标记 ===== -->
    <div v-if="fd.experience" class="rounded-lg p-3"
      :style="{ background: `${accentColor}08`, border: `1px solid ${accentColor}15` }">
      <h3 class="mb-2 font-cinzel text-[11px] font-semibold tracking-wider" :style="{ color: accentColor }">
        经验标记 · EXPERIENCE
      </h3>
      <p class="text-[11px] leading-relaxed text-parchment-200/60">{{ fd.experience }}</p>
    </div>

    <!-- ===== 英雄过往 ===== -->
    <div v-if="fd.backstory"
      class="rounded-lg p-3"
      :style="{
        background: `linear-gradient(90deg, ${accentColor}08 0%, transparent 100%)`,
        borderLeft: `3px solid ${accentColor}55`,
      }">
      <div class="mb-2 flex items-center gap-1.5">
        <span class="text-[10px] opacity-30">📖</span>
        <h3 class="font-cinzel text-[11px] font-semibold tracking-wider" :style="{ color: accentColor }">
          英雄过往
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