<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { RuleSystem, SystemInfo } from '@/types/card'

defineProps<{
  systems: SystemInfo[]
  current: RuleSystem
}>()
const emit = defineEmits<{
  (e: 'change', system: RuleSystem): void
  (e: 'add'): void
  (e: 'pressSystem', system: SystemInfo): void
}>()

// 拖拽滚动相关
const scrollContainer = ref<HTMLElement | null>(null)
let isDragging = false
let startX = 0
let scrollLeft = 0
let dragMoved = false
const DRAG_THRESHOLD = 5

function onMouseDown(e: MouseEvent) {
  if (!scrollContainer.value) return
  isDragging = true
  dragMoved = false
  startX = e.pageX - scrollContainer.value.offsetLeft
  scrollLeft = scrollContainer.value.scrollLeft
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging || !scrollContainer.value) return
  const x = e.pageX - scrollContainer.value.offsetLeft
  const walk = x - startX
  if (Math.abs(walk) > DRAG_THRESHOLD) {
    dragMoved = true
  }
  scrollContainer.value.scrollLeft = scrollLeft - walk
}

function onMouseUp() {
  isDragging = false
}

function onMouseLeave() {
  isDragging = false
}

// 长按相关
let pressTimer: ReturnType<typeof setTimeout> | null = null
const pressingCode = ref<string | null>(null)
let pressStartX = 0
let pressStartY = 0

function onSystemClick(system: SystemInfo) {
  if (pressingCode.value === system.code) {
    pressingCode.value = null
    return
  }
  if (dragMoved) return
  emit('change', system.code)
}

function onSystemPressStart(system: SystemInfo, e: MouseEvent | TouchEvent) {
  pressStartX = 'touches' in e ? e.touches[0].clientX : e.clientX
  pressStartY = 'touches' in e ? e.touches[0].clientY : e.clientY
  pressTimer = setTimeout(() => {
    pressTimer = null
    pressingCode.value = system.code
    emit('pressSystem', system)
  }, 500)
}

function onSystemPressMove(e: MouseEvent | TouchEvent) {
  if (!pressTimer) return
  const x = 'touches' in e ? e.touches[0].clientX : e.clientX
  const y = 'touches' in e ? e.touches[0].clientY : e.clientY
  if (Math.abs(x - pressStartX) > 10 || Math.abs(y - pressStartY) > 10) {
    clearPressTimer()
  }
}

function clearPressTimer() {
  if (pressTimer) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
}

function onSystemPressEnd() {
  clearPressTimer()
}

onMounted(() => {
  document.addEventListener('mouseup', onMouseUp)
  document.addEventListener('mousemove', onMouseMove)
})

onUnmounted(() => {
  document.removeEventListener('mouseup', onMouseUp)
  document.removeEventListener('mousemove', onMouseMove)
})
</script>

<template>
  <div class="flex items-center gap-2">
    <div
      ref="scrollContainer"
      class="flex flex-1 items-stretch gap-1 overflow-x-auto scrollbar-hide pb-1 cursor-grab active:cursor-grabbing"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      @mouseleave="onMouseLeave"
    >
      <button
        v-for="s in systems"
        :key="s.code"
        class="relative flex flex-shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg px-4 py-2 transition-all duration-200 select-none"
        :class="
          current === s.code
            ? 'bg-ink-900 text-parchment-200'
            : 'bg-ink-900/20 text-ink-700 hover:bg-ink-900/40 hover:text-parchment-200'
        "
        @click="onSystemClick(s)"
        @mousedown="onSystemPressStart(s, $event)"
        @mousemove="onSystemPressMove"
        @mouseup="onSystemPressEnd"
        @mouseleave="onSystemPressEnd"
        @touchstart="onSystemPressStart(s, $event)"
        @touchmove="onSystemPressMove"
        @touchend="onSystemPressEnd"
        @touchcancel="onSystemPressEnd"
      >
        <span class="text-lg leading-none">{{ s.logo }}</span>
        <span class="whitespace-nowrap text-[10px] font-medium leading-tight">{{ s.name }}</span>
        <span
          v-if="current === s.code"
          class="absolute -bottom-1 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full"
          :style="{ backgroundColor: s.accentColor }"
        />
      </button>
    </div>
    <button
      class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-dnd/40 bg-dnd/10 text-dnd transition hover:bg-dnd/20"
      @click="emit('add')"
      aria-label="添加规则系统"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M12 5v14M5 12h14" stroke-linecap="round" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}
</style>
