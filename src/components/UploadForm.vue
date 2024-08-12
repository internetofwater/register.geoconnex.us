<script setup lang="ts">
import URLCheckSummary from '@/components/URLCheckSummary.vue'
import ReadmeGenerator from '@/components/ReadmeGenerator.vue'
import CSVReference from '@/components/CSVReference.vue'
import GeoconnexBackground from '@/components/GeoconnexBackground.vue'
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center">
      <v-col cols="12" sm="8">
        <v-stepper
          :items="[
            'Step 1: Review Background',
            'Step 2: Add CSV',
            'Step 3: Add Metadata',
            'Step 4: Submit'
          ]"
          :hide-actions="hideNext"
        >
          <template v-slot:item.1>
            <GeoconnexBackground />
          </template>

          <template v-slot:item.2>
            <v-col cols="12" class="text-center">
              <h2 class="text-center">Upload your CSV Mapping</h2>

              <CSVReference class="mt-4" />

              <p class="text-center mx-15 pa-4 font-italic">
                A namespace is a short name or alias for your organization. It will be created upon
                submission if it does not already exist. If the namespace already exists, your new
                CSV file will be added to the existing namespace
              </p>

              <v-row class="ma-4">
                <v-text-field
                  v-model="namespace"
                  label="Namespace"
                  hint="Example: usgs"
                  persistent-hint
                  variant="outlined"
                  required
                ></v-text-field>

                <v-file-input
                  v-model="file"
                  label="CSV Mapping"
                  accept=".csv"
                  required
                  show-size
                  variant="outlined"
                  @change="checkValid"
                />
              </v-row>

              <URLCheckSummary :crawlErrors="crawlErrors" class="mt-4"></URLCheckSummary>

              <v-btn
                v-if="error.type === 'Issues Checking CSV'"
                @click="overrideError"
                class="mt-6"
              >
                Ignore warning and override
              </v-btn>
            </v-col>
          </template>

          <template v-slot:item.3>
            <ReadmeGenerator :namespace="namespace" @result="setReadme" />

            <v-col cols="12" class="text-center">
              <div class="justify-center" v-if="progress.running">
                <v-progress-circular indeterminate color="primary"> </v-progress-circular>
                <br />
                <br />
                <p>{{ progress.action }}</p>
              </div>
            </v-col>
          </template>

          <template v-slot:item.4>
            <h2 class="text-center">Upload your CSV Mapping</h2>

            <v-fade-transition class="mt-4">
              <v-alert
                :color="error.level || 'error'"
                :icon="`$${error.level || 'error'}`"
                :title="error.type"
                :text="error.text"
                v-if="error.type && !progress.running"
              >
              </v-alert>
              <v-alert
                color="success"
                icon="$success"
                title="Data Links Submitted"
                :text="result"
                v-if="error.type == null && result && !progress.running"
              ></v-alert>
            </v-fade-transition>

            <v-col cols="12" class="text-center" v-if="!hideSubmission">
              <v-btn type="submit" color="#00A087" @click="submitForm"> Submit </v-btn>
            </v-col>
          </template>
        </v-stepper>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { submitData } from '@/lib/upload'
import { defineComponent } from 'vue'
import { validGeoconnexCSV } from '@/lib/helpers'
import type { ValidationReport } from '@/lib/types'

interface FormError {
  type: 'Issues Checking CSV' | 'Error submitting data' | 'Checked CSV without errors' | null
  text: string
  level?: 'error' | 'warning' | 'info'
}

export default defineComponent({
  data() {
    return {
      namespace: '',
      file: null as File | null,
      readme: null as File | null,
      error: {} as FormError,
      result: '',
      progress: { running: false, action: '' },
      crawlErrors: [] as ValidationReport['crawlErrors'],
      hideSubmission: false
    }
  },
  computed: {
    hideNext() {
      return this.error.type === 'Issues Checking CSV' || this.progress.running
    }
  },
  methods: {
    async checkValid() {
      this.error = { type: null, text: '' }
      this.crawlErrors = []

      if (!this.file) {
        return
      }
      this.hideSubmission = true

      this.progress = {
        running: true,
        action: 'Validating your CSV data. This may take a minute...'
      }
      const { valid, errorSummary, crawlErrors } = await validGeoconnexCSV(this.file)

      if (!valid) {
        if (this.crawlErrors !== undefined) {
          this.crawlErrors = crawlErrors as { url: string; error: string }[]
          this.progress = { running: false, action: '' }
          this.error = {
            type: 'Issues Checking CSV',
            text: errorSummary as string,
            level: 'warning'
          }
          return
        }
      } else {
        this.error = {
          type: 'Checked CSV without errors',
          text: 'Note: automated tests do not check regex URLs. If you have these, please validate any complex logic independently.',
          level: 'info'
        }
        this.progress = { running: false, action: '' }
        this.hideSubmission = false
      }
    },
    overrideError() {
      this.hideSubmission = false
      this.error = { type: null, text: '' }
      this.crawlErrors = []
    },
    setReadme(readme: File | null) {
      this.readme = readme
    },

    async submitForm() {
      // Reset form state before submitting
      this.error = { type: null, text: '' }
      this.result = ''
      this.progress = { running: false, action: '' }

      if (!this.namespace) {
        this.error = { type: 'Error submitting data', text: 'Namespace is required' }
        return
      }
      if (!this.file) {
        this.error = { type: 'Error submitting data', text: 'File is required' }
        return
      }

      try {
        this.progress = { running: true, action: 'Uploading your data to the Geoconnex registry.' }
        const result = await submitData(this.namespace, this.file, this.readme || undefined)
        this.result = result
      } catch (error) {
        this.error = {
          type: 'Error submitting data',
          text: error instanceof Error ? error.message : String(error)
        }
        this.result = ''
      }

      this.progress = { running: false, action: '' }
    }
  }
})
</script>

<style scoped>
.form-container {
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 80px rgba(0, 0, 0, 0.1);
  width: 80%;
  margin: 0 auto;
}

h2 {
  color: #1b335f;
}

.expansion-panel {
  background-color: #f4f4f9;
}
</style>
