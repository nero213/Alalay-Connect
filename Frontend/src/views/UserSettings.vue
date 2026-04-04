<!-- frontend/src/views/UserSettings.vue -->
<template>
  <div class="user-settings-page">
    <noSearchNavbar />

    <div class="settings-container">
      <div class="settings-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and personal information</p>
      </div>

      <div class="settings-layout">
        <!-- Sidebar Navigation -->
        <div class="settings-sidebar">
          <button
            v-for="section in settingsSections"
            :key="section.id"
            @click="activeSection = section.id"
            :class="['sidebar-item', { active: activeSection === section.id }]"
          >
            <span class="sidebar-icon" v-html="section.icon"></span>
            <span class="sidebar-label">{{ section.label }}</span>
          </button>
        </div>

        <!-- Main Content Area -->
        <div class="settings-content">
          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading your settings...</p>
          </div>

          <!-- Profile Section -->
          <div v-if="activeSection === 'profile'" class="settings-section">
            <div class="section-header">
              <h2>Profile Information</h2>
              <p>Update your personal details and how others see you</p>
            </div>

            <div class="profile-avatar-section">
              <div class="avatar-container">
                <img :src="profileImageUrl" :alt="user?.firstName" class="avatar-image" />
                <button @click="triggerImageUpload" class="avatar-upload-btn" title="Change photo">
                  <svg
                    width="16"
                    height="16"
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
              <div class="avatar-info">
                <h3>{{ user?.firstName }} {{ user?.lastName }}</h3>
                <p class="user-role-badge" :class="user?.role">{{ user?.role }}</p>
                <p class="user-email">{{ user?.email }}</p>
              </div>
            </div>

            <div class="settings-group">
              <div class="form-row">
                <div class="form-group">
                  <label>First Name</label>
                  <input type="text" v-model="editForm.firstName" class="form-input" />
                </div>
                <div class="form-group">
                  <label>Last Name</label>
                  <input type="text" v-model="editForm.lastName" class="form-input" />
                </div>
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
                <small class="input-hint"
                  >Enter your 10-digit mobile number (e.g., 9123456789)</small
                >
                <span v-if="phoneError" class="error-text">{{ phoneError }}</span>
              </div>

              <div class="form-group">
                <label>Bio</label>
                <textarea
                  v-model="editForm.bio"
                  placeholder="Tell others about yourself..."
                  rows="4"
                  class="form-textarea"
                ></textarea>
                <small class="input-hint">This will appear on your profile</small>
              </div>
            </div>

            <div class="settings-group">
              <h3>Location</h3>
              <div class="form-row">
                <div class="form-group">
                  <label>City/Municipality</label>
                  <select v-model="editForm.city" class="form-select" @change="onCityChange">
                    <option value="">Select your city/municipality</option>
                    <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Barangay</label>
                  <select
                    v-model="editForm.barangay"
                    class="form-select"
                    :disabled="!editForm.city"
                  >
                    <option value="">Select your barangay</option>
                    <option
                      v-for="barangay in availableBarangays"
                      :key="barangay"
                      :value="barangay"
                    >
                      {{ barangay }}
                    </option>
                  </select>
                </div>
              </div>
              <small class="input-hint">Your location helps find nearby services</small>
            </div>

            <div class="form-actions">
              <button @click="saveProfile" class="btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-small"></span>
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
              <button @click="resetProfileForm" class="btn-secondary">Reset</button>
            </div>
          </div>

          <!-- Security Section -->
          <div v-if="activeSection === 'security'" class="settings-section">
            <div class="section-header">
              <h2>Security Settings</h2>
              <p>Manage your password and account security</p>
            </div>

            <div class="settings-group">
              <h3>Change Password</h3>
              <div class="form-group">
                <label>Current Password</label>
                <input type="password" v-model="passwordForm.currentPassword" class="form-input" />
              </div>
              <div class="form-group">
                <label>New Password</label>
                <input type="password" v-model="passwordForm.newPassword" class="form-input" />
                <div v-if="passwordForm.newPassword" class="password-strength">
                  <div class="strength-bar">
                    <div
                      class="strength-fill"
                      :class="passwordStrengthClass"
                      :style="{ width: passwordStrength + '%' }"
                    ></div>
                  </div>
                  <span :class="passwordStrengthClass">{{ passwordStrengthText }}</span>
                </div>
              </div>
              <div class="form-group">
                <label>Confirm New Password</label>
                <input type="password" v-model="passwordForm.confirmPassword" class="form-input" />
                <span v-if="passwordMismatch" class="error-text">Passwords do not match</span>
              </div>
              <button @click="changeUserPassword" class="btn-primary" :disabled="changingPassword">
                <span v-if="changingPassword" class="spinner-small"></span>
                {{ changingPassword ? 'Updating...' : 'Update Password' }}
              </button>
            </div>

            <div class="danger-zone">
              <div class="danger-icon">
                <svg
                  width="24"
                  height="24"
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
              </div>
              <div class="danger-content">
                <h3>Danger Zone</h3>
                <p>
                  Once you delete your account, there is no going back. All your data will be
                  permanently removed.
                </p>
                <button @click="showDeleteConfirm = true" class="btn-danger">Delete Account</button>
              </div>
            </div>
          </div>

          <!-- Favorites Section -->
          <div v-if="activeSection === 'favorites'" class="settings-section">
            <div class="section-header">
              <h2>Favorite Professionals</h2>
              <p>Your saved professionals for quick access</p>
            </div>

            <div v-if="loadingFavorites" class="loading-state small">
              <div class="spinner-small"></div>
              <p>Loading favorites...</p>
            </div>

            <div v-else-if="favorites.length === 0" class="empty-state">
              <div class="empty-icon">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 21L10.55 19.7C5.4 15.1 2 12.1 2 8.5C2 5.4 4.4 3 7.5 3C9.3 3 11 3.9 12 5.3C13 3.9 14.7 3 16.5 3C19.6 3 22 5.4 22 8.5C22 12.1 18.6 15.1 13.45 19.7L12 21Z"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                </svg>
              </div>
              <h3>No favorites yet</h3>
              <p>Start adding professionals you like to your favorites</p>
              <router-link to="/dashboard" class="btn-primary">Browse Professionals</router-link>
            </div>

            <div v-else class="favorites-grid">
              <div v-for="fav in favorites" :key="fav.favorite_id" class="favorite-card">
                <img
                  :src="getWorkerImage(fav.profile_image)"
                  :alt="fav.fullName"
                  class="favorite-avatar"
                />
                <div class="favorite-details">
                  <h4>{{ fav.fullName }}</h4>
                  <p class="skill-tag">{{ fav.skill_name }}</p>
                  <div class="rating">
                    <span class="stars">{{ getRatingStars(fav.average_rating) }}</span>
                    <span>({{ fav.total_ratings }})</span>
                  </div>
                </div>
                <div class="favorite-actions">
                  <button
                    @click="viewProfile(fav.skilled_id)"
                    class="action-btn view"
                    title="View Profile"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                        stroke="currentColor"
                        stroke-width="1.5"
                      />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" />
                    </svg>
                  </button>
                  <button @click="bookNow(fav.skilled_id)" class="action-btn book" title="Book Now">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="16"
                        rx="2"
                        stroke="currentColor"
                        stroke-width="1.5"
                      />
                      <path d="M8 2V6M16 2V6M3 10H21" stroke="currentColor" stroke-width="1.5" />
                    </svg>
                  </button>
                  <button
                    @click="removeFavorite(fav.skilled_id)"
                    class="action-btn remove"
                    title="Remove"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18 6L6 18M6 6L18 18"
                        stroke="white"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Account Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header warning">
          <div class="modal-icon">
            <svg
              width="32"
              height="32"
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
          </div>
          <h3>Delete Account</h3>
          <button @click="closeDeleteModal" class="close-btn">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>This action cannot be undone. All your data will be permanently deleted.</p>
          <div class="form-group">
            <label>Enter your password to confirm</label>
            <input
              type="password"
              v-model="deletePassword"
              placeholder="Your password"
              class="form-input"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeDeleteModal" class="btn-secondary">Cancel</button>
          <button @click="confirmDelete" class="btn-danger" :disabled="!deletePassword || deleting">
            <span v-if="deleting" class="spinner-small"></span>
            {{ deleting ? 'Deleting...' : 'Delete Account' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <transition name="fade">
      <div v-if="successMessage" class="success-toast">
        <span class="toast-icon">
          <svg
            width="18"
            height="18"
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
        </span>
        {{ successMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import noSearchNavbar from '@/components/noSearchNavbar.vue'
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadUserProfileImage,
  deleteAccount,
} from '@/api/userService'
import { getFavorites, removeFromFavorites } from '@/api/favoritesService'
import { getCities, getBarangays } from '@/utils/locationService'

const router = useRouter()

// Settings sections
const settingsSections = [
  {
    id: 'profile',
    label: 'Profile',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="1.5"/><path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="1.5"/></svg>',
  },
  {
    id: 'security',
    label: 'Security',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L3 6V12C3 17.5 12 22 12 22C12 22 21 17.5 21 12V6L12 2Z" stroke="currentColor" stroke-width="1.5"/><path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="1.5"/></svg>',
  },
  {
    id: 'favorites',
    label: 'Favorites',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21L10.55 19.7C5.4 15.1 2 12.1 2 8.5C2 5.4 4.4 3 7.5 3C9.3 3 11 3.9 12 5.3C13 3.9 14.7 3 16.5 3C19.6 3 22 5.4 22 8.5C22 12.1 18.6 15.1 13.45 19.7L12 21Z" stroke="currentColor" stroke-width="1.5"/></svg>',
  },
]

// State
const activeSection = ref('profile')
const loading = ref(true)
const saving = ref(false)
const changingPassword = ref(false)
const deleting = ref(false)
const loadingFavorites = ref(false)
const successMessage = ref('')
const showDeleteConfirm = ref(false)
const deletePassword = ref('')
const fileInput = ref(null)
const phoneInput = ref('')
const phoneError = ref('')

// Data
const user = ref(null)
const favorites = ref([])

// Edit form
const editForm = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  bio: '',
  barangay: '',
  city: '',
})

// Password form
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Available cities and barangays
const cities = getCities()
const availableBarangays = computed(() => {
  if (!editForm.city) return []
  return getBarangays(editForm.city)
})

// Base URL for images
const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

// Profile image URL
const profileImageUrl = computed(() => {
  if (!user.value?.profile_image) return '/default-avatar.png'
  let imagePath = user.value.profile_image.replace(/\\/g, '/')
  if (!imagePath.startsWith('/uploads')) {
    imagePath = `/uploads/${imagePath.split('/').pop()}`
  }
  return `${baseURL}${imagePath}`
})

// Password strength
const passwordStrength = computed(() => {
  const pwd = passwordForm.newPassword
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

const passwordMismatch = computed(() => {
  return (
    passwordForm.newPassword &&
    passwordForm.confirmPassword &&
    passwordForm.newPassword !== passwordForm.confirmPassword
  )
})

// Format phone number (convert to 09 format)
const formatPhoneNumber = () => {
  let raw = phoneInput.value.replace(/\D/g, '')

  // Limit to 10 digits
  if (raw.length > 10) {
    raw = raw.slice(0, 10)
  }

  phoneInput.value = raw

  // Validate format
  if (raw.length === 10) {
    // Check if starts with 9 (should be 09 format)
    if (raw.startsWith('9')) {
      const formatted = `0${raw}`
      editForm.phone = formatted
      phoneError.value = ''
    } else if (raw.startsWith('0')) {
      // If user entered with 0, remove the 0
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

// Load user data
const loadUserData = async () => {
  loading.value = true
  try {
    const data = await getUserProfile()
    user.value = data.user

    editForm.firstName = data.user.firstName
    editForm.lastName = data.user.lastName
    editForm.bio = data.user.bio || ''
    editForm.barangay = data.user.barangay || ''
    editForm.city = data.user.city || ''

    // Initialize phone
    initPhoneInput()

    await loadFavorites()
  } catch (error) {
    console.error('Error loading profile:', error)
  } finally {
    loading.value = false
  }
}

// Load favorites
const loadFavorites = async () => {
  loadingFavorites.value = true
  try {
    const response = await getFavorites()
    favorites.value = response.favorites
  } catch (error) {
    console.error('Error loading favorites:', error)
  } finally {
    loadingFavorites.value = false
  }
}

// Profile image upload
const triggerImageUpload = () => {
  fileInput.value.click()
}

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const response = await uploadUserProfileImage(file)
    user.value.profile_image = response.imageUrl
    showSuccess('Profile image updated successfully!')
  } catch (error) {
    console.error('Error uploading image:', error)
    alert('Failed to upload image')
  }
}

// Save profile
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
    showSuccess('Profile updated successfully!')
  } catch (error) {
    console.error('Error saving profile:', error)
    alert(error.response?.data?.message || 'Failed to update profile')
  } finally {
    saving.value = false
  }
}

// Reset profile form
const resetProfileForm = () => {
  editForm.firstName = user.value.firstName
  editForm.lastName = user.value.lastName
  editForm.bio = user.value.bio || ''
  editForm.barangay = user.value.barangay || ''
  editForm.city = user.value.city || ''
  initPhoneInput()
  phoneError.value = ''
}

// Change password
const changeUserPassword = async () => {
  if (passwordMismatch.value) return

  changingPassword.value = true
  try {
    await changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })

    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''

    showSuccess('Password changed successfully!')
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to change password')
  } finally {
    changingPassword.value = false
  }
}

