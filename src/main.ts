import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import FcDesigner from '@form-create/designer'
import '@form-create/designer/src/style/index.css'
import './style.css'
import App from './App.vue'
import router from './router'

// 创建Vue应用实例
const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component as never)
}

// 使用插件
app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })
app.use(FcDesigner)
app.use(FcDesigner.formCreate)

// 挂载应用
app.mount('#app')
