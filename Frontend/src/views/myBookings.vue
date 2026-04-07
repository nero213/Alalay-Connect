<template>
  <div class="my-bookings-page">
    <noSearchNavbar />

    <div class="bookings-container">
      <div class="page-header">
        <h1>My Bookings</h1>
        <p>View and manage all your service bookings</p>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button
          @click="statusFilter = 'all'"
          :class="['tab-btn', { active: statusFilter === 'all' }]"
        >
          All ({{ counts.all }})
        </button>
        <button
          @click="statusFilter = 'pending'"
          :class="['tab-btn', { active: statusFilter === 'pending' }]"
        >
          Pending ({{ counts.pending }})
        </button>
        <button
          @click="statusFilter = 'confirmed'"
          :class="['tab-btn', { active: statusFilter === 'confirmed' }]"
        >
          Confirmed ({{ counts.confirmed }})
        </button>
        <button
          @click="statusFilter = 'completed'"
          :class="['tab-btn', { active: statusFilter === 'completed' }]"
        >
          Completed ({{ counts.completed }})
        </button>
        <button
          @click="statusFilter = 'cancelled'"
          :class="['tab-btn', { active: statusFilter === 'cancelled' }]"
        >
          Cancelled ({{ counts.cancelled }})
        </button>
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
            <div class="professional-info">
              <img
                :src="getImageUrl(booking.skilled_image)"
                :alt="booking.skilled_firstName"
                class="professional-avatar"
              />
              <div>
                <h3>{{ booking.skilled_firstName }} {{ booking.skilled_lastName }}</h3>
                <p class="professional-skill">{{ booking.skills || 'Skilled Worker' }}</p>
              </div>
            </div>
            <span :class="['status-badge', booking.status]">
              {{ booking.status }}
            </span>
          </div>

          <div class="booking-details">
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">#{{ booking.booking_uuid?.substring(0, 8) }}</span>
            </div>
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
              <span class="detail-value"
                >{{ booking.address || 'Not specified' }}, {{ booking.barangay || '' }}
                {{ booking.city || '' }}</span
              >
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Amount:</span>
              <span class="detail-value amount"
                >₱{{ booking.total_amount?.toLocaleString() || 'TBD' }}</span
              >
            </div>
          </div>

          <div class="booking-actions">
            <button @click="viewDetails(booking.booking_id)" class="btn-view">View Details</button>
            <button
              v-if="booking.status === 'pending' || booking.status === 'confirmed'"
              @click="openCancelModal(booking)"
              class="btn-cancel"
            >
              Cancel Booking
            </button>
            <button
              v-if="booking.status === 'confirmed'"
              @click="openRescheduleModal(booking)"
              class="btn-reschedule"
            >
              Reschedule
            </button>
            <button
              v-if="booking.status === 'completed' && !hasUserRated(booking)"
              @click="leaveReview(booking)"
              class="btn-review"
            >
              Leave Review
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">📅</div>
        <h3>No bookings found</h3>
        <p>
          You don't have any {{ statusFilter !== 'all' ? statusFilter : '' }} bookings at the
          moment.
        </p>
        <router-link to="/dashboard" class="browse-btn"> Browse Skilled Worker </router-link>
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
          <p>
            Are you sure you want to cancel this booking with
            <strong
              >{{ selectedBooking?.skilled_firstName }}
              {{ selectedBooking?.skilled_lastName }}</strong
            >?
          </p>
          <div class="form-group">
            <label>Reason for cancellation <span class="required">*</span></label>
            <textarea
              v-model="cancelReason"
              placeholder="Please provide a reason for cancellation..."
              rows="3"
              required
            ></textarea>
          </div>
          <div class="warning-message">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
            <span>This action cannot be undone.</span>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModals" class="btn-secondary">Cancel</button>
          <button
            @click="confirmCancel"
            class="btn-danger"
            :disabled="!cancelReason.trim() || cancelling"
          >
            <span v-if="cancelling" class="spinner-small"></span>
            {{ cancelling ? 'Cancelling...' : 'Confirm Cancel' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Reschedule Modal -->
    <div v-if="showRescheduleModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Reschedule Booking</h3>
          <button @click="closeModals" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="current-booking">
            <p>
              <strong>Current Date:</strong> {{ formatDateTime(selectedBooking?.service_date) }}
            </p>
          </div>

          <div class="form-group">
            <label>Select New Date <span class="required">*</span></label>
            <input
              type="date"
              v-model="rescheduleForm.date"
              :min="minDate"
              @change="loadAvailableSlots"
              class="form-input"
            />
          </div>

          <div class="form-group" v-if="rescheduleForm.date">
            <label>Select New Time <span class="required">*</span></label>
            <div class="time-slots">
              <button
                v-for="slot in availableSlots"
                :key="slot.time"
                type="button"
                @click="selectTimeSlot(slot)"
                :class="[
                  'time-slot',
                  {
                    selected: rescheduleForm.selectedSlot === slot.time,
                    unavailable: !slot.available,
                  },
                ]"
                :disabled="!slot.available"
              >
                {{ formatTime(slot.time) }}
              </button>
              <p v-if="availableSlots.length === 0 && rescheduleForm.date" class="no-slots">
                No available slots for this date
              </p>
            </div>
          </div>

          <div class="form-group">
            <label>Reason for rescheduling (optional)</label>
            <textarea
              v-model="rescheduleForm.reason"
              placeholder="Let the professional know why you need to reschedule..."
              rows="2"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModals" class="btn-secondary">Cancel</button>
          <button
            @click="confirmReschedule"
            class="btn-primary"
            :disabled="!rescheduleForm.date || !rescheduleForm.selectedSlot || rescheduling"
          >
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
import { useRouter } from 'vue-router'
import noSearchNavbar from '@/components/noSearchNavbar.vue'
import {
  getClientBookings,
  cancelBooking,
  rescheduleBooking,
  getAvailableSlots,
} from '@/api/bookingService'
import { checkUserRating } from '@/api/ratingService'

const router = useRouter()
const loading = ref(true)
const bookings = ref([])
const statusFilter = ref('all')
const cancelling = ref(false)
const rescheduling = ref(false)
const showCancelModal = ref(false)
const showRescheduleModal = ref(false)
const selectedBooking = ref(null)
const cancelReason = ref('')
const rescheduleForm = ref({
  date: '',
  selectedSlot: null,
  reason: '',
})
const availableSlots = ref([])
const userRatings = ref({})

// Min date for reschedule (today)
const minDate = new Date().toISOString().split('T')[0]

// Load bookings
const loadBookings = async () => {
  loading.value = true
  try {
    const response = await getClientBookings()
    bookings.value = response.bookings
  } catch (error) {
    console.error('Error loading bookings:', error)
  } finally {
    loading.value = false
  }
}

// Filter bookings by status
const filteredBookings = computed(() => {
  if (statusFilter.value === 'all') return bookings.value
  return bookings.value.filter((b) => b.status === statusFilter.value)
})

// Count bookings by status
const counts = computed(() => {
  return {
    all: bookings.value.length,
    pending: bookings.value.filter((b) => b.status === 'pending').length,
    confirmed: bookings.value.filter((b) => b.status === 'confirmed').length,
    completed: bookings.value.filter((b) => b.status === 'completed').length,
    cancelled: bookings.value.filter((b) => b.status === 'cancelled').length,
  }
})

// Check if user has rated
const hasUserRated = async (booking) => {
  if (userRatings.value[booking.skilled_id] !== undefined) {
    return userRatings.value[booking.skilled_id]
  }
  try {
    const response = await checkUserRating(booking.skilled_id)
    userRatings.value[booking.skilled_id] = response.hasRated
    return response.hasRated
  } catch (error) {
    console.error('Error checking rating:', error)
    return false
  }
}

// Get image URL
const baseURl = import.meta.env.VITE_BASE_URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/default-avatar.png'
  let formattedPath = imagePath.replace(/\\/g, '/')
  if (!formattedPath.startsWith('/uploads')) {
    formattedPath = `/uploads/${formattedPath.split('/').pop()}`
  }
  return `${baseURl}${formattedPath}`
}

