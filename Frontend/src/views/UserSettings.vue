<!-- frontend/src/views/UserSettings.vue -->
<template>
    <div class="user-settings-page">
        <noSearchNavbar />

        <div class="settings-container">
            <div class="settings-header">
                <h1>Settings</h1>
                <p>Manage your account preferences and notifications</p>
            </div>

            <div class="settings-layout">
                <!-- Sidebar Navigation -->
                <div class="settings-sidebar">
                    <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
                        :class="['sidebar-tab', { active: activeTab === tab.id }]">
                        <span class="tab-icon">{{ tab.icon }}</span>
                        <span class="tab-label">{{ tab.label }}</span>
                        <span v-if="tab.comingSoon" class="coming-soon-badge">Soon</span>
                    </button>
                </div>

                <!-- Main Content -->
                <div class="settings-content">
                    <!-- Loading State -->
                    <div v-if="loading" class="loading-state">
                        <div class="spinner"></div>
                        <p>Loading settings...</p>
                    </div>

                    <!-- Notification Settings -->
                    <div v-if="activeTab === 'notifications'" class="settings-section">
                        <h2>Notification Preferences</h2>
                        <p class="section-desc">Choose how you want to be notified</p>

                        <div class="settings-group">
                            <div class="setting-item available">
                                <div class="setting-info">
                                    <h3>Email Notifications</h3>
                                    <p>Receive updates and alerts via email</p>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" v-model="settings.email_notifications">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <div class="setting-item available">
                                <div class="setting-info">
                                    <h3>Push Notifications</h3>
                                    <p>Receive browser notifications</p>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" v-model="settings.push_notifications">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <div class="setting-item available">
                                <div class="setting-info">
                                    <h3>SMS Notifications</h3>
                                    <p>Receive text message alerts</p>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" v-model="settings.sms_notifications">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <div class="setting-item coming-soon">
                                <div class="setting-info">
                                    <h3>Notification Sound</h3>
                                    <p>Play sound when receiving notifications</p>
                                    <span class="coming-badge">Coming Soon</span>
                                </div>
                                <label class="toggle-switch disabled">
                                    <input type="checkbox" disabled>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <div class="setting-item coming-soon">
                                <div class="setting-info">
                                    <h3>Message Preview</h3>
                                    <p>Show message content in notifications</p>
                                    <span class="coming-badge">Coming Soon</span>
                                </div>
                                <label class="toggle-switch disabled">
                                    <input type="checkbox" disabled>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <div class="setting-item coming-soon">
                                <div class="setting-info">
                                    <h3>Email Frequency</h3>
                                    <p>Choose how often to receive email updates</p>
                                    <span class="coming-badge">Coming Soon</span>
                                </div>
                                <select disabled class="disabled-select">
                                    <option>Instant</option>
                                    <option>Daily Digest</option>
                                    <option>Weekly Summary</option>
                                </select>
                            </div>
                        </div>

                        <button @click="saveSettings" class="save-btn" :disabled="saving">
                            {{ saving ? 'Saving...' : 'Save Changes' }}
                        </button>
                    </div>

                    <!-- Privacy & Security -->
                    <div v-if="activeTab === 'privacy'" class="settings-section">
                        <h2>Privacy & Security</h2>
                        <p class="section-desc">Control your privacy and security preferences</p>

                        <div class="settings-group">
                            <div class="setting-item available">
                                <div class="setting-info">
                                    <h3>Show Online Status</h3>
                                    <p>Let others see when you're online</p>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" v-model="settings.show_online_status">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <div class="setting-item available">
                                <div class="setting-info">
                                    <h3>Allow Messages From</h3>
                                    <p>Control who can send you messages</p>
                                </div>
                                <select v-model="settings.allow_messages_from" class="setting-select">
                                    <option value="everyone">Everyone</option>
                                    <option value="only_booked">Only Booked Professionals</option>
                                    <option value="none">No One</option>
                                </select>
                            </div>

                            <div class="setting-item coming-soon">
                                <div class="setting-info">
                                    <h3>Hide Email Address</h3>
                                    <p>Hide your email from public profile</p>
                                    <span class="coming-badge">Coming Soon</span>
                                </div>
                                <label class="toggle-switch disabled">
                                    <input type="checkbox" disabled>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <div class="setting-item coming-soon">
                                <div class="setting-info">
                                    <h3>Hide Phone Number</h3>
                                    <p>Hide your phone number from public profile</p>
                                    <span class="coming-badge">Coming Soon</span>
                                </div>
                                <label class="toggle-switch disabled">
                                    <input type="checkbox" disabled>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <div class="setting-item coming-soon">
                                <div class="setting-info">
                                    <h3>Two-Factor Authentication</h3>
                                    <p>Add an extra layer of security to your account</p>
                                    <span class="coming-badge">Coming Soon</span>
                                </div>
                                <button class="disabled-btn" disabled>Enable 2FA</button>
                            </div>

                            <div class="setting-item coming-soon">
                                <div class="setting-info">
                                    <h3>Login Alerts</h3>
                                    <p>Get notified when someone logs into your account</p>
                                    <span class="coming-badge">Coming Soon</span>
                                </div>
                                <label class="toggle-switch disabled">
                                    <input type="checkbox" disabled>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <div class="setting-item coming-soon">
                                <div class="setting-info">
                                    <h3>Read Receipts</h3>
                                    <p>Show when you've read messages</p>
                                    <span class="coming-badge">Coming Soon</span>
                                </div>
                                <label class="toggle-switch disabled">
                                    <input type="checkbox" disabled>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <button @click="saveSettings" class="save-btn" :disabled="saving">
                            {{ saving ? 'Saving...' : 'Save Changes' }}
                        </button>
                    </div>

                    <!-- Appearance -->
                    <div v-if="activeTab === 'appearance'" class="settings-section">
                        <h2>Appearance</h2>
                        <p class="section-desc">Customize how the platform looks</p>

                        <div class="settings-group">
                            <div class="setting-item available">
                                <div class="setting-info">
                                    <h3>Theme</h3>
                                    <p>Choose your preferred color scheme</p>
                                </div>
                                <div class="theme-selector">
                                    <button @click="settings.theme = 'light'"
                                        :class="['theme-option', { active: settings.theme === 'light' }]">
                                        <span class="theme-preview light"></span>
                                        Light
                                    </button>
                                    <button @click="settings.theme = 'dark'"
                                        :class="['theme-option', { active: settings.theme === 'dark' }]">
                                        <span class="theme-preview dark"></span>
                                        Dark
                                    </button>
                                    <button @click="settings.theme = 'system'"
                                        :class="['theme-option', { active: settings.theme === 'system' }]">
                                        <span class="theme-preview system"></span>
                                        System
                                    </button>
                                </div>
                            </div>

                            <div class="setting-item available">
                                <div class="setting-info">
                                    <h3>Language</h3>
                                    <p>Choose your preferred language</p>
                                </div>
                                <select v-model="settings.language" class="setting-select">
                                    <option value="en">English</option>
                                    <option value="fil">Filipino</option>
                                    <option value="ceb">Cebuano</option>
                                    <option value="ilo">Ilocano</option>
                                </select>
                            </div>

                            <div class="setting-item coming-soon">
                                <div class="setting-info">
                                    <h3>Date Format</h3>
                                    <p>Choose how dates are displayed</p>
                                    <span class="coming-badge">Coming Soon</span>
                                </div>
                                <select disabled class="disabled-select">
                                    <option>MM/DD/YYYY</option>
                                    <option>DD/MM/YYYY</option>
                                    <option>YYYY-MM-DD</option>
                                </select>
                            </div>

                            <div class="setting-item coming-soon">
                                <div class="setting-info">
                                    <h3>Time Format</h3>
                                    <p>Choose 12-hour or 24-hour format</p>
                                    <span class="coming-badge">Coming Soon</span>
                                </div>
                                <select disabled class="disabled-select">
                                    <option>12-hour (AM/PM)</option>
                                    <option>24-hour</option>
                                </select>
                            </div>

                            <div class="setting-item coming-soon">
                                <div class="setting-info">
                                    <h3>Font Size</h3>
                                    <p>Adjust text size for better readability</p>
                                    <span class="coming-badge">Coming Soon</span>
                                </div>
                                <select disabled class="disabled-select">
                                    <option>Small</option>
                                    <option>Medium</option>
                                    <option>Large</option>
                                </select>
                            </div>

                            <div class="setting-item coming-soon">
                                <div class="setting-info">
                                    <h3>Compact Mode</h3>
                                    <p>Show more content with less spacing</p>
                                    <span class="coming-badge">Coming Soon</span>
                                </div>
                                <label class="toggle-switch disabled">
                                    <input type="checkbox" disabled>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <button @click="saveSettings" class="save-btn" :disabled="saving">
                            {{ saving ? 'Saving...' : 'Save Changes' }}
                        </button>
                    </div>

                    <!-- Booking Preferences (Resident) -->
                    <div v-if="activeTab === 'booking' && user?.role === 'resident'" class="settings-section">
                        <h2>Booking Preferences</h2>
                        <p class="section-desc">Customize your booking experience</p>

                        <div class="settings-group">
                            <div class="setting-item coming-soon">
                                <div class="setting-info">
                                    <h3>Preferred Payment Method</h3>
                                    <p>Set your default payment method</p>
                                    <span class="coming-badge">Coming Soon</span>
                                </div>
                                <select disabled class="disabled-select">
                                    <option>Cash</option>
                                    <option>GCash</option>
                                    <option>Bank Transfer</option>
                                </select>
                            </div>

                            <div class="setting-item coming-soon">
                                <div class="setting-info">
                                    <h3>Default Duration</h3>
                                    <p>Set default booking duration</p>
                                    <span class="coming-badge">Coming Soon</span>
                                </div>
                                <select disabled class="disabled-select">
                                    <option>1 hour</option>
                                    <option>2 hours</option>
                                    <option>3 hours</option>
                                    <option>4 hours</option>
                                </select>
                            </div>

                            <div class="setting-item coming-soon">
                                <div class="setting-info">
                                    <h3>Auto-confirm Bookings</h3>
                                    <p>Automatically confirm bookings with trusted professionals</p>
                                    <span class="coming-badge">Coming Soon</span>
                                </div>
                                <label class="toggle-switch disabled">
                                    <input type="checkbox" disabled>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <button class="save-btn disabled" disabled>Save Changes (Coming Soon)</button>
                    </div>

                    <!-- Work Preferences (Skilled) -->
                    <div v-if="activeTab === 'work' && user?.role === 'skilled'" class="settings-section">
                        <h2>Work Preferences</h2>
                        <p class="section-desc">Customize your work settings</p>

                        <div class="settings-group">
                            <div class="setting-item coming-soon">
                                <div class="setting-info">
                                    <h3>Booking Buffer Time</h3>
                                    <p>Time needed between bookings</p>
                                    <span class="coming-badge">Coming Soon</span>
                                </div>
                                <select disabled class="disabled-select">
                                    <option>30 minutes</option>
                                    <option>1 hour</option>
                                    <option>2 hours</option>
                                </select>
                            </div>

                            <div class="setting-item coming-soon">
                                <div class="setting-info">
                                    <h3>Max Travel Distance</h3>
                                    <p>Maximum distance you're willing to travel</p>
                                    <span class="coming-badge">Coming Soon</span>
                                </div>
                                <select disabled class="disabled-select">
                                    <option>5 km</option>
                                    <option>10 km</option>
                                    <option>15 km</option>
                                    <option>No limit</option>
                                </select>
                            </div>

                            <div class="setting-item coming-soon">
                                <div class="setting-info">
                                    <h3>Auto-accept Bookings</h3>
                                    <p>Automatically accept booking requests</p>
                                    <span class="coming-badge">Coming Soon</span>
                                </div>
                                <label class="toggle-switch disabled">
                                    <input type="checkbox" disabled>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <div class="setting-item coming-soon">
                                <div class="setting-info">
                                    <h3>Default Hourly Rate</h3>
                                    <p>Set your default rate for new services</p>
                                    <span class="coming-badge">Coming Soon</span>
                                </div>
                                <input type="number" disabled placeholder="₱500" class="disabled-input">
                            </div>
                        </div>

                        <button class="save-btn disabled" disabled>Save Changes (Coming Soon)</button>
                    </div>

                    <!-- Payments -->
                    <div v-if="activeTab === 'payments'" class="settings-section">
                        <h2>Payment Methods</h2>
                        <p class="section-desc">Manage your payment options</p>

                        <div class="settings-group">
                            <div class="coming-soon-card">
                                <div class="card-icon">💳</div>
                                <div class="card-content">
                                    <h3>GCash Integration Coming Soon</h3>
                                    <p>Soon you'll be able to add and manage your GCash account for seamless payments
                                    </p>
                                    <div class="feature-list">
                                        <span>✓ Instant payments</span>
                                        <span>✓ QR code payments</span>
                                        <span>✓ Transaction history</span>
                                    </div>
                                </div>
                                <span class="coming-badge large">Coming Soon</span>
                            </div>

                            <div class="coming-soon-card">
                                <div class="card-icon">🏦</div>
                                <div class="card-content">
                                    <h3>Bank Transfer Coming Soon</h3>
                                    <p>Add your bank account details for direct transfers</p>
                                </div>
                                <span class="coming-badge large">Coming Soon</span>
                            </div>

                            <div class="coming-soon-card">
                                <div class="card-icon">💵</div>
                                <div class="card-content">
                                    <h3>Cash Payments</h3>
                                    <p>Cash payments are currently supported for all bookings</p>
                                </div>
                                <span class="available-badge">Available</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Success Message -->
        <transition name="fade">
            <div v-if="showSuccess" class="success-toast">
                <span class="success-icon">✓</span>
                Settings saved successfully!
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import noSearchNavbar from '@/components/noSearchNavbar.vue'
import { getUserProfile, updateUserProfile, updateNotificationSettings } from '@/api/userService'

