<template>
    <div class="admin-dashboard">
        <AdminSidebar />

        <div class="main-content">
            <div class="dashboard-header">
                <div class="header-left">
                    <h1>Admin Dashboard</h1>
                    <p>Welcome back, {{ admin?.firstName }} {{ admin?.lastName }}!</p>
                </div>
                <div class="header-right">
                    <div class="admin-info">
                        <span class="admin-role">Administrator</span>
                        <span class="admin-email">{{ admin?.email }}</span>
                    </div>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
                                stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21"
                                stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <h3>{{ stats.users?.total_users || 0 }}</h3>
                        <p>Total Users</p>
                    </div>
                    <div class="stat-change">
                        <span class="resident">{{ stats.users?.total_residents || 0 }} residents</span>
                        <span class="skilled">{{ stats.users?.total_skilled || 0 }} skilled</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="4" width="18" height="16" rx="2" stroke="white" stroke-width="1.5" />
                            <path d="M8 2V6M16 2V6M3 10H21" stroke="white" stroke-width="1.5" stroke-linecap="round" />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <h3>{{ stats.bookings?.total_bookings || 0 }}</h3>
                        <p>Total Bookings</p>
                    </div>
                    <div class="stat-change">
                        <span class="pending">{{ stats.bookings?.pending_bookings || 0 }} pending</span>
                        <span class="completed">{{ stats.bookings?.completed_bookings || 0 }} completed</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <h3>{{ stats.skilledProfiles?.pending_verification || 0 }}</h3>
                        <p>Pending Verification</p>
                    </div>
                    <div class="stat-change">
                        <span class="approved">{{ stats.skilledProfiles?.approved_profiles || 0 }} approved</span>
                    </div>
                </div>
            </div>

            <!-- Recent Activity Chart -->
            <div class="chart-card">
                <div class="card-header">
                    <h3>Recent Activity</h3>
                    <span class="period-badge">Last 7 Days</span>
                </div>
                <div class="chart-container">
                    <div v-for="day in recentActivity" :key="day.date" class="chart-bar">
                        <div class="bar-wrapper">
                            <div class="bar" :style="{ height: getBarHeight(day.count) + '%' }">
                                <span class="bar-value">{{ day.count }}</span>
                            </div>
                        </div>
                        <span class="label">{{ formatDate(day.date) }}</span>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions">
                <div class="card-header">
                    <h3>Quick Actions</h3>
                    <span class="actions-hint">Manage your platform</span>
                </div>
                <div class="actions-grid">
                    <button @click="goToVerification" class="action-btn verification">
                        <span class="action-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </span>
                        <div class="action-content">
                            <strong>Review Applications</strong>
                            <span>Verify skilled workers</span>
                        </div>
                    </button>
                    <button @click="goToUsers" class="action-btn users">
                        <span class="action-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
                                    stroke="currentColor" stroke-width="1.5" />
                                <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21"
                                    stroke="currentColor" stroke-width="1.5" />
                            </svg>
                        </span>
                        <div class="action-content">
                            <strong>Manage Users</strong>
                            <span>View and manage accounts</span>
                        </div>
                    </button>
                    <button @click="goToSkills" class="action-btn skills">
                        <span class="action-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.7 6.3L19 2L20.7 3.7L16.4 8" stroke="currentColor" stroke-width="1.5"
                                    stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M9 12L12 9M7 17L12 12M11 19L19 11" stroke="currentColor" stroke-width="1.5"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </span>
                        <div class="action-content">
                            <strong>Manage Skills</strong>
                            <span>Add or remove skills</span>
                        </div>
                    </button>
                    <button @click="goToReports" class="action-btn reports">
                        <span class="action-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 16V20H3V16M6 12L12 6L18 12" stroke="currentColor" stroke-width="1.5"
                                    stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M12 3V12M12 12L9 9M12 12L15 9" stroke="currentColor" stroke-width="1.5"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </span>
                        <div class="action-content">
                            <strong>View Reports</strong>
                            <span>Analytics & insights</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { getDashboardStats, getAdminProfile } from '@/api/adminService'

const router = useRouter()
const stats = ref({})
const recentActivity = ref([])
const admin = ref(null)
const loading = ref(true)

const loadAdminProfile = async () => {
    try {
        const response = await getAdminProfile()
        admin.value = response.admin
    } catch (error) {
        console.error('Error loading admin profile:', error)
    }
}

const loadStats = async () => {
    loading.value = true
    try {
        const response = await getDashboardStats()
        stats.value = response
        recentActivity.value = response.recentActivity || []
    } catch (error) {
        console.error('Error loading stats:', error)
    } finally {
        loading.value = false
    }
}

const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toLocaleString()
}

const getBarHeight = (count) => {
    const max = Math.max(...recentActivity.value.map(d => d.count), 1)
    return (count / max) * 100
}

