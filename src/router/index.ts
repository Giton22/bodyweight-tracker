import { createRouter, createWebHistory } from 'vue-router'
import { pb } from '@/lib/pocketbase'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guestOnly?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/views/AuthView.vue'),
      meta: { guestOnly: true },
    },
  ],
})

router.beforeEach((to) => {
  const isAuthenticated = pb.authStore.isValid

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'auth' }
  }

  if (to.meta.guestOnly && isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
