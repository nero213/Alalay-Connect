<template>
    <div class="modal-overlay" @click="$emit('close')">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>Rate {{ professionalName }}</h3>
                <button @click="$emit('close')" class="close-btn">&times;</button>
            </div>

            <div class="modal-body">
                <div class="rating-stars">
                    <span v-for="star in 5" :key="star" @click="selectedRating = star" @mouseover="hoverRating = star"
                        @mouseleave="hoverRating = 0" :class="['star', {
                            active: star <= (hoverRating || selectedRating),
                            selected: star <= selectedRating
                        }]">
                        ★
                    </span>
                </div>

                <div class="rating-label">
                    {{ ratingLabels[selectedRating] }}
                </div>

                <textarea v-model="review" placeholder="Share your experience with this professional (optional)"
                    rows="4" class="review-input"></textarea>

                <div v-if="userRating" class="existing-rating">
                    <p>You've already rated this professional. You can update your rating below.</p>
                </div>
            </div>

            <div class="modal-footer">
                <button @click="$emit('close')" class="btn-cancel">Cancel</button>
                <button @click="handleSubmitRating" class="btn-submit" :disabled="!selectedRating || submitting">
                    <span v-if="submitting" class="spinner-small"></span>
                    {{ submitting ? 'Submitting...' : (userRating ? 'Update Rating' : 'Submit Rating') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { submitRating as apiSubmitRating } from '@/api/ratingService'

const props = defineProps({
    skilledId: {
        type: Number,
        required: true
    },
    professionalName: {
        type: String,
        required: true
    },
    bookingId: {
        type: Number,
        default: null
    },
    userRating: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['close', 'submitted'])

const selectedRating = ref(props.userRating?.rating || 0)
const hoverRating = ref(0)
const review = ref(props.userRating?.review || '')
const submitting = ref(false)

const ratingLabels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
}

const handleSubmitRating = async () => {
    if (!selectedRating.value) return

    submitting.value = true
    try {
        await apiSubmitRating({
            skilled_id: props.skilledId,
            rating: selectedRating.value,
            review: review.value,
            booking_id: props.bookingId
        })
        emit('submitted')
        emit('close')
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to submit rating')
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
    max-width: 450px;
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
    text-align: center;
}

.rating-stars {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 1rem;
}

.star {
    font-size: 2.5rem;
    color: #cbd5e1;
    cursor: pointer;
    transition: all 0.2s;
}

.star.active,
.star.selected {
    color: #ffc107;
    transform: scale(1.1);
}

.rating-label {
    color: #64748b;
    margin-bottom: 1.5rem;
    font-size: 1rem;
    font-weight: 500;
}

.review-input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.95rem;
    resize: vertical;
    margin-bottom: 1rem;
}

.review-input:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.existing-rating {
    background: #fef3c7;
    color: #92400e;
    padding: 0.75rem;
    border-radius: 8px;
    font-size: 0.9rem;
    margin-top: 0.5rem;
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
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