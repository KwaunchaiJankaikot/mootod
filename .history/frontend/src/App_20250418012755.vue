<template>
  <div id="app">
    <nav class="bg-blue-600 text-white shadow-lg">
      <div class="container mx-auto px-4 py-3">
        <div class="flex justify-between items-center">
          <router-link to="/" class="text-xl font-bold">ระบบจัดการร้านอาหาร</router-link>
          <div class="space-x-4">
            <router-link to="/menus" class="hover:text-blue-200 transition">รายการเมนู</router-link>
            <router-link to="/add-menu" class="hover:text-blue-200 transition">เพิ่มเมนูใหม่</router-link>
          </div>
        </div>
      </div>
    </nav>
    
    <main class="container mx-auto py-6 px-4">
      <router-view />
    </main>
    
    <footer class="bg-gray-100 mt-10 py-6">
      <div class="container mx-auto px-4 text-center text-gray-600">
        <p>&copy; 2025 ระบบจัดการร้านอาหาร</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}ว
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');

* {
  font-family: 'Sarabun', sans-serif;
}

body {
  background-color: #f9fafb;
  color: #374151;
}

.router-link-active {
  font-weight: bold;
}
</style>