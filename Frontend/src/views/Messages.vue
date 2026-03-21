<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import noSearchNavbar from '@/components/noSearchNavbar.vue'
import {
    getUserConversations,
    getMessages,
    sendMessage as apiSendMessage,
    markMessagesAsRead,
    getUnreadMessageCount,
    getOrCreateConversation
} from '@/api/messageService'

const router = useRouter()
const route = useRoute()
const currentUser = ref(null)
const conversations = ref([])
const activeConversation = ref(null)
const messages = ref([])
const newMessage = ref('')
const loadingConversations = ref(true)
const loadingMessages = ref(false)
const sending = ref(false)
const isMobile = ref(window.innerWidth < 768)
const messagesContainer = ref(null)
const creatingNewChat = ref(false)
const searchQuery = ref('')
const fileInput = ref(null)
const uploadingFile = ref(false)
const previewFile = ref(null)

// Filter conversations by search
const filteredConversations = computed(() => {
    if (!searchQuery.value.trim()) return conversations.value
    const query = searchQuery.value.toLowerCase()
    return conversations.value.filter(conv =>
        conv.other_person_name?.toLowerCase().includes(query)
    )
})

// Get current user
const getCurrentUser = () => {
    const userData = localStorage.getItem('user')
    if (userData) {
        currentUser.value = JSON.parse(userData)
    }
}

// Get avatar URL
const getAvatarUrl = (imagePath) => {
    if (!imagePath) return '/default-avatar.png'
    let formattedPath = imagePath.replace(/\\/g, '/')
    if (!formattedPath.startsWith('/uploads')) {
        formattedPath = `/uploads/${formattedPath.split('/').pop()}`
    }
    return `http://localhost:3000${formattedPath}`
}

// Get file URL
const getFileUrl = (filePath) => {
    if (!filePath) return '#'
    let formattedPath = filePath.replace(/\\/g, '/')
    if (!formattedPath.startsWith('/uploads')) {
        formattedPath = `/uploads/${formattedPath.split('/').pop()}`
    }
    return `http://localhost:3000${formattedPath}`
}

// Check if file is an image
const isImageFile = (fileType, fileName) => {
    if (!fileType && !fileName) return false
    const ext = fileName?.split('.').pop()?.toLowerCase()
    return fileType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)
}

// Get file icon based on file type
const getFileIcon = (fileType, fileName) => {
    if (!fileType && !fileName) return '📄'

    const ext = fileName?.split('.').pop()?.toLowerCase()

    if (isImageFile(fileType, fileName)) {
        return '🖼️'
    }
    if (fileType === 'application/pdf' || ext === 'pdf') {
        return '📑'
    }
    if (fileType?.includes('word') || ext === 'doc' || ext === 'docx') {
        return '📝'
    }
    if (fileType?.includes('excel') || ext === 'xls' || ext === 'xlsx') {
        return '📊'
    }
    if (fileType?.includes('zip') || ext === 'zip' || ext === 'rar') {
        return '🗜️'
    }
    if (fileType?.startsWith('video/') || ['mp4', 'mov', 'avi'].includes(ext)) {
        return '🎬'
    }
    if (fileType?.startsWith('audio/') || ['mp3', 'wav'].includes(ext)) {
        return '🎵'
    }
    return '📎'
}

// Format file size
const formatFileSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// Load conversations
const loadConversations = async () => {
    loadingConversations.value = true
    try {
        const response = await getUserConversations()
        conversations.value = response.conversations
    } catch (error) {
        console.error('Error loading conversations:', error)
    } finally {
        loadingConversations.value = false
    }
}

// Create or get conversation with a specific user
const createOrGetConversation = async (userId) => {
    try {
        creatingNewChat.value = true
        const response = await getOrCreateConversation(userId)
        const conversation = response.conversation

        const existing = conversations.value.find(c => c.conversation_id === conversation.conversation_id)
        if (!existing) {
            conversations.value.unshift(conversation)
        }

        activeConversation.value = conversation
        await loadMessages()
        await markAsRead()
        await nextTick()
        scrollToBottom()

        router.replace('/messages')
    } catch (error) {
        console.error('Error creating conversation:', error)
        alert('Unable to start conversation. Please try again.')
    } finally {
        creatingNewChat.value = false
    }
}

