<template>
<b-modal :title="title">
    
</b-modal>
</template>

<script>

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
        create(title, list, type) {
            this.title = title;
            this.listFriends = list;
            this.type = type;
        }
    }
}
</script>