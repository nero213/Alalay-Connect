<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { registerUsers } from '@/api/userService'
import { getCities, getBarangays } from '@/utils/locationService'
import { getCoordinatesFromLocation } from '@/utils/locationCoordinates'

const router = useRouter()

// Form data with reactive object
const registerForms = reactive({
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
  phone: '',
  city: '',
  barangay: '',
  latitude: null,
  longitude: null
})

// Validation errors
const errors = reactive({
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
  phone: '',
  city: '',
  barangay: ''
})

// UI state
const successMessage = ref('')
const errorMessage = ref('')
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const acceptedTerms = ref(false)

// Modal states
const showTermsModal = ref(false)
const showPrivacyModal = ref(false)

// Available cities from location service
const cities = getCities()

// Available barangays based on selected city
const availableBarangays = computed(() => {
  if (!registerForms.city) return []
  return getBarangays(registerForms.city)
})

// Update coordinates based on selected city/barangay
const updateCoordinates = () => {
  if (registerForms.city) {
    const coords = getCoordinatesFromLocation(registerForms.city, registerForms.barangay)
    if (coords && coords.lat && coords.lng) {
      registerForms.latitude = coords.lat
      registerForms.longitude = coords.lng
      console.log('Coordinates found:', coords)
    }
  }
}

// Reset barangay when city changes and update coordinates
const onCityChange = () => {
  registerForms.barangay = ''
  updateCoordinates()
  validateField('city')
  validateField('barangay')
}

// Update coordinates when barangay changes
const onBarangayChange = () => {
  updateCoordinates()
  validateField('barangay')
}

// Email validation
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Phone validation (Philippines format)
const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/ // Exactly 10 digits
  return re.test(phone)
}

// Password validation
const validatePassword = (password) => {
  const errors = []
  if (password.length < 8) errors.push('at least 8 characters')
  if (!/[A-Z]/.test(password)) errors.push('one uppercase letter')
  if (!/[0-9]/.test(password)) errors.push('one number')
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('one special character')
  return errors
}

// Computed properties
const passwordsMatch = computed(() => {
  if (!registerForms.confirmPassword) return null
  return registerForms.password === registerForms.confirmPassword
})

const passwordStrength = computed(() => {
  const password = registerForms.password
  let score = 0

  if (!password) return 0

  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  return score
})

const strengthLabel = computed(() => {
  switch (passwordStrength.value) {
    case 0:
    case 1:
      return { text: 'Weak', class: 'weak' }
    case 2:
      return { text: 'Medium', class: 'medium' }
    case 3:
    case 4:
      return { text: 'Strong', class: 'strong' }
    default:
      return { text: '', class: '' }
  }
})

const passwordErrors = computed(() => {
  if (!registerForms.password) return []
  return validatePassword(registerForms.password)
})

const isFormValid = computed(() => {
  return (
    registerForms.email &&
    registerForms.firstName &&
    registerForms.lastName &&
    registerForms.password &&
    registerForms.confirmPassword &&
    registerForms.phone &&
    registerForms.city &&
    registerForms.barangay &&
    acceptedTerms.value &&
    validateEmail(registerForms.email) &&
    passwordsMatch.value === true &&
    passwordStrength.value >= 2 && // At least medium strength
    validatePhone(registerForms.phone)
  )
})

