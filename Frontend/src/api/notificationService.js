import API from './axios'

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

// Get user notifications
export const getNotifications = async (page = 1, limit = 20, unreadOnly = false) => {
  try {
    const response = await API.get(
      `/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`,
      getAuthHeader(),
    )
    return response.data
  } catch (error) {
    console.error('Error fetching notifications:', error)
    throw error
  }
}

// Get unread count
export const getUnreadCount = async () => {
  try {
    const response = await API.get('/notifications/unread-count', getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching unread count:', error)
    throw error
  }
}

// Mark notification as read
export const markAsRead = async (notificationId) => {
  try {
    const response = await API.put(`/notifications/${notificationId}/read`, {}, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

// Mark all as read
export const markAllAsRead = async () => {
  try {
    const response = await API.put('/notifications/read-all', {}, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error marking all as read:', error)
    throw error
  }
}

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await API.delete(`/notifications/${notificationId}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error deleting notification:', error)
    throw error
  }
}
