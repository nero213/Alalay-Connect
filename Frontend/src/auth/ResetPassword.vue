<template>
    <div class="reset-password-container">
        <div class="reset-password-card">
            <div class="card-header">
                <h2>Create New Password</h2>
                <p class="subtitle">Enter your new password below</p>
            </div>

            <form @submit.prevent="handleResetPassword" class="reset-form">
                <div class="input-group" :class="{ 'has-error': errors.password }">
                    <label for="password">New Password</label>
                    <div class="password-wrapper">
                        <input id="password" :type="showPassword ? 'text' : 'password'" v-model="password"
                            placeholder="••••••••" required :disabled="loading" @input="validatePassword" />
                        <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                            {{ showPassword ? 'Hide' : 'Show' }}
                        </button>
                    </div>
                    <div class="password-strength" v-if="password">
                        <div class="strength-bar">
                            <div class="strength-fill" :class="passwordStrengthClass"
                                :style="{ width: passwordStrength + '%' }"></div>
                        </div>
                        <span>{{ passwordStrengthText }}</span>
                    </div>
                    <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
                </div>

                <div class="input-group" :class="{ 'has-error': errors.confirmPassword }">
                    <label for="confirmPassword">Confirm New Password</label>
                    <div class="password-wrapper">
                        <input id="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                            v-model="confirmPassword" placeholder="••••••••" required :disabled="loading"
                            @input="validateConfirmPassword" />
                        <button type="button" class="password-toggle"
                            @click="showConfirmPassword = !showConfirmPassword">
                            {{ showConfirmPassword ? 'Hide' : 'Show' }}
                        </button>
                    </div>
                    <span v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</span>
                </div>

                <button type="submit" :disabled="loading || !isFormValid" class="submit-btn">
                    <span v-if="loading" class="spinner"></span>
                    {{ loading ? 'Resetting...' : 'Reset Password' }}
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import API from '@/api/axios'

const route = useRoute()
const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const token = ref('')
const tokenValid = ref(false)

const errors = ref({
    password: '',
    confirmPassword: ''
})

// Password strength
const passwordStrength = computed(() => {
    const pwd = password.value
    if (!pwd) return 0
    let strength = 0
    if (pwd.length >= 8) strength += 25
    if (/[A-Z]/.test(pwd)) strength += 25
    if (/[0-9]/.test(pwd)) strength += 25
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 25
    return strength
})

const passwordStrengthClass = computed(() => {
    if (passwordStrength.value < 50) return 'weak'
    if (passwordStrength.value < 75) return 'medium'
    return 'strong'
})

const passwordStrengthText = computed(() => {
    if (passwordStrength.value < 50) return 'Weak'
    if (passwordStrength.value < 75) return 'Medium'
    return 'Strong'
})

const isFormValid = computed(() => {
    return password.value &&
        confirmPassword.value &&
        !errors.value.password &&
        !errors.value.confirmPassword &&
        password.value === confirmPassword.value &&
        password.value.length >= 6
})

const validatePassword = () => {
    if (!password.value) {
        errors.value.password = 'Password is required'
    } else if (password.value.length < 6) {
        errors.value.password = 'Password must be at least 6 characters'
    } else {
        errors.value.password = ''
    }
}

const validateConfirmPassword = () => {
    if (!confirmPassword.value) {
        errors.value.confirmPassword = 'Please confirm your password'
    } else if (password.value !== confirmPassword.value) {
        errors.value.confirmPassword = 'Passwords do not match'
    } else {
        errors.value.confirmPassword = ''
    }
}

// Verify token on mount
const verifyToken = async () => {
    const urlToken = route.query.token
    if (!urlToken) {
        errorMessage.value = 'Invalid or missing reset token'
        setTimeout(() => router.push('/forgot-password'), 2000)
        return
    }

    token.value = urlToken

    try {
        const response = await API.get(`/auth/verify-reset-token/${token.value}`)
        if (response.data.valid) {
            tokenValid.value = true
        } else {
            errorMessage.value = 'Invalid or expired reset token'
            setTimeout(() => router.push('/forgot-password'), 2000)
        }
    } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Invalid or expired token'
        setTimeout(() => router.push('/forgot-password'), 2000)
    }
}

const handleResetPassword = async () => {
    validatePassword()
    validateConfirmPassword()

    if (!isFormValid.value) return

    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const response = await API.post('/auth/reset-password', {
            token: token.value,
            newPassword: password.value,
            confirmPassword: confirmPassword.value
        })

        successMessage.value = response.data.message
        setTimeout(() => {
            router.push('/login')
        }, 3000)
    } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Failed to reset password. Please try again.'
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    verifyToken()
})
</script>

<style scoped>
.reset-password-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.reset-password-card {
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
}

.input-group {
    margin-bottom: 20px;
    text-align: left;
}

.input-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #334155;
    font-size: 14px;
}

.password-wrapper {
    position: relative;
}

.password-wrapper input {
    width: 100%;
    padding: 12px 16px;
    padding-right: 70px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 16px;
    transition: all 0.3s ease;
}

.password-wrapper input:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.password-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #4f46e5;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    padding: 4px 8px;
}

.password-toggle:hover {
    background: #f1f5f9;
    border-radius: 6px;
}

.password-strength {
    margin-top: 8px;
}

.strength-bar {
    height: 4px;
    background: #e2e8f0;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 4px;
}

.strength-fill {
    height: 100%;
    transition: width 0.3s ease;
}

.strength-fill.weak {
    background: #ef4444;
}

.strength-fill.medium {
    background: #f59e0b;
}

.strength-fill.strong {
    background: #10b981;
}

.password-strength span {
    font-size: 11px;
    color: #64748b;
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
    margin-top: 8px;
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
    .reset-password-card {
        padding: 30px 20px;
    }
}
</style>