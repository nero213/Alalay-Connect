<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NotificationBell from './NotificationBell.vue'
import { getMySkilledProfile } from '@/api/skilledProfiles'

const router = useRouter()
const route = useRoute()
const isSideNavOpen = ref(false)
const user = ref(null)
const skilledProfile = ref(null)
const skilledProfileLoading = ref(false)
const showStatusModal = ref(false)

// Get user from localStorage on mount
onMounted(async () => {
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
    // Check if user is a resident, then load their skilled profile status
    if (user.value?.role === 'resident') {
      await loadSkilledProfileStatus()
    }
  }
})

// Load skilled profile status for resident users
const loadSkilledProfileStatus = async () => {
  skilledProfileLoading.value = true
  try {
    const response = await getMySkilledProfile()
    skilledProfile.value = response
  } catch (error) {
    // 404 means no profile yet, which is fine
    if (error.response?.status !== 404) {
      console.error('Error loading skilled profile:', error)
    }
    skilledProfile.value = null
  } finally {
    skilledProfileLoading.value = false
  }
}

// Toggle side navigation
const toggleSideNav = () => {
  isSideNavOpen.value = !isSideNavOpen.value
}

// Close side navigation
const closeSideNav = () => {
  isSideNavOpen.value = false
}

// Logout function
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
  closeSideNav()
}

// Check if user is logged in
const isLoggedIn = computed(() => {
  return !!localStorage.getItem('token')
})

// Get user's profile link based on role
const profileLink = computed(() => {
  if (!user.value) return '/profile'
  return user.value.role === 'skilled' ? '/SkilledProfile' : '/userProfile'
})

// Get dashboard link based on role
const dashboardLink = computed(() => {
  if (!user.value) return '/'
  return user.value.role === 'admin' ? '/admin/dashboard' : '/dashboard'
})

// Check if user is admin
const isAdmin = computed(() => {
  return user.value?.role === 'admin'
})

// Check if user can apply to become skilled
const canBecomeSkilled = computed(() => {
  return user.value?.role === 'resident' &&
    !skilledProfile.value &&
    !skilledProfileLoading.value
})

// Get skilled profile status for modal
const skilledProfileStatus = computed(() => {
  if (!skilledProfile.value) return null
  return skilledProfile.value.verification_status
})

// Get status message based on verification status
const getStatusMessage = () => {
  switch (skilledProfile.value?.verification_status) {
    case 'pending':
      return {
        title: 'Application Pending',
        message: 'Your skilled worker application is currently under review. We will notify you once it\'s approved.',
        color: '#f59e0b'
      }
    case 'approved':
      return {
        title: 'Application Approved!',
        message: 'Congratulations! Your application to become a skilled worker has been approved. You can now start accepting bookings.',
        color: '#10b981'
      }
    case 'rejected':
      return {
        title: 'Application Not Approved',
        message: 'We\'re sorry, your application was not approved at this time. Please check your documents and try again.',
        color: '#ef4444'
      }
    default:
      return null
  }
}

// Open status modal
const openStatusModal = () => {
  if (skilledProfile.value) {
    showStatusModal.value = true
  }
}

// Close status modal
const closeStatusModal = () => {
  showStatusModal.value = false
}

// Navigate to become skilled page
const goToBecomeSkilled = () => {
  router.push('/becomeSkilled')
  closeSideNav()
}

// Navigate to skilled profile (for approved workers)
const goToSkilledProfile = () => {
  router.push('/SkilledProfile')
  closeSideNav()
}

// Navigate to admin dashboard
const goToAdminDashboard = () => {
  router.push('/admin/dashboard')
  closeSideNav()
}

// Refresh profile status (for after applying)
const refreshProfileStatus = async () => {
  await loadSkilledProfileStatus()
}

// Expose refresh function to window for use in becomeSkilled page
if (typeof window !== 'undefined') {
  window.refreshNavbarProfileStatus = refreshProfileStatus
}
</script>

