<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import noSearchNavbar from '@/components/noSearchNavbar.vue'
import { getPublicSkilledProfile } from '@/api/skilledProfiles'
import { createBooking, getAvailableSlots } from '@/api/bookingService'
import { getCities, getBarangays } from '@/utils/locationService'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const professional = ref(null)
const availableSlots = ref([])
const selectedSlot = ref(null)
const showSuccess = ref(false)
const newBooking = ref(null)

// Load cities from JSON
const cities = getCities()

// Available barangays based on selected city
const availableBarangays = computed(() => {
    if (!form.city) return []
    return getBarangays(form.city)
})

console.log('Location service imported:', { getCities, getBarangays })
console.log('Cities:', getCities())
console.log('Barangays for San Carlos City:', getBarangays('San Carlos City'))

// Form data
const form = reactive({
    date: '',
    duration: 1,
    location: '',
    address: '',
    barangay: '',
    city: '',
    notes: '',
    latitude: null,
    longitude: null
})

// Min date (today)
const minDate = new Date().toISOString().split('T')[0]

// Professional image
const professionalImage = computed(() => {
    if (!professional.value?.profile_image) return '/default-avatar.png'
    let imagePath = professional.value.profile_image.replace(/\\/g, '/')
    if (!imagePath.startsWith('/uploads')) {
        imagePath = `/uploads/${imagePath.split('/').pop()}`
    }
    return `http://localhost:3000${imagePath}`
})

// Estimated total
const estimatedTotal = computed(() => {
    const rate = professional.value?.hourly_rate || 500
    return (rate * form.duration).toLocaleString()
})

// Form validation
const isFormValid = computed(() => {
    return form.date &&
        selectedSlot.value &&
        form.duration &&
        form.address &&
        form.city &&
        form.barangay
})

// Load professional data
const loadProfessional = async () => {
    try {
        const skilledId = route.params.id
        const response = await getPublicSkilledProfile(skilledId)
        professional.value = response.profile
    } catch (error) {
        console.error('Error loading professional:', error)
    }
}

// Load available time slots
const loadAvailableSlots = async () => {
    if (!form.date) return

    try {
        const response = await getAvailableSlots(route.params.id, form.date)
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

// Update city and reset barangay
const updateCity = (city) => {
    form.city = city
    form.barangay = '' // Reset barangay when city changes
}

// Submit booking
const submitBooking = async () => {
    if (!isFormValid.value) return

    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
        alert('Please log in to book a service')
        router.push('/login')
        return
    }

    loading.value = true
    try {
        // Combine date and time
        const serviceDateTime = selectedSlot.value

        const bookingData = {
            skilled_id: parseInt(route.params.id),
            service_date: serviceDateTime,
            duration: parseInt(form.duration),
            location: form.location || 'Home',
            address: form.address,
            barangay: form.barangay,
            city: form.city,
            latitude: form.latitude,
            longitude: form.longitude,
            notes: form.notes,
            total_amount: (professional.value?.hourly_rate || 500) * form.duration
        }

        console.log('Submitting booking data:', bookingData)
        const response = await createBooking(bookingData)
        newBooking.value = response.booking
        showSuccess.value = true

    } catch (error) {
        console.error('Booking error:', error)

        // Handle specific error cases
        if (error.response?.status === 401) {
            alert('Your session has expired. Please log in again.')
            localStorage.removeItem('token')
            router.push('/login')
        } else {
            alert(error.response?.data?.message || 'Failed to create booking')
        }
    } finally {
        loading.value = false
    }
}

// Close modal
const closeModal = () => {
    showSuccess.value = false
    router.push('/bookings')
}

// Get user's location (optional)
const getUserLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                form.latitude = position.coords.latitude
                form.longitude = position.coords.longitude
            },
            (error) => console.log('Location permission denied')
        )
    }
}

onMounted(() => {
    const token = localStorage.getItem('token')
    if (!token) {
        alert('Please log in to book a service')
        router.push('/login')
        return
    }

    loadProfessional()
    getUserLocation()
})
</script>

