const BASE_URL = 'http://localhost:3001/api'

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const data = res.data
          if (data.code === 0) {
            resolve(data.data)
          } else {
            reject(new Error(data.message || '接口返回错误'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '网络请求失败'))
      }
    })
  })
}

function listForms() {
  return request('/forms')
}

function getForm(id) {
  return request(`/forms/${id}`)
}

function saveForm(payload) {
  return request('/forms', {
    method: 'POST',
    data: payload
  })
}

function deleteForm(id) {
  return request(`/forms/${id}`, {
    method: 'DELETE'
  })
}

function checkHealth() {
  return request('/health')
}

module.exports = {
  listForms,
  getForm,
  saveForm,
  deleteForm,
  checkHealth
}
