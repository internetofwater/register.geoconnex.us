<script setup lang="ts">
import { fetchAllNamespaces } from '@/lib/helpers'
</script>

<template>

  <p class="text-center mx-15 pa-4 font-italic">
    A namespace is a short name or alias for your organization. It will be created upon
    submission if it does not already exist. If the namespace already exists, your new
    CSV file will be added to the existing namespace
  </p>

  <v-combobox label="Pick or create a new namespace" hint="Example: usgs" class="w-66 mx-auto"
    persistent-hint required :items="existingNamespaces" v-model="namespace"></v-combobox>
  <v-checkbox class="d-flex justify-center mb-4"
    label="I already have a readme file uploaded to my namespace and do not wish to update my contribution info"
    v-model="readmeAlreadyUploaded">
  </v-checkbox>

  <div v-if="!readmeAlreadyUploaded">
    <v-text-field v-model="homepage" label="Homepage for where redirects will point to" type="url" required
      variant="outlined" hint="Example: https://waterdata.usgs.gov" persistent-hint class="pb-4"></v-text-field>

    <v-textarea v-model="description" label="Description of data" required variant="outlined"
      hint="Example: All monitoring locations used by the USGS Waterdata system" persistent-hint
      class="pb-4"></v-textarea>

    <v-text-field v-model="example_pid" label="Example PID" required variant="outlined"
      hint="Example: https://geoconnex.us/usgs/monitoring-location/08383500" persistent-hint
      class="pb-4"></v-text-field>

    <v-text-field v-model="example_redirect_target" label="Example redirect target url" type="url" variant="outlined"
      hint="Example: https://waterdata.usgs.gov/monitoring-location/08383500" persistent-hint
      class="pb-4"></v-text-field>

    <v-text-field v-model="contact_name" label="Contact name" hint="Example: John Smith" required variant="outlined"
      class="pb-4"></v-text-field>

    <v-text-field v-model="contact_email" label="Contact email" append-inner-icon="mdi-email" required
      variant="outlined" type="email" hint="Example: user@usgs.gov"></v-text-field>
  </div>

  <v-alert type="error" class="w-50 mx-auto" v-if="!valid" icon="mdi-alert">
    {{ error }}
  </v-alert>

</template>

<script lang="ts">
import { generateReadMe } from '@/lib/helpers'
import type { MarkdownSection } from '@/lib/types'
import { defineComponent } from 'vue'

export default defineComponent({
  emits: ['result'],
  data() {
    return {
      homepage: '',
      namespace: "",
      description: '',
      example_pid: '',
      example_redirect_target: '',
      contact_name: '',
      contact_email: '',
      readmeAlreadyUploaded: false,
      existingNamespaces: [] as string[],
      error: ''
    }
  },
  async created() {
    this.existingNamespaces = await fetchAllNamespaces()
  },

  computed: {
    valid() {
      return this.namespace && this.namespace.length > 0 && this.error.length === 0
    },

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
          if (field.body.length == 0) {
            this.error = `${field.sectionName} is required`
            return null
          }
        }

        const generatedReadme = generateReadMe(this.namespace, requiredReadmeFields)
        const file = new File([generatedReadme], 'README.md', { type: 'text/plain' })
        this.error = ''
        this.$emit('result', {
          readme: file,
          namespace: this.namespace
        })
      }

      return null
    }
  },
}

)
</script>
