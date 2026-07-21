// 管理从服务器读取的自定义表单
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SavedForm, SavedFormItem } from '@/types/saved-form'
import { listForms, getForm } from '@/api/form'

export const useCustomFormStore = defineStore('customForms', () => {
  // 服务器上的表单列表
  const forms = ref<SavedFormItem[]>([])
  // 加载状态
  const loading = ref(false)
  // 错误信息
  const error = ref('')
  // 已下载到本地的完整表单（缓存，避免重复请求）
  const cachedForms = ref<Record<string, SavedForm>>({})

  // 从服务器拉取表单列表
  async function fetchList() {
    loading.value = true
    error.value = ''
    try {
      forms.value = await listForms()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  // 下载单个表单的完整 JSON（含 rule）
  async function downloadForm(id: string): Promise<SavedForm> {
    if (cachedForms.value[id]) {
      return cachedForms.value[id]
    }
    const form = await getForm(id)
    cachedForms.value[id] = form
    return form
  }

  // 清空缓存（例如刷新时）
  function clearCache() {
    cachedForms.value = {}
  }

  return {
    forms,
    loading,
    error,
    cachedForms,
    fetchList,
    downloadForm,
    clearCache,
  }
})
