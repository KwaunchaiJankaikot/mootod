<template>
  <div>
    <h1>About Page</h1>
    <!-- ปุ่มเพื่อไปยังหน้า Home -->
    <button @click="goToHome">กลับสู่หน้า Home</button>
  </div>
</template>

<script>
export default {
  name: 'AboutPage',
  methods: {
    goToHome() {
      // การนำทางไปยังหน้า / (Home)
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
/* สไตล์ของหน้า About */
</style>
