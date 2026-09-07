# DHSheet JSON 导入 — 自动导入角色照片

## 摘要
DHSheet 导出的 JSON 中 `characterImage` 字段包含 base64 编码的角色照片。导入时自动提取并保存为角色卡头像。

## 现状
- JSON `characterImage` 格式：`data:image/jpeg;base64,<raw_base64_data>`
- 卡片 `avatar` 字段为空字符串或本地文件路径
- `store.updateCardAvatar(cardId, filePath)` 写入头像路径
- 微信小程序写入 base64 图片需使用 `wx.getFileSystemManager().writeFile({ encoding: 'base64' })`

## 修改计划

### 1. `miniprogram/utils/dh-json-parser.js`
- 在 `parseDhJson` 返回的 formData 中新增 `_characterImage` 字段
- 读取 `json.characterImage`，若为有效 base64 data URL，剔除 `data:image/...;base64,` 前缀，保留原始 base64 字符串
- 若 `characterImage` 为空或无效 → 不设置 `_characterImage`

### 2. `miniprogram/pages/home/home.js`
- 在 `doAddCard` 函数中，`store.addCard()` 返回 card 后，检查 `stFormData._characterImage`
- 若有图片数据：
  1. 调用 `wx.getFileSystemManager().writeFile()` 将 base64 写入临时文件（路径 `wx.env.USER_DATA_PATH + '/avatar_' + card.id + '.jpg'`）
  2. 写入成功后调用 `store.updateCardAvatar(card.id, filePath)`
- 处理完后删除 `stFormData._characterImage`（避免存入 formData）

### 3. 无需修改 WXML/WXSS

## 验证
1. 使用 `黑羊-刺客-魔裔-羊蹄人-战乱之民-LV2.json` 测试导入
2. 确认新建卡片后头像自动显示角色照片
3. 确认无图片的 JSON 导入不受影响
