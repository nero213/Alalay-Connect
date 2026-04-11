<!-- frontend/src/views/UserProfilePrivate.vue -->
<template>
  <div class="user-private-profile">
    <noSearchNavbar />

    <div class="profile-container">
      <div class="profile-header-section">
        <h1>My Profile</h1>
        <p>View and manage your personal information</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading your profile...</p>
      </div>

      <!-- Profile Content -->
      <div v-else-if="user" class="profile-content">
        <!-- Main Profile Card -->
        <div class="profile-main-card">
          <!-- Profile Image Section -->
          <div class="profile-image-section">
            <div class="profile-image-wrapper">
              <img :src="profileImageUrl" :alt="user.firstName" class="profile-image" />
              <button
                @click="triggerImageUpload"
                class="image-upload-btn"
                title="Change profile photo"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
                    stroke="white"
                    stroke-width="1.5"
                  />
                  <circle cx="12" cy="13" r="4" stroke="white" stroke-width="1.5" />
                </svg>
              </button>
              <input
                type="file"
                ref="fileInput"
                @change="handleImageUpload"
                accept="image/*"
                class="hidden-input"
              />
            </div>
            <div class="profile-status">
              <span class="status-badge" :class="user.status">
                {{ user.status }}
              </span>
              <span v-if="user.email_verified_at" class="verified-badge">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                Verified
              </span>
            </div>
          </div>

          <div class="profile-info-section">
            <h2>{{ user.firstName }} {{ user.lastName }}</h2>
            <p class="user-email">{{ user.email }}</p>
            <p class="user-role">Resident</p>
          </div>
        </div>

        <!-- Personal Information Card -->
        <div class="info-card">
          <div class="card-header">
            <div class="header-left">
              <span class="card-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                  <path
                    d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                </svg>
              </span>
              <h3>Personal Information</h3>
            </div>
            <button @click="startEdit" class="edit-btn" v-if="!editMode">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17 3L21 7L7 21H3V17L17 3Z" stroke="currentColor" stroke-width="1.5" />
              </svg>
              Edit Profile
            </button>
          </div>

          <!-- Edit Mode -->
          <div v-if="editMode" class="edit-form">
            <div class="form-row">
              <div class="form-group half">
                <label>First Name</label>
                <input type="text" v-model="editForm.firstName" class="form-input" />
              </div>
              <div class="form-group half">
                <label>Last Name</label>
                <input type="text" v-model="editForm.lastName" class="form-input" />
              </div>
            </div>

            <div class="form-group">
              <label>Email Address</label>
              <input type="email" v-model="editForm.email" class="form-input" disabled />
              <small class="field-hint">Email cannot be changed</small>
            </div>

            <div class="form-group">
              <label>Phone Number</label>
              <div class="phone-input-wrapper">
                <div class="country-code">
                  <span class="flag-icon">🇵🇭</span>
                  <span>+63</span>
                </div>
                <input
                  type="tel"
                  v-model="phoneInput"
                  @input="formatPhoneNumber"
                  @blur="validatePhoneNumber"
                  placeholder="9123456789"
                  class="form-input phone-input"
                  maxlength="10"
                />
              </div>
              <small class="input-hint">Enter your 10-digit mobile number (e.g., 9123456789)</small>
              <span v-if="phoneError" class="error-text">{{ phoneError }}</span>
            </div>

            <div class="form-group">
              <label>Bio</label>
              <textarea
                v-model="editForm.bio"
                class="form-textarea"
                rows="4"
                placeholder="Tell others about yourself..."
              ></textarea>
              <small class="input-hint">This will appear on your public profile</small>
            </div>

            <div class="form-row">
              <div class="form-group half">
                <label>City/Municipality</label>
                <select v-model="editForm.city" class="form-select" @change="onCityChange">
                  <option value="">Select your city</option>
                  <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
                </select>
              </div>
              <div class="form-group half">
                <label>Barangay</label>
                <select v-model="editForm.barangay" class="form-select" :disabled="!editForm.city">
                  <option value="">Select your barangay</option>
                  <option v-for="brgy in availableBarangays" :key="brgy" :value="brgy">
                    {{ brgy }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-actions">
              <button @click="saveProfile" class="btn-save" :disabled="saving">
                <span v-if="saving" class="spinner-small"></span>
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
              <button @click="cancelEdit" class="btn-cancel">Cancel</button>
            </div>
          </div>

          <!-- Display Mode -->
          <div v-else class="info-display">
            <div class="info-row">
              <span class="info-label">First Name</span>
              <span class="info-value">{{ user.firstName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Last Name</span>
              <span class="info-value">{{ user.lastName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email Address</span>
              <span class="info-value">{{ user.email }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone Number</span>
              <span class="info-value">{{ formatDisplayPhone(user.phone) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Bio</span>
              <span class="info-value bio-text">{{ user.bio || 'No bio added yet.' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Location</span>
              <span class="info-value">{{ formatLocation(user.city, user.barangay) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Member Since</span>
              <span class="info-value">{{ formatDate(user.created_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Account Statistics Card -->
        <div class="info-card">
          <div class="card-header">
            <div class="header-left">
              <span class="card-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M3 9L12 3L21 9L12 15L3 9Z" stroke="currentColor" stroke-width="1.5" />
                  <path d="M5 12V18H19V12" stroke="currentColor" stroke-width="1.5" />
                  <path d="M12 15V18" stroke="currentColor" stroke-width="1.5" />
                </svg>
              </span>
              <h3>Account Statistics</h3>
            </div>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ stats.total_bookings || 0 }}</span>
              <span class="stat-label">Total Bookings</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.completed_bookings || 0 }}</span>
              <span class="stat-label">Completed</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">₱{{ stats.total_spent?.toLocaleString() || 0 }}</span>
              <span class="stat-label">Total Spent</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.total_reviews || 0 }}</span>
              <span class="stat-label">Reviews Given</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <transition name="fade">
      <div v-if="showSuccess" class="success-toast">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M20 6L9 17L4 12" stroke="white" stroke-width="2" stroke-linecap="round" />
        </svg>
        Profile updated successfully!
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import noSearchNavbar from '@/components/noSearchNavbar.vue'
import {
  getUserProfile,
  updateUserProfile,
  uploadUserProfileImage,
  getUserStats,
} from '@/api/userService'
import { getCities, getBarangays } from '@/utils/locationService'

const router = useRouter()
const loading = ref(true)
const saving = ref(false)
const editMode = ref(false)
const showSuccess = ref(false)
const user = ref(null)
const stats = ref({})
const fileInput = ref(null)
const phoneInput = ref('')
const phoneError = ref('')

// Edit form
const editForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  bio: '',
  city: '',
  barangay: '',
})

// Cities and barangays
const cities = getCities()
const availableBarangays = computed(() => {
  if (!editForm.city) return []
  return getBarangays(editForm.city)
})

const baseUrl = import.meta.env.VITE_BASE_URL
// Profile image URL
const profileImageUrl = computed(() => {
  if (!user.value?.profile_image) return '/default-avatar.png'
  let imagePath = user.value.profile_image.replace(/\\/g, '/')
  if (!imagePath.startsWith('/uploads')) {
    imagePath = `/uploads/${imagePath.split('/').pop()}`
  }
  return `${baseUrl}${imagePath}` ?? `https://alalay-connect.onrender.com${imagePath}`
})

// Format phone number for display
const formatDisplayPhone = (phone) => {
  if (!phone) return 'Not provided'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    const number = cleaned.slice(1)
    return `+63 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`
  }
  if (cleaned.length === 10) {
    return `+63 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }
  return phone
}

// Format phone number for input (strip +63 prefix)
const formatPhoneNumber = () => {
  let raw = phoneInput.value.replace(/\D/g, '')

  // Limit to 10 digits
  if (raw.length > 10) {
    raw = raw.slice(0, 10)
  }

  phoneInput.value = raw

  // Validate format
  if (raw.length === 10) {
    if (raw.startsWith('9')) {
      const formatted = `0${raw}`
      editForm.phone = formatted
      phoneError.value = ''
    } else if (raw.startsWith('0')) {
      phoneInput.value = raw.slice(1)
      editForm.phone = raw
      phoneError.value = ''
    } else {
      phoneError.value = 'Phone number must start with 9 (e.g., 9123456789)'
    }
  } else if (raw.length > 0 && raw.length < 10) {
    phoneError.value = `Please enter 10 digits (${raw.length}/10)`
  } else {
    phoneError.value = ''
    editForm.phone = ''
  }
}

// Validate phone number on blur
const validatePhoneNumber = () => {
  if (phoneInput.value.length > 0 && phoneInput.value.length !== 10) {
    phoneError.value = 'Phone number must be exactly 10 digits'
  } else if (phoneInput.value.length === 10 && !phoneInput.value.startsWith('9')) {
    phoneError.value = 'Phone number must start with 9'
  } else if (phoneInput.value.length === 10 && phoneInput.value.startsWith('9')) {
    phoneError.value = ''
  }
}

// Initialize phone input from user data
const initPhoneInput = () => {
  if (user.value?.phone) {
    let phone = user.value.phone.replace(/\D/g, '')
    if (phone.startsWith('0')) {
      phone = phone.slice(1)
    }
    phoneInput.value = phone
    editForm.phone = user.value.phone
  }
}

// Load user profile
const loadUserProfile = async () => {
  loading.value = true
  try {
    const response = await getUserProfile()
    user.value = response.user

    // Set edit form values
    editForm.firstName = user.value.firstName
    editForm.lastName = user.value.lastName
    editForm.email = user.value.email
    editForm.bio = user.value.bio || ''
    editForm.city = user.value.city || ''
    editForm.barangay = user.value.barangay || ''

    // Initialize phone
    initPhoneInput()

    await loadStats()
  } catch (error) {
    console.error('Error loading profile:', error)
  } finally {
    loading.value = false
  }
}

// Load user statistics
const loadStats = async () => {
  try {
    const response = await getUserStats()
    stats.value = response
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

// Start edit mode
const startEdit = () => {
  editMode.value = true
}

// Cancel edit
const cancelEdit = () => {
  editMode.value = false
  editForm.firstName = user.value.firstName
  editForm.lastName = user.value.lastName
  editForm.bio = user.value.bio || ''
  editForm.city = user.value.city || ''
  editForm.barangay = user.value.barangay || ''
  initPhoneInput()
  phoneError.value = ''
}

// Save profile changes
const saveProfile = async () => {
  // Validate phone before saving
  if (phoneInput.value.length > 0 && phoneInput.value.length !== 10) {
    phoneError.value = 'Please enter a valid 10-digit phone number'
    return
  }

  if (phoneInput.value.length === 10 && !phoneInput.value.startsWith('9')) {
    phoneError.value = 'Phone number must start with 9'
    return
  }

  saving.value = true
  try {
    const response = await updateUserProfile({
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      phone: editForm.phone,
      bio: editForm.bio,
      barangay: editForm.barangay,
      city: editForm.city,
    })
    user.value = response.user
    initPhoneInput()
    editMode.value = false
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('Error saving profile:', error)
    alert(error.response?.data?.message || 'Failed to update profile')
  } finally {
    saving.value = false
  }
}

// Handle city change
const onCityChange = () => {
  editForm.barangay = ''
}

// Upload profile image
const triggerImageUpload = () => {
  fileInput.value.click()
}

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size must be less than 5MB')
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file')
    return
  }

  try {
    const response = await uploadUserProfileImage(file)
    user.value.profile_image = response.imageUrl
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('Error uploading image:', error)
    alert('Failed to upload image')
  }
}

// Format location
const formatLocation = (city, barangay) => {
  if (!city && !barangay) return 'Location not set'
  if (city && barangay) return `${barangay}, ${city}`
  if (city) return city
  return barangay || 'Location not set'
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
.user-private-profile {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.profile-container {
  max-width: 1000px;
  margin: 80px auto 2rem;
  padding: 0 1.5rem;
}

.profile-header-section {
  margin-bottom: 2rem;
}

.profile-header-section h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.profile-header-section p {
  color: #64748b;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e0e7ff;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Profile Main Card */
.profile-main-card {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.profile-image-section {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.profile-image-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.profile-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #4f46e5;
}

.image-upload-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  background: #4f46e5;
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.image-upload-btn:hover {
  background: #4338ca;
  transform: scale(1.1);
}

.image-upload-btn svg {
  stroke: white;
}

.hidden-input {
  display: none;
}

.profile-status {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  background: #10b981;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.profile-info-section h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.user-email {
  color: #64748b;
  margin-bottom: 0.25rem;
}

.user-role {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #e0e7ff;
  color: #4f46e5;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Info Cards */
.info-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f1f5f9;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-icon svg {
  stroke: #4f46e5;
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.edit-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #4f46e5;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
}

.edit-btn:hover {
  background: #e0e7ff;
  transform: translateY(-2px);
}

/* Edit Form */
.edit-form {
  animation: slideIn 0.3s ease;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group.half {
  flex: 1;
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #334155;
  font-size: 0.9rem;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s;
  background: white;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-select:disabled {
  background: #f8fafc;
  cursor: not-allowed;
  opacity: 0.7;
}

.field-hint {
  display: block;
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

.input-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.7rem;
  color: #94a3b8;
}

.error-text {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}

/* Phone Input */
.phone-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.country-code {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
}

.flag-icon {
  font-size: 1.1rem;
}

.phone-input {
  flex: 1;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-save,
.btn-cancel {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-save {
  flex: 2;
  background: #10b981;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-2px);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  flex: 1;
  background: #f1f5f9;
  color: #64748b;
}

.btn-cancel:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

/* Info Display */
.info-display {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row {
  display: flex;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  width: 140px;
  color: #64748b;
  font-weight: 500;
}

.info-value {
  flex: 1;
  color: #1e293b;
}

.bio-text {
  line-height: 1.6;
  white-space: pre-wrap;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #4f46e5;
}

.stat-label {
  font-size: 0.8rem;
  color: #64748b;
}

/* Success Toast */
.success-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #10b981;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
  z-index: 1000;
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
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

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-container {
    padding: 0 1rem;
  }

  .form-row {
    flex-direction: column;
    gap: 1rem;
  }

  .info-row {
    flex-direction: column;
    gap: 0.25rem;
  }

  .info-label {
    width: auto;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .phone-input-wrapper {
    flex-direction: column;
  }

  .country-code {
    width: 100%;
    justify-content: center;
  }

  .success-toast {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    justify-content: center;
  }
}
</style>
