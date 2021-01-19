<template>
    <div id="app">
        <div v-if="!loggedIn">
            <center>
                <h1>E2EE Webchat</h1>
                <b-button @click="(event) => {showRegisterOrLogin = !showRegisterOrLogin}" class="mb-3">Login/Register</b-button>
            </center>
            <RegisterForm v-if="showRegisterOrLogin"/>
            <LoginForm v-if="!showRegisterOrLogin"/>
        </div>
        <ChatApp v-if="loggedIn"/>
    </div>
</template>

<script>
import axios from "axios"
import RegisterForm from './components/RegisterForm.vue'
import LoginForm from './components/LoginForm.vue'
import ChatApp from './components/ChatApp.vue'

export default {
    name: 'App',
    components: {
        RegisterForm, LoginForm, ChatApp
    },
    data() {
        return {
            showRegisterOrLogin: false,  // false = login, true = register
            loggedIn: false
        }
    },
    created() {
        axios.post("https://chat-backend.ducng.dev/verifySession", {sessionID: this.$cookies.get(this.$COOKIE_SESSION_ID)})
            .then(res => {
                if (res.data.status)
                {
                    this.loggedIn = true;
                }
                else
                {
                    console.error(res.data.msg);
                }
            });
    }
}
</script>

<style>
#app {
    font-family: Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

body
{
    background-color: #eee !important;
}
</style>
