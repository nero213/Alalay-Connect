<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

onMounted(() => {
    const token = route.query.token;
    if (token) {
        localStorage.setItem('token', token);
        router.push('/dashboard');
    }
    else {
        router.push('/login')
    }
});
</script>


<template>
    <p>Logging you in with Facebook...</p>
</template>