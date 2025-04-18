<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <h1 class="text-6xl font-bold text-gray-300 mb-4">404</h1>
    <h2 class="text-2xl font-bold mb-4">ไม่พบหน้าที่คุณกำลังค้นหา</h2>
    <p class="mb-6 text-gray-600">หน้าที่คุณพยายามเข้าถึงอาจถูกย้าย ลบ หรือไม่มีอยู่ในระบบ</p>
    <div class="flex space-x-4">
      <router-link to="/" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
        กลับไปหน้าหลัก
      </router-link>
      <router-link to="/menus" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition">
        ไปยังรายการเมนู
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
};
</script>