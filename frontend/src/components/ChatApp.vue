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
                <div class="p-2 rounded chat-picker" v-for="friend in listFriends" :key="friend.Username" @click="receiver = friend.Username">
                    <div class="d-inline-flex justify-content-center button-icon rounded-circle mr-3"><b-icon icon="person-fill" class="rounded-circle"></b-icon></div>
                    <div class="d-inline-block">{{friend.Username}}</div>
                </div>
            </b-col>
            <b-col cols="10" id="main" class="p-0">
                <Chatbox :receiver="receiver"/>
            </b-col>
        </b-row>
        
        <AddFriendModal/>
    </b-container>
</template>

<script>
import axios from "axios"
import AddFriendModal from "./ChatComponents/AddFriendModal.vue"
import Chatbox from "./ChatComponents/Chatbox.vue"

export default {
    name: 'ChatApp',
    components: {
        AddFriendModal, Chatbox
    },
    props: {
        
    },
    data() {
        return {
            username: "",
            receiver: "who",
            listFriends: []
        }
    },
    methods: {
        updateFriendsList() {
            axios.post("https://chat-backend.ducng.dev/users/getFriends", {sessionID: this.$cookies.get(this.$COOKIE_SESSION_ID)})
                .then(res => {
                    if (res.data.status)
                    {
                        this.listFriends = res.data.friends;
                    }
                });
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
        
        this.updateFriendsList();
        setInterval(() => {
            this.updateFriendsList();
        }, 60000);
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

.button-icon:hover, .chat-picker:hover {
    background-color: #ddd;
}

.button-icon:active, .chat-picker:active {
    background-color: #ccc;
}

.chat-picker {
    cursor: pointer;
    transition: background-color 0.1s linear;
}
</style>