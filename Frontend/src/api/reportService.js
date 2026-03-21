import API from './axios'

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

// Create a report
export const createReport = async (data) => {
  try {
    const response = await API.post('/reports', data, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error creating report:', error)
    throw error
  }
}

// Get all reports (admin only)
export const getAllReports = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString()
    const response = await API.get(`/reports/admin?${queryParams}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching reports:', error)
    throw error
  }
}

// Get report by ID (admin only)
export const getReportById = async (id) => {
  try {
    const response = await API.get(`/reports/admin/${id}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching report:', error)
    throw error
  }
}

// Resolve report (admin only)
export const resolveReport = async (id, action, admin_notes = '') => {
  try {
    const response = await API.put(
      `/reports/admin/${id}/resolve`,
      { action, admin_notes },
      getAuthHeader(),
    )
    return response.data
  } catch (error) {
    console.error('Error resolving report:', error)
    throw error
  }
}

// Get report stats (admin only)
export const getReportStats = async () => {
  try {
    const response = await API.get('/reports/admin/stats', getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching report stats:', error)
    throw error
  }
}
