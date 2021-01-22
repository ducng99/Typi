<template>
<div>
    <b-container class="rounded shadow p-3 bg-white">
        <h2 class="text-center">Login</h2>
        <b-alert v-model="log_showAlert" variant="danger" dismissible fade>{{ log_alert }}</b-alert>
        <b-form @submit="onSubmit">
            <b-form-group label="Username:">
                <b-form-input v-model="log_username" placeholder="Enter your username" pattern="(\w|\d){3,32}"></b-form-input>
            </b-form-group>
            <b-form-group label="Password:">
                <b-form-input v-model="log_password" type="password" minlength="7"></b-form-input>
            </b-form-group>
            <b-button variant="primary" type="submit">Login</b-button>
        </b-form>
    </b-container>
    <b-container class="rounded shadow p-3 mt-3 bg-white">
        <b class="text-danger">Private key</b> 🔑:
        <b-textarea v-model="showingPrivateKey" class="mt-1 mb-2" readonly></b-textarea>
        <b-button @click="toggleShowPrivateKey" :variant="this.hidePrivateKey ? 'danger' : ''">{{ this.hidePrivateKey ? 'Show' : 'Hide' }}</b-button>
    </b-container>
</div>
</template>

<script>
import axios from "axios"
import rsa from "node-rsa"

export default {
    name: 'LoginForm',
    props: {
        
    },
    data() {
        return {
            log_username: '',
            log_password: '',
            log_alert: '',
            log_showAlert: false,
            privateKey: "You don't have a private key stored in this browser",
            showingPrivateKey: "",
            hidePrivateKey: true
        }
    },
    methods: {
        onSubmit(event) {
            event.preventDefault();
            
            axios.post("https://chat-backend.ducng.dev/login", {username: this.log_username, password: this.log_password})
                .then(res => {                    
                    if (res.data.status)
                    {
                        this.$cookies.set(this.$COOKIE_SESSION_ID, res.data.sessionID, 0);
                        this.$emit("loginCheck");
                    }
                    else
                    {
                        this.log_showAlert = true;
                        this.log_alert = res.data.msg;
                    }
                });
        },
        toggleShowPrivateKey(event) {
            this.hidePrivateKey = !this.hidePrivateKey;
            
            if (this.hidePrivateKey)
            {
                this.showingPrivateKey = Array(this.privateKey.length + 1).join("*");
            }
            else
            {
                this.showingPrivateKey = this.privateKey;
            }
        }
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

</style>