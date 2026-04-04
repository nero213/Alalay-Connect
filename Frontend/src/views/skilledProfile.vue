<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  getCompleteProfile,
  updateSkilledLocation,
  addSkillsToProfile,
  removeSkillFromProfile,
  uploadGovID,
  uploadCertificate,
  uploadProfileImage,
  updateProfilePricing,
} from '@/api/skilledProfiles'
import { getAllSkills } from '@/api/skilledProfiles'
import { updateProfileBio } from '@/api/skilledProfiles'
import NoSearchNavbar from '@/components/noSearchNavbar.vue'

const showFileInput = ref(false)
const selectedFile = ref(null)
const uploading = ref(false)
const router = useRouter()
const profile = ref(null)
const loading = ref(true)
const error = ref('')
const message = ref('')
const editMode = ref(null) // 'bio', 'location', 'skills', 'files', 'pricing'
const selectedSkills = ref([])
const availableSkills = ref([])

// Computed properties
const completionColor = computed(() => {
  const percentage = profile.value?.completion?.percentage || 0
  if (percentage < 30) return '#ef4444'
  if (percentage < 70) return '#f59e0b'
  return '#10b981'
})

const baseURL = import.meta.env.VITE_BASE_URL
const profileImageUrl = computed(() => {
  if (!profile.value?.profile_image) return '/default-avatar.png'

  let imagePath = profile.value.profile_image

  // Replace backslashes with forward slashes
  imagePath = imagePath.replace(/\\/g, '/')

  // Make sure it starts with /uploads
  if (!imagePath.startsWith('/uploads')) {
    // If it's just a filename like "1768311816029.png"
    if (!imagePath.includes('/')) {
      imagePath = `/uploads/${imagePath}`
    } else {
      // Extract just the filename and add /uploads/
      const filename = imagePath.split('/').pop().split('\\').pop()
      imagePath = `/uploads/${filename}`
    }
  }

  return `${baseURL}${imagePath}`
})

// Load profile data
const loadProfile = async () => {
  try {
    loading.value = true
    const response = await getCompleteProfile()
    profile.value = response.profile
  } catch (err) {
    console.error('Failed to load profile:', err)
    error.value = 'Failed to load profile. Please try again.'
  } finally {
    loading.value = false
  }
}

// Edit sections
const startEdit = (section) => {
  editMode.value = section
  if (section === 'skills') {
    loadAvailableSkills()
  } else if (section === 'profile') {
    showFileInput.value = true
    triggerFileUpload()
  }
}

const cancelEdit = () => {
  editMode.value = null
  selectedSkills.value = []
  showFileInput.value = false
  selectedFile.value = null
}

const handleImageSelect = (event) => {
  selectedFile.value = event.target.files[0]
  if (selectedFile.value) {
    uploadProfileImageFile()
  }
}

const uploadProfileImageFile = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  error.value = ''

  try {
    await uploadProfileImage(selectedFile.value)
    await loadProfile() // Reload profile to get new image
    message.value = 'Profile image updated successfully!'
    setTimeout(() => (message.value = ''), 3000)
    cancelEdit() // Reset edit mode
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to upload image'
  } finally {
    uploading.value = false
  }
}

const triggerFileUpload = () => {
  // Create a hidden file input and trigger click
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = 'image/*'
  fileInput.onchange = handleImageSelect
  fileInput.click()
}

// Update bio
const updateBio = async () => {
  try {
    await updateProfileBio({
      bio: profile.value.bio,
      years_experience: profile.value.years_experience,
    })
    message.value = 'Profile updated successfully!'
    setTimeout(() => (message.value = ''), 3000)
    editMode.value = null
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update profile'
  }
}

// Update location
const updateLocation = async () => {
  try {
    await updateSkilledLocation({
      latitude: profile.value.latitude,
      longitude: profile.value.longitude,
      barangay: profile.value.barangay,
      city: profile.value.city,
    })
    message.value = 'Location updated successfully!'
    setTimeout(() => (message.value = ''), 3000)
    editMode.value = null
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update location'
  }
}

// Update pricing
const updatePricing = async () => {
  try {
    await updateProfilePricing({
      hourly_rate: profile.value.hourly_rate
    })
    message.value = 'Pricing updated successfully!'
    setTimeout(() => (message.value = ''), 3000)
    editMode.value = null
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update pricing'
  }
}

