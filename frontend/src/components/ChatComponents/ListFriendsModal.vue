<template>
<b-modal :title="title" :id="$style.listFriendsModal" hide-footer>
    <div>
        <div v-for="user in listFriends" :key="user.Username" :class="'d-flex p-3 align-items-center rounded ' + $style.list_entry">
            <b-avatar class="mr-3" :text="user.Username.charAt(0)"></b-avatar>
            <div class="mr-auto">{{ user.Username }}</div>
            <div :class="$style.button_icon + ' mr-3'" @click="updateRelationship(user.UserID, 'Friends', $event)" v-if="type === 'Pending'">
                <b-icon icon="check" font-scale="1.5" variant="primary"></b-icon>
            </div>
            <div :class="$style.button_icon" @click="updateRelationship(user.Username, 'None', $event)" v-if="RegExp('^(Pending|Blocked)$').test(type)">
                <b-icon icon="x" font-scale="1.5" variant="danger"></b-icon>
            </div>
        </div>
        <div v-if="listFriends.length == 0">
            <i v-if="type === 'Pending'">You don't have any requests left!</i>
            <i v-if="type === 'Blocked'">You have no one on your blocked list.</i>
        </div>
    </div>
</b-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import axios from "axios"
import Constants from '@/constants'
import User from '@/models/User'

@Component({
    name: "ListFriendsModal"
})
export default class ListFriendsModal extends Vue {
    title = "";
    listFriends!: User[];
    type = "";
    
    create(list: User[], type: string) : void {
        switch(type)
        {
            case "Pending":
                this.title = "Pending requests";
                break;
            case "Blocked":
                this.title = "Blocked users";
                break;
            default:
                break;
        }
        this.listFriends = list;
        this.type = type;
        this.$bvModal.show(this.$style.listFriendsModal);
    }
    
    updateRelationship(targetUserID: number, rela: string, event: Event) : void {
        let parentNode = (event.currentTarget as HTMLElement).parentElement;
        parentNode?.classList.add(this.$style.disabled);
        
        axios.post(Constants.BACKEND_SERVER_ADDR + "/users/updateRelationship", {
            targetUserID: targetUserID,
            relationship: rela
        }).then(res => {
            if (res.data.status)
            {
                this.listFriends = this.listFriends.filter(entry => {
                    return entry.UserID !== targetUserID;
                });
            }
            else
            {
                this.$bvToast.hide();
                this.$bvToast.toast("We are unable to process your request. Please contact admin if this occurs again.", {
                    title: "Oops!",
                    toaster: "b-toaster-top-center",
                    solid: true,
                    autoHideDelay: 5000,
                    variant: "danger"
                });                
                
                parentNode?.classList.remove(this.$style.disabled);
            }
        });
    }
}
</script>

<style module>
</style>