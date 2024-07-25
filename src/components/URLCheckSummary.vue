<template>
  <div v-if="crawlErrors && crawlErrors.length > 0">
    <v-data-table :items="crawlErrors"> </v-data-table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'URLCheckSummary',
  props: {
    crawlErrors: {
      type: Array as () => { url: string; error: string }[] | undefined,
      required: true
    }
  }
})
</script>
