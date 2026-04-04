<template>
    <div class="admin-users">
        <AdminSidebar />

        <div class="main-content">
            <div class="page-header">
                <div class="header-left">
                    <h1>User Management</h1>
                    <p class="subtitle">Manage and monitor all platform users</p>
                </div>
                <div class="filters">
                    <div class="search-wrapper">
                        <span class="search-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </span>
                        <input type="text" v-model="searchQuery" placeholder="Search by name, email, or phone..."
                            class="search-input" @input="loadUsers" />
                    </div>
                    <select v-model="roleFilter" @change="loadUsers" class="filter-select">
                        <option value="">All Roles</option>
                        <option value="resident">Residents</option>
                        <option value="skilled">Skilled Workers</option>
                        <option value="admin">Admins</option>
                    </select>
                    <select v-model="statusFilter" @change="loadUsers" class="filter-select">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
            </div>

            <!-- Users Table -->
            <div class="table-container">
                <div v-if="loading" class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading users...</p>
                </div>

                <table v-else class="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Bookings</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in users" :key="user.user_id">
                            <td class="user-id">#{{ user.user_id }}</td>
                            <td class="user-name">{{ user.firstName }} {{ user.lastName }}</td>
                            <td class="user-email">{{ user.email }}</td>
                            <td class="user-phone">{{ user.phone || '—' }}</td>
                            <td>
                                <span :class="['role-badge', user.role]">
                                    <span class="badge-icon" v-if="user.role === 'resident'">👤</span>
                                    <span class="badge-icon" v-else-if="user.role === 'skilled'">🔧</span>
                                    <span class="badge-icon" v-else>👑</span>
                                    {{ user.role }}
                                </span>
                            </td>
                            <td>
                                <span :class="['status-badge', user.status]">
                                    {{ user.status }}
                                </span>
                            </td>
                            <td class="bookings-count">
                                <span class="count-badge">{{ user.total_bookings || 0 }}</span>
                            </td>
                            <td class="joined-date">{{ formatDate(user.created_at) }}</td>
                            <td>
                                <div class="action-buttons">
                                    <button v-if="user.status === 'active'" @click="suspendUser(user)"
                                        class="action-btn suspend" title="Suspend User">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M18.364 5.63604L5.63604 18.364M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                                        </svg>
                                    </button>
                                    <button v-if="user.status === 'suspended'" @click="activateUser(user)"
                                        class="action-btn activate" title="Activate User">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2"
                                                stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    </button>
                                    <button @click="viewUserDetails(user)" class="action-btn view" title="View Details">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                                                stroke="currentColor" stroke-width="1.5" />
                                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="pagination" v-if="pagination.pages > 1">
                <button @click="changePage(pagination.page - 1)" :disabled="pagination.page === 1" class="page-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                    Previous
                </button>
                <div class="page-info">
                    <span class="current-page">{{ pagination.page }}</span>
                    <span>of</span>
                    <span class="total-pages">{{ pagination.pages }}</span>
                </div>
                <button @click="changePage(pagination.page + 1)" :disabled="pagination.page === pagination.pages"
                    class="page-btn">
                    Next
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- User Details Modal -->
        <div v-if="showUserModal" class="modal-overlay" @click="closeModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>User Details</h3>
                    <button @click="closeModal" class="close-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
                <div class="modal-body" v-if="selectedUser">
                    <div class="user-avatar-large">
                        <div class="avatar-initials">
                            {{ selectedUser.firstName?.charAt(0) }}{{ selectedUser.lastName?.charAt(0) }}
                        </div>
                    </div>
                    <div class="user-detail">
                        <div class="detail-row">
                            <span class="detail-label">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                                        stroke="currentColor" stroke-width="1.5" />
                                    <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="1.5" />
                                </svg>
                                User ID
                            </span>
                            <span>#{{ selectedUser.user_id }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                                        stroke="currentColor" stroke-width="1.5" />
                                    <path
                                        d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                                        stroke="currentColor" stroke-width="1.5" />
                                </svg>
                                Name
                            </span>
                            <span>{{ selectedUser.firstName }} {{ selectedUser.lastName }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                                        stroke="currentColor" stroke-width="1.5" />
                                    <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="1.5" />
                                </svg>
                                Email
                            </span>
                            <span>{{ selectedUser.email }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M22 16.92V19.92C22.0001 20.1985 21.944 20.4742 21.8356 20.7293C21.7271 20.9845 21.5686 21.2136 21.3701 21.4019C21.1716 21.5901 20.9377 21.7335 20.6829 21.8227C20.4282 21.9119 20.1578 21.9451 19.89 21.92C16.672 21.5856 13.5881 20.534 10.87 18.85C8.33805 17.2857 6.17423 15.2022 4.52 12.74C2.82233 10.2335 1.78005 7.36284 1.5 4.36C1.47466 4.09269 1.50768 3.82278 1.59677 3.56839C1.68586 3.31399 1.8291 3.08045 2.01725 2.88222C2.20541 2.68399 2.43446 2.52569 2.68966 2.41743C2.94486 2.30917 3.22064 2.25322 3.5 2.25322H6.5C7.024 2.25322 7.5 2.62322 7.62 3.13322L8.32 6.33322C8.425 6.81322 8.2 7.29322 7.83 7.58322L5.81 9.19322C7.293 12.0852 9.498 14.2792 12.4 15.7702L14.02 13.7502C14.31 13.3802 14.79 13.1552 15.27 13.2602L18.47 13.9602C18.98 14.0802 19.35 14.5562 19.35 15.0802V18.0802C19.35 18.4492 19.095 18.7712 18.73 18.8302L18.47 18.86Z"
                                        stroke="currentColor" stroke-width="1.5" />
                                </svg>
                                Phone
                            </span>
                            <span>{{ selectedUser.phone || 'Not provided' }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" stroke-width="1.5" />
                                    <path d="M3 12L12 17L21 12" stroke="currentColor" stroke-width="1.5" />
                                    <path d="M3 17L12 22L21 17" stroke="currentColor" stroke-width="1.5" />
                                </svg>
                                Role
                            </span>
                            <span :class="['role-badge', selectedUser.role]">{{ selectedUser.role }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                        stroke="currentColor" stroke-width="1.5" />
                                </svg>
                                Status
                            </span>
                            <span :class="['status-badge', selectedUser.status]">{{ selectedUser.status }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor"
                                        stroke-width="1.5" />
                                    <path d="M8 2V6M16 2V6M3 10H21" stroke="currentColor" stroke-width="1.5" />
                                </svg>
                                Member Since
                            </span>
                            <span>{{ formatFullDate(selectedUser.created_at) }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor"
                                        stroke-width="1.5" />
                                    <path d="M8 2V6M16 2V6M3 10H21" stroke="currentColor" stroke-width="1.5" />
                                </svg>
                                Total Bookings
                            </span>
                            <span class="bookings-count">{{ selectedUser.total_bookings || 0 }}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="closeModal" class="btn-secondary">Close</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { getAllUsers, updateUserStatus } from '@/api/adminService'

const loading = ref(true)
const users = ref([])
const pagination = ref({ page: 1, pages: 1, total: 0 })
const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const showUserModal = ref(false)
const selectedUser = ref(null)

// Load users
const loadUsers = async () => {
    loading.value = true
    try {
        const params = {
            page: pagination.value.page,
            search: searchQuery.value,
            role: roleFilter.value,
            status: statusFilter.value
        }
        const response = await getAllUsers(params)
        users.value = response.users
        pagination.value = response.pagination
    } catch (error) {
        console.error('Error loading users:', error)
    } finally {
        loading.value = false
    }
}

// Change page
const changePage = (page) => {
    pagination.value.page = page
    loadUsers()
}

// Suspend user
const suspendUser = async (user) => {
    if (!confirm(`Are you sure you want to suspend ${user.firstName} ${user.lastName}?`)) return

    try {
        await updateUserStatus(user.user_id, 'suspended')
        await loadUsers()
    } catch (error) {
        console.error('Error suspending user:', error)
        alert('Failed to suspend user')
    }
}

// Activate user
const activateUser = async (user) => {
    if (!confirm(`Are you sure you want to activate ${user.firstName} ${user.lastName}?`)) return

    try {
        await updateUserStatus(user.user_id, 'active')
        await loadUsers()
    } catch (error) {
        console.error('Error activating user:', error)
        alert('Failed to activate user')
    }
}

// View user details
const viewUserDetails = (user) => {
    selectedUser.value = user
    showUserModal.value = true
}

// Close modal
const closeModal = () => {
    showUserModal.value = false
    selectedUser.value = null
}

// Format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatFullDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

onMounted(() => {
    loadUsers()
})
</script>

<style scoped>
.admin-users {
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
}

.header-left h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.25rem;
}

.subtitle {
    color: #64748b;
    font-size: 0.9rem;
}

.filters {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 1rem;
}

.search-wrapper {
    flex: 1;
    max-width: 300px;
    position: relative;
}

.search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
}

.search-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.95rem;
    transition: all 0.3s ease;
}

.search-input:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.filter-select {
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.95rem;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;
}

.filter-select:focus {
    outline: none;
    border-color: #4f46e5;
}

.table-container {
    background: white;
    border-radius: 20px;
    overflow-x: auto;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    border: 1px solid #f1f5f9;
}

.users-table {
    width: 100%;
    border-collapse: collapse;
}

.users-table th,
.users-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #f1f5f9;
}

.users-table th {
    background: #fafbfc;
    font-weight: 600;
    color: #1e293b;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.users-table tr:hover {
    background: #f8fafc;
}

.user-id {
    font-family: monospace;
    font-weight: 600;
    color: #4f46e5;
}

.user-name {
    font-weight: 500;
    color: #1e293b;
}

.user-email {
    color: #475569;
}

.user-phone {
    color: #64748b;
    font-family: monospace;
}

.role-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
}

.badge-icon {
    font-size: 0.9rem;
}

.role-badge.resident {
    background: #e0e7ff;
    color: #4f46e5;
}

.role-badge.skilled {
    background: #d1fae5;
    color: #065f46;
}

.role-badge.admin {
    background: #fee2e2;
    color: #991b1b;
}

.status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
}

