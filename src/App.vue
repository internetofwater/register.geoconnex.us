<script setup lang="ts">
import UploadForm from './components/UploadForm.vue'
import PageHeader from './components/PageHeader.vue'
import PageFooter from './components/PageFooter.vue'
import ContributionInfo from './components/ContributionInfo.vue'
import '@mdi/font/css/materialdesignicons.css'
</script>

<template>
  <PageHeader />
  <h1>Register Persistant Identifiers for Geoconnex</h1>
  <UploadForm />
  <ContributionInfo />
  <PageFooter />
</template>

<style scoped>
h1 {
  text-align: center;
  color: #1b335f;
}
</style>
