<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCardStore } from '@/stores/cards'
import type { CharacterCard, RuleSystem } from '@/types/card'

const router = useRouter()
const store = useCardStore()

// 我的卡片分组（按规则系统分组）
const groupedMyCards = computed(() => {
  const groups: Array<{
    system: RuleSystem
    name: string
    logo: string
    accent: string
    items: CharacterCard[]
  }> = []
  for (const sys of store.systems) {
    const items = store.myCards.filter((c) => c.system === sys.code)
    if (items.length) {
      groups.push({
        system: sys.code,
        name: sys.name,
        logo: sys.logo,
        accent: sys.accentColor,
        items,
      })
    }
  }
  return groups
})

function openCard(id: string) {
  router.push({ name: 'miniapp-card', params: { id } })
}
function goHome() {
  router.push('/miniapp/home')
}

const topStats = computed(() => {
  const perSystem = store.stats.perSystem
  const systems = store.systems
  const systemStats = systems
    .filter((s) => perSystem[s.code])
    .slice(0, 1)
    .map((s) => ({
      label: s.name,
      value: perSystem[s.code],
      color: s.accentColor,
    }))
  return [
    { label: '总卡数', value: store.stats.total, color: '#C8A046' },
    { label: '收藏', value: store.stats.favorites, color: '#3B6B4A' },
    ...systemStats,
  ]
})
</script>

<template>
  <div class="min-h-full bg-ink-900">
    <!-- 用户信息卡 -->
    <section
      class="relative overflow-hidden bg-gradient-to-b from-ink-800 to-ink-900 px-5 pb-6 pt-8"
    >
      <!-- 装饰光晕 -->
      <div
        class="pointer-events-none absolute -top-10 right-0 h-40 w-40 rounded-full opacity-30 blur-3xl"
        style="background: radial-gradient(circle, #C8A046 0%, transparent 70%)"
      />
      <div class="relative flex items-center gap-4">
        <!-- 头像 -->
        <div
          class="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dnd bg-ink-700 text-2xl"
        >
          <img
            v-if="store.userAvatar"
            :src="store.userAvatar"
            alt="头像"
            class="h-full w-full object-cover"
          />
          <span v-else>🧙</span>
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="font-cinzel text-lg font-bold text-parchment-200">
            {{ store.userName }}
          </h2>
          <p class="mt-0.5 text-[11px] text-parchment-200/50">
            跑团旅人 · ID #TRPG-2026
          </p>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <span
              v-for="s in store.systems"
              :key="s.code"
              class="rounded px-1.5 py-0.5 text-[9px]"
              :style="{
                color: s.accentColor,
                backgroundColor: s.accentColor + '22',
              }"
            >
              {{ s.logo }} {{ s.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- 统计数据 -->
      <div class="relative mt-5 grid grid-cols-3 gap-2">
        <div
          v-for="(stat, idx) in topStats"
          :key="idx"
          class="rounded-lg bg-ink-900/60 px-2 py-2 text-center ring-1 ring-ink-700"
        >
          <div
            class="font-cinzel text-lg font-bold"
            :style="{ color: stat.color }"
          >
            {{ stat.value }}
          </div>
          <div class="text-[9px] text-parchment-200/50">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- 我的角色卡 -->
    <section class="px-4 py-4">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="font-cinzel text-sm font-semibold text-parchment-200">
          我的角色卡
        </h3>
        <button
          class="text-[10px] text-dnd hover:underline"
          @click="goHome"
        >
          查看全部 →
        </button>
      </div>

      <div
        v-for="group in groupedMyCards"
        :key="group.system"
        class="mb-4"
      >
        <div
          class="mb-2 flex items-center gap-1.5 text-[11px]"
          :style="{ color: group.accent }"
        >
          <span class="text-base">{{ group.logo }}</span>
          <span class="font-semibold">{{ group.name }}</span>
          <span class="text-parchment-200/40">· {{ group.items.length }}</span>
        </div>
        <div class="space-y-2">
          <button
            v-for="card in group.items"
            :key="card.id"
            class="flex w-full items-center gap-3 rounded-lg bg-ink-800/60 p-2.5 text-left ring-1 ring-ink-700/50 transition hover:ring-1 hover:ring-dnd"
            @click="openCard(card.id)"
          >
            <div
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md text-lg"
              :style="{ backgroundColor: group.accent + '22' }"
            >
              {{ group.logo }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1">
                <span class="truncate text-xs font-semibold text-parchment-200">
                  {{ card.name }}
                </span>
                <svg
                  v-if="card.favorite"
                  class="h-3 w-3 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  :style="{ color: group.accent }"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <p class="mt-0.5 truncate text-[10px] text-parchment-200/40">
                {{ card.description }}
              </p>
            </div>
            <svg
              class="h-4 w-4 flex-shrink-0 text-parchment-200/30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- 功能菜单 -->
    <section class="px-4 pb-6 pt-2">
      <div class="overflow-hidden rounded-xl bg-ink-800/60 ring-1 ring-ink-700">
        <router-link
          to="/designer"
          class="flex items-center gap-3 border-b border-ink-700/50 px-4 py-3 hover:bg-ink-700/30"
        >
          <span class="text-lg">🛠️</span>
          <div class="flex-1">
            <div class="text-xs font-medium text-parchment-200">网页表单设计器</div>
            <div class="text-[10px] text-parchment-200/40">制作 COC / DND 表单模板</div>
          </div>
          <span class="text-parchment-200/40">↗</span>
        </router-link>
        <button
          class="flex w-full items-center gap-3 border-b border-ink-700/50 px-4 py-3 text-left hover:bg-ink-700/30"
          @click="router.push('/miniapp/import')"
        >
          <span class="text-lg">📥</span>
          <div class="flex-1">
            <div class="text-xs font-medium text-coc">读取服务器表单 JSON</div>
            <div class="text-[10px] text-parchment-200/40">下载设计器保存的表单并渲染</div>
          </div>
          <span class="text-parchment-200/40">↗</span>
        </button>
        <button
          class="flex w-full items-center gap-3 border-b border-ink-700/50 px-4 py-3 text-left hover:bg-ink-700/30"
        >
          <span class="text-lg">⚙️</span>
          <div class="flex-1">
            <div class="text-xs font-medium text-parchment-200">设置</div>
            <div class="text-[10px] text-parchment-200/40">主题、字体、深色模式</div>
          </div>
        </button>
        <button
          class="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-ink-700/30"
        >
          <span class="text-lg">📖</span>
          <div class="flex-1">
            <div class="text-xs font-medium text-parchment-200">关于</div>
            <div class="text-[10px] text-parchment-200/40">v1.0.0 · 基于 form-create-designer</div>
          </div>
        </button>
      </div>
    </section>
  </div>
</template>
