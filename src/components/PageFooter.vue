<template>
  <div class="footer">
    <a href="https://internetofwater.org" class="logo-link">
      <img
        src="@/assets/logo-iow.png"
        alt="Geoconnex Logo"
        title="internetofwater.org"
        class="logo-img"
      />
    </a>
    <a href="https://cgsearth.org" class="logo-link">
      <img
        src="@/assets/logo-cgs.png"
        alt="Geoconnex Logo"
        title="cgsearth.org"
        class="logo-img"
      />
    </a>
  </div>
</template>

<style scoped>
.footer {
  width: 100%;
  background-color: #f0f0f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px 20px;
  margin-top: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-img {
  width: 180px;
  height: auto;
  /* Maintain aspect ratio */
  padding: 0 16px;
}
</style>
