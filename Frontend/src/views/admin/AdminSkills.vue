<template>
    <div class="admin-skills">
        <AdminSidebar />

        <div class="main-content">
            <div class="page-header">
                <div class="header-left">
                    <h1>Skill Management</h1>
                    <p class="subtitle">Add, edit, or remove skills from the system</p>
                </div>
                <div class="stats-summary">
                    <div class="stat-badge">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.7 6.3L19 2L20.7 3.7L16.4 8" stroke="currentColor" stroke-width="1.5" />
                            <path d="M9 12L12 9M7 17L12 12M11 19L19 11" stroke="currentColor" stroke-width="1.5" />
                        </svg>
                        <span>{{ skills.length }} skills total</span>
                    </div>
                </div>
            </div>

            <!-- Add New Skill -->
            <div class="add-skill-card">
                <div class="card-header">
                    <h3>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="1.5"
                                stroke-linecap="round" />
                        </svg>
                        Add New Skill
                    </h3>
                </div>
                <div class="add-skill-form">
                    <div class="input-wrapper">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.7 6.3L19 2L20.7 3.7L16.4 8" stroke="currentColor" stroke-width="1.5" />
                            <path d="M9 12L12 9M7 17L12 12M11 19L19 11" stroke="currentColor" stroke-width="1.5" />
                        </svg>
                        <input type="text" v-model="newSkillName" placeholder="Enter skill name..." class="skill-input"
                            @keyup.enter="addSkill" />
                    </div>
                    <button @click="addSkill" class="btn-add">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2" stroke-linecap="round" />
                        </svg>
                        Add Skill
                    </button>
                </div>
            </div>

            <!-- Skills List -->
            <div class="skills-container">
                <div class="section-header">
                    <h3>All Skills</h3>
                    <span class="skill-count">{{ skills.length }} skills</span>
                </div>

                <div v-if="loading" class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading skills...</p>
                </div>

                <div v-else class="skills-grid">
                    <div v-for="skill in skills" :key="skill.skill_id" class="skill-card">
                        <div v-if="editingId === skill.skill_id" class="skill-edit">
                            <div class="edit-input-wrapper">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14.7 6.3L19 2L20.7 3.7L16.4 8" stroke="currentColor" stroke-width="1.5" />
                                    <path d="M9 12L12 9M7 17L12 12M11 19L19 11" stroke="currentColor"
                                        stroke-width="1.5" />
                                </svg>
                                <input type="text" v-model="editName" class="edit-input"
                                    @keyup.enter="saveSkill(skill.skill_id)" />
                            </div>
                            <div class="edit-actions">
                                <button @click="saveSkill(skill.skill_id)" class="btn-save">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20 6L9 17L4 12" stroke="white" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                    </svg>
                                    Save
                                </button>
                                <button @click="cancelEdit" class="btn-cancel">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    Cancel
                                </button>
                            </div>
                        </div>
                        <div v-else class="skill-display">
                            <div class="skill-info">
                                <span class="skill-name">{{ skill.name }}</span>
                            </div>
                            <div class="skill-actions">
                                <button @click="startEdit(skill)" class="action-btn edit" title="Edit skill">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17 3L21 7L7 21H3V17L17 3Z" stroke="currentColor" stroke-width="1.5"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </button>
                                <button @click="confirmDeleteSkill(skill)" class="action-btn delete"
                                    title="Delete skill">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M4 7H20M10 11V16M14 11V16M5 7L6 19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19L19 7"
                                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                                        <path d="M9 7V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V7"
                                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-if="!loading && skills.length === 0" class="empty-state">
                    <div class="empty-icon">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.7 6.3L19 2L20.7 3.7L16.4 8" stroke="currentColor" stroke-width="1.5" />
                            <path d="M9 12L12 9M7 17L12 12M11 19L19 11" stroke="currentColor" stroke-width="1.5" />
                        </svg>
                    </div>
                    <h3>No skills added yet</h3>
                    <p>Start by adding your first skill above</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { getAllSkillsAdmin, createSkill, updateSkill, deleteSkill as apiDeleteSkill } from '@/api/adminService'

const loading = ref(true)
const skills = ref([])
const newSkillName = ref('')
const editingId = ref(null)
const editName = ref('')

const loadSkills = async () => {
    loading.value = true
    try {
        const response = await getAllSkillsAdmin()
        skills.value = response
    } catch (error) {
        console.error('Error loading skills:', error)
    } finally {
        loading.value = false
    }
}

const addSkill = async () => {
    if (!newSkillName.value.trim()) return

    try {
        await createSkill(newSkillName.value.trim())
        newSkillName.value = ''
        await loadSkills()
    } catch (error) {
        console.error('Error adding skill:', error)
        alert('Failed to add skill')
    }
}

const startEdit = (skill) => {
    editingId.value = skill.skill_id
    editName.value = skill.name
}

