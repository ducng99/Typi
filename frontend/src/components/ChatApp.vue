<template>
<div>
    <b-container fluid>
        <b-row>
            <b-col cols="2" id="sidebar_Top" class="p-3 border-right border-bottom"><b>{{username}}</b></b-col>
            <b-col cols="10" id="main_Top" class="p-3 border-left border-bottom">Receiver</b-col>
        </b-row>
    </b-container>
</div>
</template>

<script>
import axios from "axios"

export default {
    name: 'ChatApp',
    props: {
        
    },
    data() {
        return {
            username: ""
        }
    },
    methods: {
        
    },
    created() {
        axios.post("https://chat-backend.ducng.dev/getUser", {sessionID: this.$cookies.get(this.$COOKIE_SESSION_ID)})
            .then(res => {
                if (res.data.status)
                {
                    this.username = res.data.username;
                }
            });
    }
}
</script>

<style>
#sidebar_Top, #main_Top {
    background-color: #fff;
}
</style>