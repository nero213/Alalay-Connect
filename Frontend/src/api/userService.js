import API from './axios'

// this is the api for LoginUsers
export const loginUser = (data) => API.post('/auth/login', data)

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
