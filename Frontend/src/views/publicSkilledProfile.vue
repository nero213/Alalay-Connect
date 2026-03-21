<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import noSearchNavbar from '@/components/noSearchNavbar.vue'
import RatingModal from '@/components/ratingModal.vue'
import ReportModal from '@/components/ReportModal.vue'
import { getPublicSkilledProfile } from '@/api/skilledProfiles'
import { getSkilledRatings, checkUserRating } from '@/api/ratingService'
import { addToFavorites, removeFromFavorites, checkFavorite } from '@/api/favoritesService'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref('')
const professional = ref(null)
const ratings = ref([])
const ratingStats = ref(null)
const showAllReviews = ref(false)
const isFavorite = ref(false)
const favoriteLoading = ref(false)
const showRatingModal = ref(false)
const showReportModal = ref(false)
const userRating = ref(null)
const currentPage = ref(1)
const hasMoreRatings = ref(false)

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-avatar.png'

    if (imagePath.startsWith('http')) {
        return imagePath
    }

    let formattedPath = imagePath.replace(/\\/g, '/')

    if (!formattedPath.startsWith('/uploads/')) {
        const filename = formattedPath.split('/').pop()
        formattedPath = `/uploads/${filename}`
    }

    return `http://localhost:3000${formattedPath}`
}

// Load profile data
const loadProfile = async () => {
    loading.value = true
    error.value = ''
    try {
        const skilledId = route.params.id
        const response = await getPublicSkilledProfile(skilledId)
        professional.value = response.profile

        await loadRatings()
        await checkFavoriteStatus()
        await checkUserRatingStatus()
    } catch (err) {
        console.error('Error loading profile:', err)
        error.value = err.response?.data?.message || 'Failed to load profile'
    } finally {
        loading.value = false
    }
}

// Load ratings
const loadRatings = async (page = 1) => {
    try {
        const response = await getSkilledRatings(route.params.id, page, 5)
        if (page === 1) {
            ratings.value = response.ratings
        } else {
            ratings.value = [...ratings.value, ...response.ratings]
        }
        ratingStats.value = response.stats
        hasMoreRatings.value = response.pagination.hasMore
        currentPage.value = page
    } catch (error) {
        console.error('Error loading ratings:', error)
    }
}

// Load more ratings
const loadMoreRatings = () => {
    loadRatings(currentPage.value + 1)
}

// Check if professional is in favorites
const checkFavoriteStatus = async () => {
    const token = localStorage.getItem('token')
    if (!token || !professional.value) return

    try {
        const response = await checkFavorite(professional.value.skilled_id)
        isFavorite.value = response.isFavorite
    } catch (error) {
        console.error('Error checking favorite status:', error)
    }
}

// Check if user has already rated
const checkUserRatingStatus = async () => {
    const token = localStorage.getItem('token')
    if (!token || !professional.value) return

    try {
        const response = await checkUserRating(professional.value.skilled_id)
        userRating.value = response.rating
    } catch (error) {
        console.error('Error checking user rating:', error)
    }
}

// Toggle favorite
const toggleFavorite = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
        alert('Please log in to save favorites')
        router.push('/login')
        return
    }

    favoriteLoading.value = true
    try {
        if (isFavorite.value) {
            await removeFromFavorites(professional.value.skilled_id)
            isFavorite.value = false
            alert('Removed from favorites')
        } else {
            await addToFavorites(professional.value.skilled_id)
            isFavorite.value = true
            alert('Added to favorites!')
        }
    } catch (error) {
        console.error('Error toggling favorite:', error)
        alert(error.response?.data?.message || 'Failed to update favorites')
    } finally {
        favoriteLoading.value = false
    }
}

