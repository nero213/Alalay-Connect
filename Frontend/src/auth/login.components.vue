<script setup>
import { ref, reactive, computed } from 'vue'
import { loginUser } from '@/api/userService'
import { useRouter } from 'vue-router'
import API from '@/api/axios' // Add this import

const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

const successMessage = ref('')
const errorMessage = ref('')
const loading = ref(false)
const showPassword = ref(false)
const verificationRequired = ref(false)
const unverifiedEmail = ref('')

// Email validation
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Real-time validation
const validateField = (field) => {
  switch (field) {
    case 'email':
      if (!form.email) {
        errors.email = 'Email is required'
      } else if (!validateEmail(form.email)) {
        errors.email = 'Please enter a valid email address'
      } else {
        errors.email = ''
      }
      break
    case 'password':
      if (!form.password) {
        errors.password = 'Password is required'
      } else if (form.password.length < 6) {
        errors.password = 'Password must be at least 6 characters'
      } else {
        errors.password = ''
      }
      break
  }
}

// Check if form is valid
const isFormValid = computed(() => {
  return (
    form.email &&
    form.password &&
    !errors.email &&
    !errors.password &&
    form.password.length >= 6 &&
    validateEmail(form.email)
  )
})

// Role-based redirect
const redirectBasedOnRole = (user) => {
  switch (user.role) {
    case 'skilled':
      router.push('/SkilledProfile')
      break
    case 'resident':
      router.push('/dashboard')
      break
    case 'admin':
      router.push('/admin/dashboard')
      break
    default:
      router.push('/dashboard')
  }
}

const userLogin = async () => {
  // Validate all fields before submission
  validateField('email')
  validateField('password')

  if (!isFormValid.value) {
    errorMessage.value = 'Please fix the errors before submitting'
    return
  }

  successMessage.value = ''
  errorMessage.value = ''
  verificationRequired.value = false
  loading.value = true

  try {
    const res = await loginUser({
      email: form.email.trim(),
      password: form.password,
    })

    // Check if verification is required
    if (res.data.requiresVerification) {
      verificationRequired.value = true
      unverifiedEmail.value = res.data.email || form.email.trim()
      errorMessage.value = res.data.message || 'Please verify your email before logging in.'

      setTimeout(() => {
        router.push({
          path: '/verify-email',
          query: { email: unverifiedEmail.value },
        })
      }, 2000)
      return
    }

    successMessage.value = res.data.message || 'Login successful! Redirecting...'

    // Store JWT token
    if (res.data.token) {
      localStorage.setItem('token', res.data.token)
    }

    // Store user data
    if (res.data.user) {
      localStorage.setItem('user', JSON.stringify(res.data.user))

      // Role-based redirect
      setTimeout(() => {
        redirectBasedOnRole(res.data.user)
      }, 1500)
    }

    // Reset form
    Object.keys(form).forEach((k) => (form[k] = ''))
  } catch (err) {
    console.error('Login error:', err)
    console.error('Error response:', err.response)
    console.error('Error data:', err.response?.data)

    // Check if error is due to unverified email
    if (err.response?.data?.requiresVerification) {
      verificationRequired.value = true
      unverifiedEmail.value = err.response.data.email || form.email.trim()
      errorMessage.value =
        err.response.data.message || 'Please verify your email before logging in.'

      setTimeout(() => {
        router.push({
          path: '/verify-email',
          query: { email: unverifiedEmail.value },
        })
      }, 2000)
    } else {
      // Display the error message from the server
      errorMessage.value =
        err.response?.data?.message || 'Login failed. Please check your credentials.'
    }

    // Clear password field on error
    form.password = ''
  } finally {
    loading.value = false
  }
}

// Clear messages when user starts typing
const handleInput = (field) => {
  successMessage.value = ''
  errorMessage.value = ''
  verificationRequired.value = false
  validateField(field)
}