// Skills management
const loadAvailableSkills = async () => {
  try {
    const response = await getAllSkills()
    availableSkills.value = response
  } catch (err) {
    console.error('Failed to load skills:', err)
  }
}

const addSkills = async () => {
  if (selectedSkills.value.length === 0) return

  try {
    await addSkillsToProfile(selectedSkills.value)
    await loadProfile() // Reload profile to get updated skills
    message.value = 'Skills added successfully!'
    setTimeout(() => (message.value = ''), 3000)
    editMode.value = null
    selectedSkills.value = []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to add skills'
  }
}

const removeSkill = async (skillId) => {
  if (!confirm('Are you sure you want to remove this skill?')) return

  try {
    await removeSkillFromProfile(skillId)
    await loadProfile()
    message.value = 'Skill removed successfully!'
    setTimeout(() => (message.value = ''), 3000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to remove skill'
  }
}

// File uploads
const handleFileUpload = async (event, type) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    let response
    if (type === 'gov') response = await uploadGovID(file)
    if (type === 'cert') response = await uploadCertificate(file)
    if (type === 'profile') response = await uploadProfileImage(file)

    await loadProfile() // Reload to show new image
    message.value = `${type} uploaded successfully!`
    setTimeout(() => (message.value = ''), 3000)
    editMode.value = null
  } catch (err) {
    error.value = err.response?.data?.message || `Failed to upload ${type}`
  }
}

// Get new location
const refreshLocation = () => {
  if (!navigator.geolocation) {
    error.value = 'Geolocation is not supported by your browser.'
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      profile.value.latitude = position.coords.latitude
      profile.value.longitude = position.coords.longitude
      await updateLocation()
    },
    (err) => {
      console.error('Geolocation error:', err)
      error.value = 'Unable to get your location.'
    },
    { enableHighAccuracy: true, timeout: 10000 },
  )
}

