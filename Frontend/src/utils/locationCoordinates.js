// frontend/src/utils/locationCoordinates.js
import locationData from '@/data/locationCoordinates.json'

// Normalize city names for consistent lookup
const normalizeCityName = (cityName) => {
  if (!cityName) return null

  const normalized = cityName.trim().toLowerCase()

  // Handle common variations
  const variations = {
    'san carlos': 'San Carlos City',
    'san carlos city': 'San Carlos City',
    sancarlos: 'San Carlos City',
    sancarloscity: 'San Carlos City',
    urdaneta: 'Urdaneta City',
    'urdaneta city': 'Urdaneta City',
    alaminos: 'Alaminos City',
    'alaminos city': 'Alaminos City',
  }

  if (variations[normalized]) {
    return variations[normalized]
  }

  // Try to find matching city
  const exactMatch = Object.keys(locationData.cities).find(
    (city) => city.toLowerCase() === normalized,
  )

  if (exactMatch) return exactMatch

  // Try partial match
  const partialMatch = Object.keys(locationData.cities).find(
    (city) => city.toLowerCase().includes(normalized) || normalized.includes(city.toLowerCase()),
  )

  return partialMatch || cityName
}

// Get coordinates for a city
export const getCityCoordinates = (cityName) => {
  if (!cityName) return null

  const normalizedCity = normalizeCityName(cityName)
  const city = locationData.cities[normalizedCity]

  if (city) {
    console.log(`✅ Found coordinates for ${normalizedCity}:`, city)
    return { lat: city.lat, lng: city.lng }
  }

  console.warn(`⚠️ No coordinates found for city: ${cityName} (normalized: ${normalizedCity})`)
  console.log('Available cities:', Object.keys(locationData.cities))

  // Default to Lingayen (Provincial Capitol)
  return { lat: 16.0167, lng: 120.2333 }
}

// Get coordinates for a specific barangay
export const getBarangayCoordinates = (city, barangay) => {
  if (!city || !barangay) return null

  const normalizedCity = normalizeCityName(city)
  const cleanBarangay = barangay.trim()

  if (locationData.barangays && locationData.barangays[normalizedCity]) {
    // Try exact match
    let barangayCoords = locationData.barangays[normalizedCity][cleanBarangay]

    // Try case-insensitive match
    if (!barangayCoords) {
      const barangayKey = Object.keys(locationData.barangays[normalizedCity]).find(
        (key) => key.toLowerCase() === cleanBarangay.toLowerCase(),
      )
      if (barangayKey) {
        barangayCoords = locationData.barangays[normalizedCity][barangayKey]
      }
    }

    if (barangayCoords) {
      console.log(`✅ Found coordinates for ${cleanBarangay}, ${normalizedCity}:`, barangayCoords)
      return { lat: barangayCoords.lat, lng: barangayCoords.lng }
    } else {
      console.warn(`⚠️ No coordinates found for barangay: ${cleanBarangay} in ${normalizedCity}`)
    }
  } else {
    console.warn(`⚠️ No barangays data for city: ${normalizedCity}`)
  }

  // Fall back to city coordinates
  return getCityCoordinates(city)
}

// Get coordinates from location (with priority on barangay)
export const getCoordinatesFromLocation = (city, barangay = null) => {
  // Try barangay first (more precise)
  if (barangay) {
    const coords = getBarangayCoordinates(city, barangay)
    if (coords) return coords
  }
  // Fall back to city
  return getCityCoordinates(city)
}

// Get formatted location string
export const getFormattedLocation = (city, barangay) => {
  if (barangay && city) {
    return `${barangay}, ${city}`
  }
  if (city) {
    return city
  }
  return 'Location not set'
}

// Validate if location exists in database
export const isValidLocation = (city, barangay = null) => {
  if (!city) return false

  const normalizedCity = normalizeCityName(city)
  const cityExists = !!locationData.cities[normalizedCity]

  if (barangay && cityExists) {
    if (locationData.barangays[normalizedCity]) {
      return !!locationData.barangays[normalizedCity][barangay]
    }
    return false
  }

  return cityExists
}
