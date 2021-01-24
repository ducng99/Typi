<template>
<b-modal :title="title" :id="$style.listFriendsModal" hide-footer>
    <div>
        <div v-for="user in listFriends" :key="user.Username" :class="'d-flex p-3 align-items-center rounded ' + $style.list_entry">
            <b-avatar class="mr-3" :text="user.Username.charAt(0)"></b-avatar>
            <div class="mr-auto">{{ user.Username }}</div>
            <div class="button-icon mr-3" @click="updateRelationship(user.Username, 'Friends', $event)" v-if="type === 'Pending'">
                <b-icon icon="check" font-scale="1.5" variant="primary"></b-icon>
            </div>
            <div class="button-icon" @click="updateRelationship(user.Username, 'None', $event)" v-if="RegExp('^(Pending|Blocked)$').test(type)">
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

<script>
import axios from "axios"

export default {
    name: "ListFriendsModal",
    data() {
        return {
            title: "",
            listFriends: [],
            type: ""
        }
    },
    methods: {
        create(list, type) {
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
        },
        updateRelationship(targetUsername, rela, event) {
            let parentNode = event.currentTarget.parentElement;
            parentNode.classList.add("disabled");
            
            axios.post("https://chat-backend.ducng.dev/users/updateRelationship", {
                sessionID: this.$cookies.get(this.$COOKIE_SESSION_ID),
                targetUsername: targetUsername,
                relationship: rela
            }).then(res => {
                if (res.data.status)
                {
                    this.listFriends = this.listFriends.filter(entry => {
                        return entry.Username !== targetUsername;
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
                    
                    parentNode.classList.remove("disabled");
                }
            });
        }
    }
}
</script>

<style module>
#listFriendsModal .list_entry {
    transition: background-color 0.1s linear;
    user-select: none;
}

#listFriendsModal .list_entry:hover {
    background-color: #f3f3f3;
}

#listFriendsModal .list_entry.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>