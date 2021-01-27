<template>
<div class="p-3">
    <div class="d-flex flex-column align-items-center">
        <b-avatar size="5rem"></b-avatar>
        <div class="my-2"><b>{{ receiver.Username }}</b></div>
    </div>
</div>
</template>

<script>
import axios from "axios"

export default {
    name: "ReceiverPanel",
    props: {
        receiver: Object
    },
    data() {
        return {
            
        }
    },
    methods: {
        
    }
}
</script>

<style module>
</style>