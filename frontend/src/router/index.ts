import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import KanbanView from '../views/KanbanView.vue'
import AuthView from '../views/AuthView.vue'
import { useAuth } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/board/:id',
      name: 'board',
      component: KanbanView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: AuthView
    }
  ],
})

router.beforeEach(async (to, from, next) => {
  const { init, isAuthenticated } = useAuth()

  // Initialize auth state (check cookies)
  init()

  const isAuth = isAuthenticated()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !isAuth) {
    next('/login')
  } else if (to.name === 'login' && isAuth) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
