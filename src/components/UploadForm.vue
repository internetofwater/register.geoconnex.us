<script setup lang="ts">
import URLCheckSummary from '@/components/URLCheckSummary.vue'
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center">
      <v-col cols="12" sm="8">
        <v-form id="uploadForm" @submit.prevent="submitForm" class="form-container">
          <v-container class="form-content">
            <v-row>
              <p class="text-center pa-4">
                The <a href="https://geoconnex.us">geoconnex.us</a> project provides technical
                infrastructure and guidance for creating an open, community-contribution model for a
                knowledge graph linking hydrologic features in the United States, published in
                accordance with Spatial Data on the Web best practices as an implementation of
                Internet of Water principles.
              </p>

              <p class="text-center pa-4">
                This tool allows users to create Geoconnex linkages to their own water data. Submit
                a CSV file to register persistent URL-formatted identifiers for your organization's
                monitoring locations within a 'namespace' <i>(short name for your organization)</i>.
                The features you link to must already exist online and have their own web page.
              </p>
              <v-alert
                color="info"
                class="mb-2"
                icon="$info"
                variant="tonal"
                title="Additional details "
              >
                For more details, the
                <a href="https://docs.geoconnex.us/">geoconnex documentation</a> provides a general
                overview of geoconnex and a tutorial for how to:
                <ol>
                  <li>
                    1.
                    <a href="https://docs.geoconnex.us/contributing/step-1/idscheme">
                      Prepare your data</a
                    >
                    with the proper metadata context
                  </li>
                  <li>
                    2. Host your data, if you have not done so already, with
                    <a href="https://docs.geoconnex.us/contributing/step-2/"
                      >individual web pages</a
                    >
                    that can be linked to as the "target" column in your uploaded CSV
                  </li>
                  <li>
                    3.<a href="https://docs.geoconnex.us/contributing/step-3/minting">
                      Submit your CSV data</a
                    >, either here or Github, after checking it is
                    <a href="https://docs.geoconnex.us/reference/data-formats/csv-submissions/">
                      properly formatted</a
                    >
                  </li>
                </ol>
              </v-alert>
              <v-col cols="12">
                <v-expansion-panels class="contribution-button mb-5" v-model="activePanel">
                  <v-expansion-panel title="CSV Formatting Reference" bg-color="#f4f4f9" value="1">
                    <v-expansion-panel-text class="expansion-panel text-1b335f">
                      <v-card-text class="markdown-card-text text-center pa-0 ma-0">
                        <v-row>
                          <i class="pa-4"
                            >Ensure your identifiers are well-documented and all info is up-to-date
                            to so that Geoconnex administrators can follow up with you if there are
                            any issues.</i
                          >
                        </v-row>
                        <br />
                        The 4 columns required in your CSV mapping should be:
                        <div class="d-flex space-between mt-3">
                          <p>
                            <b><code>id </code></b> <br />
                            <i>(The ID within geoconnex that your data should map to.)</i>
                          </p>
                          <p>
                            <b><code>target </code></b> <br />
                            <i>(The URL to your data.)</i>
                          </p>
                          <p>
                            <b><code>creator </code></b> <br />
                            <i>(A contact email for someone associated with the data)</i>
                          </p>
                          <p>
                            <b><code>description </code></b> <br />
                            <i>(A description of your data.)</i>
                          </p>
                        </div>

                        <br />
                        <v-btn
                          class="flex ma-2"
                          target="_blank"
                          variant="test"
                          append-icon="mdi-open-in-new"
                          href="https://github.com/internetofwater/geoconnex.us/blob/master/namespaces/iow/demo.csv"
                          >1:1 example</v-btn
                        >
                        <v-btn
                          target="_blank"
                          variant="text"
                          append-icon="mdi-open-in-new"
                          href="https://github.com/internetofwater/geoconnex.us/blob/master/namespaces/usgs/monitoring-location/monitoring-location.csv"
                          >1:N example</v-btn
                        >
                        <br />
                        For more detailed info regarding the format of your CSV, see the
                        <a href="https://docs.geoconnex.us/reference/data-formats/csv-submissions/">
                          CSV formatting documentation</a
                        >
                      </v-card-text>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
                <!-- <v-col cols="12">
                <v-file-input v-model="readme" label="Readme for Namespace" accept=".md" outlined>
                </v-file-input> 
              </v-col> -->
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="namespace"
                  label="Namespace"
                  hint="Example: usgs"
                  variant="outlined"
                  required
                ></v-text-field> </v-col
              ><v-col cols="12" md="8">
                <v-file-input
                  v-model="file"
                  label="CSV Mapping"
                  accept=".csv"
                  required
                  show-size
                  variant="outlined"
                  @change="checkValid"
                />
              </v-col>
              <v-col cols="12">
                <v-checkbox
                  label="I already have a readme file uploaded to my namespace and do not wish to update my contribution info"
                  v-model="readmeAlreadyUploaded"
                >
                </v-checkbox>

                <div v-if="!readmeAlreadyUploaded">
                  <div>
                    <v-card-text class="text-center">
                      <v-row class="d-flex justify-center">
                        <h2>Contribution Information</h2>
                        <!-- <v-icon icon="mdi-information" class="ml-3" color="#1B335F" :onclick="toggleHelp"></v-icon> -->
                      </v-row>
                    </v-card-text>
                  </div>
                  <v-text-field
                    v-model="homepage"
                    label="Homepage for where redirects will point to"
                    type="url"
                    required
                    variant="outlined"
                    hint="Example: https://waterdata.usgs.gov"
                    persistent-hint
                    class="pb-4"
                  ></v-text-field>

                  <v-textarea
                    v-model="description"
                    label="Description of data"
                    required
                    variant="outlined"
                    hint="Example: All monitoring locations used by the USGS Waterdata system"
                    persistent-hint
                    class="pb-4"
                  ></v-textarea>

                  <v-text-field
                    v-model="example_pid"
                    label="Example PID"
                    required
                    variant="outlined"
                    hint="Example: https://geoconnex.us/usgs/monitoring-location/08383500"
                    persistent-hint
                    class="pb-4"
                  ></v-text-field>

                  <v-text-field
                    v-model="example_redirect_target"
                    label="Example redirect target url"
                    type="url"
                    variant="outlined"
                    hint="Example: https://waterdata.usgs.gov/monitoring-location/08383500"
                    persistent-hint
                    class="pb-4"
                  ></v-text-field>

                  <v-text-field
                    v-model="contact_name"
                    label="Contact name"
                    hint="Example: John Smith"
                    required
                    variant="outlined"
                    class="pb-4"
                  ></v-text-field>

                  <v-text-field
                    v-model="contact_email"
                    label="Contact email"
                    append-inner-icon="mdi-email"
                    required
                    variant="outlined"
                    type="email"
                    hint="Example: user@usgs.gov"
                  ></v-text-field>
                </div>
              </v-col>
            </v-row>
          </v-container>
          <v-fade-transition>
            <v-alert
              :color="error.level || 'error'"
              :icon="`$${error.level || 'error'}`"
              :title="error.type"
              :text="error.text"
              v-if="error.type && !progress.running"
            >
            </v-alert>
          </v-fade-transition>
          <v-fade-transition>
            <v-alert
              color="success"
              icon="$success"
              title="Data Links Submitted"
              :text="result"
              v-if="error.type == null && result && !progress.running"
            ></v-alert>
          </v-fade-transition>
          <v-col cols="12" class="text-center" v-if="!hideSubmission">
            <v-btn type="submit" color="#00A087"> Submit </v-btn>
          </v-col>
          <v-col cols="12" class="text-center">
            <div class="justify-center" v-if="progress.running">
              <v-progress-circular indeterminate color="primary"> </v-progress-circular>
              <br />
              <br />
              <p>{{ progress.action }}</p>
            </div>
          </v-col>
          <v-col cols="12" class="text-center">
            <v-btn v-if="error.type === 'Issues Checking CSV'" @click="overrideError">
              Ignore warning and override
            </v-btn>
            <URLCheckSummary :crawlErrors="crawlErrors" class="mt-4"></URLCheckSummary>
          </v-col>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { submitData } from '@/lib/upload'
