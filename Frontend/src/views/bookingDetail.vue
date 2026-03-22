<!-- frontend/src/views/BookingDetail.vue -->
<template>
    <div class="booking-detail-page">
        <noSearchNavbar />

        <div class="booking-detail-container">
            <div class="booking-detail-header">
                <button @click="goBack" class="back-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                    Back to My Bookings
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
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12 8V12M12 16H12.01M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="currentColor" stroke-width="1.5" />
                </svg>
                <p>{{ error }}</p>
                <button @click="loadBooking" class="retry-btn">Try Again</button>
            </div>

            <!-- Booking Details -->
            <div v-else-if="booking" class="booking-detail-card">
                <!-- Status Banner -->
                <div class="status-banner" :class="booking.status">
                    <span class="status-icon" v-html="statusIcon"></span>
                    <span class="status-text">Booking {{ booking.status }}</span>
                </div>

                <div class="detail-grid">
                    <!-- Left Column - Other Party Info -->
                    <div class="info-section">
                        <h2>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                                    stroke="currentColor" stroke-width="1.5" />
                                <path
                                    d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                                    stroke="currentColor" stroke-width="1.5" />
                            </svg>
                            {{ otherPartyRole }} Details
                        </h2>

                        <div class="professional-detail">
                            <img :src="otherPartyImage" :alt="otherPartyName" class="professional-detail-image">
                            <div class="professional-detail-info">
                                <h3>{{ otherPartyName }}</h3>
                                <p class="professional-skill">{{ otherPartyRole }}</p>
                                <div class="professional-rating">
                                    <span class="stars">{{ '★'.repeat(Math.floor(otherPartyRating)) }}</span>
                                    <span>({{ otherPartyReviews }} reviews)</span>
                                </div>
                            </div>
                        </div>

                        <div class="info-row">
                            <span class="info-label">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M22 16.92V19.92C22.0001 20.1985 21.944 20.4742 21.8356 20.7293C21.7271 20.9845 21.5686 21.2136 21.3701 21.4019C21.1716 21.5901 20.9377 21.7335 20.6829 21.8227C20.4282 21.9119 20.1578 21.9451 19.89 21.92C16.672 21.5856 13.5881 20.534 10.87 18.85C8.33805 17.2857 6.17423 15.2022 4.52 12.74C2.82233 10.2335 1.78005 7.36284 1.5 4.36C1.47466 4.09269 1.50768 3.82278 1.59677 3.56839C1.68586 3.31399 1.8291 3.08045 2.01725 2.88222C2.20541 2.68399 2.43446 2.52569 2.68966 2.41743C2.94486 2.30917 3.22064 2.25322 3.5 2.25322H6.5C7.024 2.25322 7.5 2.62322 7.62 3.13322L8.32 6.33322C8.425 6.81322 8.2 7.29322 7.83 7.58322L5.81 9.19322C7.293 12.0852 9.498 14.2792 12.4 15.7702L14.02 13.7502C14.31 13.3802 14.79 13.1552 15.27 13.2602L18.47 13.9602C18.98 14.0802 19.35 14.5562 19.35 15.0802V18.0802C19.35 18.4492 19.095 18.7712 18.73 18.8302L18.47 18.86Z"
                                        stroke="currentColor" stroke-width="1.5" />
                                </svg>
                                Contact:
                            </span>
                            <span class="info-value">{{ otherPartyPhone }}</span>
                        </div>

                        <div class="info-row">
                            <span class="info-label">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                                        stroke="currentColor" stroke-width="1.5" />
                                    <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="1.5" />
                                </svg>
                                Email:
                            </span>
                            <span class="info-value">{{ otherPartyEmail }}</span>
                        </div>

                        <!-- View Full Profile Button -->
                        <button @click="viewOtherPartyProfile" class="btn-view-profile">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                                    stroke="currentColor" stroke-width="1.5" />
                                <path
                                    d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                                    stroke="currentColor" stroke-width="1.5" />
                            </svg>
                            View Full Profile
                        </button>
                    </div>

                    <!-- Right Column - Booking Info -->
                    <div class="info-section">
                        <h2>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor"
                                    stroke-width="1.5" />
                                <path d="M8 2V6M16 2V6M3 10H21" stroke="currentColor" stroke-width="1.5" />
                            </svg>
                            Booking Information
                        </h2>

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
                        <h2>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M12 2V4M12 20V22M4 12H2M6.5 6.5L5 5M17.5 17.5L19 19M22 12H20M18 6L19 5M5 19L6.5 17.5M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8Z"
                                    stroke="currentColor" stroke-width="1.5" />
                            </svg>
                            Payment Details
                        </h2>

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
                        <h2>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                    stroke="currentColor" stroke-width="1.5" />
                            </svg>
                            Booking Timeline
                        </h2>

                        <div class="timeline">
                            <div class="timeline-item">
                                <div class="timeline-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor"
                                            stroke-width="1.5" />
                                        <path d="M8 2V6M16 2V6M3 10H21" stroke="currentColor" stroke-width="1.5" />
                                    </svg>
                                </div>
                                <div class="timeline-content">
                                    <h4>Booking Created</h4>
                                    <p>{{ formatFullDate(booking.created_at) }}</p>
                                </div>
                            </div>

                            <div class="timeline-item" v-if="booking.status !== 'pending'">
                                <div class="timeline-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                                <div class="timeline-content">
                                    <h4>Booking {{ booking.status }}</h4>
                                    <p>{{ formatFullDate(booking.updated_at) }}</p>
                                </div>
                            </div>

                            <div class="timeline-item" v-if="booking.status === 'completed'">
                                <div class="timeline-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2Z"
                                            fill="currentColor" stroke="currentColor" stroke-width="1.5" />
                                    </svg>
                                </div>
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
                        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                        {{ cancelling ? 'Cancelling...' : 'Cancel Booking' }}
                    </button>

                    <button v-if="booking.status === 'confirmed'" @click="openRescheduleModal" class="btn-reschedule">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 4V12L16 16M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                stroke="white" stroke-width="1.5" />
                        </svg>
                        Reschedule
                    </button>

                    <button v-if="booking.status === 'completed'" @click="leaveReview" class="btn-review">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2Z"
                                fill="currentColor" stroke="currentColor" stroke-width="1.5" />
                        </svg>
                        Leave Review
                    </button>

                    <button @click="contactOtherParty" class="btn-contact">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                                stroke="white" stroke-width="1.5" />
                            <path d="M8 9H16M8 13H13" stroke="white" stroke-width="1.5" />
                        </svg>
                        Message
                    </button>
                </div>
            </div>
        </div>

        <!-- Reschedule Modal -->
        <div v-if="showRescheduleModal" class="modal-overlay" @click="closeRescheduleModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Reschedule Booking</h3>
                    <button @click="closeRescheduleModal" class="close-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="booking-summary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.5" />
                            <path d="M8 2V6M16 2V6M3 10H21" stroke="currentColor" stroke-width="1.5" />
                        </svg>
                        <div>
                            <p><strong>Current Date:</strong> {{ formatFullDate(booking?.service_date) }}</p>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Select New Date <span class="required">*</span></label>
                        <div class="date-input-wrapper">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor"
                                    stroke-width="1.5" />
                                <path d="M8 2V6M16 2V6M3 10H21" stroke="currentColor" stroke-width="1.5" />
                            </svg>
                            <input type="date" v-model="rescheduleForm.date" :min="minDate" @change="loadAvailableSlots"
                                class="form-input">
                        </div>
                    </div>

                    <div class="form-group" v-if="rescheduleForm.date">
                        <label>Select New Time <span class="required">*</span></label>
                        <div class="time-slots">
                            <button v-for="slot in availableSlots" :key="slot.time" type="button"
                                @click="selectTimeSlot(slot)" :class="['time-slot', {
                                    selected: rescheduleForm.selectedSlot === slot.time,
                                    unavailable: !slot.available
                                }]" :disabled="!slot.available">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M12 8V12L15 15M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                        stroke="currentColor" stroke-width="1.5" />
                                </svg>
                                {{ formatTime(slot.time) }}
                            </button>
                            <p v-if="availableSlots.length === 0" class="no-slots">
                                No available slots for this date
                            </p>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Reason for rescheduling (optional)</label>
                        <div class="textarea-wrapper">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 3L21 7L7 21H3V17L17 3Z" stroke="currentColor" stroke-width="1.5" />
                            </svg>
                            <textarea v-model="rescheduleForm.reason"
                                placeholder="Let the professional know why you need to reschedule..." rows="3"
                                class="form-textarea"></textarea>
                        </div>
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

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import noSearchNavbar from '@/components/noSearchNavbar.vue'
import { getBookingById, cancelBooking as cancelBookingApi, rescheduleBooking, getAvailableSlots } from '@/api/bookingService'
import { getUserProfile } from '@/api/userService'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const booking = ref(null)
const cancelling = ref(false)
const currentUser = ref(null)

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

