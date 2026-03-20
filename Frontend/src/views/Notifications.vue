<template>
    <div class="notifications-page">
        <noSearchNavbar />

        <div class="notifications-container">
            <div class="page-header">
                <h1>Notifications</h1>
                <div class="header-actions">
                    <button v-if="notifications.some(n => !n.is_read)" @click="markAllAsRead" class="mark-all-btn"
                        :disabled="loading">
                        Mark All as Read
                    </button>
                    <button @click="refreshNotifications" class="refresh-btn" :disabled="loading">
                        ⟳ Refresh
                    </button>
                </div>
            </div>

            <!-- Filter Tabs -->
            <div class="filter-tabs">
                <button @click="filterType = 'all'" :class="['tab-btn', { active: filterType === 'all' }]">
                    All ({{ counts.all }})
                </button>
                <button @click="filterType = 'unread'" :class="['tab-btn', { active: filterType === 'unread' }]">
                    Unread ({{ counts.unread }})
                </button>
                <button @click="filterType = 'booking'" :class="['tab-btn', { active: filterType === 'booking' }]">
                    Bookings
                </button>
                <button @click="filterType = 'review'" :class="['tab-btn', { active: filterType === 'review' }]">
                    Reviews
                </button>
                <button @click="filterType = 'payment'" :class="['tab-btn', { active: filterType === 'payment' }]">
                    Payments
                </button>
                <button @click="filterType = 'message'" :class="['tab-btn', { active: filterType === 'message' }]">
                    Messages
                </button>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
                <div class="spinner"></div>
                <p>Loading notifications...</p>
            </div>

            <!-- Notifications List -->
            <div v-else-if="filteredNotifications.length > 0" class="notifications-list">
                <div v-for="notification in filteredNotifications" :key="notification.notification_id"
                    class="notification-item" :class="{ unread: !notification.is_read }">
                    <div class="notification-icon" :class="notification.type">
                        {{ getNotificationIcon(notification.type) }}
                    </div>

                    <div class="notification-content" @click="handleNotificationClick(notification)">
                        <div class="notification-header">
                            <h3>{{ notification.title }}</h3>
                            <span class="notification-time">{{ formatTime(notification.created_at) }}</span>
                        </div>
                        <p class="notification-message">{{ notification.message }}</p>

                        <!-- Metadata based on notification type -->
                        <div v-if="notification.data" class="notification-meta">
                            <span v-if="notification.type === 'booking'" class="meta-badge booking">
                                Booking #{{ JSON.parse(notification.data).booking_id }}
                            </span>
                            <span v-if="notification.type === 'review'" class="meta-badge review">
                                Review
                            </span>
                            <span v-if="notification.type === 'payment'" class="meta-badge payment">
                                Payment
                            </span>
                            <span class="notification-type">{{ getNotificationTypeLabel(notification.type) }}</span>
                        </div>
                    </div>

                    <div class="notification-actions">
                        <button v-if="!notification.is_read" @click="markAsRead(notification.notification_id)"
                            class="mark-read-btn" title="Mark as read">
                            ✓
                        </button>
                        <button @click="deleteNotification(notification.notification_id)" class="delete-btn"
                            title="Delete">
                            ×
                        </button>
                    </div>
                </div>

                <!-- Load More -->
                <div v-if="hasMore" class="load-more">
                    <button @click="loadMore" class="load-more-btn" :disabled="loading">
                        Load More Notifications
                    </button>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-state">
                <div class="empty-icon">🔔</div>
                <h3>No notifications</h3>
                <p>You don't have any {{ filterType !== 'all' ? filterType : '' }} notifications at the moment.</p>
                <button v-if="filterType !== 'all'" @click="filterType = 'all'" class="clear-filter-btn">
                    View All Notifications
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import noSearchNavbar from '@/components/noSearchNavbar.vue'
import {
    getNotifications,
    getUnreadCount,
    markAsRead as apiMarkAsRead,
    markAllAsRead as apiMarkAllAsRead,
    deleteNotification as apiDeleteNotification
} from '@/api/notificationService'

