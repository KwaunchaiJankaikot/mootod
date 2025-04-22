<!-- App.vue -->
<template>
  <div id="app">
    <HeaderNavbar />
    <router-view/>
  </div>
</template>

<script>
import HeaderNavbar from '@/components/HeaderNavbar.vue';

export default {
  name: 'App',
  components: {
    HeaderNavbar
  }
}ว
</script>