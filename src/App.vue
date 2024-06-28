<script setup lang="js">
import UploadForm from './components/UploadForm.vue';
import PageHeader from './components/PageHeader.vue';
import ContributionInfo from './components/ContributionInfo.vue';
import '@mdi/font/css/materialdesignicons.css'; 
import { Marked } from 'marked';
</script>

<template>
  <PageHeader />
  <h1>Upload to Geoconnex</h1>
  <UploadForm />
  <ContributionInfo />
</template>

<style scoped>

h1 {
  text-align: center;
  color:  #1B335F;
}
</style>
