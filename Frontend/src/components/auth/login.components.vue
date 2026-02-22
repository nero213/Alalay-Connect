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

const loginWithFacebook = () => {
    window.location.href = "http://192.168.1.83:3000/auth/facebook/callback"
}

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
    <div class="login-container">

        <div class="login-box">
            <h1>Login</h1>

            <form @submit.prevent="userLogin">
                <div class="input-group">
                    <label>Email:</label>
                    <input v-model="form.email" type="email" required />
                </div>

                <div class="input-group">
                    <label>Password:</label>
                    <input v-model="form.password" type="password" required />
                </div>
                <button type="submit">Login</button>


                <div class="divider">
                    <span>or</span>
                </div>
                <button @click="loginWithFacebook"> Login with Facebook</button>

                <p v-if="successMessage" class="success">{{ successMessage }}</p>
                <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
            </form>
        </div>
    </div>

</template>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
}

.login-box h1 {
    font-weight: 300;
}

.login-box {

    background-color: #fff;
    padding: 30px 50px;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    width: 550px;
    text-align: center;
}


.input-group label {
    display: block;
    margin-bottom: 4px;
    margin-top: 10px;
    font-weight: 300;
    text-align: left;

}

.input-group input {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
}

.success {
    color: green;
    margin-top: 10px;
}

.error {
    color: red;
    margin-top: 10px;
}

button {
    padding: 8px 14px;
    margin: 5px 0;
    width: 100%;
    cursor: pointer;
    border: none;
    border-radius: 6px;
    background-color: #007bff;
    color: #fff;
    font-weight: 500;
    transition: background-color 0.2s;
}

button:hover {
    background-color: #0056b3;
}

.facebook-btn {
    background-color: #1877f2;
    /* Facebook blue */
    color: white;
    width: 100%;
    padding: 8px 14px;
    border-radius: 6px;
    margin-bottom: 12px;
}

.facebook-btn:hover {
    background-color: #145dbf;
}

/* Divider with OR */
.divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 12px 0;
    color: #666;
    font-weight: 500;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #ccc;
}

.divider::before {
    margin-right: 10px;
}

.divider::after {
    margin-left: 10px;
}
</style>