// Validation methods
const validateField = (field) => {
  switch (field) {
    case 'email':
      if (!registerForms.email) {
        errors.email = 'Email is required'
      } else if (!validateEmail(registerForms.email)) {
        errors.email = 'Please enter a valid email address'
      } else {
        errors.email = ''
      }
      break

    case 'firstName':
      if (!registerForms.firstName) {
        errors.firstName = 'First name is required'
      } else if (registerForms.firstName.length < 2) {
        errors.firstName = 'First name must be at least 2 characters'
      } else if (!/^[A-Za-z\s-]+$/.test(registerForms.firstName)) {
        errors.firstName = 'First name can only contain letters, spaces, and hyphens'
      } else {
        errors.firstName = ''
      }
      break

    case 'lastName':
      if (!registerForms.lastName) {
        errors.lastName = 'Last name is required'
      } else if (registerForms.lastName.length < 2) {
        errors.lastName = 'Last name must be at least 2 characters'
      } else if (!/^[A-Za-z\s-]+$/.test(registerForms.lastName)) {
        errors.lastName = 'Last name can only contain letters, spaces, and hyphens'
      } else {
        errors.lastName = ''
      }
      break

    case 'password':
      if (!registerForms.password) {
        errors.password = 'Password is required'
      } else if (passwordErrors.value.length > 0) {
        errors.password = 'Password does not meet requirements'
      } else {
        errors.password = ''
      }
      if (registerForms.confirmPassword) {
        validateField('confirmPassword')
      }
      break

    case 'confirmPassword':
      if (!registerForms.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password'
      } else if (registerForms.password !== registerForms.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
      } else {
        errors.confirmPassword = ''
      }
      break

    case 'phone':
      const cleanedPhone = registerForms.phone.replace(/\D/g, '')
      if (!cleanedPhone) {
        errors.phone = 'Phone number is required'
      } else if (!validatePhone(cleanedPhone)) {
        errors.phone = 'Please enter a valid 10-digit phone number'
      } else {
        errors.phone = ''
      }
      break

    case 'city':
      if (!registerForms.city) {
        errors.city = 'Please select your city/municipality'
      } else {
        errors.city = ''
      }
      break

    case 'barangay':
      if (!registerForms.barangay) {
        errors.barangay = 'Please select your barangay'
      } else {
        errors.barangay = ''
      }
      break
  }
}

// Handle phone input
const handlePhoneInput = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  if (value.length > 10) value = value.slice(0, 10)
  registerForms.phone = value
  validateField('phone')
}

// Handle input with validation
const handleInput = (field) => {
  successMessage.value = ''
  errorMessage.value = ''
  validateField(field)
}

// Open modals
const openTermsModal = (e) => {
  e.preventDefault()
  showTermsModal.value = true
}

const openPrivacyModal = (e) => {
  e.preventDefault()
  showPrivacyModal.value = true
}

// Close modals
const closeTermsModal = () => {
  showTermsModal.value = false
}

const closePrivacyModal = () => {
  showPrivacyModal.value = false
}

