<template>
<div class="d-flex flex-column h-100">
    <div id="messagesContainer" class="flex-grow-1 p-3 overflow-auto">
        <div v-if="listMessages.length === 0" class="text-center">
            <small><i>Start sending text messages to {{ receiver }}!</i></small>
        </div>
        <div class="w-100" v-for="message in listMessages" :key="message.MessageID">
            {{message.Content}}
        </div>
    </div>
    <div id="chatbox" class="border-top p-2">
        <b-form inline @submit="sendMessage">
            <b-input v-model="messageToSend" class="flex-grow-1 rounded-pill mr-sm-1 mb-sm-0 mb-2" placeholder="Aa"></b-input>
            <div class="d-flex rounded-circle justify-content-center" id="sendButton"><b-icon icon="cursor-fill" rotate="45" variant="primary"></b-icon></div>
        </b-form>
    </div>
</div>
</template>

<script>
import axios from "axios"

export default {
    name: 'Chatbox',
    props: {
        receiver: String
    },
    data() {
        return {
            listMessages: [],
            messageToSend: ""
        }
    },
    methods: {
        sendMessage(event) {
            event.preventDefault();
            
            axios.post("https://chat-backend.ducng.dev/users/sendMessage", {
                sessionID: this.$cookies.get(this.$COOKIE_SESSION_ID),
                receiver: this.receiver,
                message: this.messageToSend
            }).then(res => {
                if (res.data.status)
                {
                    this.getMessages();
                    this.messageToSend = "";
                }
                else
                {
                    this.$bvToast.toast("Unable to send message. Please contact admin if this occurs again.", {
                        title: "Oops!",
                        toaster: "b-toaster-top-center",
                        solid: true,
                        autoHideDelay: 5000
                    });
                }
            });
        },
        getMessages() {
            axios.post("https://chat-backend.ducng.dev/users/getMessages", {sessionID: this.$cookies.get(this.$COOKIE_SESSION_ID)})
            .then(res => {
                if (res.data.status)
                {
                    this.listMessages = res.data.messages;
                }
                else
                {
                    this.$bvToast.toast("Unable to get messages. Please contact admin if this occurs again.", {
                        title: "Oops!",
                        toaster: "b-toaster-top-center",
                        solid: true,
                        autoHideDelay: 5000
                    });
                }
            });
        }
    },
    created() {
        this.getMessages();
    }
}
</script>

<style>
#chatbox input {
    box-shadow: none;
}

#sendButton {
    cursor: pointer;
    color: blue;
    width: 36px;
    height: 36px;
    align-items: center;
    transition: background-color 0.1s linear;
}

#sendButton:hover {
    background-color: #eee;
}

#sendButton:active {
    background-color: #ddd;
}

#sendButton svg {
    width: 26px;
    height: 26px;
}
</style>