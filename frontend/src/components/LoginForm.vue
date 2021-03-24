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
</div>
</template>

<script>
import axios from "axios"
import crypto from 'crypto'
import SecureStorage from '../SecureStorage'

export default {
    name: 'LoginForm',
    data() {
        return {
            log_username: '',
            log_password: '',
            log_alert: '',
            log_showAlert: false
        }
    },
    methods: {
        onSubmit(event) {
            event.preventDefault();
            
            axios.post("https://chat-backend.ducng.dev/creds/login", {username: this.log_username, password: this.log_password, sender: location.hostname })
            .then(res => {                    
                if (res.data.status)
                {
                    import('../SecureStorage').then(SecureStorage => {
                        SecureStorage.default.passwordHash = crypto.createHash('sha256').update(this.log_password).digest('hex');
                    });
                    this.$emit("loginCheck");
                }
                
                this.log_showAlert = true;
                this.log_alert = res.data.msg;
            });
        }
    }
}
</script>

<style>

</style>