// Open rating modal
const openRatingModal = () => {
    const token = localStorage.getItem('token')
    if (!token) {
        alert('Please log in to leave a review')
        router.push('/login')
        return
    }
    showRatingModal.value = true
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

// Handle rating submitted
const handleRatingSubmitted = () => {
    loadRatings(1)
    checkUserRatingStatus()
}

// Computed properties
const professionalImage = computed(() => {
    return getImageUrl(professional.value?.profile_image)
})

const displayedReviews = computed(() => {
    return ratings.value || []
})

// Helper functions
const formatDistance = (distance) => {
    if (!distance) return 'Distance unknown'
    if (distance < 1) return `${Math.round(distance * 1000)}m away`
    return `${distance.toFixed(1)}km away`
}

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

// Action functions
const bookNow = () => {
    router.push(`/booking/${professional.value?.skilled_id}`)
}

const messageNow = () => {
    const token = localStorage.getItem('token')
    if (!token) {
        alert('Please log in to send a message')
        router.push('/login')
        return
    }
    router.push(`/messages?skilled=${professional.value?.user_id}`)
}

const shareProfile = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    alert('Profile link copied to clipboard!')
}

const goBack = () => {
    router.back()
}

onMounted(() => {
    loadProfile()
})
</script>

<template>
    <div class="public-profile">
        <noSearchNavbar />

        <div class="profile-wrapper">
            <!-- Loading State -->
            <div v-if="loading" class="loading-container">
                <div class="loading-spinner"></div>
                <p class="loading-text">Loading professional profile...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="error-container">
                <div class="error-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 8V12M12 16H12.01M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
                <h3 class="error-title">{{ error }}</h3>
                <button @click="goBack" class="back-button">
                    <span class="back-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </span>
                    Go Back
                </button>
            </div>

            <!-- Profile Content -->
            <div v-else-if="professional" class="profile-content">
                <!-- Profile Header -->
                <div class="profile-header">
                    <div class="header-cover">
                        <div class="cover-overlay"></div>
                    </div>

                    <div class="header-main">
                        <div class="profile-avatar-wrapper">
                            <img :src="professionalImage" :alt="professional.fullName" class="profile-avatar">
                            <div v-if="professional.verification_status === 'approved'" class="verified-chip">
                                <span class="verified-icon">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20 6L9 17L4 12" stroke="white" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                    </svg>
                                </span>
                                <span>Verified</span>
                            </div>
                        </div>

                        <div class="profile-title-section">
                            <h1 class="profile-name">{{ professional.fullName }}</h1>
                            <p class="profile-skill"> Skilled</p>

                            <div class="profile-badges">
                                <div class="badge-item">
                                    <span class="badge-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M12 2C7.58 2 4 5.58 4 10C4 16.5 12 22 12 22C12 22 20 16.5 20 10C20 5.58 16.42 2 12 2Z"
                                                stroke="currentColor" stroke-width="1.5" />
                                            <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.5" />
                                        </svg>
                                    </span>
                                    <span>{{ professional.barangay || 'Location' }}, {{ professional.city || 'City'
                                    }}</span>
                                </div>
                                <div class="badge-item">
                                    <span class="badge-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2Z"
                                                fill="currentColor" stroke="currentColor" stroke-width="1.5" />
                                        </svg>
                                    </span>
                                    <span>
                                        {{ ratingStats?.average_rating || '0' }}
                                        <span class="badge-sub">({{ ratingStats?.total_ratings || 0 }} reviews)</span>
                                    </span>
                                </div>
                                <div class="badge-item">
                                    <span class="badge-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M12 8V12L15 15M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                                stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                                stroke-linejoin="round" />
                                        </svg>
                                    </span>
                                    <span>{{ professional.years_experience || 0 }} years exp.</span>
                                </div>
                                <div v-if="professional.distance" class="badge-item">
                                    <span class="badge-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M12 22C12 22 20 15 20 10C20 5 16 2 12 2C8 2 4 5 4 10C4 15 12 22 12 22Z"
                                                stroke="currentColor" stroke-width="1.5" />
                                            <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.5" />
                                        </svg>
                                    </span>
                                    <span>{{ formatDistance(professional.distance) }}</span>
                                </div>
                                <div v-if="professional.hourly_rate" class="badge-item rate-badge">
                                    <span class="badge-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M12 2V4M12 20V22M4 12H2M6.5 6.5L5 5M17.5 17.5L19 19M22 12H20M18 6L19 5M5 19L6.5 17.5M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8Z"
                                                stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                                stroke-linejoin="round" />
                                        </svg>
                                    </span>
                                    <span>₱{{ professional.hourly_rate }}/hour</span>
                                </div>
                            </div>
                        </div>

                        <div class="profile-actions">
                            <button @click="bookNow" class="action-button primary">
                                <span class="action-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <rect x="3" y="4" width="18" height="16" rx="2" stroke="white"
                                            stroke-width="1.5" />
                                        <path d="M8 2V6M16 2V6M3 10H21" stroke="white" stroke-width="1.5"
                                            stroke-linecap="round" />
                                    </svg>
                                </span>
                                Book Now
                            </button>

                            <button @click="messageNow" class="action-button secondary">
                                <span class="action-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path d="M8 9H16M8 13H13" stroke="currentColor" stroke-width="1.5"
                                            stroke-linecap="round" />
                                    </svg>
                                </span>
                                Message
                            </button>

                            <button @click="toggleFavorite" class="action-icon-button"
                                :class="{ 'favorite-active': isFavorite }" :disabled="favoriteLoading"
                                :title="isFavorite ? 'Remove from favorites' : 'Save to favorites'">
                                <span v-if="favoriteLoading" class="spinner-small"></span>
                                <span v-else class="favorite-icon">
                                    <svg v-if="isFavorite" width="22" height="22" viewBox="0 0 24 24"
                                        fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M12 21L10.55 19.7C5.4 15.1 2 12.1 2 8.5C2 5.4 4.4 3 7.5 3C9.3 3 11 3.9 12 5.3C13 3.9 14.7 3 16.5 3C19.6 3 22 5.4 22 8.5C22 12.1 18.6 15.1 13.45 19.7L12 21Z" />
                                    </svg>
                                    <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M12 21L10.55 19.7C5.4 15.1 2 12.1 2 8.5C2 5.4 4.4 3 7.5 3C9.3 3 11 3.9 12 5.3C13 3.9 14.7 3 16.5 3C19.6 3 22 5.4 22 8.5C22 12.1 18.6 15.1 13.45 19.7L12 21Z"
                                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                    </svg>
                                </span>
                            </button>

                            <button @click="shareProfile" class="action-icon-button" title="Share profile">
                                <span class="share-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.125 15.0117 5.2465 15.0339 5.364L8.084 9.264C7.428 8.485 6.58 8 5.5 8C3.84315 8 2.5 9.34315 2.5 11C2.5 12.6569 3.84315 14 5.5 14C6.58 14 7.428 13.515 8.084 12.736L15.034 16.636C15.0117 16.7535 15 16.875 15 17C15 18.6569 16.3431 20 18 20C19.6569 20 21 18.6569 21 17C21 15.3431 19.6569 14 18 14C16.92 14 16.072 14.485 15.416 15.264L8.466 11.364C8.4883 11.2465 8.5 11.125 8.5 11C8.5 10.875 8.4883 10.7535 8.466 10.636L15.416 6.736C16.072 7.515 16.92 8 18 8Z"
                                            fill="currentColor" />
                                    </svg>
                                </span>
                            </button>

                            <button @click="openReportModal" class="action-icon-button report-btn" title="Report">
                                <span class="report-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M12 8V12M12 16H12.01M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                                    </svg>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Main Grid Layout -->
                <div class="profile-grid">
                    <!-- Left Column - Main Content -->
                    <div class="grid-main">
                        <!-- About Section -->
                        <section class="content-card">
                            <div class="card-header">
                                <h2 class="card-title">About Me</h2>
                                <span class="card-badge">Skilled</span>
                            </div>
                            <p class="bio-text">{{ professional.bio || 'No bio provided yet.' }}</p>

                            <div class="info-stats">
                                <div class="stat-block">
                                    <span class="stat-label">Member since</span>
                                    <span class="stat-value">{{ formatDate(professional.member_since) }}</span>
                                </div>
                                <div class="stat-block">
                                    <span class="stat-label">Response time</span>
                                    <span class="stat-value">Within 1 hour</span>
                                </div>
                                <div class="stat-block">
                                    <span class="stat-label">Languages</span>
                                    <span class="stat-value">English, Filipino</span>
                                </div>
                            </div>
                        </section>

                        <!-- Skills Section -->
                        <section class="content-card">
                            <div class="card-header">
                                <h2 class="card-title">Skills & Expertise</h2>
                                <span class="skill-count">{{ professional.skills?.length || 0 }} skills</span>
                            </div>
                            <div class="skills-container">
                                <div v-for="skill in professional.skills" :key="skill.skill_id" class="skill-chip">
                                    {{ skill.name }}
                                </div>
                                <p v-if="!professional.skills?.length" class="empty-text">
                                    No skills listed yet
                                </p>
                            </div>
                        </section>

                        <!-- Reviews Section -->
                        <section class="content-card reviews-card">
                            <div class="card-header">
                                <h2 class="card-title">Client Reviews</h2>
                                <button @click="openRatingModal" class="review-button">
                                    <span class="review-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2"
                                                stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    </span>
                                    Write a Review
                                </button>
                            </div>

                            <!-- Rating Summary -->
                            <div v-if="ratingStats && ratingStats.total_ratings > 0" class="rating-overview">
                                <div class="rating-summary">
                                    <div class="average-box">
                                        <span class="average-number">{{ ratingStats.average_rating }}</span>
                                        <div class="average-stars">
                                            <span class="stars-display">{{ getRatingStars(ratingStats.average_rating)
                                            }}</span>
                                            <span class="total-reviews">{{ ratingStats.total_ratings }} total</span>
                                        </div>
                                    </div>

                                    <!-- Rating Distribution -->
                                    <div class="distribution-box">
                                        <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="distribution-row">
                                            <span class="star-label">{{ star }} ★</span>
                                            <div class="progress-track">
                                                <div class="progress-bar">
                                                    <div class="progress-fill"
                                                        :style="{ width: ratingStats.distribution[star]?.percentage + '%' }">
                                                    </div>
                                                </div>
                                            </div>
                                            <span class="distribution-value">{{ ratingStats.distribution[star]?.count
                                            }}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- User's Existing Rating Notice -->
                                <div v-if="userRating" class="user-rating-banner">
                                    <span>You rated this professional {{ userRating.rating }} stars</span>
                                    <button @click="openRatingModal" class="update-link">
                                        Update Review
                                    </button>
                                </div>
                            </div>

                            <!-- Reviews List -->
                            <div class="reviews-container">
                                <transition-group name="review-list" tag="div" class="reviews-list">
                                    <div v-for="review in displayedReviews" :key="review.rating_id" class="review-item">
                                        <div class="review-header">
                                            <div class="reviewer-info">
                                                <img :src="getImageUrl(review.client_image)" :alt="review.firstName"
                                                    class="reviewer-avatar">
                                                <div>
                                                    <h4 class="reviewer-name">{{ review.firstName }} {{ review.lastName
                                                    }}</h4>
                                                    <div class="reviewer-stars">
                                                        <span class="stars">{{ getRatingStars(review.rating) }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span class="review-date">{{ formatReviewDate(review.created_at) }}</span>
                                        </div>
                                        <p v-if="review.review" class="review-text">{{ review.review }}</p>
                                        <p v-else class="review-text no-text">No written review.</p>
                                    </div>
                                </transition-group>

                                <!-- Load More Button -->
                                <button v-if="hasMoreRatings" @click="loadMoreRatings" class="load-more-button">
                                    Load More Reviews
                                </button>

                                <!-- Empty State -->
                                <div v-if="!ratings.length" class="empty-reviews">
                                    <div class="empty-icon">
                                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2Z"
                                                stroke="currentColor" stroke-width="1.5" fill="none" />
                                        </svg>
                                    </div>
                                    <h3 class="empty-title">No reviews yet</h3>
                                    <p class="empty-description">Be the first to review this professional</p>
                                    <button @click="openRatingModal" class="empty-action">
                                        Write a Review
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    <!-- Right Column - Sidebar -->
                    <div class="grid-sidebar">
                        <!-- Contact Card -->
                        <div class="sidebar-card">
                            <h3 class="sidebar-title">Contact Information</h3>
                            <div class="contact-list">
                                <div class="contact-item">
                                    <span class="contact-emoji">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M22 16.92V19.92C22.0001 20.1985 21.944 20.4742 21.8356 20.7293C21.7271 20.9845 21.5686 21.2136 21.3701 21.4019C21.1716 21.5901 20.9377 21.7335 20.6829 21.8227C20.4282 21.9119 20.1578 21.9451 19.89 21.92C16.672 21.5856 13.5881 20.534 10.87 18.85C8.33805 17.2857 6.17423 15.2022 4.52 12.74C2.82233 10.2335 1.78005 7.36284 1.5 4.36C1.47466 4.09269 1.50768 3.82278 1.59677 3.56839C1.68586 3.31399 1.8291 3.08045 2.01725 2.88222C2.20541 2.68399 2.43446 2.52569 2.68966 2.41743C2.94486 2.30917 3.22064 2.25322 3.5 2.25322H6.5C7.024 2.25322 7.5 2.62322 7.62 3.13322L8.32 6.33322C8.425 6.81322 8.2 7.29322 7.83 7.58322L5.81 9.19322C7.293 12.0852 9.498 14.2792 12.4 15.7702L14.02 13.7502C14.31 13.3802 14.79 13.1552 15.27 13.2602L18.47 13.9602C18.98 14.0802 19.35 14.5562 19.35 15.0802V18.0802C19.35 18.4492 19.095 18.7712 18.73 18.8302L18.47 18.86Z"
                                                stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                                stroke-linejoin="round" />
                                        </svg>
                                    </span>
                                    <span class="contact-text">{{ professional.phone || 'Not provided' }}</span>
                                </div>
                                <div class="contact-item">
                                    <span class="contact-emoji">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                                                stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                                stroke-linejoin="round" />
                                            <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="1.5"
                                                stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    </span>
                                    <span class="contact-text">{{ professional.email }}</span>
                                </div>
                                <div class="contact-item">
                                    <span class="contact-emoji">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M12 2C7.58 2 4 5.58 4 10C4 16.5 12 22 12 22C12 22 20 16.5 20 10C20 5.58 16.42 2 12 2Z"
                                                stroke="currentColor" stroke-width="1.5" />
                                            <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.5" />
                                        </svg>
                                    </span>
                                    <span class="contact-text">{{ professional.barangay || 'Location' }}, {{
                                        professional.city || 'City' }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Availability Card -->
                        <div class="sidebar-card">
                            <h3 class="sidebar-title">Availability</h3>
                            <div class="availability-badge">
                                <span class="status-dot online"></span>
                                <span class="status-text">Available for booking</span>
                            </div>
                            <div class="schedule-list">
                                <div class="schedule-item">
                                    <span>Monday - Friday</span>
                                    <span class="schedule-time">8:00 AM - 6:00 PM</span>
                                </div>
                                <div class="schedule-item">
                                    <span>Saturday</span>
                                    <span class="schedule-time">9:00 AM - 3:00 PM</span>
                                </div>
                                <div class="schedule-item">
                                    <span>Sunday</span>
                                    <span class="schedule-time closed">Closed</span>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Book Card -->
                        <div class="sidebar-card booking-card">
                            <h3 class="sidebar-title">Quick Book</h3>
                            <div class="rate-display">
                                <span class="rate-label">Hourly Rate</span>
                                <span class="rate-value">₱{{ professional.hourly_rate || 500 }}</span>
                            </div>

                            <p v-if="!professional.hourly_rate" class="rate-note">
                                *Rate not set, please contact for pricing
                            </p>

                            <div class="estimate-box">
                                <span>2 hours estimate</span>
                                <span class="estimate-total">₱{{ (professional.hourly_rate || 500) * 2 }}</span>
                            </div>

                            <button @click="bookNow" class="book-button">
                                Book {{ professional.firstName }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Rating Modal -->
        <RatingModal v-if="showRatingModal" :skilledId="professional?.skilled_id"
            :professionalName="professional?.fullName" :userRating="userRating" @close="showRatingModal = false"
            @submitted="handleRatingSubmitted" />

        <!-- Report Modal -->
        <ReportModal v-if="showReportModal" reportType="Profile" :reportedUserId="professional?.user_id"
            :reportedSkillId="professional?.skilled_id" @close="showReportModal = false" />
    </div>
</template>

<style scoped>
/* Add report button style */
.report-btn {
    color: #ef4444;
}

.report-btn:hover {
    background: #fee2e2;
    color: #dc2626;
}

/* Keep all existing styles */
.public-profile {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.profile-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
}

/* Loading State */
.loading-container {
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
}

.loading-spinner {
    width: 60px;
    height: 60px;
    border: 4px solid #e0e7ff;
    border-top: 4px solid #4f46e5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.loading-text {
    color: #64748b;
    font-size: 1.1rem;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* Error State */
.error-container {
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    text-align: center;
}

.error-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    color: #ef4444;
}

.error-icon svg {
    width: 64px;
    height: 64px;
}

.error-title {
    color: #1e293b;
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.back-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    border: none;
    border-radius: 30px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.back-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
}

.back-icon {
    display: inline-flex;
    align-items: center;
}

/* Profile Header */
.profile-header {
    background: white;
    border-radius: 30px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
    margin-bottom: 2rem;
}

.header-cover {
    height: 150px;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    position: relative;
}

.cover-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
}

.header-main {
    padding: 0 2rem 2rem;
    position: relative;
    display: flex;
    gap: 2rem;
    align-items: flex-end;
}

.profile-avatar-wrapper {
    position: relative;
    margin-top: -75px;
}

.profile-avatar {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 4px solid white;
    object-fit: cover;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.verified-chip {
    position: absolute;
    bottom: -10px;
    right: 30px;
    background: #10b981;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 30px;
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    border: 2px solid white;
}

.verified-icon {
    display: inline-flex;
    align-items: center;
}

.profile-title-section {
    flex: 1;
}

.profile-name {
    font-size: 2.2rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 0.25rem;
    line-height: 1.2;
}

.profile-skill {
    color: #4f46e5;
    font-weight: 600;
    margin-bottom: 1rem;
    font-size: 1.1rem;
}

.profile-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.badge-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 1rem;
    background: #f8fafc;
    border-radius: 30px;
    color: #475569;
    font-size: 0.95rem;
}

.badge-item.rate-badge {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    color: #92400e;
    font-weight: 600;
}

.badge-icon {
    display: inline-flex;
    align-items: center;
}

.badge-sub {
    color: #94a3b8;
    font-size: 0.85rem;
}

/* Profile Actions */
.profile-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
}

.action-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 30px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
}