const router = useRouter()
const loading = ref(true)
const saving = ref(false)
const showSuccess = ref(false)
const user = ref(null)
const activeTab = ref('notifications')

const settings = reactive({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    language: 'en',
    theme: 'light',
    show_online_status: true,
    allow_messages_from: 'everyone'
})

const tabs = [
    { id: 'notifications', label: 'Notifications', icon: '🔔', comingSoon: false },
    { id: 'privacy', label: 'Privacy & Security', icon: '🔒', comingSoon: false },
    { id: 'appearance', label: 'Appearance', icon: '🎨', comingSoon: false },
    { id: 'booking', label: 'Booking Preferences', icon: '📅', comingSoon: true },
    { id: 'work', label: 'Work Preferences', icon: '💼', comingSoon: true },
    { id: 'payments', label: 'Payments', icon: '💰', comingSoon: true }
]

// Load user data
const loadUserData = async () => {
    loading.value = true
    try {
        const data = await getUserProfile()
        user.value = data.user
        if (data.settings) {
            settings.email_notifications = data.settings.email_notifications ?? true
            settings.push_notifications = data.settings.push_notifications ?? true
            settings.sms_notifications = data.settings.sms_notifications ?? false
            settings.language = data.settings.language || 'en'
            settings.theme = data.settings.theme || 'light'
            // Apply theme
            applyTheme(settings.theme)
        }
    } catch (error) {
        console.error('Error loading user data:', error)
    } finally {
        loading.value = false
    }
}

