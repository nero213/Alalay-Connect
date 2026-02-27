import profileView from '@/views/profile.view.vue'
import loginComponents from '@/auth/login.components.vue'
import { createRouter, createWebHistory } from 'vue-router'
import registrationComponents from '@/auth/registration.components.vue'
import FacebookView from '@/views/Facebook.view.vue'
import dashBoardView from '@/views/dashBoard.view.vue'
import BecomeProfessional from '@/views/BecomeProfessional.vue'
import UserProfile from '@/views/userProfile.vue'

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
  {
    path: '/dashboard',
    name: 'dashboard',
    component: dashBoardView,
  },
  {
    path: '/becomeSkilled',
    name: 'becomeSkilled',
    component: BecomeProfessional,
  },
  {
    path: '/profile',
    name: 'profile',
    component: UserProfile,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
