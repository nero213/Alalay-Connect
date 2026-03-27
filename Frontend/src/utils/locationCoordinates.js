// frontend/src/utils/locationCoordinates.js
import locationData from '@/data/locationCoordinates.json'

// Get coordinates for a city
export const getCityCoordinates = (cityName) => {
  if (!cityName) return null

  const cleanCity = cityName.trim()
  const city = locationData.cities[cleanCity]

  if (city) {
    console.log(`✅ Found coordinates for ${cleanCity}:`, city)
    return { lat: city.lat, lng: city.lng }
  }

  console.warn(`⚠️ No coordinates found for city: ${cleanCity}`)
  return { lat: 16.0167, lng: 120.2333 } // Default to Lingayen
}

// Get coordinates for a specific barangay
export const getBarangayCoordinates = (city, barangay) => {
  if (!city || !barangay) return null

  const cleanCity = city.trim()
  const cleanBarangay = barangay.trim()

  if (locationData.barangays && locationData.barangays[cleanCity]) {
    const barangayCoords = locationData.barangays[cleanCity][cleanBarangay]
    if (barangayCoords) {
      console.log(`✅ Found coordinates for ${cleanBarangay}, ${cleanCity}:`, barangayCoords)
      return { lat: barangayCoords.lat, lng: barangayCoords.lng }
    }
  }

  return getCityCoordinates(cleanCity)
}

// Get coordinates from city (with fallback)
export const getCoordinatesFromLocation = (city, barangay = null) => {
  if (barangay) {
    const coords = getBarangayCoordinates(city, barangay)
    if (coords && coords.lat !== 16.0167) return coords
  }
  return getCityCoordinates(city)
}
