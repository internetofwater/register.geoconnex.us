<!-- eslint-disable vue/valid-v-slot -->
<script setup lang="ts">
import URLCheckSummary from '@/components/URLCheckSummary.vue'
import CSVReference from '@/components/CSVReference.vue'
import GeoconnexBackground from '@/components/GeoconnexBackground.vue'
import MetadataGenerator from '@/components/MetadataGenerator.vue'

</script>

<template>
  <v-container class="fill-width w-66 d-flex align-center justify-center" fluid>
    <v-row class="justify-center align-center fill-height">
      <v-col cols="12">
        <v-stepper :items="[
          'Step 1: Review Background',
          'Step 2: Add CSV',
          'Step 3: Add Metadata',
          'Step 4: Submit'
        ]" :hide-actions="hideNext">
          <template v-slot:item.1>
            <GeoconnexBackground />
          </template>

          <template v-slot:item.2>
            <h2 class="text-center">Upload your CSV Mapping</h2>

            <CSVReference class="mt-4" />


            <v-file-input v-model="file" label="CSV Mapping" accept=".csv" required show-size variant="outlined"
              @change="checkValid" class="w-50 mx-auto" />

            <URLCheckSummary :crawlErrors="crawlErrors" :progress="progress" class="mt-4"></URLCheckSummary>


            <v-fade-transition class="mt-4">
              <v-alert :color="checkError.level || 'error'" :icon="`$${checkError.level || 'error'}`"
                :title="checkError.type" :text="checkError.text" v-if="checkError.type && !progress.running">
              </v-alert>
              <v-alert color="success" icon="$success" title="Data Links Submitted" :text="result"
                v-if="checkError.type == null && result && !progress.running"></v-alert>
            </v-fade-transition>


            <v-btn v-if="checkError.type === 'Issues Checking CSV'" @click="overrideError" class="mt-6 d-flex mx-auto">
              Ignore warning and override
            </v-btn>
          </template>

          <template v-slot:item.3>
            <h2 class="mb-4 text-center">Add Metadata for your CSV Contribution</h2>

            <MetadataGenerator :namespace="namespace" @result="setMetadata" />

          </template>

          <template v-slot:item.4>
            <h2 class="text-center">Upload your CSV Mapping</h2>

            <v-fade-transition class="mt-4">
              <v-alert :color="checkError.level || 'error'" :icon="`$${checkError.level || 'error'}`"
                :title="checkError.type" :text="checkError.text"
                v-if="checkError.type != 'Checked CSV without errors' && !progress.running">
              </v-alert>
              <v-alert color="success" icon="$success" title="Data Links Submitted" :text="result"
                v-if="checkError.type == null && result && !progress.running"></v-alert>
            </v-fade-transition>

            <v-col cols="12" class="text-center mt-8" v-if="!hideSubmission">
              <v-btn type="submit" @click="submitForm"> Submit </v-btn>
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

interface CheckError {
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
      checkError: {} as CheckError,
      result: '',
      progress: { running: false, action: '' },
      crawlErrors: [] as ValidationReport['crawlErrors'],
      hideSubmission: false,
      existingNamespaces: [] as string[],
    }
  },
  computed: {
    hideNext() {
      return this.checkError.type === 'Issues Checking CSV' || this.progress.running
    },
  },

  methods: {
    async checkValid() {
      this.checkError = { type: null, text: '' }
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
          this.checkError = {
            type: 'Issues Checking CSV',
            text: errorSummary as string,
            level: 'warning'
          }
          return
        }
      } else {
        this.checkError = {
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
      this.checkError = { type: null, text: '' }
      this.crawlErrors = []
    },
    setMetadata(metadata : { readme: File | null, namespace: string }) {
      const { readme, namespace } = metadata
      this.namespace = namespace
      this.readme = readme
    },

    async submitForm() {
      // Reset form state before submitting
      this.checkError = { type: null, text: '' }
      this.result = ''
      this.progress = { running: false, action: '' }

      if (!this.file) {
        this.checkError = { type: 'Error submitting data', text: 'File is required' }
        return
      }

      try {
        this.progress = { running: true, action: 'Uploading your data to the Geoconnex registry.' }
        const result = await submitData(this.namespace, this.file, this.readme || undefined)
        this.result = result
      } catch (error) {
        this.checkError = {
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