// Apply theme
const applyTheme = (theme) => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
}

// Save settings
const saveSettings = async () => {
    saving.value = true
    try {
        await updateNotificationSettings({
            email_notifications: settings.email_notifications,
            push_notifications: settings.push_notifications,
            sms_notifications: settings.sms_notifications,
            language: settings.language,
            theme: settings.theme
        })

        // Also update user profile if needed
        if (user.value) {
            await updateUserProfile({
                firstName: user.value.firstName,
                lastName: user.value.lastName,
                phone: user.value.phone
            })
        }

        applyTheme(settings.theme)
        showSuccess.value = true
        setTimeout(() => {
            showSuccess.value = false
        }, 3000)
    } catch (error) {
        console.error('Error saving settings:', error)
        alert('Failed to save settings')
    } finally {
        saving.value = false
    }
}

onMounted(() => {
    loadUserData()
})
</script>

<style scoped>
.user-settings-page {
    min-height: 100vh;
    background: #f8fafc;
}

.settings-container {
    max-width: 1200px;
    margin: 80px auto 2rem;
    padding: 0 1.5rem;
}

.settings-header {
    margin-bottom: 2rem;
}

.settings-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
}

.settings-header p {
    color: #64748b;
}

.settings-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2rem;
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

/* Sidebar */
.settings-sidebar {
    background: #f8fafc;
    padding: 1.5rem;
    border-right: 1px solid #e2e8f0;
}