// Helper function to get image URL
const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-avatar.png'
    let formattedPath = imagePath.replace(/\\/g, '/')
    if (!formattedPath.startsWith('/uploads')) {
        formattedPath = `/uploads/${formattedPath.split('/').pop()}`
    }
    return `http://localhost:3000${formattedPath}`
}

// Get current user to determine role
const getCurrentUser = async () => {
    try {
        const response = await getUserProfile()
        currentUser.value = response.user
        console.log('Current user:', currentUser.value)
    } catch (error) {
        console.error('Error getting current user:', error)
    }
}

// Determine the other party based on who the current user is
const otherPartyData = computed(() => {
    if (!booking.value || !currentUser.value) return null

    const currentUserId = currentUser.value.user_id
    const currentUserRole = currentUser.value.role

    console.log('========== BOOKING DETAILS ==========')
    console.log('Current User ID:', currentUserId)
    console.log('Current User Role:', currentUserRole)
    console.log('Booking client_id:', booking.value.client_id)
    console.log('Booking client_role:', booking.value.client_role)
    console.log('Booking client_skilled_id:', booking.value.client_skilled_id)
    console.log('Booking client_skilled_image:', booking.value.client_skilled_image)
    console.log('Booking client_image:', booking.value.client_image)
    console.log('Booking skilled_user_id:', booking.value.skilled_user_id)
    console.log('Booking skilled_id:', booking.value.skilled_id)
    console.log('Booking skilled_image:', booking.value.skilled_image)

    // Case 1: Current user is the client (person who made the booking)
    if (currentUserId === booking.value.client_id) {
        console.log('Case: User is CLIENT')
        // Other party is the skilled worker (the one being booked)
        // This is always a skilled worker profile
        return {
            id: booking.value.skilled_id,
            firstName: booking.value.skilled_firstName,
            lastName: booking.value.skilled_lastName,
            image: booking.value.skilled_image,
            phone: booking.value.skilled_phone,
            email: booking.value.skilled_email,
            rating: booking.value.skilled_rating,
            reviews: booking.value.skilled_reviews,
            role: 'Professional',
            profileType: 'skilled',
            profileLink: `/skilled-profile/${booking.value.skilled_id}`
        }
    }
    // Case 2: Current user is the skilled worker (the one being booked)
    else if (currentUserId === booking.value.skilled_user_id) {
        console.log('Case: User is SKILLED WORKER (being booked)')
        // Other party is the client
        // Determine if the client is a resident or a skilled worker

        // Check if the client is a skilled worker (has client_skilled_id)
        const isClientSkilled = booking.value.client_role === 'skilled'

        console.log('Is client a skilled worker?', isClientSkilled)
        console.log('Client skilled_id:', booking.value.client_skilled_id)

        if (isClientSkilled && booking.value.client_skilled_id) {
            // Client is also a skilled worker - use their skilled image from skilled_profiles
            console.log('Client is a skilled worker, using skilled image')
            return {
                id: booking.value.client_skilled_id,
                firstName: booking.value.client_firstName,
                lastName: booking.value.client_lastName,
                image: booking.value.client_skilled_image || booking.value.client_image,
                phone: booking.value.client_phone,
                email: booking.value.client_email,
                rating: booking.value.client_rating,
                reviews: booking.value.client_reviews,
                role: 'Professional',
                profileType: 'skilled',
                profileLink: `/skilled-profile/${booking.value.client_skilled_id}`
            }
        } else {
            // Client is a resident - use user image from users table
            console.log('Client is a resident, using user image')
            return {
                id: booking.value.client_id,
                firstName: booking.value.client_firstName,
                lastName: booking.value.client_lastName,
                image: booking.value.client_image,
                phone: booking.value.client_phone,
                email: booking.value.client_email,
                rating: booking.value.client_rating,
                reviews: booking.value.client_reviews,
                role: 'Resident',
                profileType: 'resident',
                profileLink: `/resident/${booking.value.client_id}`
            }
        }
    }

    console.log('Could not determine other party')
    return null
})