// Select a conversation
const selectConversation = async (conversation) => {
    activeConversation.value = conversation
    await loadMessages()
    await markAsRead()
    await nextTick()
    scrollToBottom()
}

// Load messages for active conversation
const loadMessages = async () => {
    if (!activeConversation.value) return

    loadingMessages.value = true
    try {
        const response = await getMessages(activeConversation.value.conversation_id)
        messages.value = response.messages
    } catch (error) {
        console.error('Error loading messages:', error)
    } finally {
        loadingMessages.value = false
    }
}

// Mark messages as read
const markAsRead = async () => {
    if (!activeConversation.value) return

    try {
        await markMessagesAsRead(activeConversation.value.conversation_id)
        const conv = conversations.value.find(c => c.conversation_id === activeConversation.value.conversation_id)
        if (conv) conv.unread_count = 0
    } catch (error) {
        console.error('Error marking as read:', error)
    }
}

// Clear file preview
const clearFilePreview = () => {
    previewFile.value = null
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

// Send message with file
const sendMessage = async () => {
    if ((!newMessage.value.trim() && !previewFile.value) || sending.value) return

    sending.value = true
    const messageText = newMessage.value.trim()
    newMessage.value = ''

    try {
        let receiverId = null

        if (activeConversation.value) {
            if (currentUser.value.role === 'resident') {
                receiverId = activeConversation.value.skilled_user_id
            } else {
                receiverId = activeConversation.value.client_id
            }
        }

        const formData = new FormData()
        formData.append('conversation_id', activeConversation.value?.conversation_id || '')
        formData.append('message', messageText)
        formData.append('receiver_id', receiverId || '')

        if (previewFile.value) {
            formData.append('message_file', previewFile.value)
        }

        const response = await apiSendMessage(formData)

        if (response.conversation_id && !activeConversation.value) {
            await loadConversations()
            const newConv = conversations.value.find(c => c.conversation_id === response.conversation_id)
            if (newConv) {
                activeConversation.value = newConv
            }
        }

        messages.value.push(response.data)

        if (activeConversation.value) {
            const lastMessage = previewFile.value ? (isImageFile(previewFile.value.type, previewFile.value.name) ? '📷 Image' : `📎 ${previewFile.value.name}`) : messageText
            activeConversation.value.last_message = lastMessage
            activeConversation.value.last_message_at = new Date().toISOString()

            const convIndex = conversations.value.findIndex(c => c.conversation_id === activeConversation.value.conversation_id)
            if (convIndex !== -1) {
                conversations.value[convIndex].last_message = lastMessage
                conversations.value[convIndex].last_message_at = new Date().toISOString()
            }
        }

        // Clear file preview
        clearFilePreview()

        await nextTick()
        scrollToBottom()

    } catch (error) {
        console.error('Error sending message:', error)
        newMessage.value = messageText
        alert('Failed to send message. Please try again.')
    } finally {
        sending.value = false
        uploadingFile.value = false
    }
}

// Trigger file input
const triggerFileUpload = () => {
    fileInput.value.click()
}

// Handle file selection
const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        clearFilePreview()
        return
    }

    previewFile.value = file
    uploadingFile.value = true
}

// Remove selected file
const removeSelectedFile = () => {
    clearFilePreview()
    uploadingFile.value = false
}

// Add new line on Shift+Enter
const addNewLine = (e) => {
    e.preventDefault()
    const textarea = e.target
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    newMessage.value = newMessage.value.substring(0, start) + '\n' + newMessage.value.substring(end)
    nextTick(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1
    })
}

// Scroll to bottom of messages
const scrollToBottom = () => {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
}

// Format time for conversation list
const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString()
}

// Format time for message bubble
const formatMessageTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

// Close conversation (mobile)
const closeConversation = () => {
    activeConversation.value = null
}

// Handle window resize
const handleResize = () => {
    isMobile.value = window.innerWidth < 768
}

// Poll for new messages
let pollingInterval = null

const startPolling = () => {
    pollingInterval = setInterval(async () => {
        if (activeConversation.value) {
            await loadMessages()
        }
    }, 5000)
}

