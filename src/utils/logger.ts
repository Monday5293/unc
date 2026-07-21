/**
 * 统一日志工具
 * 为所有核心模块提供带命名空间的 console 日志输出
 * 生产环境可通过设置 LOG_LEVEL 控制输出级别
 */

// ==================== 日志级别 ====================
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// 当前日志级别（可通过 localStorage 设置 trpg-log-level 覆盖）
const CURRENT_LEVEL: LogLevel =
  (typeof localStorage !== 'undefined' && (localStorage.getItem('trpg-log-level') as LogLevel)) ||
  'info'

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LEVEL]
}

// ==================== Logger 工厂 ====================

export interface Logger {
  debug: (msg: string, ...data: unknown[]) => void
  info: (msg: string, ...data: unknown[]) => void
  warn: (msg: string, ...data: unknown[]) => void
  error: (msg: string, ...data: unknown[]) => void
}

/**
 * 创建带命名空间的日志记录器
 * @param namespace - 模块名（如 'Store:cards'）
 * @returns Logger 实例
 */
export function createLogger(namespace: string): Logger {
  const prefix = `[${namespace}]`

  return {
    debug(msg: string, ...data: unknown[]) {
      if (shouldLog('debug')) {
        console.debug(`${prefix} ${msg}`, ...data)
      }
    },
    info(msg: string, ...data: unknown[]) {
      if (shouldLog('info')) {
        console.info(`${prefix} ${msg}`, ...data)
      }
    },
    warn(msg: string, ...data: unknown[]) {
      if (shouldLog('warn')) {
        console.warn(`${prefix} ${msg}`, ...data)
      }
    },
    error(msg: string, ...data: unknown[]) {
      if (shouldLog('error')) {
        console.error(`${prefix} ${msg}`, ...data)
      }
    },
  }
}

// ==================== 预设 Logger 实例 ====================

/** 角色卡 Store 日志 */
export const loggerCards = createLogger('Store:cards')
/** 自定义表单 Store 日志 */
export const loggerCustomForms = createLogger('Store:customForms')
/** 表单 API 日志 */
export const loggerApi = createLogger('API:form')
/** 路由日志 */
export const loggerRouter = createLogger('Router')
/** 预览统计日志 */
export const loggerPreviewStats = createLogger('PreviewStats')
/** 页面日志 */
export const loggerPage = (name: string) => createLogger(`Page:${name}`)
/** 组件日志 */
export const loggerComp = (name: string) => createLogger(`Comp:${name}`)