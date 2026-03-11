<script setup>
import { ref, onMounted } from "vue";
import {
    createSkilledProfile,
    uploadGovID,
    uploadCertificate,
    uploadProfileImage,
    updateSkilledLocation,
    addSkillsToProfile,
    getMySkills,
    removeSkillFromProfile,
    getAllSkills,
} from "@/api/skilledProfiles";

// Existing refs - KEEPING ALL ORIGINAL LOGIC
const bio = ref("");
const yearsExperience = ref("");
const govID = ref(null);
const certificate = ref(null);
const profileImage = ref(null);
const latitude = ref(null);
const longitude = ref(null);

// Skills refs
const availableSkills = ref([]);
const selectedSkills = ref([]);
const mySkills = ref([]);
const showSkillSelector = ref(false);
const loadingSkills = ref(false);

// UI state
const loading = ref(false);
const message = ref("");
const error = ref("");

// Handle file selection - ORIGINAL LOGIC PRESERVED
const handleFile = (event, type) => {
    const file = event.target.files[0];
    if (type === "gov") govID.value = file;
    if (type === "cert") certificate.value = file;
    if (type === "profile") profileImage.value = file;
};

// Get geolocation - ORIGINAL LOGIC PRESERVED
const getLocation = () => {
    if (!navigator.geolocation) {
        error.value = "Geolocation is not supported by your browser.";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            latitude.value = position.coords.latitude;
            longitude.value = position.coords.longitude;
        },
        (err) => {
            console.error("Geolocation error:", err);
            error.value = "Unable to get your location. Please enable location services.";
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
};

// Toggle skill selection - ORIGINAL LOGIC PRESERVED
const toggleSkill = (skillId) => {
    const index = selectedSkills.value.indexOf(skillId);
    if (index === -1) {
        selectedSkills.value.push(skillId);
    } else {
        selectedSkills.value.splice(index, 1);
    }
};

// Load all available skills from database - ORIGINAL LOGIC PRESERVED
const loadAllSkills = async () => {
    loadingSkills.value = true;
    try {
        const skills = await getAllSkills();
        availableSkills.value = skills;
    } catch (err) {
        console.error("Failed to load skills:", err);
        error.value = "Failed to load skills. Please refresh the page.";
    } finally {
        loadingSkills.value = false;
    }
};

// Load my skills on mount - ORIGINAL LOGIC PRESERVED
const loadMySkills = async () => {
    try {
        const skills = await getMySkills();
        mySkills.value = skills;
    } catch (err) {
        console.error("Failed to load skills:", err);
    }
};

// Remove a skill - ORIGINAL LOGIC PRESERVED
const handleRemoveSkill = async (skillId) => {
    try {
        await removeSkillFromProfile(skillId);
        mySkills.value = mySkills.value.filter(s => s.skill_id !== skillId);
        message.value = "Skill removed successfully!";
        setTimeout(() => message.value = "", 3000);
    } catch (err) {
        error.value = err.response?.data?.message || "Failed to remove skill";
    }
};

// Submit professional - ORIGINAL LOGIC PRESERVED EXACTLY
const submitProfessional = async () => {
    error.value = "";
    message.value = "";

    if (!bio.value || !yearsExperience.value || !govID.value || !certificate.value || !profileImage.value) {
        error.value = "Try to fill all the fields in order to proceed";
        return;
    }

    if (!latitude.value || !longitude.value) {
        error.value = "Waiting for your location… please allow location access.";
        return;
    }

    if (selectedSkills.value.length === 0) {
        error.value = "Please select at least one skill.";
        return;
    }
    if (!govID.value) {
        error.value = "please add something in the govID"
        return;
    }

    loading.value = true;

    try {
        // 1️⃣ Create profile
        await createSkilledProfile({
            bio: bio.value,
            years_experience: yearsExperience.value,
        });

        // 2️⃣ Upload files
        if (govID.value) await uploadGovID(govID.value);
        if (certificate.value) await uploadCertificate(certificate.value);
        if (profileImage.value) await uploadProfileImage(profileImage.value);

        // 3️⃣ Add skills
        await addSkillsToProfile(selectedSkills.value);

        // 4️⃣ Send location
        await updateSkilledLocation({
            latitude: Number(latitude.value),
            longitude: Number(longitude.value),
            barangay: "Unknown",
            city: "Unknown",
        });

        message.value = "Professional profile successfully created!";

        // Load the newly added skills
        await loadMySkills();
        showSkillSelector.value = false;

    } catch (err) {
        console.error(err);
        error.value = err.response?.data?.message || "Something went wrong.";
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    getLocation();
    loadMySkills();
    loadAllSkills();
});
</script>

<template>
    <div class="professional-container">
        <div class="professional-card">
            <!-- Header with decorative element -->
            <div class="card-header">
                <div class="header-icon">
                    <svg viewBox="0 0 24 24" width="48" height="48">
                        <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                </div>
                <h2>Become a Verified Professional</h2>
                <p class="subtitle">Complete your profile to start offering your services</p>
            </div>

            <!-- Messages -->
            <transition name="fade">
                <div v-if="message" class="message success">
                    <svg class="message-icon" viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    {{ message }}
                </div>
            </transition>
            
            <transition name="fade">
                <div v-if="error" class="message error">
                    <svg class="message-icon" viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    {{ error }}
                </div>
            </transition>

            <!-- My Skills Section -->
            <div v-if="mySkills.length > 0" class="section my-skills-section">
                <div class="section-header">
                    <h3>My Skills</h3>
                    <span class="skill-count">{{ mySkills.length }} skills</span>
                </div>
                <div class="skills-list">
                    <div v-for="skill in mySkills" :key="skill.skill_id" class="skill-tag">
                        {{ skill.name }}
                        <button @click="handleRemoveSkill(skill.skill_id)" class="remove-skill" title="Remove skill">×</button>
                    </div>
                </div>
                <button @click="showSkillSelector = !showSkillSelector" class="toggle-btn">
                    <svg v-if="!showSkillSelector" viewBox="0 0 24 24" width="18" height="18">
                        <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" width="18" height="18">
                        <path fill="currentColor" d="M19 13H5v-2h14v2z"/>
                    </svg>
                    {{ showSkillSelector ? 'Cancel' : 'Add More Skills' }}
                </button>
            </div>

            <!-- Skill Selector -->
            <div v-if="showSkillSelector || mySkills.length === 0" class="section skills-section">
                <div class="section-header">
                    <h3>{{ mySkills.length > 0 ? 'Add New Skills' : 'Select Your Skills' }}</h3>
                    <span v-if="selectedSkills.length > 0" class="selected-badge">
                        {{ selectedSkills.length }} selected
                    </span>
                </div>

                <!-- Loading state -->
                <div v-if="loadingSkills" class="loading-state">
                    <div class="spinner"></div>
                    <span>Loading skills...</span>
                </div>

                <!-- Skills grid -->
                <div v-else class="skills-grid">
                    <div 
                        v-for="skill in availableSkills" 
                        :key="skill.skill_id" 
                        @click="toggleSkill(skill.skill_id)"
                        :class="['skill-card', { 
                            selected: selectedSkills.includes(skill.skill_id),
                            'existing-skill': mySkills.some(s => s.skill_id === skill.skill_id)
                        }]"
                    >
                        {{ skill.name }}
                        <span v-if="selectedSkills.includes(skill.skill_id)" class="check-icon">✓</span>
                    </div>
                </div>
            </div>

            <!-- Profile Form - ORIGINAL STRUCTURE PRESERVED -->
            <form @submit.prevent="submitProfessional" class="professional-form">
                <!-- Bio -->
                <div class="form-group">
                    <label>
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2z"/>
                        </svg>
                        Bio
                    </label>
                    <textarea 
                        v-model="bio" 
                        placeholder="Describe your skills and experience..."
                        rows="4"
                    ></textarea>
                </div>

                <!-- Years of Experience -->
                <div class="form-group">
                    <label>
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                        </svg>
                        Years of Experience
                    </label>
                    <input 
                        type="number" 
                        v-model="yearsExperience" 
                        min="0" 
                        placeholder="0"
                    />
                </div>

                <!-- Government ID -->
                <div class="form-group">
                    <label>
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM7 12h4v2H7z"/>
                        </svg>
                        Government ID
                    </label>
                    <div class="file-input-wrapper">
                        <input 
                            type="file" 
                            @change="(e) => handleFile(e, 'gov')" 
                            accept="image/*,.pdf"
                            id="gov-input"
                        />
                        <label for="gov-input" class="file-input-label">
                            <svg viewBox="0 0 24 24" width="18" height="18">
                                <path fill="currentColor" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                            </svg>
                            <span>{{ govID ? govID.name : 'Choose file...' }}</span>
                        </label>
                    </div>
                </div>

                <!-- Certificate -->
                <div class="form-group">
                    <label>
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <path fill="currentColor" d="M4 6h16v2H4zm2-4h12v2H6zm14 8H4v6h16v-6zM4 20h16v2H4z"/>
                        </svg>
                        Certificate
                    </label>
                    <div class="file-input-wrapper">
                        <input 
                            type="file" 
                            @change="(e) => handleFile(e, 'cert')" 
                            accept="image/*,.pdf"
                            id="cert-input"
                        />
                        <label for="cert-input" class="file-input-label">
                            <svg viewBox="0 0 24 24" width="18" height="18">
                                <path fill="currentColor" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                            </svg>
                            <span>{{ certificate ? certificate.name : 'Choose file...' }}</span>
                        </label>
                    </div>
                </div>

                <!-- Profile Image -->
                <div class="form-group">
                    <label>
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <path fill="currentColor" d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM8 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                        Profile Image
                    </label>
                    <div class="file-input-wrapper">
                        <input 
                            type="file" 
                            @change="(e) => handleFile(e, 'profile')" 
                            accept="image/*"
                            id="profile-input"
                        />
                        <label for="profile-input" class="file-input-label">
                            <svg viewBox="0 0 24 24" width="18" height="18">
                                <path fill="currentColor" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                            </svg>
                            <span>{{ profileImage ? profileImage.name : 'Choose file...' }}</span>
                        </label>
                    </div>
                </div>

                <!-- Location Status -->
                <div class="location-status" :class="{ 'location-ready': latitude && longitude }">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span>
                        {{ latitude && longitude ? '📍 Location detected' : '⏳ Detecting your location...' }}
                    </span>
                </div>

                <!-- Submit Button -->
                <button type="submit" :disabled="loading" class="submit-btn">
                    <span v-if="loading" class="spinner-small"></span>
                    <svg v-else viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    {{ loading ? "Processing..." : "Submit for Verification" }}
                </button>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* Container */
