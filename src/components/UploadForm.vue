<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-form id="uploadForm" @submit.prevent="submitForm" class="form-container">
          <v-container class="form-content">
            <v-row>
              <i class="text-center pa-4"
                >Submit a csv file that will register persistent URL-formatted identifiers for your
                organization's monitoring locations within a "namespace" (short name for your
                organization).
              </i>
              <i class="text-center pa-4"
                >Ensure your identifiers are well-documented and all info is up-to-date to so that
                Geoconnex administrators can follow up with you if there are any issues.</i
              >
              <v-col cols="12">
                <v-text-field
                  v-model="namespace"
                  label="Namespace"
                  hint="Example: usgs"
                  required
                ></v-text-field>
                <v-expansion-panels class="contribution-button mb-5">
                  <v-expansion-panel title="CSV templates and formatting info" bg-color="#f4f4f9">
                    <v-expansion-panel-text class="expansion-panel text-1b335f">
                      <v-card-text class="markdown-card-text text-center pa-0 ma-0">
                        The 4 columns in your CSV should be: <br />
                        <code>id target creator description</code>
                        <br />
                        <v-btn
                          density="compact"
                          class="flex ma-2"
                          target="_blank"
                          href="https://github.com/internetofwater/geoconnex.us/blob/master/namespaces/usgs/monitoring-location/monitoring-location.csv"
                          >View a 1:1 example</v-btn
                        >
                        <v-btn
                          density="compact"
                          target="_blank"
                          href="https://github.com/internetofwater/geoconnex.us/blob/master/namespaces/SELFIE/SELFIE_ids.csv"
                          >View a 1:N example</v-btn
                        >
                        <br />
                        For more detailed info, see the contribution documentation at the bottom of
                        the page
                      </v-card-text>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>

                <v-file-input
                  v-model="file"
                  label="CSV Mapping"
                  accept=".csv"
                  required
                  show-size
                  outlined
                >
                </v-file-input>
                <!-- <v-col cols="12">
                <v-file-input v-model="readme" label="Readme for Namespace" accept=".md" outlined>
                </v-file-input> 
              </v-col> -->
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
                    hint="Example: https://waterdata.usgs.gov"
                    persistent-hint
                    class="pb-4"
                  ></v-text-field>

                  <v-textarea
                    v-model="description"
                    label="Description of data"
                    required
                    hint="Example: All monitoring locations used by the USGS Waterdata system"
                    persistent-hint
                    class="pb-4"
                  ></v-textarea>

                  <v-text-field
                    v-model="example_pid"
                    label="Example PID"
                    required
                    hint="Example: https://geoconnex.us/usgs/monitoring-location/08383500"
                    persistent-hint
                    class="pb-4"
                  ></v-text-field>

                  <v-text-field
                    v-model="example_redirect_target"
                    label="Example redirect target url"
                    type="url"
                    hint="Example: https://waterdata.usgs.gov/monitoring-location/08383500"
                    persistent-hint
                    class="pb-4"
                  ></v-text-field>

                  <v-text-field
                    v-model="contact_name"
                    label="Contact name"
                    hint="Example: John Smith"
                    required
                    class="pb-4"
                  ></v-text-field>

                  <v-text-field
                    v-model="contact_email"
                    label="Contact email"
                    append-inner-icon="mdi-email"
                    required
                    type="email"
                    hint="Example: user@usgs.gov"
                  ></v-text-field>
                </div>
              </v-col>

              <v-col cols="12" class="text-center">
                <v-btn type="submit" color="#1B335F"> Upload and Create Pull Request </v-btn>
                <div class="justify-center py-5">
                  <v-progress-circular
                    v-if="inProgress"
                    indeterminate
                    color="primary"
                  ></v-progress-circular>
                </div>
              </v-col>
            </v-row>
          </v-container>
          <v-fade-transition>
            <v-alert
              color="error"
              icon="$error"
              title="Error submitting PR"
              :text="error"
              v-if="error && !inProgress"
            ></v-alert>
          </v-fade-transition>
          <v-fade-transition>
            <v-alert
              color="success"
              icon="$success"
              title="PR Submitted"
              :text="result"
              v-if="!error && result && !inProgress"
            ></v-alert>
          </v-fade-transition>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">

import { ref } from 'vue';

import { submitData } from '@/lib/upload'
import { generateReadMe, type MarkdownSection } from '@/lib/helpers'
import { defineComponent } from 'vue'
import { validGeoconnexCSV } from '@/lib/helpers';

export default defineComponent({

  data() {
    return {
      namespace: '',
      file: null as File | null,
      readme: null as File | null,
      error: '',
      result: '',
      homepage: '',
      description: '',
      example_pid: '',
      example_redirect_target: '',
      contact_name: '',
      contact_email: '',
      readmeAlreadyUploaded: false,
      inProgress: false
    }
  },
  methods: {
    async submitForm() {
      // Reset form state before submitting
      this.error = ''
      this.result = ''
      this.inProgress = false

      if (!this.namespace) {
        this.error = 'Namespace is required'
        return
      }
      if (!this.file) {
        this.error = 'File is required'
        return
      }

      const [isValid, errMsg] = validGeoconnexCSV(this.file)
      
      if (!isValid) {
        this.error = errMsg
        return
      }

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
            this.error = `${field.sectionName} is required`
            return
          }
        }

        const generatedReadme = generateReadMe(this.namespace, requiredReadmeFields)
        this.readme = new File([generatedReadme], 'README.md', { type: 'text/plain' })
      }

      try {
        this.inProgress = true
        const result = await submitData(this.namespace, this.file, this.readme || undefined)
        this.result = result
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error)
        this.result = ''
      }

      this.inProgress = false
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
  max-width: 600px;
  margin: 0 auto;
}

h2 {
  color: #1b335f;
}

.expansion-panel {
  background-color: #f4f4f9;
}
</style>
