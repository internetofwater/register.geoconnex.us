<template>
  <div class="header">
    <a href="https://geoconnex.us" class="logo-link">
      <img
        src="@/assets/logo-geoconnex.png"
        alt="Geoconnex Logo"
        title="geoconnex.us"
        class="logo-geoconnex"
      />
  </a>
  </div>
</template>

<style scoped>
.header {
  width: 100%;
  background-color: #f0f0f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px 20px;
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-geoconnex {
  width: 480px;
  height: auto;
  /* Maintain aspect ratio */
}
</style>
