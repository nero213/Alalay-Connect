<template>
    <div class="admin-reports">
        <AdminSidebar />

        <div class="main-content">
            <div class="page-header">
                <div class="header-left">
                    <h1>Report Management</h1>
                    <p class="subtitle">Review and moderate reported content</p>
                </div>
                <div class="header-right">
                    <div class="refresh-btn" @click="refreshData">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M23 4V10H17M1 20V14H7" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                            <path
                                d="M20.49 9C19.9828 7.56678 19.1209 6.28537 17.9845 5.27542C16.8482 4.26546 15.4745 3.55976 14 3.22408C12.5255 2.8884 10.9902 2.93454 9.5358 3.35844C8.08145 3.78235 6.74986 4.57103 5.65 5.66L1 10M23 14L18.35 18.34C17.2501 19.429 15.9186 20.2176 14.4642 20.6416C13.0098 21.0655 11.4745 21.1116 10 20.7759C8.5255 20.4402 7.1518 19.7345 6.01547 18.7246C4.87914 17.7146 4.01718 16.4332 3.51 15"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                stroke="white" stroke-width="1.5" />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <h3>{{ stats.total_reports || 0 }}</h3>
                        <p>Total Reports</p>
                    </div>
                </div>
                <div class="stat-card pending">
                    <div class="stat-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                stroke="white" stroke-width="1.5" />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <h3>{{ stats.pending_reports || 0 }}</h3>
                        <p>Pending Review</p>
                    </div>
                </div>
                <div class="stat-card resolved">
                    <div class="stat-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="white" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <h3>{{ stats.resolved_reports || 0 }}</h3>
                        <p>Resolved</p>
                    </div>
                </div>
            </div>

            <!-- Filters -->
            <div class="filters-bar">
                <div class="filters">
                    <div class="filter-group">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 21V15M4 9V3M12 21V11M12 5V3M20 21V17M20 11V3M2 15H6M10 11H14M18 17H22"
                                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                        </svg>
                        <select v-model="statusFilter" class="filter-select">
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                                stroke="currentColor" stroke-width="1.5" />
                            <path d="M8 7H16M8 11H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                        </svg>
                        <select v-model="typeFilter" class="filter-select">
                            <option value="">All Types</option>
                            <option value="user">User Reports</option>
                            <option value="profile">Profile Reports</option>
                            <option value="review">Review Reports</option>
                            <option value="message">Message Reports</option>
                        </select>
                    </div>
                </div>
                <div class="results-info">
                    <span>{{ pagination.total || 0 }} reports found</span>
                </div>
            </div>

            <!-- Reports List -->
            <div v-if="loading" class="loading-state">
                <div class="spinner"></div>
                <p>Loading reports...</p>
            </div>

            <div v-else-if="reports.length === 0" class="empty-state">
                <div class="empty-icon">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </div>
                <h3>No Reports</h3>
                <p>All reports have been reviewed</p>
            </div>

            <div v-else class="reports-list">
                <div v-for="report in reports" :key="report.report_id" class="report-card">
                    <div class="report-header">
                        <div class="report-info">
                            <span class="report-id">#{{ report.report_id }}</span>
                            <span class="report-type" :class="report.type">{{ report.type }}</span>
                            <span class="report-status" :class="report.status">{{ report.status }}</span>
                        </div>
                        <span class="report-date">{{ formatDate(report.created_at) }}</span>
                    </div>

                    <div class="report-content">
                        <div class="info-row">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                                    stroke="currentColor" stroke-width="1.5" />
                                <path
                                    d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                                    stroke="currentColor" stroke-width="1.5" />
                            </svg>
                            <strong>Reported by:</strong> {{ report.reporter_firstName }} {{ report.reporter_lastName }}
                        </div>
                        <div class="info-row">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
                                    stroke="currentColor" stroke-width="1.5" />
                                <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21"
                                    stroke="currentColor" stroke-width="1.5" />
                            </svg>
                            <strong>Reported:</strong>
                            <span v-if="report.reported_firstName">
                                {{ report.reported_firstName }} {{ report.reported_lastName }}
                            </span>
                            <span v-else-if="report.skilled_firstName">
                                Skilled Worker: {{ report.skilled_firstName }} {{ report.skilled_lastName }}
                            </span>
                            <span v-else>Unknown</span>
                        </div>
                        <div class="info-row">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                    stroke="currentColor" stroke-width="1.5" />
                            </svg>
                            <strong>Reason:</strong> {{ report.reason }}
                        </div>
                        <div v-if="report.description" class="info-row">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 3L21 7L7 21H3V17L17 3Z" stroke="currentColor" stroke-width="1.5" />
                            </svg>
                            <strong>Details:</strong> {{ report.description }}
                        </div>

                        <!-- Show reported content -->
                        <div v-if="report.rating_review" class="reported-content">
                            <div class="reported-header">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2Z"
                                        fill="currentColor" stroke="currentColor" stroke-width="1.5" />
                                </svg>
                                <strong>Reported Review</strong>
                            </div>
                            <div class="content-box">
                                <p>"{{ report.rating_review }}"</p>
                                <div class="rating-display">
                                    <span class="stars">{{ getRatingStars(report.rating) }}</span>
                                    <span>{{ report.rating }} ★</span>
                                </div>
                            </div>
                        </div>

                        <div v-if="report.reported_message" class="reported-content">
                            <div class="reported-header">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                                        stroke="currentColor" stroke-width="1.5" />
                                </svg>
                                <strong>Reported Message</strong>
                            </div>
                            <div class="content-box">
                                <p>"{{ report.reported_message }}"</p>
                            </div>
                        </div>
                    </div>

                    <div class="report-actions">
                        <div class="notes-wrapper">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 3L21 7L7 21H3V17L17 3Z" stroke="currentColor" stroke-width="1.5" />
                            </svg>
                            <textarea v-model="adminNotes[report.report_id]" placeholder="Add admin notes..."
                                class="notes-input" rows="2"></textarea>
                        </div>
                        <div class="action-buttons">
                            <button v-if="report.type === 'review'" @click="resolveReport(report, 'hide_rating')"
                                class="action-btn hide">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                                        stroke="white" stroke-width="1.5" />
                                    <path
                                        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                                        stroke="white" stroke-width="1.5" />
                                </svg>
                                Hide Review
                            </button>
                            <button v-if="report.type === 'review'" @click="resolveReport(report, 'remove_rating')"
                                class="action-btn remove">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                Remove Review
                            </button>
                            <button v-if="report.type === 'message'" @click="resolveReport(report, 'hide_message')"
                                class="action-btn hide">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                                        stroke="white" stroke-width="1.5" />
                                    <path
                                        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                                        stroke="white" stroke-width="1.5" />
                                </svg>
                                Hide Message
                            </button>
                            <button v-if="report.reported_user_id" @click="resolveReport(report, 'warn_user')"
                                class="action-btn warn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M12 8V12M12 16H12.01M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                        stroke="white" stroke-width="1.5" />
                                </svg>
                                Warn User
                            </button>
                            <button v-if="report.reported_user_id" @click="resolveReport(report, 'suspend_user')"
                                class="action-btn suspend">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M18.364 5.63604L5.63604 18.364M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                        stroke="white" stroke-width="1.5" />
                                </svg>
                                Suspend User
                            </button>
                            <button @click="resolveReport(report, 'dismiss')" class="action-btn dismiss">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <div class="pagination" v-if="pagination.pages > 1">
                <button @click="changePage(pagination.page - 1)" :disabled="pagination.page === 1" class="page-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                    Previous
                </button>
                <div class="page-info">
                    <span class="current-page">{{ pagination.page }}</span>
                    <span>of</span>
                    <span class="total-pages">{{ pagination.pages }}</span>
                </div>
                <button @click="changePage(pagination.page + 1)" :disabled="pagination.page === pagination.pages"
                    class="page-btn">
                    Next
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { getAllReports, resolveReport as apiResolveReport, getReportStats } from '@/api/reportService'

