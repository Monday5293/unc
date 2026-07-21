// 表单 JSON 存储后端服务器
// 提供 form-create 设计的表单 JSON 的保存、列表、读取、删除接口
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 数据存储目录（保存上传的表单 JSON）
const DATA_DIR = path.join(__dirname, 'data', 'saved-forms')
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

// ====== API 路由 ======

/**
 * GET /api/health
 * 健康检查
 */
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'trpg-form-server', time: new Date().toISOString() })
})

/**
 * GET /api/forms
 * 获取所有已保存的表单 JSON 列表（不含 rule 主体，节省带宽）
 */
app.get('/api/forms', (req, res) => {
  try {
    const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'))
    const list = files.map((file) => {
      const raw = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8')
      const data = JSON.parse(raw)
      return {
        id: data.id,
        name: data.name,
        system: data.system,
        description: data.description,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        fieldCount: Array.isArray(data.rule) ? data.rule.length : 0,
      }
    })
    // 按更新时间倒序
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    res.json({ code: 0, data: list })
  } catch (e) {
    res.status(500).json({ code: 1, message: String(e) })
  }
})

/**
 * GET /api/forms/:id
 * 获取单个表单 JSON 完整内容（含 rule 主体）
 */
app.get('/api/forms/:id', (req, res) => {
  try {
    const file = path.join(DATA_DIR, `${req.params.id}.json`)
    if (!fs.existsSync(file)) {
      return res.status(404).json({ code: 1, message: '表单不存在' })
    }
    const raw = fs.readFileSync(file, 'utf-8')
    const data = JSON.parse(raw)
    res.json({ code: 0, data })
  } catch (e) {
    res.status(500).json({ code: 1, message: String(e) })
  }
})

/**
 * POST /api/forms
 * 保存（新建或更新）一个表单 JSON
 * body: { id?, name, system, description?, rule, option? }
 */
app.post('/api/forms', (req, res) => {
  try {
    const body = req.body || {}
    if (!body.name || !body.system || !Array.isArray(body.rule)) {
      return res
        .status(400)
        .json({ code: 1, message: '缺少必要字段：name / system / rule' })
    }
    const id = body.id || `form-${Date.now()}`
    const now = new Date().toISOString()
    // 若已存在，保留 createdAt
    const existFile = path.join(DATA_DIR, `${id}.json`)
    let createdAt = now
    if (fs.existsSync(existFile)) {
      try {
        const old = JSON.parse(fs.readFileSync(existFile, 'utf-8'))
        createdAt = old.createdAt || now
      } catch {
        /* ignore */
      }
    }
    const payload = {
      id,
      name: body.name,
      system: body.system,
      description: body.description || '',
      rule: body.rule,
      option: body.option || { submitBtn: false, resetBtn: false },
      createdAt,
      updatedAt: now,
    }
    fs.writeFileSync(path.join(DATA_DIR, `${id}.json`), JSON.stringify(payload, null, 2))
    res.json({ code: 0, data: { id, ...payload } })
  } catch (e) {
    res.status(500).json({ code: 1, message: String(e) })
  }
})

/**
 * DELETE /api/forms/:id
 * 删除一个表单 JSON
 */
app.delete('/api/forms/:id', (req, res) => {
  try {
    const file = path.join(DATA_DIR, `${req.params.id}.json`)
    if (fs.existsSync(file)) fs.unlinkSync(file)
    res.json({ code: 0 })
  } catch (e) {
    res.status(500).json({ code: 1, message: String(e) })
  }
})

/**
 * POST /api/download/json
 * 通用 JSON 文件下载接口
 * body: { filename?, data }
 * 用于绕过浏览器端 blob:/data: URL 的安全策略限制
 */
app.post('/api/download/json', (req, res) => {
  try {
    const body = req.body || {}
    const filename = body.filename || `download-${Date.now()}.json`
    const jsonData = body.data !== undefined ? body.data : body
    const jsonStr = typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData, null, 2)
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`)
    res.send(jsonStr)
  } catch (e) {
    res.status(500).json({ code: 1, message: String(e) })
  }
})

app.listen(PORT, () => {
  console.log(`[TRPG Form Server] running at http://localhost:${PORT}`)
})
