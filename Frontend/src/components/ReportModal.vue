<template>
    <div class="modal-overlay" @click="$emit('close')">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>Report {{ reportType }}</h3>
                <button @click="$emit('close')" class="close-btn">&times;</button>
            </div>

            <div class="modal-body">
                <div class="report-info">
                    <p>Why are you reporting this {{ reportType.toLowerCase() }}?</p>
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
        default: null
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
            description: description.value
        }

        if (props.reportedUserId) reportData.reported_user_id = props.reportedUserId
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
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
}

.modal-header h3 {
    margin: 0;
    color: #1e293b;
    font-size: 1.2rem;
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
    background: #f1f5f9;
}

.modal-body {
    padding: 1.5rem;
}

.report-info p {
    color: #475569;
    margin-bottom: 1rem;
}

.reason-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.5rem;
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