.status-badge.active {
    background: #d1fae5;
    color: #065f46;
}

.status-badge.pending {
    background: #fef3c7;
    color: #92400e;
}

.status-badge.suspended {
    background: #fee2e2;
    color: #991b1b;
}

.bookings-count {
    font-weight: 600;
    color: #1e293b;
}

.count-badge {
    display: inline-block;
    background: #f1f5f9;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
    color: #4f46e5;
}

.joined-date {
    color: #64748b;
    font-size: 0.85rem;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
}

.action-btn {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.action-btn svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
}

.action-btn.suspend {
    background: #fee2e2;
    color: #ef4444;
}

.action-btn.suspend:hover {
    background: #fecaca;
    transform: scale(1.05);
}

.action-btn.activate {
    background: #d1fae5;
    color: #10b981;
}

.action-btn.activate:hover {
    background: #a7f3d0;
    transform: scale(1.05);
}

.action-btn.view {
    background: #e0e7ff;
    color: #4f46e5;
}

.action-btn.view:hover {
    background: #c7d2fe;
    transform: scale(1.05);
}

/* Pagination */
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

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

/* Modal Styles */
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
}

.modal-content {
    background: white;
    border-radius: 24px;
    max-width: 550px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
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
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #f1f5f9;
}

.modal-header h3 {
    margin: 0;
    color: #1e293b;
    font-size: 1.25rem;
    font-weight: 700;
}

