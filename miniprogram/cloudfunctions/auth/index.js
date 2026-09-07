const cloud = require('wx-server-sdk')
const crypto = require('crypto')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// ============ 配置 ============
// 注意：邀请码已改为「离线脚本生成 + 手动导入」，本函数只保留注册时的邀请码校验，
// 不再包含任何生成/查询邀请码的管理逻辑，管理员密钥也不下发到客户端。

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex')
}

exports.main = async (event, context) => {
  const { action, name, passwordHash, inviteCode } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) return { errMsg: '获取 openid 失败' }

  const usersCol = db.collection('users')
  const codesCol = db.collection('invite_codes')

  // check：按 name 全局查询，不绑定 _openid
  if (action === 'check') {
    if (!name) return { exists: false, name: '' }
    const userRes = await usersCol.where({ name: name }).get()
    const user = userRes.data[0]
    return { exists: !!user, name: user ? user.name : '' }
  }

  // register：按 name 全局唯一，需要邀请码
  if (action === 'register') {
    if (!name || !passwordHash) return { errMsg: '缺少参数' }
    if (!inviteCode) return { errMsg: '请输入邀请码' }

    // 1. 校验邀请码
    const codeRes = await codesCol.where({ code: inviteCode.trim().toUpperCase() }).get()
    const codeDoc = codeRes.data[0]
    if (!codeDoc || codeDoc.active === false) return { errMsg: '邀请码无效' }
    if ((codeDoc.usedCount || 0) >= (codeDoc.maxUses || 1)) return { errMsg: '邀请码已达到使用上限' }

    // 2. 校验昵称唯一
    const countRes = await usersCol.where({ name: name }).count()
    if (countRes.total > 0) return { errMsg: '该昵称已被注册' }

    // 3. 创建用户（盐值用 userId，改名不影响密码）
    const userId = 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    const hashed = sha256(passwordHash + userId)
    const now = new Date().toISOString()
    await usersCol.add({
      data: { name, passwordHash: hashed, userId, avatar: '', createdAt: now, updatedAt: now }
    })

    // 4. 更新邀请码使用记录
    await codesCol.doc(codeDoc._id).update({
      data: {
        usedCount: (codeDoc.usedCount || 0) + 1,
        usedBy: (codeDoc.usedBy || []).concat([userId])
      }
    })
    return { success: true, name, userId }
  }

  // login：按 name 全局查询，盐值为 userId
  if (action === 'login') {
    if (!name || !passwordHash) return { errMsg: '缺少参数' }
    const userRes = await usersCol.where({ name: name }).get()
    const user = userRes.data[0]
    if (!user) return { errMsg: '账号不存在，请先注册' }
    const hashed = sha256(passwordHash + user.userId)
    if (hashed !== user.passwordHash) return { errMsg: '密码错误' }
    return { success: true, name: user.name, userId: user.userId }
  }

  // updateName：修改昵称，校验新昵称不重复（密码盐值基于 userId，不受改名影响）
  if (action === 'updateName') {
    const { userId, newName } = event
    if (!userId || !newName) return { errMsg: '缺少参数' }
    // 统计除当前用户外，占用 newName 的用户数（避免把「自己保留原名」误判为重复）
    const countRes = await usersCol.where({ name: newName, userId: _.neq(userId) }).count()
    if (countRes.total > 0) return { errMsg: '该昵称已被使用' }
    await usersCol.where({ userId }).update({
      data: { name: newName, updatedAt: new Date().toISOString() }
    })
    return { success: true, name: newName }
  }

  return { errMsg: '未知操作' }
}
