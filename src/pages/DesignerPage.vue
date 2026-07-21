<!--
  表单设计器页面
  基于 form-create-designer 构建，用于可视化设计 TRPG 角色卡表单，
  支持 JSON 导入/导出、服务器保存/加载、小程序预览等功能。
-->
<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import type { RuleSystem } from '@/types/card'
import { saveForm, listForms, getForm } from '@/api/form'
import type { SavedFormItem } from '@/types/saved-form'

const router = useRouter()

// ==================== 设计器与状态管理 ====================
const designerRef = ref<any>(null)
const importFileInput = ref<HTMLInputElement | null>(null)

// ==================== JSON 预览弹窗 ====================
const jsonPreviewVisible = ref(false)
const jsonPreviewContent = ref('')
const optionPreviewContent = ref('')
// ==================== 保存到服务器弹窗 ====================
const saveDialogVisible = ref(false)
const saveFormName = ref('')
const saveFormDescription = ref('')
const saving = ref(false)
// ==================== 已保存表单列表（侧边抽屉） ====================
const savedListVisible = ref(false)
const savedForms = ref<SavedFormItem[]>([])
const loadingSaved = ref(false)
// ==================== 小程序预览加载状态 ====================
const previewing = ref(false)

// ==================== Toast 提示 ====================
const toast = ref<{ visible: boolean; text: string }>({ visible: false, text: '' })
let toastTimer: ReturnType<typeof setTimeout> | undefined
function showToast(text: string) {
  toast.value = { visible: true, text }
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value.visible = false
  }, 2200)
}

// ==================== 自定义规则默认颜色 ====================
const CUSTOM_COLOR = '#C8A046'

// ==================== 清空设计器 ====================
function clearDesigner() {
  if (!designerRef.value) return
  designerRef.value.clearDragRule()
  showToast('已清空画布')
}

// ==================== JSON 导入 ====================
// 触发导入JSON文件选择
function triggerImportJson() {
  if (importFileInput.value) {
    importFileInput.value.value = ''
    importFileInput.value.click()
  }
}

// 处理导入的JSON文件
function onImportJson(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const content = ev.target?.result as string
      let data: any
      try {
        data = JSON.parse(content)
      } catch {
        showToast('JSON 格式错误')
        return
      }

      // 兼容多种格式：直接是rule数组，或包含rule/option的对象
      let rule: any[] = []
      let option: any = {}
      let name = ''

      if (Array.isArray(data)) {
        rule = data
        name = file.name.replace('.json', '')
      } else if (data.rule && Array.isArray(data.rule)) {
        rule = data.rule
        option = data.option || {}
        name = data.name || file.name.replace('.json', '')
      } else if (data.fieldList || data.list) {
        // form-create designer 常见导出格式
        rule = data.fieldList || data.list || []
        option = data.config || data.option || {}
        name = data.name || file.name.replace('.json', '')
      } else {
        showToast('无法识别的 JSON 格式')
        return
      }

      if (!rule.length) {
        showToast('JSON 中没有表单字段')
        return
      }

      if (typeof designerRef.value?.setRule === 'function') {
        designerRef.value.setRule(JSON.parse(JSON.stringify(rule)))
      }
      if (option && typeof designerRef.value?.setOption === 'function') {
        designerRef.value.setOption(option)
      }
      if (name) {
        saveFormName.value = name
      }
      showToast(`已导入 ${rule.length} 个字段`)
    } catch (e) {
      showToast('导入失败：' + (e as Error).message)
    }
  }
  reader.readAsText(file)
}

// ==================== JSON 预览与导出 ====================
// 预览 JSON
function previewJson() {
  if (!designerRef.value) return
  const json = designerRef.value.getJson()
  const optJson = designerRef.value.getOptionsJson()
  jsonPreviewContent.value = formatJson(json)
  optionPreviewContent.value = formatJson(optJson)
  jsonPreviewVisible.value = true
}

