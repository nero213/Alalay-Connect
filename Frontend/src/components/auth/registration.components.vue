<script setup>
import { ref, reactive } from 'vue';
import { registerUsers } from '@/api/userService';

const registerForms = reactive({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    phone: ''
})

const successMessage = ref('');
const errorMessage = ref('');

const userLogin = async () => {

    successMessage.value = ''
    errorMessage.value = ''

    if (registerForms.password !== registerForms.confirmPassword) {
        errorMessage.value = "Password does not match"
        return
    }
    try {
        const res = await registerUsers
            ({
                email: registerForms.email,
                firstName: registerForms.firstName,
                lastName: registerForms.lastName,
                password: registerForms.password,
                phone: registerForms.phone
            })
        successMessage.value = res.data.message || "successful"

        Object.keys(registerForms).forEach(k => registerForms[k] = '')
    } catch (err) {
        errorMessage.value = err.response?.data?.message || "registration failed"
    }
}

</script>

<template>
    <div>
        <h1>Registration</h1>
        <form @submit.prevent="userLogin">
            <div class="input-group">
                <label>email</label>
                <input type="email" v-model="registerForms.email" required />
            </div>
            <div class="input-group">
                <label>firstName</label>
                <input type="text" v-model="registerForms.firstName" required />
            </div>
            <div class="input-group">
                <label>lastName</label>
                <input type="text" v-model="registerForms.lastName" required />
            </div>
            <div class="input-group">
                <label>password</label>
                <input type="password" v-model="registerForms.password" required />
            </div>
            <div class="input-group">
                <label>password</label>
                <input type="password" v-model="registerForms.confirmPassword" required />
            </div>
            <div class="input-group">
                <label>phone</label>
                <input type="tel" v-model="registerForms.phone" required />
            </div>
            <button type="submit"> register</button>

            <p v-if="successMessage" class="success">{{ successMessage }}</p>
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        </form>

    </div>

</template>

<style>
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