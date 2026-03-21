<template>
    <div class="notification-container" ref="container">
        <button @click="toggleDropdown" class="notification-bell" :class="{ active: showDropdown }">
            <svg class="bell-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path
                    d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
        </button>

        <transition name="dropdown">
            <div v-if="showDropdown" class="notification-dropdown">
                <div class="dropdown-header">
                    <div class="header-title">
                        <span class="title-icon">🔔</span>
                        <h3>Notifications</h3>
                    </div>
                    <div class="header-actions">
                        <button v-if="notifications.some(n => !n.is_read)" @click="markAllAsRead"
                            class="action-btn mark-all" :disabled="loading">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                            <span>Mark all read</span>
                        </button>
                        <button @click="refreshNotifications" class="action-btn refresh" :disabled="loading">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M23 4V10H17M1 20V14H7" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                                <path
                                    d="M20.49 9C19.9828 7.56678 19.1209 6.28537 17.9845 5.27542C16.8482 4.26546 15.4745 3.55976 14 3.22408C12.5255 2.8884 10.9902 2.93454 9.5358 3.35844C8.08145 3.78235 6.74986 4.57103 5.65 5.66L1 10M23 14L18.35 18.34C17.2501 19.429 15.9186 20.2176 14.4642 20.6416C13.0098 21.0655 11.4745 21.1116 10 20.7759C8.5255 20.4402 7.1518 19.7345 6.01547 18.7246C4.87914 17.7146 4.01718 16.4332 3.51 15"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="notifications-list">
                    <div v-if="loading" class="loading-state">
                        <div class="loading-spinner"></div>
                        <p>Loading notifications...</p>
                    </div>

                    <div v-else-if="notifications.length === 0" class="empty-state">
                        <div class="empty-illustration">
                            <span class="empty-emoji">🔔</span>
                        </div>
                        <p class="empty-title">No notifications yet</p>
                        <p class="empty-subtitle">We'll notify you when something arrives</p>
                    </div>

                    <div v-else>
                        <div v-for="notification in notifications" :key="notification.notification_id"
                            class="notification-item" :class="{ unread: !notification.is_read }"
                            @click="handleNotificationClick(notification)">
                            <div class="notification-icon" :class="notification.type">
                                {{ getNotificationIcon(notification.type) }}
                            </div>
                            <div class="notification-content">
                                <div class="notification-header">
                                    <h4>{{ notification.title }}</h4>
                                    <span class="time-badge">{{ formatTime(notification.created_at) }}</span>
                                </div>
                                <p>{{ notification.message }}</p>
                                <div class="notification-footer">
                                    <span class="type-badge" :class="notification.type">
                                        {{ getNotificationTypeLabel(notification.type) }}
                                    </span>
                                </div>
                            </div>
                            <button v-if="!notification.is_read" @click.stop="markAsRead(notification.notification_id)"
                                class="mark-read-btn" title="Mark as read">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>
                        </div>

                        <div v-if="hasMore" class="load-more">
                            <button @click="loadMore" class="load-more-btn" :disabled="loading">
                                <span>Load more notifications</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="dropdown-footer" v-if="notifications.length > 0">
                    <router-link to="/notifications" class="view-all-link" @click="showDropdown = false">
                        <span>View All Notifications</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </router-link>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
    getNotifications,
    getUnreadCount,
    markAsRead as apiMarkAsRead,
    markAllAsRead as apiMarkAllAsRead
} from '@/api/notificationService'
import { getUnreadMessageCount } from '@/api/messageService'


const router = useRouter()
const showDropdown = ref(false)
const notifications = ref([])
const unreadCount = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const hasMore = ref(false)
const container = ref(null)

// Get current user from localStorage
const user = computed(() => {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
})

