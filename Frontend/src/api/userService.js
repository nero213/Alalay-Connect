import API from './axios'

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

// this is the api for LoginUsers
export const loginUser = async (credentials) => {
  try {
    // console.log('Attempting login with:', credentials.email)
    const response = await API.post('/auth/login', credentials)
    // console.log('Login response:', response.data)
    return response
  } catch (error) {
    console.error('Login error in service:', error.response?.data || error.message)
    console.error('Status:', error.response?.status)
    throw error
  }
}

export const registerUsers = async (userData) => {
  try {
    const response = await API.post('/auth/register', userData)
    return response
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

export const profileUsers = () => {
  const token = localStorage.getItem('token')
  return API.get('/auth/profile', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Get user profile with settings
export const getUserProfile = async () => {
  try {
    const response = await API.get('/user/profile', getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching profile:', error)
    throw error
  }
}

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    const response = await API.put('/user/profile', userData, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error updating profile:', error)
    throw error
  }
}

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await API.put('/user/password', passwordData, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error changing password:', error)
    throw error
  }
}

// Update notification settings
export const updateNotificationSettings = async (settings) => {
  try {
    const response = await API.put('/user/settings', settings, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error updating settings:', error)
    throw error
  }
}

// Upload profile image
export const uploadUserProfileImage = async (file) => {
  const formData = new FormData()
  formData.append('profile_image', file)

  try {
    const response = await API.post('/user/profile-image', formData, {
      headers: {
        ...getAuthHeader().headers,
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

// Request password reset
export const requestPasswordReset = async (email) => {
  try {
    const response = await API.post('/user/forgot-password', { email })
    return response.data
  } catch (error) {
    console.error('Error requesting reset:', error)
    throw error
  }
}

// Reset password with token
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await API.post('/user/reset-password', { token, newPassword })
    return response.data
  } catch (error) {
    console.error('Error resetting password:', error)
    throw error
  }
}

// Delete account
export const deleteAccount = async (password) => {
  try {
    const response = await API.delete('/user/account', {
      ...getAuthHeader(),
      data: { password },
    })
    return response.data
  } catch (error) {
    console.error('Error deleting account:', error)
    throw error
  }
}