.action-button.primary {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
}

.action-button.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
}

.action-button.secondary {
    background: #f1f5f9;
    color: #1e293b;
}

.action-button.secondary:hover {
    background: #e2e8f0;
    transform: translateY(-2px);
}

.action-icon-button {
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 50%;
    background: #f1f5f9;
    color: #1e293b;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.action-icon-button:hover:not(:disabled) {
    background: #e2e8f0;
    transform: translateY(-2px);
}

.action-icon-button.favorite-active {
    background: #fee2e2;
    color: #ef4444;
}

.action-icon-button.favorite-active:hover {
    background: #fecaca;
}

.report-btn {
    color: #ef4444;
}

.report-btn:hover {
    background: #fee2e2;
    color: #dc2626;
}

.spinner-small {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-top: 2px solid #4f46e5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.favorite-icon {
    display: inline-flex;
    align-items: center;
}

/* Profile Grid */
.profile-grid {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 2rem;
}

/* Content Cards */
.content-card {
    background: white;
    border-radius: 24px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    border: 1px solid #f1f5f9;
}

.content-card:hover {
    box-shadow: 0 20px 40px rgba(79, 70, 229, 0.1);
    border-color: #e0e7ff;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #f1f5f9;
}

.card-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: #1e293b;
}

.card-badge {
    padding: 0.3rem 1rem;
    background: #e0e7ff;
    color: #4f46e5;
    border-radius: 30px;
    font-size: 0.85rem;
    font-weight: 600;
}

