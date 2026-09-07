const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { code } = event
  if (!code) {
    return { errMsg: '缺少手机号凭证 code' }
  }
  try {
    const res = await cloud.openapi.phonenumber.getPhoneNumber({ code })
    console.log('[getPhoneNumber] success:', res.phoneInfo.purePhoneNumber)
    return res.phoneInfo
  } catch (err) {
    console.error('[getPhoneNumber] error:', err)
    return { errMsg: err.message || '获取手机号失败' }
  }
}