// Check for skilled ID in query params on mount
onMounted(async () => {
    getCurrentUser()
    await loadConversations()

    const conversationId = route.query.conversation
    if (conversationId) {
        const existingConversation = conversations.value.find(c => c.conversation_id == conversationId)
        if (existingConversation) {
            activeConversation.value = existingConversation
            await loadMessages()
            await markAsRead()
            await nextTick()
            scrollToBottom()
        }
    }

    const skilledUserId = route.query.skilled
    if (skilledUserId && currentUser.value) {
        await createOrGetConversation(skilledUserId)
    }

    const clientId = route.query.client
    if (clientId && currentUser.value) {
        await createOrGetConversation(clientId)
    }

    window.addEventListener('resize', handleResize)
    startPolling()
})

onUnmounted(() => {
    if (pollingInterval) clearInterval(pollingInterval)
    window.removeEventListener('resize', handleResize)
})
</script>

<template>
    <div class="messages-page">
        <noSearchNavbar />

        <div class="messages-container">
            <!-- Sidebar - Conversation List -->
            <div class="conversations-sidebar" :class="{ 'mobile-hidden': activeConversation && isMobile }">
                <div class="sidebar-header">
                    <div class="header-title">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                                stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                        <h2>Messages</h2>
                    </div>
                    <button v-if="isMobile && activeConversation" @click="closeConversation" class="back-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>

                <!-- Search Bar -->
                <div class="search-bar">
                    <div class="search-wrapper">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                                stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                        <input type="text" v-model="searchQuery" placeholder="Search conversations..."
                            class="search-input" />
                    </div>
                </div>

                <div class="conversations-list">
                    <div v-if="loadingConversations" class="loading-state">
                        <div class="spinner"></div>
                        <p>Loading conversations...</p>
                    </div>

                    <div v-else-if="filteredConversations.length === 0" class="empty-state">
                        <div class="empty-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                                    stroke="currentColor" stroke-width="1.5" />
                            </svg>
                        </div>
                        <p>{{ searchQuery ? 'No conversations found' : 'No messages yet' }}</p>
                        <router-link v-if="!searchQuery" to="/dashboard" class="browse-link">Browse
                            Professionals</router-link>
                    </div>

                    <div v-else>
                        <div v-for="conv in filteredConversations" :key="conv.conversation_id"
                            @click="selectConversation(conv)"
                            :class="['conversation-item', { active: activeConversation?.conversation_id === conv.conversation_id }]">
                            <div class="conversation-avatar">
                                <img :src="getAvatarUrl(conv.other_person_image)" :alt="conv.other_person_name">
                                <span v-if="conv.unread_count > 0" class="unread-badge">{{ conv.unread_count > 9 ? '9+'
                                    : conv.unread_count }}</span>
                            </div>
                            <div class="conversation-info">
                                <div class="conversation-header">
                                    <h3>{{ conv.other_person_name }}</h3>
                                    <span class="conversation-time">{{ formatTime(conv.last_message_at ||
                                        conv.updated_at) }}</span>
                                </div>
                                <p class="conversation-preview">{{ conv.last_message || 'No messages yet' }}</p>
                                <span class="conversation-type">{{ conv.other_person_type === 'skilled' ?
                                    'Skilled Worker' : 'Client' }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Chat Area -->
            <div class="chat-area" :class="{ 'mobile-visible': activeConversation }">
                <div v-if="!activeConversation" class="no-conversation-selected">
                    <div class="empty-chat">
                        <div class="chat-icon">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                                    stroke="currentColor" stroke-width="1.5" />
                            </svg>
                        </div>
                        <h3>Select a conversation</h3>
                        <p>Choose a conversation from the list to start messaging</p>
                    </div>
                </div>

                <div v-else class="chat-container">
                    <!-- Chat Header -->
                    <div class="chat-header">
                        <button v-if="isMobile" @click="closeConversation" class="mobile-back-btn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </button>
                        <div class="chat-header-info">
                            <img :src="getAvatarUrl(activeConversation.other_person_image)"
                                :alt="activeConversation.other_person_name" class="chat-avatar">
                            <div>
                                <h3>{{ activeConversation.other_person_name }}</h3>
                                <p class="chat-status">
                                    <span class="status-dot"></span>
                                    {{ activeConversation.other_person_type === 'skilled' ? 'Skilled Worker' : 'Client'
                                    }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Messages Area -->
                    <div class="messages-area" ref="messagesContainer">
                        <div v-if="loadingMessages" class="loading-messages">
                            <div class="spinner-small"></div>
                            <p>Loading messages...</p>
                        </div>

                        <div v-else>
                            <div v-for="msg in messages" :key="msg.message_id"
                                :class="['message-item', { 'message-sent': msg.sender_id === currentUser?.id, 'message-received': msg.sender_id !== currentUser?.id }]">
                                <div class="message-bubble">
                                    <!-- Image attachment preview -->
                                    <div v-if="msg.file_url && isImageFile(msg.file_type, msg.file_name)"
                                        class="image-attachment">
                                        <a :href="getFileUrl(msg.file_url)" target="_blank" class="image-link">
                                            <img :src="getFileUrl(msg.file_url)" :alt="msg.file_name || 'Image'"
                                                class="message-image">
                                        </a>
                                    </div>

                                    <!-- File attachment for non-images -->
                                    <div v-else-if="msg.file_url" class="file-attachment">
                                        <a :href="getFileUrl(msg.file_url)" target="_blank" class="file-link">
                                            <span class="file-icon">{{ getFileIcon(msg.file_type, msg.file_name)
                                            }}</span>
                                            <div class="file-info">
                                                <span class="file-name">{{ msg.file_name || 'File' }}</span>
                                                <span class="file-size">{{ formatFileSize(msg.file_size) }}</span>
                                            </div>
                                        </a>
                                    </div>

                                    <p v-if="msg.message" class="message-text">{{ msg.message }}</p>
                                    <div class="message-footer">
                                        <span class="message-time">{{ formatMessageTime(msg.created_at) }}</span>
                                        <span v-if="msg.sender_id === currentUser?.id && msg.is_read"
                                            class="read-status">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2"
                                                    stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2"
                                                    stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div v-if="messages.length === 0" class="no-messages">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                                        stroke="currentColor" stroke-width="1.5" />
                                </svg>
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        </div>
                    </div>

                    <!-- Message Input -->
                    <div class="message-input-area">
                        <input type="file" ref="fileInput" @change="handleFileSelect" class="hidden-file-input"
                            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,audio/*,video/*" />

                        <!-- File Preview -->
                        <div v-if="previewFile" class="file-preview">
                            <div v-if="isImageFile(previewFile.type, previewFile.name)" class="image-preview">
                                <img :src="URL.createObjectURL(previewFile)" alt="Preview" class="preview-thumbnail">
                            </div>
                            <div v-else class="file-preview-info">
                                <span class="preview-icon">{{ getFileIcon(previewFile.type, previewFile.name) }}</span>
                                <div class="preview-details">
                                    <span class="preview-name">{{ previewFile.name }}</span>
                                    <span class="preview-size">{{ formatFileSize(previewFile.size) }}</span>
                                </div>
                            </div>
                            <button @click="removeSelectedFile" class="remove-preview-btn" title="Remove file">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>
                        </div>

                        <button @click="triggerFileUpload" class="attach-btn" :disabled="sending">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59723 22 8.00502 22C6.41281 22 4.88584 21.3658 3.76002 20.24C2.6342 19.1142 2 17.5872 2 15.995C2 14.4028 2.6342 12.8758 3.76002 11.75L12.33 3.18"
                                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                    stroke-linejoin="round" />
                                <path d="M16 8L8 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                    stroke-linejoin="round" />
                                <path d="M15 3L21 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </button>
                        <textarea v-model="newMessage" @keydown.enter.exact="sendMessage"
                            @keydown.enter.shift.exact="addNewLine" placeholder="Type a message..." rows="1"
                            class="message-input" :disabled="sending"></textarea>
                        <button @click="sendMessage" :disabled="(!newMessage.trim() && !previewFile) || sending"
                            class="send-btn">
                            <svg v-if="!sending" width="20" height="20" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" stroke-width="1.5"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <div v-else class="spinner-small-white"></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Image attachment styles */
.image-attachment {
    margin-bottom: 0.5rem;
}

.image-link {
    display: block;
    text-decoration: none;
    cursor: pointer;
}

.message-image {
    max-width: 250px;
    max-height: 200px;
    border-radius: 12px;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.message-image:hover {
    transform: scale(1.02);
}

/* File attachment styles */
.file-attachment {
    margin-bottom: 0.5rem;
}

.file-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.3s ease;
}

.message-sent .file-link {
    background: rgba(255, 255, 255, 0.2);
}

.message-received .file-link {
    background: #f1f5f9;
}

.file-link:hover {
    transform: translateY(-2px);
}

.file-icon {
    font-size: 1.5rem;
}

.file-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.file-name {
    font-size: 0.85rem;
    font-weight: 500;
    color: inherit;
    word-break: break-word;
}

.file-size {
    font-size: 0.7rem;
    opacity: 0.7;
}

.message-sent .file-name,
.message-sent .file-size {
    color: white;
}

.message-received .file-name,
.message-received .file-size {
    color: #1e293b;
}

/* File preview before sending */
.file-preview {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    background: #f1f5f9;
    border-radius: 12px;
    margin-right: 0.5rem;
    max-width: 200px;
}

.image-preview {
    flex-shrink: 0;
}

.preview-thumbnail {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    object-fit: cover;
}

.file-preview-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
}

.preview-icon {
    font-size: 1.5rem;
}

.preview-details {
    flex: 1;
    min-width: 0;
}

.preview-name {
    display: block;
    font-size: 0.8rem;
    font-weight: 500;
    color: #1e293b;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.preview-size {
    display: block;
    font-size: 0.7rem;
    color: #64748b;
}

.remove-preview-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;
    color: #ef4444;
}

