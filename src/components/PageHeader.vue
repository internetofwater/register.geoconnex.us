<template>
  <div class="header pa-6 mb-4">
    <div class="logo-container">
      <a href="https://geoconnex.us">
        <img src="@/assets/logo-geoconnex.png" alt="Geoconnex Logo" title="geoconnex.us" class="logo-geoconnex" />
      </a>
    </div>

    <!-- TODO: Dark mode is implemented by the icons in the footer do not look good with it
        work for future sprint 
    -->
    <!-- <v-icon @click="toggleTheme" icon="mdi-theme-light-dark" class="theme-toggle-icon"></v-icon> -->
  </div>

</template>


<!-- <script setup lang="ts">
import { useTheme } from 'vuetify'

const theme = useTheme()

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}
</script> -->


<style scoped>
.header {
  display: flex;
  align-items: center;
  /* Vertically center items */
  justify-content: space-between;
  /* Space out the logo and the theme icon */
  padding: 10px;

  background-color: rgb(var(--v-theme-primary));
}

.logo-container {
  flex: 1;
  /* Allow the logo to take up available space */
  text-align: center;
  /* Center the logo */
}

.logo-geoconnex {
  width: 480px;
  height: auto;
}

.theme-toggle-icon {
  margin-left: auto;
  /* Push the icon to the right */
  height: auto;
}

@media (max-width: 500px) {
  .logo-geoconnex {
    width: 360px;
  }
}

.logo-geoconnex {
  -webkit-filter: drop-shadow(1px 1px 0 rgba(255, 255, 255, 0.594)) drop-shadow(-1px 1px 0 white) drop-shadow(1px -1px 0 white) drop-shadow(-1px -1px 0 white);

  filter: drop-shadow(1px 1px 0 white) drop-shadow(-1px 1px 0.29 white) drop-shadow(1px -1px 0.29 white) drop-shadow(-1px -1px 0.29 white);

}
</style>
