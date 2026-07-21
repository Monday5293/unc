<!--
  小程序外壳容器组件
  模拟手机外框，包含顶部状态栏、底部 Tab Bar 以及路由出口，
  为用户提供类手机的沉浸式浏览体验。
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const activeTab = computed(() => (route.meta.tab as string) || 'home')

// 底部 Tab 栏配置：卡面 / 我的
const tabs = [
  {
    key: 'home',
    label: '卡面',
    path: '/miniapp/home',
    icon: 'M4 5h16v4H4zM4 11h16v8H4z',
  },
  {
    key: 'profile',
    label: '我的',
    path: '/miniapp/profile',
    icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0H5z',
  },
]

// 页面跳转：切换 Tab 或导航到其他页面
function go(path: string) {
  router.push(path)
}
</script>

<template>
  <!-- 桌面端手机外框 -->
  <div class="min-h-screen w-full bg-ink-noise flex items-center justify-center p-0 sm:p-6">
    <!-- 背景装饰：暗角古卷氛围 -->
    <div
      class="pointer-events-none fixed inset-0 opacity-30"
      style="
        background:
          radial-gradient(ellipse at top, rgba(200, 160, 70, 0.08), transparent 50%),
          radial-gradient(ellipse at bottom, rgba(59, 107, 74, 0.06), transparent 50%);
      "
    />

    <!-- 手机外框 -->
    <div
      class="relative z-10 flex h-[100dvh] w-full max-w-[420px] flex-col overflow-hidden bg-ink-900 shadow-2xl sm:h-[860px] sm:rounded-[2.5rem] sm:border-4 sm:border-ink-700 sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
    >
      <!-- 顶部状态栏（模拟手机顶栏） -->
      <div
        class="flex h-7 flex-shrink-0 items-center justify-between bg-ink-900 px-5 text-[10px] text-parchment-200/60"
      >
        <span>跑团角色卡 · 小程序</span>
        <div class="flex items-center gap-1">
          <span class="h-1 w-1 rounded-full bg-coc" />
          <span>已连接</span>
        </div>
      </div>

      <!-- 路由出口：渲染当前 Tab 对应的页面组件 -->
      <div class="relative flex-1 overflow-y-auto">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>

      <!-- 底部 Tab Bar -->
      <div
        class="flex flex-shrink-0 items-stretch border-t border-ink-700 bg-ink-900/95 backdrop-blur"
        style="padding-bottom: env(safe-area-inset-bottom, 0)"
      >
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 transition-colors"
          :class="
            activeTab === tab.key ? 'text-dnd' : 'text-parchment-200/40'
          "
          @click="go(tab.path)"
        >
          <svg
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
          >
            <path :d="tab.icon" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="text-[10px] font-medium">{{ tab.label }}</span>
          <span
            v-if="activeTab === tab.key"
            class="absolute -top-px h-0.5 w-8 rounded-full bg-dnd"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
