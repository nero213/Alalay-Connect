import axios from 'axios'

const API = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URL}/api`,
  headers: {
    'ngrok-skip-browser-warning': true,
  },
  withCredentials: true,
})

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('📤 Request:', config.method?.toUpperCase(), config.url)
    console.log('🔑 Token exists:', !!token)

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ Authorization header added')
    } else {
      console.warn('⚠️ No token found for request:', config.url)
    }

    return config
  },
  (error) => {
    console.error('❌ Request error:', error)
    return Promise.reject(error)
  },
)

API.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.config.url, response.status)
    return response
  },
  (error) => {
    console.error('❌ Response error:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  },
)

export default API
