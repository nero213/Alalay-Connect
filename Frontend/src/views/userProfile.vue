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
} from '@/api/skilledProfiles'

import { getAllSkills } from '@/api/skilledProfiles'
import { updateProfileBio } from '@/api/skilledProfiles'
import Navbar from '@/components/Navbar.vue'

const router = useRouter()
const profile = ref(null)
const loading = ref(true)
const error = ref('')
const message = ref('')
const editMode = ref(null) // 'bio', 'location', 'skills', 'files'
const selectedSkills = ref([])
const availableSkills = ref([])

// Computed properties
const completionColor = computed(() => {
  const percentage = profile.value?.completion?.percentage || 0
  if (percentage < 30) return '#dc3545'
  if (percentage < 70) return '#ffc107'
  return '#28a745'
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
  }
}

const cancelEdit = () => {
  editMode.value = null
  selectedSkills.value = []
}

// Update bio
const updateBio = async () => {
  try {
    // Add your update bio API call here
    await updateProfileBio({
      bio: profile.value.bio,
      years_experience: profile.value.years_experience,
    })
    message.value = 'Profile updated successfully!'
    setTimeout(() => (message.value = ''), 3000)
    editMode.value = null
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update profile'
    console.log(profile.value.years_experience)
    console.log(profile.value.bio)
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

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <navbar />
  <div class="profile-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading">Loading profile...</div>

    <!-- Error Display -->
    <div v-else-if="error" class="error-message">
      {{ error }}
      <button @click="loadProfile" class="retry-btn">Retry</button>
    </div>

    <!-- Profile Content -->
    <div v-else-if="profile" class="profile-content">
      <!-- Success Message -->
      <div v-if="message" class="success-message">{{ message }}</div>

      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-image-section">
          <div class="profile-image">
            <img :src="profile.profile_image || '/default-avatar.png'" :alt="profile.firstName" />
            <button @click="startEdit('profile')" class="edit-image-btn">Change Photo</button>
          </div>
          <div class="profile-name">
            <h1>{{ profile.firstName }} {{ profile.lastName }}</h1>
            <p class="member-since">
              Member since {{ new Date(profile.member_since).toLocaleDateString() }}
            </p>
            <span class="verification-status" :class="profile.verification_status">
              {{ profile.verification_status }}
            </span>
          </div>
        </div>

        <!-- Profile Completion Bar -->
        <div class="completion-bar">
          <div class="completion-header">
            <span>Profile Completion</span>
            <span>{{ profile.completion.percentage }}%</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{
                width: profile.completion.percentage + '%',
                backgroundColor: completionColor,
              }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Main Profile Grid -->
      <div class="profile-grid">
        <!-- Left Column -->
        <div class="profile-left">
          <!-- Bio Section -->
          <div class="profile-card">
            <div class="card-header">
              <h3>About Me</h3>
              <button @click="startEdit('bio')" class="edit-btn">Edit</button>
            </div>

            <div v-if="editMode === 'bio'" class="edit-form">
              <textarea
                v-model="profile.bio"
                placeholder="Tell clients about yourself..."
                rows="4"
              ></textarea>
              <input
                type="number"
                v-model="profile.years_experience"
                placeholder="Years of experience"
                min="0"
              />
              <div class="form-actions">
                <button @click="updateBio" class="save-btn">Save</button>
                <button @click="cancelEdit" class="cancel-btn">Cancel</button>
              </div>
            </div>

            <div v-else class="bio-content">
              <p>{{ profile.bio || 'No bio added yet' }}</p>
              <p class="experience">
                <strong>{{ profile.years_experience || 0 }} years of experience</strong>
              </p>
            </div>
          </div>

          <!-- Location Section -->
          <div class="profile-card">
            <div class="card-header">
              <h3>Location</h3>
              <button @click="startEdit('location')" class="edit-btn">Update</button>
            </div>

            <div v-if="editMode === 'location'" class="edit-form">
              <p>Current Location: {{ profile.barangay }}, {{ profile.city }}</p>
              <button @click="refreshLocation" class="refresh-location-btn">
                Refresh Location
              </button>
              <div class="form-actions">
                <button @click="cancelEdit" class="cancel-btn">Cancel</button>
              </div>
            </div>

            <div v-else class="location-content">
              <p v-if="profile.barangay && profile.barangay !== 'Unknown'">
                📍 {{ profile.barangay }}, {{ profile.city }}
              </p>
              <p v-else class="text-muted">Location not set. Please update your location.</p>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="profile-right">
          <!-- Skills Section -->
          <div class="profile-card">
            <div class="card-header">
              <h3>Skills ({{ profile.skills.length }})</h3>
              <button @click="startEdit('skills')" class="edit-btn">Add Skills</button>
            </div>

            <div v-if="editMode === 'skills'" class="edit-form">
              <div class="skills-grid">
                <div
                  v-for="skill in availableSkills"
                  :key="skill.skill_id"
                  @click="
                    selectedSkills.includes(skill.skill_id)
                      ? (selectedSkills = selectedSkills.filter((id) => id !== skill.skill_id))
                      : selectedSkills.push(skill.skill_id)
                  "
                  :class="['skill-option', { selected: selectedSkills.includes(skill.skill_id) }]"
                >
                  {{ skill.name }}
                </div>
              </div>
              <div class="form-actions">
                <button @click="addSkills" class="save-btn">Add Selected</button>
                <button @click="cancelEdit" class="cancel-btn">Cancel</button>
              </div>
            </div>

            <div v-else class="skills-list">
              <div v-for="skill in profile.skills" :key="skill.skill_id" class="skill-tag">
                {{ skill.name }}
                <button @click="removeSkill(skill.skill_id)" class="remove-skill">×</button>
              </div>
              <p v-if="!profile.skills.length" class="text-muted">
                No skills added yet. Add your skills to get hired!
              </p>
            </div>
          </div>

          <!-- Documents Section -->
          <div class="profile-card">
            <div class="card-header">
              <h3>Documents</h3>
              <button @click="startEdit('files')" class="edit-btn">Upload</button>
            </div>

            <div v-if="editMode === 'files'" class="edit-form">
              <div class="file-upload">
                <label>Government ID</label>
                <input
                  type="file"
                  @change="(e) => handleFileUpload(e, 'gov')"
                  accept="image/*,.pdf"
                />
              </div>
              <div class="file-upload">
                <label>Certificate</label>
                <input
                  type="file"
                  @change="(e) => handleFileUpload(e, 'cert')"
                  accept="image/*,.pdf"
                />
              </div>
              <div class="form-actions">
                <button @click="cancelEdit" class="cancel-btn">Cancel</button>
              </div>
            </div>

            <div v-else class="documents-list">
              <p v-if="profile.gov_id" class="document-item">✅ Government ID Uploaded</p>
              <p v-if="profile.certificate" class="document-item">✅ Certificate Uploaded</p>
              <p v-if="!profile.gov_id || !profile.certificate" class="text-muted">
                Upload required documents for verification
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="profile-actions">
        <router-link to="/dashboard" class="btn-secondary"> Back to Dashboard </router-link>
        <button v-if="profile.verification_status === 'pending'" class="btn-warning">
          Verification Pending
        </button>
        <button v-else-if="profile.verification_status === 'approved'" class="btn-success">
          ✓ Verified Professional
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #666;
}

.error-message {
  text-align: center;
  padding: 2rem;
  background: #fee;
  border-radius: 8px;
  color: #c00;
}

.retry-btn {
  margin-left: 1rem;
  padding: 0.5rem 1rem;
  background: #c00;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.profile-image-section {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.profile-image {
  position: relative;
  width: 120px;
  height: 120px;
}

.profile-image img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
}

