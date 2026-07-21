<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCardStore } from '@/stores/cards'
import RuleTab from '@/components/RuleTab.vue'
import CardItem from '@/components/CardItem.vue'
import type { RuleSystem, CharacterCard, SystemInfo } from '@/types/card'
import { loggerPage } from '@/utils/logger'
const logger = loggerPage('MiniAppHome')

const router = useRouter()
const store = useCardStore()

const searchInput = ref('')
const addDialogVisible = ref(false)
const newCardName = ref('')
const newCardDesc = ref('')
const deleteDialogVisible = ref(false)
const cardToDelete = ref<CharacterCard | null>(null)
const systemActionDialogVisible = ref(false)
const systemActionTarget = ref<SystemInfo | null>(null)
const deleteSystemDialogVisible = ref(false)
const systemToDelete = ref<SystemInfo | null>(null)

function onSearch() {
  store.setSearch(searchInput.value)
}

function changeSystem(sys: RuleSystem) {
  logger.info('changeSystem', { to: sys })
  store.setSystem(sys)
  searchInput.value = ''
  store.setSearch('')
}

function openCard(card: CharacterCard) {
  logger.info('openCard', { cardId: card.id, name: card.name })
  router.push({ name: 'miniapp-card', params: { id: card.id } })
}

function toggleFav(card: CharacterCard) {
  logger.info('toggleFav', { cardId: card.id, name: card.name })
  store.toggleFavorite(card.id)
}

function goImport() {
  // TODO: 暂时隐藏新增规则功能
  // router.push('/miniapp/import')
}

function openAddDialog() {
  newCardName.value = ''
  newCardDesc.value = ''
  addDialogVisible.value = true
}

function doAddCard() {
  logger.info('doAddCard', { system: store.currentSystem, name: newCardName.value })
  if (!newCardName.value.trim()) return
  const card = store.addCard(store.currentSystem, newCardName.value.trim(), newCardDesc.value.trim())
  addDialogVisible.value = false
  router.push({ name: 'miniapp-card', params: { id: card.id } })
}

function onLongPress(card: CharacterCard) {
  cardToDelete.value = card
  deleteDialogVisible.value = true
}

function confirmDelete() {
  logger.info('confirmDelete', { cardId: cardToDelete.value?.id, name: cardToDelete.value?.name })
  if (cardToDelete.value) {
    store.deleteCard(cardToDelete.value.id)
  }
  deleteDialogVisible.value = false
  cardToDelete.value = null
}

function onPressSystem(system: SystemInfo) {
  logger.info('onPressSystem', { code: system.code, name: system.name })
  systemActionTarget.value = system
  systemActionDialogVisible.value = true
}

function exportCurrentSystem() {
  logger.info('exportCurrentSystem', { system: systemActionTarget.value?.code, name: systemActionTarget.value?.name })
  if (!systemActionTarget.value) return
  const sys = systemActionTarget.value
  const rule = sys.rule || []
  const option = sys.option || {}
  const exportData = {
    name: sys.name,
    fullName: sys.fullName,
    description: sys.description,
    logo: sys.logo,
    accentColor: sys.accentColor,
    isCustom: sys.isCustom,
    exportTime: new Date().toISOString(),
    rule,
    option,
  }
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = '/api/download/json'
  form.target = '_blank'
  form.style.display = 'none'
  const dataInput = document.createElement('input')
  dataInput.type = 'hidden'
  dataInput.name = 'data'
  dataInput.value = JSON.stringify(exportData)
  form.appendChild(dataInput)
  const filenameInput = document.createElement('input')
  filenameInput.type = 'hidden'
  filenameInput.name = 'filename'
  filenameInput.value = `rule-${sys.name}-${Date.now()}.json`
  form.appendChild(filenameInput)
  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
  systemActionDialogVisible.value = false
}

function openDeleteSystemDialog() {
  if (systemActionTarget.value) {
    systemToDelete.value = systemActionTarget.value
    systemActionDialogVisible.value = false
    deleteSystemDialogVisible.value = true
  }
}

