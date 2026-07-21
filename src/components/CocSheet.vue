<script setup lang="ts">
/**
 * 克苏鲁的呼唤 — 7e 调查员卡
 * 1920 年代宇宙恐怖风格 / 深色羊皮纸质感
 */
import type { CharacterCard } from '@/types/card'
import { computed } from 'vue'

const props = defineProps<{
  card: CharacterCard
  accentColor: string
}>()

const fd = props.card.formData

/** 8 项基础属性 */
const attributes = [
  { key: 'str', label: '力量', abbr: 'STR', value: fd.str as number ?? 50 },
  { key: 'con', label: '体质', abbr: 'CON', value: fd.con as number ?? 50 },
  { key: 'siz', label: '体型', abbr: 'SIZ', value: fd.siz as number ?? 50 },
  { key: 'dex', label: '敏捷', abbr: 'DEX', value: fd.dex as number ?? 50 },
  { key: 'app', label: '外貌', abbr: 'APP', value: fd.app as number ?? 50 },
  { key: 'int', label: '智力', abbr: 'INT', value: fd.int as number ?? 75 },
  { key: 'pow', label: '意志', abbr: 'POW', value: fd.pow as number ?? 60 },
  { key: 'edu', label: '教育', abbr: 'EDU', value: fd.edu as number ?? 80 },
]

/** 属性根据数值着色 */
function attrColor(v: number, base: string): string {
  if (v >= 80) return '#f59e0b'   // 金色 — 卓越
  if (v >= 60) return base         // 主题色 — 良好
  if (v >= 40) return '#94a3b8'   // 灰色 — 一般
  return '#ef4444'                  // 红色 — 危险
}

/** 技能 */
const skills = [
  { key: 'skill_libraryUse', label: '图书馆使用', value: fd.skill_libraryUse as number ?? 0 },
  { key: 'skill_spotHidden', label: '侦查',       value: fd.skill_spotHidden as number ?? 0 },
  { key: 'skill_listen',     label: '聆听',       value: fd.skill_listen as number ?? 0 },
  { key: 'skill_dodge',      label: '闪避',       value: fd.skill_dodge as number ?? 0 },
]

/** 半值/五分之一值（COC 规则常用） */
const hardVal = computed(() => Math.floor(attributes[4].value / 2))
const extremeVal = computed(() => Math.floor(attributes[4].value / 5))
</script>

