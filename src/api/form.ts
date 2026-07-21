// 表单 JSON 后端 API 客户端
// 通过 Vite 代理转发到 Express 后端服务（默认 http://localhost:3001）
import type {
  SavedForm,
  SavedFormItem,
  SaveFormPayload,
} from '@/types/saved-form'

const BASE = '/api'

// 统一响应格式
interface ApiResponse<T> {
  code: number
  message?: string
  data: T
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    throw new Error(`请求失败: ${res.status} ${res.statusText}`)
  }
  const json: ApiResponse<T> = await res.json()
  if (json.code !== 0) {
    throw new Error(json.message || '接口返回错误')
  }
  return json.data
}

// 健康检查
export function checkHealth(): Promise<{ ok: boolean; service: string; time: string }> {
  return request('/health')
}

// 获取已保存表单列表
export function listForms(): Promise<SavedFormItem[]> {
  return request<SavedFormItem[]>('/forms')
}

// 获取单个表单完整内容
export function getForm(id: string): Promise<SavedForm> {
  return request<SavedForm>(`/forms/${id}`)
}

// 保存（新建或更新）表单
export function saveForm(payload: SaveFormPayload): Promise<SavedForm> {
  return request<SavedForm>('/forms', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// 删除表单
export function deleteForm(id: string): Promise<{ code: number }> {
  return request<{ code: number }>(`/forms/${id}`, { method: 'DELETE' })
}
