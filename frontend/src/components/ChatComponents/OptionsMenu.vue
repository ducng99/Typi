<template>
<div v-if="value" class="position-absolute rounded p-2 mt-1 shadow bg-white" :id="$style.optionsMenu" v-on-clickaway="away">
    <div :class="'py-2 px-3 rounded d-flex align-items-center ' + $style.menu_entry" @click="logout">
        <b-icon icon="box-arrow-right" class="mr-3"></b-icon>Logout
    </div>
</div>
</template>

<script>
import axios from "axios"
import { mixin as clickaway } from 'vue-clickaway';

export default {
    name: "OptionsMenu",
    mixins: [ clickaway ],
    props: {
        value: {
            type: Boolean,
            required: true
        }
    },
    methods: {
        away() {
            this.$emit("input", false);
        },
        
        logout() {
            axios.post("https://chat-backend.ducng.dev/logout", {sessionID: this.$cookies.get(this.$COOKIE_SESSION_ID)})
            .then(res => {
                if (res.data.status)
                {
                    this.$cookies.remove(this.$COOKIE_SESSION_ID);
                    window.location.reload();
                }
                else
                {
                    this.$bvToast.hide();
                    this.$bvToast.toast("Unable to logout. Please contact admin if this occurs again.", {
                        title: "Oops!",
                        toaster: "b-toaster-top-center",
                        solid: true,
                        autoHideDelay: 5000,
                        variant: "danger"
                    });
                }
            });
        }
    }
}
</script>

<style module>
</style>