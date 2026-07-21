import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import DesignerPage from '@/pages/DesignerPage.vue'
import MiniAppShell from '@/pages/miniapp/MiniAppShell.vue'
import MiniAppHome from '@/pages/miniapp/MiniAppHome.vue'
import MiniAppProfile from '@/pages/miniapp/MiniAppProfile.vue'
import CardDetail from '@/pages/miniapp/CardDetail.vue'
import ImportFormList from '@/pages/miniapp/ImportFormList.vue'
import CustomCardDetail from '@/pages/miniapp/CustomCardDetail.vue'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/designer',
  },
  {
    path: '/designer',
    name: 'designer',
    component: DesignerPage,
    meta: { title: '表单设计器' },
  },
  {
    path: '/miniapp',
    component: MiniAppShell,
    redirect: '/miniapp/home',
    children: [
      {
        path: 'home',
        name: 'miniapp-home',
        component: MiniAppHome,
        meta: { title: '卡面展示', tab: 'home' },
      },
      {
        path: 'profile',
        name: 'miniapp-profile',
        component: MiniAppProfile,
        meta: { title: '个人中心', tab: 'profile' },
      },
      {
        path: 'card/:id',
        name: 'miniapp-card',
        component: CardDetail,
        meta: { title: '角色卡详情' },
      },
      {
        path: 'import',
        name: 'miniapp-import',
        component: ImportFormList,
        meta: { title: '读取服务器表单' },
      },
      {
        path: 'custom/:formId',
        name: 'miniapp-custom-card',
        component: CustomCardDetail,
        meta: { title: '自定义表单渲染' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