// Load notifications
const loadNotifications = async (page = 1) => {
    loading.value = true
    try {
        const response = await getNotifications(page, 10)
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

// Load unread count
const loadUnreadCount = async () => {
    try {
        const response = await getUnreadCount()
        unreadCount.value = response.unread_count
    } catch (error) {
        console.error('Error loading unread count:', error)
    }
}

// Toggle dropdown
const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value
    if (showDropdown.value) {
        loadNotifications(1)
    }
}

// Refresh notifications
const refreshNotifications = () => {
    loadNotifications(1)
    loadUnreadCount()
}

// Load more notifications
const loadMore = () => {
    loadNotifications(currentPage.value + 1)
}

// Mark as read
const markAsRead = async (notificationId) => {
    try {
        await apiMarkAsRead(notificationId)
        const notification = notifications.value.find(n => n.notification_id === notificationId)
        if (notification) {
            notification.is_read = true
        }
        unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (error) {
        console.error('Error marking as read:', error)
    }
}

// Mark all as read
const markAllAsRead = async () => {
    try {
        await apiMarkAllAsRead()
        notifications.value.forEach(n => n.is_read = true)
        unreadCount.value = 0
    } catch (error) {
        console.error('Error marking all as read:', error)
    }
}

// Handle notification click with role-based routing
const handleNotificationClick = (notification) => {
    markAsRead(notification.notification_id)

    // Parse notification data
    let data = {}
    try {
        data = notification.data ? JSON.parse(notification.data) : {}
    } catch (e) {
        console.error('Error parsing notification data:', e)
    }

    // Role-based routing based on notification type
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
            } else {
                router.push('/payments')
            }
            break

        case 'review':
            if (data.skilled_id) {
                router.push(`/skilled-profile/${data.skilled_id}?tab=reviews`)
            } else if (data.booking_id) {
                router.push(`/bookings/${data.booking_id}?tab=review`)
            }
            break

        case 'message':
            if (data.conversation_id) {
                // Use query parameter instead of path parameter
                router.push(`/messages?conversation=${data.conversation_id}`)
            } else if (data.skilled_id) {
                router.push(`/messages?skilled=${data.skilled_id}`)
            } else if (data.client_id) {
                router.push(`/messages?client=${data.client_id}`)
            }
            break

        case 'system':
            // System notifications might go to different places
            if (data.action === 'verification') {
                if (user.value?.role === 'admin') {
                    router.push('/admin/verifications')
                } else {
                    router.push('/profile?tab=verification')
                }
            } else if (data.action === 'report_resolved') {

                router.push('/notifications')
            } else if (data.action === 'profile') {
                router.push('/profile')
            } else {
                router.push('/notifications')
            }
            break
        default:
            router.push('/notifications')
    }

    showDropdown.value = false
}

// Get notification icon based on type
const getNotificationIcon = (type) => {
    switch (type) {
        case 'booking': return '📅'
        case 'payment': return '💰'
        case 'review': return '⭐'
        case 'message': return '💬'
        case 'system': return '⚙️'
        default: return '📌'
    }
}

// Get notification type label
const getNotificationTypeLabel = (type) => {
    switch (type) {
        case 'booking': return 'Booking'
        case 'payment': return 'Payment'
        case 'review': return 'Review'
        case 'message': return 'Message'
        case 'system': return 'System'
        default: return 'Notification'
    }
}

// Format time
const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString()
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
    if (container.value && !container.value.contains(event.target)) {
        showDropdown.value = false
    }
}

onMounted(() => {
    loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 30000)
    document.addEventListener('click', handleClickOutside)

    onUnmounted(() => {
        clearInterval(interval)
        document.removeEventListener('click', handleClickOutside)
    })

    const loadUnreadMessageCount = async () => {
        try {
            const response = await getUnreadMessageCount()
            // Add to total unread count or separate badge
        } catch (error) {
            console.error('Error loading unread message count:', error)
        }
    }
})
</script>

<style scoped>
.notification-container {
    position: relative;
}

.notification-bell {
    position: relative;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
}

.notification-bell:hover {
    background: #f1f5f9;
    transform: translateY(-2px);
}

.notification-bell.active {
    background: #e0e7ff;
    color: #4f46e5;
}

.bell-svg {
    width: 22px;
    height: 22px;
}

.badge {
    position: absolute;
    top: -2px;
    right: -2px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    font-size: 0.65rem;
    font-weight: bold;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }

    100% {
        transform: scale(1);
    }
}

.notification-dropdown {
    position: absolute;
    top: 100%;
    right: -10px;
    width: 400px;
    max-height: 550px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin-top: 0.75rem;
    animation: slideIn 0.3s ease;
}

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

.dropdown-enter-active,
.dropdown-leave-active {
    transition: opacity 0.2s, transform 0.2s;
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.dropdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f1f5f9;
    background: white;
}

.header-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.title-icon {
    font-size: 1.2rem;
}

.dropdown-header h3 {
    margin: 0;
    color: #1e293b;
    font-size: 1rem;
    font-weight: 600;
}

.header-actions {
    display: flex;
    gap: 0.5rem;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: none;
    border: none;
    padding: 0.4rem 0.75rem;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #64748b;
}

.action-btn svg {
    stroke: currentColor;
}

.action-btn:hover:not(:disabled) {
    background: #f1f5f9;
    color: #4f46e5;
}

.action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.mark-all span {
    display: inline-block;
}

