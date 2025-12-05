import API from './axios'

// this is the api for LoginUsers
export const loginUser = (data) => API.post('/auth/login', data)

export const registerUsers = (data) => API.post('/auth/register', data)

export const profileUsers = () => {
  const token = localStorage.getItem('token')
  return API.get('/auth/profile', {
    headers: { Authorization: `Bearer ${token}` },
  })
}
