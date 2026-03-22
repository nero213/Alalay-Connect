<script setup>
import { ref, onMounted } from 'vue'
import { getAllTickets, getAdminTicketById, updateTicketStatus, addTicketReply, getTicketStats } from '@/api/helpService'
import debounce from 'lodash/debounce'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'

const loading = ref(true)
const tickets = ref([])
const stats = ref({})
const pagination = ref(null)
const sending = ref(false)
const selectedTicket = ref(null)
const replies = ref([])
const replyMessage = ref('')
const isInternalNote = ref(false)
const searchQuery = ref('')
const admins = ref([])

const filters = ref({
    status: '',
    priority: '',
    page: 1,
    limit: 20
})

// Load admin users for assignment
const loadAdmins = async () => {
    try {
        const response = await fetch('/api/admin/users?role=admin')
        const data = await response.json()
        admins.value = data.users || []
    } catch (error) {
        console.error('Error loading admins:', error)
    }
}

const loadTickets = async () => {
    loading.value = true
    try {
        const params = { ...filters.value }
        if (searchQuery.value) {
            params.search = searchQuery.value
        }
        const response = await getAllTickets(params)
        tickets.value = response.tickets
        stats.value = response.stats
        pagination.value = response.pagination
    } catch (error) {
        console.error('Error loading tickets:', error)
    } finally {
        loading.value = false
    }
}

const loadStats = async () => {
    try {
        const response = await getTicketStats()
        stats.value = response.stats
    } catch (error) {
        console.error('Error loading stats:', error)
    }
}

const viewTicket = async (ticket) => {
    try {
        const response = await getAdminTicketById(ticket.ticket_id)
        selectedTicket.value = response.ticket
        replies.value = response.replies || []
    } catch (error) {
        console.error('Error loading ticket details:', error)
    }
}

const updateStatus = async () => {
    try {
        await updateTicketStatus(selectedTicket.value.ticket_id, {
            status: selectedTicket.value.status
        })
        await loadTickets()
        await loadStats()
    } catch (error) {
        console.error('Error updating status:', error)
        alert('Failed to update status')
    }
}

const updatePriority = async () => {
    try {
        await updateTicketStatus(selectedTicket.value.ticket_id, {
            priority: selectedTicket.value.priority
        })
        await loadTickets()
    } catch (error) {
        console.error('Error updating priority:', error)
        alert('Failed to update priority')
    }
}

const updateAssignment = async () => {
    try {
        await updateTicketStatus(selectedTicket.value.ticket_id, {
            assigned_to: selectedTicket.value.assigned_to || null
        })
        await loadTickets()
    } catch (error) {
        console.error('Error updating assignment:', error)
        alert('Failed to update assignment')
    }
}

const sendReply = async () => {
    if (!replyMessage.value.trim()) return

    sending.value = true
    try {
        await addTicketReply(selectedTicket.value.ticket_id, replyMessage.value, isInternalNote.value)
        replyMessage.value = ''
        isInternalNote.value = false
        // Refresh replies
        const response = await getAdminTicketById(selectedTicket.value.ticket_id)
        replies.value = response.replies || []
        await loadTickets()
    } catch (error) {
        console.error('Error sending reply:', error)
        alert('Failed to send reply')
    } finally {
        sending.value = false
    }
}

const closeModal = () => {
    selectedTicket.value = null
    replies.value = []
    replyMessage.value = ''
    isInternalNote.value = false
}

const refreshTickets = () => {
    loadTickets()
    loadStats()
}

const changePage = (page) => {
    filters.value.page = page
    loadTickets()
}

const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatFullDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const debouncedSearch = debounce(() => {
    filters.value.page = 1
    loadTickets()
}, 500)

onMounted(() => {
    loadTickets()
    loadStats()
    loadAdmins()
})
</script>

