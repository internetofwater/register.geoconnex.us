<template>
  <div>
    <v-card-text class="text-center">
      <v-row class="d-flex justify-center">
        <h2 class="mb-4">Add or Update Contribution Information</h2>
      </v-row>
    </v-card-text>
  </div>
  <v-checkbox
    class="d-flex justify-center mb-4"
    label="I already have a readme file uploaded to my namespace and do not wish to update my contribution info"
    v-model="readmeAlreadyUploaded"
  >
  </v-checkbox>

  <div v-if="!readmeAlreadyUploaded">
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
</template>

<script lang="ts">
import { generateReadMe } from '@/lib/helpers'
import type { MarkdownSection } from '@/lib/types'
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    namespace: {
      type: String,
      required: true
    }
  },
  emits: ['result'],
  data() {
    return {
      homepage: '',
      description: '',
      example_pid: '',
      example_redirect_target: '',
      contact_name: '',
      contact_email: '',
      readmeAlreadyUploaded: false
    }
  },
  computed: {
    readme() {
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
            return { type: 'Error Submitting PR', text: `${field.sectionName} is required` }
          }
        }

        const generatedReadme = generateReadMe(this.namespace, requiredReadmeFields)
        const file = new File([generatedReadme], 'README.md', { type: 'text/plain' })
        this.$emit('result', file)
      }

      return null
    }
  }
})
</script>
