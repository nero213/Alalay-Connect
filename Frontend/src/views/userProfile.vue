<template>
    <div class="profile-page">
        <noSearchNavbar />

        <div class="profile-container">
            <div class="profile-sidebar">
                <div class="profile-card">
                    <div class="profile-image-section">
                        <div class="profile-image-wrapper">
                            <img :src="profileImageUrl" :alt="user?.firstName" class="profile-image">
                            <button @click="triggerImageUpload" class="image-upload-btn">
                                <span class="camera-icon">📷</span>
                            </button>
                            <input type="file" ref="fileInput" @change="handleImageUpload" accept="image/*"
                                class="hidden-input">
                        </div>
                        <h2>{{ user?.firstName }} {{ user?.lastName }}</h2>
                        <p class="user-email">{{ user?.email }}</p>
                        <span class="user-role" :class="user?.role">{{ user?.role }}</span>
                    </div>

                    <div class="profile-stats">
                        <div class="stat-item">
                            <span class="stat-value">{{ stats.bookings }}</span>
                            <span class="stat-label">Bookings</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">{{ stats.reviews }}</span>
                            <span class="stat-label">Reviews</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">{{ stats.favorites }}</span>
                            <span class="stat-label">Favorites</span>
                        </div>
                    </div>

                    <div class="profile-menu">
                        <button @click="activeTab = 'profile'"
                            :class="['menu-item', { active: activeTab === 'profile' }]">
                            <span class="menu-icon">👤</span>
                            Personal Info
                        </button>
                        <button @click="activeTab = 'security'"
                            :class="['menu-item', { active: activeTab === 'security' }]">
                            <span class="menu-icon">🔒</span>
                            Security
                        </button>
                        <button @click="activeTab = 'notifications'"
                            :class="['menu-item', { active: activeTab === 'notifications' }]">
                            <span class="menu-icon">🔔</span>
                            Notifications
                        </button>
                        <button @click="activeTab = 'favorites'"
                            :class="['menu-item', { active: activeTab === 'favorites' }]">
                            <span class="menu-icon">❤️</span>
                            Favorites
                        </button>
                    </div>
                </div>
            </div>

            <div class="profile-content">
                <!-- Personal Info Tab -->
                <div v-if="activeTab === 'profile'" class="content-card">
                    <h2>Personal Information</h2>

                    <div v-if="editMode" class="edit-form">
                        <div class="form-group">
                            <label>First Name</label>
                            <input type="text" v-model="editForm.firstName" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Last Name</label>
                            <input type="text" v-model="editForm.lastName" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Phone Number</label>
                            <input type="tel" v-model="editForm.phone" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Bio</label>
                            <textarea v-model="editForm.bio" placeholder="Tell others about yourself..." rows="4"
                                class="form-textarea"></textarea>
                        </div>

                        <!-- Location Dropdowns -->
                        <div class="form-group">
                            <label>City/Municipality</label>
                            <select v-model="editForm.city" class="location-select" @change="onCityChange">
                                <option value="">Select your city/municipality</option>
                                <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Barangay</label>
                            <select v-model="editForm.barangay" class="location-select" :disabled="!editForm.city">
                                <option value="">Select your barangay</option>
                                <option v-for="barangay in availableBarangays" :key="barangay" :value="barangay">
                                    {{ barangay }}
                                </option>
                            </select>
                        </div>

                        <div class="form-actions">
                            <button @click="saveProfile" class="btn-save">Save Changes</button>
                            <button @click="cancelEdit" class="btn-cancel">Cancel</button>
                        </div>
                    </div>

                    <div v-else class="info-display">
                        <div class="info-row">
                            <span class="info-label">First Name</span>
                            <span class="info-value">{{ user?.firstName }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Last Name</span>
                            <span class="info-value">{{ user?.lastName }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Email</span>
                            <span class="info-value">{{ user?.email }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Phone</span>
                            <span class="info-value">{{ user?.phone || 'Not provided' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Bio</span>
                            <span class="info-value bio-text">{{ user?.bio || 'No bio added yet.' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">City/Municipality</span>
                            <span class="info-value">{{ user?.city || 'Not set' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Barangay</span>
                            <span class="info-value">{{ user?.barangay || 'Not set' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Member Since</span>
                            <span class="info-value">{{ formatDate(user?.created_at) }}</span>
                        </div>
                        <button @click="startEdit" class="btn-edit">Edit Profile</button>
                    </div>
                </div>

                <!-- Security Tab -->
                <div v-if="activeTab === 'security'" class="content-card">
                    <h2>Security Settings</h2>

                    <div class="password-form">
                        <h3>Change Password</h3>
                        <div class="form-group">
                            <label>Current Password</label>
                            <input type="password" v-model="passwordForm.currentPassword" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>New Password</label>
                            <input type="password" v-model="passwordForm.newPassword" class="form-input">
                            <div class="password-strength" v-if="passwordForm.newPassword">
                                <div class="strength-bar">
                                    <div class="strength-fill" :class="passwordStrengthClass"
                                        :style="{ width: passwordStrength + '%' }"></div>
                                </div>
                                <span>{{ passwordStrengthText }}</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Confirm New Password</label>
                            <input type="password" v-model="passwordForm.confirmPassword" class="form-input">
                            <span v-if="passwordMismatch" class="error-text">Passwords do not match</span>
                        </div>
                        <button @click="changeUserPassword" class="btn-save">Update Password</button>
                    </div>

                    <div class="danger-zone">
                        <h3>Danger Zone</h3>
                        <p>Once you delete your account, there is no going back. Please be certain.</p>
                        <button @click="showDeleteConfirm = true" class="btn-delete">Delete Account</button>
                    </div>
                </div>

                <!-- Notifications Tab -->
                <div v-if="activeTab === 'notifications'" class="content-card">
                    <h2>Notification Preferences</h2>

                    <div class="settings-group">
                        <div class="setting-item">
                            <div>
                                <h4>Email Notifications</h4>
                                <p>Receive updates via email</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" v-model="settings.email_notifications">
                                <span class="slider"></span>
                            </label>
                        </div>

                        <div class="setting-item">
                            <div>
                                <h4>Push Notifications</h4>
                                <p>Receive browser notifications</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" v-model="settings.push_notifications">
                                <span class="slider"></span>
                            </label>
                        </div>

                        <div class="setting-item">
                            <div>
                                <h4>SMS Notifications</h4>
                                <p>Receive text message alerts</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" v-model="settings.sms_notifications">
                                <span class="slider"></span>
                            </label>
                        </div>

                        <div class="setting-item">
                            <div>
                                <h4>Language</h4>
                                <p>Choose your preferred language</p>
                            </div>
                            <select v-model="settings.language" class="language-select">
                                <option value="en">English</option>
                                <option value="fil">Filipino</option>
                                <option value="ceb">Cebuano</option>
                            </select>
                        </div>

                        <div class="setting-item">
                            <div>
                                <h4>Theme</h4>
                                <p>Choose your preferred theme</p>
                            </div>
                            <select v-model="settings.theme" class="theme-select">
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="system">System</option>
                            </select>
                        </div>

                        <button @click="saveSettings" class="btn-save">Save Preferences</button>
                    </div>
                </div>

                <!-- Favorites Tab -->
                <div v-if="activeTab === 'favorites'" class="content-card">
                    <h2>Favorite Professionals</h2>

                    <div v-if="favorites.length" class="favorites-grid">
                        <div v-for="fav in favorites" :key="fav.favorite_id" class="favorite-card">
                            <img :src="getWorkerImage(fav.profile_image)" :alt="fav.fullName">
                            <div class="favorite-info">
                                <h4>{{ fav.fullName }}</h4>
                                <p>{{ fav.skill_name }}</p>
                                <div class="rating">
                                    <span class="stars">{{ getRatingStars(fav.average_rating) }}</span>
                                    <span>({{ fav.total_ratings }})</span>
                                </div>
                            </div>
                            <div class="favorite-actions">
                                <button @click="viewProfile(fav.skilled_id)" class="view-btn" title="View Profile">
                                    👁️
                                </button>
                                <button @click="bookNow(fav.skilled_id)" class="book-btn" title="Book Now">
                                    📅
                                </button>
                                <button @click="removeFavorite(fav.skilled_id)" class="remove-fav" title="Remove">
                                    ×
                                </button>
                            </div>
                        </div>
                    </div>
                    <div v-else class="empty-state">
                        <p>No favorites yet</p>
                        <router-link to="/dashboard" class="browse-link">Browse Professionals</router-link>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteConfirm" class="modal">
            <div class="modal-content">
                <h3>Delete Account</h3>
                <p>This action cannot be undone. Please enter your password to confirm.</p>
                <input type="password" v-model="deletePassword" placeholder="Enter your password" class="modal-input">
                <div class="modal-actions">
                    <button @click="confirmDelete" class="btn-delete">Delete</button>
                    <button @click="showDeleteConfirm = false" class="btn-cancel">Cancel</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import noSearchNavbar from '@/components/noSearchNavbar.vue'
import {
    getUserProfile,
    updateUserProfile,
    changePassword,
    updateNotificationSettings,
    uploadUserProfileImage,
    deleteAccount
} from '@/api/userService'
import { getFavorites, removeFromFavorites } from '@/api/favoritesService'
import { getCities, getBarangays } from '@/utils/locationService'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const user = ref(null)
const settings = ref({})
const favorites = ref([])
const activeTab = ref('profile')
const editMode = ref(false)
const showDeleteConfirm = ref(false)
const deletePassword = ref('')
const fileInput = ref(null)

// Stats
const stats = ref({
    bookings: 0,
    reviews: 0,
    favorites: 0
})

// Available cities from location service
const cities = getCities()

// Available barangays based on selected city
const availableBarangays = computed(() => {
    if (!editForm.city) return []
    return getBarangays(editForm.city)
})

// Edit form
const editForm = reactive({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    barangay: '',
    city: ''
})

// Password form
const passwordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})

const baseURL = import.meta.env.VITE_BASE_URL
// Profile image URL
const profileImageUrl = computed(() => {
    if (!user.value?.profile_image) return '/default-avatar.png'
    let imagePath = user.value.profile_image.replace(/\\/g, '/')
    if (!imagePath.startsWith('/uploads')) {
        imagePath = `/uploads/${imagePath.split('/').pop()}`
    }
    return `${baseURL}${imagePath}`
})

// Password strength
const passwordStrength = computed(() => {
    const pwd = passwordForm.newPassword
    if (!pwd) return 0
    let strength = 0
    if (pwd.length >= 8) strength += 25
    if (/[A-Z]/.test(pwd)) strength += 25
    if (/[0-9]/.test(pwd)) strength += 25
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 25
    return strength
})

const passwordStrengthClass = computed(() => {
    if (passwordStrength.value < 50) return 'weak'
    if (passwordStrength.value < 75) return 'medium'
    return 'strong'
})

const passwordStrengthText = computed(() => {
    if (passwordStrength.value < 50) return 'Weak'
    if (passwordStrength.value < 75) return 'Medium'
    return 'Strong'
})

const passwordMismatch = computed(() => {
    return passwordForm.newPassword && passwordForm.confirmPassword &&
        passwordForm.newPassword !== passwordForm.confirmPassword
})

// Reset location selection when city changes
const onCityChange = () => {
    editForm.barangay = ''
}

// Load user data
const loadUserData = async () => {
    try {
        loading.value = true
        const data = await getUserProfile()
        user.value = data.user
        settings.value = data.settings

        // Set edit form values
        editForm.firstName = data.user.firstName
        editForm.lastName = data.user.lastName
        editForm.phone = data.user.phone || ''
        editForm.bio = data.user.bio || ''
        editForm.barangay = data.user.barangay || ''
        editForm.city = data.user.city || ''

        // Load favorites
        await loadFavorites()

        // Load stats
        await loadStats()
    } catch (error) {
        console.error('Error loading profile:', error)
    } finally {
        loading.value = false
    }
}

// Load favorites
const loadFavorites = async () => {
    try {
        const response = await getFavorites()
        favorites.value = response.favorites
        stats.value.favorites = response.favorites.length
    } catch (error) {
        console.error('Error loading favorites:', error)
    }
}

// Load stats (implement when endpoints are ready)
const loadStats = async () => {
    try {
        // TODO: Add endpoints for bookings count and reviews count
        // For now, keep as 0
    } catch (error) {
        console.error('Error loading stats:', error)
    }
}

// Profile image upload
const triggerImageUpload = () => {
    fileInput.value.click()
}

const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
        const response = await uploadUserProfileImage(file)
        user.value.profile_image = response.imageUrl
        alert('Profile image updated successfully!')
    } catch (error) {
        console.error('Error uploading image:', error)
        alert('Failed to upload image')
    }
}

// Profile editing
const startEdit = () => {
    editMode.value = true
}

const cancelEdit = () => {
    editMode.value = false
    editForm.firstName = user.value.firstName
    editForm.lastName = user.value.lastName
    editForm.phone = user.value.phone || ''
    editForm.bio = user.value.bio || ''
    editForm.barangay = user.value.barangay || ''
    editForm.city = user.value.city || ''
}

const saveProfile = async () => {
    try {
        const response = await updateUserProfile({
            firstName: editForm.firstName,
            lastName: editForm.lastName,
            phone: editForm.phone,
            bio: editForm.bio,
            barangay: editForm.barangay,
            city: editForm.city
        })
        user.value = response.user
        editMode.value = false
        alert('Profile updated successfully!')
    } catch (error) {
        console.error('Error saving profile:', error)
        alert(error.response?.data?.message || 'Failed to update profile')
    }
}

// Change password
const changeUserPassword = async () => {
    if (passwordMismatch.value) return

    try {
        await changePassword({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
        })

        // Clear form
        passwordForm.currentPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''

        alert('Password changed successfully')
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to change password')
    }
}

// Save notification settings
const saveSettings = async () => {
    try {
        const response = await updateNotificationSettings(settings.value)
        settings.value = response.settings
        alert('Settings saved successfully')
    } catch (error) {
        console.error('Error saving settings:', error)
    }
}

// Delete account
const confirmDelete = async () => {
    try {
        await deleteAccount(deletePassword.value)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete account')
    }
}

// Remove favorite
const removeFavorite = async (skilledId) => {
    if (!confirm('Remove this professional from your favorites?')) return

    try {
        await removeFromFavorites(skilledId)
        await loadFavorites()
        alert('Removed from favorites')
    } catch (error) {
        console.error('Error removing favorite:', error)
        alert('Failed to remove from favorites')
    }
}

// Format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

// View profile
const viewProfile = (skilledId) => {
    router.push(`/skilled-profile/${skilledId}`)
}

// Book now
const bookNow = (skilledId) => {
    router.push(`/booking/${skilledId}`)
}

// Get rating stars
const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating || 0)
    return '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars)
}

// Get worker image
const getWorkerImage = (imagePath) => {
    if (!imagePath) return '/default-avatar.png'
    let formattedPath = imagePath.replace(/\\/g, '/')
    if (!formattedPath.startsWith('/uploads')) {
        formattedPath = `/uploads/${formattedPath.split('/').pop()}`
    }
    return `http://192.191.5.169:3000${formattedPath}`
}

onMounted(() => {
    loadUserData()

    // Check for tab parameter in URL
    const tabParam = route.query.tab
    if (tabParam === 'security') {
        activeTab.value = 'security'
    } else if (tabParam === 'notifications') {
        activeTab.value = 'notifications'
    } else if (tabParam === 'favorites') {
        activeTab.value = 'favorites'
    }
})
</script>

<style scoped>
/* Add these new styles for location dropdowns */
.location-select {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 1rem;
    background: white;
    transition: all 0.3s;
    cursor: pointer;
}

.location-select:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.location-select:disabled {
    background: #f8fafc;
    cursor: not-allowed;
    opacity: 0.7;
}

.form-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.form-group.half {
    flex: 1;
    margin-bottom: 0;
}

.form-textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 1rem;
    resize: vertical;
    font-family: inherit;
    transition: all 0.3s;
}

.form-textarea:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.bio-text {
    white-space: pre-wrap;
    line-height: 1.6;
}

/* Keep all your existing styles below */
.profile-page {
    min-height: 100vh;
    background: #f8fafc;
}

.profile-container {
    max-width: 1200px;
    margin: 80px auto 2rem;
    padding: 0 1.5rem;
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
}

/* Sidebar */
.profile-sidebar {
    position: sticky;
    top: 100px;
    height: fit-content;
}

.profile-card {
    background: white;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.profile-image-section {
    text-align: center;
    margin-bottom: 1.5rem;
}

.profile-image-wrapper {
    position: relative;
    width: 120px;
    height: 120px;
    margin: 0 auto 1rem;
}

.profile-image {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #4f46e5;
}

.image-upload-btn {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 36px;
    height: 36px;
    background: #4f46e5;
    border: 2px solid white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
}

.image-upload-btn:hover {
    background: #4338ca;
    transform: scale(1.1);
}

.camera-icon {
    color: white;
    font-size: 1.1rem;
}

.hidden-input {
    display: none;
}

.user-role {
    display: inline-block;
    padding: 0.3rem 1rem;
    border-radius: 30px;
    font-size: 0.85rem;
    font-weight: 500;
    margin-top: 0.5rem;
}

.user-role.skilled {
    background: #d1fae5;
    color: #065f46;
}

.user-role.resident {
    background: #e0e7ff;
    color: #4f46e5;
}

.user-role.admin {
    background: #fee2e2;
    color: #991b1b;
}

/* Stats */
.profile-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 1.5rem 0;
    border-top: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 1.5rem;
}

.stat-item {
    text-align: center;
}

.stat-value {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
}

.stat-label {
    font-size: 0.85rem;
    color: #64748b;
}

/* Menu */
.profile-menu {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    color: #64748b;
    cursor: pointer;
    transition: all 0.3s;
    text-align: left;
    width: 100%;
}

.menu-item:hover {
    background: #f1f5f9;
    color: #1e293b;
}

.menu-item.active {
    background: #e0e7ff;
    color: #4f46e5;
    font-weight: 500;
}

.menu-icon {
    font-size: 1.2rem;
}

/* Content */
.content-card {
    background: white;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    margin-bottom: 1.5rem;
}

.content-card h2 {
    color: #1e293b;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
}

/* Info Display */
.info-row {
    display: flex;
    padding: 1rem 0;
    border-bottom: 1px solid #e2e8f0;
}

.info-row:last-child {
    border-bottom: none;
}

.info-label {
    width: 140px;
    color: #64748b;
}

.info-value {
    flex: 1;
    color: #1e293b;
    font-weight: 500;
}

.btn-edit {
    margin-top: 1.5rem;
    padding: 0.75rem 2rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-edit:hover {
    background: #4338ca;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
}

/* Edit Form */
.edit-form {
    animation: slideIn 0.3s ease;
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

.form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.3s;
}

.form-input:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-actions {
    display: flex;
    gap: 1rem;
}

.btn-save {
    flex: 2;
    padding: 0.75rem;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-save:hover {
    background: #059669;
}

.btn-cancel {
    flex: 1;
    padding: 0.75rem;
    background: #f1f5f9;
    color: #64748b;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-cancel:hover {
    background: #e2e8f0;
}

/* Password Form */
.password-form {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #e2e8f0;
}

.password-form h3 {
    color: #1e293b;
    margin-bottom: 1rem;
    font-size: 1.2rem;
}

.password-strength {
    margin-top: 0.5rem;
}

.strength-bar {
    height: 6px;
    background: #e2e8f0;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 0.25rem;
}

.strength-fill {
    height: 100%;
    transition: width 0.3s;
}

.strength-fill.weak {
    background: #ef4444;
}

.strength-fill.medium {
    background: #f59e0b;
}

.strength-fill.strong {
    background: #10b981;
}

.error-text {
    color: #ef4444;
    font-size: 0.85rem;
    margin-top: 0.25rem;
    display: block;
}

/* Danger Zone */
.danger-zone {
    padding: 1.5rem;
    background: #fef2f2;
    border-radius: 12px;
}

.danger-zone h3 {
    color: #991b1b;
    margin-bottom: 0.5rem;
}

.danger-zone p {
    color: #b91c1c;
    margin-bottom: 1rem;
    font-size: 0.9rem;
}

.btn-delete {
    padding: 0.75rem 1.5rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-delete:hover {
    background: #dc2626;
}

/* Settings */
.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 0;
    border-bottom: 1px solid #e2e8f0;
}

.setting-item:last-child {
    border-bottom: none;
}

.setting-item h4 {
    color: #1e293b;
    margin-bottom: 0.25rem;
    font-size: 1rem;
}

.setting-item p {
    color: #64748b;
    font-size: 0.9rem;
}

/* Toggle Switch */
.switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #cbd5e1;
    transition: .3s;
    border-radius: 24px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: .3s;
    border-radius: 50%;
}

input:checked+.slider {
    background-color: #4f46e5;
}

input:checked+.slider:before {
    transform: translateX(26px);
}

.language-select,
.theme-select {
    padding: 0.5rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.95rem;
    color: #1e293b;
    outline: none;
    transition: all 0.3s;
}

.language-select:focus,
.theme-select:focus {
    border-color: #4f46e5;
}

/* Favorites Grid */
.favorites-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
}

.favorite-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 12px;
    position: relative;
    transition: all 0.3s;
}

.favorite-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.favorite-card img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
}

.favorite-info {
    flex: 1;
}

.favorite-info h4 {
    color: #1e293b;
    margin-bottom: 0.25rem;
    font-size: 1rem;
}

.favorite-info p {
    color: #64748b;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
}

.rating {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.85rem;
}

.stars {
    color: #ffc107;
}

.favorite-actions {
    display: flex;
    gap: 0.5rem;
}

.view-btn,
.book-btn,
.remove-fav {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 1rem;
}

.view-btn {
    background: #e0e7ff;
    color: #4f46e5;
}

.view-btn:hover {
    background: #c7d2fe;
    transform: scale(1.1);
}

.book-btn {
    background: #d1fae5;
    color: #10b981;
}

.book-btn:hover {
    background: #a7f3d0;
    transform: scale(1.1);
}

.remove-fav {
    background: #fee2e2;
    color: #ef4444;
}

.remove-fav:hover {
    background: #fecaca;
    transform: scale(1.1);
}

.empty-state {
    text-align: center;
    padding: 3rem;
    color: #64748b;
}

.browse-link {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.75rem 2rem;
    background: #4f46e5;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s;
}

.browse-link:hover {
    background: #4338ca;
    transform: translateY(-2px);
}

/* Modal */
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
}

.modal-content h3 {
    color: #1e293b;
    margin-bottom: 1rem;
}

.modal-input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    margin: 1rem 0;
}

.modal-actions {
    display: flex;
    gap: 1rem;
}

/* Animations */
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive */
@media (max-width: 768px) {
    .profile-container {
        grid-template-columns: 1fr;
    }

    .profile-sidebar {
        position: static;
    }

    .info-row {
        flex-direction: column;
        gap: 0.25rem;
    }

    .info-label {
        width: auto;
    }

    .form-actions {
        flex-direction: column;
    }

    .form-row {
        flex-direction: column;
        gap: 1rem;
    }

    .setting-item {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }

    .favorites-grid {
        grid-template-columns: 1fr;
    }
}
</style>