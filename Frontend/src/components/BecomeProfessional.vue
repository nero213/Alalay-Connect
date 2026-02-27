<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  getCompleteProfile,
  getMySkills,
  addSkillsToProfile,
  getAllSkills,
  removeSkillFromProfile,
  updateProfileBio,
  updateSkilledLocation,
  updateContactInfo,
  updateProfileImageNew,
  uploadGovID,
  uploadCertificate,
} from '@/api/skilledProfiles'


const router = useRouter()
const profile = ref(null)
const loading = ref(true)
const error = ref('')
const success = ref('')
const editMode = ref(null) // 'bio', 'skills', 'location', 'contact', 'docs'

// For editing
const editedBio = ref('')
const editedYearsExp = ref(0)
const editedPhone = ref('')
const selectedSkills = ref([])
const availableSkills = ref([])
const loadingSkills = ref(false)

// For file uploads
const uploading = ref(false)
const selectedFile = ref(null)
const uploadType = ref('')

// Computed properties
const profileImageUrl = computed(() => {
  if (!profile.value?.profile_image) return '/default-avatar.png'
  return `http://localhost:3000${profile.value.profile_image}`
})

const completionColor = computed(() => {
  const percentage = profile.value?.completion?.percentage || 0
  if (percentage < 30) return '#dc3545'
  if (percentage < 70) return '#ffc107'
  return '#28a745'
})

const verificationBadgeClass = computed(() => {
  const status = profile.value?.verification_status
  return {
    'bg-warning': status === 'pending',
    'bg-success': status === 'approved',
    'bg-secondary': status === 'rejected',
  }
})

// Load profile data
const loadProfile = async () => {
  try {
    loading.value = true
    error.value = ''

    // Try to get complete profile first
    try {
      const data = await getCompleteProfile()
      profile.value = data
    } catch (err) {
      // If complete profile fails, try basic profile
      console.log('Falling back to basic profile')
      const basicProfile = await getMySkilledProfile()
      const skills = await getMySkills()
      profile.value = {
        ...basicProfile,
        skills,
        completion: {
          percentage: 50,
          basic_info: !!basicProfile.bio,
          location: !!(basicProfile.latitude && basicProfile.longitude),
          skills: skills.length > 0,
          gov_id: !!basicProfile.gov_id,
          certificate: !!basicProfile.certificate,
          profile_image: !!basicProfile.profile_image,
        },
      }
    }

    // Set edit values
    if (profile.value) {
      editedBio.value = profile.value.bio || ''
      editedYearsExp.value = profile.value.years_experience || 0
      editedPhone.value = profile.value.phone || ''
    }
  } catch (err) {
    console.error('Failed to load profile:', err)
    error.value = 'Failed to load profile. Please try again.'
  } finally {
    loading.value = false
  }
}

// Load available skills for selection
const loadAvailableSkills = async () => {
  loadingSkills.value = true
  try {
    availableSkills.value = await getAllSkills()
  } catch (err) {
    console.error('Failed to load skills:', err)
    console.log(availableSkills.value)
  } finally {
    loadingSkills.value = false
  }
}

// Start editing a section
const startEdit = (section) => {
  editMode.value = section
  if (section === 'skills') {
    selectedSkills.value = []
    loadAvailableSkills()
  }
}

// Cancel editing
const cancelEdit = () => {
  editMode.value = null
  selectedSkills.value = []
  selectedFile.value = null
  error.value = ''
  success.value = ''
}

// Save bio changes
const saveBio = async () => {
  try {
    error.value = ''
    await updateProfileBio({
      bio: editedBio.value,
      years_experience: parseInt(editedYearsExp.value),
    })

    // Update local profile
    profile.value.bio = editedBio.value
    profile.value.years_experience = editedYearsExp.value

    success.value = 'Bio updated successfully!'
    setTimeout(() => (success.value = ''), 3000)
    editMode.value = null
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update bio'
  }
}

// Save contact changes
const saveContact = async () => {
  try {
    error.value = ''
    await updateContactInfo({ phone: editedPhone.value })

    profile.value.phone = editedPhone.value

    success.value = 'Contact information updated!'
    setTimeout(() => (success.value = ''), 3000)
    editMode.value = null
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update contact'
  }
}