// Delete account
const confirmDelete = async () => {
  if (!deletePassword.value) return

  deleting.value = true
  try {
    await deleteAccount(deletePassword.value)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    showSuccess('Account deleted successfully')
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to delete account')
    closeDeleteModal()
  } finally {
    deleting.value = false
  }
}

// Remove favorite
const removeFavorite = async (skilledId) => {
  if (!confirm('Remove this professional from your favorites?')) return

  try {
    await removeFromFavorites(skilledId)
    await loadFavorites()
    showSuccess('Removed from favorites')
  } catch (error) {
    console.error('Error removing favorite:', error)
    alert('Failed to remove from favorites')
  }
}

// View profile
const viewProfile = (skilledId) => {
  router.push(`/skilled-profile/${skilledId}`)
}

// Book now
const bookNow = (skilledId) => {
  router.push(`/booking/${skilledId}`)
}

// Helper functions
const onCityChange = () => {
  editForm.barangay = ''
}

const showSuccess = (message) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

const closeDeleteModal = () => {
  showDeleteConfirm.value = false
  deletePassword.value = ''
}

const getWorkerImage = (imagePath) => {
  if (!imagePath) return '/default-avatar.png'
  let formattedPath = imagePath.replace(/\\/g, '/')
  if (!formattedPath.startsWith('/uploads')) {
    formattedPath = `/uploads/${formattedPath.split('/').pop()}`
  }
  return `${baseURL}${formattedPath}`
}

