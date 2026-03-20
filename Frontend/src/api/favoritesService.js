import API from './axios'

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

// Add to favorites
export const addToFavorites = async (skilledId) => {
  try {
    const response = await API.post('/favorites', { skilled_id: skilledId }, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error adding to favorites:', error)
    throw error
  }
}

// Remove from favorites
export const removeFromFavorites = async (skilledId) => {
  try {
    const response = await API.delete(`/favorites/${skilledId}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error removing from favorites:', error)
    throw error
  }
}

// Get user's favorites
export const getFavorites = async () => {
  try {
    const response = await API.get('/favorites', getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching favorites:', error)
    throw error
  }
}

// Check if a skilled worker is in favorites
export const checkFavorite = async (skilledId) => {
  try {
    const response = await API.get(`/favorites/check/${skilledId}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error checking favorite:', error)
    throw error
  }
}