/* Bio */
.bio-text {
    color: #475569;
    line-height: 1.8;
    margin-bottom: 2rem;
    font-size: 1rem;
}

.info-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 16px;
}

.stat-block {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.stat-label {
    font-size: 0.85rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.stat-value {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
}

/* Skills */
.skill-count {
    padding: 0.25rem 1rem;
    background: #f1f5f9;
    border-radius: 30px;
    font-size: 0.85rem;
    font-weight: 600;
    color: #4f46e5;
}

.skills-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.skill-chip {
    padding: 0.6rem 1.2rem;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border: 1px solid #e2e8f0;
    border-radius: 30px;
    font-size: 0.95rem;
    font-weight: 500;
    color: #334155;
    transition: all 0.3s ease;
}

.skill-chip:hover {
    transform: translateY(-2px);
    border-color: #4f46e5;
    box-shadow: 0 5px 15px rgba(79, 70, 229, 0.1);
}

/* Reviews Section */
.reviews-card {
    padding-bottom: 2rem;
}

.review-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.2rem;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    border: none;
    border-radius: 30px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.review-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
}

.review-icon {
    display: inline-flex;
    align-items: center;
}

/* Rating Overview */
.rating-overview {
    margin-bottom: 2rem;
}

.rating-summary {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 2rem;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 20px;
    margin-bottom: 1rem;
}

.average-box {
    text-align: center;
    min-width: 120px;
}

.average-number {
    display: block;
    font-size: 3rem;
    font-weight: 800;
    color: #1e293b;
    line-height: 1;
    margin-bottom: 0.5rem;
}

.average-stars {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
}

.stars-display {
    color: #fbbf24;
    font-size: 1.2rem;
    letter-spacing: 2px;
}

.total-reviews {
    color: #64748b;
    font-size: 0.85rem;
}

.distribution-box {
    flex: 1;
}

.distribution-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
}

