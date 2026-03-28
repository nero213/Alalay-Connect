import API from './axios'

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}
export const getOrCreateConversationWithUser = async (userId) => {
  try {
    const response = await API.get(`/messages/conversations/user/${userId}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error creating conversation with user:', error)
    throw error
  }
}
// Get or create conversation with a skilled worker
export const getOrCreateConversation = async (skilledId) => {
  try {
    const response = await API.get(`/messages/conversations/${skilledId}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error getting conversation:', error)
    throw error
  }
}

// Get all user conversations
export const getUserConversations = async () => {
  try {
    const response = await API.get('/messages/conversations', getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching conversations:', error)
    throw error
  }
}

// Get messages for a conversation
export const getMessages = async (conversationId, page = 1, limit = 50) => {
  try {
    const response = await API.get(
      `/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
      getAuthHeader(),
    )
    return response.data
  } catch (error) {
    console.error('Error fetching messages:', error)
    throw error
  }
}

// Send a message
export const sendMessage = async (formData) => {
  try {
    const response = await API.post('/messages/send', formData, {
      headers: {
        ...getAuthHeader().headers,
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

// Mark messages as read
export const markMessagesAsRead = async (conversationId) => {
  try {
    const response = await API.put(
      `/messages/conversations/${conversationId}/read`,
      {},
      getAuthHeader(),
    )
    return response.data
  } catch (error) {
    console.error('Error marking messages as read:', error)
    throw error
  }
}

// Get unread message count
export const getUnreadMessageCount = async () => {
  try {
    const response = await API.get('/messages/unread', getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error getting unread count:', error)
    throw error
  }
}

// Delete a message
export const deleteMessage = async (messageId) => {
  try {
    const response = await API.delete(`/messages/messages/${messageId}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error deleting message:', error)
    throw error
  }
}
