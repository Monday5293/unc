<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomFormStore } from '@/stores/customForms'
import { useCardStore } from '@/stores/cards'
import type { RuleSystem } from '@/types/card'

const router = useRouter()
const customFormStore = useCustomFormStore()
const cardStore = useCardStore()

const filterSystem = ref<RuleSystem | 'ALL'>('ALL')
const importingId = ref('')

const systemColor: Record<string, string> = {
  COC: '#3B6B4A',
  DND: '#C8A046',
  DAGGERHEART: '#9BA8B5',
}

function systemLogo(system: string) {
  const s = cardStore.getSystemInfo(system)
  return s?.logo || '📜'
}

function systemName(system: string) {
  const s = cardStore.getSystemInfo(system)
  return s?.name || system
}

const filteredList = computed(() => {
  if (filterSystem.value === 'ALL') return customFormStore.forms
  return customFormStore.forms.filter((f) => f.system === filterSystem.value)
})

async function refresh() {
  await customFormStore.fetchList()
}

async function importAsSystem(formId: string) {
  importingId.value = formId
  try {
    const form = await customFormStore.downloadForm(formId)
    const newSys = cardStore.addCustomSystem({
      id: form.id,
      name: form.name,
      system: form.system,
      description: form.description,
      rule: form.rule,
      option: form.option,
    })
    if (newSys) {
      cardStore.setSystem(newSys.code)
    }
    router.push('/miniapp/home')
  } catch (e) {
    alert('导入失败：' + (e as Error).message)
  } finally {
    importingId.value = ''
  }
}

function goBack() {
  router.back()
}

onMounted(() => {
  refresh()
})
</script>

<template>
  <div class="min-h-full bg-ink-900">
    <header
      class="sticky top-0 z-20 flex items-center justify-between border-b border-ink-700 bg-ink-900/95 px-4 py-3 backdrop-blur"
      style="box-shadow: inset 0 -2px 0 #3B6B4A55"
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
      <span class="font-cinzel text-sm font-semibold text-coc">
        📥 添加新规则
      </span>
      <button
        class="rounded-md px-2 py-1 text-xs text-dnd hover:underline"
        :disabled="customFormStore.loading"
        @click="refresh"
      >
        刷新
      </button>
    </header>

    <div class="border-b border-ink-700 bg-coc/10 px-4 py-3">
      <p class="text-[11px] leading-relaxed text-parchment-200/70">
        <span class="font-semibold text-coc">ℹ️ 说明：</span>
        从服务器导入表单 JSON，保存为新的规则系统，与 COC / DND 同级。导入后可在该规则下创建多张角色卡。
      </p>
    </div>

    <main class="px-4 pb-6 pt-3">
      <div
        v-if="customFormStore.loading"
        class="flex flex-col items-center py-16 text-parchment-200/40"
      >
        <div class="mb-3 animate-pulse text-3xl">☁️</div>
        <p class="text-xs">正在从服务器读取...</p>
      </div>

      <div
        v-else-if="customFormStore.error"
        class="flex flex-col items-center py-16 text-red-300/60"
      >
        <div class="mb-3 text-3xl">⚠️</div>
        <p class="text-xs">读取失败：{{ customFormStore.error }}</p>
        <p class="mt-1 text-[10px] text-parchment-200/40">
          请确认后端服务已启动（默认端口 3001）
        </p>
        <button
          class="mt-3 rounded-md border border-coc px-3 py-1.5 text-xs text-coc"
          @click="refresh"
        >
          重试
        </button>
      </div>

      <div
        v-else-if="!filteredList.length"
        class="flex flex-col items-center py-16 text-parchment-200/40"
      >
        <div class="mb-3 text-3xl opacity-40">📭</div>
        <p class="text-xs">服务器上还没有保存的表单</p>
        <p class="mt-1 text-[10px]">
          请前往
          <router-link to="/designer" class="text-dnd underline">网页设计器</router-link>
          保存一个
        </p>
      </div>

      <div v-else class="space-y-3">
        <button
          v-for="item in filteredList"
          :key="item.id"
          class="parchment-card ink-border flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:-translate-y-0.5 hover:shadow-card-hover"
          :disabled="importingId === item.id"
          @click="importAsSystem(item.id)"
        >
          <div
            class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg text-2xl"
            :style="{
              backgroundColor: (systemColor[item.system] || '#666') + '22',
              boxShadow: `0 0 0 1px ${systemColor[item.system] || '#666'}55 inset`,
            }"
          >
            {{ systemLogo(item.system) }}
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="font-cinzel truncate text-sm font-semibold text-ink-900">
                {{ item.name }}
              </span>
              <span
                class="rounded px-1.5 py-0.5 text-[9px] font-medium"
                :style="{
                  color: systemColor[item.system] || '#666',
                  backgroundColor: (systemColor[item.system] || '#666') + '22',
                }"
              >
                {{ systemName(item.system) }}
              </span>
            </div>
            <p
              v-if="item.description"
              class="mt-1 line-clamp-2 text-[11px] text-ink-700"
            >
              {{ item.description }}
            </p>
            <div class="mt-1.5 flex items-center gap-3 text-[10px] text-ink-700/70">
              <span>📋 {{ item.fieldCount }} 字段</span>
              <span>🕒 {{ new Date(item.updatedAt).toLocaleDateString('zh-CN') }}</span>
            </div>
          </div>

          <div
            class="flex flex-shrink-0 items-center gap-1 rounded-md bg-ink-900 px-3 py-1.5 text-[10px] font-medium text-parchment-200"
          >
            <svg
              v-if="importingId === item.id"
              class="h-3 w-3 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 12a9 9 0 11-6.219-8.56" stroke-linecap="round" />
            </svg>
            <svg
              v-else
              class="h-3 w-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            {{ importingId === item.id ? '导入中' : '导入为新规则' }}
          </div>
        </button>
      </div>
    </main>
  </div>
</template>