.edit-image-btn {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
}

.profile-name h1 {
  margin: 0 0 0.5rem;
}

.verification-status {
  display: inline-block;
  padding: 0.3rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.verification-status.pending {
  background: #ffc107;
  color: #333;
}

.verification-status.approved {
  background: #28a745;
  color: white;
}

.completion-bar {
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem;
  border-radius: 8px;
}

.completion-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 10px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.profile-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.card-header h3 {
  margin: 0;
  color: #333;
}

.edit-btn {
  background: none;
  border: 1px solid #667eea;
  color: #667eea;
  padding: 0.3rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-btn:hover {
  background: #667eea;
  color: white;
}

.bio-content p {
  margin: 0 0 1rem;
  line-height: 1.6;
  color: #555;
}

.experience {
  font-size: 1.1rem;
  color: #333;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.edit-form textarea,
.edit-form input {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.save-btn,
.cancel-btn,
.refresh-location-btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.save-btn {
  background: #28a745;
  color: white;
}

.save-btn:hover {
  background: #218838;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
}

.refresh-location-btn {
  background: #17a2b8;
  color: white;
}

.refresh-location-btn:hover {
  background: #138496;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.skill-option {
  padding: 0.5rem;
  text-align: center;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.skill-option:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.skill-option.selected {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 1rem;
  background: #e9ecef;
  border-radius: 20px;
  font-size: 0.9rem;
}

.remove-skill {
  background: none;
  border: none;
  margin-left: 0.5rem;
  font-size: 1.2rem;
  cursor: pointer;
  color: #dc3545;
  padding: 0 0.2rem;
}

.remove-skill:hover {
  color: #c82333;
}

.file-upload {
  margin-bottom: 1rem;
}

.file-upload label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.file-upload input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #28a745;
}

.text-muted {
  color: #999;
  font-style: italic;
}

.profile-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-secondary,
.btn-warning,
.btn-success {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-warning {
  background: #ffc107;
  color: #333;
}

.btn-warning:hover {
  background: #e0a800;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .profile-image-section {
    flex-direction: column;
    text-align: center;
  }
}
</style>
