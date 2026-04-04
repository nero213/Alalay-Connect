<template>
  <div class="admin-verification">
    <AdminSidebar />

    <div class="main-content">
      <div class="page-header">
        <div class="header-left">
          <h1>Profile Verification</h1>
          <p class="subtitle">Review and verify skilled worker applications</p>
        </div>
        <div class="stats-summary">
          <div class="stat-badge">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                stroke-width="1.5"
              />
            </svg>
            <span>{{ pagination.total || 0 }} pending</span>
          </div>
        </div>
      </div>

      <!-- Pending Profiles List -->
      <div class="profiles-container">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading applications...</p>
        </div>

        <div v-else-if="profiles.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <h3>No Pending Applications</h3>
          <p>All skilled worker applications have been reviewed</p>
        </div>

        <div v-else class="profiles-grid">
          <div v-for="profile in profiles" :key="profile.skilled_id" class="profile-card">
            <div class="profile-header">
              <div class="profile-image">
                <img :src="getImageUrl(profile.profile_image)" :alt="profile.firstName" />
              </div>
              <div class="profile-info">
                <h3>{{ profile.firstName }} {{ profile.lastName }}</h3>
                <div class="info-item">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="1.5" />
                  </svg>
                  <span class="email">{{ profile.email }}</span>
                </div>
                <div class="info-item">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 16.92V19.92C22.0001 20.1985 21.944 20.4742 21.8356 20.7293C21.7271 20.9845 21.5686 21.2136 21.3701 21.4019C21.1716 21.5901 20.9377 21.7335 20.6829 21.8227C20.4282 21.9119 20.1578 21.9451 19.89 21.92C16.672 21.5856 13.5881 20.534 10.87 18.85C8.33805 17.2857 6.17423 15.2022 4.52 12.74C2.82233 10.2335 1.78005 7.36284 1.5 4.36C1.47466 4.09269 1.50768 3.82278 1.59677 3.56839C1.68586 3.31399 1.8291 3.08045 2.01725 2.88222C2.20541 2.68399 2.43446 2.52569 2.68966 2.41743C2.94486 2.30917 3.22064 2.25322 3.5 2.25322H6.5C7.024 2.25322 7.5 2.62322 7.62 3.13322L8.32 6.33322C8.425 6.81322 8.2 7.29322 7.83 7.58322L5.81 9.19322C7.293 12.0852 9.498 14.2792 12.4 15.7702L14.02 13.7502C14.31 13.3802 14.79 13.1552 15.27 13.2602L18.47 13.9602C18.98 14.0802 19.35 14.5562 19.35 15.0802V18.0802C19.35 18.4492 19.095 18.7712 18.73 18.8302L18.47 18.86Z"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                  </svg>
                  <span class="phone">{{ profile.phone || 'No phone provided' }}</span>
                </div>
              </div>
            </div>

            <div class="profile-details">
              <div class="detail-section">
                <h4>
                  <svg
                    width="14"
                    height="14"
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
                  About
                </h4>
                <p>{{ profile.bio || 'No bio provided' }}</p>
              </div>

              <div class="detail-section">
                <h4>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 8V12L15 15M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                  </svg>
                  Experience
                </h4>
                <p>{{ profile.years_experience || 0 }} years</p>
              </div>

              <div class="detail-section">
                <h4>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.7 6.3L19 2L20.7 3.7L16.4 8"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <path
                      d="M9 12L12 9M7 17L12 12M11 19L19 11"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                  </svg>
                  Skills
                </h4>
                <div class="skills-list">
                  <span
                    v-for="skill in profile.skills?.split(',') || []"
                    :key="skill"
                    class="skill-tag"
                  >
                    {{ skill.trim() }}
                  </span>
                  <span v-if="!profile.skills" class="no-data">No skills listed</span>
                </div>
              </div>

              <div class="detail-section">
                <h4>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <path
                      d="M8 7H16M8 11H12"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                  Documents
                </h4>
                <div class="documents">
                  <a
                    v-if="profile.gov_id"
                    :href="getFullUrl(profile.gov_id)"
                    target="_blank"
                    class="doc-link"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13 3H4V21H20V8M13 3L20 10M13 3V10H20"
                        stroke="currentColor"
                        stroke-width="1.5"
                      />
                    </svg>
                    Government ID
                  </a>
                  <a
                    v-if="profile.certificate"
                    :href="getFullUrl(profile.certificate)"
                    target="_blank"
                    class="doc-link"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                        stroke="currentColor"
                        stroke-width="1.5"
                      />
                      <path
                        d="M8 7H16M8 11H12"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                    </svg>
                    Certificate
                  </a>
                  <span v-if="!profile.gov_id && !profile.certificate" class="no-data"
                    >No documents uploaded</span
                  >
                </div>
              </div>

              <div class="detail-section">
                <h4>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C7.58 2 4 5.58 4 10C4 16.5 12 22 12 22C12 22 20 16.5 20 10C20 5.58 16.42 2 12 2Z"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.5" />
                  </svg>
                  Location
                </h4>
                <p>{{ profile.barangay || 'No barangay' }}, {{ profile.city || 'No city' }}</p>
              </div>
            </div>

            <div class="profile-actions">
              <div class="notes-wrapper">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17 3L21 7L7 21H3V17L17 3Z"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <textarea
                  v-model="adminNotes[profile.skilled_id]"
                  placeholder="Add notes (optional)"
                  class="notes-input"
                  rows="2"
                ></textarea>
              </div>
              <div class="action-buttons">
                <button @click="approveProfile(profile)" class="btn-approve">
                  <svg
                    width="16"
                    height="16"
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
                  Approve
                </button>
                <button @click="rejectProfile(profile)" class="btn-reject">
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
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="pagination.pages > 1">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="page-btn"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Previous
          </button>
          <div class="page-info">
            <span class="current-page">{{ pagination.page }}</span>
            <span>of</span>
            <span class="total-pages">{{ pagination.pages }}</span>
          </div>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page === pagination.pages"
            class="page-btn"
          >
            Next
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { getPendingProfiles, verifyProfile } from '@/api/adminService'

