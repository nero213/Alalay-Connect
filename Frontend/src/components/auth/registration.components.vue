<script setup>
import { ref, reactive, computed } from 'vue';
import { registerUsers } from '@/api/userService';


const sanitize = () => {
    phone.value = phone.value.replace(/\D/g, '')
}
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

const passwordsMatch = computed(() => {
    if (!registerForms.confirmPassword) return null;
    return registerForms.password === registerForms.confirmPassword;
});

const passwordStrength = computed(() => {
    const password = registerForms.password;
    let score = 0;

    if (!password) return 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
});

const strengthLabel = computed(() => {
    switch (passwordStrength.value) {
        case 0:
        case 1:
            return "Weak";
        case 2:
            return "Medium";
        case 3:
        case 4:
            return "Strong";
        default:
            return "";
    }
});

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
                phone: `0${registerForms.phone}`
            })
        successMessage.value = res.data.message || "successful"

        Object.keys(registerForms).forEach(k => registerForms[k] = '')
    } catch (err) {
        errorMessage.value = err.response?.data?.message || "registration failed"
    }
}

</script>

<template>
    <div class="register-container">
        <div class="register-box">
            <h1>Registration</h1>

            <form @submit.prevent="userLogin">

                <div class="input-group">
                    <label>Email</label>
                    <input type="email" v-model="registerForms.email" required />
                </div>

                <div class="input-group">
                    <label>FirstName</label>
                    <input type="text" v-model="registerForms.firstName" required />
                </div>

                <div class="input-group">
                    <label>LastName</label>
                    <input type="text" v-model="registerForms.lastName" required />
                </div>

                <div class="input-group">
                    <label>Password</label>
                    <input type="password" v-model="registerForms.password" required />
                    <div class="strength-wrapper" v-if="registerForms.password">
                        <div class="strength-bar">
                            <div class="strength-fill" :class="strengthLabel.toLowerCase()"
                                :style="{ width: (passwordStrength * 25) + '%' }">
                            </div>
                        </div>
                        <small :class="strengthLabel.toLowerCase()">
                            {{ strengthLabel }} Password
                        </small>
                    </div>
                </div>

                <div class="input-group">
                    <label>Confirm Password</label>
                    <input type="password" v-model="registerForms.confirmPassword" :class="{
                        'input-success': passwordsMatch === true,
                        'input-error': passwordsMatch === false
                    }" required />
                    <div v-if="registerForms.confirmPassword" class="confirm-feedback">
                        <small v-if="passwordsMatch" class="match">
                            ✓ Passwords match
                        </small>

                        <small v-else class="no-match">
                            ✗ Passwords do not match
                        </small>
                    </div>

                </div>
                <div class="input-group">


                    <label>Phone</label>
                    <div class="phone-wrapper">
                        <div class="country-code">
                            <span>+63</span>
                        </div>

                        <input type="tel" v-model="registerForms.phone" placeholder="9XXXXXXXXX" maxlength="10"
                            required />
                    </div>
                </div>
                <button type="submit"> Register</button>

                <p v-if="successMessage" class="success">{{ successMessage }}</p>
                <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

            </form>

        </div>


    </div>

</template>

<style>
.register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
}

.register-box {
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
    font-weight: 600;
    text-align: left;

}

.input-group input {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
}


.input-group {
    margin-bottom: 12px;
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
    font-size: 1rem;
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

.strength-wrapper {
    margin-top: 6px;
    text-align: left;
}

.strength-bar {
    height: 6px;
    background: #ddd;
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 4px;
}

.strength-fill {
    height: 100%;
    transition: width 0.3s ease;
}

/* Strength Colors */
.strength-fill.weak {
    background: red;
}

.strength-fill.medium {
    background: orange;
}

.strength-fill.strong {
    background: green;
}

small.weak {
    color: red;
}

small.medium {
    color: orange;
}

small.strong {
    color: green;
}

.confirm-feedback {
    margin-top: 5px;
    text-align: left;
}

.match {
    color: green;
}

.no-match {
    color: red;
}

.input-success {
    border: 1px solid green !important;
}

.input-error {
    border: 1px solid red !important;
}

.phone-wrapper {
    display: flex;
    align-items: center;
    border: 1px solid #ccc;
    border-radius: 6px;
    overflow: hidden;
}

.country-code {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #f0f0f0;
    padding: 8px 10px;
    font-weight: 500;
    border-right: 1px solid #ccc;
}

.flag {
    font-size: 18px;
}

.phone-wrapper input {
    border: none;
    outline: none;
    padding: 8px 10px;
    flex: 1;
}
</style>