<template>
    <b-modal id="addFriendModal" title="Add friend">
        <b-form-group label="Their username:">
            <b-input v-model="addFriend_username" placeholder="username"></b-input>
        </b-form-group>
        <b-alert v-model="showAlert" :variant="alertType" dismissable>{{ alertMsg }}</b-alert>
        <template #modal-footer>
            <b-button @click="onAddFriend" variant="primary">Add</b-button>
        </template>
    </b-modal>
</template>

<script>
import axios from "axios"

export default {
    name: 'AddFriendModal',
    props: {
        
    },
    data() {
        return {
            showAlert: false,
            alertMsg: "",
            alertType: "success",
            addFriend_username: ""
        }
    },
    methods: {
        onAddFriend(event) {
            axios.post("https://chat-backend.ducng.dev/users/addFriend", {sessionID: this.$cookies.get(this.$COOKIE_SESSION_ID), targetUsername: this.addFriend_username})
                .then(res => {
                    if (res.data.status)
                    {
                        this.alertType = "success";
                    }
                    else
                    {
                        this.alertType = "danger";
                    }
                    
                    this.alertMsg = res.data.msg;
                    this.showAlert = true;
                });
        }
    }
}
</script>

<style>

</style>