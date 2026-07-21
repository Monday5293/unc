<script setup lang="ts">
/**
 * 角色卡详情页
 * 展示角色卡完整信息 + 表单渲染
 * 支持 COC / DND / Daggerheart 三种规则系统
 */
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCardStore } from '@/stores/cards'
import { computePreviewStats } from '@/data/rules/common/preview-stats'
import { loggerPage } from '@/utils/logger'
const logger = loggerPage('CardDetail')

const route = useRoute()
const router = useRouter()
const store = useCardStore()

/** 当前角色卡数据 */
const card = computed(() => {
  const id = route.params.id as string
  return store.getCardById(id)
})

/** 当前规则系统信息 */
const systemInfo = computed(() =>
  card.value ? store.getSystemInfo(card.value.system) : null,
)

/** 表单规则（深拷贝以避免修改原数据） */
const formRule = computed(() => {
  if (!systemInfo.value?.rule) return []
  return JSON.parse(JSON.stringify(systemInfo.value.rule))
})

/** 表单配置选项 */
const formOption = computed(() => ({
  ...(systemInfo.value?.option || {}),
  submitBtn: false,
  resetBtn: false,
}))

/** 表单数据双向绑定 */
const formData = ref<Record<string, unknown>>({})

// 监听卡片数据变化，同步表单数据
watch(
  card,
  (c) => {
    logger.info('card加载', { id: c?.id, system: c?.system, name: c?.name })
    if (c) {
      formData.value = { ...c.formData }
    }
  },
  { immediate: true },
)

function goBack() {
  router.back()
}

/** 切换收藏状态 */
function toggleFav() {
  if (card.value) {
    logger.info('toggleFav', { id: card.value?.id, favorite: !card.value?.favorite })
    store.toggleFavorite(card.value.id)
  }
}

/** 预览统计项（使用通用工具函数） */
const previewStats = computed(() => {
  logger.debug('previewStats computed', { cardId: card.value?.id, system: card.value?.system })
  if (!card.value) return []
  return computePreviewStats(card.value)
})

/** 强调色 */
const accentColor = computed(() => systemInfo.value?.accentColor || '#C8A046')

/** 表单数据变更时同步到 store */
function onFormChange(data: Record<string, unknown>) {
  logger.info('onFormChange', { cardId: card.value?.id, fieldCount: Object.keys(data).length })
  if (card.value) {
    store.updateCardFormData(card.value.id, data)
  }
}

watch(formData, (v) => {
  onFormChange(v)
}, { deep: true })
</script>

<template>
  <div class="min-h-screen bg-ink-noise">
    <!-- 顶部导航 -->
    <header
      class="sticky top-0 z-20 flex items-center justify-between border-b border-ink-700 bg-ink-900/95 px-4 py-3 backdrop-blur"
      :style="{ boxShadow: `inset 0 -2px 0 ${accentColor}55` }"
    >
      <button
        class="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-parchment-200/70 hover:text-parchment-200"
        @click="goBack"
      >
        <svg
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        返回
      </button>
      <span class="font-cinzel text-sm font-semibold text-parchment-200">
        角色卡详情
      </span>
      <button
        class="flex h-7 w-7 items-center justify-center rounded-full bg-ink-800 hover:bg-ink-700"
        @click="toggleFav"
      >
        <svg
          v-if="card?.favorite"
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="currentColor"
          :style="{ color: accentColor }"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <svg
          v-else
          class="h-4 w-4 text-parchment-200/40"
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
    </header>

    <template v-if="card && systemInfo && formRule.length">
      <section
        class="relative overflow-hidden px-5 pb-6 pt-6"
        :style="{
          background: `linear-gradient(180deg, ${accentColor}22 0%, transparent 100%)`,
        }"
      >
        <div
          class="pointer-events-none absolute -right-4 -top-2 text-[120px] leading-none opacity-5"
        >
          {{ systemInfo.logo }}
        </div>

        <div class="relative">
          <div class="mb-3 flex items-center gap-1">
            <span
              class="rounded px-2 py-0.5 text-[10px] font-semibold"
              :style="{
                color: accentColor,
                backgroundColor: accentColor + '22',
              }"
            >
              {{ systemInfo.logo }} {{ systemInfo.fullName }}
            </span>
            <span
              v-if="systemInfo.isCustom"
              class="text-[10px] text-parchment-200/40"
            >
              · 自定义规则
            </span>
          </div>

          <div class="flex items-start gap-4">
            <div
              class="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl text-4xl"
              :style="{
                backgroundColor: accentColor + '22',
                boxShadow: `0 0 0 2px ${accentColor}55 inset`,
              }"
            >
              <img
                v-if="card.avatar"
                :src="card.avatar"
                :alt="card.name"
                class="h-full w-full object-cover"
              />
              <span v-else>{{ systemInfo.logo }}</span>
            </div>
            <div class="min-w-0 flex-1 pt-1">
              <h1
                class="font-cinzel text-2xl font-bold leading-tight text-parchment-200"
              >
                {{ card.name }}
              </h1>
              <p class="mt-1 text-xs text-parchment-200/50">
                玩家：{{ card.player }}
              </p>
            </div>
          </div>

          <p
            v-if="card.description"
            class="mt-4 rounded-lg border-l-2 bg-ink-900/40 p-3 text-xs leading-relaxed text-parchment-200/70"
            :style="{ borderColor: accentColor }"
          >
            {{ card.description }}
          </p>

          <div v-if="previewStats.length" class="mt-4 grid grid-cols-4 gap-2">
            <div
              v-for="(stat, idx) in previewStats"
              :key="idx"
              class="rounded-lg bg-ink-900/60 px-2 py-2 text-center ring-1"
              :style="{ boxShadow: `0 0 0 1px ${accentColor}33` }"
            >
              <div
                class="font-cinzel text-base font-bold"
                :style="{ color: accentColor }"
              >
                {{ stat.value }}
              </div>
              <div class="text-[9px] text-parchment-200/50">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="px-4 pb-8">
        <div class="mb-3 flex items-center gap-2">
          <h2
            class="font-cinzel text-sm font-semibold text-parchment-200"
            :style="{ color: accentColor }"
          >
            完整属性表
          </h2>
          <div class="h-px flex-1 bg-ink-700" />
        </div>

        <div
          class="parchment-card ink-border animate-scale-in rounded-xl p-4 text-ink-900"
        >
          <FormCreate
            v-model="formData"
            :rule="formRule"
            :option="formOption"
          />
        </div>

        <div class="mt-4 space-y-1 text-[10px] text-parchment-200/40">
          <div class="flex justify-between">
            <span>创建时间</span>
            <span>{{ new Date(card.createdAt).toLocaleString('zh-CN') }}</span>
          </div>
          <div class="flex justify-between">
            <span>最后更新</span>
            <span>{{ new Date(card.updatedAt).toLocaleString('zh-CN') }}</span>
          </div>
        </div>
      </section>
    </template>

    <!-- 找不到卡片 -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-24 text-parchment-200/40"
    >
      <div class="mb-3 text-4xl opacity-40">🔍</div>
      <p class="text-sm">未找到角色卡</p>
      <button
        class="mt-3 rounded-md border border-dnd px-3 py-1.5 text-xs text-dnd hover:bg-dnd hover:text-ink-900"
        @click="goBack"
      >
        返回列表
      </button>
    </div>
  </div>
</template>
