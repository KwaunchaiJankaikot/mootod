<template>
  <div id="app">
    <router-view></router-view>  
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}

#app {
  font-family: 'Prompt', 'Kanit', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>