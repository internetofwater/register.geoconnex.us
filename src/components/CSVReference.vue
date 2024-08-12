<template>

    <v-expansion-panels class="contribution-button mb-5" v-model="activePanel">
        <v-expansion-panel title="CSV Formatting Reference" bg-color="#f4f4f9" value="1">
            <v-expansion-panel-text class="expansion-panel text-1b335f">
                <v-card-text class="markdown-card-text text-center pa-0 ma-0">
                    <br />
                    <i class="pa-12">Ensure your identifiers are well-documented and all info is up-to-date to
                        so that Geoconnex administrators can follow up with you if there are any
                        issues.</i>
                    <br />
                    <br />
                    <p class="text-center mb-4">
                        The 4 columns required in your CSV mapping should be:
                    </p>

                    <div class="d-flex mx-4 px-4">
                        <p>
                            <b><code>id </code></b> <br />
                            <i>The ID within geoconnex that your data should map to. These are
                                unique, will redirect to the associated target, and are meant for
                                individual monitoring locations.
                            </i>
                        </p>
                        <p>
                            <b><code>target </code></b> <br />
                            <i>The URL pointing to a JSON-LD landing page for a single feature in
                                your data.</i>
                        </p>
                        <p>
                            <b><code>creator </code></b> <br />
                            <i>A contact email for someone associated with the data</i>
                        </p>
                        <p>
                            <b><code>description </code></b> <br />
                            <i>A description of your data.</i>
                        </p>
                    </div>

                    <br />
                    <v-btn class="flex ma-2" target="_blank" variant="test" append-icon="mdi-open-in-new"
                        href="https://github.com/internetofwater/geoconnex.us/blob/master/namespaces/iow/demo.csv">1:1
                        example</v-btn>
                    <v-btn target="_blank" variant="text" append-icon="mdi-open-in-new"
                        href="https://github.com/internetofwater/geoconnex.us/blob/master/namespaces/usgs/monitoring-location/monitoring-location.csv">1:N
                        example</v-btn>
                    <br />
                    For more detailed info regarding the format of your CSV, see the
                    <a href="https://docs.geoconnex.us/reference/data-formats/csv-submissions/">
                        CSV formatting documentation</a>
                </v-card-text>
            </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>

</template>

<script lang="ts">
import { defineComponent } from 'vue';


export default defineComponent({
    name: 'CSVReference',

    data() {
        return {
            // auto open the first panel
            activePanel: '1'
        }
    }
})

</script>