const themeUtil = require('../../utils/theme.js')

Page({
  data: {
    inputValue: '',
    todos: [],
    completedCount: 0
  },

  onLoad() {
    this.db = null
    this._initDb()
    this.loadTodos()
  },

  onShow() {
    themeUtil.applyToPage(this)
    this.loadTodos()
  },

  _initDb() {
    try {
      if (wx.cloud) {
        this.db = wx.cloud.database()
        console.log('[todo] cloud database initialized')
      } else {
        console.warn('[todo] wx.cloud not available')
      }
    } catch (e) {
      console.error('[todo] init db error:', e)
    }
  },

  loadTodos() {
    if (!this.db) {
      console.warn('[todo] db not ready, retry init')
      this._initDb()
      if (!this.db) return
    }
    var that = this
    this.db.collection('todos')
      .orderBy('createdAt', 'desc')
      .get()
      .then(function (res) {
        console.log('[todo] loadTodos success, count:', res.data.length)
        var completedCount = 0
        for (var i = 0; i < res.data.length; i++) {
          if (res.data[i].completed) completedCount++
        }
        that.setData({
          todos: res.data,
          completedCount: completedCount
        })
      })
      .catch(function (err) {
        console.error('[todo] loadTodos error:', err)
        wx.showToast({ title: '加载失败', icon: 'none' })
      })
  },

  onInput(e) {
    this.setData({ inputValue: e.detail.value })
  },

  addTodo() {
    var title = this.data.inputValue.trim()
    if (!title) return
    if (!this.db) {
      wx.showToast({ title: '数据库未就绪', icon: 'none' })
      return
    }
    var that = this
    var now = new Date().toISOString()
    this.db.collection('todos').add({
      data: {
        title: title,
        completed: false,
        createdAt: now,
        updatedAt: now
      }
    }).then(function (res) {
      console.log('[todo] addTodo success, id:', res._id)
      that.setData({ inputValue: '' })
      that.loadTodos()
    }).catch(function (err) {
      console.error('[todo] addTodo error:', err)
      wx.showToast({ title: '添加失败', icon: 'none' })
    })
  },

  toggleTodo(e) {
    var id = e.currentTarget.dataset.id
    if (!id || !this.db) return
    var item = null
    for (var i = 0; i < this.data.todos.length; i++) {
      if (this.data.todos[i]._id === id) {
        item = this.data.todos[i]
        break
      }
    }
    if (!item) return
    var newCompleted = !item.completed
    var that = this
    this.db.collection('todos').doc(id).update({
      data: {
        completed: newCompleted,
        updatedAt: new Date().toISOString()
      }
    }).then(function (res) {
      console.log('[todo] toggleTodo result:', res)
      if (res.stats && res.stats.updated > 0) {
        that.loadTodos()
      } else {
        // 乐观更新
        var todos = that.data.todos
        for (var i = 0; i < todos.length; i++) {
          if (todos[i]._id === id) {
            todos[i].completed = newCompleted
            break
          }
        }
        var completedCount = 0
        for (var i = 0; i < todos.length; i++) {
          if (todos[i].completed) completedCount++
        }
        that.setData({ todos: todos, completedCount: completedCount })
      }
    }).catch(function (err) {
      console.error('[todo] toggleTodo error:', err)
      wx.showToast({ title: '操作失败', icon: 'none' })
    })
  },

  deleteTodo(e) {
    var id = e.currentTarget.dataset.id
    if (!id || !this.db) return
    var that = this
    wx.showModal({
      title: '删除确认',
      content: '确定要删除这条待办事项吗？',
      success: function (modalRes) {
        if (modalRes.confirm) {
          that.db.collection('todos').doc(id).remove()
            .then(function (res) {
              console.log('[todo] deleteTodo result:', res)
              if (res.stats && res.stats.removed > 0) {
                that.loadTodos()
              } else {
                // 乐观删除
                var todos = that.data.todos.filter(function (t) { return t._id !== id })
                var completedCount = 0
                for (var i = 0; i < todos.length; i++) {
                  if (todos[i].completed) completedCount++
                }
                that.setData({ todos: todos, completedCount: completedCount })
              }
            })
            .catch(function (err) {
              console.error('[todo] deleteTodo error:', err)
              wx.showToast({ title: '删除失败', icon: 'none' })
            })
        }
      }
    })
  }
})