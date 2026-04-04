import API from './axios'

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    const response = await API.post('/bookings', bookingData, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error creating booking:', error)
    throw error
  }
}

// Get client's bookings
export const getClientBookings = async (status = null, page = 1, limit = 10) => {
  try {
    let url = '/bookings/client?'
    if (status) url += `status=${status}&`
    url += `page=${page}&limit=${limit}`

    const response = await API.get(url, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching client bookings:', error)
    throw error
  }
}

// Get skilled worker's bookings
export const getSkilledBookings = async (status = null, page = 1, limit = 10) => {
  try {
    let url = '/bookings/skilled?'
    if (status) url += `status=${status}&`
    url += `page=${page}&limit=${limit}`

    const response = await API.get(url, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching skilled bookings:', error)
    throw error
  }
}

// Get booking by ID
export const getBookingById = async (id) => {
  try {
    const response = await API.get(`/bookings/${id}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching booking:', error)
    throw error
  }
}

// Update booking status (for skilled workers)
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await API.put(`/bookings/${bookingId}/status`, { status }, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error updating booking status:', error)
    throw error
  }
}

// Reject booking (for skilled workers)
export const rejectBooking = async (bookingId, reason) => {
  try {
    const response = await API.put(`/bookings/${bookingId}/reject`, { reason }, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error rejecting booking:', error)
    throw error
  }
}

// Cancel booking (for clients)
export const cancelBooking = async (bookingId, reason = '') => {
  try {
    const response = await API.put(`/bookings/${bookingId}/cancel`, { reason }, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error cancelling booking:', error)
    throw error
  }
}

// Reschedule booking
export const rescheduleBooking = async (bookingId, new_date, reason = '') => {
  try {
    const response = await API.put(
      `/bookings/${bookingId}/reschedule`,
      { new_date, reason },
      getAuthHeader(),
    )
    return response.data
  } catch (error) {
    console.error('Error rescheduling booking:', error)
    throw error
  }
}

// Get available time slots
export const getAvailableSlots = async (skilledId, date) => {
  try {
    const response = await API.get(`/bookings/available/${skilledId}?date=${date}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching available slots:', error)
    throw error
  }
}