// 导出为角色卡 JSON 文件
function exportCard() {
  if (!designerRef.value) return
  const rule = JSON.parse(designerRef.value.getJson())
  const option = designerRef.value.getOptions()
  const formData = designerRef.value.getFormData()

  const cardPayload = {
    id: `card-${Date.now()}`,
    system: 'CUSTOM',
    name: '新建角色卡',
    player: 'KP',
    avatar: '',
    description: '通过设计器创建的角色卡',
    formData,
    rule,
    option,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = '/api/download/json'
  form.target = '_blank'
  form.style.display = 'none'
  const dataInput = document.createElement('input')
  dataInput.type = 'hidden'
  dataInput.name = 'data'
  dataInput.value = JSON.stringify(cardPayload)
  form.appendChild(dataInput)
  const filenameInput = document.createElement('input')
  filenameInput.type = 'hidden'
  filenameInput.name = 'filename'
  filenameInput.value = `character-card-${Date.now()}.json`
  form.appendChild(filenameInput)
  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
  showToast('角色卡 JSON 已导出')
}

// 复制 JSON 到剪贴板
async function copyJson() {
  try {
    await navigator.clipboard.writeText(jsonPreviewContent.value)
    showToast('JSON 已复制到剪贴板')
  } catch {
    showToast('复制失败，请手动选择')
  }
}

// ==================== 保存到服务器 ====================
// 打开"保存到服务器"弹窗
function openSaveDialog() {
  if (!designerRef.value) {
    showToast('设计器未就绪')
    return
  }
  saveFormName.value = '自定义规则 ' + new Date().toLocaleString('zh-CN')
  saveFormDescription.value = ''
  saveDialogVisible.value = true
}

// 执行保存到服务器
async function doSaveToServer() {
  if (!designerRef.value) return
  if (!saveFormName.value.trim()) {
    showToast('请填写规则名称')
    return
  }
  saving.value = true
  try {
    const rule = JSON.parse(designerRef.value.getJson())
    const option = designerRef.value.getOptions()
    const saved = await saveForm({
      name: saveFormName.value.trim(),
      system: 'CUSTOM',
      description: saveFormDescription.value.trim(),
      rule,
      option,
    })
    showToast(`已保存为新规则：${saved.name}`)
    saveDialogVisible.value = false
  } catch (e) {
    showToast('保存失败：' + (e as Error).message)
  } finally {
    saving.value = false
  }
}

// ==================== 加载已保存表单 ====================
// 加载已保存表单列表
async function openSavedList() {
  savedListVisible.value = true
  loadingSaved.value = true
  try {
    savedForms.value = await listForms()
  } catch (e) {
    showToast('加载失败：' + (e as Error).message)
  } finally {
    loadingSaved.value = false
  }
}

// 加载已保存的表单到设计器
async function loadSavedForm(item: SavedFormItem) {
  if (!designerRef.value) return
  try {
    const full = await getForm(item.id)
    const rule = JSON.parse(JSON.stringify(full.rule))
    if (typeof designerRef.value.setRule === 'function') {
      designerRef.value.setRule(rule)
    }
    if (full.option && typeof designerRef.value.setOption === 'function') {
      designerRef.value.setOption(full.option)
    }
    saveFormName.value = full.name
    saveFormDescription.value = full.description || ''
    savedListVisible.value = false
    showToast(`已加载：${full.name}`)
  } catch (e) {
    showToast('加载失败：' + (e as Error).message)
  }
}

// 格式化 JSON
function formatJson(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2)
  } catch {
    return str
  }
}

// 设计器挂载后
onMounted(async () => {
  await nextTick()
})

// ==================== 小程序预览 ====================
// TODO: 暂时隐藏 JSON 渲染功能 - 小程序预览
// 保存当前表单并跳转到小程序预览
// async function goMiniApp() {
//   if (!designerRef.value) {
//     showToast('设计器未就绪')
//     return
//   }
//   const rule = JSON.parse(designerRef.value.getJson())
//   if (!rule || !rule.length) {
//     showToast('请先添加表单组件')
//     return
//   }
//   previewing.value = true
//   try {
//     const option = designerRef.value.getOptions()
//     const saved = await saveForm({
//       name: saveFormName.value.trim() || '预览规则',
//       system: 'CUSTOM',
//       description: saveFormDescription.value.trim(),
//       rule,
//       option,
//     })
//     // 跳转到小程序自定义表单预览页
//     router.push({ name: 'miniapp-custom-card', params: { formId: saved.id } })
//   } catch (e) {
//     showToast('预览失败：' + (e as Error).message)
//   } finally {
//     previewing.value = false
//   }
// }
</script>

