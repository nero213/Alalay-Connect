<template>
  <div class="notifications-page">
    <noSearchNavbar />

    <div class="notifications-container">
      <div class="page-header">
        <h1>Notifications</h1>
        <div class="header-actions">
          <button
            v-if="notifications.some((n) => !n.is_read)"
            @click="markAllAsRead"
            class="mark-all-btn"
            :disabled="loading"
          >
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
        <button
          @click="filterType = 'unread'"
          :class="['tab-btn', { active: filterType === 'unread' }]"
        >
          Unread ({{ counts.unread }})
        </button>
        <button
          @click="filterType = 'booking'"
          :class="['tab-btn', { active: filterType === 'booking' }]"
        >
          Bookings
        </button>

        <button
          @click="filterType = 'message'"
          :class="['tab-btn', { active: filterType === 'message' }]"
        >
          Messages
        </button>
        <button
          @click="filterType = 'system'"
          :class="['tab-btn', { active: filterType === 'system' }]"
        >
          System
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading notifications...</p>
      </div>

      <!-- Notifications List -->
      <div v-else-if="filteredNotifications.length > 0" class="notifications-list">
        <div
          v-for="notification in filteredNotifications"
          :key="notification.notification_id"
          class="notification-item"
          :class="{ unread: !notification.is_read }"
        >
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
              <span v-if="notification.type === 'review'" class="meta-badge review"> Review </span>
              <span v-if="notification.type === 'payment'" class="meta-badge payment">
                Payment
              </span>
              <span v-if="notification.type === 'system'" class="meta-badge system"> System </span>
              <span class="notification-type">{{
                getNotificationTypeLabel(notification.type)
              }}</span>
            </div>
          </div>

          <div class="notification-actions">
            <button
              v-if="!notification.is_read"
              @click="markAsRead(notification.notification_id)"
              class="mark-read-btn"
              title="Mark as read"
            >
              ✓
            </button>
            <button
              @click="deleteNotification(notification.notification_id)"
              class="delete-btn"
              title="Delete"
            >
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
        <p>
          You don't have any {{ filterType !== 'all' ? filterType : '' }} notifications at the
          moment.
        </p>
        <button v-if="filterType !== 'all'" @click="filterType = 'all'" class="clear-filter-btn">
          View All Notifications
        </button>
      </div>
    </div>

    <!-- System Notification Modal (for reports, warnings, etc.) -->
    <div v-if="showSystemModal" class="modal-overlay" @click="closeSystemModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header" :class="systemModalType">
          <div class="modal-icon">
            <svg
              v-if="systemModalType === 'warning'"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 8V12M12 16H12.01M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
            <svg
              v-else-if="systemModalType === 'suspended'"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.364 5.63604L5.63604 18.364M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                stroke-width="1.5"
              />
            </svg>
            <svg
              v-else
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 8V12M12 16H12.01M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                stroke-width="1.5"
              />
            </svg>
          </div>
          <h3>{{ systemModalTitle }}</h3>
          <button @click="closeSystemModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="system-message">
            <p>{{ systemModalMessage }}</p>
          </div>
          <div v-if="systemModalNotes" class="admin-notes">
            <div class="notes-header">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17 3L21 7L7 21H3V17L17 3Z" stroke="currentColor" stroke-width="1.5" />
              </svg>
              <strong>Admin Notes:</strong>
            </div>
            <div class="notes-content">
              <p>{{ systemModalNotes }}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeSystemModal" class="btn-primary">Got it</button>
        </div>
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
  deleteNotification as apiDeleteNotification,
} from '@/api/notificationService'

const router = useRouter()
const loading = ref(true)
const notifications = ref([])
const currentPage = ref(1)
const hasMore = ref(false)
const filterType = ref('all')

// System Modal state
const showSystemModal = ref(false)
const systemModalTitle = ref('')
const systemModalMessage = ref('')
const systemModalNotes = ref('')
const systemModalType = ref('info') // info, warning, suspended

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
      filtered = filtered.filter((n) => !n.is_read)
      break
    case 'booking':
    case 'review':
    case 'payment':
    case 'message':
    case 'system':
      filtered = filtered.filter((n) => n.type === filterType.value)
      break
  }

  return filtered
})

