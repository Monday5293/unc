const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { action, userId, cardId, card, cards } = event
  if (!userId) return { errMsg: '缺少 userId' }

  const col = db.collection('cards')

  if (action === 'sync') {
    const res = await col.where({ userId }).orderBy('createdAt', 'desc').get()
    return { success: true, data: res.data }
  }

  if (action === 'add') {
    if (!card) return { errMsg: '缺少卡片数据' }
    await col.add({ data: { ...card, userId } })
    return { success: true }
  }

  if (action === 'update') {
    if (!cardId) return { errMsg: '缺少 cardId' }
    await col.where({ cardId, userId }).update({ data: { ...card, updatedAt: new Date().toISOString() } })
    return { success: true }
  }

  if (action === 'delete') {
    if (!cardId) return { errMsg: '缺少 cardId' }
    await col.where({ cardId, userId }).remove()
    return { success: true }
  }

  if (action === 'migrate') {
    if (!cards || !cards.length) return { success: true }
    for (const c of cards) {
      await col.add({ data: { ...c, userId } })
    }
    return { success: true }
  }

  return { errMsg: '未知操作' }
}