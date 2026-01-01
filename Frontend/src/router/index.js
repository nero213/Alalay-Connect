import profileView from '@/components/views/profile.view.vue'
import loginComponents from '@/components/auth/login.components.vue'
import { createRouter, createWebHistory } from 'vue-router'
import registrationComponents from '@/components/auth/registration.components.vue'
import FacebookView from '@/components/views/Facebook.view.vue'

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
  {
    path: '/register',
    name: 'register',
    component: registrationComponents,
  },
  {
    path: '/facebook-success',
    name: 'facebook',
    component: FacebookView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
