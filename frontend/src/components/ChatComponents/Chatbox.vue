<template>
<div class="h-100">
    <div class="h-100 d-flex align-items-center justify-content-center" v-if="!receiver.Username">
        Choose a friend to start talking to!
    </div>
    <div v-if="loadingMessages" class="h-100 d-flex flex-column align-items-center justify-content-center">
        <b-spinner variant="primary" label="Loading..."></b-spinner>
        <small class="mt-1"><i>Decrypting messages...</i></small>
    </div>
    <div class="d-flex flex-column h-100" v-if="receiver.Username && !loadingMessages">
        <div class="p-3 border-bottom position-relative shadow-sm">
            Chat with <b>{{ receiver.Username }}</b>
        </div>
        <div class="flex-grow-1" style="height: 75vh">
            <div class="h-100 d-flex flex-column-reverse p-3 overflow-auto" :id="$style.messagesContainer">
                <div v-if="listMessages.length === 0" class="text-center">
                    <small><i>Start sending text messages to {{ receiver.Username }}!</i></small>
                </div>
                <div v-for="message in listMessages" :key="message.MessageID">
                    <div v-if="message.Sender === currentUser.UserID" class="d-flex w-100 mb-1 justify-content-end">
                        <div :class="$style.outgoing_msg + ' text-break'" v-b-tooltip.hover.left="new Date(message.SendTime * 1000).toLocaleString('en-NZ')">{{ message.Content }}</div>
                    </div>
                    <div v-if="message.Receiver === currentUser.UserID" class="d-flex w-100 mb-1 justify-content-start">
                        <div :class="$style.incoming_msg + ' text-break'" v-b-tooltip.hover.right="new Date(message.SendTime * 1000).toLocaleString('en-NZ')">{{ message.Content }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div id="chatbox" class="border-top p-2">
            <b-form inline @submit="sendMessage">
                <b-input :id="$style.messageInput" class="flex-grow-1 rounded-pill mr-1" placeholder="Type..."/>
                <div class="d-inline-flex rounded-circle justify-content-center" :id="$style.sendButton"><b-icon icon="cursor-fill" rotate="45" variant="primary"></b-icon></div>
            </b-form>
        </div>
    </div>
</div>
</template>

<script>
import axios from "axios"

var interval_refreshMsgs, interval_decryptMsgs;
var getMessagesQueue = 0;
var updatedReceiver = false;

export default {
    name: 'Chatbox',
    props: {
        currentUser: Object
    },
    data() {
        return {
            listMessages: [],
            listEncMessages: [],
            decMessagesID: new Set(),
            receiver: {},
            loadingMessages: false
        }
    },
    methods: {
        sendMessage(event) {
            event.preventDefault();
            let msgBox = document.getElementById(this.$style.messageInput);
            let msgContent = msgBox.value;
            msgBox.value = "";
            
            if (msgContent && this.receiver.UserID && this.receiver.PublicKey)
            {
                let encryptedMsg = this.$crypto.encryptMessage(msgContent, this.currentUser.PublicKey, this.receiver.PublicKey);
                
                if (encryptedMsg)
                {
                    axios.post("https://chat-backend.ducng.dev/users/sendMessage", {
                        sessionID: this.$cookies.get(this.$COOKIE_SESSION_ID),
                        receiverID: this.receiver.UserID,
                        encryptedMsg: encryptedMsg
                    }).then(res => {
                        if (res.data.status)
                        {
                            this.getMessages();
                        }
                        else
                        {
                            this.$bvToast.hide();
                            this.$bvToast.toast("Unable to send message. Please contact admin if this occurs again.", {
                                title: "Oops!",
                                toaster: "b-toaster-top-center",
                                solid: true,
                                autoHideDelay: 3000,
                                variant: "danger"
                            });
                            
                            msgBox.value = msgContent;
                        }
                    });
                }
            }
        },
        getMessages(pReceiver = this.receiver) {
            let queue = ++getMessagesQueue;
            
            if (pReceiver.UserID)
            {
                axios.post("https://chat-backend.ducng.dev/users/getMessages", {sessionID: this.$cookies.get(this.$COOKIE_SESSION_ID), receiverID: pReceiver.UserID})
                .then(res => {
                    if (queue == getMessagesQueue)
                    {                        
                        if (res.data.status)
                        {                            
                            this.listEncMessages = [...res.data.messages, ...this.listEncMessages].filter(entry => {
                                return !this.decMessagesID.has(entry.MessageID);
                            });
                            
                            if (this.listEncMessages.length > 0)
                            {
                                clearInterval(interval_decryptMsgs);
                                interval_decryptMsgs = setInterval(() => {
                                    if (this.listEncMessages.length > 0)
                                    {
                                        let entry = this.listEncMessages.pop();
                                        if (!this.decMessagesID.has(entry.MessageID))
                                        {
                                            this.decMessagesID.add(entry.MessageID);
                                            let encKey = entry.Sender === this.currentUser.UserID ? entry.KeySender : entry.KeyReceiver;
                                            
                                            this.$crypto.decryptMessage(entry.Content, window.localStorage.getItem(this.$STORAGE_PRIVKEY), encKey, entry.IV, entry.AuthTag).then(decMsg => {
                                                if (decMsg)
                                                {
                                                    entry.Content = decMsg;
                                                    this.listMessages.unshift(entry);
                                                }
                                                else
                                                {
                                                    console.error("Cannot decrypt message #" + entry.MessageID);
                                                }
                                            });
                                        }
                                    }
                                    else
                                    {
                                        this.listMessages = this.listMessages.sort((a, b) => {
                                            return b.MessageID - a.MessageID;
                                        });
                                        
                                        this.loadingMessages = false;
                                        
                                        clearInterval(interval_decryptMsgs);
                                    }
                                }, 0);
                            }
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
                    }
                });
            }
        },
        updateReceiver(newReceiver) {
            if (newReceiver.UserID !== this.receiver.UserID) {
                clearInterval(interval_decryptMsgs);
                clearInterval(interval_refreshMsgs);
                this.loadingMessages = true;
                this.listMessages = [];
                this.decMessagesID = new Set();
                this.getMessages(newReceiver);
                interval_refreshMsgs = setInterval(this.getMessages, 1000);
            }
            
            updatedReceiver = true;
        }
    },
    updated() {
        if (updatedReceiver)
        {
            document.getElementById(this.$style.messageInput)?.focus();
            updatedReceiver = false;
        }
    },
    created() {
        this.getMessages();
        
        interval_refreshMsgs = setInterval(this.getMessages, 1000);
    },
    destroyed() {
        clearInterval(interval_refreshMsgs);
        clearInterval(interval_decryptMsgs);
    }
}
</script>

<style module>
</style>