const router = useRouter()
const loading = ref(true)
const notifications = ref([])
const currentPage = ref(1)
const hasMore = ref(false)
const filterType = ref('all') // all, unread, booking, review, payment, message

// Get current user
const user = computed(() => {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
})

// Load notifications
const loadNotifications = async (page = 1) => {
    loading.value = true
    try {
        const response = await getNotifications(page, 20)
        if (page === 1) {
            notifications.value = response.notifications
        } else {
            notifications.value = [...notifications.value, ...response.notifications]
        }
        hasMore.value = response.pagination.hasMore
        currentPage.value = page
    } catch (error) {
        console.error('Error loading notifications:', error)
    } finally {
        loading.value = false
    }
}

// Filter notifications
const filteredNotifications = computed(() => {
    let filtered = notifications.value

    switch (filterType.value) {
        case 'unread':
            filtered = filtered.filter(n => !n.is_read)
            break
        case 'booking':
        case 'review':
        case 'payment':
        case 'message':
            filtered = filtered.filter(n => n.type === filterType.value)
            break
    }

    return filtered
})

// Count notifications by type
const counts = computed(() => {
    return {
        all: notifications.value.length,
        unread: notifications.value.filter(n => !n.is_read).length,
        booking: notifications.value.filter(n => n.type === 'booking').length,
        review: notifications.value.filter(n => n.type === 'review').length,
        payment: notifications.value.filter(n => n.type === 'payment').length,
        message: notifications.value.filter(n => n.type === 'message').length
    }
})

// Load more
const loadMore = () => {
    loadNotifications(currentPage.value + 1)
}

// Refresh
const refreshNotifications = () => {
    loadNotifications(1)
}

// Mark as read
const markAsRead = async (notificationId) => {
    try {
        await apiMarkAsRead(notificationId)
        const notification = notifications.value.find(n => n.notification_id === notificationId)
        if (notification) {
            notification.is_read = true
        }
    } catch (error) {
        console.error('Error marking as read:', error)
    }
}

// Mark all as read
const markAllAsRead = async () => {
    try {
        await apiMarkAllAsRead()
        notifications.value.forEach(n => n.is_read = true)
    } catch (error) {
        console.error('Error marking all as read:', error)
    }
}

// Delete notification
const deleteNotification = async (notificationId) => {
    if (!confirm('Delete this notification?')) return

    try {
        await apiDeleteNotification(notificationId)
        notifications.value = notifications.value.filter(n => n.notification_id !== notificationId)
    } catch (error) {
        console.error('Error deleting notification:', error)
    }
}

// Handle notification click
const handleNotificationClick = (notification) => {
    markAsRead(notification.notification_id)

    // Parse notification data
    let data = {}
    try {
        data = notification.data ? JSON.parse(notification.data) : {}
    } catch (e) {
        console.error('Error parsing notification data:', e)
    }

    // Navigate based on notification type and user role
    switch (notification.type) {
        case 'booking':
            if (data.booking_id) {
                if (user.value?.role === 'skilled') {
                    router.push(`/skilled-bookings?highlight=${data.booking_id}`)
                } else {
                    router.push(`/bookings/${data.booking_id}`)
                }
            }
            break

        case 'payment':
            if (data.booking_id) {
                router.push(`/bookings/${data.booking_id}?tab=payment`)
            }
            break

        case 'review':
            if (data.skilled_id) {
                router.push(`/skilled-profile/${data.skilled_id}?tab=reviews`)
            }
            break

        case 'message':
            if (data.conversation_id) {
                router.push(`/messages/${data.conversation_id}`)
            } else if (data.skilled_id || data.client_id) {
                const userId = data.skilled_id || data.client_id
                router.push(`/messages?user=${userId}`)
            }
            break
    }
}