.professional-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem 1rem;
}

/* Card */
.professional-card {
    width: 100%;
    max-width: 700px;
    background: white;
    border-radius: 30px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    overflow: hidden;
    animation: slideUp 0.5s ease;
}

/* Header */
.card-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2.5rem 2rem;
    text-align: center;
    color: white;
}

.header-icon {
    margin-bottom: 1rem;
    animation: bounce 2s infinite;
}

.card-header h2 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    letter-spacing: -0.5px;
}

.subtitle {
    font-size: 1rem;
    opacity: 0.9;
    margin: 0;
}

/* Sections */
.section {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #f0f0f0;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
}

.section-header h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.skill-count,
.selected-badge {
    font-size: 0.85rem;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-weight: 500;
}

.skill-count {
    background: #f0f0f0;
    color: #666;
}

.selected-badge {
    background: #667eea;
    color: white;
}

/* Skills List */
.skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
}

.skill-tag {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 30px;
    font-size: 0.9rem;
    font-weight: 500;
    box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);
    transition: all 0.3s ease;
}

.skill-tag:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(102, 126, 234, 0.3);
}

.remove-skill {
    background: none;
    border: none;
    color: white;
    margin-left: 0.5rem;
    padding: 0 0.2rem;
    font-size: 1.3rem;
    line-height: 1;
    cursor: pointer;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.remove-skill:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
}