// Navigate to account settings
const goToAccountSettings = () => {
  router.push('/userProfile?tab=security')
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <noSearchNavbar />
  <div class="profile-page">
    <div class="profile-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading your profile...</p>
      </div>

      <!-- Error Display -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
        <button @click="loadProfile" class="retry-btn">
          <span>⟳</span> Try Again
        </button>
      </div>

      <!-- Profile Content -->
      <div v-else-if="profile" class="profile-content">
        <!-- Success Message -->
        <transition name="slide-down">
          <div v-if="message" class="success-toast">
            <span class="success-icon">✓</span>
            {{ message }}
          </div>
        </transition>

        <!-- Profile Header -->
        <div class="profile-header">
          <div class="header-cover">
            <div class="cover-gradient"></div>
          </div>

          <div class="header-content">
            <div class="profile-image-wrapper">
              <div class="profile-image">
                <img :src="profileImageUrl" :alt="profile.firstName" />
                <div v-if="uploading" class="image-uploading">
                  <div class="spinner-small"></div>
                </div>
              </div>
              <button @click="startEdit('profile')" class="change-photo-btn">
                <span class="btn-icon">📷</span>
                Change Photo
              </button>
            </div>

            <div class="profile-info">
              <h1 class="profile-name">{{ profile.firstName }} {{ profile.lastName }}</h1>
              <div class="profile-meta">
                <span class="member-badge">
                  <span class="badge-icon">🗓️</span>
                  Member since {{ new Date(profile.member_since).toLocaleDateString('en-US', {
                    month: 'long', year: 'numeric'
                  }) }}
                </span>
                <span class="status-badge" :class="profile.verification_status">
                  <span class="status-icon" v-if="profile.verification_status === 'approved'">✓</span>
                  <span class="status-icon" v-else-if="profile.verification_status === 'pending'">⏳</span>
                  <span class="status-icon" v-else>!</span>
                  {{ profile.verification_status === 'approved' ? 'Verified Skilled Worker' :
                    profile.verification_status === 'pending' ? 'Verification Pending' : 'Not Verified' }}
                </span>
              </div>
            </div>

            <!-- Account Settings Button -->
            <div class="account-settings-btn-wrapper">
              <button @click="goToAccountSettings" class="account-settings-btn">
                <span class="btn-icon">⚙️</span>
                Account Settings
              </button>
            </div>

            <!-- Profile Completion Card -->
            <div class="completion-card">
              <div class="completion-header">
                <span class="completion-title">Profile Strength</span>
                <span class="completion-percentage">{{ profile.completion.percentage }}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{
                    width: profile.completion.percentage + '%',
                    backgroundColor: completionColor,
                  }"></div>
                </div>
              </div>
              <div class="completion-message" :style="{ color: completionColor }">
                <span v-if="profile.completion.percentage < 30">Complete your profile to get more clients</span>
                <span v-else-if="profile.completion.percentage < 70">You're getting there! Keep going</span>
                <span v-else>Excellent! Your profile looks great</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Profile Grid -->
        <div class="profile-grid">
          <!-- Left Column -->
          <div class="grid-column">
            <!-- Bio Section -->
            <div class="section-card">
              <div class="section-header">
                <div class="header-left">
                  <span class="section-icon">📝</span>
                  <h3>About Me</h3>
                </div>
                <button v-if="editMode !== 'bio'" @click="startEdit('bio')" class="section-action">
                  <span class="action-icon">✎</span>
                  Edit
                </button>
              </div>

              <div v-if="editMode === 'bio'" class="edit-section">
                <div class="form-group">
                  <label>Bio</label>
                  <textarea v-model="profile.bio"
                    placeholder="Tell clients about yourself, your experience, and what makes you unique..." rows="4"
                    class="form-textarea"></textarea>
                </div>
                <div class="form-group">
                  <label>Years of Experience</label>
                  <input type="number" v-model="profile.years_experience" placeholder="e.g., 5" min="0"
                    class="form-input" />
                </div>
                <div class="form-actions">
                  <button @click="updateBio" class="btn-save">
                    <span class="btn-icon">✓</span> Save Changes
                  </button>
                  <button @click="cancelEdit" class="btn-cancel">
                    <span class="btn-icon">✕</span> Cancel
                  </button>
                </div>
              </div>

              <div v-else class="section-content">
                <div class="bio-content">
                  <p class="bio-text">{{ profile.bio || 'No bio added yet. Tell clients about yourself!' }}</p>
                  <div class="experience-badge">
                    <span class="badge-icon">⏱️</span>
                    <strong>{{ profile.years_experience || 0 }} years of experience</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- Location Section -->
            <div class="section-card">
              <div class="section-header">
                <div class="header-left">
                  <span class="section-icon">📍</span>
                  <h3>Location</h3>
                </div>
                <button v-if="editMode !== 'location'" @click="startEdit('location')" class="section-action">
                  <span class="action-icon">✎</span>
                  Update
                </button>
              </div>

              <div v-if="editMode === 'location'" class="edit-section">
                <div class="location-preview">
                  <div class="current-location">
                    <span class="location-icon">📍</span>
                    <span>{{ profile.barangay !== 'Unknown' ? profile.barangay : 'No location' }}, {{ profile.city !==
                      'Unknown' ? profile.city : 'No city' }}</span>
                  </div>
                </div>
                <button @click="refreshLocation" class="btn-refresh">
                  <span class="btn-icon">⟳</span> Refresh My Location
                </button>
                <div class="form-actions">
                  <button @click="cancelEdit" class="btn-cancel">Cancel</button>
                </div>
              </div>

              <div v-else class="section-content">
                <div class="location-display">
                  <span class="location-icon-large">📍</span>
                  <div class="location-details">
                    <p v-if="profile.barangay && profile.barangay !== 'Unknown'" class="location-text">
                      {{ profile.barangay }}, {{ profile.city }}
                    </p>
                    <p v-else class="location-text location-muted">
                      Location not set. Update your location to appear in searches.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pricing Section -->
            <div class="section-card">
              <div class="section-header">
                <div class="header-left">
                  <span class="section-icon">💰</span>
                  <h3>Pricing</h3>
                </div>
                <button v-if="editMode !== 'pricing'" @click="startEdit('pricing')" class="section-action">
                  <span class="action-icon">✎</span>
                  Edit
                </button>
              </div>

              <div v-if="editMode === 'pricing'" class="edit-section">
                <div class="form-group">
                  <label>Hourly Rate (₱)</label>
                  <input type="number" v-model="profile.hourly_rate" placeholder="e.g., 500" min="0" step="50"
                    class="form-input" />
                  <small class="hint">Set your hourly rate in Philippine Pesos</small>
                </div>
                <div class="form-actions">
                  <button @click="updatePricing" class="btn-save">
                    <span class="btn-icon">✓</span> Save
                  </button>
                  <button @click="cancelEdit" class="btn-cancel">
                    <span class="btn-icon">✕</span> Cancel
                  </button>
                </div>
              </div>

              <div v-else class="section-content">
                <div class="pricing-display">
                  <div class="price-tag">
                    <span class="price-label">Hourly Rate</span>
                    <span class="price-value">₱{{ profile.hourly_rate || 500 }}/hour</span>
                  </div>
                  <p class="price-hint" v-if="!profile.hourly_rate">
                    Set your hourly rate to start getting booked
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="grid-column">
            <!-- Skills Section -->
            <div class="section-card">
              <div class="section-header">
                <div class="header-left">
                  <span class="section-icon">🔧</span>
                  <h3>Skills <span class="skill-count">{{ profile.skills.length }}</span></h3>
                </div>
                <button v-if="editMode !== 'skills'" @click="startEdit('skills')" class="section-action">
                  <span class="action-icon">+</span>
                  Add Skills
                </button>
              </div>

              <div v-if="editMode === 'skills'" class="edit-section">
                <p class="section-hint">Select skills you want to add:</p>
                <div class="skills-selector">
                  <div v-for="skill in availableSkills" :key="skill.skill_id" @click="
                    selectedSkills.includes(skill.skill_id)
                      ? (selectedSkills = selectedSkills.filter((id) => id !== skill.skill_id))
                      : selectedSkills.push(skill.skill_id)
                    " :class="['skill-chip', { 'chip-selected': selectedSkills.includes(skill.skill_id) }]">
                    {{ skill.name }}
                    <span v-if="selectedSkills.includes(skill.skill_id)" class="chip-check">✓</span>
                  </div>
                </div>
                <div class="form-actions">
                  <button @click="addSkills" class="btn-save" :disabled="!selectedSkills.length">
                    Add Selected ({{ selectedSkills.length }})
                  </button>
                  <button @click="cancelEdit" class="btn-cancel">Cancel</button>
                </div>
              </div>

              <div v-else class="section-content">
                <div v-if="profile.skills.length" class="skills-container">
                  <div v-for="skill in profile.skills" :key="skill.skill_id" class="skill-item">
                    <span class="skill-name">{{ skill.name }}</span>
                    <button @click="removeSkill(skill.skill_id)" class="skill-remove" title="Remove skill">×</button>
                  </div>
                </div>
                <div v-else class="empty-state">
                  <span class="empty-icon">🔧</span>
                  <p class="empty-text">No skills added yet</p>
                  <p class="empty-hint">Add skills to get hired faster</p>
                </div>
              </div>
            </div>

            <!-- Documents Section -->
            <div class="section-card">
              <div class="section-header">
                <div class="header-left">
                  <span class="section-icon">📄</span>
                  <h3>Documents</h3>
                </div>
                <button v-if="editMode !== 'files'" @click="startEdit('files')" class="section-action">
                  <span class="action-icon">↑</span>
                  Upload
                </button>
              </div>

              <div v-if="editMode === 'files'" class="edit-section">
                <div class="file-upload-group">
                  <label class="file-label">
                    <span class="file-icon">🆔</span>
                    <span>Government ID</span>
                  </label>
                  <div class="file-input-wrapper">
                    <input type="file" @change="(e) => handleFileUpload(e, 'gov')" accept="image/*,.pdf" id="gov-upload"
                      class="file-input" />
                    <label for="gov-upload" class="file-input-btn">
                      <span class="btn-icon">📎</span>
                      Choose File
                    </label>
                  </div>
                </div>

                <div class="file-upload-group">
                  <label class="file-label">
                    <span class="file-icon">🎓</span>
                    <span>Certificate</span>
                  </label>
                  <div class="file-input-wrapper">
                    <input type="file" @change="(e) => handleFileUpload(e, 'cert')" accept="image/*,.pdf"
                      id="cert-upload" class="file-input" />
                    <label for="cert-upload" class="file-input-btn">
                      <span class="btn-icon">📎</span>
                      Choose File
                    </label>
                  </div>
                </div>

                <div class="form-actions">
                  <button @click="cancelEdit" class="btn-cancel">Done</button>
                </div>
              </div>

              <div v-else class="section-content">
                <div class="documents-list">
                  <div class="document-item" :class="{ 'document-present': profile.gov_id }">
                    <span class="document-icon">{{ profile.gov_id ? '✅' : '⬜' }}</span>
                    <span class="document-name">Government ID</span>
                    <span class="document-status">{{ profile.gov_id ? 'Uploaded' : 'Not uploaded' }}</span>
                  </div>
                  <div class="document-item" :class="{ 'document-present': profile.certificate }">
                    <span class="document-icon">{{ profile.certificate ? '✅' : '⬜' }}</span>
                    <span class="document-name">Certificate</span>
                    <span class="document-status">{{ profile.certificate ? 'Uploaded' : 'Not uploaded' }}</span>
                  </div>
                </div>

                <div v-if="!profile.gov_id || !profile.certificate" class="document-note">
                  <span class="note-icon">ℹ️</span>
                  <span class="note-text">Upload required documents for verification</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="profile-footer">
          <router-link to="/dashboard" class="footer-btn footer-btn-secondary">
            <span class="btn-icon">←</span>
            Back to Dashboard
          </router-link>
          <div class="verification-status-footer">
            <span class="status-indicator" :class="profile.verification_status"></span>
            <span v-if="profile.verification_status === 'approved'" class="status-text verified">
              ✓ Verified Professional
            </span>
            <span v-else-if="profile.verification_status === 'pending'" class="status-text pending">
              ⏳ Verification Pending
            </span>
            <span v-else class="status-text unverified">
              ! Not Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add these new styles for the account settings button */
.account-settings-btn-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.account-settings-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #4f46e5;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.account-settings-btn:hover {
  background: #f8fafc;
  border-color: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(79, 70, 229, 0.2);
}