<template>
  <div class="flex h-screen w-full flex-col bg-ink-900 text-parchment-200">
    <!-- 顶部工具栏 -->
    <header
      class="flex flex-shrink-0 items-center justify-between border-b border-ink-700 bg-ink-800 px-6 py-3"
      style="box-shadow: inset 0 -2px 0 #C8A04655"
    >
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-lg bg-dnd/20 text-xl"
            style="box-shadow: 0 0 0 1px #C8A04655 inset"
          >
            🎲
          </div>
          <div>
            <h1 class="font-cinzel text-lg font-bold leading-tight text-parchment-200">
              TRPG 表单设计器
            </h1>
            <p class="text-[10px] text-parchment-200/40">
              基于 form-create-designer · COC / DND / Daggerheart
            </p>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center gap-2">
        <button
          class="rounded-md border border-ink-600 px-3 py-1.5 text-xs text-parchment-200/70 transition hover:border-parchment-200/40 hover:text-parchment-200"
          @click="clearDesigner"
        >
          清空
        </button>
        <button
          class="rounded-md border border-ink-600 px-3 py-1.5 text-xs text-parchment-200/70 transition hover:border-parchment-200/40 hover:text-parchment-200"
          @click="triggerImportJson"
        >
          导入 JSON
        </button>
        <input
          ref="importFileInput"
          type="file"
          accept=".json,application/json"
          class="hidden"
          @change="onImportJson"
        />
        <button
          class="rounded-md border border-ink-600 px-3 py-1.5 text-xs text-parchment-200/70 transition hover:border-parchment-200/40 hover:text-parchment-200"
          @click="previewJson"
        >
          预览 JSON
        </button>
        <button
          class="rounded-md border border-ink-600 px-3 py-1.5 text-xs text-parchment-200/70 transition hover:border-parchment-200/40 hover:text-parchment-200"
          @click="openSavedList"
        >
          已保存列表
        </button>
        <button
          class="rounded-md border border-coc px-3 py-1.5 text-xs font-semibold text-coc transition hover:bg-coc hover:text-ink-900"
          :disabled="saving"
          @click="openSaveDialog"
        >
          {{ saving ? '保存中...' : '保存到服务器' }}
        </button>
        <button
          class="rounded-md bg-dnd px-3 py-1.5 text-xs font-semibold text-ink-900 transition hover:brightness-110"
          @click="exportCard"
        >
          导出 JSON 文件
        </button>

        <div class="mx-2 h-5 w-px bg-ink-600" />

        <!-- TODO: 暂时隐藏 JSON 渲染功能 - 小程序预览按钮 -->
        <!-- <button
          class="rounded-md border border-coc px-3 py-1.5 text-xs text-coc transition hover:bg-coc hover:text-ink-900 disabled:opacity-50"
          :disabled="previewing"
          @click="goMiniApp"
        >
          {{ previewing ? '生成中...' : '→ 小程序预览' }}
        </button> -->
      </div>
    </header>

    <!-- 设计器主区域 -->
    <main class="flex-1 overflow-hidden bg-ink-900 fc-style">
      <fc-designer ref="designerRef" style="height: 100%" />
    </main>

    <!-- JSON 预览弹窗 -->
    <transition name="fade">
      <div
        v-if="jsonPreviewVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/80 p-6 backdrop-blur"
        @click.self="jsonPreviewVisible = false"
      >
        <div
          class="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-ink-600 bg-ink-800 shadow-2xl"
        >
          <!-- 弹窗头部 -->
          <div class="flex items-center justify-between border-b border-ink-700 px-5 py-3">
            <div class="flex items-center gap-2">
              <span class="text-lg">📜</span>
              <h3 class="font-cinzel text-sm font-semibold text-dnd">
                表单 JSON 预览
              </h3>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="rounded-md border border-ink-600 px-3 py-1 text-xs text-parchment-200/70 hover:border-dnd hover:text-dnd"
                @click="copyJson"
              >
                复制 JSON
              </button>
              <button
                class="rounded-md border border-ink-600 px-3 py-1 text-xs text-parchment-200/70 hover:border-parchment-200"
                @click="jsonPreviewVisible = false"
              >
                关闭
              </button>
            </div>
          </div>

          <!-- JSON 内容 -->
          <div class="flex flex-1 overflow-hidden">
            <!-- Rule JSON -->
            <div class="flex-1 overflow-auto p-4">
              <div class="mb-2 text-[10px] uppercase tracking-wider text-parchment-200/40">
                Rule Schema（表单结构）
              </div>
              <pre class="rounded-lg bg-ink-900 p-3 text-[11px] leading-relaxed text-coc"><code>{{ jsonPreviewContent }}</code></pre>
            </div>
            <!-- Option JSON -->
            <div class="w-72 flex-shrink-0 overflow-auto border-l border-ink-700 p-4">
              <div class="mb-2 text-[10px] uppercase tracking-wider text-parchment-200/40">
                Option（表单配置）
              </div>
              <pre class="rounded-lg bg-ink-900 p-3 text-[11px] leading-relaxed text-dnd"><code>{{ optionPreviewContent }}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 保存到服务器弹窗 -->
    <transition name="fade">
      <div
        v-if="saveDialogVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/80 p-6 backdrop-blur"
        @click.self="saveDialogVisible = false"
      >
        <div
          class="w-full max-w-md overflow-hidden rounded-xl border border-ink-600 bg-ink-800 shadow-2xl"
        >
          <div class="flex items-center justify-between border-b border-ink-700 px-5 py-3">
            <div class="flex items-center gap-2">
              <span class="text-lg">☁️</span>
              <h3 class="font-cinzel text-sm font-semibold text-coc">保存为新规则到服务器</h3>
            </div>
            <button
              class="text-parchment-200/40 hover:text-parchment-200"
              @click="saveDialogVisible = false"
            >
              ✕
            </button>
          </div>
          <div class="space-y-4 p-5">
            <div>
              <label class="mb-1 block text-xs text-parchment-200/60">规则名称 *</label>
              <input
                v-model="saveFormName"
                type="text"
                class="w-full rounded-md bg-ink-900 px-3 py-2 text-sm text-parchment-200 ring-1 ring-ink-600 focus:outline-none focus:ring-coc"
                placeholder="例如：我的自定义规则"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs text-parchment-200/60">规则描述</label>
              <textarea
                v-model="saveFormDescription"
                rows="3"
                class="w-full rounded-md bg-ink-900 px-3 py-2 text-sm text-parchment-200 ring-1 ring-ink-600 focus:outline-none focus:ring-coc"
                placeholder="规则说明与字段介绍..."
              />
            </div>
            <div class="rounded-md bg-ink-900/60 p-3 text-[11px] text-parchment-200/50">
              ℹ️ 保存后将作为新规则出现在小程序端，与 COC、DND 等规则同级展示。
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button
                class="rounded-md border border-ink-600 px-4 py-2 text-xs text-parchment-200/70 hover:border-parchment-200/40"
                @click="saveDialogVisible = false"
              >
                取消
              </button>
              <button
                class="rounded-md bg-coc px-4 py-2 text-xs font-semibold text-ink-900 transition hover:brightness-110 disabled:opacity-50"
                :disabled="saving"
                @click="doSaveToServer"
              >
                {{ saving ? '保存中...' : '确认保存' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 已保存表单列表抽屉 -->
    <transition name="slide-right">
      <div
        v-if="savedListVisible"
        class="fixed inset-0 z-50 flex justify-end bg-ink-900/60 backdrop-blur-sm"
        @click.self="savedListVisible = false"
      >
        <div class="flex h-full w-full max-w-md flex-col bg-ink-800 shadow-2xl">
          <div class="flex items-center justify-between border-b border-ink-700 px-5 py-3">
            <div class="flex items-center gap-2">
              <span class="text-lg">📋</span>
              <h3 class="font-cinzel text-sm font-semibold text-dnd">服务器已保存规则</h3>
            </div>
            <button
              class="text-parchment-200/40 hover:text-parchment-200"
              @click="savedListVisible = false"
            >
              ✕
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-4">
            <div v-if="loadingSaved" class="py-10 text-center text-xs text-parchment-200/40">
              加载中...
            </div>
            <div
              v-else-if="!savedForms.length"
              class="py-10 text-center text-xs text-parchment-200/40"
            >
              服务器上还没有保存的规则
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="item in savedForms"
                :key="item.id"
                class="cursor-pointer rounded-lg bg-ink-900/60 p-3 ring-1 ring-ink-700 transition hover:ring-dnd/60"
                @click="loadSavedForm(item)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-base">📜</span>
                    <span
                      class="font-cinzel text-sm font-semibold"
                      :style="{ color: CUSTOM_COLOR }"
                    >
                      {{ item.name }}
                    </span>
                  </div>
                  <span class="text-[10px] text-parchment-200/40">
                    {{ item.fieldCount }} 字段
                  </span>
                </div>
                <p
                  v-if="item.description"
                  class="mt-1.5 line-clamp-2 text-[11px] text-parchment-200/50"
                >
                  {{ item.description }}
                </p>
                <div class="mt-2 flex items-center justify-between text-[10px] text-parchment-200/30">
                  <span>{{ new Date(item.updatedAt).toLocaleString('zh-CN') }}</span>
                  <span class="text-dnd">点击加载到设计器</span>
                </div>
              </div>
            </div>
          </div>
          <div class="border-t border-ink-700 p-3">
            <button
              class="w-full rounded-md border border-ink-600 py-2 text-xs text-parchment-200/70 hover:border-dnd hover:text-dnd"
              @click="openSavedList"
            >
              刷新列表
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast 提示 -->
    <transition name="slide-up">
      <div
        v-if="toast.visible"
        class="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink-700 px-5 py-2 text-sm text-parchment-200 shadow-xl ring-1 ring-dnd/40"
      >
        {{ toast.text }}
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
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}
.slide-right-enter-active,
.slide-right-leave-active {
  transition: opacity 0.25s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  opacity: 0;
}
.slide-right-enter-from > div,
.slide-right-leave-to > div {
  transform: translateX(100%);
  transition: transform 0.25s ease;
}

/* form-create-designer 主题色适配 */
:deep(.fc-designer-wrap) {
  --fc-primary: #c8a046;
  background: #0f0e0c;
}
</style>
