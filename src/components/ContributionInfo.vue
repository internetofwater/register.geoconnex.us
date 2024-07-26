<template>
  <v-expansion-panels id="contribution" class="contribution-button" @click="toggleMarkdown">
    <v-expansion-panel
      class="expansion-panel text-center"
      title="Detailed contribution documentation"
    >
      <v-card v-if="showing">
        <v-card-text class="markdown-card-text pa-10">
          <div id="markdownContainer">
            <div id="markdownContent" class="markdown-content" v-html="renderedMarkdown"></div>
          </div>
        </v-card-text>
      </v-card>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import { marked } from 'marked'
import { defineComponent, ref } from 'vue'
import { fetchMarkdownContent } from '../lib/helpers'

export default defineComponent({
  setup() {
    const showing = ref(false)
    const renderedMarkdown = ref<string>('')

    const toggleMarkdown = async () => {
      showing.value = !showing.value

      if (showing.value) {
        try {
          const url =
            'https://api.github.com/repos/internetofwater/geoconnex.us/contents/CONTRIBUTING.md'
          const markdown = await fetchMarkdownContent(url)
          const html = await marked(markdown)
          renderedMarkdown.value = html
        } catch (error) {
          console.error('Error fetching or rendering markdown:', error)
          renderedMarkdown.value = 'Error fetching or rendering markdown.'
        }
      } else {
        renderedMarkdown.value = ''
      }
    }

    return {
      showing,
      renderedMarkdown,
      toggleMarkdown
    }
  }
})
</script>

<style scoped>
.contribution-button {
  margin: 0 auto;
  text-align: center;
  width: 50%;
}

@media (max-width: 480px) {
  .contribution-button {
    width: 80%;
  }
}

.expansion-panel {
  background-color: #f4f4f9;
  color: #333;
}

.markdown-card-text {
  padding: 16px;
  text-align: start;
}
</style>

<style>
.markdown-content h2,
.markdown-content p,
.markdown-content ul,
.markdown-content ol li {
  margin-bottom: 8px;
}

.markdown-content ol {
  list-style-position: inside;
}

.markdown-content ul {
  padding-left: 32px;
  list-style-position: outside;
}
</style>
