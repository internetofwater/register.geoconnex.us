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
                <v-file-input v-model="file" label="CSV Mapping" accept=".csv" required show-size outlined>
                </v-file-input>
              </v-col>
              <v-col cols="12" class="text-center">
                <v-btn type="submit" color="#1B335F">
                  Upload and Create Pull Request
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
          <v-fade-transition>
          <v-alert color="error" icon="$error" title="Error submitting PR" :text="error" v-if="error"></v-alert>
        </v-fade-transition>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return {
      namespace: '',
      file: null,
      error: ''
    };
  },
  methods: {
    submitForm() {
      this.error = '';
      // Handle form submission here
      if (this.namespace.trim() === '') {
        this.error = 'Namespace is required';
        return;
      }

      if (!this.file) {
        this.error = 'File is required';
        return;
      }

      submitPR(this.namespace, this.file);
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