const loading = ref(true)
const reports = ref([])
const pagination = ref({ page: 1, pages: 1, total: 0 })
const stats = ref({})
const statusFilter = ref('pending')
const typeFilter = ref('')
const adminNotes = ref({})

const loadReports = async () => {
    loading.value = true
    try {
        const params = {
            page: pagination.value.page,
            status: statusFilter.value,
            type: typeFilter.value
        }
        const response = await getAllReports(params)
        reports.value = response.reports
        pagination.value = response.pagination
    } catch (error) {
        console.error('Error loading reports:', error)
    } finally {
        loading.value = false
    }
}

const loadStats = async () => {
    try {
        const response = await getReportStats()
        stats.value = response
    } catch (error) {
        console.error('Error loading stats:', error)
    }
}

const refreshData = async () => {
    await Promise.all([loadReports(), loadStats()])
}

const resolveReport = async (report, action) => {
    try {
        await apiResolveReport(report.report_id, action, adminNotes.value[report.report_id])
        await loadReports()
        await loadStats()
    } catch (error) {
        console.error('Error resolving report:', error)
        alert('Failed to resolve report')
    }
}

const changePage = (page) => {
    pagination.value.page = page
    loadReports()
}

const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating || 0)
    return '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars)
}

watch([statusFilter, typeFilter], () => {
    pagination.value.page = 1
    loadReports()
})

