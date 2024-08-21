<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import URLCheckSummary from '@/components/URLCheckSummary.vue'
import CSVReference from '@/components/CSVReference.vue'
import GeoconnexBackground from '@/components/GeoconnexBackground.vue'
import MetadataGenerator from '@/components/MetadataGenerator.vue'
import { useFormStore } from '@/stores/formStore'
import { validGeoconnexCSV } from '@/lib/helpers'
import { submitData } from '@/lib/upload'
import type { ValidationReport } from '@/lib/types'

const state = useFormStore()

const checkResult = reactive({
  type: undefined as
    | 'Issues checking CSV'
    | 'Error submitting data'
    | 'Checked CSV without errors'
    | 'No errors checking CSV'
    | undefined,
  description: '',
  level: undefined as 'error' | 'warning' | 'info' | 'success' | undefined
})

const result = ref('')
const progress = reactive({ running: false, action: '' })
const crawlErrors = ref<ValidationReport['crawlErrors']>([])

watch([progress, checkResult], (newVal) => {
  state.blockNext = newVal[0].running === true || newVal[1].type === 'Issues checking CSV'
})

async function checkCSV() {
  progress.running = true
  progress.action = 'Validating your CSV data. This may take a minute...'

  if (!state.csv) {
    checkResult.type = 'Issues checking CSV'
    checkResult.description = 'CSV file is required'
    checkResult.level = 'warning'
    progress.running = false
    progress.action = ''
    return false
  }

  const { valid, errorSummary, crawlErrors: errors } = await validGeoconnexCSV(state.csv)
  crawlErrors.value = errors

  if (!valid) {
    checkResult.type = 'Issues checking CSV'
    checkResult.description = errorSummary
    checkResult.level = 'warning'
    progress.running = false
    progress.action = ''
    return false
  } else {
    checkResult.type = 'Checked CSV without errors'
    checkResult.description =
      'Note: automated tests do not check regex URLs. If you have these, please validate any complex logic independently.'
    checkResult.level = 'info'
    progress.running = false
    progress.action = ''
    return true
  }
}

function overrideError() {
  checkResult.type = undefined
  checkResult.description = ''
  checkResult.level = undefined
  crawlErrors.value = []
  progress.running = false
}

async function submitForm() {
  result.value = ''
  progress.running = false
  progress.action = ''

  if (!state.csv) {
    checkResult.type = 'Error submitting data'
    checkResult.description = 'CSV file is required'
    checkResult.level = 'error'
    return
  }

  try {
    progress.running = true
    progress.action = 'Uploading your data to the Geoconnex registry.'
    const submissionResult = await submitData(state.namespace, state.csv, state.readme)
    result.value = submissionResult
  } catch (error) {
    checkResult.type = 'Error submitting data'
    checkResult.description = error instanceof Error ? error.message : String(error)
    checkResult.level = 'error'
    result.value = ''
  } finally {
    progress.running = false
    progress.action = ''
  }
}
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
          :hide-actions="state.blockNext"
          color="header"
        >
          <template v-slot:item.1>
            <GeoconnexBackground />
          </template>

          <template v-slot:item.2>
            <h2 class="mb-4 text-center">Add Metadata for your CSV Contribution</h2>
            <MetadataGenerator />
          </template>

          <template v-slot:item.3>
            <h2 class="text-center">Upload your CSV Mapping</h2>

            <p class="pa-4 text-center mx-auto w-66">
              Geoconnex will use your CSV to associate your data resources to unique Geoconnex ids.
              It will also use the target URL you supply to access each feature for the purpose of
              constructing the Geoconnex knowledge graph.
            </p>

            <v-file-input
              v-model="state.csv"
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
                :color="checkResult.level || 'error'"
                :icon="`$${checkResult.level || 'error'}`"
                :title="checkResult.type"
                :text="checkResult.description"
                v-if="checkResult.type && !progress.running"
              >
              </v-alert>
              <v-alert
                color="success"
                icon="$success"
                title="Data mapping submitted"
                :text="result"
                v-if="checkResult.type == null && result && !progress.running"
              ></v-alert>
            </v-fade-transition>

            <v-btn
              v-if="checkResult.type === 'Issues checking CSV' && !progress.running"
              @click="overrideError"
              class="my-6 d-flex mx-auto ignoreButton"
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
                :color="checkResult.level || 'error'"
                :icon="`$${checkResult.level || 'error'}`"
                :title="checkResult.type"
                :text="checkResult.description"
                v-if="
                  checkResult.type != 'Checked CSV without errors' &&
                  checkResult.type &&
                  !progress.running
                "
              >
              </v-alert>
              <v-alert
                color="success"
                icon="$success"
                title="Data Submitted"
                :text="result"
                v-if="checkResult.type == null && result && !progress.running"
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

<style scoped>
.ignoreButton {
  background-color: rgb(var(--v-theme-secondary));
}
</style>
