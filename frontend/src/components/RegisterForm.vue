<template>
<div>
    <b-container class="rounded shadow p-3" id="registerFormContainer">
        <h2 class="text-center">Register</h2>
        <b-alert v-model="reg_showAlert" :variant="reg_alertType" dismissible fade>{{ reg_alert }}</b-alert>
        <b-form @submit="onSubmit">
            <b-form-group label="Username:" description="Only letters, digits and underscore. Min 3 characters, max 32 characters.">
                <b-form-input v-model="reg_username" placeholder="Enter your username" pattern="(\w|\d){3,32}"></b-form-input>
            </b-form-group>
            <b-form-group label="Password:" description="Min 7 characters">
                <b-form-input type="password" v-model="reg_password" minlength="7"></b-form-input>
            </b-form-group>
            <b-button variant="primary" type="submit">Register</b-button>
        </b-form>
    </b-container>
</div>
</template>

<script>
import axios from "axios"

export default {
    name: 'RegisterForm',
    props: {
        
    },
    data() {
        return {
            reg_username: '',
            reg_password: '',
            reg_alert: '',
            reg_showAlert: false,
            reg_alertType: 'success'
        }
    },
    methods: {
        onSubmit(event) {
            event.preventDefault();
            
            axios.post("https://chat-backend.ducng.dev/register", {username: this.reg_username, password: this.reg_password})
                .then(res => {                    
                    if (res.data.status)
                    {
                        this.reg_alertType = "success";
                        this.$cookies.set(this.$COOKIE_SESSION_ID, res.data.sessionID, 0);
                        this.$emit("loginCheck");
                    }
                    else
                    {
                        this.reg_alertType = "danger";
                    }
                    
                    this.reg_alert = res.data.msg;
                    this.reg_showAlert = true;
                });
        }
    }
}
</script>

<style>
#registerFormContainer
{
    background-color: #fff;
}
</style>