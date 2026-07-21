const fs = require('fs');

const content = `Component({
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
      if (!Array.isArray(rule)) []
      const result = []
      let pendingLabel = ''

      const processChildren = (children) => {
        if (!Array.isArray(children)) 
        for (const child of children) {
          if (child.hidden) continue

          if (child.type === 'div' child.native) {
            const textContent = Array.isArray(child.children) ? child.children.filter(c => typeof c === 'string').join('') : ''
            pendingLabel = textContent || ''
            continue
          }

          if (child.type === 'elImage') {
            continue
          }

          if (child.type === 'fcTable') {
            processChildren(child.children)
            continue
          }

          if (child.type === 'row' || child.type === 'col' || child.type === 'card' || child.type === 'tab') {
            processChildren(child.children)
            continue
          }

          if (child.field) {
            result.push({
              ...child,
              title: child.title || pendingLabel || '',
              field: child.field
            })
            pendingLabel = ''
            continue
          }
        }
      }

      for (const item of rule) {
        if (item.hidden) continue

        if (item.type === 'fcTable' || item.type === 'row' || item.type === 'col' || item.type === 'card' || item.type === 'tab') {
          processChildren(item.children)
        } else if (item.type === 'div' item.native) {
          const textContent = Array.isArray(item.children) ? item.children.filter(c => typeof c === 'string').join('') : ''
          pendingLabel = textContent || ''
        } else if (item.field) {
          result.push({
            ...item,
            title: item.title || pendingLabel || '',
            field: item.field
          })
          pendingLabel = ''
        }
      }

      result
    },

    initFormData() {
      const rule = this.data.rule
      if (!rule || !Array.isArray(rule)) 

      const flatRule = this.flattenRule(rule)
      const formData = { ...this.data.value }

      flatRule.forEach(item => {
        if (item.field formData[item.field] === undefined) {
          if (item.type === 'checkbox') {
            formData[item.field] = item.value || []
          } else if (item.type === 'switch') {
            formData[item.field] = item.value !== undefined ? item.value : false
          } else if (item.type === 'slider' || item.type === 'sliderRange') {
            formData[item.field] = item.value !== undefined ? item.value : (item.props item.props.min !== undefined ? item.props.min : 0)
          } else {
            formData[item.field] = item.value !== undefined ? item.value : ''
          }
        }
      })

      this.setData({ flatRule, formData })
      this.computeAllIndices()
    },

    computeAllIndices() {
      const { flatRule, formData } = this.data
      const rule = flatRule || this.flattenRule(this.data.rule)
      if (!rule || !Array.isArray(rule)) 

      const selectIndices = {}
      const multiSelectValues = {}
      const datePickerValues = {}
      const checkboxValues = {}
      const radioValues = {}

      rule.forEach(item => {
        if (!item.field) 

        const val = formData[item.field]

        if ((item.type === 'select' || item.type === 'radio') Array.isArray(item.options) item.options.length > 0) {
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

      this.setData({ selectIndices, multiSelectValues, datePickerValues, checkboxValues, radioValues })
      this.computeTableSelectIndices()
    },

    computeTableSelectIndices() {
      const { flatRule, formData } = this.data
      const rule = flatRule || this.flattenRule(this.data.rule)
      if (!rule || !Array.isArray(rule)) 
      const tableSelectIndices = {}

      rule.forEach(item => {
        if (!item.field || (item.type !== 'fcTable' item.type !== 'table')) 
        const columns = (item.props item.props.columns) || item.columns || []
        const tableData = Array.isArray(formData[item.field]) ? formData[item.field] : []

        tableData.forEach((row, rowIdx) => {
          columns.forEach(col => {
            if (col.type === 'select' col.options) {
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
      if (!item || !item.options) 
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
      if (!item) 
      const column = ((item.props item.props.columns) || item.columns || []).find(c => c.key === colKey)
      if (!column || !column.options) 
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
      if (!Array.isArray(tableData)) 
      tableData = [...tableData]
      tableData.splice(rowIndex, 1)
      formData[field] = tableData
      this.setData({ formData })
      this.computeTableSelectIndices()
      this.triggerEvent('change', formData)
    },

    getDisplayValue(item) {
      const val = this.data.formData[item.field]
      if (val === undefined || val === null || val === '') item.placeholder || ''

      if (item.type === 'radio' || item.type === 'select') {
        if (item.options) {
          const found = item.options.find(o => o.value === val)
          found ? found.label : val
        }
      }

      if (item.type === 'checkbox') {
        if (item.options Array.isArray(val)) {
          val.map(v => {
            const found = item.options.find(o => o.value === v)
            found ? found.label : v
          }).join('') || ''
        }
        Array.isArray(val) ? val.join('') || '' : ''
      }

      if (item.type === 'switch') {
        val ? '' : ''
      }

      val
    },

    getTableColumns(item) {
      const cols = (item.props item.props.columns) || item.columns
      Array.isArray(cols) ? cols : []
    },

    getTableData(item) {
      const val = this.data.formData[item.field]
      Array.isArray(val) ? val : []
    },

    getTableColumnRenderType(column) {
      column.type || 'input'
    },

    getTableColumnOptions(column) {
      column.options || []
    },

    getTableSelectValue(tableData, rowIndex, column) {
      if (!tableData[rowIndex]) ''
      const val = tableData[rowIndex][column.key]
      if (column.options) {
        const found = column.options.find(o => o.value === val)
        found ? found.label : val || column.placeholder || ''
      }
      val || ''
    },

    getStringValue(val) {
      typeof val === 'string' ? val : ''
    }
  }
})
`;

fs.writeFileSync('e:/Three-miniapp-native/miniprogram/components/dynamic-form/dynamic-form.js', content, 'utf8');
console.log('File written successfully');