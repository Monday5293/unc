<!--
  角色卡片展示组件
  用于展示单个角色卡的基本信息（名称、玩家、描述、属性字段），
  支持点击、收藏切换和长按操作。
-->
<script setup lang="ts">
import { ref } from 'vue'
import type { CharacterCard, SystemInfo } from '@/types/card'
import { loggerComp } from '@/utils/logger'
const logger = loggerComp('CardItem')

// 组件属性：接收角色卡数据及所属规则系统信息
const props = defineProps<{
  card: CharacterCard
  system: SystemInfo
}>()
// 组件事件：点击、收藏切换、长按
const emit = defineEmits<{
  (e: 'click', card: CharacterCard): void
  (e: 'toggleFav', card: CharacterCard): void
  (e: 'longPress', card: CharacterCard): void
}>()

// 触摸/鼠标长按处理
const pressing = ref(false)
let pressTimer: ReturnType<typeof setTimeout> | null = null

function onTouchStart() {
  logger.debug('onTouchStart', { cardId: props.card.id })
  pressing.value = true
  pressTimer = setTimeout(() => {
    if (pressing.value) {
      emit('longPress', props.card)
      if (navigator.vibrate) navigator.vibrate(30)
    }
  }, 500)
}

function onTouchEnd() {
  pressing.value = false
  if (pressTimer) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
}

function onClickCard() {
  logger.info('onClickCard', { cardId: props.card.id, name: props.card.name })
  if (pressing.value) return
  emit('click', props.card)
}

function onToggleFav() {
  logger.info('toggleFav', { cardId: props.card.id, favorite: !props.card.favorite })
  emit('toggleFav', props.card)
}

// 计算展示的四个固定字段，用于卡片预览
const profileFields = [
  { label: '职业', value: (props.card.formData as any).occupation || '-' },
  { label: '年龄', value: (props.card.formData as any).age ?? '-' },
  { label: '住地', value: (props.card.formData as any).residence || '-' },
  { label: '年份', value: (props.card.formData as any).year || '-' },
]

// 计算边框颜色（浅色版本）
const accentHex = props.system.accentColor.replace('#', '')
const r = parseInt(accentHex.slice(0, 2), 16)
const g = parseInt(accentHex.slice(2, 4), 16)
const b = parseInt(accentHex.slice(4, 6), 16)
const borderColor = `rgba(${r},${g},${b},0.3)`
</script>

<template>
  <div
    class="parchment-card ink-border group relative flex cursor-pointer flex-col overflow-hidden rounded-xl p-4 text-ink-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    :class="{ 'scale-[0.98]': pressing }"
    :style="{ '--accent': system.accentColor, border: `2px solid ${borderColor}` }"
    @click="onClickCard"
    @mousedown="onTouchStart"
    @mouseup="onTouchEnd"
    @mouseleave="onTouchEnd"
    @touchstart.prevent="onTouchStart"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
  >
    <div
      class="absolute left-0 top-0 h-full w-1.5"
      :style="{ backgroundColor: system.accentColor }"
    />

    <button
      class="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-ink-900/10 backdrop-blur transition hover:bg-ink-900/20"
      :aria-label="card.favorite ? '取消收藏' : '收藏'"
      @click.stop="onToggleFav"
    >
      <svg
        v-if="card.favorite"
        class="h-4 w-4"
        viewBox="0 0 24 24"
        fill="currentColor"
        :style="{ color: system.accentColor }"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <svg
        v-else
        class="h-4 w-4 text-ink-700"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
    </button>

    <div class="mb-3 flex items-start gap-3">
      <div
        class="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg text-2xl"
        :style="{
          backgroundColor: system.accentColor + '22',
          boxShadow: `0 0 0 1px ${system.accentColor}55 inset`,
        }"
      >
        <img
          v-if="card.avatar"
          :src="card.avatar"
          :alt="card.name"
          class="h-full w-full object-cover"
        />
        <span v-else>{{ system.logo }}</span>
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="font-cinzel truncate text-lg font-semibold leading-tight" :style="{ color: '#1A1714' }">
          {{ card.formData?.name || card.name }}
        </h3>
        <p class="mt-0.5 truncate text-xs text-ink-700">
          {{ card.formData?.player || card.player }}
        </p>
      </div>
    </div>

    <p class="mb-3 line-clamp-2 text-xs leading-relaxed text-ink-700">
      {{ card.description || card.formData?.description }}
    </p>

    <div class="mt-auto flex flex-wrap gap-1.5">
      <span
        v-for="stat in profileFields"
        :key="stat.label"
        class="inline-flex items-center gap-1 rounded-md bg-ink-900/8 px-2 py-1 text-[10px] font-medium"
      >
        <span class="text-ink-700">{{ stat.label }}</span>
        <span class="text-ink-900">{{ stat.value }}</span>
      </span>
    </div>

    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-ink-900/85 px-3 py-2 text-center text-[10px] font-medium text-parchment-200 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
      :style="{ color: system.accentColor }"
    >
      点击查看详情 · 长按删除
    </div>
  </div>
</template>
