<template>
    <div id="app" v-show="!this.checkingSession">
        <div v-if="!loggedIn">
            <center>
                <h1><img src="./assets/typi-logo.png" style="height: 53px"/>ypi  (W.I.P)</h1>
                <b-button @click="(event) => {showRegisterOrLogin = !showRegisterOrLogin}" class="m-3">{{showRegisterOrLogin ? "Login" : "Register"}}</b-button>
            </center>
            <RegisterForm v-if="showRegisterOrLogin" @loginCheck="CheckSession"/>
            <LoginForm v-if="!showRegisterOrLogin" @loginCheck="CheckSession" :privateKey="privateKey"/>
            
            <b-container class="rounded shadow p-3 mt-3 bg-white">
                <b class="text-danger">Private key</b> 🔑:
                <b-textarea v-model="showingPrivateKey" class="mt-1 mb-2" :readonly="!editablePrivateKey"></b-textarea>
                <div class="d-flex">
                    <b-button @click="toggleShowPrivateKey()" :variant="this.hidePrivateKey ? 'danger' : ''">{{ this.hidePrivateKey ? 'Show' : 'Hide' }}</b-button>
                    <b-button class="ml-2 mr-auto" @click="toggleEditPrivateKey">Edit</b-button>
                    <b-button variant="info" class="mr-2" @click="downloadPrivateKey" v-b-tooltip.hover title="Keep the key safe">Download</b-button>
                    <b-button :disabled="!editablePrivateKey" variant="primary" @click="savePrivateKey">Save</b-button>
                </div>
            </b-container>
            
            <b-container class="bg-white shadow rounded mt-3 p-3">
                <div class="border rounded">
                    <h3 v-b-toggle.instructions class="p-3 rounded-top bg-light mb-0">What is this?</h3>
                    <b-collapse id="instructions">
                        <div class="p-3">
                            <b>Typi</b> 💬 is a simple web chat project features End-to-End Encryption (using hybrid encryption).<br/><br/>
                            When you register, a <b class="text-danger">private key</b> 🔑 and a <b class="text-success">public key</b> 🔑 will be generated using your browser (RSA-1024). Only your <b class="text-success">public key</b> 🔑 will be uploaded to our server for encryption and your <b class="text-danger">private key</b> 🔑 will be stored in <b>local storage</b> in your browser.<br/>
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
                            It is <b>your responsibility</b> to keep your <b class="text-danger">cookies 🍪/private key 🔑/browser/computer</b> safe from other people/organisations.<br/>
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
            
            <div class="text-center mt-3"><small>Copyright © 2021 Duc Nguyen</small></div>
        </div>
        <ChatApp v-if="loggedIn" @loginCheck="CheckSession"/>
    </div>
</template>

<script>
import axios from "axios"
import {saveAs} from "file-saver"
import NodeRSA from "node-rsa"

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
            loggedIn: false,
            checkingSession: false,
            privateKey: "You don't have a private key stored in this browser",
            showingPrivateKey: "",
            hidePrivateKey: true,
            editablePrivateKey: false
        }
    },
    methods: {
        CheckSession() {            
            if (this.$cookies.isKey(this.$COOKIE_SESSION_ID))
            {
                this.checkingSession = true;
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
                        
                        this.checkingSession = false;
                    });
            }
        },
        toggleShowPrivateKey(state = null) {
            this.hidePrivateKey = (state !== null ? state : !this.hidePrivateKey);
            
            if (this.hidePrivateKey)
            {
                this.showingPrivateKey = Array(this.privateKey.length + 1).join("*");
                this.editablePrivateKey = false;
            }
            else
            {
                this.showingPrivateKey = this.privateKey;
            }
        },
        toggleEditPrivateKey() {
            this.editablePrivateKey = !this.editablePrivateKey;
            this.toggleShowPrivateKey(false);
        },
        downloadPrivateKey() {
            let keyBlob = new Blob([this.privateKey], { type: "text/plain;charset=utf-8" });
            saveAs(keyBlob, "typi_private_key.pem");
        },
        savePrivateKey() {
            let key = new NodeRSA();
            try {
                key.importKey(this.showingPrivateKey, "pkcs8-private-pem");
            
                if (key.isPrivate())
                {
                    this.privateKey = this.showingPrivateKey;
                    window.localStorage.setItem(this.$STORAGE_PRIV_KEY, this.privateKey);
                }
                else
                {
                    this.$bvToast.toast("Private key format is incorrect! Please check again.", {
                        title: "Oops",
                        autoHideDelay: 5000,
                        appendToast: true,
                        variant: "danger"
                    });
                }
            } catch {
                this.$bvToast.toast("Private key format is incorrect! Please check again.", {
                    title: "Oops",
                    autoHideDelay: 5000,
                    appendToast: true,
                    variant: "danger"
                });
            }
        }
    },
    created() {
        this.CheckSession();
    },
    mounted() {
        let privKey = window.localStorage.getItem(this.$STORAGE_PRIVKEY);
        if (privKey)
        {
            this.privateKey = privKey;
        }
        
        if (this.hidePrivateKey)
        {
            this.showingPrivateKey = Array(this.privateKey.length + 1).join("*");
        }
        else
        {
            this.showingPrivateKey = this.privateKey;
        }
    }
}
</script>

<style>
#app {
    font-family: Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100vh;
}

body
{
    background-color: #eee !important;
}
</style>