<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-brand">
        <router-link to="/dashboard" class="brand-link">
          <span class="brand-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M3 12L12 17L21 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M3 17L12 22L21 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </span>
          <span class="brand-text">alalay_connect</span>
        </router-link>
      </div>

      <!-- User Info & Hamburger Menu -->
      <div class="nav-menu">
        <NotificationBell />

        <button class="hamburger-icon" @click="toggleSideNav" aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>

    <!-- Side Navigation Overlay -->
    <div class="sidenav-overlay" v-if="isSideNavOpen" @click="closeSideNav"></div>

    <!-- Side Navigation Menu -->
    <div class="sidenav" :class="{ 'sidenav-open': isSideNavOpen }">
      <div class="sidenav-header">
        <h3>Menu</h3>
        <button class="close-btn" @click="closeSideNav" aria-label="Close menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <div class="sidenav-content">
        <!-- User Info Section -->
        <div v-if="isLoggedIn" class="user-info-section">
          <div class="user-avatar">
            {{ user?.firstName?.charAt(0) || 'U' }}
          </div>
          <div class="user-details">
            <p class="user-name">{{ user?.firstName }} {{ user?.lastName }}</p>
            <p class="user-role">{{ user?.role }}</p>
          </div>
        </div>

        <!-- Admin Section - Only visible to admins -->
        <div v-if="isAdmin" class="nav-section admin-section">
          <h4>Admin Panel</h4>

          <div class="admin-link" @click="goToAdminDashboard">
            <span class="link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 3L21 9L12 15L3 9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M5 12V18H19V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M12 15V18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </span>
            <span class="link-text">Dashboard</span>
            <span class="admin-badge">Admin</span>
          </div>

          <router-link to="/admin/users" class="sidenav-link" @click="closeSideNav">
            <span class="link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1615 16.5523C21.6185 15.8519 20.8581 15.3516 20 15.13"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M16 3.13C16.8604 3.3503 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="link-text">Users</span>
          </router-link>

          <router-link to="/admin/verification" class="sidenav-link" @click="closeSideNav">
            <span class="link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </span>
            <span class="link-text">Verification</span>
            <span v-if="skilledProfile?.verification_status === 'pending'" class="pending-count">!</span>
          </router-link>

          <router-link to="/admin/skills" class="sidenav-link" @click="closeSideNav">
            <span class="link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.7 6.3L19 2L20.7 3.7L16.4 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M9 12L12 9M7 17L12 12M11 19L19 11" stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round" />
                <path d="M5 17L7 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M3 13L5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </span>
            <span class="link-text">Skills</span>
          </router-link>

          <router-link to="/admin/reports" class="sidenav-link" @click="closeSideNav">
            <span class="link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="link-text">Reports</span>
          </router-link>
        </div>

        <!-- Main Navigation Links -->
        <div class="nav-section">
          <h4>Main</h4>

          <router-link :to="dashboardLink" class="sidenav-link" @click="closeSideNav">
            <span class="link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 3L21 9L12 15L3 9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M5 12V18H19V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M12 15V18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </span>
            <span class="link-text">Home</span>
          </router-link>
        </div>

        <!-- Profile & Bookings Section -->
        <div class="nav-section" v-if="isLoggedIn">
          <h4>My Account</h4>

          <router-link :to="profileLink" class="sidenav-link" @click="closeSideNav">
            <span class="link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="link-text">My Profile</span>
          </router-link>

          <!-- Become Skilled Worker Button -->
          <div v-if="canBecomeSkilled" class="become-skilled-link" @click="goToBecomeSkilled">
            <span class="link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.7 6.3L19 2L20.7 3.7L16.4 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M9 12L12 9M7 17L12 12M11 19L19 11" stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round" />
                <path d="M5 17L7 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M3 13L5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </span>
            <span class="link-text">Become a Skilled Worker</span>
            <span class="badge-new">New</span>
          </div>

          <!-- Skilled Profile Status Button -->
          <div v-else-if="user?.role === 'resident' && skilledProfile" class="status-link" @click="openStatusModal">
            <span class="link-icon" :class="skilledProfileStatus">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path v-if="skilledProfileStatus === 'pending'"
                  d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path v-else-if="skilledProfileStatus === 'approved'" d="M20 6L9 17L4 12" stroke="currentColor"
                  stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path v-else d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </span>
            <span class="link-text">Application Status</span>
            <span class="status-badge" :class="skilledProfileStatus">
              {{ skilledProfileStatus }}
            </span>
          </div>

          <!-- Skilled Worker Dashboard -->
          <router-link v-else-if="user?.role === 'skilled'" to="/skilled-bookings" class="sidenav-link"
            @click="closeSideNav">
            <span class="link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.5" />
                <path d="M8 2V6M16 2V6M3 10H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </span>
            <span class="link-text">Manage Bookings</span>
          </router-link>

          <router-link to="/bookings" class="sidenav-link" @click="closeSideNav">
            <span class="link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.5" />
                <path d="M8 2V6M16 2V6M3 10H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </span>
            <span class="link-text">My Bookings</span>
          </router-link>

          <router-link to="/favorites" class="sidenav-link" @click="closeSideNav">
            <span class="link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 21L10.55 19.7C5.4 15.1 2 12.1 2 8.5C2 5.4 4.4 3 7.5 3C9.3 3 11 3.9 12 5.3C13 3.9 14.7 3 16.5 3C19.6 3 22 5.4 22 8.5C22 12.1 18.6 15.1 13.45 19.7L12 21Z"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="link-text">Favorites</span>
          </router-link>

          <router-link to="/messages" class="sidenav-link" @click="closeSideNav">
            <span class="link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M8 9H16M8 13H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </span>
            <span class="link-text">Messages</span>
            <span v-if="unreadMessageCount > 0" class="unread-badge">{{ unreadMessageCount > 99 ? '99+' :
              unreadMessageCount }}</span>
          </router-link>

          <router-link to="/notifications" class="sidenav-link" @click="closeSideNav">
            <span class="link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="link-text">Notifications</span>
          </router-link>
        </div>

        <!-- Settings & Support Section -->
        <div class="nav-section" v-if="isLoggedIn">
          <h4>Settings</h4>

          <router-link to="/settings" class="sidenav-link" @click="closeSideNav">
            <span class="link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M19.4 15.05C19.2 15.45 18.9 15.8 18.6 16.1L18 17.4C17.8 17.8 17.5 18.2 17.1 18.4C16.8 18.6 16.4 18.7 16 18.6L14.6 18.3C14.2 18.5 13.8 18.7 13.4 18.8L12 20H11.2L9.8 18.8C9.4 18.7 9 18.5 8.6 18.3L7.2 18.6C6.8 18.7 6.4 18.6 6 18.4C5.7 18.2 5.4 17.9 5.2 17.6L4.6 16.1C4.4 15.7 4.2 15.3 4 14.9C3.9 14.5 3.8 14.1 3.9 13.7L4.2 12.3C4 11.9 3.9 11.5 3.9 11.1L3.9 9.8C3.9 9.4 4 9 4.2 8.6C4.4 8.2 4.7 7.9 5 7.6L5.6 6.3C5.9 5.9 6.2 5.6 6.6 5.4C6.9 5.2 7.3 5.1 7.7 5.2L9.1 5.5C9.5 5.3 9.9 5.1 10.3 5L11.7 3.8H12.5L13.9 5C14.3 5.1 14.7 5.3 15.1 5.5L16.5 5.2C16.9 5.1 17.3 5.2 17.7 5.4C18 5.6 18.3 5.9 18.5 6.2L19.1 7.5C19.3 7.9 19.5 8.3 19.6 8.7C19.7 9.1 19.8 9.5 19.7 9.9L19.4 11.3C19.6 11.7 19.7 12.1 19.7 12.5L19.7 13.8C19.8 14.2 19.7 14.6 19.5 15L19.4 15.05Z"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="link-text">Settings</span>
          </router-link>

          <router-link to="/help" class="sidenav-link" @click="closeSideNav">
            <span class="link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </span>
            <span class="link-text">Help Center</span>
          </router-link>
        </div>

        <!-- Auth Links -->
        <div class="nav-section" v-if="!isLoggedIn">
          <h4>Account</h4>

          <router-link to="/login" class="sidenav-link" @click="closeSideNav">
            <span class="link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M10 17L15 12L10 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M15 12H3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </span>
            <span class="link-text">Login</span>
          </router-link>

          <router-link to="/register" class="sidenav-link" @click="closeSideNav">
            <span class="link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M20 8V14M23 11H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </span>
            <span class="link-text">Register</span>
          </router-link>
        </div>

        <!-- Logout Button -->
        <div class="nav-section" v-if="isLoggedIn">
          <button @click="logout" class="logout-btn">
            <span class="link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M21 12H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </span>
            <span class="link-text">Logout</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Status Modal (same as before) -->
    <div v-if="showStatusModal" class="modal-overlay" @click="closeStatusModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ getStatusMessage()?.title }}</h3>
          <button @click="closeStatusModal" class="modal-close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="status-icon" :style="{ color: getStatusMessage()?.color }">
            <svg v-if="skilledProfileStatus === 'pending'" width="64" height="64" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <svg v-else-if="skilledProfileStatus === 'approved'" width="64" height="64" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            <svg v-else-if="skilledProfileStatus === 'rejected'" width="64" height="64" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
          <p class="status-message">{{ getStatusMessage()?.message }}</p>

          <!-- Additional info based on status -->
          <div v-if="skilledProfileStatus === 'pending'" class="status-info">
            <div class="info-row">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor" stroke-width="1.5" />
              </svg>
              <span>Estimated review time: 2-3 business days</span>
            </div>
            <div class="info-row">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                  stroke="currentColor" stroke-width="1.5" />
                <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="1.5" />
              </svg>
              <span>We'll notify you via email once reviewed</span>
            </div>
          </div>

          <div v-if="skilledProfileStatus === 'rejected'" class="status-info rejected">
            <p class="info-title">Common reasons for rejection:</p>
            <ul class="reasons-list">
              <li>Missing or unclear government ID</li>
              <li>Incomplete certificate/documentation</li>
              <li>Insufficient experience information</li>
            </ul>
            <button @click="goToBecomeSkilled" class="retry-btn">
              Submit New Application
            </button>
          </div>

          <div v-if="skilledProfileStatus === 'approved'" class="status-info approved">
            <p class="info-title">What's next?</p>
            <ul class="next-steps">
              <li>Complete your worker profile</li>
              <li>Add your skills and hourly rate</li>
              <li>Start accepting bookings from clients</li>
            </ul>
            <button @click="goToSkilledProfile" class="continue-btn">
              Go to Worker Dashboard
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeStatusModal" class="btn-secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
/* Navbar Styles */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-brand {
  flex: 1;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
  color: #4f46e5;
  transition: all 0.3s ease;
}