// Computed properties using otherPartyData
const otherPartyImage = computed(() => {
    return otherPartyData.value ? getImageUrl(otherPartyData.value.image) : '/default-avatar.png'
})

const otherPartyName = computed(() => {
    return otherPartyData.value ? `${otherPartyData.value.firstName} ${otherPartyData.value.lastName}` : ''
})

const otherPartyRole = computed(() => {
    return otherPartyData.value ? otherPartyData.value.role : ''
})

const otherPartyPhone = computed(() => {
    return otherPartyData.value ? otherPartyData.value.phone || 'Not provided' : 'Not provided'
})

const otherPartyEmail = computed(() => {
    return otherPartyData.value ? otherPartyData.value.email || 'Not provided' : 'Not provided'
})

const otherPartyRating = computed(() => {
    return otherPartyData.value ? otherPartyData.value.rating || 0 : 0
})

const otherPartyReviews = computed(() => {
    return otherPartyData.value ? otherPartyData.value.reviews || 0 : 0
})

const otherPartyProfileLink = computed(() => {
    return otherPartyData.value ? otherPartyData.value.profileLink : ''
})

// Status icon mapping with SVGs
const statusIcon = computed(() => {
    const status = booking.value?.status
    switch (status) {
        case 'pending':
            return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="1.5"/>
                    </svg>`
        case 'confirmed':
            return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>`
        case 'completed':
            return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2Z" fill="currentColor" stroke="currentColor" stroke-width="1.5"/>
                    </svg>`
        case 'cancelled':
            return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>`
        default:
            return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/>
                        <path d="M8 2V6M16 2V6M3 10H21" stroke="currentColor" stroke-width="1.5"/>
                    </svg>`
    }
})

// Load booking
const loadBooking = async () => {
    loading.value = true
    error.value = ''

    try {
        const bookingId = route.params.id
        const response = await getBookingById(bookingId)
        booking.value = response.booking
        console.log('Booking data:', booking.value)
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
        await loadBooking()
        alert('Booking rescheduled successfully')
    } catch (err) {
        alert(err.response?.data?.message || 'Failed to reschedule booking')
    } finally {
        rescheduling.value = false
    }
}

// Leave review for professional
const leaveReview = () => {
    if (!booking.value) return

    router.push({
        path: `/skilled-profile/${booking.value.skilled_id}`,
        query: { booking_id: booking.value.booking_id, review: 'true' }
    })
}

// View other party profile
const viewOtherPartyProfile = () => {
    if (!otherPartyProfileLink.value) return
    console.log('Navigating to:', otherPartyProfileLink.value)
    router.push(otherPartyProfileLink.value)
}

// Contact other party
const contactOtherParty = () => {
    if (!otherPartyData.value) return

    if (otherPartyData.value.profileType === 'skilled') {
        router.push(`/messages?skilled=${otherPartyData.value.id}`)
    } else {
        router.push(`/messages?user=${otherPartyData.value.id}`)
    }
}

onMounted(async () => {
    await getCurrentUser()
    await loadBooking()
})
</script>

<style scoped>
.btn-view-profile {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    margin-top: 1rem;
    padding: 0.75rem;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-view-profile:hover {
    background: #059669;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
}

.btn-view-profile svg {
    stroke: white;
}

/* Keep all your existing styles from the original component */
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
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.2rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    color: #4f46e5;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.back-btn:hover {
    background: #f1f5f9;
    border-color: #4f46e5;
    transform: translateY(-2px);
}

.back-btn svg {
    stroke: currentColor;
}

.booking-detail-header h1 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
}

/* Loading State */
.loading-state {
    text-align: center;
    padding: 3rem;
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

/* Error State */
.error-state {
    text-align: center;
    padding: 3rem;
    background: #fef2f2;
    border-radius: 20px;
    color: #991b1b;
}

.error-state svg {
    stroke: #ef4444;
    margin-bottom: 1rem;
}

.retry-btn {
    margin-top: 1rem;
    padding: 0.6rem 1.5rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.retry-btn:hover {
    background: #dc2626;
    transform: translateY(-2px);
}

/* Booking Detail Card */
.booking-detail-card {
    background: white;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
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

.status-icon svg {
    stroke: currentColor;
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
    border-radius: 16px;
}

.info-section.full-width {
    grid-column: span 2;
}

.info-section h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #1e293b;
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e2e8f0;
}

.info-section h2 svg {
    stroke: #4f46e5;
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
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.info-label svg {
    stroke: #94a3b8;
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
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
    color: #fbbf24;
}

/* Payment Section */
.payment-summary {
    background: white;
    padding: 1rem;
    border-radius: 12px;
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
    border-radius: 8px;
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
    border-radius: 12px;
    border-left: 4px solid #4f46e5;
}

.timeline-icon svg {
    stroke: #4f46e5;
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
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-cancel {
    background: #ef4444;
    color: white;
}

.btn-cancel:hover:not(:disabled) {
    background: #dc2626;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(239, 68, 68, 0.3);
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
    box-shadow: 0 10px 20px rgba(245, 158, 11, 0.3);
}

.btn-review {
    background: #10b981;
    color: white;
}

.btn-review:hover {
    background: #059669;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
}

.btn-contact {
    background: #4f46e5;
    color: white;
    margin-left: auto;
}

.btn-contact:hover {
    background: #4338ca;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
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
    max-width: 500px;
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
    align-items: center;
    padding: 1.5rem;
    border-bottom: 2px solid #f1f5f9;
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

.booking-summary {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #f8fafc;
    padding: 1rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    border-left: 3px solid #4f46e5;
}

.booking-summary svg {
    stroke: #4f46e5;
    flex-shrink: 0;
}

.booking-summary p {
    margin: 0;
    color: #475569;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #334155;
    font-size: 0.9rem;
}

.required {
    color: #ef4444;
}

.date-input-wrapper,
.textarea-wrapper {
    position: relative;
}

.date-input-wrapper svg,
.textarea-wrapper svg {
    position: absolute;
    left: 12px;
    top: 12px;
    stroke: #94a3b8;
    pointer-events: none;
}

.form-input,
.form-textarea {
    width: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-textarea {
    resize: vertical;
    min-height: 80px;
}

.time-slots {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.75rem;
    margin-top: 0.5rem;
}

.time-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 0.5rem;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 500;
    color: #1e293b;
    cursor: pointer;
    transition: all 0.3s ease;
}

.time-slot svg {
    stroke: currentColor;
}

.time-slot:hover:not(:disabled) {
    background: #e0e7ff;
    border-color: #4f46e5;
    transform: translateY(-2px);
}

.time-slot.selected {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
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
    background: #f8fafc;
    border-radius: 8px;
}

.modal-footer {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    border-top: 2px solid #f1f5f9;
}

.btn-cancel,
.btn-submit {
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

.btn-cancel {
    background: #f1f5f9;
    color: #64748b;
}

.btn-cancel:hover {
    background: #e2e8f0;
}

.btn-submit {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
}

.btn-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
}

.btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.spinner-small {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
}

/* Responsive */
@media (max-width: 768px) {
    .detail-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 1.5rem;
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
        flex-direction: column;
    }

    .btn-contact {
        margin-left: 0;
    }

    .booking-detail-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .time-slots {
        grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    }
}
</style>