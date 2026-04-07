<template>
  <div class="landing-page">
    <!-- Navigation -->
    <nav class="navbar" :class="{ scrolled: isScrolled }">
      <div class="nav-container">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 12L12 17L21 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 17L12 22L21 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="logo-text">Alalay<span class="highlight">Connect</span></span>
        </div>

        <div class="nav-links" :class="{ active: mobileMenuOpen }">
          <a href="#home" @click.prevent="scrollToSection('home')">Home</a>
          <a href="#features" @click.prevent="scrollToSection('features')">Features</a>
          <a href="#how-it-works" @click.prevent="scrollToSection('how-it-works')">How It Works</a>
          <a href="#for-workers" @click.prevent="scrollToSection('for-workers')">For Workers</a>
          <a href="#contact" @click.prevent="scrollToSection('contact')">Contact</a>
        </div>

        <div class="nav-buttons">
          <router-link to="/login" class="btn btn-outline">Log In</router-link>
          <router-link to="/register" class="btn btn-primary">Sign Up</router-link>
        </div>

        <button class="mobile-menu-btn" @click="toggleMobileMenu" aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="hero">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="greeting">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="9" cy="9" r="1.5" fill="currentColor"/>
                <circle cx="15" cy="9" r="1.5" fill="currentColor"/>
              </svg>
              Magandang araw!
            </span>
            <span class="main-title">Find trusted local <span class="highlight">skilled workers</span> in your community</span>
          </h1>
          <p class="hero-subtitle">
            Alalay Connect helps you discover reliable plumbers, electricians, carpenters, and more
            — right in your barangay.
          </p>

          <div class="hero-cta">
            <router-link to="/register" class="btn btn-primary btn-large">
              Find Help Now
              <span class="btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </router-link>
            <router-link to="/login" class="btn btn-outline btn-large">
              Access my Account
            </router-link>
          </div>

          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">500+</span>
              <span class="stat-label">Skilled Workers</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">50+</span>
              <span class="stat-label">Barangays</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">1,000+</span>
              <span class="stat-label">Jobs Completed</span>
            </div>
          </div>
        </div>

        <div class="hero-image">
          <div class="image-container">
            <div class="community-illustration">
              <div class="illustration-circle circle-1"></div>
              <div class="illustration-circle circle-2"></div>
              <div class="illustration-circle circle-3"></div>
              <div class="illustration-dots"></div>
              <div class="illustration-grid"></div>
              <div class="illustration-houses">
                <div class="house"></div>
                <div class="house"></div>
                <div class="house"></div>
                <div class="house"></div>
              </div>
            </div>

            <div class="floating-card card-1">
              <span class="card-icon">🔧</span>
              <div class="card-info">
                <strong>Juan Dela Cruz</strong>
                <span>Plumber • 8 yrs exp</span>
              </div>
            </div>
            <div class="floating-card card-2">
              <span class="card-icon">⚡</span>
              <div class="card-info">
                <strong>Maria Santos</strong>
                <span>Electrician • 5 yrs exp</span>
              </div>
            </div>
            <div class="floating-card card-3">
              <span class="card-icon">🪚</span>
              <div class="card-info">
                <strong>Pedro Reyes</strong>
                <span>Carpenter • 12 yrs exp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features">
      <div class="container">
        <div class="section-header">
          <h2>Why Choose Alalay Connect?</h2>
          <p>We make finding skilled workers simple, safe, and community-focused</p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C7.58 2 4 5.58 4 10C4 16.5 12 22 12 22C12 22 20 16.5 20 10C20 5.58 16.42 2 12 2Z" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </div>
            <h3>Location-Based</h3>
            <p>Find workers in your barangay and nearby areas. No more searching far away.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3>Verified Profiles</h3>
            <p>Each worker has a verified profile with skills, experience, and photos.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </div>
            <h3>Community Trust</h3>
            <p>Built on local connections and community recommendations.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" stroke-width="1.5"/>
                <path d="M12 18H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h3>Easy to Use</h3>
            <p>Simple interface to search, view profiles, and connect instantly.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" class="how-it-works">
      <div class="container">
        <div class="section-header">
          <h2>How Alalay Connect Works</h2>
          <p>Three simple steps to find the help you need</p>
        </div>

        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="white" stroke-width="1.5"/>
              </svg>
            </div>
            <h3>Search</h3>
            <p>Type what you need — plumber, electrician, cleaner, or any skilled worker</p>
          </div>

          <div class="step-connector"></div>

          <div class="step">
            <div class="step-number">2</div>
            <div class="step-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="white" stroke-width="1.5"/>
                <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="white" stroke-width="1.5"/>
              </svg>
            </div>
            <h3>Browse</h3>
            <p>View profiles, check experience, see ratings, and find workers near you</p>
          </div>

          <div class="step-connector"></div>

          <div class="step">
            <div class="step-number">3</div>
            <div class="step-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="white" stroke-width="1.5"/>
              </svg>
            </div>
            <h3>Connect</h3>
            <p>Contact them directly and get your problem solved</p>
          </div>
        </div>
      </div>
    </section>

    <!-- For Workers Section -->
    <section id="for-workers" class="for-workers">
      <div class="container">
        <div class="workers-content">
          <div class="workers-text">
            <h2>Are you a skilled worker?</h2>
            <p class="workers-subtitle">Get discovered by people in your community who need your skills</p>

            <ul class="benefits-list">
              <li>
                <span class="benefit-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M20 8V14M23 11H17" stroke="currentColor" stroke-width="1.5"/>
                  </svg>
                </span>
                <span>Create your skilled profile for free</span>
              </li>
              <li>
                <span class="benefit-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.7 6.3L19 2L20.7 3.7L16.4 8" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M9 12L12 9M7 17L12 12M11 19L19 11" stroke="currentColor" stroke-width="1.5"/>
                  </svg>
                </span>
                <span>List all your skills and experience</span>
              </li>
              <li>
                <span class="benefit-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C7.58 2 4 5.58 4 10C4 16.5 12 22 12 22C12 22 20 16.5 20 10C20 5.58 16.42 2 12 2Z" stroke="currentColor" stroke-width="1.5"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/>
                  </svg>
                </span>
                <span>Show your location to nearby customers</span>
              </li>
              <li>
                <span class="benefit-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M12 18H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </span>
                <span>Upload photos of your work</span>
              </li>
              <li>
                <span class="benefit-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M8 2V6M16 2V6M3 10H21" stroke="currentColor" stroke-width="1.5"/>
                  </svg>
                </span>
                <span>Get job opportunities in your barangay</span>
              </li>
            </ul>

            <router-link to="/register" class="btn btn-primary btn-large">
              Create Worker Profile
            </router-link>
          </div>

          <div class="workers-image">
            <div class="worker-profile-card">
              <div class="profile-header">
                <div class="profile-avatar">👨‍🏭</div>
                <div class="profile-title">
                  <h4>Ramon Fernandez</h4>
                  <span>General Repairman</span>
                </div>
              </div>
              <div class="profile-skills">
                <span class="skill-tag">Plumbing</span>
                <span class="skill-tag">Electrical</span>
                <span class="skill-tag">Carpentry</span>
                <span class="skill-tag">Painting</span>
              </div>
              <div class="profile-exp">
                <span>⭐ 4.9 (32 jobs)</span>
                <span>📍 Barangay San Roque</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Community Stats Section -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">2,500+</div>
            <div class="stat-desc">Active Users</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">150+</div>
            <div class="stat-desc">Skills Listed</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">98%</div>
            <div class="stat-desc">Satisfaction Rate</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">24/7</div>
            <div class="stat-desc">Community Support</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="testimonials">
      <div class="container">
        <div class="section-header">
          <h2>What Our Community Says</h2>
        </div>

        <div class="testimonials-grid">
          <div class="testimonial-card">
            <div class="testimonial-content">
              "Nakahanap agad ako ng karpintero sa lugar namin. Inayos niya agad ang sirang pinto ko. Sobrang helpful!"
            </div>
            <div class="testimonial-author">
              <span class="author-avatar">👩</span>
              <div class="author-info">
                <strong>Ana Mendoza</strong>
                <span>Homeowner • San Mateo</span>
              </div>
            </div>
          </div>

          <div class="testimonial-card">
            <div class="testimonial-content">
              "Dahil sa Alalay Connect, marami na akong bagong customers sa barangay namin. Malaking tulong sa kabuhayan ko."
            </div>
            <div class="testimonial-author">
              <span class="author-avatar">👨</span>
              <div class="author-info">
                <strong>Ka Rolly</strong>
                <span>Electrician • Cainta</span>
              </div>
            </div>
          </div>

          <div class="testimonial-card">
            <div class="testimonial-content">
              "Madali lang gamitin! Ilang clicks lang, may makukuhanan na agad ako ng tutulong sa bahay."
            </div>
            <div class="testimonial-author">
              <span class="author-avatar">👵</span>
              <div class="author-info">
                <strong>Lita Reyes</strong>
                <span>Senior Citizen • Taytay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer id="contact" class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <div class="footer-logo">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M3 12L12 17L21 12" stroke="currentColor" stroke-width="1.5"/>
                <path d="M3 17L12 22L21 17" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <span class="logo-text">Alalay<span class="highlight">Connect</span></span>
            </div>
            <p>Connecting communities through skills and service.</p>
          </div>

          <div class="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home" @click.prevent="scrollToSection('home')">Home</a></li>
              <li><a href="#features" @click.prevent="scrollToSection('features')">Features</a></li>
              <li><a href="#how-it-works" @click.prevent="scrollToSection('how-it-works')">How It Works</a></li>
              <li><a href="#for-workers" @click.prevent="scrollToSection('for-workers')">For Workers</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Support</h4>
            <ul>
              <li><router-link to="/help">Help Center</router-link></li>
              <li><a href="#" @click.prevent="openContactModal">Contact Us</a></li>
              <li><a href="#" @click.prevent="openPrivacyModal">Privacy Policy</a></li>
              <li><a href="#" @click.prevent="openTermsModal">Terms of Service</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Contact</h4>
            <ul class="contact-info">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                hello@alalayconnect.com
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 16.92V19.92C22.0001 20.1985 21.944 20.4742 21.8356 20.7293C21.7271 20.9845 21.5686 21.2136 21.3701 21.4019C21.1716 21.5901 20.9377 21.7335 20.6829 21.8227C20.4282 21.9119 20.1578 21.9451 19.89 21.92C16.672 21.5856 13.5881 20.534 10.87 18.85C8.33805 17.2857 6.17423 15.2022 4.52 12.74C2.82233 10.2335 1.78005 7.36284 1.5 4.36C1.47466 4.09269 1.50768 3.82278 1.59677 3.56839C1.68586 3.31399 1.8291 3.08045 2.01725 2.88222C2.20541 2.68399 2.43446 2.52569 2.68966 2.41743C2.94486 2.30917 3.22064 2.25322 3.5 2.25322H6.5C7.024 2.25322 7.5 2.62322 7.62 3.13322L8.32 6.33322C8.425 6.81322 8.2 7.29322 7.83 7.58322L5.81 9.19322C7.293 12.0852 9.498 14.2792 12.4 15.7702L14.02 13.7502C14.31 13.3802 14.79 13.1552 15.27 13.2602L18.47 13.9602C18.98 14.0802 19.35 14.5562 19.35 15.0802V18.0802C19.35 18.4492 19.095 18.7712 18.73 18.8302L18.47 18.86Z" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                (02) 1234 5678
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C7.58 2 4 5.58 4 10C4 16.5 12 22 12 22C12 22 20 16.5 20 10C20 5.58 16.42 2 12 2Z" stroke="currentColor" stroke-width="1.5"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                Metro Manila, Philippines
              </li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; 2024 Alalay Connect. All rights reserved. 🇵🇭 Made with bayanihan spirit.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const mobileMenuOpen = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    mobileMenuOpen.value = false
  }
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const openContactModal = () => {
  window.location.href = '/help'
}