.star-label {
    width: 40px;
    color: #64748b;
    font-size: 0.9rem;
}

.progress-track {
    flex: 1;
}

.progress-bar {
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%);
    border-radius: 4px;
    transition: width 0.3s ease;
}

.distribution-value {
    width: 30px;
    text-align: right;
    color: #64748b;
    font-size: 0.9rem;
    font-weight: 600;
}

/* User Rating Banner */
.user-rating-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    border-radius: 12px;
    color: #065f46;
    font-weight: 500;
}

.update-link {
    background: none;
    border: 2px solid #065f46;
    color: #065f46;
    padding: 0.4rem 1rem;
    border-radius: 30px;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.update-link:hover {
    background: #065f46;
    color: white;
}

/* Reviews List */
.reviews-container {
    margin-top: 1.5rem;
}

.reviews-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.review-item {
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 16px;
    transition: all 0.3s ease;
    border: 1px solid transparent;
}

.review-item:hover {
    background: white;
    border-color: #e0e7ff;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
}

.review-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
}

.reviewer-info {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.reviewer-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid white;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}

.reviewer-name {
    color: #1e293b;
    margin-bottom: 0.25rem;
    font-size: 1rem;
    font-weight: 600;
}

.reviewer-stars .stars {
    color: #fbbf24;
    font-size: 0.9rem;
    letter-spacing: 1px;
}

