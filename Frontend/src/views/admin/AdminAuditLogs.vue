<!-- frontend/src/views/admin/AdminAuditLogs.vue -->
<template>
  <div class="admin-audit-logs">
    <AdminSidebar />

    <div class="main-content">
      <div class="page-header">
        <div class="header-left">
          <h1>Audit Logs</h1>
          <p class="subtitle">Track all admin actions and system changes</p>
        </div>
        <div class="header-right">
          <button @click="refreshLogs" class="refresh-btn">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 2L20 8L14 8"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <path
                d="M4 12C4 7.58172 7.58172 4 12 4C15.4999 4 18.4422 6.18039 19.6981 9.29426M20 22L20 16L14 16"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <path
                d="M20 16C18.4422 19.8196 15.4999 22 12 22C6.47715 22 2 17.5228 2 12"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>


      <!-- Filters Bar -->
      <div class="filters-bar">
        <div class="filters">
          <div class="filter-group">
            <label>Action Type</label>
            <div class="select-wrapper">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 10H21M6 14H9M15 14H18M6 18H9M15 18H18"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
              <select v-model="filters.action" @change="loadLogs">
                <option value="">All Actions</option>
                <option value="verify_profile_approved">Profile Approved</option>
                <option value="verify_profile_rejected">Profile Rejected</option>
                <option value="update_user_status_active">User Activated</option>
                <option value="update_user_status_suspended">User Suspended</option>
                <option value="create_skill">Skill Created</option>
                <option value="update_skill">Skill Updated</option>
                <option value="delete_skill">Skill Deleted</option>
                <option value="resolve_report">Report Resolved</option>
              </select>
            </div>
          </div>

          <div class="filter-group">
            <label>Entity Type</label>
            <div class="select-wrapper">
              <svg
                width="16"
                height="16"
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
              <select v-model="filters.entity_type" @change="loadLogs">
                <option value="">All Entities</option>
                <option value="skilled_profile">Skilled Profiles</option>
                <option value="user">Users</option>
                <option value="skill">Skills</option>
                <option value="report">Reports</option>
              </select>
            </div>
          </div>

          <div class="filter-group date-range">
            <label>Date Range</label>
            <div class="date-inputs">
              <div class="date-wrapper">
                <svg
                  width="14"
                  height="14"
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
                <input type="date" v-model="filters.start_date" @change="loadLogs" />
              </div>
              <span class="date-separator">to</span>
              <div class="date-wrapper">
                <svg
                  width="14"
                  height="14"
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
                <input type="date" v-model="filters.end_date" @change="loadLogs" />
              </div>
            </div>
          </div>
        </div>
        <div class="results-info">
          <span>{{ pagination?.total || 0 }} actions recorded</span>
        </div>
      </div>

      <!-- Logs Table -->
      <div class="logs-table">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading audit logs...</p>
        </div>

        <div v-else-if="logs.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                stroke="currentColor"
                stroke-width="1.5"
              />
            </svg>
          </div>
          <h3>No audit logs found</h3>
          <p>Admin actions will appear here</p>
        </div>

        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in logs" :key="log.log_id">
                <td class="timestamp">
                  <svg
                    width="14"
                    height="14"
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
                  {{ formatDateTime(log.created_at) }}
                </td>
                <td>
                  <div class="admin-info">
                    <strong>{{ log.admin_firstName }} {{ log.admin_lastName }}</strong>
                    <small>{{ log.admin_email }}</small>
                  </div>
                </td>
                <td>
                  <span :class="['action-badge', getActionClass(log.action)]">
                    {{ formatAction(log.action) }}
                  </span>
                </td>
                <td>
                  <span class="entity-badge">{{ log.entity_type }}</span>
                  <small class="entity-id">ID: {{ log.entity_id }}</small>
                </td>
                <td class="details-cell">
                  <div v-if="log.old_data || log.new_data" class="details-preview">
                    <span v-if="log.old_data" class="old-value">
                      <svg
                        width="12"
                        height="12"
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
                      {{ formatDetails(log.old_data) }}
                    </span>
                    <span v-if="log.new_data" class="new-value">
                      <svg
                        width="12"
                        height="12"
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
                      {{ formatDetails(log.new_data) }}
                    </span>
                  </div>
                  <span v-else class="no-details">—</span>
                </td>
                <td class="ip-address">
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
                  {{ log.ip_address || 'Unknown' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.pages > 1" class="pagination">
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
import { getAuditLogs, getAuditStats } from '@/api/adminService'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'

const loading = ref(true)
const logs = ref([])
const stats = ref({})
const pagination = ref(null)

const filters = ref({
  action: '',
  entity_type: '',
  admin_id: '',
  start_date: '',
  end_date: '',
  page: 1,
  limit: 50,
})

const loadLogs = async () => {
  loading.value = true
  try {
    const response = await getAuditLogs(filters.value)
    logs.value = response.logs
    pagination.value = response.pagination
  } catch (error) {
    console.error('Error loading audit logs:', error)
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const response = await getAuditStats()
    stats.value = response
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

const refreshLogs = () => {
  filters.value.page = 1
  loadLogs()
  loadStats()
}

const changePage = (page) => {
  filters.value.page = page
  loadLogs()
}

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatAction = (action) => {
  const actions = {
    verify_profile_approved: 'Approved Profile',
    verify_profile_rejected: 'Rejected Profile',
    update_user_status_active: 'Activated User',
    update_user_status_suspended: 'Suspended User',
    create_skill: 'Created Skill',
    update_skill: 'Updated Skill',
    delete_skill: 'Deleted Skill',
    resolve_report_hide_rating: 'Resolved Report (Hide)',
    resolve_report_remove_rating: 'Resolved Report (Remove)',
    resolve_report_suspend_user: 'Resolved Report (Suspend)',
    resolve_report_warn_user: 'Resolved Report (Warn)',
  }
  return actions[action] || action.replace(/_/g, ' ')
}

const getActionClass = (action) => {
  if (action.includes('approved')) return 'approved'
  if (action.includes('rejected')) return 'rejected'
  if (action.includes('active')) return 'active'
  if (action.includes('suspended')) return 'suspended'
  if (action.includes('create')) return 'create'
  if (action.includes('update')) return 'update'
  if (action.includes('delete')) return 'delete'
  if (action.includes('resolve')) return 'resolve'
  return 'default'
}

const formatDetails = (data) => {
  if (!data) return ''
  if (data.status) return `Status: ${data.status}`
  if (data.name) return `Name: ${data.name}`
  if (data.action) return `Action: ${data.action}`
  return JSON.stringify(data)
}

onMounted(() => {
  loadLogs()
  loadStats()
})
</script>

<style scoped>
.admin-audit-logs {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
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

.refresh-btn {
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
}

.refresh-btn:hover {
  background: #f1f5f9;
  border-color: #4f46e5;
  transform: translateY(-2px);
}

.refresh-btn svg {
  stroke: currentColor;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #f1f5f9;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.1);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.total {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}

.stat-icon.admins {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.stat-icon.verifications {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-icon.changes {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.stat-icon svg {
  stroke: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

/* Filters Bar */
.filters-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.select-wrapper svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  stroke: #94a3b8;
  pointer-events: none;
}

.select-wrapper select {
  padding: 0.6rem 2rem 0.6rem 2.2rem;
  border: 2px solid #e2e8f0;
  border-radius: 30px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
}

.select-wrapper select:focus {
  outline: none;
  border-color: #4f46e5;
}

.date-range {
  min-width: 280px;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 30px;
  padding: 0.2rem 0.5rem;
}

.date-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.date-wrapper svg {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  stroke: #94a3b8;
  pointer-events: none;
}

.date-wrapper input {
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: none;
  font-size: 0.85rem;
  width: 110px;
}

.date-wrapper input:focus {
  outline: none;
}

.date-separator {
  color: #94a3b8;
  font-size: 0.85rem;
}

.results-info {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Logs Table */
.logs-table {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

th {
  background: #fafbfc;
  font-weight: 600;
  color: #1e293b;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

tr:hover {
  background: #f8fafc;
}

.timestamp {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: monospace;
  font-size: 0.85rem;
  color: #475569;
  white-space: nowrap;
}

.timestamp svg {
  stroke: #94a3b8;
  flex-shrink: 0;
}

.admin-info {
  display: flex;
  flex-direction: column;
}

.admin-info strong {
  font-size: 0.9rem;
  color: #1e293b;
}

.admin-info small {
  font-size: 0.7rem;
  color: #94a3b8;
}

.action-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.action-badge.approved {
  background: #d1fae5;
  color: #10b981;
}
.action-badge.rejected {
  background: #fee2e2;
  color: #ef4444;
}
.action-badge.active {
  background: #dbeafe;
  color: #2563eb;
}
.action-badge.suspended {
  background: #fef3c7;
  color: #f59e0b;
}
.action-badge.create {
  background: #d1fae5;
  color: #10b981;
}
.action-badge.update {
  background: #e0e7ff;
  color: #4f46e5;
}
.action-badge.delete {
  background: #fee2e2;
  color: #ef4444;
}
.action-badge.resolve {
  background: #f3e8ff;
  color: #9333ea;
}

.entity-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #f1f5f9;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
  color: #475569;
}

.entity-id {
  display: block;
  font-size: 0.65rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

.details-cell {
  max-width: 250px;
}

.details-preview {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
}

.details-preview svg {
  stroke: currentColor;
  margin-right: 0.25rem;
  vertical-align: middle;
}

.old-value {
  color: #ef4444;
  text-decoration: line-through;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.new-value {
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.no-details {
  color: #94a3b8;
}

.ip-address {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: monospace;
  font-size: 0.75rem;
  color: #64748b;
}

.ip-address svg {
  stroke: #94a3b8;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem;
}

.empty-icon {
  margin-bottom: 1rem;
}

.empty-icon svg {
  stroke: #94a3b8;
  opacity: 0.5;
}

.empty-state h3 {
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.empty-state p {
  color: #64748b;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 30px;
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
  border-radius: 30px;
  border: 2px solid #e2e8f0;
}

.current-page {
  font-weight: 700;
  color: #4f46e5;
  font-size: 1rem;
}

.total-pages {
  color: #64748b;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filters {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  .select-wrapper {
    width: 100%;
  }

  .select-wrapper select {
    width: 100%;
  }

  .date-range {
    min-width: auto;
  }

  .date-inputs {
    flex-wrap: wrap;
  }

  .date-wrapper {
    flex: 1;
  }

  .date-wrapper input {
    width: 100%;
  }

  .pagination {
    flex-direction: column;
  }
}
</style>
