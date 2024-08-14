<template>
  <div v-if="crawlErrors && crawlErrors.length > 0 && !progress.running">
    <v-data-table :items="crawlErrors"> </v-data-table>
  </div>

  <v-col cols="12" class="text-center">
    <div class="justify-center" v-if="progress.running">
      <v-progress-circular indeterminate color="primary"> </v-progress-circular>
      <br />
      <br />
      <p>{{ progress.action }}</p>
    </div>
  </v-col>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

interface Progress {
  running: boolean
  action: string
}

export default defineComponent({
  name: 'URLCheckSummary',
  props: {
    crawlErrors: {
      type: Array as () => { url: string; error: string }[] | undefined,
      required: true
    },
    progress: {
      type: Object as () => Progress,
      required: true
    }
  }
})
</script>
