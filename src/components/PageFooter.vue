<template>
  <v-footer class="footer pa-8" width="auto">
    <div class="logo-container">
      <a href="https://internetofwater.org" class="logo-link">
        <img src="@/assets/logo-iow.png" alt="Internet of Water Logo" title="internetofwater.org" class="logo-img" />
      </a>
      <a href="https://cgsearth.org" class="logo-link">
        <img src="@/assets/logo-cgs.png" alt="CGS Earth Logo" title="cgsearth.org" class="logo-img" />
      </a>
    </div>
  </v-footer>
</template>


<style scoped>
.footer {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px 20px;
  background-color: rgba(0, 0, 0, 0);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  /* Align items to the bottom */
  height: 120px;
}

.logo-container {
  display: flex;
  align-items: flex-end;
  /* Align logos to the bottom of the container */
}

.logo-img {
  width: 180px;
  padding: 0 16px;

}

</style>