<template>
    <div class="booking-page">
        <noSearchNavbar />

        <div class="booking-container">
            <div class="booking-header">
                <h1>Book a Professional</h1>
                <p>Fill in the details below to book your service</p>
            </div>

            <div class="booking-content">
                <!-- Professional Info Card -->
                <div class="professional-card" v-if="professional">
                    <div class="professional-image">
                        <img :src="professionalImage" :alt="professional.fullName">
                    </div>
                    <div class="professional-info">
                        <h2>{{ professional.fullName }}</h2>
                        <p class="skill">Skilled</p>
                        <div class="rating">
                            <span class="stars">{{ '★'.repeat(Math.floor(professional.average_rating || 0)) }}</span>
                            <span>({{ professional.total_ratings || 0 }} reviews)</span>
                        </div>
                        <p class="experience">{{ professional.years_experience }} years experience</p>
                        <p class="rate">💰 ₱{{ professional.hourly_rate || 500 }}/hour</p>
                    </div>
                </div>

                <!-- Booking Form -->
                <form @submit.prevent="submitBooking" class="booking-form">
                    <!-- Date Selection -->
                    <div class="form-group">
                        <label>Select Date</label>
                        <input type="date" v-model="form.date" :min="minDate" @change="loadAvailableSlots"
                            class="form-input" required>
                    </div>

                    <!-- Time Slots -->
                    <div class="form-group" v-if="form.date">
                        <label>Available Time Slots</label>
                        <div class="time-slots">
                            <button v-for="slot in availableSlots" :key="slot.time" type="button"
                                @click="selectTimeSlot(slot)" :class="['time-slot', {
                                    selected: selectedSlot === slot.time,
                                    unavailable: !slot.available
                                }]" :disabled="!slot.available">
                                {{ formatTime(slot.time) }}
                                <span v-if="!slot.available" class="booked">Booked</span>
                            </button>
                            <p v-if="availableSlots.length === 0" class="no-slots">
                                No available slots for this date
                            </p>
                        </div>
                    </div>

                    <!-- Duration -->
                    <div class="form-group">
                        <label>Duration (hours)</label>
                        <select v-model="form.duration" class="form-select" required>
                            <option value="1">1 hour</option>
                            <option value="2">2 hours</option>
                            <option value="3">3 hours</option>
                            <option value="4">4 hours</option>
                            <option value="6">6 hours</option>
                            <option value="8">8 hours (full day)</option>
                        </select>
                    </div>

                    <!-- Location -->
                    <div class="form-group">
                        <label>Service Location</label>
                        <input type="text" v-model="form.location" placeholder="e.g., My Home, Office, etc."
                            class="form-input">
                    </div>

                    <!-- Address -->
                    <div class="form-group">
                        <label>Street Address</label>
                        <textarea v-model="form.address" placeholder="Enter your street address, building, etc."
                            rows="2" class="form-textarea" required></textarea>
                    </div>

                    <!-- Location Details (City/Barangay Dropdowns) -->
                    <div class="form-row">
                        <div class="form-group">
                            <label>City/Municipality <span class="required">*</span></label>
                            <select v-model="form.city" @change="updateCity(form.city)" class="form-select" required>
                                <option value="">Select City/Municipality</option>
                                <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Barangay <span class="required">*</span></label>
                            <select v-model="form.barangay" class="form-select" :disabled="!form.city" required>
                                <option value="">Select Barangay</option>
                                <option v-for="barangay in availableBarangays" :key="barangay" :value="barangay">
                                    {{ barangay }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <!-- Notes -->
                    <div class="form-group">
                        <label>Additional Notes (Optional)</label>
                        <textarea v-model="form.notes" placeholder="Any special requests or instructions?" rows="3"
                            class="form-textarea"></textarea>
                    </div>

                    <!-- Price Estimate -->
                    <div class="price-estimate" v-if="professional">
                        <div class="price-row">
                            <span>Service Rate</span>
                            <span>₱{{ professional.hourly_rate || 500 }}/hour</span>
                        </div>
                        <div class="price-row">
                            <span>Duration</span>
                            <span>{{ form.duration }} hours</span>
                        </div>
                        <div class="price-row total">
                            <span>Total Estimate</span>
                            <span>₱{{ estimatedTotal }}</span>
                        </div>
                        <p class="price-note">*Final price may vary based on actual work</p>
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" class="submit-btn" :disabled="loading || !isFormValid">
                        <span v-if="loading" class="spinner"></span>
                        {{ loading ? 'Processing...' : 'Confirm Booking' }}
                    </button>
                </form>
            </div>
        </div>

        <!-- Success Modal -->
        <div v-if="showSuccess" class="modal">
            <div class="modal-content">
                <div class="success-icon">✓</div>
                <h3>Booking Successful!</h3>
                <p>Your booking request has been sent to {{ professional?.fullName }}</p>
                <p class="booking-id">Booking ID: {{ newBooking?.booking_uuid }}</p>
                <div class="modal-actions">
                    <router-link to="/bookings" class="btn-primary">View My Bookings</router-link>
                    <button @click="closeModal" class="btn-secondary">Close</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.required {
    color: #ef4444;
    margin-left: 0.25rem;
}

select:disabled {
    background-color: #f1f5f9;
    cursor: not-allowed;
    opacity: 0.7;
}

.rate {
    color: #10b981;
    font-weight: 600;
    margin-top: 0.25rem;
}

/* Keep all your existing styles below */
.booking-page {
    min-height: 100vh;
    background: #f8fafc;
}

.booking-container {
    max-width: 800px;
    margin: 80px auto 2rem;
    padding: 0 1.5rem;
}

.booking-header {
    text-align: center;
    margin-bottom: 2rem;
}

.booking-header h1 {
    font-size: 2rem;
    color: #1e293b;
    margin-bottom: 0.5rem;
}

.booking-header p {
    color: #64748b;
}

.booking-content {
    background: white;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.professional-card {
    display: flex;
    gap: 1.5rem;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 16px;
    margin-bottom: 2rem;
}

.professional-image {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
}

.professional-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.professional-info h2 {
    color: #1e293b;
    margin-bottom: 0.25rem;
}

.skill {
    color: #4f46e5;
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.stars {
    color: #ffc107;
}

.experience {
    color: #64748b;
    font-size: 0.9rem;
}

.booking-form {
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
    font-weight: 600;
    color: #334155;
    font-size: 0.95rem;
}

.form-input,
.form-select,
.form-textarea {
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.3s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-textarea {
    resize: vertical;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
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
    position: relative;
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

.booked {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #ef4444;
    color: white;
    font-size: 0.7rem;
    padding: 0.1rem 0.3rem;
    border-radius: 4px;
}

.no-slots {
    grid-column: 1 / -1;
    text-align: center;
    color: #64748b;
    padding: 1rem;
}

.price-estimate {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 12px;
    margin-top: 1rem;
}

.price-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    color: #475569;
}

.price-row.total {
    border-top: 2px solid #e2e8f0;
    margin-top: 0.5rem;
    padding-top: 1rem;
    font-weight: 700;
    color: #1e293b;
    font-size: 1.1rem;
}

.price-note {
    color: #94a3b8;
    font-size: 0.85rem;
    margin-top: 0.5rem;
    font-style: italic;
}

.submit-btn {
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 1rem;
}

.submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, .3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
    margin-right: 8px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 2rem;
    border-radius: 20px;
    max-width: 400px;
    width: 90%;
    text-align: center;
}

.success-icon {
    width: 60px;
    height: 60px;
    background: #10b981;
    color: white;
    font-size: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
}

.modal-content h3 {
    color: #1e293b;
    margin-bottom: 0.5rem;
}

.booking-id {
    color: #64748b;
    font-size: 0.9rem;
    margin: 1rem 0;
    padding: 0.5rem;
    background: #f1f5f9;
    border-radius: 8px;
}

.modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
}

.btn-primary {
    flex: 2;
    padding: 0.75rem;
    background: #4f46e5;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s;
}

.btn-primary:hover {
    background: #4338ca;
}

.btn-secondary {
    flex: 1;
    padding: 0.75rem;
    background: #f1f5f9;
    color: #64748b;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-secondary:hover {
    background: #e2e8f0;
}

@media (max-width: 640px) {
    .professional-card {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .form-row {
        grid-template-columns: 1fr;
    }

    .time-slots {
        grid-template-columns: repeat(3, 1fr);
    }

    .modal-actions {
        flex-direction: column;
    }
}
</style>