onMounted(() => {
    loadReports()
    loadStats()
})
</script>

<style scoped>
.admin-reports {
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

.refresh-btn {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.refresh-btn:hover {
    background: #f1f5f9;
    transform: rotate(180deg);
}

.refresh-btn svg {
    stroke: #4f46e5;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: white;
    border-radius: 20px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    border: 1px solid #f1f5f9;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(79, 70, 229, 0.1);
}

.stat-card.pending {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.stat-card.resolved {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.stat-icon {
    width: 56px;
    height: 56px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.stat-icon svg {
    stroke: white;
}

.stat-info h3 {
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0 0 0.25rem;
    color: #1e293b;
}

.stat-info p {
    color: #64748b;
    margin: 0;
}

.stat-card.pending .stat-info p,
.stat-card.resolved .stat-info p {
    color: #1e293b;
    opacity: 0.7;
}

/* Filters Bar */
.filters-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.filters {
    display: flex;
    gap: 1rem;
}

.filter-group {
    position: relative;
    display: flex;
    align-items: center;
}

.filter-group svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    stroke: #94a3b8;
    pointer-events: none;
}

.filter-select {
    padding: 0.6rem 1rem 0.6rem 2.2rem;
    border: 2px solid #e2e8f0;
    border-radius: 30px;
    font-size: 0.9rem;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;
}

.filter-select:focus {
    outline: none;
    border-color: #4f46e5;
}

.results-info {
    color: #64748b;
    font-size: 0.9rem;
    font-weight: 500;
}

/* Reports List */
.reports-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.report-card {
    background: white;
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    border: 1px solid #f1f5f9;
}

.report-card:hover {
    box-shadow: 0 8px 24px rgba(79, 70, 229, 0.1);
    border-color: #e0e7ff;
}

.report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #f1f5f9;
}

.report-info {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
}

.report-id {
    font-family: monospace;
    font-weight: 600;
    color: #4f46e5;
    background: #e0e7ff;
    padding: 0.2rem 0.6rem;
    border-radius: 6px;
    font-size: 0.8rem;
}

.report-type {
    padding: 0.2rem 0.8rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;
}

.report-type.user {
    background: #e0e7ff;
    color: #4f46e5;
}

.report-type.profile {
    background: #d1fae5;
    color: #065f46;
}

.report-type.review {
    background: #fed7aa;
    color: #92400e;
}

.report-type.message {
    background: #e0e7ff;
    color: #4f46e5;
}

.report-status {
    padding: 0.2rem 0.8rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
}

.report-status.pending {
    background: #fef3c7;
    color: #92400e;
}

.report-status.reviewed {
    background: #e0e7ff;
    color: #4f46e5;
}

.report-status.resolved {
    background: #d1fae5;
    color: #065f46;
}

.report-date {
    color: #94a3b8;
    font-size: 0.85rem;
}

.report-content {
    margin-bottom: 1rem;
    line-height: 1.6;
}

.info-row {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    color: #475569;
}

.info-row svg {
    stroke: #94a3b8;
    margin-top: 0.2rem;
    flex-shrink: 0;
}

.reported-content {
    margin-top: 1rem;
    padding: 1rem;
    background: #fef2f2;
    border-radius: 12px;
    border-left: 4px solid #ef4444;
}

.reported-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    color: #991b1b;
}

.reported-header svg {
    stroke: #ef4444;
}

.content-box {
    padding: 0.75rem;
    background: white;
    border-radius: 8px;
    font-style: italic;
}

.rating-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    font-size: 0.85rem;
}

.stars {
    color: #fbbf24;
}

.report-actions {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #f1f5f9;
}

.notes-wrapper {
    position: relative;
    margin-bottom: 0.75rem;
}

.notes-wrapper svg {
    position: absolute;
    left: 12px;
    top: 12px;
    stroke: #94a3b8;
    pointer-events: none;
}

.notes-input {
    width: 100%;
    padding: 0.6rem 0.6rem 0.6rem 2.2rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.85rem;
    resize: vertical;
    font-family: inherit;
    transition: all 0.3s ease;
}

.notes-input:focus {
    outline: none;
    border-color: #4f46e5;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.action-btn svg {
    stroke: white;
}

.action-btn.hide {
    background: #f59e0b;
    color: white;
}

.action-btn.hide:hover {
    background: #d97706;
    transform: translateY(-2px);
}

.action-btn.remove {
    background: #ef4444;
    color: white;
}

.action-btn.remove:hover {
    background: #dc2626;
    transform: translateY(-2px);
}

.action-btn.warn {
    background: #f59e0b;
    color: white;
}

.action-btn.warn:hover {
    background: #d97706;
    transform: translateY(-2px);
}

.action-btn.suspend {
    background: #ef4444;
    color: white;
}

.action-btn.suspend:hover {
    background: #dc2626;
    transform: translateY(-2px);
}

.action-btn.dismiss {
    background: #6c757d;
    color: white;
}

.action-btn.dismiss:hover {
    background: #5a6268;
    transform: translateY(-2px);
}

/* Loading State */
.loading-state {
    text-align: center;
    padding: 4rem;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #e2e8f0;
    border-top-color: #4f46e5;
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
    background: white;
    border-radius: 24px;
}

.empty-icon {
    margin-bottom: 1rem;
}

.empty-icon svg {
    stroke: #10b981;
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

/* Pagination */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
}

.page-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.2rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    color: #475569;
}

.page-btn:hover:not(:disabled) {
    background: #4f46e5;
    color: white;
    border-color: #4f46e5;
}

.page-btn:hover:not(:disabled) svg {
    stroke: white;
}

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-btn svg {
    stroke: currentColor;
}

.page-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: white;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
}

.current-page {
    font-weight: 700;
    color: #4f46e5;
    font-size: 1.1rem;
}

.total-pages {
    color: #64748b;
}

/* Responsive */
@media (max-width: 1024px) {
    .stats-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 768px) {
    .main-content {
        padding: 1rem;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .filters-bar {
        flex-direction: column;
        align-items: flex-start;
    }

    .filters {
        width: 100%;
        flex-direction: column;
    }

    .filter-group {
        width: 100%;
    }

    .filter-select {
        width: 100%;
    }

    .report-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .action-buttons {
        flex-direction: column;
    }

    .action-btn {
        width: 100%;
        justify-content: center;
    }

    .page-info {
        display: none;
    }
}
</style>