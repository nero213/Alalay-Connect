<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import noSearchNavbar from '@/components/noSearchNavbar.vue'
import { getBookingById, cancelBooking as cancelBookingApi, rescheduleBooking, getAvailableSlots } from '@/api/bookingService'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const booking = ref(null)
const cancelling = ref(false)

// Reschedule modal
const showRescheduleModal = ref(false)
const rescheduling = ref(false)
const rescheduleForm = ref({
    date: '',
    selectedSlot: null,
    reason: ''
})
const availableSlots = ref([])

// Min date for reschedule (today)
const minDate = new Date().toISOString().split('T')[0]

// Status icon mapping
const statusIcon = computed(() => {
    const status = booking.value?.status
    switch (status) {
        case 'pending': return '⏳'
        case 'confirmed': return '✅'
        case 'completed': return '🎉'
        case 'cancelled': return '❌'
        case 'no_show': return '⚠️'
        default: return '📅'
    }
})

// Professional image
const professionalImage = computed(() => {
    if (!booking.value?.skilled_image) return '/default-avatar.png'

    let imagePath = booking.value.skilled_image.replace(/\\/g, '/')

    if (!imagePath.startsWith('/uploads')) {
        imagePath = `/uploads/${imagePath.split('/').pop()}`
    }

    return `http://localhost:3000${imagePath}`
})

// Load booking
const loadBooking = async () => {
    loading.value = true
    error.value = ''

    try {
        const bookingId = route.params.id

        console.log('Loading booking with ID:', bookingId)

        const response = await getBookingById(bookingId)

        console.log('Booking data:', response)

        booking.value = response.booking
    } catch (err) {
        console.error('Error loading booking:', err)
        error.value = 'Failed to load booking details'
    } finally {
        loading.value = false
    }
}

// Format date
const formatFullDate = (dateString) => {
    if (!dateString) return 'N/A'

    const date = new Date(dateString)

    return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    })
}

// Format time for slots
const formatTime = (datetime) => {
    const date = new Date(datetime)
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    })
}

// Go back
const goBack = () => {
    router.push('/bookings')
}

// Cancel booking
const cancelBooking = async () => {
    if (!booking.value) return

    if (!confirm('Are you sure you want to cancel this booking?')) return

    cancelling.value = true

    try {
        await cancelBookingApi(booking.value.booking_id)
        booking.value.status = 'cancelled'
        alert('Booking cancelled successfully')
    } catch (err) {
        alert(err.response?.data?.message || 'Failed to cancel booking')
    } finally {
        cancelling.value = false
    }
}

// Reschedule modal functions
const openRescheduleModal = () => {
    showRescheduleModal.value = true
    rescheduleForm.value = { date: '', selectedSlot: null, reason: '' }
    availableSlots.value = []
}

const closeRescheduleModal = () => {
    showRescheduleModal.value = false
}

// Load available time slots
const loadAvailableSlots = async () => {
    if (!rescheduleForm.value.date || !booking.value) return

    try {
        const response = await getAvailableSlots(booking.value.skilled_id, rescheduleForm.value.date)
        availableSlots.value = response.slots
        rescheduleForm.value.selectedSlot = null
    } catch (error) {
        console.error('Error loading slots:', error)
        alert('Failed to load available time slots')
    }
}

// Select time slot
const selectTimeSlot = (slot) => {
    if (!slot.available) return
    rescheduleForm.value.selectedSlot = slot.time
}

// Submit reschedule
const submitReschedule = async () => {
    if (!rescheduleForm.value.date || !rescheduleForm.value.selectedSlot) return

    rescheduling.value = true
    try {
        await rescheduleBooking(
            booking.value.booking_id,
            rescheduleForm.value.selectedSlot,
            rescheduleForm.value.reason
        )

        closeRescheduleModal()
        await loadBooking() // Reload booking with new data
        alert('Booking rescheduled successfully')
    } catch (err) {
        alert(err.response?.data?.message || 'Failed to reschedule booking')
    } finally {
        rescheduling.value = false
    }
}

// Leave review
const leaveReview = () => {
    if (!booking.value) return

    router.push({
        path: `/skilled-profile/${booking.value.skilled_id}`,
        query: { booking_id: booking.value.booking_id, review: 'true' }
    })
}

// Contact professional
const contactProfessional = () => {
    if (!booking.value) return

    router.push(`/messages/${booking.value.skilled_id}`)
}

onMounted(() => {
    loadBooking()
})
</script>

