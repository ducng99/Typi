<template>
    <div id="app">
        <center>
            <h1>E2EE Webchat</h1>
            <b-button class="mb-3" @click="(event) => {showRegisterOrLogin = !showRegisterOrLogin}">Login/Register</b-button>
        </center>
        <RegisterForm v-show="showRegisterOrLogin"/>
        <LoginForm v-show="!showRegisterOrLogin"/>
    </div>
</template>

<script>
import RegisterForm from './components/RegisterForm.vue'
import LoginForm from './components/LoginForm.vue'

export default {
    name: 'App',
    components: {
        RegisterForm, LoginForm
    },
    data() {
        return {
            showRegisterOrLogin: false  // false = login, true = register
        }
    }
}
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    margin-top: 60px;
}

body
{
    background-color: #eee !important;
}
</style>
