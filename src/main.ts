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
    primary: "#1b335",
    accent: buttonColor
  },
}

const customDarkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: colors.grey.darken4,
    surface: colors.grey.darken3,
    secondary: colors.red.darken2,
    accent: buttonColor
  },
}

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: customDarkTheme,
      light: customLightTheme
    }
  }
})

const app = createApp(App)
app.use(vuetify)
app.use(router)

app.mount('#app')