.remove-preview-btn:hover {
    background: #fee2e2;
    transform: scale(1.1);
}

/* Attach button */
.attach-btn {
    width: 42px;
    height: 42px;
    background: #f1f5f9;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #4f46e5;
    flex-shrink: 0;
}

.attach-btn:hover:not(:disabled) {
    background: #e2e8f0;
    transform: scale(1.05);
}

.attach-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.hidden-file-input {
    display: none;
}

/* Search Bar Styles */
.search-bar {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
}

.search-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.search-wrapper svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    stroke: #94a3b8;
}

.search-input {
    width: 100%;
    padding: 0.6rem 0.8rem 0.6rem 2.5rem;
    border: 2px solid #e2e8f0;
    border-radius: 30px;
    font-size: 0.9rem;
    background: white;
    transition: all 0.3s ease;
}

.search-input:focus {
    outline: none;
    border-color: #4f46e5;
    background: white;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

/* Keep all existing styles */
.messages-page {
    min-height: 100vh;
    background: #f8fafc;
}

.messages-container {
    display: flex;
    height: calc(100vh - 70px);
    margin-top: 70px;
    background: white;
}

/* Sidebar */
.conversations-sidebar {
    width: 320px;
    background: white;
    border-right: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.header-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.header-title svg {
    stroke: #4f46e5;
}

.sidebar-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
}

.back-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.back-btn:hover {
    background: #f1f5f9;
}

.back-btn svg {
    stroke: #4f46e5;
}

/* Conversations List */
.conversations-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
}

