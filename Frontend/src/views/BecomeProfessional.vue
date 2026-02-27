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
    getAllSkills, // You'll need to create this function
} from "@/api/skilledProfiles";

// Existing refs
const bio = ref("");
const yearsExperience = ref("");
const govID = ref(null);
const certificate = ref(null);
const profileImage = ref(null);
const latitude = ref(null);
const longitude = ref(null);

// Skills refs
const availableSkills = ref([]); // Will be populated from database
const selectedSkills = ref([]);
const mySkills = ref([]);
const showSkillSelector = ref(false);
const loadingSkills = ref(false);

// UI state
const loading = ref(false);
const message = ref("");
const error = ref("");

// Handle file selection
const handleFile = (event, type) => {
    const file = event.target.files[0];
    if (type === "gov") govID.value = file;
    if (type === "cert") certificate.value = file;
    if (type === "profile") profileImage.value = file;
};

// Get geolocation
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

// Toggle skill selection
const toggleSkill = (skillId) => {
    const index = selectedSkills.value.indexOf(skillId);
    if (index === -1) {
        selectedSkills.value.push(skillId);
    } else {
        selectedSkills.value.splice(index, 1);
    }
};

// Load all available skills from database
const loadAllSkills = async () => {
    loadingSkills.value = true;
    try {
        // You'll need to create this API function
        const skills = await getAllSkills();
        availableSkills.value = skills;
    } catch (err) {
        console.error("Failed to load skills:", err);
        error.value = "Failed to load skills. Please refresh the page.";
    } finally {
        loadingSkills.value = false;
    }
};

// Load my skills on mount
const loadMySkills = async () => {
    try {
        const skills = await getMySkills();
        mySkills.value = skills;
    } catch (err) {
        console.error("Failed to load skills:", err);
    }
};

// Remove a skill
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

const submitProfessional = async () => {
    error.value = "";
    message.value = "";

    if (!bio.value || !yearsExperience.value || !govID.value || certificate.value || profileImage.value) {
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
    loadAllSkills(); // Load skills from database
});
</script>

<template>
    <div class="container">
        <div class="card">
            <h2>Become a Verified Professional</h2>

            <div v-if="message" class="success">{{ message }}</div>
            <div v-if="error" class="error">{{ error }}</div>

            <!-- My Skills Section (if already have skills) -->
            <div v-if="mySkills.length > 0" class="my-skills-section">
                <h3>My Skills</h3>
                <div class="skills-list">
                    <div v-for="skill in mySkills" :key="skill.skill_id" class="skill-tag">
                        {{ skill.name }}
                        <button @click="handleRemoveSkill(skill.skill_id)" class="remove-skill">×</button>
                    </div>
                </div>
                <button @click="showSkillSelector = !showSkillSelector" class="add-more-btn">
                    {{ showSkillSelector ? 'Cancel' : 'Add More Skills' }}
                </button>
            </div>

            <!-- Skill Selector -->
            <div v-if="showSkillSelector || mySkills.length === 0" class="skills-section">
                <h3>Select Your Skills</h3>

                <!-- Loading state -->
                <div v-if="loadingSkills" class="loading-skills">
                    Loading skills...
                </div>

                <!-- Skills grid -->
                <div v-else class="skills-grid">
                    <div v-for="skill in availableSkills" :key="skill.skill_id" @click="toggleSkill(skill.skill_id)"
                        :class="['skill-card', { selected: selectedSkills.includes(skill.skill_id) }]">
                        {{ skill.name }}
                    </div>
                </div>

                <p v-if="selectedSkills.length > 0" class="selected-count">
                    Selected: {{ selectedSkills.length }} skill(s)
                </p>
            </div>

            <!-- Profile Form -->
            <form @submit.prevent="submitProfessional">
                <label>Bio</label>
                <textarea v-model="bio" placeholder="Describe your skills"></textarea>

                <label>Years of Experience</label>
                <input type="number" v-model="yearsExperience" min="0" />

                <label>Government ID</label>
                <input type="file" @change="(e) => handleFile(e, 'gov')" accept="image/*,.pdf" />

                <label>Certificate</label>
                <input type="file" @change="(e) => handleFile(e, 'cert')" accept="image/*,.pdf" />

                <label>Profile Image</label>
                <input type="file" @change="(e) => handleFile(e, 'profile')" accept="image/*" />

                <button type="submit" :disabled="loading">
                    {{ loading ? "Processing..." : "Submit for Verification" }}
                </button>
            </form>

        </div>
    </div>
</template>

<style scoped>
.container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #4e73df, #1cc88a);
    padding: 1rem;
}

.card {
    width: 100%;
    max-width: 600px;
    padding: 2rem;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(15px);
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
}

h2,
h3 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #fff;
}

h3 {
    margin-bottom: 1rem;
    font-size: 1.2rem;
}

label {
    display: block;
    margin-top: 1rem;
    margin-bottom: 0.3rem;
    color: #fff;
    font-weight: 500;
}

textarea,
input {
    width: 100%;
    padding: 0.7rem;
    border-radius: 10px;
    border: none;
    background: rgba(255, 255, 255, 0.9);
}

textarea {
    resize: none;
    min-height: 100px;
}

input[type="file"] {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 0.5rem;
}

input[type="file"]::file-selector-button {
    background: white;
    border: none;
    padding: 0.3rem 1rem;
    border-radius: 5px;
    cursor: pointer;
}

button {
    margin-top: 1.5rem;
    width: 100%;
    padding: 0.8rem;
    border-radius: 10px;
    border: none;
    font-weight: bold;
    background: white;
    color: #4e73df;
    cursor: pointer;
    transition: 0.3s;
}

button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.success {
    background: rgba(0, 255, 127, 0.2);
    padding: 0.7rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    color: white;
    text-align: center;
}

.error {
    background: rgba(255, 0, 0, 0.555);
    padding: 0.7rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    color: white;
    text-align: center;
}

/* Skills Section Styles */
.skills-section,
.my-skills-section {
    margin-bottom: 2rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 10px;
}

.skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.skill-card {
    padding: 0.5rem;
    text-align: center;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 0.9rem;
}

.skill-card:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
}

.skill-card.selected {
    background: #4e73df;
    color: white;
    border: 2px solid white;
}

.skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.skill-tag {
    display: inline-flex;
    align-items: center;
    padding: 0.3rem 0.8rem;
    background: #4e73df;
    color: white;
    border-radius: 20px;
    font-size: 0.9rem;
}

.remove-skill {
    background: none;
    border: none;
    color: white;
    margin-left: 0.5rem;
    padding: 0 0.2rem;
    font-size: 1.2rem;
    line-height: 1;
    cursor: pointer;
    width: auto;
    margin-top: 0;
}

.remove-skill:hover {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
}

.add-more-btn {
    margin-top: 0.5rem;
    padding: 0.5rem;
    font-size: 0.9rem;
    background: rgba(255, 255, 255, 0.2);
    color: white;
}

.selected-count {
    color: white;
    font-size: 0.9rem;
    text-align: right;
    margin-top: 0.5rem;
}

.loading-skills {
    text-align: center;
    color: white;
    padding: 1rem;
    font-style: italic;
}
</style>