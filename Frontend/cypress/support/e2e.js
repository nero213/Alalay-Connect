// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add your global functions here
function randomString(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  let str = ''
  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)]
  }
  return str
}

function randomEmail() {
  return `${randomString(6)}${Date.now()}@test.com`
}

function randomPhone() {
  return `07${Math.floor(10000000 + Math.random() * 90000000)}`
}

function generateRandomUser() {
  const password = randomString(8) + '1A!'
  return {
    email: randomEmail(),
    firstName: randomString(5),
    lastName: randomString(5),
    password: password,
    confirmPassword: password,
    phone: randomPhone(),
  }
}

// Make functions available globally
Cypress.randomString = randomString
Cypress.randomEmail = randomEmail
Cypress.randomPhone = randomPhone
Cypress.generateRandomUser = generateRandomUser
