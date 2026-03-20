import API from './axios'

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

// Submit a rating
export const submitRating = async (data) => {
  try {
    const response = await API.post('/ratings', data, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error submitting rating:', error)
    throw error
  }
}

// Get ratings for a skilled worker
export const getSkilledRatings = async (skilledId, page = 1, limit = 10) => {
  try {
    const response = await API.get(`/ratings/skilled/${skilledId}?page=${page}&limit=${limit}`)
    return response.data
  } catch (error) {
    console.error('Error fetching ratings:', error)
    throw error
  }
}

// Check if user has already rated
export const checkUserRating = async (skilledId) => {
  try {
    const response = await API.get(`/ratings/check/${skilledId}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error checking rating:', error)
    throw error
  }
}

// Delete a rating
export const deleteRating = async (ratingId) => {
  try {
    const response = await API.delete(`/ratings/${ratingId}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error deleting rating:', error)
    throw error
  }
}
