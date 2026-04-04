<!-- frontend/src/views/Facebook.view.vue -->
<template>
  <div class="facebook-callback">
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Logging you in...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

onMounted(() => {
  const token = route.query.token
  const error = route.query.error

  console.log('Facebook callback - Token received:', token ? 'Yes' : 'No')

  if (error) {
    console.error('Facebook login error:', error)
    router.push('/login?error=facebook_failed')
    return
  }

  if (token) {
    try {
      // Decode token to get user data
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const userData = JSON.parse(atob(base64))

      console.log('Facebook login successful:', userData)

      // Save token and user data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))

      // Redirect to development placeholder
      router.push('/development')
    } catch (error) {
      console.error('Error processing token:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login?error=invalid_token')
    }
  } else {
    router.push('/login')
  }
})
</script>

<style scoped>
.facebook-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-container {
  text-align: center;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-container p {
  color: #64748b;
  font-size: 0.9rem;
}
</style>
