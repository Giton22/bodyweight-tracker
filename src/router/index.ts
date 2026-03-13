import { createRouter, createWebHistory } from 'vue-router'
import { pb } from '@/lib/pocketbase'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guestOnly?: boolean
    title?: string
  }
}

const APP_TITLE = 'Bodyweight Tracker'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true, title: 'Dashboard' },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { requiresAuth: true, title: 'Settings' },
    },
    {
      path: '/groups',
      name: 'groups',
      component: () => import('@/views/GroupsView.vue'),
      meta: { requiresAuth: true, title: 'Groups' },
    },
    {
      path: '/groups/:id',
      name: 'group-detail',
      component: () => import('@/views/GroupDetailView.vue'),
      meta: { requiresAuth: true, title: 'Group' },
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/views/AuthView.vue'),
      meta: { guestOnly: true, title: 'Sign In' },
    },
    {
      path: '/setup',
      name: 'setup',
      component: () => import('@/views/SetupView.vue'),
      meta: { guestOnly: true, title: 'Setup' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Not Found' },
    },
  ],
})

router.beforeEach(async (to) => {
  const isAuthenticated = pb.authStore.isValid
  const auth = useAuthStore()

  // Check setup status (result is cached after first successful fetch)
  const setupDone = await auth.checkSetup()

  // ── First-launch: setup not yet complete ──
  // If no setup has been done and no one is logged in, force /setup.
  if (!setupDone && !isAuthenticated) {
    if (to.name !== 'setup') {
      return { name: 'setup' }
    }
    return // already going to /setup — allow it
  }

  // ── Normal guards (setup is done or user is already authenticated) ──

  // Authenticated users skip guest-only pages
  if (to.meta.guestOnly && isAuthenticated) {
    return { name: 'dashboard' }
  }

  // Protected pages require a valid session
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'auth' }
  }

  // Prevent navigating to /setup after it's been completed
  if (to.name === 'setup') {
    return isAuthenticated ? { name: 'dashboard' } : { name: 'auth' }
  }
})

router.afterEach((to) => {
  const title = to.meta.title
  document.title = title ? `${title} - ${APP_TITLE}` : APP_TITLE
})

export default router