// Submit form
const userRegister = async () => {
  // Validate all fields
  Object.keys(registerForms).forEach((field) => validateField(field))

  if (!isFormValid.value) {
    errorMessage.value = 'Please fix the errors before submitting'
    return
  }

  if (!acceptedTerms.value) {
    errorMessage.value = 'Please accept the Terms and Conditions'
    return
  }

  successMessage.value = ''
  errorMessage.value = ''
  loading.value = true

  try {
    // Clean phone number
    const cleanPhone = registerForms.phone.replace(/\D/g, '')
    const formattedPhone = cleanPhone.startsWith('0') ? cleanPhone : `0${cleanPhone}`

    // Prepare registration data with coordinates
    const registrationData = {
      email: registerForms.email.trim().toLowerCase(),
      firstName: registerForms.firstName.trim(),
      lastName: registerForms.lastName.trim(),
      password: registerForms.password,
      phone: formattedPhone,
      city: registerForms.city,
      barangay: registerForms.barangay,
      latitude: registerForms.latitude,
      longitude: registerForms.longitude
    }

    console.log('Registration data:', registrationData)

    const res = await registerUsers(registrationData)

    if (res.data.requiresVerification) {
      router.push({
        path: '/verify-email',
        query: { email: registerForms.email.trim().toLowerCase() },
      })
    } else {
      successMessage.value = res.data.message || 'Registration successful! Redirecting to login...'
      Object.keys(registerForms).forEach((k) => (registerForms[k] = ''))
      acceptedTerms.value = false

      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}

// Format name to capitalize first letter
const formatName = (field) => {
  if (registerForms[field]) {
    registerForms[field] = registerForms[field]
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }
}
</script>

<template>
  <div class="register-container">
    <div class="register-box">
      <h1>Create Account</h1>
      <p class="subtitle">Join us today! Fill in your details below.</p>

      <form @submit.prevent="userRegister" novalidate>
        <!-- Email Field -->
        <div class="input-group" :class="{ 'has-error': errors.email }">
          <label for="email">Email Address</label>
          <input id="email" type="email" v-model="registerForms.email" placeholder="your@email.com" required
            @input="handleInput('email')" @blur="validateField('email')" :disabled="loading" />
          <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
        </div>

        <!-- First Name Field -->
        <div class="input-group" :class="{ 'has-error': errors.firstName }">
          <label for="firstName">First Name</label>
          <input id="firstName" type="text" v-model="registerForms.firstName" placeholder="John" required
            @input="handleInput('firstName')" @blur="formatName('firstName')" :disabled="loading" />
          <span v-if="errors.firstName" class="field-error">{{ errors.firstName }}</span>
        </div>

        <!-- Last Name Field -->
        <div class="input-group" :class="{ 'has-error': errors.lastName }">
          <label for="lastName">Last Name</label>
          <input id="lastName" type="text" v-model="registerForms.lastName" placeholder="Doe" required
            @input="handleInput('lastName')" @blur="formatName('lastName')" :disabled="loading" />
          <span v-if="errors.lastName" class="field-error">{{ errors.lastName }}</span>
        </div>

        <!-- City/Municipality Field -->
        <div class="input-group" :class="{ 'has-error': errors.city }">
          <label for="city">City/Municipality</label>
          <select id="city" v-model="registerForms.city" class="location-select" @change="onCityChange"
            @blur="validateField('city')" :disabled="loading">
            <option value="">Select your city/municipality</option>
            <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
          </select>
          <span v-if="errors.city" class="field-error">{{ errors.city }}</span>
        </div>

        <!-- Barangay Field -->
        <div class="input-group" :class="{ 'has-error': errors.barangay }">
          <label for="barangay">Barangay</label>
          <select id="barangay" v-model="registerForms.barangay" class="location-select"
            :disabled="!registerForms.city || loading" @change="onBarangayChange" @blur="validateField('barangay')">
            <option value="">Select your barangay</option>
            <option v-for="barangay in availableBarangays" :key="barangay" :value="barangay">
              {{ barangay }}
            </option>
          </select>
          <span v-if="errors.barangay" class="field-error">{{ errors.barangay }}</span>
          <small v-if="!registerForms.city" class="hint">Please select city/municipality first</small>
        </div>

        <!-- Password Field -->
        <div class="input-group" :class="{ 'has-error': errors.password }">
          <label for="password">Password</label>
          <div class="password-wrapper">
            <input id="password" :type="showPassword ? 'text' : 'password'" v-model="registerForms.password"
              placeholder="••••••••" required @input="handleInput('password')" @blur="validateField('password')"
              :disabled="loading" />
            <button type="button" class="password-toggle" @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>

          <!-- Password strength indicator -->
          <div class="strength-wrapper" v-if="registerForms.password">
            <div class="strength-bar">
              <div class="strength-fill" :class="strengthLabel.class" :style="{ width: passwordStrength * 25 + '%' }">
              </div>
            </div>
            <small :class="strengthLabel.class"> {{ strengthLabel.text }} Password </small>
          </div>

          <!-- Password requirements -->
          <div v-if="registerForms.password && passwordErrors.length > 0" class="password-requirements">
            <small>Password must contain:</small>
            <ul>
              <li v-for="(error, index) in passwordErrors" :key="index" class="requirement-item">
                ✗ {{ error }}
              </li>
            </ul>
          </div>

          <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
        </div>

        <!-- Confirm Password Field -->
        <div class="input-group" :class="{ 'has-error': errors.confirmPassword }">
          <label for="confirmPassword">Confirm Password</label>
          <div class="password-wrapper">
            <input id="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
              v-model="registerForms.confirmPassword" placeholder="••••••••" :class="{
                'input-success': passwordsMatch === true,
                'input-error': passwordsMatch === false,
              }" required @input="handleInput('confirmPassword')" @blur="validateField('confirmPassword')"
              :disabled="loading" />
            <button type="button" class="password-toggle" @click="showConfirmPassword = !showConfirmPassword"
              :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'">
              {{ showConfirmPassword ? 'Hide' : 'Show' }}
            </button>
          </div>

          <!-- Password match feedback -->
          <div v-if="registerForms.confirmPassword" class="confirm-feedback">
            <small v-if="passwordsMatch" class="match"> ✓ Passwords match </small>
            <small v-else class="no-match"> ✗ Passwords do not match </small>
          </div>

          <span v-if="errors.confirmPassword" class="field-error">{{
            errors.confirmPassword
            }}</span>
        </div>

        <!-- Phone Field -->
        <div class="input-group" :class="{ 'has-error': errors.phone }">
          <label for="phone">Phone Number</label>
          <div class="phone-wrapper">
            <div class="country-code">
              <span class="flag">🇵🇭</span>
              <span>+63</span>
            </div>
            <input id="phone" type="tel" v-model="registerForms.phone" placeholder="9XXXXXXXXX" maxlength="10" required
              @input="handlePhoneInput" @blur="validateField('phone')" :disabled="loading" />
          </div>
          <small class="hint">Enter 10-digit mobile number (e.g., 9123456789)</small>
          <span v-if="errors.phone" class="field-error">{{ errors.phone }}</span>
        </div>

        <!-- Terms and Conditions -->
        <div class="terms-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="acceptedTerms" :disabled="loading" />
            <span>I accept the <a href="#" @click.prevent="openTermsModal">Terms and Conditions</a> and
              <a href="#" @click.prevent="openPrivacyModal">Privacy Policy</a></span>
          </label>
        </div>

        <!-- Submit Button -->
        <button type="submit" :disabled="loading || !isFormValid" class="submit-btn">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Creating Account...' : 'Create Account' }}
        </button>

        <!-- Login Link -->
        <div class="login-link">
          Already have an account?
          <router-link to="/login">Sign in</router-link>
        </div>

        <!-- Messages -->
        <transition name="fade">
          <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        </transition>
        <transition name="fade">
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </transition>
      </form>
    </div>

    <!-- Terms and Conditions Modal -->
    <div v-if="showTermsModal" class="modal-overlay" @click="closeTermsModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Terms and Conditions</h3>
          <button @click="closeTermsModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="terms-content">
            <h4>1. Acceptance of Terms</h4>
            <p>By registering for Alalay Connect, you agree to be bound by these Terms and Conditions.</p>

            <h4>2. User Accounts</h4>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account.</p>

            <h4>3. User Conduct</h4>
            <p>You agree to use the platform only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the platform.</p>

            <h4>4. Bookings and Payments</h4>
            <p>All bookings made through the platform are binding. Users agree to honor their commitments and pay for services rendered.</p>

            <h4>5. Cancellation Policy</h4>
            <p>Cancellations must be made at least 24 hours before the scheduled service. Late cancellations may incur fees.</p>

            <h4>6. Ratings and Reviews</h4>
            <p>Users agree to provide honest and constructive feedback. False or malicious reviews may result in account suspension.</p>

            <h4>7. Limitation of Liability</h4>
            <p>Alalay Connect acts as a platform connecting users. We are not liable for any damages arising from the use of our services.</p>

            <h4>8. Modifications</h4>
            <p>We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of modified terms.</p>

            <h4>9. Termination</h4>
            <p>We reserve the right to terminate accounts that violate these terms or engage in prohibited activities.</p>

            <h4>10. Governing Law</h4>
            <p>These terms shall be governed by the laws of the Republic of the Philippines.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeTermsModal" class="btn-primary">I Understand</button>
        </div>
      </div>
    </div>

    <!-- Privacy Policy Modal -->
    <div v-if="showPrivacyModal" class="modal-overlay" @click="closePrivacyModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Privacy Policy</h3>
          <button @click="closePrivacyModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="privacy-content">
            <h4>Information We Collect</h4>
            <p>We collect personal information including name, email address, phone number, location data, and transaction history.</p>

            <h4>How We Use Your Information</h4>
            <p>Your information is used to:</p>
            <ul>
              <li>Create and manage your account</li>
              <li>Facilitate bookings and payments</li>
              <li>Communicate with you about your bookings</li>
              <li>Improve our services</li>
              <li>Send important updates and notifications</li>
            </ul>

            <h4>Data Sharing</h4>
            <p>We share your information with:</p>
            <ul>
              <li>Skilled workers when you book their services</li>
              <li>Payment processors for transactions</li>
              <li>Legal authorities when required by law</li>
            </ul>

            <h4>Data Security</h4>
            <p>We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>

            <h4>Your Rights</h4>
            <p>You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.</p>

            <h4>Cookies</h4>
            <p>We use cookies to enhance your browsing experience and analyze site traffic.</p>

            <h4>Changes to Privacy Policy</h4>
            <p>We may update this privacy policy periodically. Continued use of the platform indicates acceptance of changes.</p>

            <h4>Contact Us</h4>
            <p>If you have questions about this privacy policy, contact us at privacy@alalayconnect.com</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closePrivacyModal" class="btn-primary">I Understand</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add modal styles */
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
  z-index: 1000;
  backdrop-filter: blur(3px);
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #f1f5f9;
}

