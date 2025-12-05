import profileView from '@/components/views/profile.view.vue'
import loginComponents from '@/components/auth/login.components.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: loginComponents,
  },
  {
    path: '/profile',
    name: 'profile',
    component: profileView,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
