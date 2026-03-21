import API from './axios'

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

// Dashboard
export const getDashboardStats = async () => {
  try {
    const response = await API.get('/admin/dashboard/stats', getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
}

// User Management
export const getAllUsers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString()
    const response = await API.get(`/admin/users?${queryParams}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

export const updateUserStatus = async (userId, status) => {
  try {
    const response = await API.put(`/admin/users/${userId}/status`, { status }, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error updating user status:', error)
    throw error
  }
}

// Skilled Profile Verification
export const getPendingProfiles = async (page = 1, limit = 20) => {
  try {
    const response = await API.get(
      `/admin/profiles/pending?page=${page}&limit=${limit}`,
      getAuthHeader(),
    )
    return response.data
  } catch (error) {
    console.error('Error fetching pending profiles:', error)
    throw error
  }
}

export const getProfileById = async (id) => {
  try {
    const response = await API.get(`/admin/profiles/${id}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching profile:', error)
    throw error
  }
}

export const verifyProfile = async (id, status, admin_notes = '') => {
  try {
    const response = await API.put(
      `/admin/profiles/${id}/verify`,
      { status, admin_notes },
      getAuthHeader(),
    )
    return response.data
  } catch (error) {
    console.error('Error verifying profile:', error)
    throw error
  }
}

export const getPendingCount = async () => {
  try {
    const response = await getPendingProfiles(1, 1)
    return { count: response.pagination.total }
  } catch (error) {
    console.error('Error getting pending count:', error)
    return { count: 0 }
  }
}

// Skill Management
export const getAllSkillsAdmin = async () => {
  try {
    const response = await API.get('/admin/skills', getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching skills:', error)
    throw error
  }
}

export const createSkill = async (name) => {
  try {
    const response = await API.post('/admin/skills', { name }, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error creating skill:', error)
    throw error
  }
}

export const updateSkill = async (id, name) => {
  try {
    const response = await API.put(`/admin/skills/${id}`, { name }, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error updating skill:', error)
    throw error
  }
}

export const deleteSkill = async (id) => {
  try {
    const response = await API.delete(`/admin/skills/${id}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error deleting skill:', error)
    throw error
  }
}

// Reports
export const getReportedRatings = async () => {
  try {
    const response = await API.get('/admin/reports', getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching reports:', error)
    throw error
  }
}

export const resolveReport = async (id, action, admin_notes = '') => {
  try {
    const response = await API.put(
      `/admin/reports/${id}/resolve`,
      { action, admin_notes },
      getAuthHeader(),
    )
    return response.data
  } catch (error) {
    console.error('Error resolving report:', error)
    throw error
  }
}
export const getAdminProfile = async () => {
  try {
    const response = await API.get('/admin/profile', getAuthHeader())
    console.log(response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching admin profile:', error)
    throw error
  }
}
