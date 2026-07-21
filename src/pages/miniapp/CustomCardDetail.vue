<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCardStore } from '@/stores/cards'
import { getForm } from '@/api/form'
import type { CharacterCard, FormRule } from '@/types/card'

const route = useRoute()
const router = useRouter()
const cardStore = useCardStore()

interface CachedForm {
  card: CharacterCard
  rule: FormRule[]
  option?: Record<string, unknown>
}

const cached = ref<CachedForm | null>(null)
const loading = ref(false)
const loadError = ref('')

async function loadForm() {
  const formId = route.params.formId as string
  if (!formId) return

  // 先尝试从 sessionStorage 读取
  const raw = sessionStorage.getItem(`custom-form-${formId}`)
  if (raw) {
    try {
      cached.value = JSON.parse(raw)
      return
    } catch {
      cached.value = null
    }
  }

  // sessionStorage 没有，从服务器拉取
  loading.value = true
  loadError.value = ''
  try {
    const saved = await getForm(formId)
    const mockCard: CharacterCard = {
      id: saved.id,
      system: saved.system,
      name: saved.name,
      player: '设计器导出',
      avatar: '',
      description: saved.description || '',
      formData: {},
      favorite: false,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    }
    cached.value = {
      card: mockCard,
      rule: saved.rule as FormRule[],
      option: saved.option,
    }
    // 缓存到 sessionStorage
    sessionStorage.setItem(`custom-form-${formId}`, JSON.stringify(cached.value))
  } catch (e) {
    loadError.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadForm()
})

watch(
  () => route.params.formId,
  () => loadForm(),
)

const card = computed(() => cached.value?.card || null)
const rule = computed(() => cached.value?.rule || [])
const option = computed(() => cached.value?.option || { submitBtn: false, resetBtn: false })

const systemInfo = computed(() =>
  card.value ? cardStore.getSystemInfo(card.value.system) : null,
)

const accentColor = computed(() => systemInfo.value?.accentColor || '#3B6B4A')

// 表单数据（v-model）
const formData = ref<Record<string, unknown>>({})

// 收藏切换（保存到 sessionStorage）
function toggleFav() {
  if (!card.value) return
  card.value.favorite = !card.value.favorite
  card.value.updatedAt = new Date().toISOString()
  if (cached.value) {
    sessionStorage.setItem(
      `custom-form-${route.params.formId}`,
      JSON.stringify(cached.value),
    )
  }
}

function goBack() {
  router.back()
}
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
        自定义表单渲染
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

    <template v-if="card && systemInfo">
      <!-- 头部 -->
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
            <span class="text-[10px] text-parchment-200/40">
              · 来自服务器导入
            </span>
          </div>

          <h1
            class="font-cinzel text-3xl font-bold leading-tight text-parchment-200"
          >
            {{ card.name }}
          </h1>
          <p
            v-if="card.description"
            class="mt-3 rounded-lg border-l-2 bg-ink-900/40 p-3 text-xs leading-relaxed text-parchment-200/70"
            :style="{ borderColor: accentColor }"
          >
            {{ card.description }}
          </p>
          <div class="mt-3 text-[10px] text-parchment-200/40">
            字段数：{{ rule.length }}
          </div>
        </div>
      </section>

      <!-- 表单渲染 -->
      <section class="px-4 pb-8">
        <div class="mb-3 flex items-center gap-2">
          <h2
            class="font-cinzel text-sm font-semibold text-parchment-200"
            :style="{ color: accentColor }"
          >
            表单渲染
          </h2>
          <div class="h-px flex-1 bg-ink-700" />
        </div>

        <!-- 羊皮纸风格表单容器 -->
        <div
          class="parchment-card ink-border animate-scale-in rounded-xl p-4 text-ink-900"
        >
          <FormCreate v-model="formData" :rule="rule" :option="option" />
        </div>
      </section>
    </template>

    <!-- 加载中 -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-24 text-parchment-200/40"
    >
      <div class="mb-3 text-4xl opacity-40 animate-pulse">⏳</div>
      <p class="text-sm">加载表单中...</p>
    </div>

    <!-- 加载失败 -->
    <div
      v-else-if="loadError"
      class="flex flex-col items-center justify-center py-24 text-parchment-200/40"
    >
      <div class="mb-3 text-4xl opacity-40">⚠️</div>
      <p class="text-sm">加载失败</p>
      <p class="mt-1 text-[11px]">{{ loadError }}</p>
      <button
        class="mt-3 rounded-md border border-dnd px-3 py-1.5 text-xs text-dnd hover:bg-dnd hover:text-ink-900"
        @click="loadForm"
      >
        重试
      </button>
    </div>

    <!-- 找不到 -->
    <div
      v-else-if="!card"
      class="flex flex-col items-center justify-center py-24 text-parchment-200/40"
    >
      <div class="mb-3 text-4xl opacity-40">📭</div>
      <p class="text-sm">未找到表单数据</p>
      <p class="mt-1 text-[11px]">可能已被清除，请返回列表重新下载</p>
      <button
        class="mt-3 rounded-md border border-dnd px-3 py-1.5 text-xs text-dnd hover:bg-dnd hover:text-ink-900"
        @click="goBack"
      >
        返回列表
      </button>
    </div>
  </div>
</template>