const openPrivacyModal = () => {
  alert('Privacy Policy - Coming Soon')
}

const openTermsModal = () => {
  alert('Terms and Conditions - Coming Soon')
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.landing-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: #333;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: transparent;
  transition: all 0.3s ease;
  padding: 1rem 0;
}

.navbar.scrolled {
  background: white;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.logo svg {
  stroke: #4f46e5;
}

.logo-text {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.highlight {
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s ease;
  cursor: pointer;
}

.nav-links a:hover {
  color: #4f46e5;
}

.nav-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  border: none;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
}

.btn-outline {
  border: 2px solid #4f46e5;
  color: #4f46e5;
  background: transparent;
}

.btn-outline:hover {
  background: #4f46e5;
  color: white;
}

.btn-large {
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.mobile-menu-btn span {
  width: 25px;
  height: 3px;
  background: #333;
  transition: all 0.3s ease;
}

/* Hero Section */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 6rem 2rem 4rem;
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-title {
  margin-bottom: 1.5rem;
}

.greeting {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  color: #4f46e5;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.greeting svg {
  stroke: currentColor;
}

.main-title {
  font-size: 3rem;
  line-height: 1.2;
  font-weight: 800;
  color: #333;
  display: block;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.hero-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.8rem;
  font-weight: 800;
  color: #4f46e5;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

/* Hero Image */
.hero-image {
  position: relative;
}

.image-container {
  position: relative;
  height: 500px;
}

.community-illustration {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(79, 70, 229, 0.3);
}

.illustration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: -50px;
  right: -50px;
}

.circle-2 {
  width: 150px;
  height: 150px;
  bottom: -30px;
  left: -30px;
}

.circle-3 {
  width: 100px;
  height: 100px;
  bottom: 50px;
  right: 50px;
  background: rgba(255, 255, 255, 0.2);
}

.illustration-dots {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(rgba(255, 255, 255, 0.2) 2px, transparent 2px);
  background-size: 30px 30px;
}

.illustration-grid {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
}

.illustration-houses {
  position: absolute;
  bottom: 30px;
  left: 30px;
  right: 30px;
  display: flex;
  justify-content: space-around;
  gap: 10px;
}

.house {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
  transform: skewX(-5deg);
  position: relative;
}

.house::before {
  content: '';
  position: absolute;
  top: -20px;
  left: -5px;
  right: -5px;
  height: 20px;
  background: rgba(255, 255, 255, 0.4);
  transform: skewX(5deg);
}

.floating-card {
  position: absolute;
  background: white;
  padding: 1rem;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: float 3s ease-in-out infinite;
  z-index: 10;
}

.card-1 {
  top: 10%;
  left: -10%;
  animation-delay: 0s;
}

.card-2 {
  bottom: 20%;
  right: -10%;
  animation-delay: 0.5s;
}

.card-3 {
  top: 40%;
  right: 5%;
  animation-delay: 1s;
}

.card-icon {
  font-size: 2rem;
}

.card-info {
  display: flex;
  flex-direction: column;
}

.card-info strong {
  color: #333;
  font-size: 1rem;
}

.card-info span {
  font-size: 0.85rem;
  color: #666;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* Features Section */
.features {
  padding: 6rem 2rem;
  background: white;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-header h2 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
  font-weight: 700;
}

.section-header p {
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  background: #f5f3ff;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(79, 70, 229, 0.1);
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.feature-icon svg {
  stroke: #4f46e5;
}

.feature-card h3 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

/* How It Works */
.how-it-works {
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
}

.how-it-works .section-header h2,
.how-it-works .section-header p {
  color: white;
}

.steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 4rem 0;
  position: relative;
}

.step {
  text-align: center;
  flex: 1;
  position: relative;
  z-index: 2;
}

.step-number {
  width: 60px;
  height: 60px;
  background: white;
  color: #4f46e5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 auto 1rem;
  border: 4px solid rgba(255, 255, 255, 0.3);
}

.step-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.step-icon svg {
  stroke: white;
}

.step h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.step p {
  max-width: 250px;
  margin: 0 auto;
  opacity: 0.9;
}

.step-connector {
  flex: 0.5;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  position: relative;
  z-index: 1;
}

/* For Workers Section */
.for-workers {
  padding: 6rem 2rem;
  background: white;
}

.workers-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.workers-text h2 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.workers-subtitle {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}

.benefits-list {
  list-style: none;
  margin-bottom: 2rem;
}

.benefits-list li {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #444;
}

.benefit-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
}

.benefit-icon svg {
  stroke: #4f46e5;
}

.worker-profile-card {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(79, 70, 229, 0.3);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.profile-avatar {
  font-size: 3rem;
  background: rgba(255, 255, 255, 0.2);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-title h4 {
  font-size: 1.3rem;
  margin-bottom: 0.3rem;
}

.profile-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.skill-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.3rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.profile-exp {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

/* Stats Section */
.stats-section {
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.stat-card {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 30px rgba(79, 70, 229, 0.1);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #4f46e5;
  margin-bottom: 0.5rem;
}

.stat-desc {
  color: #666;
  font-size: 1rem;
}

/* Testimonials */
.testimonials {
  padding: 6rem 2rem;
  background: white;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.testimonial-card {
  padding: 2rem;
  background: #f5f3ff;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.testimonial-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 30px rgba(79, 70, 229, 0.1);
}

.testimonial-content {
  font-size: 1rem;
  line-height: 1.6;
  color: #444;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  font-size: 2rem;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-info strong {
  color: #333;
}

.author-info span {
  font-size: 0.9rem;
  color: #666;
}

/* Footer */
.footer {
  background: #111827;
  color: white;
  padding: 4rem 2rem 2rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.footer-logo svg {
  stroke: white;
}

.footer-col p {
  opacity: 0.7;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.footer-col h4 {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.footer-col ul {
  list-style: none;
}

.footer-col ul li {
  margin-bottom: 0.8rem;
}

.footer-col ul li a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: color 0.3s ease;
  cursor: pointer;
}

.footer-col ul li a:hover {
  color: #4f46e5;
}

.contact-info li {
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.contact-info li svg {
  stroke: currentColor;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-stats {
    justify-content: center;
  }

  .hero-cta {
    justify-content: center;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .workers-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .benefits-list li {
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .testimonials-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .nav-links,
  .nav-buttons {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .nav-links.active {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    padding: 2rem;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }

  .main-title {
    font-size: 2.2rem;
  }

  .hero-cta {
    flex-direction: column;
  }

  .steps {
    flex-direction: column;
    gap: 2rem;
  }

  .step-connector {
    width: 2px;
    height: 50px;
  }

  .features-grid,
  .stats-grid,
  .testimonials-grid {
    grid-template-columns: 1fr;
  }

  .footer-grid {
    grid-template-columns: 1fr;
  }

  .floating-card {
    display: none;
  }
}
</style>