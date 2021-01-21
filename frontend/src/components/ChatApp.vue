<template>
    <b-container fluid id="chatAppContainer" class="d-flex h-100 flex-column">
        <b-row class="flex-grow-1">
            <b-col cols="2" id="sidebar" class="p-3 border-right">
                <h2>Typi</h2>
                <div class="d-flex align-items-center">
                    <div class="mr-auto">
                        Hi <b>{{currentUser.Username}}</b>.
                    </div>
                    <div @click="$bvModal.show('addFriendModal')" class="d-flex button-icon rounded-circle justify-content-center align-items-center">
                        <b-icon icon="person-plus-fill"></b-icon>
                    </div>
                    <div class="ml-1">
                        <div @click="showMenu = !showMenu" class="d-flex button-icon rounded-circle justify-content-center align-items-center">
                            <b-icon icon="three-dots"></b-icon>
                        </div>
                        <OptionsMenu v-model="showMenu"/>
                    </div>
                </div>
                <div class="mt-3" id="listFriends">
                    <div class="d-flex p-2 rounded menu-entry align-items-center" v-if="pendingFriends.length > 0">
                        <b-badge class="mr-2" variant="info">{{ pendingFriends.length }}</b-badge>
                        <b>Pending requests</b>
                    </div>
                    <div class="d-flex p-2 rounded menu-entry align-items-center" v-for="friend in acceptedFriends" :key="friend.Username" @click="onChatPick(friend.Username)">
                        <div class="d-inline-flex justify-content-center mr-3"><b-avatar icon="person-fill"></b-avatar></div>
                        <div class="d-inline-block">{{friend.Username}}</div>
                    </div>
                </div>
            </b-col>
            <b-col cols="10" id="main" class="p-0">
                <Chatbox ref="chatbox" :myUserID="currentUser.UserID"/>
            </b-col>
        </b-row>
        
        <ListFriendsModal ref="listFriendsModal"/>
        <AddFriendModal/>
    </b-container>
</template>

<script>
import axios from "axios"
import AddFriendModal from "./ChatComponents/AddFriendModal.vue"
import Chatbox from "./ChatComponents/Chatbox.vue"
import OptionsMenu from "./ChatComponents/OptionsMenu.vue"
import ListFriendsModal from "./ChatComponents/ListFriendsModal.vue"

export default {
    name: 'ChatApp',
    components: {
        AddFriendModal, Chatbox, OptionsMenu, ListFriendsModal
    },
    data() {
        return {
            currentUser: {},
            receiver: "",
            acceptedFriends: [],
            blockedFriends: [],
            pendingFriends: [],
            showMenu: false
        }
    },
    methods: {
        updateFriendsList() {
            axios.post("https://chat-backend.ducng.dev/users/getFriends", {sessionID: this.$cookies.get(this.$COOKIE_SESSION_ID)})
                .then(res => {
                    if (res.data.status)
                    {
                        this.acceptedFriends = res.data.friends.filter(entry => {
                            if (entry.Status === "Friends")
                                return true;
                            
                            return false;
                        });
                        
                        this.blockedFriends = res.data.friends.filter(entry => {
                            if (entry.Status === "Blocked" && entry.TargetUser !== this.currentUser.UserID)
                                return true;
                            
                            return false;
                        });
                        
                        this.pendingFriends = res.data.friends.filter(entry => {
                            if (entry.Status === "Pending" && entry.TargetUser !== this.currentUser.UserID)
                                return true;
                            
                            return false;
                        });
                    }
                });
        },
        onChatPick(pReceiver) {
            this.receiver = pReceiver;
            this.$refs.chatbox.updateReceiver(this.receiver);
        }
    },
    created() {
        axios.post("https://chat-backend.ducng.dev/users/get", {sessionID: this.$cookies.get(this.$COOKIE_SESSION_ID)})
            .then(res => {
                if (res.data.status)
                {
                    this.currentUser = res.data.user;
                }
                else
                {
                    this.$emit("loginCheck");
                }
            });
        
        this.updateFriendsList();
        setInterval(() => {
            this.updateFriendsList();
        }, 1000);
    }
}
</script>

<style>
#sidebar, #main {
    background-color: #fff;
}

.button-icon {
    cursor: pointer;
    height: 38px;
    width: 38px;
    background-color: #eee;
    transition: background-color 0.2s linear;
}

.button-icon:hover {
    background-color: #ddd;
}

.button-icon:active {
    background-color: #ccc;
}

.menu-entry {
    cursor: pointer;
    transition: background-color 0.1s linear;
    -webkit-user-select: none;
    -moz-user-select: none;
    -khtml-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.menu-entry:hover {
    background-color: #eee;
}

.menu-entry:active {
    background-color: #ddd;
}
</style>