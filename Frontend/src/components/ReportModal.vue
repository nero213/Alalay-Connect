<template>
    <div class="modal-overlay" @click="$emit('close')">
        <div class="modal-content" @click.stop>
            <div class="modal-header" :class="reportType === 'User' ? 'user-report' : 'profile-report'">
                <div class="modal-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 8V12M12 16H12.01M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                            stroke="currentColor" stroke-width="1.5" />
                    </svg>
                </div>
                <h3>Report {{ reportType }}</h3>
                <button @click="$emit('close')" class="close-btn">&times;</button>
            </div>

            <div class="modal-body">
                <div class="report-info">
                    <p>Why are you reporting this {{ reportType.toLowerCase() }}?</p>
                    <p class="report-note">Your report will be reviewed by our team. False reports may result in account
                        restrictions.</p>
                </div>

                <div class="reason-buttons">
                    <button v-for="reason in reasons" :key="reason.value" @click="selectedReason = reason.value"
                        :class="['reason-btn', { active: selectedReason === reason.value }]">
                        {{ reason.label }}
                    </button>
                </div>

                <div class="form-group">
                    <label>Additional Details (Optional)</label>
                    <textarea v-model="description" placeholder="Please provide more details about the issue..."
                        rows="4" class="form-textarea"></textarea>
                </div>
            </div>

            <div class="modal-footer">
                <button @click="$emit('close')" class="btn-cancel">Cancel</button>
                <button @click="submitReport" class="btn-submit" :disabled="!selectedReason || submitting">
                    <span v-if="submitting" class="spinner-small"></span>
                    {{ submitting ? 'Submitting...' : 'Submit Report' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { createReport } from '@/api/reportService'

const props = defineProps({
    reportType: {
        type: String,
        required: true,
        validator: (value) => ['User', 'Profile', 'Review', 'Message'].includes(value)
    },
    reportedUserId: {
        type: Number,
        required: true
    },
    reportedSkillId: {
        type: Number,
        default: null
    },
    reportedRatingId: {
        type: Number,
        default: null
    },
    reportedMessageId: {
        type: Number,
        default: null
    }
})

const emit = defineEmits(['close', 'submitted'])

const reasons = [
    { value: 'inappropriate', label: 'Inappropriate Content' },
    { value: 'fake', label: 'Fake Profile/Information' },
    { value: 'harassment', label: 'Harassment or Bullying' },
    { value: 'spam', label: 'Spam or Advertising' },
    { value: 'offensive', label: 'Offensive Language' },
    { value: 'uncooperative', label: 'Uncooperative / Difficult' },
    { value: 'no_show', label: 'No Show / Cancelled Last Minute' },
    { value: 'dispute', label: 'Payment/Service Dispute' },
    { value: 'other', label: 'Other' }
]

const selectedReason = ref('')
const description = ref('')
const submitting = ref(false)

const submitReport = async () => {
    if (!selectedReason.value) return

    submitting.value = true
    try {
        const reportData = {
            type: props.reportType.toLowerCase(),
            reason: selectedReason.value,
            description: description.value,
            reported_user_id: props.reportedUserId
        }

        if (props.reportedSkillId) reportData.reported_skill_id = props.reportedSkillId
        if (props.reportedRatingId) reportData.reported_rating_id = props.reportedRatingId
        if (props.reportedMessageId) reportData.reported_message_id = props.reportedMessageId

        await createReport(reportData)
        emit('submitted')
        emit('close')
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to submit report')
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
    backdrop-filter: blur(3px);
}

.modal-content {
    background: white;
    border-radius: 16px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
    position: relative;
}

.modal-header.user-report {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.modal-header.profile-report {
    background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
}

.modal-icon {
    width: 40px;
    height: 40px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-icon svg {
    stroke: white;
}

.modal-header h3 {
    margin: 0;
    color: #1e293b;
    font-size: 1.2rem;
    flex: 1;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
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
    background: rgba(0, 0, 0, 0.1);
}

.modal-body {
    padding: 1.5rem;
}

.report-info p {
    color: #475569;
    margin-bottom: 0.5rem;
}

.report-note {
    font-size: 0.85rem;
    color: #94a3b8;
    font-style: italic;
}

.reason-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin: 1rem 0;
}

.reason-btn {
    padding: 0.75rem;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    color: #1e293b;
    cursor: pointer;
    transition: all 0.3s;
    text-align: center;
}

.reason-btn:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
}

.reason-btn.active {
    background: #4f46e5;
    border-color: #4f46e5;
    color: white;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #334155;
}

.form-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.95rem;
    resize: vertical;
}

.form-textarea:focus {
    outline: none;
    border-color: #4f46e5;
}

.modal-footer {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    border-top: 1px solid #eee;
}

.btn-cancel,
.btn-submit {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-cancel {
    background: #f1f5f9;
    color: #64748b;
}

.btn-cancel:hover {
    background: #e2e8f0;
}

.btn-submit {
    background: #ef4444;
    color: white;
}

.btn-submit:hover:not(:disabled) {
    background: #dc2626;
    transform: translateY(-2px);
}

.btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.spinner-small {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
    margin-right: 4px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>