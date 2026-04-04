<template>
  <div class="verify-container">
    <div class="verify-card">
      <div class="logo">
        <h2>Alalay Connect</h2>
      </div>

      <div v-if="!verified" class="verification-content">
        <h1>Verify Your Email</h1>
        <p class="subtitle">
          We've sent a 6-digit verification code to<br />
          <strong>{{ email }}</strong>
        </p>

        <div class="code-inputs">
          <input
            v-for="(digit, index) in 6"
            :key="index"
            type="text"
            maxlength="1"
            v-model="codeDigits[index]"
            @input="handleInput(index, $event)"
            @keydown="handleKeyDown(index, $event)"
            @paste="handlePaste"
            ref="digitInputs"
            class="code-digit"
            :disabled="loading"
          />
        </div>

        <button @click="verifyCode" :disabled="!isCodeComplete || loading" class="verify-btn">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Verifying...' : 'Verify Email' }}
        </button>

        <div class="resend-section">
          <p v-if="resendTimer > 0" class="timer-text">
            Resend code in <span class="timer">{{ resendTimer }}s</span>
          </p>
          <button v-else @click="resendCode" :disabled="resendLoading" class="resend-btn">
            {{ resendLoading ? 'Sending...' : 'Resend Verification Code' }}
          </button>
        </div>

        <div class="help-section">
          <p class="help-text">
            Didn't receive the email? Check your spam folder or
            <button @click="resendCode" class="text-link">click here to resend</button>
          </p>
        </div>
      </div>

      <div v-else class="verified-success">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" width="48" height="48">
            <path
              fill="currentColor"
              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
            />
          </svg>
        </div>
        <h2>Email Verified!</h2>
        <p>Your email has been successfully verified. Your account is now active.</p>
        <p class="redirect-text">Redirecting to login in {{ countdown }} seconds...</p>
        <router-link to="/login" class="login-link">Go to Login Now</router-link>
      </div>

      <div v-if="error" class="error-message">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
          />
        </svg>
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import API from '@/api/axios'

const route = useRoute()
const router = useRouter()
const email = ref(route.query.email || '')
const codeDigits = ref(['', '', '', '', '', ''])
const digitInputs = ref([])
const loading = ref(false)
const resendLoading = ref(false)
const verified = ref(false)
const error = ref('')
const resendTimer = ref(0)
const countdown = ref(3)

const isCodeComplete = computed(() => {
  return codeDigits.value.every((digit) => digit !== '')
})

const handleInput = (index, event) => {
  // Only allow numbers
  const value = event.target.value.replace(/[^0-9]/g, '')
  codeDigits.value[index] = value

  // Auto-focus next input
  if (value && index < 5) {
    digitInputs.value[index + 1].focus()
  }
}

const handleKeyDown = (index, event) => {
  // Handle backspace
  if (event.key === 'Backspace' && !codeDigits.value[index] && index > 0) {
    digitInputs.value[index - 1].focus()
  }

  // Handle left/right arrows
  if (event.key === 'ArrowLeft' && index > 0) {
    digitInputs.value[index - 1].focus()
  }
  if (event.key === 'ArrowRight' && index < 5) {
    digitInputs.value[index + 1].focus()
  }
}

const handlePaste = (event) => {
  event.preventDefault()
  const pastedData = event.clipboardData.getData('text').replace(/[^0-9]/g, '')

  // Fill in the digits
  for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
    codeDigits.value[i] = pastedData[i]
  }

  // Focus the next empty input or last input
  const nextEmptyIndex = codeDigits.value.findIndex((digit) => digit === '')
  if (nextEmptyIndex !== -1) {
    digitInputs.value[nextEmptyIndex].focus()
  } else {
    digitInputs.value[5].focus()
  }
}

const verifyCode = async () => {
  const code = codeDigits.value.join('')

  // Normalize email before sending
  const normalizedEmail = email.value.trim().toLowerCase()

  console.log('Verifying with:', {
    email: normalizedEmail,
    code: code,
  })

  loading.value = true
  error.value = ''

  try {
    const response = await API.post('/auth/verify-email', {
      email: normalizedEmail,
      code: code,
    })

    verified.value = true
    // ... rest of code
  } catch (err) {
    console.error('Verification error:', err.response?.data)
    error.value = err.response?.data?.message || 'Verification failed. Please try again.'
    codeDigits.value = ['', '', '', '', '', '']
    digitInputs.value[0].focus()
  } finally {
    loading.value = false
  }
}

const resendCode = async () => {
  resendLoading.value = true
  error.value = ''

  try {
    // Normalize email before sending
    const normalizedEmail = email.value.trim().toLowerCase()

    await API.post('/auth/resend-verification', {
      email: normalizedEmail,
    })

    resendTimer.value = 60
    const timer = setInterval(() => {
      resendTimer.value--
      if (resendTimer.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)

    codeDigits.value = ['', '', '', '', '', '']
    digitInputs.value[0].focus()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to resend code. Please try again.'
  } finally {
    resendLoading.value = false
  }
}

// Redirect to register if no email
onMounted(() => {
  if (!email.value) {
    router.push('/register')
  }
})
</script>

<style scoped>
.verify-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.verify-card {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  text-align: center;
}

.logo h2 {
  color: #667eea;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

h1 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1rem;
  line-height: 1.5;
}

.subtitle strong {
  color: #333;
  font-weight: 600;
}

.code-inputs {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.code-digit {
  width: 55px;
  height: 65px;
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  outline: none;
  transition: all 0.3s;
  background: #f8f9fa;
}

.code-digit:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

.code-digit:disabled {
  background: #f0f0f0;
  cursor: not-allowed;
  opacity: 0.7;
}

.verify-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.verify-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.verify-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.resend-section {
  margin: 1rem 0;
}

.timer-text {
  color: #666;
  font-size: 0.95rem;
}

.timer {
  color: #667eea;
  font-weight: bold;
  font-size: 1.1rem;
}

.resend-btn {
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.3s;
}

.resend-btn:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.1);
}

.resend-btn:disabled {
  color: #999;
  cursor: not-allowed;
}

.help-section {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.help-text {
  color: #888;
  font-size: 0.9rem;
  margin: 0;
}

.text-link {
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.text-link:hover {
  color: #764ba2;
}

.verified-success {
  text-align: center;
  padding: 1rem 0;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: #52c41a;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  animation: scaleIn 0.5s ease;
}

.verified-success h2 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.verified-success p {
  color: #666;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.redirect-text {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.login-link {
  display: inline-block;
  padding: 0.8rem 2rem;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: bold;
  transition: all 0.3s;
}

.login-link:hover {
  background: #764ba2;
  transform: translateY(-2px);
}

.error-message {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
  border-radius: 10px;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}

.spinner {
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

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .verify-card {
    padding: 1.5rem;
  }

  .code-digit {
    width: 45px;
    height: 55px;
    font-size: 1.5rem;
  }

  h1 {
    font-size: 1.5rem;
  }
}
</style>
