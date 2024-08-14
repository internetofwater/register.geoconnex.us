<script setup lang="ts">
import UploadForm from './components/UploadForm.vue'
import PageHeader from './components/PageHeader.vue'
import PageFooter from './components/PageFooter.vue'
import '@mdi/font/css/materialdesignicons.css'
</script>

<template>
  <v-app class="pa-0 ma-0">
    <PageHeader />
    <h1 class="text-center mt-4">Register Persistent Identifiers for Geoconnex</h1>
    <UploadForm />
    <PageFooter />
  </v-app>
</template>

<style>
/* Default light mode background color */
body {
  margin: 0;
  padding: 0;
}

h1, h2 {
  color: #1b335f;
}

</style>
