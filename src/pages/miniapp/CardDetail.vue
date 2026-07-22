<script setup lang="ts">
/**
 * 角色卡详情页
 * 展示角色卡完整信息 + 手动属性表（替换 JSON 表单渲染）
 * 支持 COC / DND / Daggerheart 三种规则系统
 */
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCardStore } from '@/stores/cards'
import { computePreviewStats } from '@/data/rules/common/preview-stats'
import { loggerPage } from '@/utils/logger'
import { parseStCommand } from '@/utils/st-parser'
import CocSheet from '@/components/CocSheet.vue'
import DndSheet from '@/components/DndSheet.vue'
import DaggerheartSheet from '@/components/DaggerheartSheet.vue'
const logger = loggerPage('CardDetail')

const route = useRoute()
const router = useRouter()
const store = useCardStore()

// st 指令对话框
const stDialogVisible = ref(false)
const stCommandText = ref('')

// ===== 编辑状态 =====
const editingBasicInfo = ref(false)
const editingAttrs = ref(false)
const editingStatus = ref(false)
const editBasicInfo = ref<Record<string, unknown>>({})
const editAttrs = ref<Record<string, unknown>>({})
const editStatus = ref<Record<string, unknown>>({})

const attrEditList = [
  { key: 'str', label: '力量' },
  { key: 'dex', label: '敏捷' },
  { key: 'pow', label: '意志' },
  { key: 'con', label: '体质' },
  { key: 'app', label: '外貌' },
  { key: 'edu', label: '教育' },
  { key: 'siz', label: '体型' },
  { key: 'int', label: '智力' },
  { key: 'luck', label: '幸运' },
]

/** 当前角色卡数据 */
const card = computed(() => {
  const id = route.params.id as string
  return store.getCardById(id)
})

/** 当前规则系统信息 */
const systemInfo = computed(() =>
  card.value ? store.getSystemInfo(card.value.system) : null,
)

/** 选择对应规则的手动属性表组件 */
const sheetComponent = computed(() => {
  if (!card.value) return null
  switch (card.value.system) {
    case 'COC': return CocSheet
    case 'DND': return DndSheet
    case 'DAGGERHEART': return DaggerheartSheet
    default: return null
  }
})

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

// ===== st 指令 =====
function openStDialog() {
  stDialogVisible.value = true
  stCommandText.value = ''
}

function applyStCommand() {
  if (!stCommandText.value.trim()) return
  const parsed = parseStCommand(stCommandText.value.trim())
  if (!parsed || Object.keys(parsed).length === 0) return
  if (card.value) {
    const merged = { ...card.value.formData, ...parsed }
    store.updateCardFormData(card.value.id, merged)
  }
  stDialogVisible.value = false
}

// ===== 头像上传 =====
function onAvatarClick() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file && card.value) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string
        store.updateCardAvatar(card.value!.id, dataUrl)
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// ===== 基本信息编辑 =====
function startEditBasicInfo() {
  const fd = card.value?.formData || {}
  editBasicInfo.value = {
    name: fd.name || '',
    occupation: fd.occupation || '',
    player: fd.player || card.value?.player || '',
    age: fd.age || '',
    gender: fd.gender || '',
    year: fd.year || '1920s',
    residence: fd.residence || '',
  }
  editingBasicInfo.value = true
}

function cancelEditBasicInfo() {
  editingBasicInfo.value = false
}

function applyEditBasicInfo() {
  if (!card.value) return
  const fd = { ...card.value.formData }
  const e = editBasicInfo.value
  fd.name = e.name
  fd.occupation = e.occupation
  fd.player = e.player
  fd.age = e.age
  fd.gender = e.gender
  fd.year = e.year
  fd.residence = e.residence
  store.updateCardFormData(card.value.id, fd)
  editingBasicInfo.value = false
}