.account-settings-btn .btn-icon {
  font-size: 1rem;
}

/* Keep all your existing styles below */
.pricing-display {
  padding: 0.5rem 0;
}

.price-tag {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.price-label {
  color: #64748b;
  font-weight: 500;
}

.price-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #10b981;
}

.price-hint {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  font-style: italic;
}

.hint {
  display: block;
  color: #94a3b8;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

/* All your existing styles below remain the same */
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* Add these new styles for the pricing section */
.pricing-display {
  padding: 0.5rem 0;
}

.price-tag {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.price-label {
  color: #64748b;
  font-weight: 500;
}

.price-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #10b981;
}

.price-hint {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  font-style: italic;
}

.hint {
  display: block;
  color: #94a3b8;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

/* Keep all your existing styles below */
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1.5rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e0e7ff;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-small {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
}

.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
}

/* Success Toast */
.success-toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 50px;
  font-weight: 500;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideDown 0.3s ease;
}

.success-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }

  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* Profile Header */
.profile-header {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.header-cover {
  height: 120px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  position: relative;
}

.cover-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
}

.header-content {
  padding: 0 2rem 2rem;
  position: relative;
}

.profile-image-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -60px;
  margin-bottom: 1rem;
}

.profile-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  margin-bottom: 0.5rem;
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-uploading {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.change-photo-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #4f46e5;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.change-photo-btn:hover {
  background: #f8fafc;
  border-color: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(79, 70, 229, 0.2);
}