.review-date {
    color: #94a3b8;
    font-size: 0.85rem;
    background: #f1f5f9;
    padding: 0.25rem 0.75rem;
    border-radius: 30px;
}

.review-text {
    color: #475569;
    line-height: 1.7;
    margin: 0;
    font-size: 0.95rem;
}

.review-text.no-text {
    color: #94a3b8;
    font-style: italic;
}

/* Load More Button */
.load-more-button {
    width: 100%;
    padding: 0.75rem;
    margin-top: 1.5rem;
    background: #f1f5f9;
    border: 2px solid #e2e8f0;
    border-radius: 30px;
    color: #4f46e5;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.load-more-button:hover {
    background: #e0e7ff;
    border-color: #4f46e5;
    transform: translateY(-2px);
}

/* Empty Reviews */
.empty-reviews {
    text-align: center;
    padding: 3rem 1rem;
}

.empty-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.empty-icon svg {
    width: 64px;
    height: 64px;
    stroke: #94a3b8;
}

.empty-title {
    color: #1e293b;
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.empty-description {
    color: #64748b;
    margin-bottom: 1.5rem;
}

.empty-action {
    padding: 0.6rem 2rem;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    border: none;
    border-radius: 30px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.empty-action:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
}

/* Sidebar Cards */
.sidebar-card {
    background: white;
    border-radius: 20px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
    border: 1px solid #f1f5f9;
    transition: all 0.3s ease;
}

.sidebar-card:hover {
    box-shadow: 0 20px 30px rgba(79, 70, 229, 0.1);
    border-color: #e0e7ff;
}

.sidebar-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #f1f5f9;
}

