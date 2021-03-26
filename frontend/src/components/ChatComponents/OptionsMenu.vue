<template>
<div v-if="value" class="position-absolute rounded p-2 mt-1 shadow bg-white" :id="$style.optionsMenu" v-on-clickaway="away">
    <div :class="'py-2 px-3 rounded d-flex align-items-center ' + $style.menu_entry" @click="logout">
        <b-icon icon="box-arrow-right" class="mr-3"></b-icon>Logout
    </div>
</div>
</template>

<script lang="ts">
import axios from "axios"
import { Component, Prop, Vue } from 'vue-property-decorator';
import Constants from '../../constants'
import { mixin as clickaway } from 'vue-clickaway';

@Component({
    name: "OptionsMenu",
    mixins: [ clickaway ]
})
export default class OptionsMenu extends Vue {
    @Prop({required: true}) value!: boolean;
    
    away() : void {
        this.$emit("input", false);
    }
    
    logout() : void {
        axios.post(Constants.BACKEND_SERVER_ADDR + "/logout")
        .then(res => {
            if (res.data.status)
            {
                this.$cookies.remove(Constants.COOKIE_SESSION_ID);
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
</script>

<style module>
</style>