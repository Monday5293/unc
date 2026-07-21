Component({
  properties: {
    rule: {
      type: Array,
      value: []
    },
    value: {
      type: Object,
      value: {}
    }
  },

  data: {
    formData: {},
    flatRule: [],
    selectIndices: {},
    multiSelectValues: {},
    datePickerValues: {},
    checkboxValues: {},
    radioValues: {},
    tableSelectIndices: {}
  },

  observers: {
    'value': function(val) {
      const formData = { ...val }
      this.setData({ formData })
      this.computeAllIndices()
    },
    'rule': function() {
      this.initFormData()
    }
  },

  lifetimes: {
    attached() {
      this.initFormData()
    }
  },

  methods: {
    flattenRule(rule) {
      if (!Array.isArray(rule)) return []
      const result = []
      let pendingLabel = ''
      let keyCounter = 0
      const nextKey = () => 'k' + (keyCounter++)

      const processChildren = (children) => {
        if (!Array.isArray(children)) return
        for (const child of children) {
          if (!child) continue
          if (child.hidden) continue

          if (child.type === 'div' && child.native) {
            const textContent = Array.isArray(child.children) ? child.children.filter(c => typeof c === 'string').join('') : ''
            pendingLabel = textContent || ''
            continue
          }

          if (child.type === 'elImage') {
            result.push({
              type: 'elImage',
              _isImage: true,
              _key: child._fc_id || child.name || nextKey(),
              src: (child.props && child.props.src) || '',
              style: child.style || {},
              _styleStr: this.styleObjToCss(child.style || {}),
              title: child.title || pendingLabel || '',
              field: child.field || ''
            })
            pendingLabel = ''
            continue
          }

          if (child.type === 'fcTable' || child.type === 'table') {
            const hasSlotChildren = Array.isArray(child.children) && child.children.some(c => c && c.slot)
            if (hasSlotChildren) {
              // 布局网格容器：保留整体结构，预处理子元素
              const gridInfo = this.processGridChildren(child.children, child.props, nextKey)
              result.push({
                ...child,
                _key: child._fc_id || child.name || nextKey(),
                _isLayoutGrid: true,
                _gridRows: gridInfo.rows,
                _gridCols: gridInfo.cols,
                _gridCells: gridInfo.cells
              })
            } else {
              processChildren(child.children)
            }
            continue
          }

          if (child.type === 'row' || child.type === 'col' || child.type === 'card' || child.type === 'tab') {
            processChildren(child.children)
            continue
          }

          if (child.field) {
            result.push({
              ...child,
              _key: child._fc_id || child.name || nextKey(),
              title: child.title || pendingLabel || '',
              field: child.field,
              _styleStr: this.styleObjToCss(child.style || {})
            })
            pendingLabel = ''
            continue
          }
        }
      }

      for (const item of rule) {
        if (!item) continue
        if (item.hidden) continue

        if (item.type === 'fcTable' || item.type === 'table') {
          const hasSlotChildren = Array.isArray(item.children) && item.children.some(c => c && c.slot)
          if (hasSlotChildren) {
            // 布局网格容器：保留整体结构，预处理子元素
            const gridInfo = this.processGridChildren(item.children, item.props, nextKey)
            result.push({
              ...item,
              _key: item._fc_id || item.name || nextKey(),
              _isLayoutGrid: true,
              _gridRows: gridInfo.rows,
              _gridCols: gridInfo.cols,
              _gridCells: gridInfo.cells
            })
          } else {
            // 数据表格：保持原样
            result.push({
              ...item,
              _key: item._fc_id || item.name || nextKey()
            })
          }
          pendingLabel = ''
          continue
        }

        if (item.type === 'fcRow') {
          // 处理栅格行布局
          const rowLayout = this.processRowChildren(item.children, nextKey)
          if (rowLayout.cols.length > 0) {
            result.push({
              type: 'fcRow',
              _key: item._fc_id || item.name || nextKey(),
              _isRow: true,
              _rowCols: rowLayout.cols
            })
          }
          pendingLabel = ''
          continue
        }

        if (item.type === 'row' || item.type === 'col' || item.type === 'card' || item.type === 'tab') {
          processChildren(item.children)
        } else if (item.type === 'div' && item.native) {
          const textContent = Array.isArray(item.children) ? item.children.filter(c => typeof c === 'string').join('') : ''
          pendingLabel = textContent || ''
        } else if (item.field) {
          result.push({
            ...item,
            _key: item._fc_id || item.name || nextKey(),
            title: item.title || pendingLabel || '',
            field: item.field,
            _styleStr: this.styleObjToCss(item.style || {})
          })
          pendingLabel = ''
        }
      }

      return result
    },

    /**
     * 预处理 fcTable 布局网格的子元素，递归处理嵌套 fcTable
     * 返回 { rows, cols, cells }
     */
    processGridChildren(children, props, nextKey) {
      if (!Array.isArray(children)) return { rows: 1, cols: 1, cells: [] }
      const rule = props && props.rule
      const rows = rule ? (rule.row || 1) : 1
      const cols = rule ? (rule.col || 1) : 1
      const keyFn = nextKey || (() => 'gk' + (Math.random().toString(36).slice(2)))

      const cells = []
      for (const child of children) {
        if (!child || child.hidden) continue
        const slot = child.slot || '0:0'
        const [row, col] = slot.split(':').map(Number)

        // 合并单元格样式：child.style + grid rule.style[slot]
        const childStyle = { ...(child.style || {}) }
        if (rule && rule.style && rule.style[slot]) {
          Object.assign(childStyle, rule.style[slot])
        }

        const cell = {
          _key: child._fc_id || child.name || slot + '_' + keyFn(),
          row: row || 0,
          col: col || 0,
          slot: slot,
          type: child.type,
          field: child.field || '',
          title: child.title || '',
          placeholder: (child.props && child.props.placeholder) || '',
          _isLayoutGrid: false,
          _gridRows: 1,
          _gridCols: 1,
          _gridCells: [],
          text: '',
          style: childStyle,
          _styleStr: this.styleObjToCss(childStyle)
        }

        // 处理嵌套 fcTable
        if (child.type === 'fcTable' || child.type === 'table') {
          const nestedInfo = this.processGridChildren(child.children, child.props, keyFn)
          cell._isLayoutGrid = true
          cell._gridRows = nestedInfo.rows
          cell._gridCols = nestedInfo.cols
          cell._gridCells = nestedInfo.cells
        } else if (child.type === 'div' && child.native) {
          // 纯文本 div
          cell.text = Array.isArray(child.children) ? child.children.filter(c => typeof c === 'string').join('') : ''
          cell.type = 'text'
        } else if (child.type === 'elImage') {
          // 图片组件
          cell.type = 'elImage'
          cell._isImage = true
          cell.src = (child.props && child.props.src) || ''
          cell.style = child.style || {}
        } else if (child.type === 'inputNumber') {
          // 计数器组件
          cell.type = 'inputNumber'
          cell._isCounter = true
          cell.props = child.props || {}
          // 确保 formData 有初始值
          const formData = this.data.formData
          if (cell.field && formData[cell.field] === undefined) {
            formData[cell.field] = 0
          }
        }

        cells.push(cell)
      }

      return { rows, cols, cells }
    },

    /**
     * 预处理 fcRow 栅格布局的子元素
     * 返回 { cols: [{ span, items }] }
     */
    processRowChildren(children, nextKey) {
      if (!Array.isArray(children)) return { cols: [] }
      const cols = []
      const keyFn = nextKey || (() => 'rk' + (Math.random().toString(36).slice(2)))

      for (const col of children) {
        if (!col || col.hidden) continue
        const span = (col.props && col.props.span) || 12
        const colItems = []
        let pendingLabel = ''

        const processItems = (items) => {
          if (!Array.isArray(items)) return
          for (const item of items) {
            if (!item || item.hidden) continue

            if (item.type === 'div' && item.native) {
              const textContent = Array.isArray(item.children) ? item.children.filter(c => typeof c === 'string').join('') : ''
              pendingLabel = textContent || ''
              continue
            }

            if (item.type === 'elImage') {
              colItems.push({
                _key: item._fc_id || item.name || keyFn(),
                type: 'elImage',
                _isImage: true,
                src: (item.props && item.props.src) || '',
                style: item.style || {},
                _styleStr: this.styleObjToCss(item.style || {}),
                field: item.field || ''
              })
              pendingLabel = ''
              continue
            }

            if (item.type === 'fcTable' || item.type === 'table') {
              const hasSlotChildren = Array.isArray(item.children) && item.children.some(c => c && c.slot)
              if (hasSlotChildren) {
                const gridInfo = this.processGridChildren(item.children, item.props, keyFn)
                colItems.push({
                  _key: item._fc_id || item.name || keyFn(),
                  type: 'fcTable',
                  _isLayoutGrid: true,
                  _gridRows: gridInfo.rows,
                  _gridCols: gridInfo.cols,
                  _gridCells: gridInfo.cells,
                  field: item.field || ''
                })
              } else {
                colItems.push({
                  _key: item._fc_id || item.name || keyFn(),
                  ...item
                })
              }
              pendingLabel = ''
              continue
            }

            if (item.field) {
              colItems.push({
                _key: item._fc_id || item.name || keyFn(),
                ...item,
                title: item.title || pendingLabel || '',
                field: item.field,
                _styleStr: this.styleObjToCss(item.style || {})
              })
              pendingLabel = ''
            }
          }
        }

        processItems(col.children)
        cols.push({ span, items: colItems, _key: col._fc_id || col.name || keyFn() })
      }

      return { cols }
    },

    /**
     * 将 style 对象转为 CSS 内联样式字符串
     */
    styleObjToCss(style) {
      if (!style || typeof style !== 'object') return ''
      return Object.entries(style)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => {
          // 将 camelCase 转为 kebab-case
          const cssKey = k.replace(/([A-Z])/g, '-$1').toLowerCase()
          return `${cssKey}: ${v}`
        })
        .join('; ')
    },

    /**
     * 递归初始化 formData 字段
     */
    _initField(formData, field, type, item) {
      if (!field || formData[field] !== undefined) return
      if (type === 'inputNumber') {
        formData[field] = (item && item.value !== undefined) ? item.value : 0
      } else if (type === 'checkbox') {
        formData[field] = (item && item.value) || []
      } else if (type === 'switch') {
        formData[field] = (item && item.value !== undefined) ? item.value : false
      } else if (type === 'slider' || type === 'sliderRange') {
        formData[field] = (item && item.value !== undefined) ? item.value : ((item && item.props && item.props.min !== undefined) ? item.props.min : 0)
      } else {
        formData[field] = (item && item.value !== undefined) ? item.value : ''
      }
    },

    /**
     * 递归初始化 grid cells 中的字段
     */
    _initGridCells(formData, cells) {
      if (!Array.isArray(cells)) return
      cells.forEach(cell => {
        this._initField(formData, cell.field, cell.type, cell)
        if (cell._isLayoutGrid && Array.isArray(cell._gridCells)) {
          this._initGridCells(formData, cell._gridCells)
        }
      })
    },

    initFormData() {
      const rule = this.data.rule
      if (!rule || !Array.isArray(rule)) return

      const flatRule = this.flattenRule(rule)
      const formData = { ...this.data.value }

      flatRule.forEach(item => {
        this._initField(formData, item.field, item.type, item)

        // 初始化 grid cell 字段
        if (item._isLayoutGrid && Array.isArray(item._gridCells)) {
          this._initGridCells(formData, item._gridCells)
        }

        // 初始化 fcRow 子元素字段
        if (item._isRow && Array.isArray(item._rowCols)) {
          item._rowCols.forEach(col => {
            if (Array.isArray(col.items)) {
              col.items.forEach(colItem => {
                this._initField(formData, colItem.field, colItem.type, colItem)
                if (colItem._isLayoutGrid && Array.isArray(colItem._gridCells)) {
                  this._initGridCells(formData, colItem._gridCells)
                }
              })
            }
          })
        }
      })

      this.setData({ flatRule, formData })
      this.computeAllIndices()
    },

    computeAllIndices() {
      const { flatRule, formData } = this.data
      const rule = flatRule || this.flattenRule(this.data.rule)
      if (!rule || !Array.isArray(rule)) return

      const selectIndices = {}
      const datePickerValues = {}
      const checkboxValues = {}
      const radioValues = {}

      rule.forEach(item => {
        if (!item.field) return

        const val = formData[item.field]

        if ((item.type === 'select' || item.type === 'radio') && Array.isArray(item.options) && item.options.length > 0) {
          const idx = item.options.findIndex(o => o.value === val)
          selectIndices[item.field] = idx >= 0 ? idx : 0
        }

        if (item.type === 'datePicker' || item.type === 'date' || item.type === 'dateRange' ||
            item.type === 'dateTime' || item.type === 'dateTimeRange' || item.type === 'year' || item.type === 'month') {
          datePickerValues[item.field] = val || ''
        }

        if (item.type === 'checkbox') {
          checkboxValues[item.field] = Array.isArray(val) ? val : []
        }

        if (item.type === 'radio') {
          radioValues[item.field] = val || ''
        }
      })

      this.setData({ selectIndices, datePickerValues, checkboxValues, radioValues })
      this.computeTableSelectIndices()
    },

    computeTableSelectIndices() {
      const { flatRule, formData } = this.data
      const rule = flatRule || this.flattenRule(this.data.rule)
      if (!rule || !Array.isArray(rule)) return
      const tableSelectIndices = {}

      rule.forEach(item => {
        if (!item.field || (item.type !== 'fcTable' && item.type !== 'table')) return
        const columns = (item.props && item.props.columns) || item.columns || []
        const tableData = Array.isArray(formData[item.field]) ? formData[item.field] : []

        tableData.forEach((row, rowIdx) => {
          columns.forEach(col => {
            if (col.type === 'select' && col.options) {
              const key = item.field + '_' + rowIdx + '_' + col.key
              const val = row[col.key]
              const idx = col.options.findIndex(o => o.value === val)
              tableSelectIndices[key] = idx >= 0 ? idx : 0
            }
          })
        })
      })

      this.setData({ tableSelectIndices })
    },

    onFieldInput(e) {
      const field = e.currentTarget.dataset.field
      const parentField = e.currentTarget.dataset.parentField
      const value = e.detail.value
      const formData = { ...this.data.formData }

      if (parentField) {
        if (!formData[parentField] || typeof formData[parentField] !== 'object') {
          formData[parentField] = {}
        }
        formData[parentField] = { ...formData[parentField], [field]: value }
      } else {
        formData[field] = value
      }

      this.setData({ formData })
      this.triggerEvent('change', formData)
    },

    onSelectChange(e) {
      const field = e.currentTarget.dataset.field
      const idx = e.detail.value
      const item = this.data.flatRule.find(r => r.field === field)
      if (!item || !item.options) return
      const value = item.options[idx] ? item.options[idx].value : ''
      const formData = { ...this.data.formData }
      formData[field] = value
      const selectIndices = { ...this.data.selectIndices }
      selectIndices[field] = parseInt(idx, 10)
      this.setData({ formData, selectIndices })
      this.triggerEvent('change', formData)
    },

    onRadioChange(e) {
      const field = e.currentTarget.dataset.field
      const value = e.currentTarget.dataset.value
      const formData = { ...this.data.formData }
      formData[field] = value
      const radioValues = { ...this.data.radioValues }
      radioValues[field] = value
      this.setData({ formData, radioValues })
      this.triggerEvent('change', formData)
    },

    onCheckboxChange(e) {
      const field = e.currentTarget.dataset.field
      const value = e.currentTarget.dataset.value
      let checkboxValues = { ...this.data.checkboxValues }
      let current = checkboxValues[field] || []
      const idx = current.indexOf(value)
      if (idx >= 0) {
        current = current.filter(v => v !== value)
      } else {
        current = [...current, value]
      }
      checkboxValues[field] = current
      const formData = { ...this.data.formData }
      formData[field] = current
      this.setData({ formData, checkboxValues })
      this.triggerEvent('change', formData)
    },

    onSwitchChange(e) {
      const field = e.currentTarget.dataset.field
      const value = e.detail.value
      const formData = { ...this.data.formData }
      formData[field] = value
      this.setData({ formData })
      this.triggerEvent('change', formData)
    },

    onSliderChange(e) {
      const field = e.currentTarget.dataset.field
      const value = e.detail.value
      const formData = { ...this.data.formData }
      formData[field] = value
      this.setData({ formData })
      this.triggerEvent('change', formData)
    },

    onDatePickerChange(e) {
      const field = e.currentTarget.dataset.field
      const value = e.detail.value
      const formData = { ...this.data.formData }
      formData[field] = value
      const datePickerValues = { ...this.data.datePickerValues }
      datePickerValues[field] = value
      this.setData({ formData, datePickerValues })
      this.triggerEvent('change', formData)
    },

    onTableCellInput(e) {
      const { rowIndex, colKey } = e.currentTarget.dataset
      const value = e.detail.value
      const field = e.currentTarget.dataset.tableField
      const formData = { ...this.data.formData }
      let tableData = formData[field]
      if (!Array.isArray(tableData)) tableData = []
      tableData = [...tableData]
      if (!tableData[rowIndex]) tableData[rowIndex] = {}
      tableData[rowIndex] = { ...tableData[rowIndex], [colKey]: value }
      formData[field] = tableData
      this.setData({ formData })
      this.computeTableSelectIndices()
      this.triggerEvent('change', formData)
    },

    onTableSelectChange(e) {
      const { rowIndex, colKey } = e.currentTarget.dataset
      const idx = e.detail.value
      const field = e.currentTarget.dataset.tableField
      const item = this.data.flatRule.find(r => r.field === field)
      if (!item) return
      const column = ((item.props && item.props.columns) || item.columns || []).find(c => c.key === colKey)
      if (!column || !column.options) return
      const value = column.options[idx] ? column.options[idx].value : ''

      const formData = { ...this.data.formData }
      let tableData = formData[field]
      if (!Array.isArray(tableData)) tableData = []
      tableData = [...tableData]
      if (!tableData[rowIndex]) tableData[rowIndex] = {}
      tableData[rowIndex] = { ...tableData[rowIndex], [colKey]: value }
      formData[field] = tableData
      this.setData({ formData })
      this.computeTableSelectIndices()
      this.triggerEvent('change', formData)
    },

    addTableRow(e) {
      const field = e.currentTarget.dataset.field
      const formData = { ...this.data.formData }
      let tableData = formData[field]
      if (!Array.isArray(tableData)) tableData = []
      tableData = [...tableData, {}]
      formData[field] = tableData
      this.setData({ formData })
      this.computeTableSelectIndices()
      this.triggerEvent('change', formData)
    },

    removeTableRow(e) {
      const { field, rowIndex } = e.currentTarget.dataset
      const formData = { ...this.data.formData }
      let tableData = formData[field]
      if (!Array.isArray(tableData)) return
      tableData = [...tableData]
      tableData.splice(rowIndex, 1)
      formData[field] = tableData
      this.setData({ formData })
      this.computeTableSelectIndices()
      this.triggerEvent('change', formData)
    },

    getDisplayValue(item) {
      const val = this.data.formData[item.field]
      if (val === undefined || val === null || val === '') return item.placeholder || ''

      if (item.type === 'radio' || item.type === 'select') {
        if (item.options) {
          const found = item.options.find(o => o.value === val)
          return found ? found.label : val
        }
      }

      if (item.type === 'checkbox') {
        if (item.options && Array.isArray(val)) {
          return val.map(v => {
            const found = item.options.find(o => o.value === v)
            return found ? found.label : v
          }).join('') || ''
        }
        return Array.isArray(val) ? val.join('') || '' : ''
      }

      if (item.type === 'switch') {
        return val ? '' : ''
      }

      return val
    },

    getTableColumns(item) {
      const cols = (item.props && item.props.columns) || item.columns
      return Array.isArray(cols) ? cols : []
    },

    getTableData(item) {
      const val = this.data.formData[item.field]
      return Array.isArray(val) ? val : []
    },

    getTableColumnRenderType(column) {
      return column.type || 'input'
    },

    getTableColumnOptions(column) {
      return column.options || []
    },

    getTableSelectValue(tableData, rowIndex, column) {
      if (!tableData[rowIndex]) return ''
      const val = tableData[rowIndex][column.key]
      if (column.options) {
        const found = column.options.find(o => o.value === val)
        return found ? found.label : val || column.placeholder || ''
      }
      return val || ''
    },

    getStringValue(val) {
      return typeof val === 'string' ? val : ''
    },

    onCounterChange(e) {
      const field = e.currentTarget.dataset.field
      const delta = parseInt(e.currentTarget.dataset.delta, 10) || 0
      const formData = { ...this.data.formData }
      const current = parseFloat(formData[field]) || 0
      formData[field] = current + delta
      this.setData({ formData })
      this.triggerEvent('change', formData)
    }
  }
})