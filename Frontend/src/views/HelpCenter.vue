<!-- frontend/src/views/HelpCenter.vue -->
<template>
    <div class="help-center">
        <noSearchNavbar />

        <div class="help-container">
            <div class="help-header">
                <h1>Help Center</h1>
                <p>Get support from our team</p>
            </div>

            <div class="help-tabs">
                <button @click="activeTab = 'tickets'" :class="['tab', { active: activeTab === 'tickets' }]">
                    My Tickets
                </button>
                <button @click="activeTab = 'new'" :class="['tab', { active: activeTab === 'new' }]">
                    Create New Ticket
                </button>
            </div>

            <!-- My Tickets Tab -->
            <div v-if="activeTab === 'tickets'" class="tickets-section">
                <div v-if="loading" class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading your tickets...</p>
                </div>

                <div v-else-if="tickets.length === 0" class="empty-state">
                    <div class="empty-icon">🎫</div>
                    <h3>No tickets yet</h3>
                    <p>Create a support ticket to get help from our team</p>
                    <button @click="activeTab = 'new'" class="create-btn">Create Ticket</button>
                </div>

                <div v-else class="tickets-list">
                    <div v-for="ticket in tickets" :key="ticket.ticket_id" class="ticket-card"
                        @click="viewTicket(ticket)">
                        <div class="ticket-header">
                            <div>
                                <span class="ticket-id">#{{ ticket.ticket_uuid?.slice(-8) }}</span>
                                <h3>{{ ticket.subject }}</h3>
                            </div>
                            <span :class="['status-badge', ticket.status]">
                                {{ ticket.status }}
                            </span>
                        </div>
                        <div class="ticket-meta">
                            <span class="category">{{ ticket.category }}</span>
                            <span :class="['priority-badge', ticket.priority]">
                                {{ ticket.priority }}
                            </span>
                            <span class="date">{{ formatDate(ticket.created_at) }}</span>
                            <span class="replies">{{ ticket.reply_count || 0 }} replies</span>
                        </div>
                    </div>

                    <!-- Pagination -->
                    <div v-if="pagination && pagination.pages > 1" class="pagination">
                        <button @click="changePage(pagination.page - 1)" :disabled="pagination.page === 1">
                            Previous
                        </button>
                        <span>Page {{ pagination.page }} of {{ pagination.pages }}</span>
                        <button @click="changePage(pagination.page + 1)"
                            :disabled="pagination.page === pagination.pages">
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <!-- Create New Ticket Tab -->
            <div v-if="activeTab === 'new'" class="create-ticket-section">
                <form @submit.prevent="submitTicket" class="ticket-form">
                    <div class="form-group">
                        <label>Subject *</label>
                        <input type="text" v-model="newTicket.subject" placeholder="Brief summary of your issue"
                            required>
                    </div>

                    <div class="form-group">
                        <label>Category *</label>
                        <select v-model="newTicket.category" required>
                            <option value="">Select a category</option>
                            <option value="account">Account Issues</option>
                            <option value="payment">Payment Problems</option>
                            <option value="booking">Booking Issues</option>
                            <option value="technical">Technical Problems</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Priority *</label>
                        <select v-model="newTicket.priority">
                            <option value="low">Low - General inquiry</option>
                            <option value="medium">Medium - Need help within 24 hours</option>
                            <option value="high">High - Urgent issue</option>
                            <option value="urgent">Urgent - Critical problem</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Message *</label>
                        <textarea v-model="newTicket.message" rows="6"
                            placeholder="Please describe your issue in detail..."></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="button" @click="activeTab = 'tickets'" class="btn-cancel">Cancel</button>
                        <button type="submit" :disabled="submitting" class="btn-submit">
                            <span v-if="submitting" class="spinner-small"></span>
                            {{ submitting ? 'Submitting...' : 'Submit Ticket' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Ticket Detail Modal -->
        <div v-if="selectedTicket" class="modal-overlay" @click.self="closeModal">
            <div class="modal-content">
                <div class="modal-header">
                    <div>
                        <h3>Ticket #{{ selectedTicket.ticket_uuid?.slice(-8) }}</h3>
                        <p class="ticket-subject">{{ selectedTicket.subject }}</p>
                    </div>
                    <button @click="closeModal" class="close-btn">&times;</button>
                </div>

                <div class="modal-body">
                    <div class="ticket-info">
                        <div class="info-row">
                            <span class="info-label">Status:</span>
                            <span :class="['status-badge', selectedTicket.status]">
                                {{ selectedTicket.status }}
                            </span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Priority:</span>
                            <span :class="['priority-badge', selectedTicket.priority]">
                                {{ selectedTicket.priority }}
                            </span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Category:</span>
                            <span class="info-value">{{ selectedTicket.category }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Created:</span>
                            <span class="info-value">{{ formatFullDate(selectedTicket.created_at) }}</span>
                        </div>
                    </div>

                    <div class="original-message">
                        <h4>Your Message</h4>
                        <p>{{ selectedTicket.message }}</p>
                    </div>

                    <div class="replies-section">
                        <h4>Conversation</h4>
                        <div class="replies-list">
                            <div v-for="reply in replies" :key="reply.reply_id" class="reply-item">
                                <div class="reply-header">
                                    <strong>{{ reply.firstName || reply.admin_firstName }} {{ reply.lastName ||
                                        reply.admin_lastName }}</strong>
                                    <span class="reply-date">{{ formatDateTime(reply.created_at) }}</span>
                                </div>
                                <p class="reply-message">{{ reply.message }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="reply-form">
                        <h4>Add Reply</h4>
                        <textarea v-model="replyMessage" placeholder="Type your response..." rows="4"></textarea>
                        <button @click="sendReply" :disabled="!replyMessage.trim() || sending" class="send-reply-btn">
                            <span v-if="sending" class="spinner-small"></span>
                            {{ sending ? 'Sending...' : 'Send Reply' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import noSearchNavbar from '@/components/noSearchNavbar.vue'
import { getUserTickets, getTicketById, createSupportTicket, addTicketReply } from '@/api/helpService'

const loading = ref(true)
const tickets = ref([])
const pagination = ref(null)
const activeTab = ref('tickets')
const submitting = ref(false)
const selectedTicket = ref(null)
const replies = ref([])
const replyMessage = ref('')
const sending = ref(false)

const newTicket = ref({
    subject: '',
    category: '',
    priority: 'medium',
    message: ''
})

const loadTickets = async (page = 1) => {
    loading.value = true
    try {
        const response = await getUserTickets(page, 10)
        tickets.value = response.tickets
        pagination.value = response.pagination
    } catch (error) {
        console.error('Error loading tickets:', error)
    } finally {
        loading.value = false
    }
}

const submitTicket = async () => {
    if (!newTicket.value.subject || !newTicket.value.category || !newTicket.value.message) {
        alert('Please fill in all required fields')
        return
    }

    submitting.value = true
    try {
        await createSupportTicket(newTicket.value)
        alert('Ticket created successfully!')
        newTicket.value = {
            subject: '',
            category: '',
            priority: 'medium',
            message: ''
        }
        activeTab.value = 'tickets'
        await loadTickets()
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to create ticket')
    } finally {
        submitting.value = false
    }
}

const viewTicket = async (ticket) => {
    try {
        const response = await getTicketById(ticket.ticket_id)
        selectedTicket.value = response.ticket
        replies.value = response.replies || []
    } catch (error) {
        console.error('Error loading ticket details:', error)
    }
}

const sendReply = async () => {
    if (!replyMessage.value.trim()) return

    sending.value = true
    try {
        await addTicketReply(selectedTicket.value.ticket_id, replyMessage.value)
        replyMessage.value = ''
        // Refresh replies
        const response = await getTicketById(selectedTicket.value.ticket_id)
        replies.value = response.replies || []
        await loadTickets()
    } catch (error) {
        alert('Failed to send reply')
    } finally {
        sending.value = false
    }
}

const closeModal = () => {
    selectedTicket.value = null
    replies.value = []
    replyMessage.value = ''
}

const changePage = (page) => {
    loadTickets(page)
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

onMounted(() => {
    loadTickets()
})
</script>

<style scoped>
.help-center {
    min-height: 100vh;
    background: #f8fafc;
}

.help-container {
    max-width: 900px;
    margin: 80px auto 2rem;
    padding: 0 1.5rem;
}

.help-header {
    text-align: center;
    margin-bottom: 2rem;
}

.help-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
}

.help-header p {
    color: #64748b;
}

.help-tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    border-bottom: 2px solid #e2e8f0;
}

.tab {
    padding: 0.75rem 1.5rem;
    background: none;
    border: none;
    font-size: 1rem;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    transition: all 0.3s;
}

.tab.active {
    color: #4f46e5;
    border-bottom: 2px solid #4f46e5;
    margin-bottom: -2px;
}

/* Tickets List */
.tickets-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.ticket-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s;
}

.ticket-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ticket-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
}

.ticket-header h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
}

.ticket-id {
    font-size: 0.75rem;
    color: #94a3b8;
    font-family: monospace;
    display: block;
    margin-bottom: 0.25rem;
}

.ticket-meta {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
}

.category {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
    background: #f1f5f9;
    border-radius: 4px;
    color: #475569;
}

.date {
    font-size: 0.8rem;
    color: #94a3b8;
}

.replies {
    font-size: 0.8rem;
    color: #4f46e5;
}

/* Form Styles */
.ticket-form {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #334155;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.btn-cancel {
    padding: 0.75rem 1.5rem;
    background: #f1f5f9;
    color: #64748b;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
}

.btn-submit {
    padding: 0.75rem 1.5rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
}

.btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Badges */
.status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
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

.priority-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
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

/* Modal Styles */
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
    z-index: 1100;
}

.modal-content {
    background: white;
    border-radius: 16px;
    max-width: 700px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
    margin: 0;
    color: #1e293b;
}

.ticket-subject {
    color: #64748b;
    margin-top: 0.25rem;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #64748b;
}

.modal-body {
    padding: 1.5rem;
}

.ticket-info {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
}

.info-row {
    display: flex;
    margin-bottom: 0.5rem;
}

.info-row:last-child {
    margin-bottom: 0;
}

.info-label {
    width: 80px;
    color: #64748b;
    font-weight: 500;
}

.original-message {
    background: #f1f5f9;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
}

.original-message h4 {
    margin-bottom: 0.5rem;
    color: #1e293b;
}

.replies-section {
    margin-bottom: 1.5rem;
}

.replies-section h4 {
    margin-bottom: 1rem;
    color: #1e293b;
}

.replies-list {
    max-height: 300px;
    overflow-y: auto;
}

.reply-item {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.reply-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}

.reply-date {
    font-size: 0.75rem;
    color: #94a3b8;
}

.reply-message {
    color: #475569;
    line-height: 1.5;
    margin: 0;
}

.reply-form textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.95rem;
    resize: vertical;
    margin-bottom: 1rem;
}

.send-reply-btn {
    padding: 0.5rem 1.5rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
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
    background: white;
    border-radius: 12px;
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
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.create-btn {
    margin-top: 1rem;
    padding: 0.5rem 1.5rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}

.pagination {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
}

.pagination button {
    padding: 0.5rem 1rem;
    background: #f1f5f9;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .help-container {
        padding: 0 1rem;
    }

    .ticket-header {
        flex-direction: column;
        gap: 0.5rem;
    }

    .ticket-meta {
        flex-wrap: wrap;
    }

    .form-actions {
        flex-direction: column;
    }

    .modal-content {
        width: 95%;
    }
}
</style>