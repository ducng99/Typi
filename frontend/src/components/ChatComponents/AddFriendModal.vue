<template>
    <b-modal id="addFriendModal" title="Add friend">
        <b-form-group label="Their username:">
            <b-input v-model="addFriend_username" placeholder="username"></b-input>
        </b-form-group>
        <b-alert v-model="showAlert" :variant="alertType" dismissible fade>{{ alertMsg }}</b-alert>
        <template #modal-footer>
            <b-button @click="onAddFriend" variant="primary">Add</b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import axios from "axios"
import Constants from '../../constants'

@Component({
    name: 'AddFriendModal'
})
export default class AddFriendModal extends Vue {
    private showAlert = false;
    private alertMsg = "";
    private alertType = "success";
    private addFriend_username = "";
        
    onAddFriend() : void {
        axios.post(Constants.BACKEND_SERVER_ADDR + "/users/addFriend", {targetUsername: this.addFriend_username})
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
</script>

<style>

</style>