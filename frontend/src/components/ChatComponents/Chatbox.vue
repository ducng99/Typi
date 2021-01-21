<template>
<div class="h-100">
    <div class="h-100 d-flex align-items-center justify-content-center" v-if="!receiver">
        Choose a friend to start talking to!
    </div>
    <div class="d-flex flex-column h-100" v-if="receiver">
        <div class="p-3 border-bottom position-relative shadow-sm">
            Chat with <b>{{receiver}}</b>
        </div>
        <div class="flex-grow-1 d-flex align-items-end" style="height: 75vh">
            <div v-if="loadingMessages" class="h-100 w-100 d-flex align-items-center justify-content-center">
                <b-spinner variant="primary" label="Loading..."></b-spinner>
            </div>
            <div v-else class="w-100 h-100 p-3 overflow-auto" id="messagesContainer">
                <div v-if="listMessages.length === 0" class="text-center">
                    <small><i>Start sending text messages to {{ receiver }}!</i></small>
                </div>
                <div class="w-100" v-for="message in listMessages.slice().reverse()" :key="message.MessageID">
                    <div v-if="message.Sender === myUserID" class="d-flex w-100 mb-1 justify-content-end">
                        <div class="outgoing_msg" v-b-tooltip.hover.left="new Date(message.SendTime * 1000).toLocaleString('en-NZ')">{{ message.Content }}</div>
                    </div>
                    <div v-if="message.Receiver === myUserID" class="d-flex w-100 mb-1 justify-content-start">
                        <div class="incoming_msg" v-b-tooltip.hover.right="new Date(message.SendTime * 1000).toLocaleString('en-NZ')">{{ message.Content }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div id="chatbox" class="border-top p-2">
            <b-form inline @submit="sendMessage">
                <b-input v-model="messageToSend" class="flex-grow-1 rounded-pill mr-sm-1 mb-sm-0 mb-2" placeholder="Type..."></b-input>
                <div class="d-flex rounded-circle justify-content-center" id="sendButton"><b-icon icon="cursor-fill" rotate="45" variant="primary"></b-icon></div>
            </b-form>
        </div>
    </div>
</div>
</template>

<script>
import axios from "axios"

var interval_refreshMsgs;
var msgContainerScrolled = false;
var msgContainer;
var getMessagesQueue = 0;

function updateMessagesScroll() {
    if (msgContainer.scrollHeight - msgContainer.clientHeight != 0)
    {    
        if (msgContainer.scrollTop == msgContainer.scrollHeight - msgContainer.clientHeight && msgContainerScrolled)
        {
            msgContainerScrolled = false;
        }
        
        if (!msgContainerScrolled)
        {
            msgContainer.scrollTop = msgContainer.scrollHeight - msgContainer.clientHeight;
        }
    }
}

export default {
    name: 'Chatbox',
    props: {
        myUserID: Number
    },
    data() {
        return {
            listMessages: [],
            messageToSend: "",
            receiver: "",
            loadingMessages: false
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
                    this.$bvToast.hide();
                    this.$bvToast.toast("Unable to send message. Please contact admin if this occurs again.", {
                        title: "Oops!",
                        toaster: "b-toaster-top-center",
                        solid: true,
                        autoHideDelay: 5000,
                        variant: "danger"
                    });
                }
            });
        },
        getMessages(pReceiver = this.receiver) {
            let queue = ++getMessagesQueue;
            
            if (pReceiver)
            {
                axios.post("https://chat-backend.ducng.dev/users/getMessages", {sessionID: this.$cookies.get(this.$COOKIE_SESSION_ID), receiver: pReceiver})
                .then(res => {
                    if (queue < getMessagesQueue)
                        return;
                    
                    if (res.data.status)
                    {
                        let tmp = new Set();
                        
                        this.listMessages = [...res.data.messages, ...this.listMessages].filter(entry => {
                            if (tmp.has(entry.MessageID)) {
                                return false;
                            }
                            tmp.add(entry.MessageID);
                            return true;
                        });
                        
                        this.loadingMessages = false;
                    }
                    else
                    {
                        this.$bvToast.hide();
                        this.$bvToast.toast("Unable to get messages. Please contact admin if this occurs again.", {
                            title: "Oops!",
                            toaster: "b-toaster-top-center",
                            solid: true,
                            autoHideDelay: 5000,
                            variant: "danger"
                        });
                    }
                    
                    this.receiver = pReceiver;
                });
            }
        },
        updateReceiver(newReceiver) {
            if (newReceiver !== this.receiver) {
                clearInterval(interval_refreshMsgs);
                this.loadingMessages = true;
                msgContainerScrolled = false;
                this.listMessages = [];
                this.getMessages(newReceiver);
                interval_refreshMsgs = setInterval(this.getMessages, 1000);
            }
            
            document.querySelector("#chatbox input")?.focus();
        }
    },
    updated() {
        msgContainer = document.getElementById("messagesContainer");
        msgContainer.onscroll = (event) => { msgContainerScrolled = true };
        updateMessagesScroll();
    },
    created() {
        this.getMessages();
        
        interval_refreshMsgs = setInterval(this.getMessages, 1000);
    },
    destroyed() {
        clearInterval(interval_refreshMsgs);
    }
}
</script>

<style>
#chatbox input {
    box-shadow: none;
    background-color: #f3f3f3;
    border: none;
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
    background-color: #f3f3f3;
}

#sendButton:active {
    background-color: #e5e5e5;
}

#sendButton svg {
    width: 26px;
    height: 26px;
}

.outgoing_msg {
    background-color: #007bff;
    color: white;
}

.incoming_msg {
    background-color: #eee;
}

.outgoing_msg, .incoming_msg {
    border-radius: 18px;
    padding: 7px 12px 8px 12px;
}
</style>