const loading = ref(true)
const profiles = ref([])
const pagination = ref({ page: 1, pages: 1, total: 0 })
const adminNotes = ref({})

const baseURL = import.meta.env.VITE_BASE_URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/default-avatar.png'
  let formattedPath = imagePath.replace(/\\/g, '/')
  if (!formattedPath.startsWith('/uploads')) {
    formattedPath = `/uploads/${formattedPath.split('/').pop()}`
  }
  return `${baseURL}${formattedPath}`
}

const getFullUrl = (path) => {
  if (!path) return '#'
  let formattedPath = path.replace(/\\/g, '/')
  if (!formattedPath.startsWith('/uploads')) {
    formattedPath = `/uploads/${formattedPath.split('/').pop()}`
  }
  return `${baseURL}${formattedPath}`
}

const loadProfiles = async () => {
  loading.value = true
  try {
    const response = await getPendingProfiles(pagination.value.page)
    profiles.value = response.profiles
    pagination.value = response.pagination
  } catch (error) {
    console.error('Error loading profiles:', error)
  } finally {
    loading.value = false
  }
}

const approveProfile = async (profile) => {
  if (!confirm(`Approve ${profile.firstName} ${profile.lastName}?`)) return

  try {
    await verifyProfile(profile.skilled_id, 'approved', adminNotes.value[profile.skilled_id])
    await loadProfiles()
  } catch (error) {
    console.error('Error approving profile:', error)
    alert('Failed to approve profile')
  }
}

const rejectProfile = async (profile) => {
  if (!confirm(`Reject ${profile.firstName} ${profile.lastName}?`)) return

  try {
    await verifyProfile(profile.skilled_id, 'rejected', adminNotes.value[profile.skilled_id])
    await loadProfiles()
  } catch (error) {
    console.error('Error rejecting profile:', error)
    alert('Failed to reject profile')
  }
}

const changePage = (page) => {
  pagination.value.page = page
  loadProfiles()
}

onMounted(() => {
  loadProfiles()
})
</script>

<style scoped>
.admin-verification {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.page-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #64748b;
  font-size: 0.9rem;
}

.stats-summary {
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4f46e5;
  font-weight: 600;
}

.stat-badge svg {
  stroke: #4f46e5;
}

.profiles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(550px, 1fr));
  gap: 1.5rem;
}

.profile-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #f1f5f9;
}

.profile-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(79, 70, 229, 0.1);
  border-color: #e0e7ff;
}

.profile-header {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
  border-bottom: 1px solid #f1f5f9;
}

.profile-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info {
  flex: 1;
}

.profile-info h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
  color: #64748b;
  font-size: 0.85rem;
}

.info-item svg {
  stroke: #94a3b8;
  flex-shrink: 0;
}

.profile-details {
  padding: 1.5rem;
}

.detail-section {
  margin-bottom: 1.25rem;
}

.detail-section h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-section h4 svg {
  stroke: #94a3b8;
}

.detail-section p {
  color: #1e293b;
  font-size: 0.95rem;
  line-height: 1.5;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  padding: 0.3rem 0.8rem;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #4f46e5;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.documents {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.doc-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: #f8fafc;
  color: #4f46e5;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.doc-link:hover {
  background: #e0e7ff;
  border-color: #4f46e5;
  transform: translateY(-2px);
}

.doc-link svg {
  stroke: currentColor;
}

.no-data {
  color: #94a3b8;
  font-size: 0.85rem;
  font-style: italic;
}

.profile-actions {
  padding: 1.5rem;
  border-top: 1px solid #f1f5f9;
  background: #fafbfc;
}

.notes-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

.notes-wrapper svg {
  position: absolute;
  left: 12px;
  top: 12px;
  stroke: #94a3b8;
  pointer-events: none;
}

.notes-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9rem;
  resize: vertical;
  transition: all 0.3s ease;
  font-family: inherit;
}

.notes-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.btn-approve,
.btn-reject {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-approve {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-approve:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
}

.btn-reject {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-reject:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
}

.btn-approve svg,
.btn-reject svg {
  stroke: white;
}

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

.empty-state {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.empty-icon svg {
  stroke: #10b981;
  opacity: 0.7;
}

.empty-state h3 {
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
}

.empty-state p {
  color: #64748b;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #475569;
}

.page-btn:hover:not(:disabled) {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.page-btn:hover:not(:disabled) svg {
  stroke: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn svg {
  stroke: currentColor;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
}

.current-page {
  font-weight: 700;
  color: #4f46e5;
  font-size: 1.1rem;
}

.total-pages {
  color: #64748b;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .profiles-grid {
    grid-template-columns: 1fr;
  }

  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .info-item {
    justify-content: center;
  }

  .action-buttons {
    flex-direction: column;
  }

  .page-header {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .profile-details {
    padding: 1rem;
  }

  .documents {
    flex-direction: column;
  }

  .doc-link {
    justify-content: center;
  }
}
</style>