<template>
  <div class="space-y-3">
    <!-- ===== 身份信息卡 ===== -->
    <div class="relative overflow-hidden rounded-lg p-4"
      :style="{ background: `linear-gradient(135deg, ${accentColor}15 0%, ${accentColor}05 100%)`, border: `1px solid ${accentColor}22` }">
      <div class="flex items-center gap-3">
        <div class="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
          :style="{ background: `${accentColor}18`, boxShadow: `0 0 0 2px ${accentColor}33` }">
          🔍
        </div>
        <div class="min-w-0 flex-1">
          <div class="font-cinzel text-lg font-bold text-parchment-200">{{ fd.name || '无名调查员' }}</div>
          <div class="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-parchment-200/60">
            <span>{{ fd.occupation || '未知职业' }}</span>
            <span class="text-parchment-200/30">·</span>
            <span>{{ fd.age ?? '?' }}岁</span>
            <span class="text-parchment-200/30">·</span>
            <span>{{ fd.gender || '未知' }}</span>
            <span class="text-parchment-200/30">·</span>
            <span>{{ fd.residence || '未知地点' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 8 项属性 ===== -->
    <div class="rounded-lg p-3"
      :style="{ background: `${accentColor}08`, border: `1px solid ${accentColor}15` }">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="font-cinzel text-[11px] font-semibold tracking-wider" :style="{ color: accentColor }">
          基础属性 · ATTRIBUTES
        </h3>
        <span class="text-[9px] text-parchment-200/30">1 – 99</span>
      </div>
      <div class="grid grid-cols-4 gap-2">
        <div v-for="attr in attributes" :key="attr.key"
          class="flex flex-col items-center rounded-md px-1 py-2 text-center transition-colors"
          :style="{ background: `${accentColor}0A` }">
          <span class="text-[8px] tracking-widest text-parchment-200/30">{{ attr.abbr }}</span>
          <span class="font-cinzel text-lg font-bold leading-none"
            :style="{ color: attrColor(attr.value, accentColor) }">
            {{ attr.value }}
          </span>
          <span class="mt-0.5 text-[8px] text-parchment-200/50">{{ attr.label }}</span>
          <!-- 微型进度条 -->
          <div class="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-ink-800">
            <div class="h-full rounded-full transition-all"
              :style="{
                width: Math.min(attr.value, 99) + '%',
                background: attrColor(attr.value, accentColor),
                opacity: 0.5,
              }" />
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 生命 · 魔法 · 理智 ===== -->
    <div class="grid grid-cols-3 gap-2">
      <!-- HP -->
      <div class="rounded-lg p-3 text-center"
        :style="{ background: `linear-gradient(180deg, #ef444418 0%, #ef444408 100%)`, border: `1px solid #ef444433` }">
        <div class="text-[9px] tracking-wider text-parchment-200/40">生命值</div>
        <div class="mt-1 font-cinzel text-xl font-bold text-red-400">
          {{ fd.hp ?? '-' }}<span class="text-xs text-parchment-200/30"> / {{ fd.hpMax ?? '-' }}</span>
        </div>
        <div class="text-[9px] text-parchment-200/30">HP</div>
      </div>
      <!-- MP -->
      <div class="rounded-lg p-3 text-center"
        :style="{ background: `linear-gradient(180deg, #6366f118 0%, #6366f108 100%)`, border: `1px solid #6366f133` }">
        <div class="text-[9px] tracking-wider text-parchment-200/40">魔法值</div>
        <div class="mt-1 font-cinzel text-xl font-bold text-indigo-400">
          {{ fd.mp ?? '-' }}
        </div>
        <div class="text-[9px] text-parchment-200/30">MP</div>
      </div>
      <!-- SAN -->
      <div class="rounded-lg p-3 text-center"
        :style="{ background: `linear-gradient(180deg, #8b5cf618 0%, #8b5cf608 100%)`, border: `1px solid #8b5cf633` }">
        <div class="text-[9px] tracking-wider text-parchment-200/40">理智值</div>
        <div class="mt-1 font-cinzel text-xl font-bold text-purple-400">
          {{ fd.san ?? '-' }}
        </div>
        <div class="text-[9px] text-parchment-200/30">SAN</div>
      </div>
    </div>

    <!-- ===== 技能 ===== -->
    <div class="rounded-lg p-3"
      :style="{ background: `${accentColor}08`, border: `1px solid ${accentColor}15` }">
      <h3 class="mb-3 font-cinzel text-[11px] font-semibold tracking-wider" :style="{ color: accentColor }">
        技能 · SKILLS
      </h3>
      <div class="space-y-2">
        <div v-for="skill in skills" :key="skill.key">
          <div class="mb-1 flex justify-between text-[10px]">
            <span class="text-parchment-200/60">{{ skill.label }}</span>
            <span class="font-mono font-bold" :style="{ color: accentColor }">{{ skill.value }}%</span>
          </div>
          <div class="h-1.5 overflow-hidden rounded-full bg-ink-800">
            <div class="h-full rounded-full transition-all"
              :style="{
                width: Math.min(skill.value, 99) + '%',
                background: skill.value >= 70
                  ? `#f59e0b`
                  : skill.value >= 50
                    ? accentColor
                    : '#64748b',
                opacity: 0.7,
              }" />
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 背景故事 ===== -->
    <div v-if="fd.backstory"
      class="relative rounded-lg p-3"
      :style="{ background: `${accentColor}06`, borderLeft: `3px solid ${accentColor}55` }">
      <div class="mb-2 flex items-center gap-2">
        <span class="text-[10px] opacity-30">📜</span>
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