/* Contact List */
.contact-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    background: #f8fafc;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.contact-item:hover {
    background: #f1f5f9;
    transform: translateX(5px);
}

.contact-emoji {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
}

.contact-text {
    color: #475569;
    font-size: 0.95rem;
    word-break: break-all;
}

/* Availability */
.availability-badge {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: #f0fdf4;
    border-radius: 12px;
    margin-bottom: 1rem;
}

.status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.status-dot.online {
    background: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.status-text {
    color: #10b981;
    font-weight: 600;
}

.schedule-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.schedule-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #475569;
    font-size: 0.9rem;
    padding: 0.5rem 0;
    border-bottom: 1px dashed #e2e8f0;
}

.schedule-item:last-child {
    border-bottom: none;
}

.schedule-time {
    font-weight: 500;
}

.schedule-time.closed {
    color: #ef4444;
}

/* Booking Card */
.booking-card {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
}

.booking-card .sidebar-title {
    color: white;
    border-bottom-color: rgba(255, 255, 255, 0.2);
}

.rate-display {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 1rem;
}

.rate-label {
    opacity: 0.9;
    font-size: 0.95rem;
}

.rate-value {
    font-size: 2rem;
    font-weight: 800;
}

.rate-note {
    font-size: 0.85rem;
    opacity: 0.8;
    margin-bottom: 1rem;
    font-style: italic;
}