.conversation-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 0.25rem;
}

.conversation-item:hover {
    background: #f8fafc;
}

.conversation-item.active {
    background: #eef2ff;
}

.conversation-avatar {
    position: relative;
    width: 50px;
    height: 50px;
    flex-shrink: 0;
}

.conversation-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
}

.unread-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #ef4444;
    color: white;
    font-size: 0.7rem;
    font-weight: 600;
    min-width: 20px;
    height: 20px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.conversation-info {
    flex: 1;
    min-width: 0;
}

.conversation-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0.25rem;
}

.conversation-header h3 {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.conversation-time {
    font-size: 0.7rem;
    color: #94a3b8;
    flex-shrink: 0;
    margin-left: 0.5rem;
}

.conversation-preview {
    font-size: 0.85rem;
    color: #64748b;
    margin: 0.25rem 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.conversation-type {
    font-size: 0.7rem;
    color: #94a3b8;
    text-transform: capitalize;
}

/* Chat Area */
.chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #f8fafc;
}

.no-conversation-selected {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.empty-chat {
    text-align: center;
    padding: 2rem;
}

.chat-icon {
    margin-bottom: 1rem;
}

.chat-icon svg {
    stroke: #94a3b8;
    opacity: 0.5;
}

.empty-chat h3 {
    color: #1e293b;
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
}

.empty-chat p {
    color: #64748b;
}

/* Chat Container */
.chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.chat-header {
    padding: 1rem 1.5rem;
    background: white;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.mobile-back-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.3s ease;
    display: none;
}

.mobile-back-btn:hover {
    background: #f1f5f9;
}

.mobile-back-btn svg {
    stroke: #4f46e5;
}

.chat-header-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.chat-avatar {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chat-header-info h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
}

.chat-status {
    font-size: 0.8rem;
    color: #64748b;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.status-dot {
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    display: inline-block;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

/* Messages Area */
.messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.message-item {
    display: flex;
    width: 100%;
}

.message-sent {
    justify-content: flex-end;
}

.message-received {
    justify-content: flex-start;
}

.message-bubble {
    margin: 0.2rem;
    max-width: 70%;
    padding: 0.75rem 1rem;
    border-radius: 18px;
    position: relative;
}

.message-sent .message-bubble {
    background: linear-gradient(135deg, #4f525577 0%, #060e1b7e 100%);
    color: white;
    border-bottom-right-radius: 4px;
    box-shadow: 0 4px 15px rgba(131, 75, 221, 0.1);
}

.message-received .message-bubble {
    background: white;
    color: #1e293b;
    border-bottom-left-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-text {
    margin: 0 0 0.25rem 0;
    font-size: 0.95rem;
    line-height: 1.4;
    white-space: pre-wrap;
    word-wrap: break-word;
}

.message-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.25rem;
}

.message-time {
    font-size: 0.65rem;
    opacity: 0.7;
}

.read-status {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    margin-left: 0.25rem;
}

.read-status svg {
    stroke: currentColor;
    opacity: 0.7;
}

/* Message Input */
.message-input-area {
    padding: 1rem 1.5rem;
    background: white;
    border-top: 1px solid #e2e8f0;
    display: flex;
    gap: 0.75rem;
    align-items: flex-end;
    flex-wrap: wrap;
}

.message-input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 24px;
    font-size: 0.95rem;
    resize: none;
    max-height: 120px;
    font-family: inherit;
    transition: all 0.3s ease;
}

.message-input:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.send-btn {
    width: 42px;
    height: 42px;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    color: white;
    flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Loading States */
.loading-state,
.loading-messages {
    text-align: center;
    padding: 2rem;
    color: #64748b;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top-color: #4f46e5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

.spinner-small {
    width: 20px;
    height: 20px;
    border: 3px solid #e2e8f0;
    border-top-color: #4f46e5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 0.5rem;
}

.spinner-small-white {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #64748b;
}

.empty-icon {
    margin-bottom: 1rem;
}

.empty-icon svg {
    stroke: #94a3b8;
    opacity: 0.5;
}

.browse-link {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.6rem 1.2rem;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    text-decoration: none;
    border-radius: 30px;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.3s ease;
}

.browse-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(79, 70, 229, 0.3);
}

.no-messages {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
}

.no-messages svg {
    stroke: #94a3b8;
    margin-bottom: 1rem;
    opacity: 0.5;
}

/* Responsive */
@media (max-width: 768px) {
    .conversations-sidebar {
        position: absolute;
        left: 0;
        top: 70px;
        bottom: 0;
        width: 100%;
        z-index: 10;
        transition: transform 0.3s ease;
    }

    .conversations-sidebar.mobile-hidden {
        transform: translateX(-100%);
    }

    .chat-area {
        width: 100%;
    }

    .chat-area.mobile-visible {
        display: flex;
    }

    .mobile-back-btn {
        display: block;
    }

    .message-bubble {
        max-width: 85%;
    }

    .message-image {
        max-width: 200px;
        max-height: 150px;
    }

    .conversation-item {
        padding: 0.75rem;
    }

    .sidebar-header {
        padding: 1rem;
    }

    .file-preview {
        max-width: 150px;
    }
}
</style>