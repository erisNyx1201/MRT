<template>
  <router-view />
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { useSeshStore } from "stores/sesh";

const seshStore = useSeshStore();

onMounted(() => {
  seshStore.initSocket();
});

onBeforeUnmount(() => {
  seshStore.disconnect();
})
</script>
