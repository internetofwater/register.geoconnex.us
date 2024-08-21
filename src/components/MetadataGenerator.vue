<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { fetchAllNamespaces, generateReadMe } from '@/lib/helpers'
import { useFormStore } from '@/stores/formStore'
import type { MarkdownSection } from '@/lib/types'

const state = useFormStore()

const homepage = ref('')
const description = ref('')
const example_pid = ref('')
const example_redirect_target = ref('')
const contact_name = ref('')
const contact_email = ref('')
const readmeAlreadyUploaded = ref(false)
const existingNamespaces = ref<string[]>([])


onMounted(async () => {
  existingNamespaces.value = await fetchAllNamespaces()
})

const isFormValid = computed(() => {
  if (!state.namespace) {
    return { type: 'error', text: 'Namespace is required' }
  }

  if (state.namespace.length === 0) return { type: 'error', text: 'Namespace is required' } 

  if (!readmeAlreadyUploaded.value) {
    const requiredReadmeFields: MarkdownSection[] = [
      { body: homepage.value, sectionName: 'Homepage' },
      { body: description.value, sectionName: 'Description' },
      { body: example_pid.value, sectionName: 'Example PID' },
      { body: example_redirect_target.value, sectionName: 'Example redirect target URL' },
      { body: contact_name.value, sectionName: 'Contact name' },
      { body: contact_email.value, sectionName: 'Contact email' }
    ]

    for (const field of requiredReadmeFields) {
      if (field.body.length === 0) return { type: 'error', text: `${field.sectionName} is required` }
    }
  }

  return { type: 'success', text: '' }
})

state.blockNext = isFormValid.value.type === 'error'
watch(isFormValid, (newVal) => {
  state.blockNext = newVal.type === 'error'
})

function setReadme() {
  if (isFormValid.value.type !== 'success') {
    return 
  }

  if (!readmeAlreadyUploaded.value) {
    const requiredReadmeFields: MarkdownSection[] = [
      { body: homepage.value, sectionName: 'Homepage' },
      { body: description.value, sectionName: 'Description' },
      { body: example_pid.value, sectionName: 'Example PID' },
      { body: example_redirect_target.value, sectionName: 'Example redirect target URL' },
      { body: contact_name.value, sectionName: 'Contact name' },
      { body: contact_email.value, sectionName: 'Contact email' }
    ]

    const generatedReadme = generateReadMe(state.namespace, requiredReadmeFields)
    state.readme = new File([generatedReadme], 'README.md', { type: 'text/plain' })
  }
}

// Watch the fields and update the README whenever any of them changes
watch(isFormValid, () => {
  setReadme()
})
</script>

<template>
  <p class="text-center pa-6 font-italic w-66 mx-auto">
    A namespace is a short name or alias for your organization. It will be created upon submission
    if it does not already exist. If the namespace already exists, your new CSV file will be added
    to the existing namespace
  </p>

  <v-combobox
    label="Pick your organization if it exists, or create a new namespace"
    class="w-66 mx-auto"
    required
    :items="existingNamespaces"
    variant="outlined"
    v-model="state.namespace"
  />

  <v-switch
    class="d-flex justify-center mb-4"
    color="accent"
    label="I already have a readme file uploaded to my namespace and do not wish to update my contribution info"
    v-model="readmeAlreadyUploaded"
  />

  <div v-if="!readmeAlreadyUploaded">
    <v-row>
      <v-col cols="10" offset="1">
        <v-text-field
          v-model="homepage"
          label="Homepage for where redirects will point to"
          type="url"
          required
          variant="outlined"
          hint="Example: https://waterdata.usgs.gov"
          persistent-hint
          class="pb-4"
        />
      </v-col>

      <v-col cols="5" offset="1">
        <v-text-field
          v-model="example_pid"
          label="Example PID"
          required
          variant="outlined"
          hint="Example: https://geoconnex.us/usgs/monitoring-location/08383500"
          persistent-hint
          class="pb-4"
        />
      </v-col>

      <v-col cols="5">
        <v-text-field
          v-model="example_redirect_target"
          label="Example redirect target url"
          type="url"
          variant="outlined"
          hint="Example: https://waterdata.usgs.gov/monitoring-location/08383500"
          persistent-hint
          class="pb-4"
        />
      </v-col>

      <v-col cols="10" offset="1">
        <v-textarea
          v-model="description"
          label="Description of data"
          required
          variant="outlined"
          hint="Example: All monitoring locations used by the USGS Waterdata system"
          persistent-hint
          class="pb-4"
        />
      </v-col>

      <v-col cols="5" offset="1">
        <v-text-field
          v-model="contact_name"
          label="Contact name"
          hint="Example: John Smith"
          required
          variant="outlined"
          class="pb-4"
        />
      </v-col>

      <v-col cols="5">
        <v-text-field
          v-model="contact_email"
          label="Contact email"
          append-inner-icon="mdi-email"
          required
          variant="outlined"
          type="email"
          hint="Example: user@usgs.gov"
        />
      </v-col>
    </v-row>
  </div>

  <v-alert type="error" class="w-50 mx-auto" v-if="isFormValid.type === 'error'" icon="mdi-alert">
    {{ isFormValid.text }}
  </v-alert>
</template>