function confirmDeleteSystem() {
  logger.info('confirmDeleteSystem', { code: systemToDelete.value?.code, name: systemToDelete.value?.name, isCustom: systemToDelete.value?.isCustom })
  if (systemToDelete.value) {
    store.deleteSystem(systemToDelete.value.code)
  }
  deleteSystemDialogVisible.value = false
  systemToDelete.value = null
}

const sysInfo = computed(() => store.currentSystemInfo)
</script>

<template>
  <div class="flex min-h-full flex-col bg-ink-900">
    <header
      class="sticky top-0 z-20 flex-shrink-0 border-b border-ink-700/60 bg-ink-900/95 backdrop-blur"
      :style="{ boxShadow: `inset 0 -2px 0 ${sysInfo.accentColor}55` }"
    >
      <div class="flex items-center justify-between px-4 pt-3">
        <div class="flex items-baseline gap-2">
          <h1 class="font-cinzel text-xl font-bold text-parchment-200">
            跑团角色卡
          </h1>
          <span
            class="rounded-full px-2 py-0.5 text-[9px] font-semibold"
            :style="{
              color: sysInfo.accentColor,
              backgroundColor: sysInfo.accentColor + '22',
            }"
          >
            {{ sysInfo.logo }} {{ sysInfo.fullName }}
          </span>
        </div>
        <router-link
          to="/designer"
          class="rounded-md border border-ink-600 px-2 py-1 text-[10px] text-parchment-200/60 transition hover:border-dnd hover:text-dnd"
        >
          设计器 ↗
        </router-link>
      </div>

      <div class="px-4 py-2">
        <div
          class="flex items-center gap-2 rounded-lg bg-ink-800 px-3 py-2 ring-1 ring-ink-700 focus-within:ring-1 focus-within:ring-dnd"
        >
          <svg
            class="h-3.5 w-3.5 text-parchment-200/40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" stroke-linecap="round" />
          </svg>
          <input
            v-model="searchInput"
            type="text"
            placeholder="搜索角色名 / 职业 / 关键词..."
            class="flex-1 bg-transparent text-xs text-parchment-200 placeholder:text-parchment-200/30 focus:outline-none"
            @input="onSearch"
          />
          <span
            v-if="searchInput"
            class="text-[10px] text-parchment-200/40"
            @click="
              () => {
                searchInput = ''
                store.setSearch('')
              }
            "
          >
            清除
          </span>
        </div>
      </div>

      <div class="px-4 pb-2">
        <RuleTab
          :systems="store.systems"
          :current="store.currentSystem"
          @change="changeSystem"
          @add="goImport"
          @press-system="onPressSystem"
        />
      </div>
    </header>

    <main class="flex-1 px-3 py-4">
      <div class="mb-3 flex items-center justify-between">
        <span class="text-[11px] text-parchment-200/50">
          共 {{ store.filteredCards.length }} 张角色卡
        </span>
        <button
          class="flex items-center gap-1 rounded-md border border-dnd/40 bg-dnd/10 px-3 py-1 text-[11px] font-medium text-dnd transition hover:bg-dnd/20"
          @click="openAddDialog"
        >
          <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" />
          </svg>
          新建角色卡
        </button>
      </div>

      <div
        v-if="store.filteredCards.length"
        class="grid grid-cols-2 gap-3 pb-4"
      >
        <CardItem
          v-for="card in store.filteredCards"
          :key="card.id"
          :card="card"
          :system="sysInfo"
          @click="openCard(card)"
          @toggle-fav="toggleFav(card)"
          @long-press="onLongPress(card)"
        />
      </div>

      <div
        v-else
        class="flex flex-col items-center justify-center py-16 text-parchment-200/40"
      >
        <div class="mb-3 text-4xl opacity-40">{{ sysInfo.logo }}</div>
        <p class="text-sm">没有匹配的角色卡</p>
        <button
          class="mt-3 rounded-md border border-dnd px-3 py-1.5 text-xs text-dnd hover:bg-dnd hover:text-ink-900"
          @click="openAddDialog"
        >
          + 新建一张
        </button>
      </div>
    </main>

    <transition name="fade">
      <div
        v-if="addDialogVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/80 p-6 backdrop-blur"
        @click.self="addDialogVisible = false"
      >
        <div class="w-full max-w-sm overflow-hidden rounded-xl border border-ink-600 bg-ink-800 shadow-2xl">
          <div class="flex items-center justify-between border-b border-ink-700 px-5 py-3">
            <div class="flex items-center gap-2">
              <span class="text-lg">✨</span>
              <h3 class="font-cinzel text-sm font-semibold text-parchment-200">
                新建角色卡
              </h3>
            </div>
            <button
              class="text-parchment-200/40 hover:text-parchment-200"
              @click="addDialogVisible = false"
            >
              ✕
            </button>
          </div>
          <div class="space-y-4 p-5">
            <div class="rounded-md bg-ink-900/60 p-3 text-[11px] text-parchment-200/50">
              <span :style="{ color: sysInfo.accentColor }">{{ sysInfo.logo }} {{ sysInfo.name }}</span>
              · 将基于此规则系统的表单创建新角色卡
            </div>
            <div>
              <label class="mb-1 block text-xs text-parchment-200/60">角色名称 *</label>
              <input
                v-model="newCardName"
                type="text"
                class="w-full rounded-md bg-ink-900 px-3 py-2 text-sm text-parchment-200 ring-1 ring-ink-600 focus:outline-none focus:ring-dnd"
                placeholder="输入角色名称"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs text-parchment-200/60">简介</label>
              <textarea
                v-model="newCardDesc"
                rows="3"
                class="w-full rounded-md bg-ink-900 px-3 py-2 text-sm text-parchment-200 ring-1 ring-ink-600 focus:outline-none focus:ring-dnd"
                placeholder="角色的简短描述..."
              />
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button
                class="rounded-md border border-ink-600 px-4 py-2 text-xs text-parchment-200/70 hover:border-parchment-200/40"
                @click="addDialogVisible = false"
              >
                取消
              </button>
              <button
                class="rounded-md bg-dnd px-4 py-2 text-xs font-semibold text-ink-900 transition hover:brightness-110 disabled:opacity-50"
                :disabled="!newCardName.trim()"
                @click="doAddCard"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div
        v-if="deleteDialogVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/80 p-6 backdrop-blur"
        @click.self="deleteDialogVisible = false"
      >
        <div class="w-full max-w-sm overflow-hidden rounded-xl border border-red-900/50 bg-ink-800 shadow-2xl">
          <div class="px-5 pt-5 pb-3 text-center">
            <div class="mb-3 text-4xl">⚠️</div>
            <h3 class="font-cinzel text-base font-semibold text-parchment-200">
              删除角色卡？
            </h3>
            <p v-if="cardToDelete" class="mt-2 text-xs text-parchment-200/50">
              「{{ cardToDelete.name }}」将被永久删除，此操作不可撤销。
            </p>
          </div>
          <div class="flex border-t border-ink-700">
            <button
              class="flex-1 border-r border-ink-700 py-3 text-xs text-parchment-200/70 hover:bg-ink-700/30"
              @click="deleteDialogVisible = false"
            >
              取消
            </button>
            <button
              class="flex-1 py-3 text-xs font-semibold text-red-400 hover:bg-red-900/20"
              @click="confirmDelete"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div
        v-if="systemActionDialogVisible && systemActionTarget"
        class="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/80 p-0 backdrop-blur sm:items-center sm:p-6"
        @click.self="systemActionDialogVisible = false"
      >
        <div class="w-full max-w-sm overflow-hidden rounded-t-2xl border border-ink-600 bg-ink-800 shadow-2xl sm:rounded-xl">
          <div class="relative px-5 pb-6 pt-8 text-center">
            <button
              class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-parchment-200/40 hover:bg-ink-700/50 hover:text-parchment-200"
              @click="systemActionDialogVisible = false"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" />
              </svg>
            </button>
            <div
              class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl text-5xl"
              :style="{
                backgroundColor: systemActionTarget.accentColor + '22',
                boxShadow: `0 0 0 2px ${systemActionTarget.accentColor}55 inset`,
              }"
            >
              {{ systemActionTarget.logo }}
            </div>
            <h3 class="font-cinzel text-lg font-bold text-parchment-200">
              {{ systemActionTarget.fullName }}
            </h3>
            <p class="mt-1 text-[11px] text-parchment-200/40">
              {{ systemActionTarget.isCustom ? '自定义规则' : '预置规则' }}
            </p>
          </div>

          <div class="space-y-1 px-3 pb-4">
            <button
              class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition hover:bg-ink-700/50"
              @click="exportCurrentSystem"
            >
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-dnd/10 text-dnd">
                <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-linecap="round" stroke-linejoin="round" />
                  <polyline points="7 10 12 15 17 10" stroke-linecap="round" stroke-linejoin="round" />
                  <line x1="12" y1="15" x2="12" y2="3" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div class="flex-1">
                <div class="text-sm font-medium text-parchment-200">导出 JSON</div>
                <div class="text-[11px] text-parchment-200/40">将规则表单导出为 JSON 文件</div>
              </div>
              <svg class="h-4 w-4 text-parchment-200/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>

            <button
              class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition hover:bg-red-900/20"
              @click="openDeleteSystemDialog"
            >
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-red-900/20 text-red-400">
                <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6" stroke-linecap="round" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke-linecap="round" />
                  <path d="M10 11v6M14 11v6" stroke-linecap="round" />
                  <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke-linecap="round" />
                </svg>
              </div>
              <div class="flex-1">
                <div class="text-sm font-medium text-red-400">
                  {{ systemActionTarget.isCustom ? '删除规则' : '隐藏规则' }}
                </div>
                <div class="text-[11px] text-parchment-200/40">
                  {{ systemActionTarget.isCustom ? '永久删除此规则及其角色卡' : '从列表中隐藏此规则' }}
                </div>
              </div>
              <svg class="h-4 w-4 text-parchment-200/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <div class="border-t border-ink-700 px-3 py-3">
            <button
              class="w-full rounded-lg py-3 text-sm font-medium text-parchment-200/70 transition hover:bg-ink-700/30 hover:text-parchment-200"
              @click="systemActionDialogVisible = false"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div
        v-if="deleteSystemDialogVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/80 p-6 backdrop-blur"
        @click.self="deleteSystemDialogVisible = false"
      >
        <div class="w-full max-w-sm overflow-hidden rounded-xl border border-red-900/50 bg-ink-800 shadow-2xl">
          <div class="px-5 pt-5 pb-3 text-center">
            <div class="mb-3 text-4xl">⚠️</div>
            <h3 class="font-cinzel text-base font-semibold text-parchment-200">
              {{ systemToDelete?.isCustom ? '删除规则系统？' : '隐藏规则系统？' }}
            </h3>
            <p v-if="systemToDelete" class="mt-2 text-xs text-parchment-200/50">
              <template v-if="systemToDelete.isCustom">
                「{{ systemToDelete.name }}」及其下所有角色卡将被永久删除，此操作不可撤销。
              </template>
              <template v-else>
                「{{ systemToDelete.name }}」将从列表中隐藏，可通过重置恢复。
              </template>
            </p>
          </div>
          <div class="flex border-t border-ink-700">
            <button
              class="flex-1 border-r border-ink-700 py-3 text-xs text-parchment-200/70 hover:bg-ink-700/30"
              @click="deleteSystemDialogVisible = false"
            >
              取消
            </button>
            <button
              class="flex-1 py-3 text-xs font-semibold text-red-400 hover:bg-red-900/20"
              @click="confirmDeleteSystem"
            >
              {{ systemToDelete?.isCustom ? '删除' : '隐藏' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
