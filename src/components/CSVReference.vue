<template>
  <v-expansion-panels class="panels mb-5" id="panels" color="primary--text" v-model="activePanel">
    <v-expansion-panel title="CSV Formatting Reference" value="1">
      <v-expansion-panel-text class="expansion-panel">
        <v-card-text class="markdown-card-text text-center pa-0 ma-0">
          <br />
          <i class="pa-12"
            >Ensure your identifiers are well-documented and all info is up-to-date to so that
            Geoconnex administrators can follow up with you if there are any issues.</i
          >
          <br />
          <br />
          <p class="text-center mb-4">The 4 columns required in your CSV mapping should be:</p>

          <div class="d-flex mx-4 px-4">
            <p>
              <b><code>id </code></b> <br />
              <i
                >The ID within geoconnex that your data should map to. These are unique, will
                redirect to the associated target, and are meant for individual monitoring
                locations.
              </i>
            </p>
            <p>
              <b><code>target </code></b> <br />
              <i>The URL pointing to a JSON-LD landing page for a single feature in your data.</i>
            </p>
            <p>
              <b><code>creator </code></b> <br />
              <i>A contact email for someone associated with the data</i>
            </p>
            <p>
              <b><code>description </code></b> <br />
              <i>A description of your data.</i>
            </p>
          </div>

          <br />
          For more detailed info regarding the format of your CSV and examples, see the
          <a href="https://docs.geoconnex.us/reference/data-formats/csv-submissions/">
            CSV formatting documentation</a
          >
        </v-card-text>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CSVReference',

  data() {
    return {
      // auto open the first panel
      activePanel: '1'
    }
  }
})
</script>

<style scoped>
.expansion-panel {
  background-color: rgb(var(--v-theme-secondary));
}

#panels {
  background-color: rgb(var(--v-theme-secondary));
}
</style>