// Count notifications by type
const counts = computed(() => {
  return {
    all: notifications.value.length,
    unread: notifications.value.filter((n) => !n.is_read).length,
    booking: notifications.value.filter((n) => n.type === 'booking').length,
    review: notifications.value.filter((n) => n.type === 'review').length,
    payment: notifications.value.filter((n) => n.type === 'payment').length,
    message: notifications.value.filter((n) => n.type === 'message').length,
    system: notifications.value.filter((n) => n.type === 'system').length,
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
    const notification = notifications.value.find((n) => n.notification_id === notificationId)
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
    notifications.value.forEach((n) => (n.is_read = true))
  } catch (error) {
    console.error('Error marking all as read:', error)
  }
}

// Delete notification
const deleteNotification = async (notificationId) => {
  if (!confirm('Delete this notification?')) return

  try {
    await apiDeleteNotification(notificationId)
    notifications.value = notifications.value.filter((n) => n.notification_id !== notificationId)
  } catch (error) {
    console.error('Error deleting notification:', error)
  }
}

// Show system modal
const showSystemModalWithContent = (title, message, notes = '', type = 'info') => {
  systemModalTitle.value = title
  systemModalMessage.value = message
  systemModalNotes.value = notes
  systemModalType.value = type
  showSystemModal.value = true
}

// Close system modal
const closeSystemModal = () => {
  showSystemModal.value = false
  systemModalTitle.value = ''
  systemModalMessage.value = ''
  systemModalNotes.value = ''
  systemModalType.value = 'info'
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
      // Use query parameters for message routing
      if (data.conversation_id) {
        router.push(`/messages?conversation=${data.conversation_id}`)
      } else if (data.skilled_id) {
        router.push(`/messages?skilled=${data.skilled_id}`)
      } else if (data.client_id) {
        router.push(`/messages?client=${data.client_id}`)
      }
      break

    case 'system':
      // Handle system notifications with modal instead of alert
      if (data.action === 'report_resolved') {
        showSystemModalWithContent(
          'Report Resolved',
          notification.message,
          data.admin_notes,
          'info',
        )
      } else if (data.action === 'warning' || data.action === 'warning issued') {
        showSystemModalWithContent(
          'Account Warning',
          notification.message,
          data.admin_notes,
          'warning',
        )
      } else if (data.action === 'user suspended') {
        showSystemModalWithContent(
          'Account Suspended',
          notification.message,
          data.admin_notes,
          'suspended',
        )
        // If the current user is the one suspended, log them out after modal closes
        if (user.value?.id === data.user_id) {
          const checkModalClose = setInterval(() => {
            if (!showSystemModal.value) {
              clearInterval(checkModalClose)
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              router.push('/login')
            }
          }, 500)
        }
      } else if (data.action === 'verification') {
        if (user.value?.role === 'admin') {
          router.push('/admin/verification')
        } else {
          router.push('/profile?tab=verification')
        }
      } else {
        showSystemModalWithContent(
          'System Notification',
          notification.message,
          data.admin_notes,
          'info',
        )
      }
      break

    default:
      router.push('/notifications')
  }
}

// Helper functions
const getNotificationIcon = (type) => {
  switch (type) {
    case 'booking':
      return '📅'
    case 'payment':
      return '💰'
    case 'review':
      return '⭐'
    case 'message':
      return '💬'
    case 'system':
      return '⚙️'
    default:
      return '🔔'
  }
}

const getNotificationTypeLabel = (type) => {
  switch (type) {
    case 'booking':
      return 'Booking'
    case 'payment':
      return 'Payment'
    case 'review':
      return 'Review'
    case 'message':
      return 'Message'
    case 'system':
      return 'System'
    default:
      return 'Notification'
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

.notification-icon.system {
  background: #e2e8f0;
  color: #475569;
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
  white-space: pre-wrap;
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

.meta-badge.system {
  background: #e2e8f0;
  color: #475569;
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

/* System Modal Styles */
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
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: white;
  border-radius: 24px;
  max-width: 450px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  position: relative;
}

.modal-header.warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.modal-header.suspended {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.modal-header.info {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
}

.modal-icon {
  width: 48px;
  height: 48px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-icon svg {
  stroke: white;
}

.modal-header h3 {
  flex: 1;
  margin: 0;
  color: #1e293b;
  font-size: 1.2rem;
  font-weight: 600;
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
  background: rgba(0, 0, 0, 0.1);
}

.modal-body {
  padding: 1.5rem;
}

.system-message p {
  color: #475569;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.admin-notes {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
  border-left: 3px solid #4f46e5;
}

.notes-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #4f46e5;
}

.notes-header svg {
  stroke: currentColor;
}

.notes-content p {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #f1f5f9;
  text-align: center;
}

.btn-primary {
  padding: 0.6rem 1.5rem;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
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

  .modal-header {
    flex-wrap: wrap;
  }
}
</style>
