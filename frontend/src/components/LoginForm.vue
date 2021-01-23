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
import NodeRSA from "node-rsa"

export default {
    name: 'LoginForm',
    props: {
        privateKey: String
    },
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
            
            let key = new NodeRSA(this.privateKey);
            if (key.isPrivate())
            {
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
            }
            else
            {
                this.log_showAlert = true;
                this.log_alert = "Your private key is not in the correct format. Please check again";
            }
        }
    }
}
</script>

<style>

</style>