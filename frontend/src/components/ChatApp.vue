<template>
    <b-container fluid class="d-flex h-100 flex-column">
        <b-row class="flex-grow-1">
            <b-col cols="2" :id="$style.sidebar" class="p-3 border-right">
                <h2>Typi</h2>
                <div class="d-flex align-items-center">
                    <div class="mr-auto">
                        Hi <b>{{currentUser.Username}}</b>.
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
                        <div class="d-inline-block">{{friend.Username}}</div>
                    </div>
                </div>
            </b-col>
            <b-col cols="10" :id="$style.main" class="p-0">
                <Chatbox ref="chatbox" :currentUser="currentUser"/>
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
            axios.post("https://chat-backend.ducng.dev/users/getFriends", {sessionID: this.$cookies.get(this.$COOKIE_SESSION_ID)})
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
            keepAliveInterval = setInterval(() => {
                this.sendKeepAlive();
            }, 60000);
        },
        sendKeepAlive() {
            axios.post("https://chat-backend.ducng.dev/keepAlive", {sessionID: this.$cookies.get(this.$COOKIE_SESSION_ID)})
            .then(res => {
                if (!res.data.status)
                {
                    console.error("Cannot send keep-alive request.");
                }
            });
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
#sidebar, #main {
    background-color: #fff;
}

.button_icon {
    cursor: pointer;
    height: 38px;
    width: 38px;
    background-color: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50px;
    transition: background-color 0.2s linear;
}

.button_icon:hover {
    background-color: #e9e9e9;
}

.button_icon:active {
    background-color: #dbdcdd;
}

.disabled .button_icon, .button_icon.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.disabled .button_icon:hover, .button_icon.disabled:hover {
    background-color: #e9e9e9;
}

.menu_entry {
    cursor: pointer;
    transition: background-color 0.1s linear;
    -webkit-user-select: none;
    -moz-user-select: none;
    -khtml-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.menu_entry:hover {
    background-color: #f3f3f3;
}

.menu_entry:active {
    background-color: #e5e5e5;
}
</style>