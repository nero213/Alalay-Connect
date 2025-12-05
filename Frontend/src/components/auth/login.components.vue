<script setup>
import { ref, reactive } from 'vue';
import { loginUser } from '@/api/userService';
import { useRouter } from 'vue-router';

const router = useRouter();

const form = reactive({
    email: '',
    password: ''
})

const successMessage = ref('');
const errorMessage = ref('');
const loading = ref(false)

const userLogin = async () => {
    successMessage.value = '';
    errorMessage.value = '';
    loading.value = true;

    try {
        const res = await loginUser({ email: form.email, password: form.password });

        successMessage.value = res.data.message || 'Login successful';

        // Store JWT token
        localStorage.setItem("token", res.data.token);

        localStorage.setItem("user", JSON.stringify(res.data.user));

        router.push("/profile");

        // Reset form
        Object.keys(form).forEach(k => form[k] = "");

    } catch (err) {
        errorMessage.value = err.response?.data?.message || "Login failed";
    }
    finally {
        loading.value = false
    }
};
</script>

<template>
    <div>
        <h1>Login</h1>

        <form @submit.prevent="userLogin">
            <div class="input-group">
                <label>Email:</label>
                <input v-model="form.email" type="email" required />
            </div>

            <div class="input-group">
                <label>Password</label>
                <input v-model="form.password" type="password" required />
            </div>

            <button type="submit">Login</button>

            <p v-if="successMessage" class="success">{{ successMessage }}</p>
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        </form>
    </div>
</template>

<style scoped>
.input-group {
    margin-bottom: 12px;
}

.success {
    color: green;
}

.error {
    color: red;
}

button {
    padding: 6px 12px;
    cursor: pointer;
}
</style>
