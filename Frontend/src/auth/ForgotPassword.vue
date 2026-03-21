<template>
    <div class="forgot-password-container">
        <div class="forgot-password-card">
            <div class="card-header">
                <h2>Forgot Password?</h2>
                <p class="subtitle">Enter your email address and we'll send you a link to reset your password</p>
            </div>

            <form @submit.prevent="handleForgotPassword" class="forgot-form">
                <div class="input-group" :class="{ 'has-error': errors.email }">
                    <label for="email">Email Address</label>
                    <input id="email" type="email" v-model="email" placeholder="your@email.com" required
                        :disabled="loading" @input="clearError" />
                    <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
                </div>

                <button type="submit" :disabled="loading || !email" class="submit-btn">
                    <span v-if="loading" class="spinner"></span>
                    {{ loading ? 'Sending...' : 'Send Reset Link' }}
                </button>

                <div class="back-to-login">
                    <router-link to="/login" class="back-link">
                        ← Back to Login
                    </router-link>
                </div>

                <!-- Success Message -->
                <transition name="fade">
                    <div v-if="successMessage" class="success-message">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                        {{ successMessage }}
                    </div>
                </transition>

                <!-- Error Message -->
                <transition name="fade">
                    <div v-if="errorMessage" class="error-message">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                        {{ errorMessage }}
                    </div>
                </transition>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import API from '@/api/axios'

const router = useRouter()
const email = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const errors = ref({ email: '' })

const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
}

const clearError = () => {
    errors.value.email = ''
    errorMessage.value = ''
}

const handleForgotPassword = async () => {
    if (!email.value) {
        errors.value.email = 'Email is required'
        return
    }

    if (!validateEmail(email.value)) {
        errors.value.email = 'Please enter a valid email address'
        return
    }

    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const response = await API.post('/auth/forgot-password', { email: email.value })
        successMessage.value = response.data.message

        // Clear email field after success
        email.value = ''

        // Optionally redirect after 3 seconds
        setTimeout(() => {
            router.push('/login')
        }, 3000)
    } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Something went wrong. Please try again.'
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.forgot-password-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.forgot-password-card {
    background: white;
    border-radius: 24px;
    padding: 40px;
    width: 100%;
    max-width: 450px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.card-header {
    text-align: center;
    margin-bottom: 30px;
}

.card-header h2 {
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 8px;
}

.subtitle {
    color: #64748b;
    font-size: 14px;
    line-height: 1.5;
}

.input-group {
    margin-bottom: 24px;
    text-align: left;
}

.input-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #334155;
    font-size: 14px;
}

.input-group input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 16px;
    transition: all 0.3s ease;
}

.input-group input:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.input-group.has-error input {
    border-color: #ef4444;
}

.field-error {
    display: block;
    color: #ef4444;
    font-size: 12px;
    margin-top: 4px;
}

.submit-btn {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 20px;
}

.submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
}

.submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.back-to-login {
    text-align: center;
}

.back-link {
    color: #4f46e5;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.back-link:hover {
    color: #7c3aed;
}

.success-message,
.error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 14px;
    margin-top: 20px;
}

.success-message {
    background: #d1fae5;
    color: #065f46;
}

.success-message svg {
    stroke: #065f46;
}

.error-message {
    background: #fee2e2;
    color: #991b1b;
}

.error-message svg {
    stroke: #991b1b;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@media (max-width: 480px) {
    .forgot-password-card {
        padding: 30px 20px;
    }
}
</style>