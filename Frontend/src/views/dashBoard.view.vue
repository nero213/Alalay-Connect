<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import noSearchNavbar from '@/components/noSearchNavbar.vue'
import { searchSkilledWorkers, getAllSkills } from '@/api/skilledProfiles'

const router = useRouter()
const loading = ref(true)
const workers = ref([])
const searchQuery = ref('')
const selectedCategory = ref('all')
const userLocation = ref({ lat: null, lng: null })
const categories = ref([])

// Quick booking modal
const showQuickBook = ref(false)
const selectedWorker = ref(null)
const quickBooking = ref({
  date: '',
  duration: 1,
})

// Min date for booking (today)
const minDate = new Date().toISOString().split('T')[0]

// SVG icon mapping for skills
const getSkillIconSvg = (skillName) => {
  const icons = {
    search: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`,
    Electrician: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`,
    Plumber: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.5 8.5L21 3M21 3L16.5 8.5M21 3H16M21 3V8M12 8L8 12M8 12L12 16L8 12ZM8 12L3 7M8 12L3 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`,
    Carpenter: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 12L12 22L22 12L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 6L6 12L12 18L18 12L12 6Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`,
    Welder: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C12 2 8 8 8 12C8 14.1217 8.84285 16.1566 10.3431 17.6569C11.8434 19.1571 13.8783 20 16 20C18.1217 20 20.1566 19.1571 21.6569 17.6569C23.1571 16.1566 24 14.1217 24 12C24 6 18 2 18 2C18 4 16 6 16 6C16 4 14 2 14 2C14 4 12 6 12 6C12 4 12 2 12 2Z" stroke="currentColor" stroke-width="1.5"/>
                </svg>`,
    Painter: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>`,
    Mason: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M8 7V17M12 7V17M16 7V17M3 12H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>`,
    Technician: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M12 18H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>`,
    Driver: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13L4 9C4 8.44772 4.44772 8 5 8H19C19.5523 8 20 8.44772 20 9L19 13M5 13H19M5 13V17H7V13M19 13V17H17V13M7 13H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <circle cx="7" cy="17" r="2" stroke="currentColor" stroke-width="1.5"/>
                    <circle cx="17" cy="17" r="2" stroke="currentColor" stroke-width="1.5"/>
                </svg>`,
    Cook: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 8L8 10M18 8L16 10M12 6V12M12 12L10 14M12 12L14 14M8 16H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M4 4L8 8M20 4L16 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M12 22C16.4183 22 20 18.4183 20 14V6H4V14C4 18.4183 7.58172 22 12 22Z" stroke="currentColor" stroke-width="1.5"/>
                </svg>`,
    Housekeeper: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 5L19 19M19 5L5 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M12 12L14 14M14 10L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>`,
    'Laundry Services': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 8H20V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V8Z" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M8 4L4 8M16 4L20 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>`,
    Tutor: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H8C10.2091 4 12 5.79086 12 8V20C12 18.8954 11.1046 18 10 18H4V4Z" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M20 4H16C13.7909 4 12 5.79086 12 8V20C12 18.8954 12.8954 18 14 18H20V4Z" stroke="currentColor" stroke-width="1.5"/>
                </svg>`,
    'Computer Repair': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="4" width="20" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M8 20H16M12 16V20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>`,
    Gardener: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C12 2 8 6 8 10C8 12.2091 9.79086 14 12 14C14.2091 14 16 12.2091 16 10C16 6 12 2 12 2Z" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M12 14V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>`,
    Handyman: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.5 8.5L21 3M21 3L16.5 8.5M21 3H16M21 3V8M12 8L8 12M8 12L12 16L8 12ZM8 12L3 7M8 12L3 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`,
    'Security Guard': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 6V12C3 17.5 12 22 12 22C12 22 21 17.5 21 12V6L12 2Z" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>`,
    'Massage Therapist': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8C13.6569 8 15 6.65685 15 5C15 3.34315 13.6569 2 12 2C10.3431 2 9 3.34315 9 5C9 6.65685 10.3431 8 12 8Z" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M12 22V15M12 15L8 11M12 15L16 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>`,
    Barber: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15C14.2091 15 16 13.2091 16 11C16 8.79086 14.2091 7 12 7C9.79086 7 8 8.79086 8 11C8 13.2091 9.79086 15 12 15Z" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M5 5L9 9M19 5L15 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>`,
    'Event Coordinator': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="1.5"/>
                </svg>`,
    DJ: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8C14.2091 8 16 6.20914 16 4C16 1.79086 14.2091 0 12 0C9.79086 0 8 1.79086 8 4C8 6.20914 9.79086 8 12 8Z" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>`,
    default: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" stroke-width="1.5"/>
                </svg>`,
  }
  return icons[skillName] || icons['default']
}

// Load categories from database
const loadCategories = async () => {
  try {
    const skills = await getAllSkills()
    categories.value = [
      { id: 'all', name: 'All Professionals', icon: 'search' },
      ...skills.map((skill) => ({
        id: skill.skill_id,
        name: skill.name,
        icon: skill.name,
      })),
    ]
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

// Get user location
const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        loadWorkers()
      },
      (error) => {
        console.error('Error getting location:', error)
        userLocation.value = {
          lat: 14.5995,
          lng: 120.9842,
        }
        loadWorkers()
      },
    )
  } else {
    userLocation.value = {
      lat: 14.5995,
      lng: 120.9842,
    }
    loadWorkers()
  }
}

// Load workers
const loadWorkers = async () => {
  loading.value = true
  try {
    const skillName =
      selectedCategory.value === 'all'
        ? null
        : categories.value.find((c) => c.id == selectedCategory.value)?.name

    const data = await searchSkilledWorkers(
      userLocation.value.lat,
      userLocation.value.lng,
      skillName,
    )
    workers.value = data
  } catch (error) {
    console.error('Error loading workers:', error)
  } finally {
    loading.value = false
  }
}

// Filter workers by search query
// frontend/src/views/dashBoard.view.vue
const filteredWorkers = computed(() => {
  if (!searchQuery.value.trim()) return workers.value

  const query = searchQuery.value.toLowerCase()
  return workers.value.filter((worker) => {
    // Check name
    if (worker.fullName?.toLowerCase().includes(query)) return true
    if (worker.name?.toLowerCase().includes(query)) return true

    // Check bio
    if (worker.bio?.toLowerCase().includes(query)) return true

    // Check location
    if (worker.barangay?.toLowerCase().includes(query)) return true
    if (worker.city?.toLowerCase().includes(query)) return true

    // Check skills - IMPORTANT FIX
    if (worker.skills && Array.isArray(worker.skills)) {
      if (worker.skills.some((skill) => skill.name?.toLowerCase().includes(query))) return true
    }

    // Check all_skills (from API)
    if (worker.all_skills && Array.isArray(worker.all_skills)) {
      if (worker.all_skills.some((skill) => skill.toLowerCase().includes(query))) return true
    }

    // Check skill_name (string)
    if (worker.skill_name?.toLowerCase().includes(query)) return true

    return false
  })
})

// Format distance
const formatDistance = (distance) => {
  if (!distance) return 'Distance unknown'
  if (distance < 1) return `${Math.round(distance * 1000)}m away`
  return `${distance.toFixed(1)}km away`
}

const baseURL = import.meta.env.VITE_BASE_URL
// Get worker image
const workerImage = (worker) => {
  if (!worker || !worker.profile_image) return '/default-avatar.png'
  let imagePath = worker.profile_image.replace(/\\/g, '/')
  if (!imagePath.startsWith('/uploads')) {
    imagePath = `/uploads/${imagePath.split('/').pop()}`
  }
  return `${baseURL}${imagePath}`
}

// Get rating stars
const getRatingStars = (rating) => {
  const fullStars = Math.floor(rating || 0)
  return '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars)
}

// Book now - go to full booking page
const bookNow = (worker) => {
  if (!worker || !worker.skilled_id) {
    console.error('Invalid worker data:', worker)
    alert('Cannot book this professional. Missing information.')
    return
  }
  router.push(`/booking/${worker.skilled_id}`)
}

// Open quick book modal
const openQuickBook = (worker) => {
  if (!worker || !worker.skilled_id) {
    console.error('Invalid worker data:', worker)
    alert('Cannot quick book this professional. Missing information.')
    return
  }
  selectedWorker.value = worker
  showQuickBook.value = true
  quickBooking.value = {
    date: '',
    duration: 1,
  }
}

// Close quick book modal
const closeQuickBook = () => {
  showQuickBook.value = false
  selectedWorker.value = null
}

// Confirm quick book
const confirmQuickBook = () => {
  if (!selectedWorker.value) {
    console.error('No worker selected')
    alert('Please select a worker first')
    closeQuickBook()
    return
  }

  if (!selectedWorker.value.skilled_id) {
    console.error('Worker has no skilled_id:', selectedWorker.value)
    alert('Cannot book this professional. Missing ID.')
    closeQuickBook()
    return
  }

  if (!quickBooking.value.date) {
    alert('Please select a date')
    return
  }

  const workerId = selectedWorker.value.skilled_id
  closeQuickBook()
  router.push(`/booking/${workerId}`)
}

// View worker profile
const viewProfile = (worker) => {
  const workerId = worker.skilled_id || worker.user_id

  if (!workerId) {
    console.error('Invalid worker data:', worker)
    alert('Cannot view profile. Missing information.')
    return
  }

  router.push(`/skilled-profile/${workerId}`)
}

// Change category
const changeCategory = (categoryId) => {
  selectedCategory.value = categoryId
  loadWorkers()
}

onMounted(() => {
  loadCategories()
  getUserLocation()
})
</script>

<template>
  <div class="dashboard-layout">
    <noSearchNavbar />

    <main class="dashboard-main">
      <!-- Hero Section -->
      <section class="hero-banner">
        <div class="hero-container">
          <div class="hero-text">
            <h1 class="hero-title">
              Find Trusted Skilled Worker <span class="highlight">Near You</span>
            </h1>
            <p class="hero-subtitle">Connect with verified skilled workers in your community</p>
          </div>

          <div class="search-container">
            <div class="search-wrapper">
              <span class="search-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Search by name, skill, or keyword..."
                class="search-field"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="categories-wrapper">
        <div class="section-header">
          <h2 class="section-title">Browse by Category</h2>
          <span class="section-badge">{{ categories.length - 1 }} categories</span>
        </div>

        <div class="categories-scroll">
          <button
            v-for="category in categories"
            :key="category.id"
            @click="changeCategory(category.id)"
            :class="['category-pill', { 'pill-active': selectedCategory === category.id }]"
          >
            <span class="pill-icon" v-html="getSkillIconSvg(category.icon)"></span>
            <span class="pill-name">{{ category.name }}</span>
          </button>
        </div>
      </section>

      <!-- Workers Section -->
      <section class="workers-wrapper">
        <div class="section-header">
          <div class="header-left">
            <h2 class="section-title">
              {{
                selectedCategory === 'all'
                  ? 'Recommended for You'
                  : categories.find((c) => c.id == selectedCategory)?.name
              }}
            </h2>
          </div>
          <span class="results-count">{{ filteredWorkers.length }} professionals found</span>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-grid">
          <div v-for="n in 6" :key="n" class="skeleton-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
              <div class="skeleton-line title"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line short"></div>
            </div>
          </div>
        </div>

        <!-- Workers Grid -->
        <div v-else-if="filteredWorkers.length > 0" class="workers-grid">
          <div v-for="worker in filteredWorkers" :key="worker.skilled_id" class="professional-card">
            <div class="card-media">
              <img :src="workerImage(worker)" :alt="worker.fullName" class="card-image" />
              <span class="distance-tag">{{ formatDistance(worker.distance) }}</span>
              <span v-if="worker.verification_status === 'approved'" class="verified-tag">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                Verified
              </span>
            </div>

            <div class="card-info">
              <h3 class="professional-name">{{ worker.fullName }}</h3>
              <p class="professional-skill">{{ worker.name || 'Skilled' }}</p>

              <div class="rating-container">
                <span class="stars">{{ getRatingStars(worker.average_rating) }}</span>
                <span class="rating-number">{{ worker.average_rating || '0.0' }}</span>
                <span class="rating-count">({{ worker.total_ratings || 0 }} reviews)</span>
              </div>

              <div class="professional-meta">
                <span class="experience-badge">
                  <span class="meta-icon">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 8V12L15 15M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  {{ worker.years_experience || 0 }} yrs exp
                </span>
                <span class="experience-badge">
                  <span class="meta-icon">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2V4M12 20V22M4 12H2M6.5 6.5L5 5M17.5 17.5L19 19M22 12H20M18 6L19 5M5 19L6.5 17.5M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8Z"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  ₱{{ worker.hourly_rate || 500 }}/hr
                </span>
              </div>
            </div>

            <div class="card-actions">
              <button @click="viewProfile(worker)" class="action-button view-btn">
                <span class="btn-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                Profile
              </button>
              <button @click="bookNow(worker)" class="action-button book-btn">
                <span class="btn-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="16"
                      rx="2"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <path
                      d="M8 2V6M16 2V6M3 10H21"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                </span>
                Book
              </button>
              <button @click="openQuickBook(worker)" class="action-button quick-btn">
                <span class="btn-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13 3L21 12L13 21M3 3L11 12L3 21"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                Quick
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-container">
          <div class="empty-illustration">
            <span class="empty-emoji">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </div>
          <h3 class="empty-title">No professionals found</h3>
          <p class="empty-message">Try adjusting your search or filters</p>
          <button
            @click="    searchQuery = ''; selectedCategory = 'all'"class="reset-button"  >
            Reset Filters
          </button>
        </div>
      </section>
    </main>

    <!-- Quick Book Modal -->
    <transition name="modal-fade">
      <div v-if="showQuickBook" class="modal-backdrop" @click="closeQuickBook">
        <div class="modal-panel" @click.stop>
          <div class="modal-head">
            <h3 class="modal-title">Quick Book</h3>
            <button @click="closeQuickBook" class="modal-close" aria-label="Close modal">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div v-if="selectedWorker" class="worker-preview">
              <img
                :src="workerImage(selectedWorker)"
                :alt="selectedWorker.fullName"
                class="preview-image"
              />
              <div class="preview-details">
                <h4 class="preview-name">{{ selectedWorker.fullName }}</h4>
                <p class="preview-skill">Skilled</p>
                <div class="preview-rating">
                  <span class="stars">{{ getRatingStars(selectedWorker.average_rating) }}</span>
                  <span class="rating-text">({{ selectedWorker.total_ratings || 0 }} reviews)</span>
                </div>
                <p class="preview-price">
                  <span class="price-icon">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2V4M12 20V22M4 12H2M6.5 6.5L5 5M17.5 17.5L19 19M22 12H20M18 6L19 5M5 19L6.5 17.5M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8Z"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  ₱{{ selectedWorker.hourly_rate || 500 }}/hour
                </p>
              </div>
            </div>

            <div class="booking-form">
              <div class="form-field">
                <label class="field-label">
                  <span class="label-icon">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="16"
                        rx="2"
                        stroke="currentColor"
                        stroke-width="1.5"
                      />
                      <path
                        d="M8 2V6M16 2V6M3 10H21"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                    </svg>
                  </span>
                  Select Date
                </label>
                <input
                  type="date"
                  v-model="quickBooking.date"
                  :min="minDate"
                  class="field-input"
                  required
                />
              </div>

              <div class="form-field">
                <label class="field-label">
                  <span class="label-icon">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 8V12L15 15M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  Duration
                </label>
                <select v-model="quickBooking.duration" class="field-select">
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                  <option value="6">6 hours</option>
                  <option value="8">8 hours (full day)</option>
                </select>
              </div>

              <div class="estimated-total">
                <span>Estimated Total:</span>
                <span class="total-amount">
                  ₱{{
                    ((selectedWorker?.hourly_rate || 500) * quickBooking.duration).toLocaleString()
                  }}
                </span>
              </div>
            </div>
          </div>

          <div class="modal-foot">
            <button @click="closeQuickBook" class="foot-button cancel-btn">Cancel</button>
            <button @click="confirmQuickBook" class="foot-button confirm-btn">
              Continue to Booking
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Keep all existing styles - they remain unchanged */
.estimated-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  margin-top: 1rem;
  font-weight: 500;
}

.total-amount {
  font-size: 1.2rem;
  font-weight: 700;
  color: #10b981;
}

.preview-price {
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #10b981;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.price-icon {
  display: inline-flex;
  align-items: center;
}

/* Dashboard Layout */
.dashboard-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

/* Hero Banner */
.hero-banner {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  padding: 4rem 2rem;
  position: relative;
  overflow: hidden;
}

.hero-banner::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  animation: rotate 30s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.hero-text {
  text-align: center;
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.highlight {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin: 0 auto;
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-wrapper {
  position: relative;
  animation: slideUp 0.5s ease;
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  z-index: 2;
}

.search-icon svg {
  width: 20px;
  height: 20px;
}

.search-field {
  width: 100%;
  padding: 1.2rem 1.2rem 1.2rem 3.2rem;
  border: none;
  border-radius: 60px;
  font-size: 1.1rem;
  background: white;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.search-field:focus {
  outline: none;
  transform: scale(1.02);
  box-shadow: 0 30px 50px rgba(79, 70, 229, 0.3);
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

/* Section Styles */
.categories-wrapper,
.workers-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
  border-radius: 2px;
}

.section-badge {
  padding: 0.4rem 1rem;
  background: white;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4f46e5;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.results-count {
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 30px;
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Categories Scroll */
.categories-scroll {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding: 0.5rem 0 1rem;
  scrollbar-width: thin;
  scrollbar-color: #4f46e5 #e2e8f0;
}

.categories-scroll::-webkit-scrollbar {
  height: 6px;
}

.categories-scroll::-webkit-scrollbar-track {
  background: #e2e8f0;
  border-radius: 10px;
}

.categories-scroll::-webkit-scrollbar-thumb {
  background: #4f46e5;
  border-radius: 10px;
}

.category-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: white;
  border: 2px solid transparent;
  border-radius: 40px;
  font-size: 1rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.category-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px rgba(79, 70, 229, 0.1);
  border-color: #4f46e5;
}

.pill-active {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
}

.pill-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pill-icon svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
}

/* Workers Grid */
.workers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.professional-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid #f1f5f9;
}

.professional-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(79, 70, 229, 0.1);
  border-color: #e0e7ff;
}

.card-media {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.professional-card:hover .card-image {
  transform: scale(1.1);
}

.distance-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  color: white;
  padding: 0.3rem 1rem;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.verified-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.3rem 1rem;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
}

.verified-tag svg {
  width: 12px;
  height: 12px;
}

.card-info {
  padding: 1.5rem;
  flex: 1;
}

.professional-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.professional-skill {
  color: #4f46e5;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rating-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.stars {
  color: #fbbf24;
  font-size: 1rem;
  letter-spacing: 2px;
}

.rating-number {
  font-weight: 700;
  color: #1e293b;
}

.rating-count {
  color: #94a3b8;
  font-size: 0.85rem;
}

.professional-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.experience-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 1rem;
  background: #f1f5f9;
  border-radius: 30px;
  font-size: 0.85rem;
  color: #475569;
}

.meta-icon {
  display: inline-flex;
  align-items: center;
}

.meta-icon svg {
  width: 14px;
  height: 14px;
  stroke: currentColor;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.action-button {
  flex: 1;
  padding: 0.7rem;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
}

.btn-icon svg {
  width: 16px;
  height: 16px;
  stroke: currentColor;
}

.view-btn {
  background: #f1f5f9;
  color: #475569;
}

.view-btn:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

.book-btn {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
}

.book-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
}

.quick-btn {
  background: #10b981;
  color: white;
}

.quick-btn:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
}

/* Loading Skeleton */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.skeleton-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.skeleton-image {
  height: 200px;
  background: linear-gradient(90deg, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  padding: 1.5rem;
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.skeleton-line.title {
  height: 20px;
  width: 60%;
}

.skeleton-line.short {
  width: 40%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

/* Empty State */
.empty-container {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.empty-illustration {
  margin-bottom: 1.5rem;
}

.empty-emoji {
  display: inline-block;
  opacity: 0.5;
  animation: bounce 2s infinite;
}

.empty-emoji svg {
  width: 80px;
  height: 80px;
  stroke: #94a3b8;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.empty-message {
  color: #64748b;
  margin-bottom: 2rem;
}

.reset-button {
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.modal-panel {
  background: white;
  border-radius: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideUp 0.3s ease;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #f1f5f9;
}

.modal-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.modal-close {
  width: 36px;
  height: 36px;
  border: none;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #64748b;
}

.modal-close svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
}

.modal-close:hover {
  background: #e2e8f0;
  color: #ef4444;
}

.modal-body {
  padding: 1.5rem;
}

/* Worker Preview */
.worker-preview {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 16px;
  margin-bottom: 1.5rem;
}

.preview-image {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}

.preview-details {
  flex: 1;
}

.preview-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.preview-skill {
  color: #4f46e5;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.preview-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-text {
  color: #64748b;
  font-size: 0.85rem;
}

/* Booking Form */
.booking-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #334155;
  font-size: 0.95rem;
}

.label-icon {
  display: inline-flex;
  align-items: center;
}

.label-icon svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
}

.field-input,
.field-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.field-input:focus,
.field-select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}

/* Modal Footer */
.modal-foot {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 2px solid #f1f5f9;
}

.foot-button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.cancel-btn {
  background: #f1f5f9;
  color: #64748b;
}

.cancel-btn:hover {
  background: #e2e8f0;
}

.confirm-btn {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
}

/* Modal Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-panel,
.modal-fade-leave-active .modal-panel {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from .modal-panel,
.modal-fade-leave-to .modal-panel {
  transform: translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .workers-grid {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-wrap: wrap;
  }

  .action-button {
    flex: 1 1 100%;
  }

  .modal-foot {
    flex-direction: column;
  }

  .section-badge {
    margin: 1rem;
  }

  .results-count {
    margin: 1rem;
  }
}

@media (max-width: 480px) {
  .hero-banner {
    padding: 3rem 1rem;
  }

  .categories-wrapper,
  .workers-wrapper {
    padding: 1.5rem 1rem;
  }

  .worker-preview {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .preview-rating {
    justify-content: center;
  }
}
</style>
