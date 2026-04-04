<template>
  <aside class="admin-sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L3 7L12 12L21 7L12 2Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M3 12L12 17L21 12"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M3 17L12 22L21 17"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <h2>Admin Panel</h2>
      </div>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/admin/dashboard" class="nav-link">
        <span class="nav-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 9L12 3L21 9L12 15L3 9Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M5 12V18H19V12"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 15V18"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span>Dashboard</span>
      </router-link>

      <router-link to="/admin/users" class="nav-link">
        <span class="nav-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1615 16.5523C21.6185 15.8519 20.8581 15.3516 20 15.13"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M16 3.13C16.8604 3.3503 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span>Users</span>
      </router-link>

      <router-link to="/admin/verification" class="nav-link">
        <span class="nav-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M22 4L12 14.01L9 11.01"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span>Verification</span>
        <span v-if="pendingVerificationCount > 0" class="badge pending">
          {{ pendingVerificationCount > 99 ? '99+' : pendingVerificationCount }}
        </span>
      </router-link>

      <router-link to="/admin/skills" class="nav-link">
        <span class="nav-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.7 6.3L19 2L20.7 3.7L16.4 8"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M9 12L12 9M7 17L12 12M11 19L19 11"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M5 17L7 19"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M3 13L5 15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span>Skills</span>
      </router-link>

      <router-link to="/admin/reports" class="nav-link">
        <span class="nav-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 8V12M12 16H12.01M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke="currentColor"
              stroke-width="1.5"
            />
          </svg>
        </span>
        <span>Reports</span>
        <span v-if="pendingReportsCount > 0" class="badge reports">
          {{ pendingReportsCount > 99 ? '99+' : pendingReportsCount }}
        </span>
      </router-link>
      <router-link to="/admin/help" class="nav-link">
        <span class="nav-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <path
              d="M12 16H12.01M12 8V12"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </span>
        <span>Help Center</span>
        <span v-if="openTicketsCount > 0" class="badge help">
          {{ openTicketsCount > 99 ? '99+' : openTicketsCount }}
        </span>
      </router-link>

      <router-link to="/admin/audit-logs" class="nav-link">
        <span class="nav-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <path d="M3 3L21 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </span>
        <span>Audit Logs</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <router-link to="/dashboard" class="nav-link back-link">
        <span class="nav-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 12H5M12 19L5 12L12 5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span>Back to Site</span>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getReportStats } from '@/api/reportService'
import { getPendingCount } from '@/api/adminService'

const pendingVerificationCount = ref(0)
const pendingReportsCount = ref(0)
let refreshInterval = null

const loadPendingCounts = async () => {
  try {
    // Load pending verification count
    const verificationResponse = await getPendingCount()
    pendingVerificationCount.value = verificationResponse.count || 0

    // Load pending reports count
    const reportResponse = await getReportStats()
    pendingReportsCount.value = reportResponse.pending_reports || 0
  } catch (error) {
    console.error('Error loading pending counts:', error)
  }
}

onMounted(() => {
  loadPendingCounts()
  // Refresh every 30 seconds
  refreshInterval = setInterval(loadPendingCounts, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.admin-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo svg {
  stroke: #4f46e5;
}

.logo h2 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: #475569;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  background: #f8fafc;
  color: #4f46e5;
}

.nav-link.router-link-active {
  background: #eef2ff;
  color: #4f46e5;
  border-right: 3px solid #4f46e5;
}

.nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon svg {
  stroke: currentColor;
}

.badge {
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.2rem 0.5rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.badge.reports {
  background: #fee2e2;
  color: #ef4444;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: translateY(-50%) scale(1);
  }

  50% {
    transform: translateY(-50%) scale(1.1);
  }

  100% {
    transform: translateY(-50%) scale(1);
  }
}

.sidebar-footer {
  padding: 1rem 0;
  border-top: 1px solid #e2e8f0;
}

.back-link {
  color: #64748b;
}

.back-link:hover {
  color: #4f46e5;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-sidebar {
    width: 70px;
  }

  .logo h2,
  .nav-link span:not(.nav-icon) {
    display: none;
  }

  .nav-link {
    justify-content: center;
    padding: 0.75rem;
  }

  .badge {
    position: absolute;
    top: 2px;
    right: 2px;
    transform: none;
    min-width: 16px;
    padding: 0.1rem 0.3rem;
    font-size: 0.6rem;
  }
}
</style>
