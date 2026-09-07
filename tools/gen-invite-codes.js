#!/usr/bin/env node
/**
 * 邀请码离线生成脚本（方案1）
 *
 * 用途：在本地电脑上批量生成邀请码，直接写入云数据库 invite_codes 集合。
 * 小程序端不含任何生成逻辑，管理员密钥也不会下发到客户端。
 *
 * 使用方法：
 *   1) 安装依赖： cd tools && npm install
 *   2) 配置腾讯云 API 密钥（二选一）：
 *      - 环境变量（Windows PowerShell）：
 *          $env:TCB_SECRET_ID="你的SecretId"
 *          $env:TCB_SECRET_KEY="你的SecretKey"
 *          $env:TCB_ENV_ID="cloud1-xxx"（可选）
 *      - 或在本目录创建 config.local.json（已被 gitignore 忽略）：
 *          { "secretId": "你的SecretId", "secretKey": "你的SecretKey", "envId": "cloud1-xxx" }
 *      （envId 可选，默认使用 DEFAULT_ENV_ID；密钥获取：腾讯云控制台 → 访问管理 → API密钥管理）
 *   3) 运行（示例）：
 *          node gen-invite-codes.js --count 10 --maxUses 1
 *      - --count   生成数量（默认 1，上限 100）
 *      - --maxUses 每个邀请码可用次数（默认 1）
 *      - --list    仅列出最近生成的邀请码（不生成新码）
 */

const fs = require('fs')
const path = require('path')
const tcb = require('@cloudbase/node-sdk')

// 默认环境 ID（环境 ID 非机密，可作兜底；可通过 TCB_ENV_ID 或 config.local.json 的 envId 覆盖）
const DEFAULT_ENV_ID = 'cloud1-d0gwarelhb75141fd'
const COLLECTION = 'invite_codes'
// 与云函数 auth/index.js 保持一致：去掉易混淆的 0/O/1/I
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

// 读取配置：优先环境变量，其次 config.local.json
function loadConfig() {
  let secretId = process.env.TCB_SECRET_ID
  let secretKey = process.env.TCB_SECRET_KEY
  let envId = process.env.TCB_ENV_ID

  const cfgPath = path.join(__dirname, 'config.local.json')
  if (fs.existsSync(cfgPath)) {
    const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'))
    secretId = secretId || cfg.secretId
    secretKey = secretKey || cfg.secretKey
    envId = envId || cfg.envId
  }

  if (!secretId || !secretKey) {
    throw new Error(
      '缺少腾讯云密钥：请设置环境变量 TCB_SECRET_ID / TCB_SECRET_KEY，' +
      '或在 tools 目录创建 config.local.json（{"secretId":"...","secretKey":"..."}）'
    )
  }
  return { secretId, secretKey, envId: envId || DEFAULT_ENV_ID }
}

function randomCode(len) {
  let s = ''
  for (let i = 0; i < len; i++) {
    s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return s
}

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2)
  const opts = { count: 1, maxUses: 1, list: false }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count') opts.count = parseInt(args[++i], 10) || 1
    else if (args[i] === '--maxUses') opts.maxUses = parseInt(args[++i], 10) || 1
    else if (args[i] === '--list') opts.list = true
  }
  opts.count = Math.min(Math.max(opts.count, 1), 100)
  opts.maxUses = Math.min(Math.max(opts.maxUses, 1), 999)
  return opts
}

async function main() {
  const { secretId, secretKey, envId } = loadConfig()
  const opts = parseArgs()

  const app = tcb.init({
    env: envId,
    secretId,
    secretKey
  })
  const db = app.database()

  // 确保集合存在（不存在则创建；已存在会抛错，忽略即可）
  try {
    await db.createCollection(COLLECTION)
    console.log(`已创建集合 ${COLLECTION}`)
  } catch (e) {
    // 集合已存在时这里会报错，属正常情况
  }

  const col = db.collection(COLLECTION)

  // 仅列出最近生成的邀请码
  if (opts.list) {
    const res = await col.orderBy('createdAt', 'desc').limit(20).get()
    const list = (res && res.data) || []
    console.log('最近生成的邀请码：')
    if (list.length === 0) console.log('  （暂无）')
    list.forEach((d) => {
      console.log(`  ${d.code}  已用 ${d.usedCount || 0}/${d.maxUses}`)
    })
    return
  }

  // 批量生成
  const codes = []
  const now = new Date().toISOString()
  for (let i = 0; i < opts.count; i++) {
    const code = 'TRPG-' + randomCode(6)
    await col.add({
      code,
      maxUses: opts.maxUses,
      usedCount: 0,
      usedBy: [],
      active: true,
      createdAt: now
    })
    codes.push(code)
  }

  console.log(`已生成 ${codes.length} 个邀请码（每个可用 ${opts.maxUses} 次）：`)
  codes.forEach((c) => console.log('  ' + c))
  console.log('\n请将以上邀请码线下发给需要注册的用户。')
}

main().catch((err) => {
  console.error('运行失败：', err && err.message ? err.message : err)
  process.exit(1)
})