.brand-link:hover {
  transform: translateY(-1px);
}

.brand-icon svg {
  stroke: #4f46e5;
}

.brand-text {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Hamburger Menu */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.hamburger-icon {
  width: 30px;
  height: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}

.hamburger-icon span {
  width: 100%;
  height: 2px;
  background-color: #4f46e5;
  border-radius: 2px;
  transition: 0.3s;
}

.hamburger-icon:hover span {
  background-color: #7c3aed;
}

/* Side Navigation Overlay */
.sidenav-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

/* Side Navigation */
.sidenav {
  position: fixed;
  top: 0;
  right: -320px;
  width: 320px;
  height: 100%;
  background: white;
  box-shadow: -2px 0 20px rgba(0, 0, 0, 0.1);
  z-index: 1002;
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
}

.sidenav-open {
  right: 0;
}

.sidenav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  background: white;
}

.sidenav-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  color: #64748b;
}

.close-btn:hover {
  background-color: #f1f5f9;
  color: #1e293b;
}

/* Side Navigation Content */
.sidenav-content {
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
}

/* User Info Section */
.user-info-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  border: 2px solid white;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.user-role {
  font-size: 0.75rem;
  opacity: 0.9;
  margin: 0;
  text-transform: capitalize;
}

/* Navigation Sections */
.nav-section {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.nav-section:last-child {
  border-bottom: none;
}

.nav-section h4 {
  padding: 0.5rem 1.5rem;
  margin: 0;
  color: #94a3b8;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

/* Side Navigation Links */
.sidenav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: #334155;
  text-decoration: none;
  transition: all 0.3s ease;
  gap: 1rem;
}

.sidenav-link:hover {
  background-color: #f8fafc;
  color: #4f46e5;
}

.sidenav-link.router-link-active {
  background-color: #eef2ff;
  color: #4f46e5;
  border-right: 3px solid #4f46e5;
}

.link-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.link-icon svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  fill: none;
}