.close-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    transition: all 0.3s ease;
}

.close-btn:hover {
    color: #ef4444;
    transform: rotate(90deg);
}

.modal-body {
    padding: 1.5rem;
}

.user-avatar-large {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
}

.avatar-initials {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 600;
    color: white;
    box-shadow: 0 8px 16px rgba(79, 70, 229, 0.3);
}

.user-detail {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.detail-row {
    display: flex;
    padding: 0.75rem;
    background: #f8fafc;
    border-radius: 12px;
    align-items: center;
}

.detail-label {
    width: 130px;
    color: #64748b;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.detail-label svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
}

.detail-row span:last-child {
    flex: 1;
    color: #1e293b;
    font-weight: 500;
}

.modal-footer {
    padding: 1.5rem;
    border-top: 1px solid #f1f5f9;
    text-align: right;
}

.btn-secondary {
    padding: 0.6rem 1.5rem;
    background: #f1f5f9;
    color: #64748b;
    border: none;
    border-radius: 10px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-secondary:hover {
    background: #e2e8f0;
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

/* Responsive */
@media (max-width: 768px) {
    .main-content {
        padding: 1rem;
    }

    .filters {
        flex-direction: column;
    }

    .search-wrapper {
        max-width: 100%;
    }

    .users-table {
        font-size: 0.85rem;
    }

    .users-table th,
    .users-table td {
        padding: 0.75rem;
    }

    .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .detail-label {
        width: 100%;
    }
}
</style>