<template>
    <div id="app">
        <div v-if="!loggedIn">
            <center>
                <h1>Typi</h1>
                <b-button @click="(event) => {showRegisterOrLogin = !showRegisterOrLogin}" class="m-3">{{showRegisterOrLogin ? "Login" : "Register"}}</b-button>
            </center>
            <RegisterForm v-if="showRegisterOrLogin" @loginCheck="CheckSession"/>
            <LoginForm v-if="!showRegisterOrLogin" @loginCheck="CheckSession"/>
        </div>
        <ChatApp v-if="loggedIn" @loginCheck="CheckSession"/>
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
    methods: {
        CheckSession() {
            if (this.$cookies.isKey(this.$COOKIE_SESSION_ID))
            {
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
    },
    created() {
        this.CheckSession();
    }
}
</script>

<style>
#app {
    font-family: Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100%;
}

html, body {
    height: 100vh;
}

body
{
    background-color: #eee !important;
}
</style>
