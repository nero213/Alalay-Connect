// frontend/src/api/helpService.js
import API from './axios'

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

// User endpoints
export const createSupportTicket = async (data) => {
  try {
    const response = await API.post('/help/tickets', data, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error creating support ticket:', error)
    throw error
  }
}

export const getUserTickets = async (page = 1, limit = 10) => {
  try {
    const response = await API.get(`/help/my-tickets?page=${page}&limit=${limit}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching user tickets:', error)
    throw error
  }
}

export const getTicketById = async (id) => {
  try {
    const response = await API.get(`/help/tickets/${id}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching ticket:', error)
    throw error
  }
}

export const addTicketReply = async (id, message, isInternalNote = false) => {
  try {
    const response = await API.post(
      `/help/tickets/${id}/reply`,
      { message, is_internal_note: isInternalNote },
      getAuthHeader(),
    )
    return response.data
  } catch (error) {
    console.error('Error adding reply:', error)
    throw error
  }
}

// Admin endpoints
export const getAllTickets = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString()
    const response = await API.get(`/help/admin/tickets?${queryParams}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching all tickets:', error)
    throw error
  }
}

export const getAdminTicketById = async (id) => {
  try {
    const response = await API.get(`/help/admin/tickets/${id}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching ticket:', error)
    throw error
  }
}

export const updateTicketStatus = async (id, data) => {
  try {
    const response = await API.put(`/help/admin/tickets/${id}`, data, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error updating ticket status:', error)
    throw error
  }
}

export const getTicketStats = async () => {
  try {
    const response = await API.get('/help/admin/stats', getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching ticket stats:', error)
    throw error
  }
}
