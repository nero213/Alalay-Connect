    <script setup>
    import { ref, onMounted, watch } from 'vue'
    import { useRouter } from 'vue-router'
    import noSearchNavbar from '@/components/noSearchNavbar.vue'
    import { getClientBookings, cancelBooking } from '@/api/bookingService'

    const router = useRouter()
    const loading = ref(true)
    const bookings = ref([])
    const pagination = ref({
        page: 1,
        pages: 1,
        total: 0
    })
    const statusFilter = ref('')
    const cancellingId = ref(null) // Track which booking is being cancelled

    // Load bookings
    const loadBookings = async () => {
        loading.value = true
        try {
            const response = await getClientBookings(
                statusFilter.value || null,
                pagination.value.page
            )
            bookings.value = response.bookings
            pagination.value = response.pagination
        } catch (error) {
            console.error('Error loading bookings:', error)
        } finally {
            loading.value = false
        }
    }

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    }

    // Format date and time
    const formatDateTime = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    // View booking details
    const viewBooking = (bookingId) => {
        router.push(`/bookings/${bookingId}`)
    }

    // Cancel booking with real-time update
    const handleCancelBooking = async (bookingId) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return

        cancellingId.value = bookingId // Set cancelling state

        try {
            await cancelBooking(bookingId)

            // Update the local booking status immediately
            const index = bookings.value.findIndex(b => b.booking_id === bookingId)
            if (index !== -1) {
                bookings.value[index].status = 'cancelled'
            }

            // Show success message (optional)
            alert('Booking cancelled successfully')

        } catch (error) {
            alert(error.response?.data?.message || 'Failed to cancel booking')
        } finally {
            cancellingId.value = null // Clear cancelling state
        }
    }

    // Reschedule booking
    const rescheduleBooking = (bookingId) => {
        router.push(`/booking/reschedule/${bookingId}`)
    }

    // Leave review
    const leaveReview = (booking) => {
        router.push({
            path: `/review/${booking.skilled_id}`,
            query: { booking_id: booking.booking_id }
        })
    }

    // Change page
    const changePage = (newPage) => {
        pagination.value.page = newPage
        loadBookings()
    }

    // Watch status filter
    watch(statusFilter, () => {
        pagination.value.page = 1
        loadBookings()
    })

    onMounted(() => {
        loadBookings()
    })
</script>

    <template>
        <div class="bookings-page">
            <noSearchNavbar />

            <div class="bookings-container">
                <div class="bookings-header">
                    <h1>My Bookings</h1>
                    <div class="header-actions">
                        <select v-model="statusFilter" class="filter-select">
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading your bookings...</p>
                </div>

                <!-- Bookings List -->
                <div v-else-if="bookings.length" class="bookings-list">
                    <div v-for="booking in bookings" :key="booking.booking_id" class="booking-card">
                        <div class="booking-header">
                            <div class="booking-info">
                                <span class="booking-id">#{{ booking.booking_uuid?.substring(0, 8) }}</span>
                                <span class="booking-date">{{ formatDate(booking.service_date) }}</span>
                            </div>
                            <span :class="['status-badge', booking.status]">
                                {{ booking.status }}
                            </span>
                        </div>

                        <div class="booking-body">
                            <div class="professional-info">
                                <img :src="booking.skilled_image ? `http://localhost:3000${booking.skilled_image}` : '/default-avatar.png'"
                                    :alt="booking.skilled_firstName" class="professional-avatar">
                                <div>
                                    <h3>{{ booking.skilled_firstName }} {{ booking.skilled_lastName }}</h3>
                                    <p class="skills">{{ booking.skills || 'Professional' }}</p>
                                </div>
                            </div>

                            <div class="booking-details">
                                <div class="detail-item">
                                    <span class="detail-label">Date & Time</span>
                                    <span class="detail-value">{{ formatDateTime(booking.service_date) }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Duration</span>
                                    <span class="detail-value">{{ booking.duration }} hours</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Location</span>
                                    <span class="detail-value">{{ booking.address || 'Not specified' }}, {{
                                        booking.barangay
                                        || '' }} {{ booking.city || '' }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Total Amount</span>
                                    <span class="detail-value amount">₱{{ booking.total_amount?.toLocaleString() ||
                                        'TBD'
                                    }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="booking-actions">
                            <button @click="viewBooking(booking.booking_id)" class="btn-view">
                                View Details
                            </button>
                            <button v-if="booking.status === 'pending' || booking.status === 'confirmed'"
                                @click="handleCancelBooking(booking.booking_id)" class="btn-cancel"
                                :disabled="cancellingId === booking.booking_id">
                                <span v-if="cancellingId === booking.booking_id" class="spinner-small"></span>
                                {{ cancellingId === booking.booking_id ? 'Cancelling...' : 'Cancel' }}
                            </button>

                            <button v-if="booking.status === 'completed'" @click="leaveReview(booking)"
                                class="btn-review">
                                Leave Review
                            </button>
                        </div>
                    </div>

                    <!-- Pagination -->
                    <div class="pagination" v-if="pagination.pages > 1">
                        <button @click="changePage(pagination.page - 1)" :disabled="pagination.page === 1"
                            class="page-btn">
                            ← Prev
                        </button>
                        <span class="page-info">
                            Page {{ pagination.page }} of {{ pagination.pages }}
                        </span>
                        <button @click="changePage(pagination.page + 1)"
                            :disabled="pagination.page === pagination.pages" class="page-btn">
                            Next →
                        </button>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-else class="empty-state">
                    <div class="empty-icon">📅</div>
                    <h3>No Bookings Yet</h3>
                    <p>Browse professionals and book your first service</p>
                    <router-link to="/dashboard" class="browse-btn">
                        Browse Professionals
                    </router-link>
                </div>
            </div>
        </div>
    </template>


<style scoped>
.bookings-page {
    min-height: 100vh;
    background: #f8fafc;
}

.bookings-container {
    max-width: 1000px;
    margin: 80px auto 2rem;
    padding: 0 1.5rem;
}

.bookings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.bookings-header h1 {
    font-size: 2rem;
    color: #1e293b;
}

.filter-select {
    padding: 0.5rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.95rem;
    color: #1e293b;
    outline: none;
    transition: all 0.3s;
}

.filter-select:focus {
    border-color: #4f46e5;
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

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Booking Card */
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
    padding: 1rem 1.5rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
}

.booking-info {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.booking-id {
    font-family: monospace;
    font-weight: 600;
    color: #4f46e5;
}

.booking-date {
    color: #64748b;
    font-size: 0.9rem;
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

.booking-body {
    padding: 1.5rem;
}

.professional-info {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.professional-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
}

.professional-info h3 {
    color: #1e293b;
    margin-bottom: 0.25rem;
}

.skills {
    color: #64748b;
    font-size: 0.9rem;
}

.booking-details {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.detail-label {
    font-size: 0.85rem;
    color: #64748b;
}

.detail-value {
    font-weight: 500;
    color: #1e293b;
}

.detail-value.amount {
    color: #10b981;
    font-weight: 600;
}

.booking-actions {
    display: flex;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
}

.btn-view,
.btn-cancel,
.btn-reschedule,
.btn-review {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
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

/* Pagination */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
}

.page-btn {
    padding: 0.5rem 1rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 6px;
    color: #4f46e5;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
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
    color: #64748b;
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

/* Responsive */
@media (max-width: 768px) {
    .bookings-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }

    .booking-details {
        grid-template-columns: 1fr;
    }

    .booking-actions {
        flex-wrap: wrap;
    }

    .booking-actions button {
        flex: 1;
    }
}
</style>