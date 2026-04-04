<template>
    <div class="reschedule-page">
        <noSearchNavbar />

        <div class="reschedule-container">
            <div class="page-header">
                <button @click="goBack" class="back-btn">← Back</button>
                <h1>Reschedule Booking</h1>
            </div>

            <div v-if="loading" class="loading-state">
                <div class="spinner"></div>
                <p>Loading booking details...</p>
            </div>

            <div v-else-if="error" class="error-state">
                <p>{{ error }}</p>
                <button @click="goBack" class="btn-primary">Go Back</button>
            </div>

            <div v-else-if="booking" class="reschedule-card">
                <div class="booking-summary">
                    <h2>Booking with {{ booking.skilled_firstName }} {{ booking.skilled_lastName }}</h2>
                    <div class="summary-details">
                        <p><strong>Current Date:</strong> {{ formatDateTime(booking.service_date) }}</p>
                        <p><strong>Duration:</strong> {{ booking.duration }} hours</p>
                        <p><strong>Location:</strong> {{ booking.address }}, {{ booking.barangay }}, {{ booking.city }}
                        </p>
                    </div>
                </div>

                <form @submit.prevent="submitReschedule" class="reschedule-form">
                    <div class="form-group">
                        <label>Select New Date <span class="required">*</span></label>
                        <input type="date" v-model="form.date" :min="minDate" @change="loadAvailableSlots"
                            class="form-input" required>
                    </div>

                    <div class="form-group" v-if="form.date">
                        <label>Select New Time <span class="required">*</span></label>
                        <div class="time-slots">
                            <button v-for="slot in availableSlots" :key="slot.time" type="button"
                                @click="selectTimeSlot(slot)" :class="['time-slot', {
                                    selected: selectedSlot === slot.time,
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
                        <textarea v-model="form.reason"
                            placeholder="Let the professional know why you need to reschedule..." rows="3"
                            class="form-textarea"></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="button" @click="goBack" class="btn-cancel">Cancel</button>
                        <button type="submit" class="btn-submit" :disabled="!isFormValid || submitting">
                            <span v-if="submitting" class="spinner-small"></span>
                            {{ submitting ? 'Processing...' : 'Confirm Reschedule' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import noSearchNavbar from '@/components/noSearchNavbar.vue'
import { getBookingById, rescheduleBooking, getAvailableSlots } from '@/api/bookingService'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const booking = ref(null)
const availableSlots = ref([])
const selectedSlot = ref(null)

const form = ref({
    date: '',
    reason: ''
})

// Min date (today)
const minDate = new Date().toISOString().split('T')[0]

// Form validation
const isFormValid = computed(() => {
    return form.value.date && selectedSlot.value
})

// Load booking details
const loadBooking = async () => {
    loading.value = true
    try {
        const bookingId = route.params.id
        const response = await getBookingById(bookingId)
        booking.value = response.booking
    } catch (err) {
        console.error('Error loading booking:', err)
        error.value = 'Failed to load booking details'
    } finally {
        loading.value = false
    }
}

// Load available time slots
const loadAvailableSlots = async () => {
    if (!form.value.date || !booking.value) return

    try {
        const response = await getAvailableSlots(booking.value.skilled_id, form.value.date)
        availableSlots.value = response.slots
        selectedSlot.value = null
    } catch (error) {
        console.error('Error loading slots:', error)
    }
}

// Select time slot
const selectTimeSlot = (slot) => {
    if (!slot.available) return
    selectedSlot.value = slot.time
}

// Format time
const formatTime = (datetime) => {
    const date = new Date(datetime)
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    })
}

// Format date time
const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    })
}

// Submit reschedule
const submitReschedule = async () => {
    if (!isFormValid.value) return

    submitting.value = true
    try {
        await rescheduleBooking(
            route.params.id,
            selectedSlot.value,
            form.value.reason
        )

        // Redirect to booking details with success message
        router.push({
            path: `/bookings/${route.params.id}`,
            query: { rescheduled: 'success' }
        })
    } catch (err) {
        alert(err.response?.data?.message || 'Failed to reschedule booking')
    } finally {
        submitting.value = false
    }
}

// Go back
const goBack = () => {
    router.back()
}

onMounted(() => {
    loadBooking()
})
</script>

<style scoped>
.reschedule-page {
    min-height: 100vh;
    background: #f8fafc;
}

.reschedule-container {
    max-width: 700px;
    margin: 80px auto 2rem;
    padding: 0 1.5rem;
}

.page-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
}

.back-btn {
    background: none;
    border: none;
    color: #4f46e5;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: background 0.3s;
}

.back-btn:hover {
    background: #f1f5f9;
}

.page-header h1 {
    color: #1e293b;
    margin: 0;
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

.error-state {
    text-align: center;
    padding: 2rem;
    background: #fee2e2;
    border-radius: 12px;
    color: #991b1b;
}

.reschedule-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.booking-summary {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
}

.booking-summary h2 {
    color: #1e293b;
    margin-bottom: 1rem;
    font-size: 1.3rem;
}

.summary-details {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 8px;
    line-height: 1.6;
}

.reschedule-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-weight: 500;
    color: #334155;
}

.required {
    color: #ef4444;
}

.form-input,
.form-textarea {
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
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

.form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
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
</style>