// Resend verification
const resendVerification = async () => {
  if (!unverifiedEmail.value) return

  loading.value = true
  try {
    await API.post('/auth/resend-verification', {
      email: unverifiedEmail.value,
    })
    errorMessage.value = 'Verification code resent! Please check your email.'
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Failed to resend code'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h1>Welcome Back</h1>
      <p class="subtitle">Please login to your account</p>

      <!-- Show verification warning if needed -->
      <div v-if="verificationRequired" class="verification-warning">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
          />
        </svg>
        <p>{{ errorMessage }}</p>
        <div class="verification-actions">
          <button @click="resendVerification" class="resend-btn" :disabled="loading">
            Resend Verification Code
          </button>
          <router-link
            :to="{ path: '/verify-email', query: { email: unverifiedEmail } }"
            class="verify-now-btn"
          >
            Verify Now
          </router-link>
        </div>
      </div>

      <!-- Normal login form -->
      <form v-else @submit.prevent="userLogin" novalidate>
        <div class="input-group" :class="{ 'has-error': errors.email }">
          <label for="email">Email Address</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="your@email.com"
            required
            @input="handleInput('email')"
            @blur="validateField('email')"
            :disabled="loading"
          />
          <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
        </div>

        <div class="input-group" :class="{ 'has-error': errors.password }">
          <label for="password">Password</label>
          <div class="password-wrapper">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              required
              @input="handleInput('password')"
              @blur="validateField('password')"
              :disabled="loading"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
          <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
        </div>

        <button type="submit" :disabled="loading || !isFormValid" class="submit-btn">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>

        <div class="divider">
          <span>or</span>
        </div>

        <div class="register-link">
          Don't have an account?
          <router-link to="/register">Sign up now</router-link>
        </div>
        <div class="forgot-password-link">
          <router-link to="/forgot-password">Forgot Password?</router-link>
        </div>
      </form>

      <!-- Message display -->
      <transition name="fade">
        <p v-if="successMessage && !verificationRequired" class="success-message">
          {{ successMessage }}
        </p>
      </transition>
      <transition name="fade">
        <p v-if="errorMessage && !verificationRequired" class="error-message">
          {{ errorMessage }}
        </p>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  background-color: #fff;
  padding: 40px 50px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  text-align: center;
}

.login-box h1 {
  font-weight: 600;
  font-size: 28px;
  margin-bottom: 8px;
  color: #333;
}

.subtitle {
  color: #666;
  margin-bottom: 30px;
  font-size: 14px;
}

.input-group {
  margin-bottom: 20px;
  text-align: left;
}

.input-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 14px;
  color: #555;
}

.input-group input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
}

.input-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-group.has-error input {
  border-color: #ff4d4f;
}

.input-group.has-error input:focus {
  border-color: #ff4d4f;
  box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.1);
}

.field-error {
  display: block;
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
  animation: slideIn 0.3s ease;
}

.password-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  margin: 0;
  width: auto;
  border-radius: 4px;
}

.password-toggle:hover {
  background-color: rgba(102, 126, 234, 0.1);
}

.submit-btn {
  padding: 12px 20px;
  margin: 10px 0 15px;
  width: 100%;
  cursor: pointer;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  position: relative;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Spinner for loading state */
.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.facebook-btn {
  background: #1877f2;
  color: white;
  width: 100%;
  padding: 12px 20px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.facebook-btn:hover:not(:disabled) {
  background: #166fe5;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(24, 119, 242, 0.3);
}

.facebook-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.facebook-icon {
  width: 18px;
  height: 18px;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
  color: #999;
  font-weight: 400;
  font-size: 14px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #ccc, transparent);
}

.divider span {
  padding: 0 15px;
}

.register-link {
  text-align: center;
  color: #666;
  font-size: 14px;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  margin-left: 5px;
}

.register-link a:hover {
  text-decoration: underline;
}

.forgot-password {
  margin-top: 15px;
  text-align: center;
}

.forgot-password a {
  color: #999;
  text-decoration: none;
  font-size: 13px;
}

.forgot-password a:hover {
  color: #667eea;
  text-decoration: underline;
}

.forgot-password-link {
  margin-top: 10px;
  text-align: center;
  margin-bottom: 20px;
}

.forgot-password-link a {
  color: #667eea;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.3s;
}

.forgot-password-link a:hover {
  color: #764ba2;
}

.success-message,
.error-message {
  margin-top: 20px;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  animation: slideDown 0.3s ease;
}

.success-message {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.error-message {
  background-color: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Verification warning */
.verification-warning {
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.verification-warning svg {
  color: #856404;
  margin-bottom: 0.5rem;
}

.verification-warning p {
  color: #856404;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.verification-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.resend-btn {
  background: #856404;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 5px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.resend-btn:hover:not(:disabled) {
  background: #6d5100;
  transform: translateY(-2px);
}

.resend-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.verify-now-btn {
  background: #667eea;
  color: white;
  text-decoration: none;
  padding: 0.6rem 1rem;
  border-radius: 5px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s;
}

.verify-now-btn:hover {
  background: #764ba2;
  transform: translateY(-2px);
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
  }
}
</style>
