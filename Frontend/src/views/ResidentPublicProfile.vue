<!-- frontend/src/views/ResidentPublicProfile.vue -->
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import noSearchNavbar from '@/components/noSearchNavbar.vue'
import ReportModal from '@/components/ReportModal.vue'
import { getResidentPublicProfile, getResidentRatings, getResidentStats } from '@/api/userService'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref('')
const resident = ref(null)
const ratings = ref([])
const ratingStats = ref(null)
const residentStats = ref(null)
const showReportModal = ref(false)

// Load resident profile
const loadResidentProfile = async () => {
    loading.value = true
    error.value = ''
    try {
        const residentId = route.params.id
        const response = await getResidentPublicProfile(residentId)
        resident.value = response.resident
        await loadRatings()
        await loadStats()
    } catch (err) {
        console.error('Error loading resident profile:', err)
        error.value = err.response?.data?.message || 'Failed to load profile'
    } finally {
        loading.value = false
    }
}

// Load resident ratings
const loadRatings = async () => {
    try {
        const response = await getResidentRatings(route.params.id, 1, 10)
        ratings.value = response.ratings
        ratingStats.value = response.stats
    } catch (err) {
        console.error('Error loading ratings:', err)
    }
}

// Load resident stats
const loadStats = async () => {
    try {
        const response = await getResidentStats(route.params.id)
        residentStats.value = response
    } catch (err) {
        console.error('Error loading stats:', err)
    }
}

const baseURL = import.meta.env.VITE_BASE_URL
// Get image URL
const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-avatar.png'
    let formattedPath = imagePath.replace(/\\/g, '/')
    if (!formattedPath.startsWith('/uploads/')) {
        const filename = formattedPath.split('/').pop()
        formattedPath = `/uploads/${filename}`
    }
    return `${baseURL}${formattedPath}`
}

// Format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    })
}

const formatReviewDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Get rating stars
const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating || 0)
    const halfStar = (rating || 0) % 1 >= 0.5
    let stars = ''
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) stars += '★'
        else if (i === fullStars && halfStar) stars += '½'
        else stars += '☆'
    }
    return stars
}

