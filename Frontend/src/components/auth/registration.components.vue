<script setup>
import { ref, reactive, computed } from 'vue';
import { registerUsers } from '@/api/userService';

const registerForms = reactive({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    phone: ''
})

const successMessage = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

// Password strength indicator
const passwordStrength = computed(() => {
    const password = registerForms.password;
    if (!password) return 0;

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
});

// Phone number formatting
const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
};

const userLogin = async () => {
    successMessage.value = ''
    errorMessage.value = ''
    isLoading.value = true

    // Basic validation
    if (registerForms.password !== registerForms.confirmPassword) {
        errorMessage.value = "Passwords do not match"
        isLoading.value = false
        return
    }

    if (registerForms.password.length < 8) {
        errorMessage.value = "Password must be at least 8 characters"
        isLoading.value = false
        return
    }

    try {
        const res = await registerUsers({
            email: registerForms.email,
            firstName: registerForms.firstName,
            lastName: registerForms.lastName,
            password: registerForms.password,
            phone: registerForms.phone.replace(/\D/g, '')
        })

        successMessage.value = res.data.message || "Registration successful!"

        // Clear form
        Object.keys(registerForms).forEach(k => registerForms[k] = '')

    } catch (err) {
        errorMessage.value = err.response?.data?.message || "Registration failed. Please try again."
    } finally {
        isLoading.value = false
    }
}

// Handle phone input with formatting
const handlePhoneInput = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    registerForms.phone = formatted;
}
</script>

<template>
    <div class="registration-container">
        <div class="registration-card">
            <!-- Header Section -->
            <div class="header-section">
                <div class="logo-placeholder">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                        <path d="M12 6V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                </div>
                <h1 class="page-title">Create Account</h1>
                <p class="page-subtitle">Join our community today</p>
            </div>

            <!-- Registration Form -->
            <form @submit.prevent="userLogin" class="registration-form" novalidate>
                <!-- Name Fields (Side by side on desktop, stacked on mobile) -->
                <div class="name-fields">
                    <div class="input-group">
                        <label class="input-label">
                            <span>First Name</span>
                            <span class="required-indicator">*</span>
                        </label>
                        <input type="text" v-model="registerForms.firstName" required placeholder="John"
                            class="input-field" :disabled="isLoading" />
                    </div>

                    <div class="input-group">
                        <label class="input-label">
                            <span>Last Name</span>
                            <span class="required-indicator">*</span>
                        </label>
                        <input type="text" v-model="registerForms.lastName" required placeholder="Doe"
                            class="input-field" :disabled="isLoading" />
                    </div>
                </div>

                <!-- Email Field -->
                <div class="input-group">
                    <label class="input-label">
                        <span>Email Address</span>
                        <span class="required-indicator">*</span>
                    </label>
                    <input type="email" v-model="registerForms.email" required placeholder="john.doe@example.com"
                        class="input-field" :disabled="isLoading" autocapitalize="off" autocomplete="email" />
                </div>

                <!-- Phone Field -->
                <div class="input-group">
                    <label class="input-label">
                        <span>Phone Number</span>
                        <span class="required-indicator">*</span>
                    </label>
                    <input type="tel" v-model="registerForms.phone" @input="handlePhoneInput" required
                        placeholder="(123) 456-7890" class="input-field" :disabled="isLoading" autocomplete="tel" />
                </div>

                <!-- Password Field with Strength Indicator -->
                <div class="input-group">
                    <label class="input-label">
                        <span>Password</span>
                        <span class="required-indicator">*</span>
                    </label>
                    <input type="password" v-model="registerForms.password" required placeholder="At least 8 characters"
                        class="input-field" :disabled="isLoading" autocomplete="new-password" />

                    <!-- Password Strength Indicator -->
                    <div v-if="registerForms.password" class="password-strength">
                        <div class="strength-bars">
                            <div v-for="i in 4" :key="i" class="strength-bar" :class="{
                                'weak': passwordStrength === 1,
                                'fair': passwordStrength === 2,
                                'good': passwordStrength === 3,
                                'strong': passwordStrength === 4,
                                'active': i <= passwordStrength
                            }"></div>
                        </div>
                        <span class="strength-text">
                            {{
                                passwordStrength === 1 ? 'Weak' :
                                    passwordStrength === 2 ? 'Fair' :
                                        passwordStrength === 3 ? 'Good' :
                                            passwordStrength === 4 ? 'Strong' : ''
                            }}
                        </span>
                    </div>

                    <!-- Password Requirements -->
                    <ul v-if="registerForms.password" class="password-requirements">
                        <li :class="{ 'met': registerForms.password.length >= 8 }">
                            At least 8 characters
                        </li>
                        <li :class="{ 'met': /[A-Z]/.test(registerForms.password) }">
                            One uppercase letter
                        </li>
                        <li :class="{ 'met': /[0-9]/.test(registerForms.password) }">
                            One number
                        </li>
                        <li :class="{ 'met': /[^A-Za-z0-9]/.test(registerForms.password) }">
                            One special character
                        </li>
                    </ul>
                </div>

                <!-- Confirm Password Field -->
                <div class="input-group">
                    <label class="input-label">
                        <span>Confirm Password</span>
                        <span class="required-indicator">*</span>
                    </label>
                    <input type="password" v-model="registerForms.confirmPassword" required
                        placeholder="Re-enter your password" class="input-field"
                        :class="{ 'error-border': registerForms.confirmPassword && registerForms.password !== registerForms.confirmPassword }"
                        :disabled="isLoading" autocomplete="new-password" />
                    <p v-if="registerForms.confirmPassword && registerForms.password !== registerForms.confirmPassword"
                        class="validation-error">
                        Passwords do not match
                    </p>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="submit-button" :class="{ 'loading': isLoading }" :disabled="isLoading">
                    <span v-if="!isLoading">Create Account</span>
                    <span v-if="isLoading" class="loading-spinner"></span>
                </button>

                <!-- Messages -->
                <div class="messages-container">
                    <p v-if="successMessage" class="success-message" role="alert">
                        <span class="icon">✓</span>
                        {{ successMessage }}
                    </p>
                    <p v-if="errorMessage" class="error-message" role="alert">
                        <span class="icon">!</span>
                        {{ errorMessage }}
                    </p>
                </div>

                <!-- Login Link -->
                <p class="login-link">
                    Already have an account?
                    <a href="/login" class="link">Sign in</a>
                </p>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* Reset and Base Styles */