<template>
    <div class="admin-help-center">
        <AdminSidebar />

        <div class="main-content">
            <div class="page-header">
                <div class="header-left">
                    <h1>Support Tickets</h1>
                    <p class="subtitle">Manage and respond to user support requests</p>
                </div>
                <div class="header-right">
                    <button @click="refreshTickets" class="refresh-btn" title="Refresh tickets">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 2L20 8L14 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                            <path
                                d="M4 12C4 7.58172 7.58172 4 12 4C15.4999 4 18.4422 6.18039 19.6981 9.29426M20 22L20 16L14 16"
                                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                            <path d="M20 16C18.4422 19.8196 15.4999 22 12 22C6.47715 22 2 17.5228 2 12"
                                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                        </svg>
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon total">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                                stroke="white" stroke-width="1.5" />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <div class="stat-value">{{ stats.total || 0 }}</div>
                        <div class="stat-label">Total Tickets</div>
                    </div>
                </div>
                <div class="stat-card open">
                    <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                stroke="white" stroke-width="1.5" />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <div class="stat-value">{{ stats.open || 0 }}</div>
                        <div class="stat-label">Open</div>
                    </div>
                </div>
                <div class="stat-card in-progress">
                    <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                stroke="white" stroke-width="1.5" />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <div class="stat-value">{{ stats.in_progress || 0 }}</div>
                        <div class="stat-label">In Progress</div>
                    </div>
                </div>
                <div class="stat-card resolved">
                    <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="white" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <div class="stat-value">{{ stats.resolved || 0 }}</div>
                        <div class="stat-label">Resolved</div>
                    </div>
                </div>
                <div class="stat-card urgent">
                    <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 8V12M12 16H12.01M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                stroke="white" stroke-width="1.5" />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <div class="stat-value">{{ stats.urgent || 0 }}</div>
                        <div class="stat-label">Urgent</div>
                    </div>
                </div>
            </div>

            <!-- Filters -->
            <div class="filters-bar">
                <div class="filters">
                    <div class="filter-group">
                        <label>Status</label>
                        <select v-model="filters.status" @change="loadTickets">
                            <option value="">All Status</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label>Priority</label>
                        <select v-model="filters.priority" @change="loadTickets">
                            <option value="">All Priority</option>
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>

                    <div class="filter-group search-group">
                        <label>Search</label>
                        <div class="search-wrapper">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                                    stroke="currentColor" stroke-width="1.5" />
                            </svg>
                            <input type="text" v-model="searchQuery"
                                placeholder="Search by subject, user, or ticket ID..." @input="debouncedSearch">
                        </div>
                    </div>
                </div>
                <div class="results-info">
                    <span>{{ pagination?.total || 0 }} tickets found</span>
                </div>
            </div>

            <!-- Tickets Table -->
            <div class="tickets-table">
                <div v-if="loading" class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading tickets...</p>
                </div>

                <div v-else-if="tickets.length === 0" class="empty-state">
                    <div class="empty-icon">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                                stroke="currentColor" stroke-width="1.5" />
                        </svg>
                    </div>
                    <h3>No tickets found</h3>
                    <p>Support tickets will appear here</p>
                </div>

                <div v-else class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Subject</th>
                                <th>User</th>
                                <th>Category</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Replies</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="ticket in tickets" :key="ticket.ticket_id">
                                <td class="ticket-id">#{{ ticket.ticket_uuid?.slice(-8) }}</td>
                                <td class="subject">
                                    <span class="subject-text" :title="ticket.subject">{{ ticket.subject }}</span>
                                </td>
                                <td>
                                    <div class="user-info">
                                        <span>{{ ticket.firstName }} {{ ticket.lastName }}</span>
                                        <small>{{ ticket.email }}</small>
                                    </div>
                                </td>
                                <td>
                                    <span class="category-badge">{{ ticket.category }}</span>
                                </td>
                                <td>
                                    <span :class="['priority-badge', ticket.priority]">
                                        {{ ticket.priority }}
                                    </span>
                                </td>
                                <td>
                                    <span :class="['status-badge', ticket.status]">
                                        {{ ticket.status === 'in_progress' ? 'In Progress' : ticket.status }}
                                    </span>
                                </td>
                                <td>{{ formatDate(ticket.created_at) }}</td>
                                <td class="reply-count">{{ ticket.reply_count || 0 }}</td>
                                <td>
                                    <button @click="viewTicket(ticket)" class="view-btn">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                                                stroke="white" stroke-width="1.5" />
                                            <circle cx="12" cy="12" r="3" stroke="white" stroke-width="1.5" />
                                        </svg>
                                        View
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div v-if="pagination && pagination.pages > 1" class="pagination">
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
        </div>

        <!-- Ticket Detail Modal -->
        <div v-if="selectedTicket" class="modal-overlay" @click.self="closeModal">
            <div class="modal-content">
                <div class="modal-header">
                    <div>
                        <h3>Ticket #{{ selectedTicket.ticket_uuid }}</h3>
                        <p class="ticket-subject">{{ selectedTicket.subject }}</p>
                    </div>
                    <button @click="closeModal" class="close-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>

                <div class="modal-body">
                    <!-- Ticket Information -->
                    <div class="ticket-info">
                        <div class="info-grid">
                            <div class="info-row">
                                <span class="info-label">User:</span>
                                <span class="info-value">
                                    {{ selectedTicket.firstName }} {{ selectedTicket.lastName }}
                                    <br>
                                    <small>{{ selectedTicket.email }}</small>
                                </span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Phone:</span>
                                <span class="info-value">{{ selectedTicket.phone || 'Not provided' }}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Category:</span>
                                <span class="info-value">{{ selectedTicket.category }}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Priority:</span>
                                <span class="info-value">
                                    <select v-model="selectedTicket.priority" @change="updatePriority"
                                        class="priority-select" :class="selectedTicket.priority">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Status:</span>
                                <span class="info-value">
                                    <select v-model="selectedTicket.status" @change="updateStatus" class="status-select"
                                        :class="selectedTicket.status">
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Assigned To:</span>
                                <span class="info-value">
                                    <select v-model="selectedTicket.assigned_to" @change="updateAssignment"
                                        class="assign-select">
                                        <option value="">Unassigned</option>
                                        <option v-for="admin in admins" :key="admin.user_id" :value="admin.user_id">
                                            {{ admin.firstName }} {{ admin.lastName }}
                                        </option>
                                    </select>
                                </span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Created:</span>
                                <span class="info-value">{{ formatFullDate(selectedTicket.created_at) }}</span>
                            </div>
                            <div class="info-row" v-if="selectedTicket.resolved_at">
                                <span class="info-label">Resolved:</span>
                                <span class="info-value">{{ formatFullDate(selectedTicket.resolved_at) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Original Message -->
                    <div class="original-message">
                        <h4>Original Message</h4>
                        <p>{{ selectedTicket.message }}</p>
                    </div>

                    <!-- Replies Section -->
                    <div class="replies-section">
                        <h4>Conversation History</h4>
                        <div class="replies-list">
                            <div v-for="reply in replies" :key="reply.reply_id"
                                :class="['reply-item', { 'internal-note': reply.is_internal_note }]">
                                <div class="reply-header">
                                    <div class="reply-author">
                                        <strong>{{ reply.firstName || reply.admin_firstName }} {{ reply.lastName ||
                                            reply.admin_lastName }}</strong>
                                        <span class="reply-role">{{ reply.firstName ? 'User' : 'Admin' }}</span>
                                    </div>
                                    <span class="reply-date">{{ formatDateTime(reply.created_at) }}</span>
                                </div>
                                <p class="reply-message">{{ reply.message }}</p>
                                <div v-if="reply.is_internal_note" class="internal-badge">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 10H21M6 14H9M15 14H18M6 18H9M15 18H18" stroke="currentColor"
                                            stroke-width="1.5" stroke-linecap="round" />
                                    </svg>
                                    Internal Note
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Reply Form -->
                    <div class="reply-form">
                        <h4>Add Response</h4>
                        <div class="textarea-wrapper">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 3L21 7L7 21H3V17L17 3Z" stroke="currentColor" stroke-width="1.5" />
                            </svg>
                            <textarea v-model="replyMessage" placeholder="Type your response..." rows="4"></textarea>
                        </div>
                        <div class="reply-actions">
                            <label class="internal-note-checkbox">
                                <input type="checkbox" v-model="isInternalNote">
                                <span>Internal Note (only visible to admins)</span>
                            </label>
                            <button @click="sendReply" :disabled="!replyMessage.trim() || sending"
                                class="send-reply-btn">
                                <span v-if="sending" class="spinner-small"></span>
                                {{ sending ? 'Sending...' : 'Send Reply' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.admin-help-center {
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
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
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
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #4f46e5;
}

.stat-icon.total {
    background: #4f46e5;
}

.stat-card.open .stat-icon {
    background: #3b82f6;
}

.stat-card.in-progress .stat-icon {
    background: #f59e0b;
}

.stat-card.resolved .stat-icon {
    background: #10b981;
}

.stat-card.urgent .stat-icon {
    background: #ef4444;
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

.filter-group select {
    padding: 0.6rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 30px;
    font-size: 0.9rem;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;
}

.filter-group select:focus {
    outline: none;
    border-color: #4f46e5;
}

.search-group {
    min-width: 250px;
}

.search-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.search-wrapper svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    stroke: #94a3b8;
    pointer-events: none;
}

.search-wrapper input {
    width: 100%;
    padding: 0.6rem 1rem 0.6rem 2.5rem;
    border: 2px solid #e2e8f0;
    border-radius: 30px;
    font-size: 0.9rem;
    transition: all 0.3s ease;
}

.search-wrapper input:focus {
    outline: none;
    border-color: #4f46e5;
}

.results-info {
    color: #64748b;
    font-size: 0.85rem;
    font-weight: 500;
}

/* Tickets Table */
.tickets-table {
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

.ticket-id {
    font-family: monospace;
    font-weight: 600;
    color: #4f46e5;
}

.subject {
    max-width: 250px;
}

.subject-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
    cursor: pointer;
}

.user-info {
    display: flex;
    flex-direction: column;
}

.user-info small {
    font-size: 0.7rem;
    color: #94a3b8;
}

.category-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: #f1f5f9;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: capitalize;
    color: #475569;
}

.priority-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;
}

.priority-badge.urgent {
    background: #fee2e2;
    color: #ef4444;
}

.priority-badge.high {
    background: #fed7aa;
    color: #f97316;
}

.priority-badge.medium {
    background: #fef3c7;
    color: #f59e0b;
}

.priority-badge.low {
    background: #e0e7ff;
    color: #4f46e5;
}

.status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;
}

.status-badge.open {
    background: #dbeafe;
    color: #2563eb;
}

.status-badge.in_progress {
    background: #fed7aa;
    color: #f97316;
}

.status-badge.resolved {
    background: #d1fae5;
    color: #10b981;
}

.status-badge.closed {
    background: #e2e8f0;
    color: #475569;
}

.reply-count {
    font-weight: 600;
    color: #4f46e5;
    text-align: center;
}

.view-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 1rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 500;
    transition: all 0.3s ease;
}