.link-text {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 500;
}

/* Become Skilled Worker Button */
.become-skilled-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: #10b981;
  text-decoration: none;
  transition: all 0.3s ease;
  gap: 1rem;
  cursor: pointer;
}

.become-skilled-link:hover {
  background-color: #f0fdf4;
  color: #059669;
}

.badge-new {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-size: 0.65rem;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-weight: 600;
}

/* Status Link */
.status-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s ease;
  gap: 1rem;
  cursor: pointer;
}

.status-link:hover {
  background-color: #f8fafc;
}

.status-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  text-transform: capitalize;
  font-weight: 600;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.approved {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.link-icon.pending svg {
  stroke: #f59e0b;
}

.link-icon.approved svg {
  stroke: #10b981;
}

.link-icon.rejected svg {
  stroke: #ef4444;
}

/* Logout Button */
.logout-btn {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  color: #ef4444;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 1rem;
  text-align: left;
}

.logout-btn:hover {
  background-color: #fef2f2;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: white;
  border-radius: 24px;
  max-width: 450px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  color: #64748b;
}

.modal-close-btn:hover {
  background-color: #f1f5f9;
  color: #ef4444;
}

.modal-body {
  padding: 1.5rem;
  text-align: center;
}

.status-icon {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.status-icon svg {
  width: 64px;
  height: 64px;
}

.status-message {
  color: #475569;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.status-info {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
  margin-top: 1rem;
  text-align: left;
}

.status-info.rejected {
  background: #fef2f2;
  border-left: 3px solid #ef4444;
}

.status-info.approved {
  background: #f0fdf4;
  border-left: 3px solid #10b981;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: #475569;
  font-size: 0.9rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row svg {
  width: 20px;
  height: 20px;
  stroke: #64748b;
  flex-shrink: 0;
}

.info-title {
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1e293b;
}

.reasons-list,
.next-steps {
  margin: 0;
  padding-left: 1.25rem;
  color: #64748b;
}

.reasons-list li,
.next-steps li {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.reasons-list li:last-child,
.next-steps li:last-child {
  margin-bottom: 0;
}

.retry-btn,
.continue-btn {
  margin-top: 1rem;
  padding: 0.6rem 1rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.retry-btn:hover,
.continue-btn:hover {
  background: #4338ca;
  transform: translateY(-2px);
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.btn-secondary {
  flex: 1;
  padding: 0.6rem;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.admin-section {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-left: 4px solid #f59e0b;
  margin: 0.5rem 0;
}

.admin-section h4 {
  color: #92400e;
}

.admin-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: #92400e;
  text-decoration: none;
  transition: all 0.3s ease;
  gap: 1rem;
  cursor: pointer;
}

.admin-link:hover {
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.admin-badge {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  font-size: 0.65rem;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-weight: 600;
  margin-left: auto;
}

.pending-count {
  background: #ef4444;
  color: white;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  margin-left: auto;
}


/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .navbar {
    padding: 0.75rem 1rem;
  }

  .brand-text {
    font-size: 1.2rem;
  }

  .sidenav {
    width: 280px;
  }
}

@media (max-width: 480px) {
  .sidenav {
    width: 260px;
  }

  .modal-content {
    width: 95%;
  }
}
</style>