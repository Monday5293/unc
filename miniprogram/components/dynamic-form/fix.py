import sys
f = open(r"e:\Three-miniapp-native\miniprogram\components\dynamic-form\dynamic-form.js", "r", encoding="utf-8")
content = f.read()
f.close()

ret = chr(114) + chr(101) + chr(116) + chr(117) + chr(114) + chr(110)
andand = chr(38) + chr(38)

# Fix missing return before []
content = content.replace("if (!Array.isArray(rule)) []", "if (!Array.isArray(rule)) " + ret + " []")

# Fix missing return after if (!Array.isArray(children))
content = content.replace("if (!Array.isArray(children))", "if (!Array.isArray(children)) " + ret)

# Fix missing after 'div' and child.native
content = content.replace("'div' child.native", "'div' " + andand + " child.native")
content = content.replace("'div' item.native", "'div' " + andand + " item.native")

# Fix missing return after if (!rule || !Array.isArray(rule))
content = content.replace("if (!rule || !Array.isArray(rule))", "if (!rule || !Array.isArray(rule)) " + ret)

# Fix missing return after if (!item.field)
content = content.replace("if (!item.field)", "if (!item.field) " + ret)

# Fix missing in select/radio check
content = content.replace(""select" || item.type === "radio") Array.isArray", ""select" || item.type === "radio") " + andand + " Array.isArray")

# Fix missing in item.options.length
content = content.replace("Array.isArray(item.options) item.options.length", "Array.isArray(item.options) " + andand + " item.options.length")

# Fix missing in item.field formData
content = content.replace("item.field formData", "item.field " + andand + " formData")

# Fix missing in item.props item.props
content = content.replace("item.props item.props", "item.props " + andand + " item.props")

# Fix missing in item.options Array.isArray
content = content.replace("item.options Array.isArray", "item.options " + andand + " Array.isArray")

# Fix missing in 'select' col.options
content = content.replace(""select" col.options", ""select" " + andand + " col.options")

# Fix missing in 'fcTable' item.type !== 'table'
content = content.replace(""fcTable" item.type !== "table"", ""fcTable" " + andand + " item.type !== "table"")

# Fix missing return after if (!item || !item.options)
content = content.replace("if (!item || !item.options)", "if (!item || !item.options) " + ret)

# Fix missing return after if (!item)
content = content.replace("if (!item)", "if (!item) " + ret)

# Fix missing return after if (!column || !column.options)
content = content.replace("if (!column || !column.options)", "if (!column || !column.options) " + ret)

# Fix missing return after if (!Array.isArray(tableData))
content = content.replace("if (!Array.isArray(tableData))", "if (!Array.isArray(tableData)) " + ret)

# Fix missing return in getDisplayValue
content = content.replace("if (val === undefined || val === null || val === "")", "if (val === undefined || val === null || val === "") " + ret)
content = content.replace("if (item.options Array.isArray(val))", "if (item.options " + andand + " Array.isArray(val)) " + ret)

# Fix missing return in various places
content = content.replace("Array.isArray(val) ? val.join", ret + " Array.isArray(val) ? val.join")
content = content.replace("val ? "" : """, ret + " val ? "" : """)
content = content.replace("Array.isArray(cols) ? cols : []", ret + " Array.isArray(cols) ? cols : []")
content = content.replace("if (!tableData[rowIndex]) """, "if (!tableData[rowIndex]) " + ret + " """)
content = content.replace("found ? found.label : val", ret + " found ? found.label : val")
content = content.replace("typeof val === "string" ? val : """, ret + " typeof val === "string" ? val : """)
content = content.replace("column.type || "input"", ret + " column.type || "input"")
content = content.replace("column.options || []", ret + " column.options || []")

# Fix getDisplayValue val line
content = content.replace("\n      val\n    }", "\n      " + ret + " val\n    }")

# Fix getTableSelectValue val line
content = content.replace("\n      val || """, "\n      " + ret + " val || """)

# Fix getTableData and getTableColumns return
content = content.replace("Array.isArray(val) ? val : []", ret + " Array.isArray(val) ? val : []")

f = open(r"e:\Three-miniapp-native\miniprogram\components\dynamic-form\dynamic-form.js", "w", encoding="utf-8")
f.write(content)
f.close()
print("Fixed successfully")