import { generateReadMe } from '@/lib/helpers'
import { type MarkdownSection, type ValidationReport } from '@/lib/types'
import { defineComponent } from 'vue'
import { validGeoconnexCSV } from '@/lib/helpers'

interface FormError {
  type: 'Issues Checking CSV' | 'Error Submitting PR' | 'Checked CSV without errors' | null
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
      homepage: '',
      description: '',
      example_pid: '',
      example_redirect_target: '',
      contact_name: '',
      contact_email: '',
      readmeAlreadyUploaded: false,
      progress: { running: false, action: '' },
      crawlErrors: [] as ValidationReport['crawlErrors'],
      hideSubmission: false,
      activePanel: '1'
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
      }
      this.error = {
        type: 'Checked CSV without errors',
        text: 'Note: automated tests do not check regex URLs. Please validate any complex logic individually.',
        level: 'info'
      }
      this.progress = { running: false, action: '' }
      this.hideSubmission = false
    },
    overrideError() {
      this.hideSubmission = false
      this.error = { type: null, text: '' }
      this.crawlErrors = []
    },
    async submitForm() {
      // Reset form state before submitting
      this.error = { type: null, text: '' }
      this.result = ''
      this.progress = { running: false, action: '' }

      if (!this.namespace) {
        this.error = { type: 'Error Submitting PR', text: 'Namespace is required' }
        return
      }
      if (!this.file) {
        this.error = { type: 'Error Submitting PR', text: 'File is required' }
        return
      }

      // Make sure all markdown fields are filled
      if (!this.readmeAlreadyUploaded) {
        const requiredReadmeFields: MarkdownSection[] = [
          { body: this.homepage, sectionName: 'Homepage' },
          { body: this.description, sectionName: 'Description' },
          { body: this.example_pid, sectionName: 'Example PID' },
          { body: this.example_redirect_target, sectionName: 'Example redirect target URL' },
          { body: this.contact_name, sectionName: 'Contact name' },
          { body: this.contact_email, sectionName: 'Contact email' }
        ]

        for (const field of requiredReadmeFields) {
          if (!field.body) {
            this.error = { type: 'Error Submitting PR', text: `${field.sectionName} is required` }
            return
          }
        }

        const generatedReadme = generateReadMe(this.namespace, requiredReadmeFields)
        this.readme = new File([generatedReadme], 'README.md', { type: 'text/plain' })
      }

      // submit PR to Geoconnex Github repo
      try {
        this.progress = { running: true, action: 'Uploading your data to the Geoconnex registry.' }
        const result = await submitData(this.namespace, this.file, this.readme || undefined)
        this.result = result
      } catch (error) {
        this.error = {
          type: 'Error Submitting PR',
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
