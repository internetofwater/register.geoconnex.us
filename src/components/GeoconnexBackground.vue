<template>
  <h2 class="text-center">Geoconnex Background Info</h2>

  <p class="text-center pa-4">
    The <a href="https://geoconnex.us">geoconnex.us</a> project provides technical infrastructure
    and guidance for creating an open, community-contribution model for a knowledge graph linking
    hydrologic features in the United States, published in accordance with Spatial Data on the Web
    best practices as an implementation of Internet of Water principles.
  </p>

  <p class="text-center pa-4">
    This website allows users to create Geoconnex linkages to their own water data. Submit a CSV
    file to register persistent URL-formatted identifiers for your organization's monitoring
    locations within a namespace. The features you link to must already exist online and have their
    own web page.
  </p>
  <v-alert
    color="primary--text"
    class="mb-2"
    icon="$info"
    variant="flat"
    title="Additional details "
  >
    For more details, the
    <a href="https://docs.geoconnex.us/">geoconnex documentation</a> provides a general overview of
    geoconnex and a tutorial for how to:
    <ol>
      <li>
        1. 
        <a href="https://docs.geoconnex.us/contributing/step-1/idscheme">Prepare your data</a>
        with the proper metadata context
      </li>
      <li>
        2. Host your data, if you have not done so already, with
        <a href="https://docs.geoconnex.us/contributing/step-2/">individual web pages</a>
        that can be linked to as the "target" column in your uploaded CSV
      </li>
      <li>
        3. 
        <a href="https://docs.geoconnex.us/contributing/step-3/minting">Submit your CSV data</a>,
        either here or Github, after checking it is
        <a href="https://docs.geoconnex.us/reference/data-formats/csv-submissions/">
          properly formatted</a
        >
      </li>
    </ol>
  </v-alert>
</template>

<style scoped>
/* remove highlighting for visited link */
a:visited {
  color: inherit;
}
</style>