// Format phone number
const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not provided'
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
        return `+63 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
    }
    return phone
}

// Go back
const goBack = () => {
    router.back()
}

// Message resident
const messageResident = () => {
    const token = localStorage.getItem('token')
    if (!token) {
        alert('Please log in to send a message')
        router.push('/login')
        return
    }
    router.push(`/messages?user=${resident.value?.user_id}`)
}

// Open report modal
const openReportModal = () => {
    const token = localStorage.getItem('token')
    if (!token) {
        alert('Please log in to report')
        router.push('/login')
        return
    }
    showReportModal.value = true
}

// Handle report submitted
const handleReportSubmitted = () => {
    alert('Thank you for your report. We will review it shortly.')
}

onMounted(() => {
    loadResidentProfile()
})
</script>

<template>
    <div class="resident-public-profile">
        <noSearchNavbar />

        <div class="profile-container">
            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
                <div class="spinner"></div>
                <p>Loading resident profile...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="error-state">
                <div class="error-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 8V12M12 16H12.01M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
                <p>{{ error }}</p>
                <button @click="loadResidentProfile" class="retry-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23 4V10H17M1 20V14H7" stroke="white" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                        <path
                            d="M20.49 9C19.9828 7.56678 19.1209 6.28537 17.9845 5.27542C16.8482 4.26546 15.4745 3.55976 14 3.22408C12.5255 2.8884 10.9902 2.93454 9.5358 3.35844C8.08145 3.78235 6.74986 4.57103 5.65 5.66L1 10M23 14L18.35 18.34C17.2501 19.429 15.9186 20.2176 14.4642 20.6416C13.0098 21.0655 11.4745 21.1116 10 20.7759C8.5255 20.4402 7.1518 19.7345 6.01547 18.7246C4.87914 17.7146 4.01718 16.4332 3.51 15"
                            stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    Try Again
                </button>
                <button @click="goBack" class="back-btn-secondary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                    Go Back
                </button>
            </div>

            <!-- Profile Content -->
            <div v-else-if="resident" class="profile-content">
                <!-- Profile Header -->
                <div class="profile-header">
                    <div class="header-cover">
                        <div class="cover-gradient"></div>
                    </div>

                    <div class="header-content">
                        <div class="profile-image-wrapper">
                            <div class="profile-image">
                                <img :src="getImageUrl(resident.profile_image)" :alt="resident.firstName" />
                            </div>
                        </div>

                        <div class="profile-info">
                            <h1 class="profile-name">{{ resident.firstName }} {{ resident.lastName }}</h1>
                            <div class="profile-meta">
                                <span class="member-badge">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor"
                                            stroke-width="1.5" />
                                        <path d="M8 2V6M16 2V6M3 10H21" stroke="currentColor" stroke-width="1.5" />
                                    </svg>
                                    Member since {{ formatDate(resident.created_at) }}
                                </span>
                                <span class="resident-badge">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" stroke-width="1.5" />
                                        <path d="M3 12L12 17L21 12" stroke="currentColor" stroke-width="1.5" />
                                        <path d="M3 17L12 22L21 17" stroke="currentColor" stroke-width="1.5" />
                                    </svg>
                                    Resident
                                </span>
                                <span v-if="resident.email_verified_at" class="verified-badge">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20 6L9 17L4 12" stroke="white" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                    </svg>
                                    Verified
                                </span>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="action-buttons">
                            <button @click="messageResident" class="btn-message">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                                        stroke="white" stroke-width="1.5" />
                                    <path d="M8 9H16M8 13H13" stroke="white" stroke-width="1.5" />
                                </svg>
                                Message
                            </button>
                            <button @click="openReportModal" class="btn-report">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M12 8V12M12 16H12.01M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                        stroke="currentColor" stroke-width="1.5" />
                                </svg>
                                Report Resident
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Profile Grid -->
                <div class="profile-grid">
                    <!-- Left Column - About & Contact Info -->
                    <div class="grid-column">
                        <!-- About Section -->
                        <div class="section-card">
                            <div class="section-header">
                                <div class="header-left">
                                    <span class="section-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                                                stroke="currentColor" stroke-width="1.5" />
                                            <path
                                                d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                                                stroke="currentColor" stroke-width="1.5" />
                                        </svg>
                                    </span>
                                    <h3>About</h3>
                                </div>
                            </div>
                            <div class="section-content">
                                <p class="bio-text">{{ resident.bio || 'No bio provided yet.' }}</p>
                            </div>
                        </div>

                        <!-- Contact Information Section -->
                        <div class="section-card">
                            <div class="section-header">
                                <div class="header-left">
                                    <span class="section-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M22 16.92V19.92C22.0001 20.1985 21.944 20.4742 21.8356 20.7293C21.7271 20.9845 21.5686 21.2136 21.3701 21.4019C21.1716 21.5901 20.9377 21.7335 20.6829 21.8227C20.4282 21.9119 20.1578 21.9451 19.89 21.92C16.672 21.5856 13.5881 20.534 10.87 18.85C8.33805 17.2857 6.17423 15.2022 4.52 12.74C2.82233 10.2335 1.78005 7.36284 1.5 4.36C1.47466 4.09269 1.50768 3.82278 1.59677 3.56839C1.68586 3.31399 1.8291 3.08045 2.01725 2.88222C2.20541 2.68399 2.43446 2.52569 2.68966 2.41743C2.94486 2.30917 3.22064 2.25322 3.5 2.25322H6.5C7.024 2.25322 7.5 2.62322 7.62 3.13322L8.32 6.33322C8.425 6.81322 8.2 7.29322 7.83 7.58322L5.81 9.19322C7.293 12.0852 9.498 14.2792 12.4 15.7702L14.02 13.7502C14.31 13.3802 14.79 13.1552 15.27 13.2602L18.47 13.9602C18.98 14.0802 19.35 14.5562 19.35 15.0802V18.0802C19.35 18.4492 19.095 18.7712 18.73 18.8302L18.47 18.86Z"
                                                stroke="currentColor" stroke-width="1.5" />
                                        </svg>
                                    </span>
                                    <h3>Contact Information</h3>
                                </div>
                            </div>
                            <div class="contact-info-list">
                                <div class="contact-item">
                                    <div class="contact-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                                                stroke="currentColor" stroke-width="1.5" />
                                            <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="1.5" />
                                        </svg>
                                    </div>
                                    <div class="contact-details">
                                        <span class="contact-label">Email Address</span>
                                        <span class="contact-value">{{ resident.email }}</span>
                                    </div>
                                </div>

                                <div class="contact-item">
                                    <div class="contact-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M22 16.92V19.92C22.0001 20.1985 21.944 20.4742 21.8356 20.7293C21.7271 20.9845 21.5686 21.2136 21.3701 21.4019C21.1716 21.5901 20.9377 21.7335 20.6829 21.8227C20.4282 21.9119 20.1578 21.9451 19.89 21.92C16.672 21.5856 13.5881 20.534 10.87 18.85C8.33805 17.2857 6.17423 15.2022 4.52 12.74C2.82233 10.2335 1.78005 7.36284 1.5 4.36C1.47466 4.09269 1.50768 3.82278 1.59677 3.56839C1.68586 3.31399 1.8291 3.08045 2.01725 2.88222C2.20541 2.68399 2.43446 2.52569 2.68966 2.41743C2.94486 2.30917 3.22064 2.25322 3.5 2.25322H6.5C7.024 2.25322 7.5 2.62322 7.62 3.13322L8.32 6.33322C8.425 6.81322 8.2 7.29322 7.83 7.58322L5.81 9.19322C7.293 12.0852 9.498 14.2792 12.4 15.7702L14.02 13.7502C14.31 13.3802 14.79 13.1552 15.27 13.2602L18.47 13.9602C18.98 14.0802 19.35 14.5562 19.35 15.0802V18.0802C19.35 18.4492 19.095 18.7712 18.73 18.8302L18.47 18.86Z"
                                                stroke="currentColor" stroke-width="1.5" />
                                        </svg>
                                    </div>
                                    <div class="contact-details">
                                        <span class="contact-label">Phone Number</span>
                                        <span class="contact-value">{{ formatPhoneNumber(resident.phone) }}</span>
                                    </div>
                                </div>

                                <div class="contact-item">
                                    <div class="contact-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M12 2C7.58 2 4 5.58 4 10C4 16.5 12 22 12 22C12 22 20 16.5 20 10C20 5.58 16.42 2 12 2Z"
                                                stroke="currentColor" stroke-width="1.5" />
                                            <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.5" />
                                        </svg>
                                    </div>
                                    <div class="contact-details">
                                        <span class="contact-label">Location</span>
                                        <span class="contact-value">
                                            {{ resident.city || 'City not specified' }}, {{ resident.barangay ||
                                                'Barangay not specified' }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Stats Section -->
                        <div class="section-card">
                            <div class="section-header">
                                <div class="header-left">
                                    <span class="section-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path d="M3 9L12 3L21 9L12 15L3 9Z" stroke="currentColor"
                                                stroke-width="1.5" />
                                            <path d="M5 12V18H19V12" stroke="currentColor" stroke-width="1.5" />
                                            <path d="M12 15V18" stroke="currentColor" stroke-width="1.5" />
                                        </svg>
                                    </span>
                                    <h3>Activity</h3>
                                </div>
                            </div>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <span class="stat-value">{{ residentStats?.total_bookings || 0 }}</span>
                                    <span class="stat-label">Total Bookings</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">{{ residentStats?.completed_bookings || 0 }}</span>
                                    <span class="stat-label">Completed</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column - Reviews Section -->
                    <div class="grid-column">
                        <div class="section-card reviews-card">
                            <div class="section-header">
                                <div class="header-left">
                                    <span class="section-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2Z"
                                                stroke="currentColor" stroke-width="1.5" />
                                        </svg>
                                    </span>
                                    <h3>Reviews from Professionals</h3>
                                </div>
                                <span class="review-count">{{ ratingStats?.total_ratings || 0 }} reviews</span>
                            </div>

                            <!-- Rating Summary -->
                            <div v-if="ratingStats && ratingStats.total_ratings > 0" class="rating-summary">
                                <div class="average-rating">
                                    <span class="average-number">{{ ratingStats.average_rating || 0 }}</span>
                                    <div class="average-stars">
                                        <span class="stars">{{ getRatingStars(ratingStats.average_rating) }}</span>
                                        <span class="total-reviews">({{ ratingStats.total_ratings }} reviews)</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Reviews List -->
                            <div class="reviews-container">
                                <div v-if="ratings.length" class="reviews-list">
                                    <div v-for="review in ratings" :key="review.rating_id" class="review-item">
                                        <div class="review-header">
                                            <div class="reviewer-info">
                                                <img :src="getImageUrl(review.skilled_image)" :alt="review.skilled_name"
                                                    class="reviewer-avatar">
                                                <div>
                                                    <h4 class="reviewer-name">{{ review.skilled_name }}</h4>
                                                    <div class="reviewer-stars">
                                                        <span class="stars">{{ getRatingStars(review.rating) }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span class="review-date">{{ formatReviewDate(review.created_at) }}</span>
                                        </div>
                                        <p class="review-text">{{ review.review || 'No written review.' }}</p>
                                    </div>
                                </div>

                                <!-- Empty Reviews -->
                                <div v-else class="empty-reviews">
                                    <div class="empty-icon">
                                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2Z"
                                                stroke="currentColor" stroke-width="1.5" />
                                        </svg>
                                    </div>
                                    <h3 class="empty-title">No reviews yet</h3>
                                    <p class="empty-description">This resident hasn't received any reviews yet.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Report Modal -->
        <ReportModal v-if="showReportModal" reportType="User" :reportedUserId="resident?.user_id"
            :targetName="`${resident?.firstName} ${resident?.lastName}`" @close="showReportModal = false"
            @submitted="handleReportSubmitted" />
    </div>
</template>

<style scoped>
/* Keep all existing styles - they remain unchanged */
.resident-public-profile {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.profile-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
}

/* Loading State */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 1.5rem;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #e0e7ff;
    border-top: 4px solid #4f46e5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Error State */
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 1rem;
    text-align: center;
}

.error-icon {
    margin-bottom: 1rem;
}

.error-icon svg {
    stroke: #ef4444;
}

.retry-btn,
.back-btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.back-btn-secondary {
    background: #f1f5f9;
    color: #64748b;
}

.retry-btn svg,
.back-btn-secondary svg {
    stroke: currentColor;
}

.retry-btn:hover {
    background: #4338ca;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
}

.back-btn-secondary:hover {
    background: #e2e8f0;
    transform: translateY(-2px);
}

/* Profile Header */
.profile-header {
    background: white;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
    margin-bottom: 2rem;
}

.header-cover {
    height: 100px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    position: relative;
}

.cover-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
}

.header-content {
    padding: 0 2rem 2rem;
    position: relative;
}

.profile-image-wrapper {
    display: flex;
    justify-content: center;
    margin-top: -50px;
    margin-bottom: 1rem;
}

.profile-image {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 4px solid white;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.profile-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.profile-info {
    text-align: center;
    margin-bottom: 1.5rem;
}

.profile-name {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
}

.profile-meta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.member-badge,
.resident-badge,
.verified-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 1rem;
    background: #f1f5f9;
    border-radius: 30px;
    font-size: 0.85rem;
    color: #475569;
}

.member-badge svg,
.resident-badge svg {
    stroke: currentColor;
}

.verified-badge {
    background: #d1fae5;
    color: #065f46;
}

.verified-badge svg {
    stroke: white;
}

/* Action Buttons */
.action-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 1.5rem;
}

.btn-message,
.btn-report {
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

.btn-message {
    background: #4f46e5;
    color: white;
}

.btn-message svg {
    stroke: white;
}

.btn-message:hover {
    background: #4338ca;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
}

.btn-report {
    background: #fee2e2;
    color: #ef4444;
    border: 2px solid #fecaca;
}

.btn-report svg {
    stroke: #ef4444;
}

.btn-report:hover {
    background: #fecaca;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(239, 68, 68, 0.2);
}

/* Profile Grid */
.profile-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.grid-column {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

/* Section Cards */
.section-card {
    background: white;
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    border: 1px solid #f1f5f9;
}

.section-card:hover {
    box-shadow: 0 20px 40px rgba(79, 70, 229, 0.1);
    border-color: #e0e7ff;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #f1f5f9;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.section-icon {
    display: flex;
    align-items: center;
    justify-content: center;
}

.section-icon svg {
    width: 24px;
    height: 24px;
    stroke: #4f46e5;
}

.section-header h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
}

.review-count {
    font-size: 0.85rem;
    color: #64748b;
    background: #f1f5f9;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
}

.bio-text {
    color: #475569;
    line-height: 1.7;
    font-size: 1rem;
}

/* Contact Information Styles */
.contact-info-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: #f8fafc;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.contact-item:hover {
    background: #f1f5f9;
    transform: translateX(5px);
}

.contact-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: #e0e7ff;
    border-radius: 12px;
    color: #4f46e5;
}

.contact-icon svg {
    stroke: #4f46e5;
}

.contact-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.contact-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.contact-value {
    font-size: 0.95rem;
    font-weight: 500;
    color: #1e293b;
    word-break: break-all;
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    text-align: center;
}

.stat-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #4f46e5;
}

.stat-label {
    font-size: 0.85rem;
    color: #64748b;
}

/* Rating Summary */
.rating-summary {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 12px;
}

.average-rating {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
}

.average-number {
    font-size: 2rem;
    font-weight: 800;
    color: #1e293b;
}

.average-stars {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.stars {
    color: #fbbf24;
    font-size: 1rem;
    letter-spacing: 1px;
}

.total-reviews {
    font-size: 0.8rem;
    color: #94a3b8;
}

/* Reviews List */
.reviews-container {
    margin-top: 0.5rem;
}

.reviews-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.review-item {
    padding: 1rem;
    background: #f8fafc;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.review-item:hover {
    background: white;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
}

.review-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
}

.reviewer-info {
    display: flex;
    gap: 0.75rem;
    align-items: center;
}

.reviewer-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.reviewer-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.25rem;
}

.reviewer-stars .stars {
    font-size: 0.85rem;
}

.review-date {
    font-size: 0.75rem;
    color: #94a3b8;
}

.review-text {
    color: #475569;
    font-size: 0.9rem;
    line-height: 1.6;
    margin: 0;
}

/* Empty Reviews */
.empty-reviews {
    text-align: center;
    padding: 2rem 1rem;
}

.empty-icon {
    margin-bottom: 1rem;
}

.empty-icon svg {
    stroke: #94a3b8;
    opacity: 0.5;
}

.empty-title {
    font-size: 1rem;
    color: #1e293b;
    margin-bottom: 0.25rem;
}

.empty-description {
    font-size: 0.85rem;
    color: #64748b;
}

/* Responsive */
@media (max-width: 768px) {
    .profile-container {
        padding: 1rem;
    }

    .profile-grid {
        grid-template-columns: 1fr;
    }

    .profile-name {
        font-size: 1.5rem;
    }

    .profile-meta {
        flex-direction: column;
    }

    .action-buttons {
        flex-direction: column;
    }

    .action-buttons button {
        width: 100%;
    }

    .stats-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .stat-item {
        padding: 0.5rem;
    }

    .review-header {
        flex-direction: column;
        gap: 0.5rem;
    }

    .contact-item {
        flex-direction: column;
        text-align: center;
        padding: 1rem;
    }

    .contact-icon {
        margin: 0 auto;
    }

    .contact-details {
        text-align: center;
    }
}
</style>