.view-btn svg {
    stroke: white;
}

.view-btn:hover {
    background: #4338ca;
    transform: translateY(-2px);
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
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.modal-content {
    background: white;
    border-radius: 24px;
    max-width: 800px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
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
    align-items: flex-start;
    padding: 1.5rem;
    border-bottom: 2px solid #f1f5f9;
}

.modal-header h3 {
    margin: 0;
    color: #1e293b;
    font-size: 1.2rem;
    font-weight: 700;
}

.ticket-subject {
    color: #64748b;
    margin-top: 0.25rem;
    font-size: 0.9rem;
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
    transition: all 0.3s ease;
    color: #64748b;
}

.close-btn:hover {
    background: #f1f5f9;
    color: #ef4444;
    transform: rotate(90deg);
}

.modal-body {
    padding: 1.5rem;
}

.ticket-info {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 16px;
    margin-bottom: 1.5rem;
}

.info-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.info-row {
    display: flex;
}

.info-label {
    width: 110px;
    font-weight: 500;
    color: #64748b;
    font-size: 0.85rem;
}

.info-value {
    flex: 1;
    color: #1e293b;
    font-size: 0.9rem;
}

.priority-select,
.status-select,
.assign-select {
    padding: 0.25rem 0.5rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.85rem;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;
}

.priority-select:focus,
.status-select:focus,
.assign-select:focus {
    outline: none;
    border-color: #4f46e5;
}

.priority-select.urgent {
    background: #fee2e2;
}

.priority-select.high {
    background: #fed7aa;
}

.priority-select.medium {
    background: #fef3c7;
}

.priority-select.low {
    background: #e0e7ff;
}

.status-select.open {
    background: #dbeafe;
}

.status-select.in_progress {
    background: #fed7aa;
}

.status-select.resolved {
    background: #d1fae5;
}

.status-select.closed {
    background: #e2e8f0;
}

.original-message {
    background: #f1f5f9;
    padding: 1rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
}

.original-message h4 {
    margin-bottom: 0.5rem;
    color: #1e293b;
    font-size: 0.9rem;
}

.original-message p {
    color: #475569;
    line-height: 1.6;
    margin: 0;
}

.replies-section {
    margin-bottom: 1.5rem;
}

.replies-section h4 {
    margin-bottom: 1rem;
    color: #1e293b;
    font-size: 0.9rem;
}

.replies-list {
    max-height: 300px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.reply-item {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 12px;
    position: relative;
}

.reply-item.internal-note {
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
}

.reply-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.reply-author {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.reply-author strong {
    font-size: 0.85rem;
    color: #1e293b;
}

.reply-role {
    font-size: 0.7rem;
    padding: 0.15rem 0.5rem;
    background: #e2e8f0;
    border-radius: 12px;
    color: #475569;
}

.reply-date {
    font-size: 0.7rem;
    color: #94a3b8;
}

.reply-message {
    color: #475569;
    line-height: 1.5;
    margin: 0;
    font-size: 0.9rem;
}

.internal-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    margin-top: 0.5rem;
    font-size: 0.7rem;
    color: #f59e0b;
}

.internal-badge svg {
    stroke: currentColor;
}

/* Reply Form */
.reply-form h4 {
    margin-bottom: 0.75rem;
    color: #1e293b;
    font-size: 0.9rem;
}

.textarea-wrapper {
    position: relative;
    margin-bottom: 1rem;
}

.textarea-wrapper svg {
    position: absolute;
    left: 12px;
    top: 12px;
    stroke: #94a3b8;
    pointer-events: none;
}

.reply-form textarea {
    width: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.9rem;
    resize: vertical;
    font-family: inherit;
    transition: all 0.3s ease;
}

.reply-form textarea:focus {
    outline: none;
    border-color: #4f46e5;
}

.reply-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.internal-note-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.85rem;
    color: #64748b;
}

.internal-note-checkbox input {
    width: 16px;
    height: 16px;
    cursor: pointer;
}

.send-reply-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.5rem;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.send-reply-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
}

.send-reply-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Loading & Empty States */
.loading-state,
.empty-state {
    text-align: center;
    padding: 3rem;
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

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
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

/* Responsive */
@media (max-width: 1200px) {
    .stats-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 768px) {
    .main-content {
        padding: 1rem;
    }

    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
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

    .filter-group select,
    .search-group {
        width: 100%;
    }

    .info-row {
        flex-direction: column;
        gap: 0.25rem;
    }

    .info-label {
        width: auto;
    }

    .reply-actions {
        flex-direction: column;
    }

    .internal-note-checkbox {
        width: 100%;
    }

    .send-reply-btn {
        width: 100%;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }

    .page-header {
        flex-direction: column;
    }
}
</style>