const getRatingStars = (rating) => {
  const fullStars = Math.floor(rating || 0)
  return '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars)
}

onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.user-settings-page {
  min-height: 100vh;
  background: #f8fafc;
}

.settings-container {
  max-width: 1200px;
  margin: 80px auto 2rem;
  padding: 0 1.5rem;
}

.settings-header {
  margin-bottom: 2rem;
}

.settings-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.settings-header p {
  color: #64748b;
}

.settings-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

/* Sidebar */
.settings-sidebar {
  background: #f8fafc;
  padding: 1.5rem;
  border-right: 1px solid #e2e8f0;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 0.25rem;
}

.sidebar-item:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.sidebar-item.active {
  background: #eef2ff;
  color: #4f46e5;
}

.sidebar-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-icon svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
}

.sidebar-label {
  flex: 1;
  text-align: left;
}

/* Content */
.settings-content {
  padding: 2rem;
}

.settings-section {
  animation: fadeIn 0.3s ease;
}

.section-header {
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.section-header p {
  color: #64748b;
}

/* Profile Avatar */
.profile-avatar-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 16px;
  margin-bottom: 2rem;
}

.avatar-container {
  position: relative;
  width: 100px;
  height: 100px;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #4f46e5;
}

.avatar-upload-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  background: #4f46e5;
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.avatar-upload-btn:hover {
  background: #4338ca;
  transform: scale(1.1);
}