.sidebar-tab {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    border-radius: 12px;
    font-size: 0.95rem;
    color: #475569;
    cursor: pointer;
    transition: all 0.3s;
    margin-bottom: 0.25rem;
    position: relative;
}

.sidebar-tab:hover {
    background: #f1f5f9;
    color: #1e293b;
}

.sidebar-tab.active {
    background: #eef2ff;
    color: #4f46e5;
}

.tab-icon {
    font-size: 1.2rem;
}

.tab-label {
    flex: 1;
    text-align: left;
}

.coming-soon-badge {
    font-size: 0.65rem;
    padding: 0.2rem 0.4rem;
    background: #e2e8f0;
    border-radius: 4px;
    color: #64748b;
}

/* Content */
.settings-content {
    padding: 2rem;
}

.settings-section h2 {
    font-size: 1.5rem;
    color: #1e293b;
    margin-bottom: 0.5rem;
}

.section-desc {
    color: #64748b;
    margin-bottom: 2rem;
}

.settings-group {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid #e2e8f0;
}

.setting-item:last-child {
    border-bottom: none;
}

.setting-info {
    flex: 1;
}

.setting-info h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.25rem;
}

.setting-info p {
    font-size: 0.85rem;
    color: #64748b;
}

/* Toggle Switch */
.toggle-switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
}