.profile-info {
  text-align: center;
  margin-bottom: 1.5rem;
}

.profile-name {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.profile-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.member-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  background: #f1f5f9;
  border-radius: 30px;
  font-size: 0.9rem;
  color: #475569;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1.2rem;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 600;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.approved {
  background: #d1fae5;
  color: #065f46;
}

.status-badge:not(.pending):not(.approved) {
  background: #fee2e2;
  color: #991b1b;
}

/* Completion Card */
.completion-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.completion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.completion-title {
  font-weight: 600;
  color: #334155;
}

.completion-percentage {
  font-weight: 700;
  color: #4f46e5;
}

.progress-track {
  margin-bottom: 0.75rem;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.completion-message {
  font-size: 0.9rem;
  font-weight: 500;
  text-align: right;
}

/* Profile Grid */
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.grid-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Section Cards */
.section-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #f1f5f9;
}

.section-card:hover {
  box-shadow: 0 20px 40px rgba(79, 70, 229, 0.1);
  border-color: #e0e7ff;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f1f5f9;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-icon {
  font-size: 1.5rem;
}

.section-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.skill-count {
  background: #f1f5f9;
  color: #4f46e5;
  padding: 0.2rem 0.6rem;
  border-radius: 30px;
  font-size: 0.9rem;
}

