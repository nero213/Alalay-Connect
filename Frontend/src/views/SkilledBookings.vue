<template>
    <div class="skilled-bookings-page">
        <noSearchNavbar />

        <div class="bookings-container">
            <div class="page-header">
                <h1>Manage Your Bookings</h1>
                <div class="filter-tabs">
                    <button @click="statusFilter = 'pending'"
                        :class="['tab-btn', { active: statusFilter === 'pending' }]">
                        Pending ({{ counts.pending }})
                    </button>
                    <button @click="statusFilter = 'confirmed'"
                        :class="['tab-btn', { active: statusFilter === 'confirmed' }]">
                        Confirmed ({{ counts.confirmed }})
                    </button>
                    <button @click="statusFilter = 'completed'"
                        :class="['tab-btn', { active: statusFilter === 'completed' }]">
                        Completed ({{ counts.completed }})
                    </button>
                    <button @click="statusFilter = 'cancelled'"
                        :class="['tab-btn', { active: statusFilter === 'cancelled' }]">
                        Cancelled ({{ counts.cancelled }})
                    </button>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
                <div class="spinner"></div>
                <p>Loading your bookings...</p>
            </div>

            <!-- Bookings List -->
            <div v-else-if="filteredBookings.length > 0" class="bookings-list">
                <div v-for="booking in filteredBookings" :key="booking.booking_id" class="booking-card">
                    <div class="booking-header">
                        <div class="client-info">
                            <h3>{{ booking.client_firstName }} {{ booking.client_lastName }}</h3>
                            <span class="booking-date">
                                Requested: {{ formatDate(booking.created_at) }}
                            </span>
                        </div>
                        <span :class="['status-badge', booking.status]">
                            {{ booking.status }}
                        </span>
                    </div>

                    <div class="booking-details">
                        <div class="detail-row">
                            <span class="detail-label">Service Date:</span>
                            <span class="detail-value">{{ formatDateTime(booking.service_date) }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Duration:</span>
                            <span class="detail-value">{{ booking.duration }} hours</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Location:</span>
                            <span class="detail-value">{{ booking.address || 'Not specified' }}, {{ booking.barangay ||
                                '' }} {{ booking.city || '' }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Contact:</span>
                            <span class="detail-value">{{ booking.client_phone || 'No phone' }} • {{
                                booking.client_email }}</span>
                        </div>
                        <div v-if="booking.notes" class="detail-row">
                            <span class="detail-label">Notes:</span>
                            <span class="detail-value">{{ booking.notes }}</span>
                        </div>
                    </div>

                    <!-- Action Buttons based on status -->
                    <div class="booking-actions">
                        <!-- Pending Bookings - Accept/Reject -->
                        <div v-if="booking.status === 'pending'" class="action-group">
                            <button @click="openAcceptModal(booking)" class="btn-accept">
                                <span class="btn-icon">✓</span> Accept
                            </button>
                            <button @click="openRejectModal(booking)" class="btn-reject">
                                <span class="btn-icon">✕</span> Reject
                            </button>
                            <button @click="viewDetails(booking)" class="btn-view">
                                <span class="btn-icon">👁️</span> Details
                            </button>
                        </div>

                        <!-- Confirmed Bookings - Complete/Cancel -->
                        <div v-else-if="booking.status === 'confirmed'" class="action-group">
                            <button @click="openCompleteModal(booking)" class="btn-complete">
                                <span class="btn-icon">✓</span> Mark Complete
                            </button>
                            <button @click="openCancelModal(booking)" class="btn-cancel">
                                <span class="btn-icon">✕</span> Cancel
                            </button>
                            <button @click="viewDetails(booking)" class="btn-view">
                                <span class="btn-icon">👁️</span> Details
                            </button>
                        </div>

                        <!-- Completed/Cancelled Bookings - View Only -->
                        <div v-else class="action-group">
                            <button @click="viewDetails(booking)" class="btn-view">
                                <span class="btn-icon">👁️</span> View Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-state">
                <div class="empty-icon">📅</div>
                <h3>No bookings found</h3>
                <p>You don't have any {{ statusFilter }} bookings at the moment.</p>
            </div>
        </div>

        <!-- Accept Modal -->
        <div v-if="showAcceptModal" class="modal-overlay" @click="closeModals">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Accept Booking</h3>
                    <button @click="closeModals" class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to accept this booking from <strong>{{ selectedBooking?.client_firstName }}
                            {{ selectedBooking?.client_lastName }}</strong>?</p>
                    <p class="booking-summary">
                        Date: {{ formatDateTime(selectedBooking?.service_date) }}<br>
                        Duration: {{ selectedBooking?.duration }} hours
                    </p>
                    <div class="form-group">
                        <label>Message to client (optional)</label>
                        <textarea v-model="actionMessage" placeholder="Add a note for the client..."
                            rows="3"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="closeModals" class="btn-cancel">Cancel</button>
                    <button @click="acceptBooking" class="btn-accept" :disabled="processing">
                        <span v-if="processing" class="spinner-small"></span>
                        {{ processing ? 'Processing...' : 'Confirm Accept' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Reject Modal -->
        <div v-if="showRejectModal" class="modal-overlay" @click="closeModals">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Reject Booking</h3>
                    <button @click="closeModals" class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to reject this booking from <strong>{{ selectedBooking?.client_firstName }}
                            {{ selectedBooking?.client_lastName }}</strong>?</p>
                    <div class="form-group">
                        <label>Reason for rejection <span class="required">*</span></label>
                        <textarea v-model="actionMessage" placeholder="Please provide a reason..." rows="3"
                            required></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="closeModals" class="btn-cancel">Cancel</button>
                    <button @click="rejectBooking" class="btn-reject" :disabled="processing || !actionMessage">
                        <span v-if="processing" class="spinner-small"></span>
                        {{ processing ? 'Processing...' : 'Confirm Reject' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Complete Modal -->
        <div v-if="showCompleteModal" class="modal-overlay" @click="closeModals">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Mark as Completed</h3>
                    <button @click="closeModals" class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Mark this booking as completed for <strong>{{ selectedBooking?.client_firstName }} {{
                        selectedBooking?.client_lastName }}</strong>?</p>
                    <p class="booking-summary">
                        Date: {{ formatDateTime(selectedBooking?.service_date) }}<br>
                        Duration: {{ selectedBooking?.duration }} hours
                    </p>
                </div>
                <div class="modal-footer">
                    <button @click="closeModals" class="btn-cancel">Cancel</button>
                    <button @click="completeBooking" class="btn-complete" :disabled="processing">
                        <span v-if="processing" class="spinner-small"></span>
                        {{ processing ? 'Processing...' : 'Confirm Complete' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Cancel Modal -->
        <div v-if="showCancelModal" class="modal-overlay" @click="closeModals">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Cancel Booking</h3>
                    <button @click="closeModals" class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to cancel this booking with <strong>{{ selectedBooking?.client_firstName }}
                            {{ selectedBooking?.client_lastName }}</strong>?</p>
                    <div class="form-group">
                        <label>Reason for cancellation <span class="required">*</span></label>
                        <textarea v-model="actionMessage" placeholder="Please provide a reason..." rows="3"
                            required></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="closeModals" class="btn-cancel">Cancel</button>
                    <button @click="cancelBooking" class="btn-cancel-action" :disabled="processing || !actionMessage">
                        <span v-if="processing" class="spinner-small"></span>
                        {{ processing ? 'Processing...' : 'Confirm Cancel' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import noSearchNavbar from '@/components/noSearchNavbar.vue'
import { getSkilledBookings, updateBookingStatus, rejectBooking as apiRejectBooking } from '@/api/bookingService'

const router = useRouter()
const loading = ref(true)
const bookings = ref([])
const statusFilter = ref('pending')
const processing = ref(false)

// Modal states
const showAcceptModal = ref(false)
const showRejectModal = ref(false)
const showCompleteModal = ref(false)
const showCancelModal = ref(false)
const selectedBooking = ref(null)
const actionMessage = ref('')

// Load bookings
const loadBookings = async () => {
    loading.value = true
    try {
        const response = await getSkilledBookings()
        bookings.value = response.bookings
    } catch (error) {
        console.error('Error loading bookings:', error)
    } finally {
        loading.value = false
    }
}

// Filter bookings by status
const filteredBookings = computed(() => {
    return bookings.value.filter(b => b.status === statusFilter.value)
})

// Count bookings by status
const counts = computed(() => {
    return {
        pending: bookings.value.filter(b => b.status === 'pending').length,
        confirmed: bookings.value.filter(b => b.status === 'confirmed').length,
        completed: bookings.value.filter(b => b.status === 'completed').length,
        cancelled: bookings.value.filter(b => b.status === 'cancelled').length
    }
})

// Modal functions
const openAcceptModal = (booking) => {
    selectedBooking.value = booking
    actionMessage.value = ''
    showAcceptModal.value = true
}

const openRejectModal = (booking) => {
    selectedBooking.value = booking
    actionMessage.value = ''
    showRejectModal.value = true
}

const openCompleteModal = (booking) => {
    selectedBooking.value = booking
    actionMessage.value = ''
    showCompleteModal.value = true
}

const openCancelModal = (booking) => {
    selectedBooking.value = booking
    actionMessage.value = ''
    showCancelModal.value = true
}

const closeModals = () => {
    showAcceptModal.value = false
    showRejectModal.value = false
    showCompleteModal.value = false
    showCancelModal.value = false
    selectedBooking.value = null
    actionMessage.value = ''
}

// Action functions
const acceptBooking = async () => {
    processing.value = true
    try {
        await updateBookingStatus(selectedBooking.value.booking_id, 'confirmed')
        await loadBookings()
        closeModals()
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to accept booking')
    } finally {
        processing.value = false
    }
}

const rejectBooking = async () => {
    if (!actionMessage.value) return

    processing.value = true
    try {
        await apiRejectBooking(selectedBooking.value.booking_id, actionMessage.value)
        await loadBookings()
        closeModals()
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to reject booking')
    } finally {
        processing.value = false
    }
}

const completeBooking = async () => {
    processing.value = true
    try {
        await updateBookingStatus(selectedBooking.value.booking_id, 'completed')
        await loadBookings()
        closeModals()
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to complete booking')
    } finally {
        processing.value = false
    }
}

const cancelBooking = async () => {
    if (!actionMessage.value) return

    processing.value = true
    try {
        await updateBookingStatus(selectedBooking.value.booking_id, 'cancelled')
        await loadBookings()
        closeModals()
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to cancel booking')
    } finally {
        processing.value = false
    }
}

const viewDetails = (booking) => {
    router.push(`/bookings/${booking.booking_id}`)
}

// Helper functions
const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    })
}

onMounted(() => {
    loadBookings()
})
</script>

<style scoped>
.skilled-bookings-page {
    min-height: 100vh;
    background: #f8fafc;
}

.bookings-container {
    max-width: 1000px;
    margin: 80px auto 2rem;
    padding: 0 1.5rem;
}

.page-header {
    margin-bottom: 2rem;
}

.page-header h1 {
    font-size: 2rem;
    color: #1e293b;
    margin-bottom: 1rem;
}

.filter-tabs {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.tab-btn {
    padding: 0.6rem 1.2rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 30px;
    font-size: 0.9rem;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    transition: all 0.3s;
}

.tab-btn:hover {
    border-color: #4f46e5;
    color: #4f46e5;
}

.tab-btn.active {
    background: #4f46e5;
    border-color: #4f46e5;
    color: white;
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

.spinner-small {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
    margin-right: 4px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Bookings List */
.bookings-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.booking-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
}

.booking-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.booking-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.2rem 1.5rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
}

.client-info h3 {
    color: #1e293b;
    margin-bottom: 0.25rem;
}

.booking-date {
    color: #64748b;
    font-size: 0.85rem;
}

.status-badge {
    padding: 0.3rem 1rem;
    border-radius: 30px;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: capitalize;
}

.status-badge.pending {
    background: #fef3c7;
    color: #92400e;
}

.status-badge.confirmed {
    background: #d1fae5;
    color: #065f46;
}

.status-badge.completed {
    background: #e0e7ff;
    color: #4f46e5;
}

.status-badge.cancelled {
    background: #fee2e2;
    color: #991b1b;
}

.booking-details {
    padding: 1.5rem;
}

.detail-row {
    display: flex;
    margin-bottom: 0.75rem;
    line-height: 1.5;
}

.detail-label {
    width: 100px;
    color: #64748b;
    font-size: 0.9rem;
}

.detail-value {
    flex: 1;
    color: #1e293b;
    font-weight: 500;
}

.booking-actions {
    padding: 1rem 1.5rem;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
}

.action-group {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.btn-accept,
.btn-reject,
.btn-complete,
.btn-cancel,
.btn-view,
.btn-cancel-action {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-icon {
    font-size: 1rem;
}

.btn-accept {
    background: #10b981;
    color: white;
}

.btn-accept:hover:not(:disabled) {
    background: #059669;
    transform: translateY(-2px);
}

.btn-reject {
    background: #ef4444;
    color: white;
}

.btn-reject:hover:not(:disabled) {
    background: #dc2626;
    transform: translateY(-2px);
}

.btn-complete {
    background: #4f46e5;
    color: white;
}

.btn-complete:hover:not(:disabled) {
    background: #4338ca;
    transform: translateY(-2px);
}

.btn-cancel,
.btn-cancel-action {
    background: #f1f5f9;
    color: #64748b;
}

.btn-cancel:hover:not(:disabled) {
    background: #e2e8f0;
}

.btn-cancel-action {
    background: #ef4444;
    color: white;
}

.btn-cancel-action:hover:not(:disabled) {
    background: #dc2626;
}

.btn-view {
    background: #e0e7ff;
    color: #4f46e5;
}

.btn-view:hover {
    background: #c7d2fe;
    transform: translateY(-2px);
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
    backdrop-filter: blur(3px);
}

.modal-content {
    background: white;
    border-radius: 16px;
    max-width: 450px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
}

.modal-header h3 {
    margin: 0;
    color: #1e293b;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: 0.3s;
}

.close-btn:hover {
    background: #f1f5f9;
}

.modal-body {
    padding: 1.5rem;
}

.booking-summary {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
    line-height: 1.6;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #334155;
}

.form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.95rem;
    resize: vertical;
}

.form-group textarea:focus {
    outline: none;
    border-color: #4f46e5;
}

.required {
    color: #ef4444;
}

.modal-footer {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    border-top: 1px solid #eee;
}

.btn-cancel,
.btn-accept,
.btn-reject,
.btn-complete,
.btn-cancel-action {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.btn-cancel {
    background: #f1f5f9;
    color: #64748b;
}

.btn-cancel:hover {
    background: #e2e8f0;
}

.btn-accept {
    background: #10b981;
    color: white;
}

.btn-reject {
    background: #ef4444;
    color: white;
}

.btn-complete {
    background: #4f46e5;
    color: white;
}

.btn-cancel-action {
    background: #ef4444;
    color: white;
}

.btn-accept:disabled,
.btn-reject:disabled,
.btn-complete:disabled,
.btn-cancel-action:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 4rem;
    background: white;
    border-radius: 16px;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.empty-state h3 {
    color: #1e293b;
    margin-bottom: 0.5rem;
}

.empty-state p {
    color: #64748b;
}

/* Add this to your SkilledBookings.vue styles */
.booking-card.highlighted {
    animation: highlight-pulse 2s ease;
    border: 2px solid #4f46e5;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.3);
}

@keyframes highlight-pulse {
    0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7);
    }

    50% {
        transform: scale(1.02);
        box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
    }

    100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
    }
}

/* Responsive */
@media (max-width: 768px) {
    .filter-tabs {
        justify-content: flex-start;
    }

    .booking-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .detail-row {
        flex-direction: column;
        gap: 0.25rem;
    }

    .detail-label {
        width: auto;
    }

    .action-group {
        flex-direction: column;
    }

    .action-group button {
        width: 100%;
    }
}
</style>