.registration-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Card Styles */
.registration-card {
    width: 100%;
    max-width: 440px;
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.4s ease-out;
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

/* Header Section */
.header-section {
    text-align: center;
    margin-bottom: 2rem;
}

.logo-placeholder {
    width: 64px;
    height: 64px;
    margin: 0 auto 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    color: white;
}

.page-title {
    font-size: 1.875rem;
    font-weight: 700;
    color: #1a202c;
    margin: 0 0 0.5rem;
    line-height: 1.2;
}

.page-subtitle {
    font-size: 0.875rem;
    color: #718096;
    margin: 0;
}

/* Form Layout */
.registration-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.name-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

@media (max-width: 640px) {
    .name-fields {
        grid-template-columns: 1fr;
    }
}

/* Input Styles */
.input-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.input-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #2d3748;
    display: flex;
    gap: 0.25rem;
}

.required-indicator {
    color: #e53e3e;
}

.input-field {
    padding: 0.75rem 1rem;
    font-size: 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    transition: all 0.2s ease;
    background: white;
    color: #1a202c;
    width: 100%;
    box-sizing: border-box;
}

.input-field:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-field:disabled {
    background-color: #f7fafc;
    cursor: not-allowed;
    opacity: 0.7;
}

.input-field.error-border {
    border-color: #fc8181;
}

/* Password Strength */
.password-strength {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.5rem;
}

.strength-bars {
    display: flex;
    gap: 4px;
    flex: 1;
}

.strength-bar {
    height: 4px;
    flex: 1;
    background: #e2e8f0;
    border-radius: 2px;
    transition: all 0.3s ease;
}

.strength-bar.active.weak {
    background: #fc8181;
}

.strength-bar.active.fair {
    background: #f6ad55;
}

.strength-bar.active.good {
    background: #68d391;
}

.strength-bar.active.strong {
    background: #38a169;
}

.strength-text {
    font-size: 0.75rem;
    font-weight: 500;
    color: #718096;
    min-width: 48px;
    text-align: right;
}

/* Password Requirements */
.password-requirements {
    margin: 0.5rem 0 0;
    padding: 0;
    list-style: none;
}

.password-requirements li {
    font-size: 0.75rem;
    color: #718096;
    margin-bottom: 0.25rem;
    padding-left: 1.25rem;
    position: relative;
}

.password-requirements li:before {
    content: "○";
    position: absolute;
    left: 0;
    color: #cbd5e0;
}

.password-requirements li.met {
    color: #38a169;
}

.password-requirements li.met:before {
    content: "✓";
    color: #38a169;
}

/* Validation Error */
.validation-error {
    font-size: 0.75rem;
    color: #e53e3e;
    margin: 0.25rem 0 0;
}

/* Submit Button */
.submit-button {
    margin-top: 0.5rem;
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
}

.submit-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.submit-button:active:not(:disabled) {
    transform: translateY(0);
}

.submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.submit-button.loading {
    color: transparent;
}

/* Loading Spinner */
.loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}

/* Messages */
.messages-container {
    margin-top: 0.5rem;
}

.success-message,
.error-message {
    padding: 0.875rem 1rem;
    border-radius: 8px;
    font-size: 0.875rem;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin: 0;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.success-message {
    background: #f0fff4;
    color: #276749;
    border: 1px solid #c6f6d5;
}

.error-message {
    background: #fff5f5;
    color: #c53030;
    border: 1px solid #fed7d7;
}

.success-message .icon,
.error-message .icon {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.875rem;
}

.success-message .icon {
    background: #38a169;
    color: white;
    border-radius: 50%;
}

.error-message .icon {
    background: #e53e3e;
    color: white;
    border-radius: 50%;
}

/* Login Link */
.login-link {
    text-align: center;
    font-size: 0.875rem;
    color: #718096;
    margin: 1rem 0 0;
}

.link {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
}

.link:hover {
    color: #764ba2;
    text-decoration: underline;
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {

    .registration-card,
    .input-field,
    .submit-button,
    .success-message,
    .error-message {
        animation: none;
        transition: none;
    }
}

/* High Contrast Support */
@media (prefers-contrast: high) {
    .input-field {
        border-width: 2px;
    }

    .input-field:focus {
        border-width: 3px;
    }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
    .registration-card {
        background: #1a202c;
        color: #e2e8f0;
    }

    .page-title {
        color: #f7fafc;
    }

    .page-subtitle {
        color: #a0aec0;
    }

    .input-label {
        color: #e2e8f0;
    }

    .input-field {
        background: #2d3748;
        border-color: #4a5568;
        color: #e2e8f0;
    }

    .input-field:focus {
        border-color: #667eea;
    }

    .input-field:disabled {
        background-color: #4a5568;
    }

    .login-link {
        color: #a0aec0;
    }
}
</style>