const saveSkill = async (id) => {
    if (!editName.value.trim()) return

    try {
        await updateSkill(id, editName.value.trim())
        editingId.value = null
        await loadSkills()
    } catch (error) {
        console.error('Error updating skill:', error)
        alert('Failed to update skill')
    }
}

const cancelEdit = () => {
    editingId.value = null
    editName.value = ''
}

const confirmDeleteSkill = async (skill) => {
    if (!confirm(`Delete "${skill.name}"? This action cannot be undone.`)) return

    try {
        await apiDeleteSkill(skill.skill_id)
        await loadSkills()
    } catch (error) {
        console.error('Error deleting skill:', error)
        alert(error.response?.data?.message || 'Failed to delete skill')
    }
}

onMounted(() => {
    loadSkills()
})
</script>

<style scoped>
.admin-skills {
    display: flex;
    min-height: 100vh;
    background: #f8fafc;
}

.main-content {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
}

.page-header {
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1rem;
}

.header-left h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
}

.subtitle {
    color: #64748b;
    font-size: 0.9rem;
}

.stats-summary {
    background: white;
    padding: 0.5rem 1rem;
    border-radius: 30px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #4f46e5;
    font-weight: 600;
}

.stat-badge svg {
    stroke: #4f46e5;
}

/* Add Skill Card */
.add-skill-card {
    background: white;
    border-radius: 20px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    border: 1px solid #f1f5f9;
    transition: all 0.3s ease;
}

.add-skill-card:hover {
    box-shadow: 0 8px 25px rgba(79, 70, 229, 0.1);
    border-color: #e0e7ff;
}

.card-header h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #1e293b;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    font-weight: 600;
}

.card-header h3 svg {
    stroke: #4f46e5;
}

.add-skill-form {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.input-wrapper {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
}

.input-wrapper svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    stroke: #94a3b8;
    pointer-events: none;
}

.skill-input {
    width: 100%;
    padding: 0.85rem 1rem 0.85rem 2.5rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 1rem;
    transition: all 0.3s ease;
}

.skill-input:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.btn-add {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.85rem 1.5rem;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.btn-add:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
}

.btn-add svg {
    stroke: white;
}

/* Skills Container */
.skills-container {
    background: white;
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    border: 1px solid #f1f5f9;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #f1f5f9;
}

.section-header h3 {
    color: #1e293b;
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
}

.skill-count {
    padding: 0.25rem 0.75rem;
    background: #f1f5f9;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #4f46e5;
}

.skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 0.75rem;
}

.skill-card {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    background: white;
}

.skill-card:hover {
    border-color: #cbd5e1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.skill-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.875rem 1rem;
}

.skill-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.skill-icon {
    font-size: 1.2rem;
}

.skill-name {
    font-size: 0.95rem;
    font-weight: 500;
    color: #1e293b;
}

.skill-actions {
    display: flex;
    gap: 0.5rem;
}

.action-btn {
    width: 34px;
    height: 34px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.action-btn svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
}

.action-btn.edit {
    background: #e0e7ff;
    color: #4f46e5;
}

.action-btn.edit:hover {
    background: #c7d2fe;
    transform: scale(1.05);
}

.action-btn.delete {
    background: #fee2e2;
    color: #ef4444;
}

.action-btn.delete:hover {
    background: #fecaca;
    transform: scale(1.05);
}

/* Edit Mode */
.skill-edit {
    padding: 0.875rem 1rem;
    background: #f8fafc;
}

.edit-input-wrapper {
    position: relative;
    margin-bottom: 0.75rem;
}

.edit-input-wrapper svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    stroke: #94a3b8;
    pointer-events: none;
}

.edit-input {
    width: 100%;
    padding: 0.6rem 0.6rem 0.6rem 2rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.9rem;
    transition: all 0.3s ease;
}

.edit-input:focus {
    outline: none;
    border-color: #4f46e5;
}

.edit-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-save {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-save:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

.btn-save svg {
    stroke: white;
}

.btn-cancel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: #f1f5f9;
    color: #64748b;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-cancel:hover {
    background: #e2e8f0;
}

.btn-cancel svg {
    stroke: currentColor;
}

/* Loading State */
.loading-state {
    text-align: center;
    padding: 4rem;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #e0e7ff;
    border-top: 4px solid #4f46e5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 4rem;
}

.empty-icon {
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
}

.empty-icon svg {
    stroke: #94a3b8;
    opacity: 0.5;
}

.empty-state h3 {
    color: #1e293b;
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
}

.empty-state p {
    color: #64748b;
}

/* Responsive */
@media (max-width: 768px) {
    .main-content {
        padding: 1rem;
    }

    .add-skill-form {
        flex-direction: column;
    }

    .btn-add {
        width: 100%;
        justify-content: center;
    }

    .skills-grid {
        grid-template-columns: 1fr;
    }

    .page-header {
        flex-direction: column;
    }

    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}
</style>