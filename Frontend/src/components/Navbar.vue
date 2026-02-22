<script setup>
import { ref } from "vue";
import { searchSkilledWorkers } from "@/api/skilledProfiles";

const workers = ref([]);
const loading = ref(false);
const error = ref("");
const skillFilter = ref("");
const isSideNavOpen = ref(false);

const getUserLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) reject("Geolocation not supported");
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => reject(err.message)
        );
    });
};

const fetchWorkers = async () => {
    loading.value = true;
    error.value = "";
    workers.value = []; // clear previous results
    try {
        const { lat, lng } = await getUserLocation();
        const data = await searchSkilledWorkers(lat, lng, skillFilter.value);
        workers.value = data;
    } catch (err) {
        error.value = err.toString();
    } finally {
        loading.value = false;
    }
};

const toggleSideNav = () => {
    isSideNavOpen.value = !isSideNavOpen.value;
};
</script>

<template>
    <div>
        <!-- Navbar -->
        <nav class="navbar">
            <div class="nav-brand">alalay_connect</div>

            <div class="nav-search">
                <input v-model="skillFilter" placeholder="Filter by skill (optional)" @keyup.enter="fetchWorkers" />
                <button @click="fetchWorkers">Search</button>
            </div>

            <!-- Hamburger Menu Button -->
            <div class="nav-menu" @click="toggleSideNav">
                <div class="hamburger-icon">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </nav>

        <!-- Side Navigation -->
        <div class="sidenav-overlay" v-if="isSideNavOpen" @click="toggleSideNav"></div>
        <div class="sidenav" :class="{ 'sidenav-open': isSideNavOpen }">
            <div class="sidenav-header">
                <h3>Menu</h3>
                <button class="close-btn" @click="toggleSideNav">&times;</button>
            </div>
            <div class="sidenav-content">
                <router-link to="/" class="sidenav-link" @click="toggleSideNav">
                    <span class="link-icon">🏠</span>
                    Home
                </router-link>
                <router-link to="/profile" class="sidenav-link" @click="toggleSideNav">
                    <span class="link-icon">👤</span>
                    Profile
                </router-link>
                <router-link to="/messages" class="sidenav-link" @click="toggleSideNav">
                    <span class="link-icon">💬</span>
                    Messages
                </router-link>
                <router-link to="/settings" class="sidenav-link" @click="toggleSideNav">
                    <span class="link-icon">⚙️</span>
                    Settings
                </router-link>
                <router-link to="/help" class="sidenav-link" @click="toggleSideNav">
                    <span class="link-icon">❓</span>
                    Help
                </router-link>
                <router-link to="/about" class="sidenav-link" @click="toggleSideNav">
                    <span class="link-icon">ℹ️</span>
                    About
                </router-link>
            </div>
        </div>

        <!-- Main Content -->
        <div class="container">
            <div v-if="loading" class="status">Loading workers...</div>
            <div v-if="error" class="status error">{{ error }}</div>

            <!-- Only show cards if there are results -->
            <div v-if="workers.length > 0" class="grid">
                <div v-for="worker in workers" :key="worker.user_id" class="card">
                    <h3>{{ worker.fullName }}</h3>
                    <p class="bio">{{ worker.bio }}</p>
                    <p class="bio">{{ worker.name }}</p>
                    <p>Experience: {{ worker.years_experience }} years</p>
                    <p>Distance: {{ worker.distance.toFixed(2) }} km</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Navbar Styles */
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.nav-brand {
    font-size: 1.5rem;
    font-weight: bold;
    color: #007bff;
    text-decoration: none;
    letter-spacing: 0.5px;
    flex: 1;
}

.nav-search {
    display: flex;
    gap: 0.5rem;
    flex: 2;
    justify-content: center;
    max-width: 500px;
}

.nav-search input {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: 1px solid #ccc;
    outline: none;
    width: 100%;
    max-width: 300px;
}

.nav-search input:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.nav-search button {
    padding: 0.5rem 1.2rem;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.3s;
    white-space: nowrap;
}

.nav-search button:hover {
    background-color: #0056b3;
}

/* Hamburger Menu */
.nav-menu {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    cursor: pointer;
}

.hamburger-icon {
    width: 30px;
    height: 20px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.hamburger-icon span {
    width: 100%;
    height: 3px;
    background-color: #007bff;
    border-radius: 3px;
    transition: 0.3s;
}

/* Side Navigation */
.sidenav-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1001;
    backdrop-filter: blur(3px);
}

.sidenav {
    position: fixed;
    top: 0;
    right: -300px;
    width: 280px;
    height: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    z-index: 1002;
    transition: right 0.3s ease;
    border-left: 1px solid rgba(255, 255, 255, 0.3);
}

.sidenav-open {
    right: 0;
}

.sidenav-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.sidenav-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.2rem;
}

.close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: 0.3s;
}

.close-btn:hover {
    background-color: rgba(0, 0, 0, 0.1);
    color: #333;
}

.sidenav-content {
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
}

.sidenav-link {
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    color: #333;
    text-decoration: none;
    transition: 0.3s;
    gap: 1rem;
}

.sidenav-link:hover {
    background-color: rgba(0, 123, 255, 0.1);
    color: #007bff;
}

.link-icon {
    font-size: 1.2rem;
    width: 24px;
}

/* Main Content Styles */
.container {
    max-width: 1000px;
    margin: 2rem auto;
    padding: 0 1rem;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.status {
    text-align: center;
    margin: 1rem 0;
    color: #555;
}

.status.error {
    color: #d9534f;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.card {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 1.2rem;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s, box-shadow 0.3s;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
}

.card h3 {
    margin: 0 0 0.5rem 0;
    color: #222;
}

.card .bio {
    font-style: italic;
    margin-bottom: 0.5rem;
    color: #555;
}

.card p {
    margin: 0.2rem 0;
    color: #333;
}

/* Responsive Design */
@media (max-width: 768px) {
    .navbar {
        padding: 1rem;
    }

    .nav-search {
        max-width: 300px;
    }

    .nav-search input {
        max-width: 180px;
    }

    .nav-brand {
        font-size: 1.2rem;
    }

    .sidenav {
        width: 250px;
    }
}
</style>