.estimate-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    margin-bottom: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 0.95rem;
}

.estimate-total {
    font-size: 1.3rem;
    font-weight: 700;
}

.book-button {
    width: 100%;
    padding: 0.75rem;
    background: white;
    color: #4f46e5;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1rem;
}

.book-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

/* Empty Text */
.empty-text {
    color: #94a3b8;
    font-style: italic;
    text-align: center;
    padding: 1rem;
}

/* Review List Animation */
.review-list-enter-active,
.review-list-leave-active {
    transition: all 0.3s ease;
}

.review-list-enter-from,
.review-list-leave-to {
    opacity: 0;
    transform: translateY(20px);
}

/* Responsive Design */
@media (max-width: 1024px) {
    .profile-grid {
        grid-template-columns: 1fr;
    }

    .header-main {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .profile-badges {
        justify-content: center;
    }

    .profile-actions {
        justify-content: center;
    }

    .verified-chip {
        position: absolute;
        right: 30px;
    }
}

@media (max-width: 768px) {
    .profile-wrapper {
        padding: 1rem;
    }

    .profile-name {
        font-size: 1.8rem;
    }

    .rating-summary {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .average-box {
        display: flex;
        align-items: center;
        gap: 1rem;
        text-align: left;
    }

    .average-number {
        font-size: 2rem;
        margin-bottom: 0;
    }

    .info-stats {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .review-header {
        flex-direction: column;
        gap: 0.5rem;
    }

    .profile-actions {
        flex-wrap: wrap;
    }

    .verified-chip {
        position: absolute;
        right: 15px;
    }
}

@media (max-width: 480px) {
    .profile-avatar {
        width: 120px;
        height: 120px;
    }

    .profile-name {
        font-size: 1.5rem;
    }

    .profile-badges {
        flex-direction: column;
    }

    .badge-item {
        width: 100%;
    }

    .profile-actions {
        width: 100%;
    }

    .action-button {
        flex: 1;
        justify-content: center;
    }

    .rating-summary {
        padding: 1rem;
    }

    .content-card {
        padding: 1.5rem;
    }
}
</style>