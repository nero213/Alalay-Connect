<template>
  <div class="favorites-page">
    <noSearchNavbar />

    <div class="favorites-container">
      <div class="page-header">
        <h1>My Favorite Professionals</h1>
        <p>Save your preferred skilled workers for easy access</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading your favorites...</p>
      </div>

      <!-- Favorites Grid -->
      <div v-else-if="favorites.length > 0" class="favorites-grid">
        <div v-for="worker in favorites" :key="worker.skilled_id" class="favorite-card">
          <div class="card-image">
            <img :src="getImageUrl(worker.profile_image)" :alt="worker.fullName" />
            <button
              @click="removeFavorite(worker.skilled_id)"
              class="remove-fav-btn"
              title="Remove from favorites"
            >
              ❌
            </button>
          </div>

          <div class="card-content">
            <h3 class="worker-name">{{ worker.fullName }}</h3>
            <p class="worker-skill">Skilled</p>

            <div class="worker-rating">
              <span class="stars">{{ getRatingStars(worker.average_rating) }}</span>
              <span class="rating-value">{{ worker.average_rating || 'New' }}</span>
              <span class="reviews-count">({{ worker.total_ratings || 0 }})</span>
            </div>

            <div class="worker-meta">
              <span class="experience">{{ worker.years_experience || 0 }} yrs exp</span>
              <span class="price">₱{{ worker.hourly_rate || 500 }}/hr</span>
              <span class="verified-badge" v-if="worker.verification_status === 'approved'">
                ✓ Verified
              </span>
            </div>

            <p class="worker-bio">{{ worker.bio?.substring(0, 80) }}...</p>
          </div>

          <div class="card-actions">
            <button @click="viewProfile(worker.skilled_id)" class="btn-view">View Profile</button>
            <button @click="bookNow(worker.skilled_id)" class="btn-book">Book Now</button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">❤️</div>
        <h3>No favorites yet</h3>
        <p>Start saving your preferred professionals by clicking the heart icon on their profile</p>
        <router-link to="/dashboard" class="browse-btn"> Browse Professionals </router-link>
      </div>
    </div>

    <!-- Remove Favorite Confirmation Modal -->
    <div v-if="showRemoveModal" class="modal-overlay" @click="closeRemoveModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Remove from Favorites</h3>
          <button @click="closeRemoveModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p>
            Are you sure you want to remove <strong>{{ workerToRemove?.fullName }}</strong> from
            your favorites?
          </p>
        </div>
        <div class="modal-footer">
          <button @click="closeRemoveModal" class="btn-cancel">Cancel</button>
          <button @click="confirmRemove" class="btn-confirm">Remove</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import noSearchNavbar from '@/components/noSearchNavbar.vue'
import { getFavorites, removeFromFavorites } from '@/api/favoritesService'

const router = useRouter()
const loading = ref(true)
const favorites = ref([])
const showRemoveModal = ref(false)
const workerToRemove = ref(null)


const baseURL = import.meta.env.VITE_BASE_URL
// Get image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/default-avatar.png'

  // If it's already a full URL
  if (imagePath.startsWith('http')) {
    return imagePath
  }

  // Replace backslashes with forward slashes
  let formattedPath = imagePath.replace(/\\/g, '/')

  // Ensure it starts with /uploads/
  if (!formattedPath.startsWith('/uploads/')) {
    const filename = formattedPath.split('/').pop()
    formattedPath = `/uploads/${filename}`
  }

  return `${baseURL}${formattedPath}`
}

// Get rating stars
const getRatingStars = (rating) => {
  const fullStars = Math.floor(rating || 0)
  return '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars)
}

// Load favorites
const loadFavorites = async () => {
  loading.value = true
  try {
    const response = await getFavorites()
    favorites.value = response.favorites
  } catch (error) {
    console.error('Error loading favorites:', error)
  } finally {
    loading.value = false
  }
}

// Remove favorite
const removeFavorite = (skilledId) => {
  const worker = favorites.value.find((f) => f.skilled_id === skilledId)
  if (worker) {
    workerToRemove.value = worker
    showRemoveModal.value = true
  }
}

// Confirm remove
const confirmRemove = async () => {
  if (!workerToRemove.value) return

  try {
    await removeFromFavorites(workerToRemove.value.skilled_id)
    favorites.value = favorites.value.filter(
      (f) => f.skilled_id !== workerToRemove.value.skilled_id,
    )
    closeRemoveModal()
  } catch (error) {
    console.error('Error removing favorite:', error)
    alert('Failed to remove from favorites')
  }
}

// Close remove modal
const closeRemoveModal = () => {
  showRemoveModal.value = false
  workerToRemove.value = null
}

// View profile
const viewProfile = (skilledId) => {
  router.push(`/skilled-profile/${skilledId}`)
}

// Book now
const bookNow = (skilledId) => {
  const token = localStorage.getItem('token')
  if (!token) {
    alert('Please log in to book a service')
    router.push('/login')
    return
  }
  router.push(`/booking/${skilledId}`)
}

onMounted(() => {
  loadFavorites()
})
</script>

<style scoped>
.favorites-page {
  min-height: 100vh;
  background: #f8fafc;
}

.favorites-container {
  max-width: 1200px;
  margin: 80px auto 2rem;
  padding: 0 1.5rem;
}

.page-header {
  text-align: center;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Favorites Grid */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.favorite-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.favorite-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.favorite-card:hover .card-image img {
  transform: scale(1.05);
}

.remove-fav-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  opacity: 0;
  transform: scale(0.9);
}

.favorite-card:hover .remove-fav-btn {
  opacity: 1;
  transform: scale(1);
}

.remove-fav-btn:hover {
  background: #ef4444;
  transform: scale(1.1);
}

.card-content {
  padding: 1.2rem;
  flex: 1;
}

.worker-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: #333;
}

.worker-skill {
  color: #667eea;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.worker-rating {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
}

.stars {
  color: #ffc107;
  font-size: 1rem;
  letter-spacing: 2px;
}

.rating-value {
  font-weight: 600;
  color: #333;
}

.reviews-count {
  color: #999;
  font-size: 0.8rem;
}

.worker-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.experience {
  color: #666;
}

.price {
  color: #10b981;
  font-weight: 600;
}

.verified-badge {
  background: #28a745;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.worker-bio {
  color: #64748b;
  font-size: 0.85rem;
  line-height: 1.4;
  margin-top: 0.5rem;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid #eee;
  background: #fafafa;
}

.btn-view,
.btn-book {
  flex: 1;
  padding: 0.6rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-view {
  background: #f0f0f0;
  color: #333;
}

.btn-view:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}

.btn-book {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-book:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 1.5rem;
}

.browse-btn {
  display: inline-block;
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 30px;
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
  max-width: 400px;
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
  font-size: 1.1rem;
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
  text-align: center;
}

.modal-body p {
  color: #475569;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #eee;
}

.btn-cancel,
.btn-confirm {
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

.btn-confirm {
  background: #ef4444;
  color: white;
}

.btn-confirm:hover {
  background: #dc2626;
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .favorites-grid {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-direction: column;
  }

  .btn-view,
  .btn-book {
    width: 100%;
  }
}
</style>
