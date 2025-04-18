<template>
  <div>
    <h1>Welcome to Home Page</h1>
    <!-- ปุ่มเพื่อไปยังหน้า About -->
    <button @click="goToAbout">ไปยังหน้า About</button>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  methods: {
    goToAbout() {
      // การนำทางไปยังหน้า /about
      this.$router.push('/about');
    }
  }
};
</script>

<style scoped>
/* สไตล์ของหน้า Home */
</style>
