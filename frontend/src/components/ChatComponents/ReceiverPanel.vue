<template>
<div class="py-3">
    <div class="d-flex flex-column align-items-center">
        <b-avatar size="5rem"></b-avatar>
        <div class="my-2"><b>{{ receiver.Username }}</b></div>
    </div>
    <div class="mt-3">
        <div :class="'d-flex p-3 rounded align-items-center ' + $style.menu_entry">
            <b-icon icon="person-dash-fill" class="mr-3"/>
            Unfriend
        </div>
        <div :class="'d-flex p-3 rounded align-items-center ' + $style.menu_entry">
            <b-icon icon="dash-circle-fill" class="mr-3"/>
            Block
        </div>
    </div>
</div>
</template>

<script lang="ts">
import axios from "axios"
import { Component, Prop, Vue } from 'vue-property-decorator';
import User from '@/models/User'

@Component({
    name: "ReceiverPanel"
})
export default class ReceiverPanel extends Vue {
    @Prop({required: true}) receiver: User = new User()
}
</script>

<style module>
</style>