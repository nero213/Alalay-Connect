import API from './axios'

export const searchSkilledWorkers = async (lat, lng, skill = null) => {
  try {
    const response = await API.get('skilled_profiles/search', {
      params: { lat, lng, skill },
    })
    return response.data
  } catch (error) {
    console.error('error fetching skilled workers', error)
    throw error
  }
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

export const createSkilledProfile = async (data) => {
  const token = localStorage.getItem('token')

  return API.post('/skilled_profiles', data, getAuthHeader())
}

export const uploadGovID = (file) => {
  const formData = new FormData()
  formData.append('gov_id', file)

  return API.post(`/skilled_profiles/gov-id`, formData, {
    ...getAuthHeader(),
    headers: {
      ...getAuthHeader().headers,
    },
  })
}

export const uploadCertificate = (file) => {
  const formData = new FormData()
  formData.append('certificate', file)

  return API.post(`/skilled_profiles/certificate`, formData, {
    ...getAuthHeader(),
    headers: {
      ...getAuthHeader().headers,
    },
  })
}

export const uploadProfileImage = (file) => {
  const formData = new FormData()
  formData.append('profile_image', file)

  return API.post(`/skilled_profiles/profile-image`, formData, {
    ...getAuthHeader(),
    headers: {
      ...getAuthHeader().headers,
    },
  })
}

export const updateSkilledLocation = async ({ barangay, city, latitude, longitude }) => {
  try {
    const token = localStorage.getItem('token')
    const response = await API.put(
      '/skilled_profiles/location',
      { barangay, city, latitude, longitude },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json', // ensure JSON
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Error updating location:', error.response || error)
    throw error
  }
}
export const addSkillsToProfile = async (skillIds) => {
  try {
    const response = await API.post('/skill', { skills: skillIds }, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error adding skills:', error.response?.data || error.message)
    throw error
  }
}

export const getMySkills = async () => {
  try {
    const response = await API.get('/skill/me', getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching skills:', error.response?.data || error.message)
    throw error
  }
}

export const removeSkillFromProfile = async (skillId) => {
  try {
    const response = await API.delete(`/skill/${skillId}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error removing skill:', error.response?.data || error.message)
    throw error
  }
}

export const getAllSkills = async () => {
  try {
    // You'll need to create this endpoint in your backend
    // For now, if you don't have it, you can return your hardcoded list
    const response = await API.get('/skill/all', getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching all skills:', error.response?.data || error.message)
    // Fallback to hardcoded skills if endpoint doesn't exist yet
    return [
      { skill_id: 1, name: 'Electrician' },
      { skill_id: 2, name: 'Plumber' },
      { skill_id: 3, name: 'Carpenter' },
      { skill_id: 4, name: 'Welder' },
      { skill_id: 5, name: 'Painter' },
      { skill_id: 6, name: 'Mason' },
      { skill_id: 7, name: 'Technician' },
      { skill_id: 8, name: 'Driver' },
      { skill_id: 9, name: 'Cook' },
      { skill_id: 10, name: 'Housekeeper' },
      { skill_id: 11, name: 'Laundry Services' },
      { skill_id: 12, name: 'Tutor' },
      { skill_id: 13, name: 'Computer Repair' },
      { skill_id: 14, name: 'Gardener' },
      { skill_id: 15, name: 'Handyman' },
      { skill_id: 16, name: 'Security Guard' },
      { skill_id: 17, name: 'Massage Therapist' },
      { skill_id: 18, name: 'Barber' },
      { skill_id: 19, name: 'Event Coordinator' },
      { skill_id: 20, name: 'DJ' },
    ]
  }
}

export const getCompleteProfile = async () => {
  try {
    const response = await API.get('/skilled_profiles/profile/complete', getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching complete profile:', error.response?.data || error.message)
    throw error
  }
}

export const getAllProfileSkills = async () => {
  try {
    const response = await API.get('/skills', getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching skills:', error.response?.data || error.message)
    throw error
  }
}

export const updateProfileBio = async (data) => {
  try {
    const response = await API.put('/skilled_profiles/bio', data, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error updating bio:', error.response?.data || error.message)
    throw error
  }
}

export const updateProfileImageNew = async (file) => {
  const formData = new FormData()
  formData.append('profile_image', file)

  return API.put('/skilled_profiles/profile-image', formData, {
    headers: {
      ...getAuthHeader().headers,
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const updateContactInfo = async (data) => {
  try {
    const response = await API.put('/skilled_profiles/contact', data, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error updating contact:', error.response?.data || error.message)
    throw error
  }
}

export const getPublicSkilledProfile = async (skilledId, lat = null, lng = null) => {
  try {
    let url = `/skilled_profiles/public/${skilledId}`
    if (lat && lng) {
      url += `?lat=${lat}&lng=${lng}`
    }
    const response = await API.get(url)
    return response.data
  } catch (error) {
    console.error('Error fetching public profile:', error)
    throw error
  }
}

// Update pricing
export const updateProfilePricing = async (data) => {
  try {
    const response = await API.put('/skilled_profiles/pricing', data, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error updating pricing:', error)
    throw error
  }
}

// Get pricing
export const getProfilePricing = async () => {
  try {
    const response = await API.get('/skilled_profiles/pricing', getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error fetching pricing:', error)
    throw error
  }
}
