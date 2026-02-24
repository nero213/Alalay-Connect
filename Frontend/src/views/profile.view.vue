<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { profileUsers } from '@/api/userService';

const user = ref(null);
const error = ref('');
const router = useRouter();

const fetchProfile = async () => {
    try {

        const res = await profileUsers()
        user.value = res.data.user || "succesful";
    } catch (err) {
        error.value = err.response?.data?.message || 'Unauthorized';
    }
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
};

onMounted(() => {
    fetchProfile();
});
</script>

<template>
    <div>
        <h2>Profile</h2>
        <div v-if="user">
            <p><strong>First Name:</strong> {{ user.firstName }}</p>
            <p><strong>Last Name:</strong> {{ user.lastName }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>Role:</strong> {{ user.role }}</p>
        </div>
        <p v-else style="color:red">{{ error }}</p>
        <button @click="logout">Logout</button>
    </div>
</template>