// ===== 基础属性编辑 =====
function startEditAttrs() {
  const fd = card.value?.formData || {}
  editAttrs.value = {
    str: fd.str ?? 50,
    dex: fd.dex ?? 50,
    pow: fd.pow ?? 50,
    con: fd.con ?? 50,
    app: fd.app ?? 50,
    edu: fd.edu ?? 80,
    siz: fd.siz ?? 50,
    int: fd.int ?? 75,
    luck: fd.luck ?? 50,
  }
  editingAttrs.value = true
}

function cancelEditAttrs() {
  editingAttrs.value = false
}

function applyEditAttrs() {
  if (!card.value) return
  const fd = { ...card.value.formData }
  const e = editAttrs.value
  fd.str = e.str
  fd.dex = e.dex
  fd.pow = e.pow
  fd.con = e.con
  fd.app = e.app
  fd.edu = e.edu
  fd.siz = e.siz
  fd.int = e.int
  fd.luck = e.luck
  fd.hp = Math.floor(((e.con as number) + (e.siz as number)) / 10)
  fd.hpMax = fd.hp
  fd.mp = Math.floor((e.pow as number) / 5)
  fd.mpMax = fd.mp
  fd.san = e.pow
  fd.sanMax = e.pow
  store.updateCardFormData(card.value.id, fd)
  editingAttrs.value = false
}

// ===== 当前状态编辑 =====
function startEditStatus() {
  const fd = card.value?.formData || {}
  editStatus.value = {
    hp: fd.hp ?? 0,
    hpMax: fd.hpMax ?? 0,
    san: fd.san ?? 0,
    sanMax: fd.sanMax ?? 0,
    mp: fd.mp ?? 0,
    mpMax: fd.mpMax ?? 0,
    ac: fd.ac ?? 0,
  }
  editingStatus.value = true
}

function cancelEditStatus() {
  editingStatus.value = false
}

