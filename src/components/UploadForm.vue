<template>
  <v-form id="uploadForm" @submit.prevent="submitForm">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-text-field v-model="namespace" label="Namespace" required></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-file-input v-model="file" label="CSV Mapping" accept=".csv" required show-size></v-file-input>
        </v-col>
        <v-col cols="12">
          <v-btn type="submit" color="primary">
            Upload and Create Pull Request
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
export default {
  data() {
    return {
      namespace: '',
      file: null
    };
  },
  methods: {
    submitForm() {
      // Handle form submission here
      if (this.namespace.trim() === '') {
        // You can add validation logic here if needed
        alert('Namespace is required');
        return;
      }

      if (!this.file) {
        alert('CSV Mapping file is required');
        return;
      }

      // Proceed with form submission
      console.log('Form submitted', this.namespace, this.file);

      // Reset form fields after submission if needed
      this.namespace = '';
      this.file = null;
    }
  }
};
</script>