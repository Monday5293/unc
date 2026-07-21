// 管理从服务器读取的自定义表单
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SavedForm, SavedFormItem } from '@/types/saved-form'
import { listForms, getForm } from '@/api/form'
import { loggerCustomForms } from '@/utils/logger'

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
    loggerCustomForms.info('fetchList 开始')
    loading.value = true
    error.value = ''
    try {
      forms.value = await listForms()
      loggerCustomForms.info('fetchList 完成', { count: forms.value.length })
    } catch (e) {
      loggerCustomForms.error('fetchList 失败', e)
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  // 下载单个表单的完整 JSON（含 rule）
  async function downloadForm(id: string): Promise<SavedForm> {
    loggerCustomForms.info('downloadForm', { id, fromCache: !!cachedForms.value[id] })
    if (cachedForms.value[id]) {
      return cachedForms.value[id]
    }
    const form = await getForm(id)
    cachedForms.value[id] = form
    return form
  }

  // 清空缓存（例如刷新时）
  function clearCache() {
    loggerCustomForms.info('clearCache', { clearedCount: Object.keys(cachedForms.value).length })
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