function applyEditStatus() {
  if (!card.value) return
  const fd = { ...card.value.formData }
  const e = editStatus.value
  fd.hp = e.hp
  fd.hpMax = e.hpMax
  fd.san = e.san
  fd.sanMax = e.sanMax
  fd.mp = e.mp
  fd.mpMax = e.mpMax
  fd.ac = e.ac
  store.updateCardFormData(card.value.id, fd)
  editingStatus.value = false
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
        角色卡详情
      </span>
      <div class="flex items-center gap-2">
        <button
          class="flex h-7 items-center justify-center rounded-md px-2 text-xs font-mono"
          :style="{ borderColor: accentColor + '55', color: accentColor, border: '1px solid ' + accentColor + '55' }"
          @click="openStDialog"
        >
          .st
        </button>
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
      </div>
    </header>

    <template v-if="card && systemInfo">
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
              class="flex h-20 w-20 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl text-4xl hover:opacity-80 transition-opacity"
              :style="{
                backgroundColor: accentColor + '22',
                boxShadow: `0 0 0 2px ${accentColor}55 inset`,
              }"
              @click="onAvatarClick"
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

        <!-- 手动属性表（按规则系统渲染） -->
        <template v-if="sheetComponent">
          <component :is="sheetComponent" :card="card" :accent-color="accentColor" :system-logo="systemInfo?.logo || '●'" />
        </template>
        <div v-else class="rounded-lg bg-ink-900/50 p-6 text-center text-xs text-parchment-200/50">
          暂不支持该规则系统的属性表展示
        </div>

        <!-- 编辑面板 -->
        <div v-if="card.system === 'COC'" class="mt-4 space-y-3">
          <!-- 基本信息编辑 -->
          <div class="rounded-xl border p-4" :style="{ background: accentColor + '08', borderColor: accentColor + '15' }">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="text-xs font-semibold" :style="{ color: accentColor }">基本信息</h3>
              <div class="flex items-center gap-2">
                <template v-if="editingBasicInfo">
                  <button class="rounded-md border px-2 py-0.5 text-[10px]" :style="{ borderColor: accentColor, color: accentColor }" @click="cancelEditBasicInfo">取消</button>
                  <button class="rounded-md px-2 py-0.5 text-[10px] font-semibold" :style="{ background: accentColor, color: '#111' }" @click="applyEditBasicInfo">保存</button>
                </template>
                <button v-else class="rounded-md border px-2 py-0.5 text-[10px] opacity-60" :style="{ borderColor: accentColor, color: accentColor }" @click="startEditBasicInfo">✎</button>
              </div>
            </div>
            <template v-if="editingBasicInfo">
              <div class="grid grid-cols-2 gap-2">
                <div class="flex items-center gap-2"><span class="text-[10px] text-parchment-200/40 w-10">姓名</span><input v-model="editBasicInfo.name" class="flex-1 rounded bg-ink-800 px-2 py-1 text-xs text-parchment-200" /></div>
                <div class="flex items-center gap-2"><span class="text-[10px] text-parchment-200/40 w-10">职业</span><input v-model="editBasicInfo.occupation" class="flex-1 rounded bg-ink-800 px-2 py-1 text-xs text-parchment-200" /></div>
                <div class="flex items-center gap-2"><span class="text-[10px] text-parchment-200/40 w-10">玩家</span><input v-model="editBasicInfo.player" class="flex-1 rounded bg-ink-800 px-2 py-1 text-xs text-parchment-200" /></div>
                <div class="flex items-center gap-2"><span class="text-[10px] text-parchment-200/40 w-10">年龄</span><input v-model="editBasicInfo.age" class="flex-1 rounded bg-ink-800 px-2 py-1 text-xs text-parchment-200" /></div>
                <div class="flex items-center gap-2"><span class="text-[10px] text-parchment-200/40 w-10">性别</span><input v-model="editBasicInfo.gender" class="flex-1 rounded bg-ink-800 px-2 py-1 text-xs text-parchment-200" /></div>
                <div class="flex items-center gap-2"><span class="text-[10px] text-parchment-200/40 w-10">年份</span><input v-model="editBasicInfo.year" class="flex-1 rounded bg-ink-800 px-2 py-1 text-xs text-parchment-200" /></div>
                <div class="col-span-2 flex items-center gap-2"><span class="text-[10px] text-parchment-200/40 w-10">居住地</span><input v-model="editBasicInfo.residence" class="flex-1 rounded bg-ink-800 px-2 py-1 text-xs text-parchment-200" /></div>
              </div>
            </template>
            <div v-else class="grid grid-cols-2 gap-1 text-xs text-parchment-200/60">
              <div><span class="text-parchment-200/30">姓名</span> {{ card.formData.name || '-' }}</div>
              <div><span class="text-parchment-200/30">职业</span> {{ card.formData.occupation || '-' }}</div>
              <div><span class="text-parchment-200/30">玩家</span> {{ card.formData.player || card.player || '-' }}</div>
              <div><span class="text-parchment-200/30">年龄</span> {{ card.formData.age || '-' }}</div>
              <div><span class="text-parchment-200/30">性别</span> {{ card.formData.gender || '-' }}</div>
              <div><span class="text-parchment-200/30">年份</span> {{ card.formData.year || '1920s' }}</div>
              <div class="col-span-2"><span class="text-parchment-200/30">居住地</span> {{ card.formData.residence || '-' }}</div>
            </div>
          </div>

          <!-- 基础属性编辑 -->
          <div class="rounded-xl border p-4" :style="{ background: accentColor + '08', borderColor: accentColor + '15' }">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="text-xs font-semibold" :style="{ color: accentColor }">基础属性</h3>
              <div class="flex items-center gap-2">
                <template v-if="editingAttrs">
                  <button class="rounded-md border px-2 py-0.5 text-[10px]" :style="{ borderColor: accentColor, color: accentColor }" @click="cancelEditAttrs">取消</button>
                  <button class="rounded-md px-2 py-0.5 text-[10px] font-semibold" :style="{ background: accentColor, color: '#111' }" @click="applyEditAttrs">保存</button>
                </template>
                <button v-else class="rounded-md border px-2 py-0.5 text-[10px] opacity-60" :style="{ borderColor: accentColor, color: accentColor }" @click="startEditAttrs">✎</button>
              </div>
            </div>
            <template v-if="editingAttrs">
              <div class="grid grid-cols-3 gap-2">
                <div v-for="a in attrEditList" :key="a.key" class="flex flex-col items-center rounded-lg p-2" :style="{ background: accentColor + '08' }">
                  <span class="text-[10px] text-parchment-200/40">{{ a.label }}</span>
                  <input v-model.number="editAttrs[a.key]" type="number" class="mt-1 w-16 rounded bg-ink-800 px-2 py-1 text-center text-sm font-bold text-parchment-200" />
                </div>
              </div>
            </template>
            <div v-else class="grid grid-cols-3 gap-2 text-center text-xs text-parchment-200/60">
              <div v-for="a in attrEditList" :key="a.key" class="rounded-lg p-1" :style="{ background: accentColor + '06' }">
                <div class="font-cinzel text-base font-bold" :style="{ color: accentColor }">{{ card.formData[a.key] ?? '-' }}</div>
                <div class="text-[10px] text-parchment-200/40">{{ a.label }}</div>
              </div>
            </div>
          </div>

          <!-- 当前状态编辑 -->
          <div class="rounded-xl border p-4" :style="{ background: accentColor + '08', borderColor: accentColor + '15' }">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="text-xs font-semibold" :style="{ color: accentColor }">当前状态</h3>
              <div class="flex items-center gap-2">
                <template v-if="editingStatus">
                  <button class="rounded-md border px-2 py-0.5 text-[10px]" :style="{ borderColor: accentColor, color: accentColor }" @click="cancelEditStatus">取消</button>
                  <button class="rounded-md px-2 py-0.5 text-[10px] font-semibold" :style="{ background: accentColor, color: '#111' }" @click="applyEditStatus">保存</button>
                </template>
                <button v-else class="rounded-md border px-2 py-0.5 text-[10px] opacity-60" :style="{ borderColor: accentColor, color: accentColor }" @click="startEditStatus">✎</button>
              </div>
            </div>
            <template v-if="editingStatus">
              <div class="grid grid-cols-4 gap-2">
                <div class="flex flex-col items-center rounded-lg p-2" :style="{ background: 'rgba(239,68,68,0.08)' }">
                  <div class="flex items-center gap-1">
                    <input v-model.number="editStatus.hp" type="number" class="w-14 rounded bg-ink-800 px-2 py-1 text-center text-sm font-bold text-red-400" />
                    <span class="text-[10px] text-parchment-200/20">/</span>
                    <input v-model.number="editStatus.hpMax" type="number" class="w-14 rounded bg-ink-800 px-2 py-1 text-center text-xs text-parchment-200" />
                  </div>
                  <span class="mt-1 text-[10px] text-parchment-200/40">体力 HP</span>
                </div>
                <div class="flex flex-col items-center rounded-lg p-2" :style="{ background: 'rgba(139,92,246,0.08)' }">
                  <div class="flex items-center gap-1">
                    <input v-model.number="editStatus.san" type="number" class="w-14 rounded bg-ink-800 px-2 py-1 text-center text-sm font-bold text-purple-400" />
                    <span class="text-[10px] text-parchment-200/20">/</span>
                    <input v-model.number="editStatus.sanMax" type="number" class="w-14 rounded bg-ink-800 px-2 py-1 text-center text-xs text-parchment-200" />
                  </div>
                  <span class="mt-1 text-[10px] text-parchment-200/40">理智 SAN</span>
                </div>
                <div class="flex flex-col items-center rounded-lg p-2" :style="{ background: 'rgba(99,102,241,0.08)' }">
                  <div class="flex items-center gap-1">
                    <input v-model.number="editStatus.mp" type="number" class="w-14 rounded bg-ink-800 px-2 py-1 text-center text-sm font-bold text-indigo-400" />
                    <span class="text-[10px] text-parchment-200/20">/</span>
                    <input v-model.number="editStatus.mpMax" type="number" class="w-14 rounded bg-ink-800 px-2 py-1 text-center text-xs text-parchment-200" />
                  </div>
                  <span class="mt-1 text-[10px] text-parchment-200/40">魔法 MP</span>
                </div>
                <div class="flex flex-col items-center rounded-lg p-2" :style="{ background: 'rgba(34,197,94,0.08)' }">
                  <input v-model.number="editStatus.ac" type="number" class="w-14 rounded bg-ink-800 px-2 py-1 text-center text-sm font-bold text-green-400" />
                  <span class="mt-1 text-[10px] text-parchment-200/40">护甲 AC</span>
                </div>
              </div>
            </template>
            <div v-else class="grid grid-cols-4 gap-2 text-center">
              <div class="rounded-lg p-2" :style="{ background: 'rgba(239,68,68,0.08)' }">
                <div class="font-cinzel text-sm font-bold text-red-400">{{ card.formData.hp || '-' }}<span class="text-[10px] text-parchment-200/20">/{{ card.formData.hpMax || '-' }}</span></div>
                <div class="text-[10px] text-parchment-200/40">体力 HP</div>
              </div>
              <div class="rounded-lg p-2" :style="{ background: 'rgba(139,92,246,0.08)' }">
                <div class="font-cinzel text-sm font-bold text-purple-400">{{ card.formData.san || '-' }}</div>
                <div class="text-[10px] text-parchment-200/40">理智 SAN</div>
              </div>
              <div class="rounded-lg p-2" :style="{ background: 'rgba(99,102,241,0.08)' }">
                <div class="font-cinzel text-sm font-bold text-indigo-400">{{ card.formData.mp || '-' }}</div>
                <div class="text-[10px] text-parchment-200/40">魔法 MP</div>
              </div>
              <div class="rounded-lg p-2" :style="{ background: 'rgba(34,197,94,0.08)' }">
                <div class="font-cinzel text-sm font-bold text-green-400">{{ card.formData.ac || 0 }}</div>
                <div class="text-[10px] text-parchment-200/40">护甲 AC</div>
              </div>
            </div>
          </div>
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

    <!-- st 指令对话框 -->
    <transition name="fade">
      <div
        v-if="stDialogVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/80 p-6 backdrop-blur"
        @click.self="stDialogVisible = false"
      >
        <div class="w-full max-w-sm overflow-hidden rounded-xl border border-ink-600 bg-ink-800 shadow-2xl">
          <div class="flex items-center justify-between border-b border-ink-700 px-5 py-3">
            <h3 class="font-cinzel text-sm font-semibold text-parchment-200">
              粘贴 .st 指令
            </h3>
            <button
              class="text-parchment-200/40 hover:text-parchment-200"
              @click="stDialogVisible = false"
            >
              ✕
            </button>
          </div>
          <div class="space-y-4 p-5">
            <div class="rounded-md bg-ink-900/60 p-3 text-[11px] text-parchment-200/50">
              粘贴 .st 指令，确认后将更新角色卡数据
            </div>
            <div>
              <textarea
                v-model="stCommandText"
                rows="6"
                maxlength="-1"
                class="w-full rounded-md bg-ink-900 px-3 py-2 text-sm text-parchment-200 ring-1 ring-ink-600 focus:outline-none focus:ring-dnd font-mono"
                placeholder="粘贴 .st 指令..."
              />
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button
                class="rounded-md border border-ink-600 px-4 py-2 text-xs text-parchment-200/70 hover:border-parchment-200/40"
                @click="stDialogVisible = false"
              >
                取消
              </button>
              <button
                class="rounded-md bg-dnd px-4 py-2 text-xs font-semibold text-ink-900 transition hover:brightness-110"
                @click="applyStCommand"
              >
                确认更新
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
