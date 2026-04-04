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
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
import AdminUsers from '@/views/admin/AdminUsers.vue'
import AdminVerification from '@/views/admin/AdminVerification.vue'
import AdminSkills from '@/views/admin/AdminSkills.vue'
import AdminReports from '@/views/admin/AdminReports.vue'
import Messages from '@/views/Messages.vue'
import ForgotPassword from '@/auth/ForgotPassword.vue'
import ResetPassword from '@/auth/ResetPassword.vue'
import ResidentPublicProfile from '@/views/ResidentPublicProfile.vue'
import HelpCenter from '@/views/HelpCenter.vue'
import AdminHelpCenter from '@/views/admin/AdminHelpCenter.vue'
import AdminAuditLogs from '@/views/admin/AdminAuditLogs.vue'
import UserSettings from '@/views/UserSettings.vue'
import UserProfilePrivate from '@/views/UserProfilePrivate.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: loginComponents,
  },
  {
    path: '/settings',
    name: 'settings',
    component: UserSettings,
  },
  {
    path: '/my-profile',
    name: 'myProfile',
    component: UserProfilePrivate,
    meta: { requiresAuth: true },
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
    meta: { requiresAuth: true },
  },
  {
    path: '/becomeSkilled',
    name: 'becomeSkilled',
    component: BecomeProfessional,
    meta: { requiresAuth: true },
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
  {
    path: '/messages',
    name: 'Messages',
    component: Messages,
    meta: { requiresAuth: true },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword,
  },
  {
    path: '/resident/:id',
    name: 'ResidentPublicProfile',
    component: ResidentPublicProfile,
  },
  {
    path: '/help',
    name: 'HelpCenter',
    component: HelpCenter,
    meta: { requiresAuth: true },
  },

  {
    path: '/admin',
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'help',
        name: 'AdminHelpCenter',
        component: AdminHelpCenter,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: AdminUsers,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'verification',
        name: 'AdminVerification',
        component: AdminVerification,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'skills',
        name: 'AdminSkills',
        component: AdminSkills,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'reports',
        name: 'AdminReports',
        component: AdminReports,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'audit-logs',
        name: 'AdminAuditLogs',
        component: AdminAuditLogs,
        meta: { requiresAuth: true, role: 'admin' },
      },
    ],
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