.modal-body {
  padding: 1.5rem;
}

.terms-content,
.privacy-content {
  color: #334155;
  line-height: 1.6;
}

.terms-content h4,
.privacy-content h4 {
  color: #1e293b;
  margin: 1rem 0 0.5rem 0;
  font-size: 1rem;
}

.terms-content p,
.privacy-content p {
  margin-bottom: 1rem;
}

.terms-content ul,
.privacy-content ul {
  margin: 0.5rem 0 1rem 1.5rem;
  padding-left: 0;
}

.terms-content li,
.privacy-content li {
  margin-bottom: 0.25rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  text-align: center;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(79, 70, 229, 0.3);
}

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

/* Keep all your existing styles below */
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-box {
  background-color: #fff;
  padding: 40px 50px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 550px;
  text-align: center;
}

.register-box h1 {
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

.input-group input,
.input-group select {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
}

.input-group input:focus,
.input-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.location-select {
  background-color: white;
  cursor: pointer;
}

.location-select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

.input-group.has-error input,
.input-group.has-error select {
  border-color: #ff4d4f;
}

.input-group.has-error input:focus,
.input-group.has-error select:focus {
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

.hint {
  display: block;
  color: #888;
  font-size: 12px;
  margin-top: 4px;
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

.strength-wrapper {
  margin-top: 8px;
  text-align: left;
}

.strength-bar {
  height: 6px;
  background: #ddd;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 4px;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.strength-fill.weak {
  background: #ff4d4f;
}

.strength-fill.medium {
  background: #faad14;
}

.strength-fill.strong {
  background: #52c41a;
}

small.weak {
  color: #ff4d4f;
}

small.medium {
  color: #faad14;
}

small.strong {
  color: #52c41a;
}

.password-requirements {
  background: #f9f9f9;
  padding: 10px;
  border-radius: 8px;
  margin-top: 8px;
  font-size: 12px;
  border: 1px solid #e0e0e0;
}

.password-requirements small {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-weight: 500;
}

.password-requirements ul {
  margin: 0;
  padding-left: 20px;
}

.requirement-item {
  color: #ff4d4f;
  margin-bottom: 2px;
}

.confirm-feedback {
  margin-top: 5px;
  text-align: left;
}

.match {
  color: #52c41a;
  font-weight: 500;
}

.no-match {
  color: #ff4d4f;
  font-weight: 500;
}

.input-success {
  border-color: #52c41a !important;
}

.input-error {
  border-color: #ff4d4f !important;
}

.phone-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.phone-wrapper:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.country-code {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f5f5f5;
  padding: 12px 15px;
  font-weight: 500;
  border-right: 2px solid #e0e0e0;
  color: #333;
}

.flag {
  font-size: 18px;
}

.phone-wrapper input {
  border: none;
  outline: none;
  padding: 12px 15px;
  flex: 1;
}

.phone-wrapper input:focus {
  box-shadow: none;
}

.terms-group {
  margin: 20px 0;
  text-align: left;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #555;
}

.checkbox-label input[type='checkbox'] {
  width: auto;
  margin-right: 8px;
  cursor: pointer;
}

.checkbox-label a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.checkbox-label a:hover {
  text-decoration: underline;
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

.login-link {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-top: 15px;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  margin-left: 5px;
}

.login-link a:hover {
  text-decoration: underline;
}

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

@media (max-width: 480px) {
  .register-box {
    padding: 30px 20px;
  }

  .modal-content {
    width: 95%;
  }
}
</style>