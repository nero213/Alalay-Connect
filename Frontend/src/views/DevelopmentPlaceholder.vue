<!-- frontend/src/views/DevelopmentPlaceholder.vue -->
<template>
  <div class="development-placeholder">
    <div class="placeholder-container">
      <div class="placeholder-card">
        <div class="placeholder-icon">
          <svg
            width="80"
            height="80"
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
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        </div>

        <h1>Alalay Connect</h1>

        <div class="status-badge">
          <span class="status-dot"></span>
          <span>Under Development</span>
        </div>

        <p class="welcome-message">
          Thank you for logging in with Facebook! This feature is currently under development and
          will be available soon.
        </p>

        <div class="user-info" v-if="user">
          <h3>Account Information:</h3>
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value">{{ user.firstName }} {{ user.lastName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">{{ user.email }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Role:</span>
            <span class="info-value role-badge" :class="user.role">
              {{
                user.role === 'resident'
                  ? 'Resident'
                  : user.role === 'skilled'
                    ? 'Skilled Worker'
                    : 'Admin'
              }}
            </span>
          </div>
        </div>

        <div class="notice-box">
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
              stroke-linecap="round"
            />
          </svg>
          <p>
            This page is a placeholder for demonstration purposes. Full functionality coming soon.
          </p>
        </div>

        <button @click="logout" class="btn-logout">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M16 17L21 12L16 7"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M21 12H9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)

onMounted(() => {
  // Get user data from localStorage
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
  }
})

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.development-placeholder {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.placeholder-container {
  max-width: 500px;
  width: 100%;
}

.placeholder-card {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.placeholder-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: white;
}

.placeholder-icon svg {
  stroke: white;
}

h1 {
  font-size: 1.8rem;
  color: #1e293b;
  margin-bottom: 1rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 1rem;
  background: #fef3c7;
  border-radius: 30px;
  margin-bottom: 1.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #f59e0b;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.welcome-message {
  color: #64748b;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.user-info {
  background: #f8fafc;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.user-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.info-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.info-label {
  width: 70px;
  color: #64748b;
  font-weight: 500;
}

.info-value {
  flex: 1;
  color: #1e293b;
}

.role-badge.resident {
  color: #4f46e5;
  font-weight: 600;
}

.role-badge.skilled {
  color: #10b981;
  font-weight: 600;
}

.role-badge.admin {
  color: #ef4444;
  font-weight: 600;
}

.notice-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef2f2;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  text-align: left;
}

.notice-box svg {
  stroke: #ef4444;
  flex-shrink: 0;
}

.notice-box p {
  color: #991b1b;
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.4;
}

.btn-logout {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.btn-logout:hover {
  background: #fecaca;
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .placeholder-card {
    padding: 1.5rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .info-row {
    flex-direction: column;
    gap: 0.25rem;
  }

  .info-label {
    width: auto;
  }
}
</style>