/* Toggle Button */
.toggle-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.2rem;
    background: #f8f9fa;
    border: 2px solid #e0e0e0;
    border-radius: 30px;
    color: #555;
    font-weight: 500;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    width: auto;
    margin: 0;
}

.toggle-btn:hover {
    background: #f0f0f0;
    border-color: #667eea;
    transform: translateY(-2px);
}

/* Skills Grid */
.skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 0.75rem;
    margin-top: 1rem;
}

.skill-card {
    position: relative;
    padding: 0.9rem 0.5rem;
    background: #f8f9fa;
    border: 2px solid transparent;
    border-radius: 12px;
    color: #333;
    font-size: 0.9rem;
    font-weight: 500;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.skill-card:hover:not(.existing-skill) {
    background: #e8eef9;
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.2);
}

.skill-card.selected {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: white;
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.skill-card.existing-skill {
    opacity: 0.5;
    cursor: not-allowed;
    background: #e0e0e0;
}

.check-icon {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 22px;
    height: 22px;
    background: #52c41a;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Form */
.professional-form {
    padding: 2rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    color: #444;
    font-weight: 600;
    font-size: 0.95rem;
}

.form-group label svg {
    color: #667eea;
}

.form-group textarea,
.form-group input[type="number"] {
    width: 100%;
    padding: 0.9rem 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: #fafafa;
}

.form-group textarea:focus,
.form-group input[type="number"]:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
    resize: vertical;
    min-height: 100px;
}

/* File Input */
.file-input-wrapper {
    position: relative;
}

.file-input-wrapper input[type="file"] {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
}

.file-input-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.9rem 1rem;
    background: #fafafa;
    border: 2px dashed #e0e0e0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #666;
    font-weight: 500;
}

.file-input-label:hover {
    border-color: #667eea;
    background: #f0f4ff;
}

.file-input-label svg {
    color: #667eea;
}

/* Location Status */
.location-status {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 12px;
    margin: 1.5rem 0;
    border: 2px solid #e0e0e0;
}

.location-status svg {
    color: #ff9800;
}

.location-status.location-ready svg {
    color: #4caf50;
}

.location-status.location-ready {
    background: #f1f8e9;
    border-color: #4caf50;
}

/* Submit Button */
.submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 700;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);
}

.submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 12px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Messages */
.message {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    margin: 0;
    animation: slideDown 0.3s ease;
}

.message.success {
    background: #f6ffed;
    color: #52c41a;
    border-bottom: 1px solid #b7eb8f;
}

.message.error {
    background: #fff2f0;
    color: #ff4d4f;
    border-bottom: 1px solid #ffccc7;
}

.message-icon {
    flex-shrink: 0;
}

/* Loading States */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 3rem;
    color: #666;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.spinner-small {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255,255,255,0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

/* Animations */
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

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

@keyframes bounce {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-10px);
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
    .card-header {
        padding: 2rem 1.5rem;
    }
    
    .card-header h2 {
        font-size: 1.5rem;
    }
    
    .section {
        padding: 1.25rem 1.5rem;
    }
    
    .professional-form {
        padding: 1.5rem;
    }
    
    .skills-grid {
        grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    }
}
</style>