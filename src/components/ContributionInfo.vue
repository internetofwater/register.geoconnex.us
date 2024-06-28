

<template>
    <div>
        <button class="accordion container-narrow" @click="loadMarkdown">Contribution Documentation</button>
        <div class="panel">
            <div id="markdownContent" class="container-medium"></div>
        </div>
    </div>
</template>


<script>
import { Marked } from 'marked';

export default {
    data() {
        return {
            url: 'https://raw.githubusercontent.com/Geoconnex/geoconnex/main/CONTRIBUTING.md'
        }
    },
    methods: {
        loadMarkdown() {
            fetch(this.url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.text(); // Use response.text() for fetching text content
                })
                .then(markdown => {
                    const html = marked(markdown);
                    document.getElementById('markdownContent').innerHTML = html;
                })
                .catch(error => {
                    console.error('Error fetching Markdown:', error);
                    document.getElementById('markdownContent').innerHTML = '<p>Error loading Markdown content.</p>';
                });
        }
    },
};
</script>

<style scoped></style>