.refresh {
    padding: 0.4rem;
}

.notifications-list {
    overflow-y: auto;
    max-height: 420px;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem 2rem;
    gap: 1rem;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e2e8f0;
    border-top-color: #4f46e5;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading-state p {
    color: #94a3b8;
    font-size: 0.9rem;
    margin: 0;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem 2rem;
    text-align: center;
}

.empty-illustration {
    margin-bottom: 1rem;
}

.empty-emoji {
    font-size: 3rem;
    opacity: 0.5;
    display: inline-block;
    animation: bounce 2s infinite;
}

@keyframes bounce {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-8px);
    }
}

.empty-title {
    color: #1e293b;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
}

.empty-subtitle {
    color: #94a3b8;
    font-size: 0.85rem;
    margin: 0;
}

.notification-item {
    display: flex;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f1f5f9;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
}

.notification-item:hover {
    background: #faf9fe;
    transform: translateX(2px);
}

.notification-item.unread {
    background: linear-gradient(90deg, #f0f9ff 0%, #ffffff 100%);
    position: relative;
}

.notification-item.unread::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}

.notification-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    background: #f1f5f9;
    flex-shrink: 0;
    transition: all 0.3s ease;
}

.notification-icon.booking {
    background: #dbeafe;
}

.notification-icon.payment {
    background: #d1fae5;
}

.notification-icon.review {
    background: #fed7aa;
}

.notification-icon.message {
    background: #e0e7ff;
}

.notification-icon.system {
    background: #e2e8f0;
}

.notification-content {
    flex: 1;
    min-width: 0;
}

.notification-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0.25rem;
    gap: 0.5rem;
}

.notification-content h4 {
    margin: 0;
    color: #1e293b;
    font-size: 0.9rem;
    font-weight: 600;
    line-height: 1.3;
}

.time-badge {
    font-size: 0.7rem;
    color: #94a3b8;
    background: #f8fafc;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
    white-space: nowrap;
    font-weight: 500;
}

.notification-content p {
    margin: 0 0 0.5rem 0;
    color: #475569;
    font-size: 0.85rem;
    line-height: 1.4;
    word-wrap: break-word;
}

.notification-footer {
    display: flex;
    align-items: center;
}

.type-badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.6rem;
    border-radius: 20px;
    font-weight: 500;
    background: #f1f5f9;
    color: #64748b;
}

.type-badge.booking {
    background: #dbeafe;
    color: #4f46e5;
}

.type-badge.payment {
    background: #d1fae5;
    color: #10b981;
}

.type-badge.review {
    background: #fed7aa;
    color: #f59e0b;
}

.type-badge.message {
    background: #e0e7ff;
    color: #4f46e5;
}

.type-badge.system {
    background: #e2e8f0;
    color: #475569;
}

.mark-read-btn {
    background: none;
    border: none;
    color: #10b981;
    cursor: pointer;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    opacity: 0;
    transition: all 0.3s ease;
    background: white;
    flex-shrink: 0;
}

.notification-item:hover .mark-read-btn {
    opacity: 1;
}

.mark-read-btn:hover {
    background: #d1fae5;
    transform: scale(1.1);
}

.mark-read-btn svg {
    stroke: currentColor;
}

.load-more {
    padding: 1rem;
    text-align: center;
    border-top: 1px solid #f1f5f9;
}

.load-more-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 0.6rem 1.2rem;
    border-radius: 30px;
    color: #4f46e5;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.load-more-btn:hover:not(:disabled) {
    background: #e0e7ff;
    border-color: #4f46e5;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
}

.load-more-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.load-more-btn svg {
    stroke: currentColor;
    transition: transform 0.3s ease;
}

.load-more-btn:hover svg {
    transform: translateY(2px);
}

.dropdown-footer {
    padding: 0.75rem 1rem;
    text-align: center;
    border-top: 1px solid #f1f5f9;
    background: white;
}

.view-all-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #4f46e5;
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: 30px;
    transition: all 0.3s ease;
}

.view-all-link:hover {
    background: #f1f5f9;
    gap: 0.75rem;
}

.view-all-link svg {
    stroke: currentColor;
    transition: transform 0.3s ease;
}

.view-all-link:hover svg {
    transform: translateX(4px);
}

/* Responsive */
@media (max-width: 480px) {
    .notification-dropdown {
        width: 340px;
        right: -70px;
    }

    .notification-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
    }

    .time-badge {
        font-size: 0.65rem;
    }

    .action-btn span {
        display: none;
    }

    .action-btn {
        padding: 0.4rem;
    }
}
</style>