<template>
    <div class="booking-detail-page">
        <noSearchNavbar />

        <div class="booking-detail-container">
            <div class="booking-detail-header">
                <button @click="goBack" class="back-btn">
                    ← Back to My Bookings
                </button>
                <h1>Booking Details</h1>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
                <div class="spinner"></div>
                <p>Loading booking details...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="error-state">
                <p>{{ error }}</p>
                <button @click="loadBooking" class="retry-btn">Try Again</button>
            </div>

            <!-- Booking Details -->
            <div v-else-if="booking" class="booking-detail-card">
                <!-- Status Banner -->
                <div class="status-banner" :class="booking.status">
                    <span class="status-icon">{{ statusIcon }}</span>
                    <span class="status-text">Booking {{ booking.status }}</span>
                </div>

                <div class="detail-grid">
                    <!-- Left Column - Professional Info -->
                    <div class="info-section">
                        <h2>Professional Details</h2>

                        <div class="professional-detail">
                            <img :src="professionalImage" :alt="booking.skilled_firstName"
                                class="professional-detail-image">
                            <div class="professional-detail-info">
                                <h3>{{ booking.skilled_firstName }} {{ booking.skilled_lastName }}</h3>
                                <p class="professional-skill">{{ booking.skills || 'Professional' }}</p>
                                <div class="professional-rating">
                                    <span class="stars">{{ '★'.repeat(Math.floor(booking.skilled_rating || 0)) }}</span>
                                    <span>({{ booking.skilled_reviews || 0 }} reviews)</span>
                                </div>
                            </div>
                        </div>

                        <div class="info-row">
                            <span class="info-label">Contact:</span>
                            <span class="info-value">{{ booking.skilled_phone || 'Not provided' }}</span>
                        </div>

                        <div class="info-row">
                            <span class="info-label">Email:</span>
                            <span class="info-value">{{ booking.skilled_email || 'Not provided' }}</span>
                        </div>
                    </div>

                    <!-- Right Column - Booking Info -->
                    <div class="info-section">
                        <h2>Booking Information</h2>

                        <div class="info-row">
                            <span class="info-label">Booking ID:</span>
                            <span class="info-value">#{{ booking.booking_uuid?.substring(0, 8) }}</span>
                        </div>

                        <div class="info-row">
                            <span class="info-label">Service Date:</span>
                            <span class="info-value">{{ formatFullDate(booking.service_date) }}</span>
                        </div>

                        <div class="info-row">
                            <span class="info-label">Duration:</span>
                            <span class="info-value">{{ booking.duration }} hours</span>
                        </div>

                        <div class="info-row">
                            <span class="info-label">Location:</span>
                            <span class="info-value">{{ booking.location || 'Not specified' }}</span>
                        </div>

                        <div class="info-row">
                            <span class="info-label">Address:</span>
                            <span class="info-value">
                                {{ booking.address || 'Not specified' }}
                                <span v-if="booking.barangay">, {{ booking.barangay }}</span>
                                <span v-if="booking.city">, {{ booking.city }}</span>
                            </span>
                        </div>

                        <div class="info-row" v-if="booking.notes">
                            <span class="info-label">Notes:</span>
                            <span class="info-value">{{ booking.notes }}</span>
                        </div>
                    </div>

                    <!-- Payment Section -->
                    <div class="info-section full-width">
                        <h2>Payment Details</h2>

                        <div class="payment-summary">
                            <div class="payment-row">
                                <span>Subtotal:</span>
                                <span>₱{{ booking.total_amount?.toLocaleString() || '0' }}</span>
                            </div>
                            <div class="payment-row total">
                                <span>Total:</span>
                                <span>₱{{ booking.total_amount?.toLocaleString() || '0' }}</span>
                            </div>
                            <div class="payment-status" :class="booking.payment_status">
                                Payment Status: {{ booking.payment_status }}
                            </div>
                        </div>
                    </div>

                    <!-- Timeline Section -->
                    <div class="info-section full-width">
                        <h2>Booking Timeline</h2>

                        <div class="timeline">
                            <div class="timeline-item">
                                <div class="timeline-icon">📅</div>
                                <div class="timeline-content">
                                    <h4>Booking Created</h4>
                                    <p>{{ formatFullDate(booking.created_at) }}</p>
                                </div>
                            </div>

                            <div class="timeline-item" v-if="booking.status !== 'pending'">
                                <div class="timeline-icon">✅</div>
                                <div class="timeline-content">
                                    <h4>Booking {{ booking.status }}</h4>
                                    <p>{{ formatFullDate(booking.updated_at) }}</p>
                                </div>
                            </div>

                            <div class="timeline-item" v-if="booking.status === 'completed'">
                                <div class="timeline-icon">⭐</div>
                                <div class="timeline-content">
                                    <h4>Ready for Review</h4>
                                    <p>Leave a review for this professional</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="detail-actions">
                    <button v-if="booking.status === 'pending' || booking.status === 'confirmed'" @click="cancelBooking"
                        class="btn-cancel" :disabled="cancelling">
                        <span v-if="cancelling" class="spinner-small"></span>
                        {{ cancelling ? 'Cancelling...' : 'Cancel Booking' }}
                    </button>

                    <button v-if="booking.status === 'confirmed'" @click="openRescheduleModal" class="btn-reschedule">
                        Reschedule
                    </button>

                    <button v-if="booking.status === 'completed'" @click="leaveReview" class="btn-review">
                        Leave Review
                    </button>

                    <button @click="contactProfessional" class="btn-contact">
                        Message Professional
                    </button>
                </div>
            </div>
        </div>

        <!-- Reschedule Modal -->
        <div v-if="showRescheduleModal" class="modal-overlay" @click="closeRescheduleModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Reschedule Booking</h3>
                    <button @click="closeRescheduleModal" class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="booking-summary">
                        <p><strong>Current Date:</strong> {{ formatFullDate(booking?.service_date) }}</p>
                    </div>

                    <div class="form-group">
                        <label>Select New Date <span class="required">*</span></label>
                        <input type="date" v-model="rescheduleForm.date" :min="minDate" @change="loadAvailableSlots"
                            class="form-input">
                    </div>

                    <div class="form-group" v-if="rescheduleForm.date">
                        <label>Select New Time <span class="required">*</span></label>
                        <div class="time-slots">
                            <button v-for="slot in availableSlots" :key="slot.time" type="button"
                                @click="selectTimeSlot(slot)" :class="['time-slot', {
                                    selected: rescheduleForm.selectedSlot === slot.time,
                                    unavailable: !slot.available
                                }]" :disabled="!slot.available">
                                {{ formatTime(slot.time) }}
                            </button>
                            <p v-if="availableSlots.length === 0" class="no-slots">
                                No available slots for this date
                            </p>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Reason for rescheduling (optional)</label>
                        <textarea v-model="rescheduleForm.reason"
                            placeholder="Let the professional know why you need to reschedule..." rows="3"
                            class="form-textarea"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="closeRescheduleModal" class="btn-cancel">Cancel</button>
                    <button @click="submitReschedule" class="btn-submit"
                        :disabled="!rescheduleForm.date || !rescheduleForm.selectedSlot || rescheduling">
                        <span v-if="rescheduling" class="spinner-small"></span>
                        {{ rescheduling ? 'Processing...' : 'Confirm Reschedule' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Add these new styles for the modal */
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
    max-width: 500px;
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
    margin-bottom: 1.5rem;
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

.required {
    color: #ef4444;
}

.form-input,
.form-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: all 0.3s;
}

.form-input:focus,
.form-textarea:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-textarea {
    resize: vertical;
}

.time-slots {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.75rem;
    margin-top: 0.5rem;
}

.time-slot {
    padding: 0.75rem 0.5rem;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    color: #1e293b;
    cursor: pointer;
    transition: all 0.3s;
}

.time-slot:hover:not(:disabled) {
    background: #e0e7ff;
    border-color: #4f46e5;
    transform: translateY(-2px);
}

.time-slot.selected {
    background: #4f46e5;
    border-color: #4f46e5;
    color: white;
}

.time-slot.unavailable {
    background: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
    opacity: 0.7;
}

.no-slots {
    grid-column: 1 / -1;
    text-align: center;
    color: #64748b;
    padding: 1rem;
}

.modal-footer {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    border-top: 1px solid #eee;
}

.btn-cancel,
.btn-submit {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-cancel {
    background: #f1f5f9;
    color: #64748b;
}

.btn-cancel:hover {
    background: #e2e8f0;
}

.btn-submit {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Keep all your existing styles below */
.booking-detail-page {
    min-height: 100vh;
    background: #f8fafc;
}

.booking-detail-container {
    max-width: 1000px;
    margin: 80px auto 2rem;
    padding: 0 1.5rem;
}

.booking-detail-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
}

.back-btn {
    padding: 0.5rem 1rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    color: #4f46e5;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
}

.back-btn:hover {
    background: #f1f5f9;
    border-color: #4f46e5;
}

.booking-detail-header h1 {
    font-size: 1.8rem;
    color: #1e293b;
    margin: 0;
}

/* Loading State */
.loading-state {
    text-align: center;
    padding: 3rem;
}

.spinner {
    width: 40px;
    height: 40px;
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

/* Error State */
.error-state {
    text-align: center;
    padding: 3rem;
    background: #fee2e2;
    border-radius: 12px;
    color: #991b1b;
}

.retry-btn {
    margin-top: 1rem;
    padding: 0.5rem 1.5rem;
    background: #991b1b;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

/* Booking Detail Card */
.booking-detail-card {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

/* Status Banner */
.status-banner {
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.status-banner.pending {
    background: #fef3c7;
    color: #92400e;
}

.status-banner.confirmed {
    background: #d1fae5;
    color: #065f46;
}

.status-banner.completed {
    background: #e0e7ff;
    color: #4f46e5;
}

.status-banner.cancelled {
    background: #fee2e2;
    color: #991b1b;
}

.status-banner.no_show {
    background: #f1f5f9;
    color: #475569;
}

.status-icon {
    font-size: 2rem;
}

.status-text {
    font-size: 1.2rem;
    font-weight: 600;
    text-transform: capitalize;
}

/* Detail Grid */
.detail-grid {
    padding: 2rem;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
}

.info-section {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 12px;
}

.info-section.full-width {
    grid-column: span 2;
}

.info-section h2 {
    color: #1e293b;
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e2e8f0;
}

.info-row {
    display: flex;
    margin-bottom: 1rem;
    line-height: 1.6;
}

.info-label {
    width: 120px;
    color: #64748b;
    font-weight: 500;
}

.info-value {
    flex: 1;
    color: #1e293b;
}

/* Professional Detail */
.professional-detail {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.professional-detail-image {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
}

.professional-detail-info h3 {
    color: #1e293b;
    margin-bottom: 0.25rem;
}

.professional-skill {
    color: #4f46e5;
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.professional-rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.stars {
    color: #ffc107;
}

/* Payment Section */
.payment-summary {
    background: white;
    padding: 1rem;
    border-radius: 8px;
}

.payment-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    color: #475569;
}

.payment-row.total {
    border-top: 2px solid #e2e8f0;
    margin-top: 0.5rem;
    padding-top: 1rem;
    font-weight: 700;
    color: #1e293b;
    font-size: 1.1rem;
}

.payment-status {
    margin-top: 1rem;
    padding: 0.5rem;
    text-align: center;
    border-radius: 6px;
    font-weight: 500;
}

.payment-status.pending {
    background: #fef3c7;
    color: #92400e;
}

.payment-status.paid {
    background: #d1fae5;
    color: #065f46;
}

.payment-status.refunded {
    background: #fee2e2;
    color: #991b1b;
}

/* Timeline */
.timeline {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.timeline-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    border-left: 4px solid #4f46e5;
}

.timeline-icon {
    font-size: 1.5rem;
}

.timeline-content h4 {
    color: #1e293b;
    margin-bottom: 0.25rem;
}

.timeline-content p {
    color: #64748b;
    font-size: 0.9rem;
}

/* Action Buttons */
.detail-actions {
    display: flex;
    gap: 1rem;
    padding: 1.5rem 2rem;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
}

.btn-cancel,
.btn-reschedule,
.btn-review,
.btn-contact {
    padding: 0.75rem 1.5rem;
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
    background: #ef4444;
    color: white;
}

.btn-cancel:hover:not(:disabled) {
    background: #dc2626;
    transform: translateY(-2px);
}

.btn-cancel:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-reschedule {
    background: #f59e0b;
    color: white;
}

.btn-reschedule:hover {
    background: #d97706;
    transform: translateY(-2px);
}

.btn-review {
    background: #10b981;
    color: white;
}

.btn-review:hover {
    background: #059669;
    transform: translateY(-2px);
}

.btn-contact {
    background: #4f46e5;
    color: white;
    margin-left: auto;
}

.btn-contact:hover {
    background: #4338ca;
    transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
    .detail-grid {
        grid-template-columns: 1fr;
    }

    .info-section.full-width {
        grid-column: span 1;
    }

    .info-row {
        flex-direction: column;
        gap: 0.25rem;
    }

    .info-label {
        width: auto;
    }

    .professional-detail {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .detail-actions {
        flex-wrap: wrap;
    }

    .btn-contact {
        margin-left: 0;
        width: 100%;
    }
}
</style>