.section-action {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #4f46e5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.section-action:hover {
  background: #4f46e5;
  border-color: #4f46e5;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(79, 70, 229, 0.2);
}

.action-icon {
  font-size: 1rem;
}

/* Edit Section */
.edit-section {
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

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #334155;
  font-size: 0.95rem;
}

.form-textarea,
.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.form-textarea:focus,
.form-input:focus {
  outline: none;
  border-color: #4f46e5;
  background: white;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-save,
.btn-cancel {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-save {
  background: #10b981;
  color: white;
  flex: 2;
}

.btn-save:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
  flex: 1;
}

.btn-cancel:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-weight: 600;
  color: #4f46e5;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  justify-content: center;
}

.btn-refresh:hover {
  background: #4f46e5;
  border-color: #4f46e5;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2);
}

/* Section Content */
.bio-content {
  line-height: 1.7;
}

.bio-text {
  color: #334155;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.experience-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border-radius: 30px;
  font-size: 0.95rem;
  color: #4f46e5;
}

.location-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
}

.location-icon-large {
  font-size: 2rem;
}

.location-text {
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 500;
}

.location-muted {
  color: #94a3b8;
  font-style: italic;
}

.current-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  color: #1e293b;
}

.location-icon {
  font-size: 1.2rem;
}

/* Skills Selector */
.section-hint {
  color: #64748b;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.skills-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 16px;
  margin-bottom: 1rem;
}

.skill-chip {
  padding: 0.6rem 0.5rem;
  text-align: center;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.skill-chip:hover {
  border-color: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(79, 70, 229, 0.1);
}

.skill-chip.chip-selected {
  background: #4f46e5;
  border-color: #4f46e5;
  color: white;
}

.chip-check {
  margin-left: 0.3rem;
  font-weight: bold;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.skill-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem 0.5rem 1.2rem;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 30px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #1e293b;
  transition: all 0.3s ease;
  border: 1px solid #cbd5e1;
}

.skill-item:hover {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-2px);
}

.skill-remove {
  background: none;
  border: none;
  font-size: 1.3rem;
  line-height: 1;
  color: #ef4444;
  cursor: pointer;
  padding: 0 0.2rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.skill-remove:hover {
  background: #ef4444;
  color: white;
  transform: scale(1.1);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 2rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-text {
  color: #64748b;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.empty-hint {
  color: #94a3b8;
  font-size: 0.9rem;
}

/* Documents Section */
.file-upload-group {
  margin-bottom: 1.5rem;
}

.file-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #334155;
}

.file-icon {
  font-size: 1.2rem;
}

.file-input-wrapper {
  position: relative;
}

.file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.file-input-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  font-weight: 500;
  color: #4f46e5;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  justify-content: center;
}

.file-input-btn:hover {
  background: #f1f5f9;
  border-color: #4f46e5;
  transform: translateY(-2px);
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.document-item.document-present {
  background: #f0fdf4;
  border-color: #86efac;
}

.document-icon {
  font-size: 1.2rem;
}

.document-name {
  flex: 1;
  font-weight: 500;
  color: #334155;
}

.document-status {
  font-size: 0.85rem;
  font-weight: 500;
  color: #64748b;
}

.document-present .document-status {
  color: #10b981;
}

.document-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fef3c7;
  border-radius: 12px;
  font-size: 0.9rem;
  color: #92400e;
}

.note-icon {
  font-size: 1rem;
}

/* Profile Footer */
.profile-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  margin-top: 2rem;
}

.footer-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.footer-btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.footer-btn-secondary:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.verification-status-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-indicator.approved {
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.status-indicator.pending {
  background: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
}

.status-indicator:not(.approved):not(.pending) {
  background: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.status-text {
  font-weight: 600;
}

.status-text.verified {
  color: #10b981;
}

.status-text.pending {
  color: #f59e0b;
}

.status-text.unverified {
  color: #ef4444;
}

/* Responsive Design */
@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .profile-meta {
    flex-direction: column;
  }

  .profile-footer {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .skills-selector {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-save,
  .btn-cancel {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: 1rem;
  }

  .header-content {
    padding: 0 1rem 1.5rem;
  }

  .profile-name {
    font-size: 1.5rem;
  }

  .section-card {
    padding: 1.25rem;
  }

  .skills-selector {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Animations */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>