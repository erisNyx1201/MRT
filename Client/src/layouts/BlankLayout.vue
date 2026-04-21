<template>
    <q-layout view="1Hh Lpr 1Ff">
        <q-page-container class="q-pa-md">
            <router-view />
        </q-page-container>
    </q-layout>
</template>
<style scoped>
html,
body {
    background-color: transparent!important;
}

:global(.q-loading-bar) {
  display: none !important;
}
</style>