const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'short' })
}

const goToVerification = () => router.push('/admin/verification')
const goToUsers = () => router.push('/admin/users')
const goToSkills = () => router.push('/admin/skills')
const goToReports = () => router.push('/admin/reports')

onMounted(async () => {
    await Promise.all([loadAdminProfile(), loadStats()])
})
</script>

<style scoped>
.admin-dashboard {
    display: flex;
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.main-content {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
}

/* Dashboard Header */
.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.header-left h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.header-left p {
    color: #64748b;
    font-size: 1rem;
}

.header-right .admin-info {
    background: white;
    padding: 0.75rem 1.5rem;
    border-radius: 16px;
    text-align: right;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid #f1f5f9;
}

.admin-role {
    display: block;
    font-weight: 600;
    color: #4f46e5;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.admin-email {
    display: block;
    color: #64748b;
    font-size: 0.85rem;
    margin-top: 0.25rem;
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: white;
    border-radius: 24px;
    padding: 1.5rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s ease;
    border: 1px solid #f1f5f9;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 30px rgba(79, 70, 229, 0.1);
    border-color: #e0e7ff;
}

.stat-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.stat-icon svg {
    width: 28px;
    height: 28px;
}

.stat-info {
    flex: 1;
}

.stat-info h3 {
    font-size: 1.8rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 0.25rem;
    line-height: 1.2;
}

.stat-info p {
    color: #64748b;
    font-size: 0.85rem;
    font-weight: 500;
}

.stat-change {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.stat-change span {
    padding: 0.2rem 0.6rem;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 600;
    text-align: center;
    white-space: nowrap;
}

.stat-change .resident {
    background: #e0e7ff;
    color: #4f46e5;
}

.stat-change .skilled {
    background: #d1fae5;
    color: #065f46;
}

.stat-change .pending {
    background: #fef3c7;
    color: #92400e;
}

.stat-change .completed {
    background: #d1fae5;
    color: #065f46;
}

.stat-change .approved {
    background: #d1fae5;
    color: #065f46;
}

/* Chart Card */
.chart-card {
    background: white;
    border-radius: 24px;
    padding: 1.5rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    margin-bottom: 2rem;
    border: 1px solid #f1f5f9;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.card-header h3 {
    color: #1e293b;
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0;
}

.period-badge {
    background: #f1f5f9;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    color: #4f46e5;
}

.actions-hint {
    font-size: 0.75rem;
    color: #94a3b8;
}

.chart-container {
    display: flex;
    align-items: flex-end;
    gap: 1rem;
    justify-content: space-around;
    min-height: 250px;
    padding: 1rem 0;
}

.chart-bar {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
}

.bar-wrapper {
    width: 100%;
    height: 150px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

.bar {
    width: 100%;
    max-width: 50px;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    border-radius: 8px;
    transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    min-height: 4px;
    cursor: pointer;
}

.bar:hover {
    opacity: 0.8;
    transform: scaleX(1.05);
}

.bar-value {
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.75rem;
    font-weight: 600;
    color: #4f46e5;
    background: white;
    padding: 0.2rem 0.4rem;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.bar:hover .bar-value {
    opacity: 1;
}

.label {
    font-size: 0.8rem;
    font-weight: 500;
    color: #64748b;
}

/* Quick Actions */
.quick-actions {
    background: white;
    border-radius: 24px;
    padding: 1.5rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    border: 1px solid #f1f5f9;
}

.actions-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
}

.action-btn {
    padding: 1rem;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    text-align: left;
}

.action-btn:hover {
    background: white;
    border-color: #4f46e5;
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.15);
}

.action-icon {
    width: 48px;
    height: 48px;
    background: #f1f5f9;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.action-icon svg {
    width: 24px;
    height: 24px;
    stroke: #4f46e5;
}

.action-btn:hover .action-icon {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}

.action-btn:hover .action-icon svg {
    stroke: white;
}

.action-content {
    flex: 1;
}

.action-content strong {
    display: block;
    color: #1e293b;
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
}

.action-content span {
    display: block;
    color: #64748b;
    font-size: 0.75rem;
}

/* Responsive */
@media (max-width: 1200px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .actions-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .main-content {
        padding: 1.5rem;
    }

    .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .header-right .admin-info {
        text-align: left;
        width: 100%;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .actions-grid {
        grid-template-columns: 1fr;
    }

    .chart-container {
        gap: 0.5rem;
    }

    .label {
        font-size: 0.7rem;
    }
}

@media (max-width: 480px) {
    .stat-card {
        flex-direction: column;
        text-align: center;
    }

    .stat-change {
        flex-direction: row;
        margin-top: 0.5rem;
    }

    .action-btn {
        flex-direction: column;
        text-align: center;
    }

    .action-icon {
        margin-bottom: 0.5rem;
    }

    .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}
</style>