// Toggle skill selection
const toggleSkill = (skillId) => {
  const index = selectedSkills.value.indexOf(skillId)
  if (index === -1) {
    selectedSkills.value.push(skillId)
  } else {
    selectedSkills.value.splice(index, 1)
  }
}

// Add selected skills
const addSkills = async () => {
  if (selectedSkills.value.length === 0) return

  try {
    error.value = ''
    await addSkillsToProfile(selectedSkills.value)

    // Reload profile to get updated skills
    await loadProfile()

    success.value = 'Skills added successfully!'
    setTimeout(() => (success.value = ''), 3000)
    editMode.value = null
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to add skills'
  }
}

// Remove a skill
const removeSkill = async (skillId) => {
  if (!confirm('Are you sure you want to remove this skill?')) return

  try {
    error.value = ''
    await removeSkillFromProfile(skillId)

    // Update local skills list
    profile.value.skills = profile.value.skills.filter((s) => s.skill_id !== skillId)

    success.value = 'Skill removed successfully!'
    setTimeout(() => (success.value = ''), 3000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to remove skill'
  }
}

// Handle file selection for upload
const handleFileSelect = (event, type) => {
  selectedFile.value = event.target.files[0]
  uploadType.value = type
}

// Upload file
const uploadFile = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  error.value = ''

  try {
    let response
    switch (uploadType.value) {
      case 'gov':
        response = await uploadGovID(selectedFile.value)
        profile.value.gov_id = response.data.filePath
        break
      case 'cert':
        response = await uploadCertificate(selectedFile.value)
        profile.value.certificate = response.data.filePath
        break
      case 'profile':
        response = await updateProfileImageNew(selectedFile.value)
        profile.value.profile_image = response.data.filePath
        break
    }

    success.value = `${uploadType.value} uploaded successfully!`
    setTimeout(() => (success.value = ''), 3000)
    editMode.value = null
    selectedFile.value = null
  } catch (err) {
    error.value = err.response?.data?.message || 'Upload failed'
  } finally {
    uploading.value = false
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
      try {
        error.value = ''
        await updateSkilledLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          barangay: 'Unknown',
          city: 'Unknown',
        })

        profile.value.latitude = position.coords.latitude
        profile.value.longitude = position.coords.longitude

        success.value = 'Location updated successfully!'
        setTimeout(() => (success.value = ''), 3000)
        editMode.value = null
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to update location'
      }
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
  <div class="profile-container">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading your profile...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger m-4">
      {{ error }}
      <button @click="loadProfile" class="btn btn-sm btn-outline-danger ms-3">Retry</button>
    </div>

    <!-- Profile Content -->
    <div v-else-if="profile" class="profile-content">
      <!-- Success Message -->
      <div v-if="success" class="alert alert-success alert-dismissible fade show m-4" role="alert">
        {{ success }}
        <button type="button" class="btn-close" @click="success = ''"></button>
      </div>

      <!-- Profile Header -->
      <div class="profile-header">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-md-8 d-flex align-items-center">
              <div class="profile-image-wrapper">
                <img :src="profileImageUrl" :alt="profile.firstName" class="profile-image" />
                <button @click="startEdit('profile')" class="btn btn-sm btn-light edit-image-btn">
                  Change
                </button>
              </div>
              <div class="ms-4">
                <h1 class="text-white">{{ profile.firstName }} {{ profile.lastName }}</h1>
                <div class="d-flex align-items-center gap-3">
                  <span class="badge" :class="verificationBadgeClass">
                    {{ profile.verification_status?.toUpperCase() }}
                  </span>
                  <span class="text-white-50">
                    <i class="bi bi-calendar"></i>
                    Member since {{ new Date(profile.created_at).toLocaleDateString() }}
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="completion-card">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span>Profile Completion</span>
                  <strong>{{ profile.completion?.percentage || 0 }}%</strong>
                </div>
                <div class="progress" style="height: 10px">
                  <div
                    class="progress-bar"
                    :style="{
                      width: (profile.completion?.percentage || 0) + '%',
                      backgroundColor: completionColor,
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="container py-4">
        <div class="row">
          <!-- Left Column -->
          <div class="col-lg-6">
            <!-- About Section -->
            <div class="card mb-4">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">About Me</h5>
                <button @click="startEdit('bio')" class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-pencil"></i> Edit
                </button>
              </div>
              <div class="card-body">
                <div v-if="editMode === 'bio'" class="edit-form">
                  <div class="mb-3">
                    <label class="form-label">Bio</label>
                    <textarea
                      v-model="editedBio"
                      class="form-control"
                      rows="4"
                      placeholder="Tell clients about yourself..."
                    ></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Years of Experience</label>
                    <input type="number" v-model="editedYearsExp" class="form-control" min="0" />
                  </div>
                  <div class="d-flex gap-2">
                    <button @click="saveBio" class="btn btn-primary">Save</button>
                    <button @click="cancelEdit" class="btn btn-secondary">Cancel</button>
                  </div>
                </div>
                <div v-else>
                  <p class="mb-3">{{ profile.bio || 'No bio added yet' }}</p>
                  <p class="mb-0">
                    <strong>{{ profile.years_experience || 0 }} years of experience</strong>
                  </p>
                </div>
              </div>
            </div>

            <!-- Location Section -->
            <div class="card mb-4">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Location</h5>
                <button @click="startEdit('location')" class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-pencil"></i> Update
                </button>
              </div>
              <div class="card-body">
                <div v-if="editMode === 'location'">
                  <p class="mb-3">
                    <strong>Current:</strong>
                    {{
                      profile.barangay && profile.barangay !== 'Unknown'
                        ? `${profile.barangay}, ${profile.city}`
                        : 'Location not set'
                    }}
                  </p>
                  <button @click="refreshLocation" class="btn btn-primary">
                    <i class="bi bi-geo-alt"></i> Refresh Location
                  </button>
                  <button @click="cancelEdit" class="btn btn-link">Cancel</button>
                </div>
                <div v-else>
                  <p class="mb-0">
                    <i class="bi bi-geo-alt-fill text-primary"></i>
                    {{
                      profile.barangay && profile.barangay !== 'Unknown'
                        ? `${profile.barangay}, ${profile.city}`
                        : 'Location not set'
                    }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="card mb-4">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Contact Information</h5>
                <button @click="startEdit('contact')" class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-pencil"></i> Edit
                </button>
              </div>
              <div class="card-body">
                <div v-if="editMode === 'contact'">
                  <div class="mb-3">
                    <label class="form-label">Phone Number</label>
                    <input
                      type="tel"
                      v-model="editedPhone"
                      class="form-control"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div class="d-flex gap-2">
                    <button @click="saveContact" class="btn btn-primary">Save</button>
                    <button @click="cancelEdit" class="btn btn-secondary">Cancel</button>
                  </div>
                </div>
                <div v-else>
                  <p class="mb-2">
                    <i class="bi bi-envelope text-primary"></i>
                    {{ profile.email || 'No email' }}
                  </p>
                  <p class="mb-0">
                    <i class="bi bi-telephone text-primary"></i>
                    {{ profile.phone || 'No phone number' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="col-lg-6">
            <!-- Skills Section -->
            <div class="card mb-4">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Skills ({{ profile.skills?.length || 0 }})</h5>
                <button @click="startEdit('skills')" class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-plus-circle"></i> Add Skills
                </button>
              </div>
              <div class="card-body">
                <div v-if="editMode === 'skills'">
                  <div v-if="loadingSkills" class="text-center py-3">
                    <div class="spinner-border spinner-border-sm text-primary"></div>
                    Loading skills...
                  </div>
                  <div v-else>
                    <div class="skills-grid mb-3">
                      <div
                        v-for="skill in availableSkills"
                        :key="skill.skill_id"
                        @click="toggleSkill(skill.skill_id)"
                        :class="[
                          'skill-chip',
                          { selected: selectedSkills.includes(skill.skill_id) },
                        ]"
                      >
                        {{ skill.name }}
                      </div>
                    </div>
                    <div class="d-flex gap-2">
                      <button @click="addSkills" class="btn btn-primary">
                        Add Selected ({{ selectedSkills.length }})
                      </button>
                      <button @click="cancelEdit" class="btn btn-secondary">Cancel</button>
                    </div>
                  </div>
                </div>
                <div v-else>
                  <div v-if="profile.skills?.length" class="skills-list">
                    <div v-for="skill in profile.skills" :key="skill.skill_id" class="skill-tag">
                      {{ skill.name }}
                      <button @click="removeSkill(skill.skill_id)" class="remove-skill">
                        <i class="bi bi-x"></i>
                      </button>
                    </div>
                  </div>
                  <p v-else class="text-muted mb-0">
                    No skills added yet. Add your skills to get hired!
                  </p>
                </div>
              </div>
            </div>

            <!-- Documents Section -->
            <div class="card mb-4">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Documents</h5>
                <button @click="startEdit('docs')" class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-upload"></i> Upload
                </button>
              </div>
              <div class="card-body">
                <div v-if="editMode === 'docs'">
                  <div class="mb-3">
                    <label class="form-label">Government ID</label>
                    <input
                      type="file"
                      class="form-control"
                      @change="(e) => handleFileSelect(e, 'gov')"
                      accept="image/*,.pdf"
                    />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Certificate</label>
                    <input
                      type="file"
                      class="form-control"
                      @change="(e) => handleFileSelect(e, 'cert')"
                      accept="image/*,.pdf"
                    />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Profile Image</label>
                    <input
                      type="file"
                      class="form-control"
                      @change="(e) => handleFileSelect(e, 'profile')"
                      accept="image/*"
                    />
                  </div>

                  <div v-if="selectedFile" class="mb-3">
                    <p>Selected: {{ selectedFile.name }}</p>
                    <button @click="uploadFile" class="btn btn-primary" :disabled="uploading">
                      <span v-if="uploading" class="spinner-border spinner-border-sm"></span>
                      {{ uploading ? 'Uploading...' : 'Upload' }}
                    </button>
                    <button @click="cancelEdit" class="btn btn-link">Cancel</button>
                  </div>
                </div>
                <div v-else>
                  <div class="document-item">
                    <i
                      class="bi"
                      :class="
                        profile.gov_id
                          ? 'bi-check-circle-fill text-success'
                          : 'bi-x-circle-fill text-danger'
                      "
                    ></i>
                    <span>Government ID</span>
                    <span v-if="profile.gov_id" class="text-success ms-auto">Uploaded</span>
                  </div>
                  <div class="document-item">
                    <i
                      class="bi"
                      :class="
                        profile.certificate
                          ? 'bi-check-circle-fill text-success'
                          : 'bi-x-circle-fill text-danger'
                      "
                    ></i>
                    <span>Certificate</span>
                    <span v-if="profile.certificate" class="text-success ms-auto">Uploaded</span>
                  </div>
                  <div class="document-item">
                    <i
                      class="bi"
                      :class="
                        profile.profile_image
                          ? 'bi-check-circle-fill text-success'
                          : 'bi-x-circle-fill text-danger'
                      "
                    ></i>
                    <span>Profile Image</span>
                    <span v-if="profile.profile_image" class="text-success ms-auto">Uploaded</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="d-flex justify-content-center gap-3 mt-4">
          <router-link to="/dashboard" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left"></i> Back to Dashboard
          </router-link>
          <button v-if="profile.verification_status === 'pending'" class="btn btn-warning" disabled>
            <i class="bi bi-hourglass-split"></i> Verification Pending
          </button>
          <button
            v-else-if="profile.verification_status === 'approved'"
            class="btn btn-success"
            disabled
          >
            <i class="bi bi-patch-check-fill"></i> Verified Professional
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
  color: white;
}

.profile-image-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
}

.profile-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
}

.edit-image-btn {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  white-space: nowrap;
}

.completion-card {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 10px;
  color: white;
}

.card {
  border: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.card-header {
  background-color: white;
  border-bottom: 1px solid #f0f0f0;
  padding: 1rem 1.5rem;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.skill-chip {
  padding: 0.5rem;
  text-align: center;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.skill-chip:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.skill-chip.selected {
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
  padding: 0.3rem 0.8rem;
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
  padding: 0;
  line-height: 1;
}

.remove-skill:hover {
  color: #c82333;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.document-item:last-child {
  border-bottom: none;
}

.edit-form {
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

/* Responsive */
@media (max-width: 768px) {
  .profile-header .row {
    text-align: center;
  }

  .profile-image-wrapper {
    margin: 0 auto;
  }

  .ms-4 {
    margin-left: 0 !important;
    margin-top: 1rem;
  }
}
</style>
