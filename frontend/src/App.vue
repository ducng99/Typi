<template>
    <div id="app" v-show="!this.checkingSession">
        <div v-if="!loggedIn">
            <center>
                <div class="d-flex align-items-center justify-content-center">
                    <h1><img src="/typi-logo.png" style="height: 53px"/>ypi  (WIP)</h1>
                </div>
                <b-button @click="(event) => {showRegisterOrLogin = !showRegisterOrLogin}" variant="primary" class="m-3">{{showRegisterOrLogin ? "Login" : "Register"}}</b-button>
            </center>
            <RegisterForm v-if="showRegisterOrLogin" @loginCheck="CheckSession"/>
            <LoginForm v-if="!showRegisterOrLogin" @loginCheck="CheckSession"/>
            
            <b-container class="bg-white shadow rounded mt-3 p-3">
                Typi is updating on how messages are encrypted to be more secure!
            </b-container>
            
            <b-container class="bg-white shadow rounded mt-3 p-3">
                <div class="border rounded">
                    <h3 v-b-toggle.instructions class="p-3 rounded-top bg-light mb-0">What is this?</h3>
                    <b-collapse id="instructions">
                        <div class="p-3">
                            <b>Typi</b> 💬 is a simple web chat project features End-to-End Encryption (using hybrid encryption).<br/><br/>
                            <s>When you register,</s> a <b class="text-danger">private key</b> 🔑 and a <b class="text-success">public key</b> 🔑 will be generated using your browser (RSA-1024). Only your <b class="text-success">public key</b> 🔑 will be uploaded to our server for encryption and your <b class="text-danger">private key</b> 🔑 will be stored in <b>local storage</b> in your browser.<br/>
                            Whenever you receive a message, your browser will decrypt an <b class="text-info">AES key</b> using your <b class="text-danger">private key</b> 🔑, decrypt the message with that <b class="text-info">AES key</b> and then display it to you.<br/>
                            And vice versa, the message you sent will be encrypted using a randomly generated <b class="text-info">AES key</b>, that key will be encrypted using the receiver's <b class="text-success">public key</b>🔑 and the encrypted message with encrypted key will be saved on our server.<br/><br/>
                            This way, neither us or your ISP can see the messages you send or receive.<br/><br/>
                            We also use a cookie 🍪 to store your session ID. It expires after you close your browser or inactive for more than 15 minutes.<br/>
                            You can clear your cookies 🍪 and <b class="text-danger">private key</b> 🔑 using the buttons above.
                            <hr/>
                            Project source code: <a href="https://github.com/ducng99/Typi" target="_blank" class="text-body"><b-icon icon="github" font-scale="1.5"></b-icon></a>
                        </div>
                    </b-collapse>
                    <h3 v-b-toggle.disclaimer class="p-3 rounded-bottom bg-light mb-0 border-top">Disclaimer</h3>
                    <b-collapse id="disclaimer">
                        <div class="p-3">
                            It is <b>your responsibility</b> to keep your <b class="text-danger">password/cookies 🍪/private key 🔑/browser/computer</b> safe from other people or organisations.<br/>
                            We <b>do not</b> provide support if they have been compromised, stolen or lost.
                        </div>
                    </b-collapse>
                    <h3 v-b-toggle.about_us class="p-3 rounded-bottom bg-light mb-0 border-top">About me</h3>
                    <b-collapse id="about_us">
                        <div class="p-3">
                            My name is Duc, a job-less graduated in New Zealand 🇳🇿 (I am currently looking for a job 💼).<hr/>
                            My contacts:<br/>
                            <div class="mt-1">
                                <a href="https://www.linkedin.com/in/ducng99/" target="_blank"><b-icon icon="linkedin" class="mr-2" font-scale="2"></b-icon></a>
                                <a href="https://github.com/ducng99/" target="_blank"><b-icon icon="github" class="mr-2" font-scale="2"></b-icon></a>
                                <a href="mailto:tom@ducng.dev" target="_blank"><b-icon icon="envelope-fill" font-scale="2"></b-icon></a>
                            </div>
                        </div>
                    </b-collapse>
                </div>
            </b-container>
            
            <div class="text-center mt-3"><small>Typi (Alpha)<br/>Copyright © 2021{{ new Date().getFullYear() == 2021 ? "" : "-" + new Date().getFullYear() }} Duc Nguyen</small></div>
        </div>
        <ChatApp v-if="loggedIn" @loginCheck="CheckSession"/>
    </div>
</template>

<script>
import axios from "axios"

axios.defaults.withCredentials = true;

const RegisterForm = () => import('./components/RegisterForm.vue')
const LoginForm = () => import('./components/LoginForm.vue')
const ChatApp = () => import('./components/ChatApp.vue')

export default {
    name: 'App',
    components: {
        RegisterForm, LoginForm, ChatApp
    },
    data() {
        return {
            showRegisterOrLogin: false,  // false = login, true = register
            loggedIn: false,
            checkingSession: false
        }
    },
    methods: {
        CheckSession() {
            this.checkingSession = true;
            axios.get("https://chat-backend.ducng.dev/sessions/verifySession")
            .then(res => {
                if (res.data.status)
                {
                    this.loggedIn = true;
                }
                else
                {
                    this.$cookies.remove(this.$COOKIE_SESSION_ID);
                    import('./encryption/SecureStorage').then(({default: passwordHash}) => {
                        passwordHash = '';
                    });
                    this.loggedIn = false;
                }
                
                this.checkingSession = false;
            });
        }
    },
    created() {
        this.CheckSession();
    },
    mounted() {
        
    }
}
</script>

<style>
body
{
    background-color: #eee !important;
}

#app {
    font-family: Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100vh;
}
</style>