// Helper functions
const getNotificationIcon = (type) => {
    switch (type) {
        case 'booking': return '📅'
        case 'payment': return '💰'
        case 'review': return '⭐'
        case 'message': return '💬'
        default: return '🔔'
    }
}

const getNotificationTypeLabel = (type) => {
    switch (type) {
        case 'booking': return 'Booking'
        case 'payment': return 'Payment'
        case 'review': return 'Review'
        case 'message': return 'Message'
        default: return 'Notification'
    }
}

const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
}

onMounted(() => {
    loadNotifications()
})
</script>

<style scoped>
.notifications-page {
    min-height: 100vh;
    background: #f8fafc;
}

.notifications-container {
    max-width: 800px;
    margin: 80px auto 2rem;
    padding: 0 1.5rem;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.page-header h1 {
    font-size: 2rem;
    color: #1e293b;
    margin: 0;
}

.header-actions {
    display: flex;
    gap: 1rem;
}

.mark-all-btn,
.refresh-btn {
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
}

.mark-all-btn {
    background: #4f46e5;
    color: white;
}

.mark-all-btn:hover:not(:disabled) {
    background: #4338ca;
    transform: translateY(-2px);
}

.refresh-btn {
    background: #f1f5f9;
    color: #64748b;
}

.refresh-btn:hover:not(:disabled) {
    background: #e2e8f0;
}

.mark-all-btn:disabled,
.refresh-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Filter Tabs */
.filter-tabs {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 2rem;
}

.tab-btn {
    padding: 0.5rem 1rem;
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

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Notifications List */
.notifications-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.notification-item {
    display: flex;
    gap: 1rem;
    background: white;
    border-radius: 12px;
    padding: 1.2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
    border-left: 4px solid transparent;
}

.notification-item:hover {
    transform: translateX(2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.notification-item.unread {
    background: #eff6ff;
    border-left-color: #4f46e5;
}

.notification-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
}

.notification-icon.booking {
    background: #fef3c7;
    color: #92400e;
}

.notification-icon.review {
    background: #d1fae5;
    color: #065f46;
}

.notification-icon.payment {
    background: #e0e7ff;
    color: #4f46e5;
}

.notification-icon.message {
    background: #fee2e2;
    color: #991b1b;
}

.notification-content {
    flex: 1;
    cursor: pointer;
}

.notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.notification-header h3 {
    color: #1e293b;
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
}

.notification-time {
    color: #94a3b8;
    font-size: 0.8rem;
}

.notification-message {
    color: #475569;
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0 0 0.5rem 0;
}

.notification-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.meta-badge {
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
}

.meta-badge.booking {
    background: #fef3c7;
    color: #92400e;
}

.meta-badge.review {
    background: #d1fae5;
    color: #065f46;
}

.meta-badge.payment {
    background: #e0e7ff;
    color: #4f46e5;
}

.notification-type {
    color: #94a3b8;
    font-size: 0.75rem;
}

.notification-actions {
    display: flex;
    gap: 0.25rem;
    align-items: flex-start;
}

.mark-read-btn,
.delete-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 1.1rem;
}

.mark-read-btn {
    background: #d1fae5;
    color: #10b981;
}

.mark-read-btn:hover {
    background: #a7f3d0;
    transform: scale(1.1);
}

.delete-btn {
    background: #fee2e2;
    color: #ef4444;
}

.delete-btn:hover {
    background: #fecaca;
    transform: scale(1.1);
}

/* Load More */
.load-more {
    text-align: center;
    margin-top: 2rem;
}

.load-more-btn {
    padding: 0.75rem 2rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 30px;
    color: #4f46e5;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
}

.load-more-btn:hover:not(:disabled) {
    background: #4f46e5;
    color: white;
    border-color: #4f46e5;
}

.load-more-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

.clear-filter-btn {
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.clear-filter-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

/* Responsive */
@media (max-width: 640px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .notification-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
    }

    .notification-actions {
        flex-direction: column;
    }
}
</style>