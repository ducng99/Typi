<template>
    <b-container fluid id="chatAppContainer" class="d-flex h-100 flex-column">
        <b-row>
            <b-col cols="2" id="sidebar_Top" class="p-3 border-right">
                <div class="d-inline-block">
                    Hi <b>{{username}}</b>.
                </div>
                <div @click="$bvModal.show('addFriendModal')" id="addFriendButton" class="d-flex button-icon float-right rounded-circle justify-content-center">
                    <b-icon icon="person-plus-fill"></b-icon>
                </div>
            </b-col>
            <b-col cols="10" id="main_Top" class="p-3 border-bottom shadow-sm">Chat with <b>{{receiver}}</b></b-col>
        </b-row>
        <b-row class="flex-grow-1">
            <b-col cols="2" id="sidebar" class="p-3 border-right">
                <div class="p-3" v-for="friend in listFriends" :key="friend.Username">{{friend.Username}}</div>
            </b-col>
            <b-col cols="10" id="main" class="d-flex flex-column p-0">
                <div id="messagesContainer" class="flex-grow-1 p-3">
                    c
                </div>
                <div id="chatbox" class="border-top p-2">
                    <b-form inline @submit="onChat">
                        <b-input v-model="message" class="flex-grow-1 rounded-pill mr-sm-3 mb-sm-0 mb-2" placeholder="Aa"></b-input>
                        <b-button type="submit" variant="primary">Send</b-button>
                    </b-form>
                </div>
            </b-col>
        </b-row>
        
        <AddFriendModal/>
    </b-container>
</template>

<script>
import axios from "axios"
import AddFriendModal from "./ChatComponents/AddFriendModal.vue"

export default {
    name: 'ChatApp',
    components: {
        AddFriendModal
    },
    props: {
        
    },
    data() {
        return {
            username: "",
            receiver: "who",
            message: "",
            listFriends: []
        }
    },
    methods: {
        onChat(event) {
            event.preventDefault();
            
            this.message = "";
        }
    },
    created() {
        axios.post("https://chat-backend.ducng.dev/users/get", {sessionID: this.$cookies.get(this.$COOKIE_SESSION_ID)})
            .then(res => {
                if (res.data.status)
                {
                    this.username = res.data.username;
                }
                else
                {
                    this.$emit("loginCheck");
                }
            });
        
        axios.post("https://chat-backend.ducng.dev/users/getFriends", {sessionID: this.$cookies.get(this.$COOKIE_SESSION_ID)})
            .then(res => {
                if (res.data.status)
                {
                    this.listFriends = res.data.friends;
                }
            });
    }
}
</script>

<style>
#sidebar_Top, #main_Top, #sidebar, #main {
    background-color: #fff;
}

#main_Top {
    position: relative;
    z-index: 1;
}

.button-icon {
    cursor: pointer;
    height: 30px;
    width: 30px;
    align-items: center;
    background-color: #eee;
    transition: background-color 0.2s linear;
}

.button-icon:hover {
    background-color: #ddd;
}

.button-icon:active {
    background-color: #ccc;
}
</style>