.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-switch.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #cbd5e1;
    transition: 0.3s;
    border-radius: 24px;
}

.toggle-slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
}

input:checked+.toggle-slider {
    background-color: #4f46e5;
}

input:checked+.toggle-slider:before {
    transform: translateX(26px);
}

/* Selects */
.setting-select,
.disabled-select {
    padding: 0.5rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.9rem;
    background: white;
    min-width: 180px;
}

.disabled-select,
.disabled-input,
.disabled-btn {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f1f5f9;
}

.disabled-input {
    padding: 0.5rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    width: 180px;
}

/* Theme Selector */
.theme-selector {
    display: flex;
    gap: 0.5rem;
}

.theme-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: none;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
}

.theme-option.active {
    border-color: #4f46e5;
    background: #eef2ff;
}

.theme-preview {
    width: 40px;
    height: 40px;
    border-radius: 8px;
}

.theme-preview.light {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.theme-preview.dark {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.theme-preview.system {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}

/* Coming Soon Badge */
.coming-badge {
    display: inline-block;
    margin-top: 0.25rem;
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    background: #fef3c7;
    color: #f59e0b;
    border-radius: 4px;
}

.coming-badge.large {
    padding: 0.3rem 0.8rem;
    font-size: 0.75rem;
}

.available-badge {
    display: inline-block;
    padding: 0.3rem 0.8rem;
    background: #d1fae5;
    color: #10b981;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
}

/* Coming Soon Card */
.coming-soon-card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 12px;
    margin-bottom: 1rem;
}

.card-icon {
    font-size: 2rem;
}

.card-content {
    flex: 1;
}

.card-content h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.5rem;
}

.card-content p {
    font-size: 0.85rem;
    color: #64748b;
    margin-bottom: 0.5rem;
}

.feature-list {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
}

.feature-list span {
    font-size: 0.8rem;
    color: #10b981;
}

/* Save Button */
.save-btn {
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.save-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
}

.save-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.save-btn.disabled {
    background: #e2e8f0;
    color: #94a3b8;
}

/* Loading State */
.loading-state {
    text-align: center;
    padding: 4rem;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top-color: #4f46e5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Success Toast */
.success-toast {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: #10b981;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 1000;
    animation: slideIn 0.3s ease;
}

.success-icon {
    font-size: 1.2rem;
    font-weight: bold;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(100%);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
    .settings-layout {
        grid-template-columns: 1fr;
    }

    .settings-sidebar {
        border-right: none;
        border-bottom: 1px solid #e2e8f0;
        overflow-x: auto;
        padding: 1rem;
    }

    .sidebar-tab {
        display: inline-flex;
        width: auto;
        margin-right: 0.5rem;
    }

    .setting-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .theme-selector {
        width: 100%;
    }

    .theme-option {
        flex: 1;
    }
}
</style>