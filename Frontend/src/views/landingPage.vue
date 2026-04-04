<template>
  <div class="landing-page">
    <!-- Navigation -->
    <nav class="navbar" :class="{ 'scrolled': isScrolled }">
      <div class="nav-container">
        <div class="logo">
          <span class="logo-icon">🤝</span>
          <span class="logo-text">Alalay<span class="highlight">Connect</span></span>
        </div>

        <div class="nav-links" :class="{ 'active': mobileMenuOpen }">
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
            <span class="greeting">👋 Magandang araw!</span>
            <span class="main-title">Find trusted local <span class="highlight">skilled workers</span> in your
              community</span>
          </h1>
          <p class="hero-subtitle">
            Alalay Connect helps you discover reliable plumbers, electricians, carpenters, and more — right in your
            barangay.
          </p>

          <div class="hero-cta">
            <router-link to="/register" class="btn btn-primary btn-large">
              Find Help Now
              <span class="btn-icon">→</span>
            </router-link>
            <router-link to="/register?type=worker" class="btn btn-outline btn-large">
              Offer Your Skills
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
            <!-- CSS Illustration instead of image -->
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
            <div class="feature-icon">📍</div>
            <h3>Location-Based</h3>
            <p>Find workers in your barangay and nearby areas. No more searching far away.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">✓</div>
            <h3>Verified Profiles</h3>
            <p>Each worker has a verified profile with skills, experience, and photos.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">👥</div>
            <h3>Community Trust</h3>
            <p>Built on local connections and community recommendations.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📱</div>
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
            <div class="step-icon">🔍</div>
            <h3>Search</h3>
            <p>Type what you need — plumber, electrician, cleaner, or any skilled worker</p>
          </div>

          <div class="step-connector"></div>

          <div class="step">
            <div class="step-number">2</div>
            <div class="step-icon">👤</div>
            <h3>Browse</h3>
            <p>View profiles, check experience, see ratings, and find workers near you</p>
          </div>

          <div class="step-connector"></div>

          <div class="step">
            <div class="step-number">3</div>
            <div class="step-icon">🤝</div>
            <h3>Connect</h3>
            <p>Contact them directly and get your problem solved</p>
          </div>
        </div>

        <div class="demo-search">
          <div class="search-box">
            <div class="search-input-wrapper">
              <span class="search-icon">🔎</span>
              <input type="text" placeholder="Try it: 'plumber', 'electrician', 'carpenter'..." v-model="searchQuery">
            </div>
            <button class="btn btn-primary search-btn">Search</button>
          </div>

          <div v-if="searchQuery" class="search-preview">
            <p>Showing workers near <strong>your location</strong>:</p>
            <div class="preview-results">
              <div class="preview-card">
                <div class="preview-avatar">👨‍🔧</div>
                <div class="preview-info">
                  <strong>Mang Tonyo</strong>
                  <span>Plumber • 15 years exp</span>
                  <small>📍 500m away • Barangay San Jose</small>
                </div>
              </div>
              <div class="preview-card">
                <div class="preview-avatar">👩‍🔧</div>
                <div class="preview-info">
                  <strong>Aling Nena</strong>
                  <span>Electrician • 8 years exp</span>
                  <small>📍 1.2km away • Barangay Sta. Cruz</small>
                </div>
              </div>
            </div>
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
                <span class="benefit-icon">📝</span>
                <span>Create your professional profile for free</span>
              </li>
              <li>
                <span class="benefit-icon">🔧</span>
                <span>List all your skills and experience</span>
              </li>
              <li>
                <span class="benefit-icon">📍</span>
                <span>Show your location to nearby customers</span>
              </li>
              <li>
                <span class="benefit-icon">📸</span>
                <span>Upload photos of your work</span>
              </li>
              <li>
                <span class="benefit-icon">💼</span>
                <span>Get job opportunities in your barangay</span>
              </li>
            </ul>

            <router-link to="/register?type=worker" class="btn btn-primary btn-large">
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
              "Dahil sa Alalay Connect, marami na akong bagong customers sa barangay namin. Malaking tulong sa kabuhayan
              ko."
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

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-card">
          <h2>Ready to get help or offer your skills?</h2>
          <p>Join Alalay Connect today and be part of your local community</p>
          <div class="cta-buttons">
            <router-link to="/register" class="btn btn-primary btn-large">Sign Up Now</router-link>
            <router-link to="/login" class="btn btn-outline-light btn-large">Log In</router-link>
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
              <span class="logo-icon">🤝</span>
              <span class="logo-text">Alalay<span class="highlight">Connect</span></span>
            </div>
            <p>Connecting communities through skills and service.</p>
            <div class="social-links">
              <a href="#" class="social-link" aria-label="Facebook">📘</a>
              <a href="#" class="social-link" aria-label="Instagram">📷</a>
              <a href="#" class="social-link" aria-label="Twitter">🐦</a>
              <a href="#" class="social-link" aria-label="TikTok">📱</a>
            </div>
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
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Contact</h4>
            <ul class="contact-info">
              <li>📧 hello@alalayconnect.com</li>
              <li>📱 (02) 1234 5678</li>
              <li>📍 Metro Manila, Philippines</li>
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
const searchQuery = ref('')

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

.logo-icon {
  font-size: 2rem;
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

.btn-outline-light {
  border: 2px solid white;
  color: white;
  background: transparent;
}

.btn-outline-light:hover {
  background: white;
  color: #4f46e5;
}

.btn-large {
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
}

.btn-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.btn-primary:hover .btn-icon {
  transform: translateX(5px);
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
  display: block;
  font-size: 1.2rem;
  color: #4f46e5;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.main-title {
  font-size: 3rem;
  line-height: 1.2;
  font-weight: 800;
  color: #333;
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

/* Hero Image - CSS Illustration */
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

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }
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
  font-size: 3rem;
  margin-bottom: 1rem;
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
  font-size: 3rem;
  margin-bottom: 1rem;
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

/* Demo Search */
.demo-search {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.search-box {
  display: flex;
  gap: 1rem;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
}

.search-input-wrapper input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e0e0e0;
  border-radius: 30px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input-wrapper input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.search-btn {
  padding: 1rem 2rem;
  border-radius: 30px;
  white-space: nowrap;
}

.search-preview {
  margin-top: 2rem;
  animation: slideDown 0.5s ease;
}

.preview-results {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f5f3ff;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.preview-card:hover {
  transform: translateX(5px);
  background: #ede9fe;
}

.preview-avatar {
  font-size: 2rem;
}

.preview-info {
  display: flex;
  flex-direction: column;
}

.preview-info small {
  color: #4f46e5;
  font-size: 0.85rem;
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
  font-size: 1.5rem;
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

/* CTA Section */
.cta-section {
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}

.cta-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  padding: 4rem;
  text-align: center;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cta-card h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.cta-card p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
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

.footer-col p {
  opacity: 0.7;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: white;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: #4f46e5;
  transform: translateY(-3px);
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

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

/* Animations */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
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

  .cta-card {
    padding: 2rem;
  }

  .cta-card h2 {
    font-size: 1.8rem;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .footer-grid {
    grid-template-columns: 1fr;
  }

  .floating-card {
    display: none;
  }
}
</style>