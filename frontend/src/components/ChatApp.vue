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
                <Chatbox ref="chatbox" :currentUser="currentUser" :listKeys="listKeys"/>
            </b-col>
        </b-row>
        
        <ListFriendsModal ref="listFriendsModal"/>
        <AddFriendModal/>
    </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import axios from "axios"
import Constants from '@/constants'
import User from '@/models/User'
import MessageEncryption from '@/encryption/MessageEncryption'

import AddFriendModal from "@/components/ChatComponents/AddFriendModal.vue"
import Chatbox from "@/components/ChatComponents/Chatbox.vue"
import OptionsMenu from "@/components/ChatComponents/OptionsMenu.vue"
import ListFriendsModal from "@/components/ChatComponents/ListFriendsModal.vue"
import PrivateKey from '@/models/PrivateKey';

let keepAliveInterval: number, updateFriendsListInterval: number;

@Component({
    name: 'ChatApp',
    components: {
        AddFriendModal, Chatbox, OptionsMenu, ListFriendsModal
    }
})
export default class ChatApp extends Vue {
    currentUser: User|null = null;
    acceptedFriends: User[] = [];
    blockedFriends: User[] = [];
    pendingFriends: User[] = [];
    showMenu = false;
    listKeys: Record<string, PrivateKey> = {}
    
    $refs!: Vue["$refs"] & {
        chatbox: InstanceType<typeof Chatbox>,
        listFriendsModal: InstanceType<typeof ListFriendsModal>
    }
    
    private updateFriendsList() : void
    {
        axios.get(Constants.BACKEND_SERVER_ADDR + "/users/getFriends")
        .then(res => {
            if (res.data.status)
            {
                this.acceptedFriends = res.data.friends.filter((entry: any) => {
                    return entry.Status === "Friends";
                });
                
                this.blockedFriends = res.data.friends.filter((entry: any) => {
                    return (entry.Status === "Blocked" && entry.TargetUser !== this.currentUser?.UserID);
                });
                
                this.pendingFriends = res.data.friends.filter((entry: any) => {
                    return (entry.Status === "Pending" && entry.TargetUser === this.currentUser?.UserID);
                });
            }
        });
    }
    
    public onChatPick(receiver : any) : void {
        this.$refs.chatbox.updateReceiver(receiver);
    }
    
    showListFriendsModal(type: string) : void
    {
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
    }
    
    keepAlive() : void {
        this.sendKeepAlive();
        clearInterval(keepAliveInterval);
        
        keepAliveInterval = setInterval(() => {
            this.sendKeepAlive();
        }, 60000);
    }
    
    sendKeepAlive() : void {
        axios.get(Constants.BACKEND_SERVER_ADDR + "/sessions/keepAlive")
        .then(res => {
            if (!res.data.status)
            {
                console.error("Cannot send keep-alive request.");
                this.$emit("loginCheck");
            }
        });
    }
    
    created() : void {
        axios.get(Constants.BACKEND_SERVER_ADDR + "/users/get")
        .then(res => {
            if (res.data.status)
            {
                this.currentUser = User.Init(res.data.user);
        
                this.updateFriendsList();
                updateFriendsListInterval = setInterval(() => {
                    this.updateFriendsList();
                }, 1000);
                
                this.keepAlive();
                
                MessageEncryption.UpdateStorageKeys(this.currentUser.UserID, this.listKeys);
            }
            else
            {
                this.$emit("loginCheck");
            }
        });
    }
    
    destroyed() : void {
        clearInterval(updateFriendsListInterval);
        clearInterval(keepAliveInterval);
    }
    
    onIdle() : void {
        clearInterval(keepAliveInterval);
    }
    
    onActive() : void {
        this.keepAlive();
    }
}
</script>

<style module>

</style>