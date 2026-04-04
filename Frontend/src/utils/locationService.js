import locationData from '@/data/pangasinan-locations.json'

export const getCities = () => {
  return locationData.cities || []
}

export const getBarangays = (city) => {
  if (!city) return []
  return locationData.barangays[city] || []
}

export const getAllBarangays = () => {
  return locationData.barangays || {}
}

export const validateLocation = (city, barangay) => {
  if (!city || !barangay) return false
  const barangays = getBarangays(city)
  return barangays.includes(barangay)
}

// Get a specific city's barangays
export const getCityBarangays = (city) => {
  return getBarangays(city)
}

// Get city by barangay (reverse lookup)
export const getCityByBarangay = (barangay) => {
  const cities = getCities()
  for (const city of cities) {
    const barangays = getBarangays(city)
    if (barangays.includes(barangay)) {
      return city
    }
  }
  return null
}
