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
        <v-stepper
          :items="[
            'Step 1: Review Background',
            'Step 2: Add Metadata',
            'Step 3: Add CSV',
            'Step 4: Submit'
          ]"
          :hide-actions="hideNext"
          color="header"
        >
          <template v-slot:item.1>
            <GeoconnexBackground />
          </template>

          <template v-slot:item.2>
            <h2 class="mb-4 text-center">Add Metadata for your CSV Contribution</h2>

            <MetadataGenerator :namespace="namespace" @result="setMetadata" />
          </template>

          <template v-slot:item.3>
            <h2 class="text-center">Upload your CSV Mapping</h2>

            <p class="pa-4 text-center mx-auto w-66">
              Geoconnex will use your CSV to associate your data resources to unique Geoconnex ids.
              It will also use the target URL you supply to access each feature for the purpose of
              constructing the Geoconnex knowledge graph.
            </p>

            <v-file-input
              v-model="csv"
              label="CSV Mapping"
              accept=".csv"
              required
              show-size
              variant="outlined"
              @change="checkCSV"
              class="w-50 mx-auto"
            />

            <CSVReference class="mt-4" />

            <URLCheckSummary
              :crawlErrors="crawlErrors"
              :progress="progress"
              class="mt-4"
            ></URLCheckSummary>

            <v-fade-transition class="mx-auto w-66">
              <v-alert
                :color="checkError.level || 'error'"
                :icon="`$${checkError.level || 'error'}`"
                :title="checkError.type"
                :text="checkError.text"
                v-if="checkError.type && !progress.running"
              >
              </v-alert>
              <v-alert
                color="success"
                icon="$success"
                title="Data mapping submitted"
                :text="result"
                v-if="checkError.type == null && result && !progress.running"
              ></v-alert>
            </v-fade-transition>

            <v-btn
              v-if="checkError.type === 'Issues Checking CSV' && !progress.running"
              @click="overrideError"
              class="mt-6 d-flex mx-auto ignoreButton"
            >
              Ignore warning and override
            </v-btn>
          </template>

          <template v-slot:item.4>
            <h2 class="text-center">Submit your Data Mapping</h2>
            <p class="text-center mx-auto w-66 pa-4">
              Your data will be submitted to the
              <a href="https://github.com/internetofwater/geoconnex.us" target="_blank"
                >Geoconnex URI registry</a
              >
              on GitHub. Once submitted, you will be able to view the request to add your data to
              Geoconnex.
            </p>

            <v-col cols="12" class="text-center">
              <div class="justify-center" v-if="progress.running">
                <v-progress-circular indeterminate color="primary"> </v-progress-circular>
                <br />
                <br />
                <p>{{ progress.action }}</p>
              </div>
            </v-col>

            <v-fade-transition class="mt-4 mx-auto w-66">
              <v-alert
                :color="checkError.level || 'error'"
                :icon="`$${checkError.level || 'error'}`"
                :title="checkError.type"
                :text="checkError.text"
                v-if="
                  checkError.type != 'Checked CSV without errors' &&
                  checkError.type &&
                  !progress.running
                "
              >
              </v-alert>
              <v-alert
                color="success"
                icon="$success"
                title="Data Submitted"
                :text="result"
                v-if="checkError.type == null && result && !progress.running"
              ></v-alert>
            </v-fade-transition>

            <v-col cols="12" class="text-center mt-8">
              <v-btn type="submit" @click="submitForm" class="bg-accent"> Submit </v-btn>
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
  type: 'Issues Checking CSV' | 'Error submitting data' | 'Checked CSV without errors' | undefined
  text: string
  level?: 'error' | 'warning' | 'info'
}

export default defineComponent({
  data() {
    return {
      namespace: '',
      csv: null as File | null,
      readme: null as File | null,
      checkError: {} as CheckError,
      result: '',
      progress: { running: false, action: '' },
      crawlErrors: [] as ValidationReport['crawlErrors'],
      existingNamespaces: [] as string[],
      blockNext: false
    }
  },
  computed: {
    hideNext() {
      return (
        this.checkError.type === 'Issues Checking CSV' || this.progress.running || this.blockNext
      )
    }
  },

  methods: {
    async checkCSV() {
      this.progress = {
        running: true,
        action: 'Validating your CSV data. This may take a minute...'
      }

      if (!this.csv) {
        return
      }
      const { valid, errorSummary, crawlErrors } = await validGeoconnexCSV(this.csv)
      this.crawlErrors = crawlErrors

      if (!valid) {
        if (this.crawlErrors !== undefined) {
          this.progress = { running: false, action: '' }
          this.checkError = {
            type: 'Issues Checking CSV',
            text: errorSummary as string,
            level: 'warning'
          }
          return false
        }
      } else {
        this.checkError = {
          type: 'Checked CSV without errors',
          text: 'Note: automated tests do not check regex URLs. If you have these, please validate any complex logic independently.',
          level: 'info'
        }
        this.progress = { running: false, action: '' }
        return true
      }
    },

    async valid() {
      if (!this.csv) {
        return false
      }

      this.progress = {
        running: true,
        action: 'Validating your CSV data. This may take a minute...'
      }
    },
    overrideError() {
      this.checkError = { type: undefined, text: '' }
      this.crawlErrors = []
    },
    setMetadata(metadata: { readme: File | null; namespace: string; blockNext?: boolean }) {
      const { readme, namespace, blockNext } = metadata
      this.namespace = namespace
      this.readme = readme
      this.blockNext = blockNext || false
    },

    async submitForm() {
      // reset stored form state at the start of the submission before validating
      this.result = ''
      this.progress = { running: false, action: '' }

      if (!this.csv) {
        this.checkError = { type: 'Error submitting data', text: 'CSV file is required' }
        return
      }

      try {
        this.progress = { running: true, action: 'Uploading your data to the Geoconnex registry.' }
        const result = await submitData(this.namespace, this.csv, this.readme || undefined)
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

<style scoped>
.ignoreButton {
  background-color: rgb(var(--v-theme-secondary));
}
</style>