// Format date time
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

// Format time for slots
const formatTime = (datetime) => {
  const date = new Date(datetime)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

// View details
const viewDetails = (bookingId) => {
  router.push(`/bookings/${bookingId}`)
}

// Cancel modal
const openCancelModal = (booking) => {
  selectedBooking.value = booking
  cancelReason.value = ''
  showCancelModal.value = true
}

// Confirm cancel
const confirmCancel = async () => {
  if (!cancelReason.value.trim()) return

  cancelling.value = true
  try {
    await cancelBooking(selectedBooking.value.booking_id, cancelReason.value)
    await loadBookings()
    closeModals()
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to cancel booking')
  } finally {
    cancelling.value = false
  }
}

// Reschedule modal
const openRescheduleModal = (booking) => {
  selectedBooking.value = booking
  rescheduleForm.value = { date: '', selectedSlot: null, reason: '' }
  availableSlots.value = []
  showRescheduleModal.value = true
}

// Load available slots
const loadAvailableSlots = async () => {
  if (!rescheduleForm.value.date || !selectedBooking.value) return

  try {
    const response = await getAvailableSlots(
      selectedBooking.value.skilled_id,
      rescheduleForm.value.date,
    )
    availableSlots.value = response.slots
    rescheduleForm.value.selectedSlot = null
  } catch (error) {
    console.error('Error loading slots:', error)
  }
}

// Select time slot
const selectTimeSlot = (slot) => {
  if (!slot.available) return
  rescheduleForm.value.selectedSlot = slot.time
}

// Confirm reschedule
const confirmReschedule = async () => {
  if (!rescheduleForm.value.date || !rescheduleForm.value.selectedSlot) return

  rescheduling.value = true
  try {
    await rescheduleBooking(
      selectedBooking.value.booking_id,
      rescheduleForm.value.selectedSlot,
      rescheduleForm.value.reason,
    )
    await loadBookings()
    closeModals()
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to reschedule booking')
  } finally {
    rescheduling.value = false
  }
}

// Leave review
const leaveReview = (booking) => {
  router.push({
    path: `/skilled-profile/${booking.skilled_id}`,
    query: { booking_id: booking.booking_id, review: 'true' },
  })
}

// Close modals
const closeModals = () => {
  showCancelModal.value = false
  showRescheduleModal.value = false
  selectedBooking.value = null
  cancelReason.value = ''
  rescheduleForm.value = { date: '', selectedSlot: null, reason: '' }
  availableSlots.value = []
}

onMounted(() => {
  loadBookings()
})
</script>

<style scoped>
.my-bookings-page {
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
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #64748b;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
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

.professional-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.professional-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.professional-info h3 {
  color: #1e293b;
  margin-bottom: 0.25rem;
  font-size: 1rem;
}

.professional-skill {
  color: #64748b;
  font-size: 0.85rem;
}

.status-badge {
  padding: 0.3rem 1rem;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 600;
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

.detail-value.amount {
  color: #10b981;
  font-weight: 600;
}

.booking-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
}

.btn-view,
.btn-cancel,
.btn-reschedule,
.btn-review {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-view {
  background: #e0e7ff;
  color: #4f46e5;
}

.btn-view:hover {
  background: #c7d2fe;
}

.btn-cancel {
  background: #fee2e2;
  color: #991b1b;
}

.btn-cancel:hover {
  background: #fecaca;
}

.btn-reschedule {
  background: #fef3c7;
  color: #92400e;
}

.btn-reschedule:hover {
  background: #fde68a;
}

.btn-review {
  background: #d1fae5;
  color: #065f46;
}

.btn-review:hover {
  background: #a7f3d0;
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
  margin-bottom: 1.5rem;
}

.browse-btn {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.browse-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
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
  font-size: 1.2rem;
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

.current-booking {
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
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

.form-group textarea,
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
}

.form-group textarea:focus,
.form-input:focus {
  outline: none;
  border-color: #4f46e5;
}

.required {
  color: #ef4444;
}

.warning-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fef3c7;
  border-radius: 8px;
  margin-top: 1rem;
  color: #92400e;
  font-size: 0.85rem;
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

.btn-secondary,
.btn-primary,
.btn-danger {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary {
  background: #f1f5f9;
  color: #64748b;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-primary {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(79, 70, 229, 0.4);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
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

  .booking-actions {
    flex-direction: column;
  }

  .booking-actions button {
    width: 100%;
  }

  .time-slots {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
