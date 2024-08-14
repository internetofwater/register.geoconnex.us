import './assets/main.css'

import { createApp } from 'vue'
import router from './router'
import 'vuetify/styles'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import App from './App.vue'
import colors from 'vuetify/util/colors'

const buttonColor = "#00A087"

const customLightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    primary: colors.grey.lighten4, // lightest grey
    secondary: "#e5e9f0", // light grey
    accent: buttonColor, // turquoise
    header: "#1b335f" // dark blue for geoconnex
  },
}

const customDarkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    primary:  "#3b4252",
    background: "#434c5e",
    surface: colors.grey.darken3,
    secondary: colors.grey.darken2,
    accent: buttonColor
  },
}

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      dark: customDarkTheme,
      light: customLightTheme,
    }
  }
})

const app = createApp(App)
app.use(vuetify)
app.use(router)

app.mount('#app')
