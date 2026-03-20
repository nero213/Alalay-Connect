import profileView from '@/views/profile.view.vue'
import loginComponents from '@/auth/login.components.vue'
import { createRouter, createWebHistory } from 'vue-router'
import registrationComponents from '@/auth/registration.components.vue'
import FacebookView from '@/views/Facebook.view.vue'
import dashBoardView from '@/views/dashBoard.view.vue'
import BecomeProfessional from '@/views/BecomeProfessional.vue'
import UserProfile from '@/views/userProfile.vue'
import landingPage from '@/views/landingPage.vue'
import verifyEmail from '@/views/verifyEmail.vue'
import SkilledProfile from '@/views/skilledProfile.vue'
import createBooking from '@/views/createBooking.vue'
import myBookings from '@/views/myBookings.vue'
import BookingDetail from '@/views/bookingDetail.vue'
import PublicSkilledProfile from '@/views/publicSkilledProfile.vue'
import SkilledBookings from '@/views/SkilledBookings.vue'
import RescheduleBooking from '@/views/RescheduleBooking.vue'
import Notifications from '@/views/Notifications.vue'
import Favorites from '@/views/Favorites.vue'

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
    path: '/SkilledProfile',
    name: 'Skilledprofile',
    component: SkilledProfile,
    meta: { requiresAuth: true, requiresSkilled: true }, // Add requiresSkilled
  },
  {
    path: '/userProfile',
    name: 'Userprofile',
    component: UserProfile,
    meta: { requiresAuth: true }, // Add requiresResident
  },
  {
    path: '/bookings',
    name: 'MyBookings',
    component: myBookings,
    meta: { requiresAuth: true },
  },
  {
    path: '/bookings/:id',
    name: 'BookingDetail',
    component: BookingDetail,
    meta: { requiresAuth: true },
  },
  {
    path: '/booking/:id',
    name: 'CreateBooking',
    component: createBooking,
    meta: { requiresAuth: true },
  },
  {
    path: '/skilled-profile/:id',
    name: 'PublicSkilledProfile',
    component: PublicSkilledProfile,
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    name: 'testing',
    component: landingPage,
  },
  {
    path: '/verify-email',
    name: 'VerifyEmail',
    component: verifyEmail,
  },
  {
    path: '/skilled-bookings',
    name: 'SkilledBookings',
    component: SkilledBookings,
    meta: { requiresAuth: true, requiresSkilled: true },
  },
  {
    path: '/reschedule/:id',
    name: 'RescheduleBooking',
    component: RescheduleBooking,
    meta: { requiresAuth: true },
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications,
    meta: { requiresAuth: true },
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: Favorites,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard for authentication and role-based access
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  // Public routes - no authentication needed
  if (!to.matched.some((record) => record.meta.requiresAuth)) {
    next()
    return
  }

  // Check if route requires authentication
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!token) {
      // Redirect to login page with return url
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
      return
    }

    // Check if route requires skilled role
    if (to.matched.some((record) => record.meta.requiresSkilled)) {
      if (!user || user.role !== 'skilled') {
        // Redirect to dashboard if not skilled
        next({ path: '/dashboard' })
        return
      }
    }

    // Check if route requires resident role
    if (to.matched.some((record) => record.meta.requiresResident)) {
      if (!user || user.role !== 'resident') {
        // Redirect to dashboard if not resident
        next({ path: '/dashboard' })
        return
      }
    }

    // User is authenticated and has required role
    next()
  } else {
    // Public route
    next()
  }
})

export default router
