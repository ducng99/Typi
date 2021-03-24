<template>
    <b-container fluid class="d-flex h-100 flex-column">
        <b-row class="flex-grow-1">
            <b-col cols="2" class="p-3 border-right bg-white">
                <div class="d-flex align-items-center">
                    <img src="../assets/typi-logo.png" style="height: 40px"/><h2>ypi</h2>
                </div>
                <div class="d-flex align-items-center">
                    <div class="mr-auto">
                        Hi <b>{{ currentUser.Username }}</b>.
                    </div>
                    <div @click="$bvModal.show('addFriendModal')" :class="$style.button_icon">
                        <b-icon icon="person-plus-fill"></b-icon>
                    </div>
                    <div class="ml-1">
                        <div @click="showMenu = !showMenu" :class="$style.button_icon">
                            <b-icon icon="three-dots"></b-icon>
                        </div>
                        <OptionsMenu v-model="showMenu"/>
                    </div>
                </div>
                <div class="mt-3" id="listFriends">
                    <div :class="'d-flex p-2 rounded align-items-center justify-content-between ' + $style.menu_entry" v-if="pendingFriends.length > 0" @click="showListFriendsModal('Pending')">
                        <b>Pending requests</b>
                        <b-badge variant="info">{{ pendingFriends.length }}</b-badge>
                    </div>
                    <div :class="'d-flex p-2 rounded align-items-center ' + $style.menu_entry" v-for="friend in acceptedFriends" :key="friend.Username" @click="onChatPick(friend)">
                        <div class="d-inline-flex justify-content-center mr-3"><b-avatar :text="friend.Username.charAt(0)"></b-avatar></div>
                        <div class="d-inline-block">{{ friend.Username }}</div>
                    </div>
                </div>
            </b-col>
            <b-col class="p-0 bg-white">
                <Chatbox ref="chatbox" :currentUser="currentUser"/>
            </b-col>
        </b-row>
        
        <ListFriendsModal ref="listFriendsModal"/>
        <AddFriendModal/>
    </b-container>
</template>

<script>
import axios from "axios"
import SecureStorage from '../SecureStorage'
import AddFriendModal from "./ChatComponents/AddFriendModal.vue"
import Chatbox from "./ChatComponents/Chatbox.vue"
import OptionsMenu from "./ChatComponents/OptionsMenu.vue"
import ListFriendsModal from "./ChatComponents/ListFriendsModal.vue"

axios.defaults.withCredentials = true;

var keepAliveInterval, updateFriendsListInterval;

export default {
    name: 'ChatApp',
    components: {
        AddFriendModal, Chatbox, OptionsMenu, ListFriendsModal
    },
    data() {
        return {
            currentUser: {},
            acceptedFriends: [],
            blockedFriends: [],
            pendingFriends: [],
            showMenu: false
        }
    },
    methods: {
        updateFriendsList() {
            axios.get("https://chat-backend.ducng.dev/users/getFriends")
                .then(res => {
                    if (res.data.status)
                    {
                        this.acceptedFriends = res.data.friends.filter(entry => {
                            return entry.Status === "Friends";
                        });
                        
                        this.blockedFriends = res.data.friends.filter(entry => {
                            return (entry.Status === "Blocked" && entry.TargetUser !== this.currentUser.UserID);
                        });
                        
                        this.pendingFriends = res.data.friends.filter(entry => {
                            return (entry.Status === "Pending" && entry.TargetUser === this.currentUser.UserID);
                        });
                    }
                });
        },
        onChatPick(receiver) {
            this.$refs.chatbox.updateReceiver(receiver);
        },
        showListFriendsModal(type) {
            switch (type) {
                case "Blocked":
                    this.$refs.listFriendsModal.create(this.blockedFriends, type);
                    break;
                case "Pending":
                    this.$refs.listFriendsModal.create(this.pendingFriends, type);
                    break;
                default:
                    break;
            }
        },
        keepAlive() {
            this.sendKeepAlive();
            clearInterval(keepAliveInterval);
            keepAliveInterval = setInterval(() => {
                this.sendKeepAlive();
            }, 60000);
        },
        sendKeepAlive() {
            axios.get("https://chat-backend.ducng.dev/sessions/keepAlive")
            .then(res => {
                if (!res.data.status)
                {
                    console.error("Cannot send keep-alive request.");
                }
            });
        },
        syncPublicKeys() {
            if (!SecureStorage.HasItem(this.$STORAGE_KEYS))
            {
                
            }
        }
    },
    created() {
        axios.get("https://chat-backend.ducng.dev/users/get")
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
        updateFriendsListInterval = setInterval(() => {
            this.updateFriendsList();
        }, 1000);
        
        this.keepAlive();
    },
    destroyed() {
        clearInterval(updateFriendsListInterval);
        clearInterval(keepAliveInterval);
    },
    onIdle() {
        clearInterval(keepAliveInterval);
    },
    onActive() {
        this.keepAlive();
    }
}
</script>

<style module>

</style>