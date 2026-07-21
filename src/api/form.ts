// 表单 JSON 后端 API 客户端
// 通过 Vite 代理转发到 Express 后端服务（默认 http://localhost:3001）
import type {
  SavedForm,
  SavedFormItem,
  SaveFormPayload,
} from '@/types/saved-form'
import { loggerApi } from '@/utils/logger'

const BASE = '/api'

// 统一响应格式
interface ApiResponse<T> {
  code: number
  message?: string
  data: T
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  loggerApi.debug('request', { method: init?.method || 'GET', url })
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    loggerApi.error('request HTTP错误', { url, status: res.status, statusText: res.statusText })
    throw new Error(`请求失败: ${res.status} ${res.statusText}`)
  }
  const json: ApiResponse<T> = await res.json()
  if (json.code !== 0) {
    loggerApi.warn('request 业务错误', { url, code: json.code, message: json.message })
    throw new Error(json.message || '接口返回错误')
  }
  loggerApi.debug('request 成功', { url, dataKeys: Object.keys(json.data || {}) })
  return json.data
}

// 健康检查
export function checkHealth(): Promise<{ ok: boolean; service: string; time: string }> {
  return request('/health')
}

// 获取已保存表单列表
export function listForms(): Promise<SavedFormItem[]> {
  loggerApi.info('listForms')
  return request<SavedFormItem[]>('/forms')
}

// 获取单个表单完整内容
export function getForm(id: string): Promise<SavedForm> {
  loggerApi.info('getForm', { id })
  return request<SavedForm>(`/forms/${id}`)
}

// 保存（新建或更新）表单
export function saveForm(payload: SaveFormPayload): Promise<SavedForm> {
  loggerApi.info('saveForm', { name: payload.name, system: payload.system })
  return request<SavedForm>('/forms', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// 删除表单
export function deleteForm(id: string): Promise<{ code: number }> {
  loggerApi.info('deleteForm', { id })
  return request<{ code: number }>(`/forms/${id}`, { method: 'DELETE' })
}