.avatar-upload-btn svg {
  stroke: white;
}

.hidden-input {
  display: none;
}

.avatar-info h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.user-role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.user-role-badge.skilled {
  background: #d1fae5;
  color: #065f46;
}

.user-role-badge.resident {
  background: #e0e7ff;
  color: #4f46e5;
}

.user-role-badge.admin {
  background: #fee2e2;
  color: #991b1b;
}

.user-email {
  font-size: 0.85rem;
  color: #64748b;
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

/* Forms */
.settings-group {
  margin-bottom: 2rem;
}

.settings-group h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #334155;
  font-size: 0.85rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s;
  background: white;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
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

/* Buttons */
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

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* Danger Zone */
.danger-zone {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #fef2f2;
  border-radius: 16px;
  border: 1px solid #fecaca;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.danger-icon {
  width: 48px;
  height: 48px;
  background: #fee2e2;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.danger-icon svg {
  stroke: #ef4444;
}

.danger-content {
  flex: 1;
}

.danger-content h3 {
  color: #991b1b;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.danger-content p {
  color: #b91c1c;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.btn-danger {
  padding: 0.75rem 1.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-2px);
}

/* Favorites Grid */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.favorite-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.3s;
}

.favorite-card:hover {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.favorite-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.favorite-details {
  flex: 1;
}

.favorite-details h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.skill-tag {
  font-size: 0.8rem;
  color: #4f46e5;
  margin-bottom: 0.25rem;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
}

.stars {
  color: #fbbf24;
}

.favorite-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn.view {
  background: #e0e7ff;
  color: #4f46e5;
}

.action-btn.book {
  background: #d1fae5;
  color: #10b981;
}

.action-btn.remove {
  background: #fee2e2;
  color: #ef4444;
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn svg {
  stroke: currentColor;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: white;
  border-radius: 24px;
  max-width: 450px;
  width: 90%;
  overflow: hidden;
  animation: slideUp 0.3s ease;
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

.modal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header.warning {
  background: #fef2f2;
}

.modal-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-icon svg {
  stroke: #ef4444;
}

.modal-header h3 {
  flex: 1;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
  color: #94a3b8;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #ef4444;
  transform: rotate(90deg);
}

.close-btn svg {
  stroke: currentColor;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
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
  z-index: 1100;
  animation: slideIn 0.3s ease;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-icon svg {
  stroke: white;
}

/* Loading States */
.loading-state {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.loading-state.small {
  padding: 2rem;
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

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
  vertical-align: middle;
}

/* Password Strength */
.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s;
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

span.weak {
  color: #ef4444;
}
span.medium {
  color: #f59e0b;
}
span.strong {
  color: #10b981;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
}

.empty-icon {
  margin-bottom: 1rem;
}

.empty-icon svg {
  stroke: #94a3b8;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.1rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
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

/* Responsive */
@media (max-width: 768px) {
  .settings-container {
    margin: 70px auto 1rem;
    padding: 0 1rem;
  }

  .settings-layout {
    grid-template-columns: 1fr;
  }

  .settings-sidebar {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    overflow-x: auto;
    padding: 1rem;
    display: flex;
    gap: 0.5rem;
  }

  .sidebar-item {
    display: inline-flex;
    width: auto;
    margin-bottom: 0;
  }

  .settings-content {
    padding: 1.5rem;
  }

  .profile-avatar-section {
    flex-direction: column;
    text-align: center;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .phone-input-wrapper {
    flex-direction: column;
  }

  .country-code {
    width: 100%;
    justify-content: center;
  }

  .favorites-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .modal-footer {
    flex-direction: column;
  }

  .danger-zone {
    flex-direction: column;
    text-align: center;
  }

  .danger-icon {
    margin: 0 auto;
  }
}
</style>
