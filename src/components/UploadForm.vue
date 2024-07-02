<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-form id="uploadForm" @submit.prevent="submitForm" class="form-container">
          <v-container class="form-content">
            <v-row>
              <v-col cols="12">
                
                
                <v-text-field v-model="namespace" label="Namespace" required></v-text-field>
              </v-col>
              <v-col cols="12">
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
                <v-checkbox label="I already have a readme uploaded to this namespace and don't want to update it"
                  v-model="readmeAlreadyUploaded">
                </v-checkbox>

                <div v-if="!readmeAlreadyUploaded">

                  <v-text-field v-model="homepage" label="Homepage for where redirects will point to"
                    type="url"></v-text-field>

                  <v-textarea v-model="description" label="Description of data" required></v-textarea>


                  <v-textarea v-model="example_pid" label="Example PID" required></v-textarea>


                  <v-textarea v-model="example_redirect_target" label="Example redirect target url"
                    type="url"></v-textarea>


                  <v-text-field v-model="contact_name" label="Contact name" required></v-text-field>


                  <v-text-field v-model="contact_email" label="Contact email" required type="email"></v-text-field>


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
              v-if="!error && result !== '' && !inProgress"
            ></v-alert>
          </v-fade-transition>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { submitData } from '@/lib/upload'
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      namespace: '',
      file: null,
      readme: null,
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
      this.error = '';
      this.result = '';

      if (!this.namespace) {
        this.error = 'Namespace is required';
        return;
      }
      if (!this.file) {
        this.error = 'File is required'
        return
      }

      if (!this.readmeAlreadyUploaded) {
        const requiredReadmeFields = [
          { value: this.homepage, name: 'Homepage' },
          { value: this.description, name: 'Description' },
          { value: this.example_pid, name: 'Example PID' },
          { value: this.example_redirect_target, name: 'Example redirect target URL' },
          { value: this.contact_name, name: 'Contact name' },
          { value: this.contact_email, name: 'Contact email' }
        ];

        for (const field of requiredReadmeFields) {
          if (!field.value) {
            this.error = `${field.name} is required`;
            return;
          }
        }
      }

      try {
        this.inProgress = true
        const result = await submitData(this.namespace, this.file)
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
</style>
