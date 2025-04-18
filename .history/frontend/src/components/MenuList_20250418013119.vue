<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">รายการเมนูอาหาร</h1>
      <router-link to="/add-menu" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center">
        <i class="fas fa-plus mr-2"></i> เพิ่มเมนูใหม่
      </router-link>
    </div>
    
    <div v-if="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
      <div class="flex items-center">
        <i class="fas fa-exclamation-circle mr-2"></i>
        <p>{{ errorMessage }}</p>
      </div>
    </div>
    
    <div v-if="successMessage" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 flex items-center">
      <i class="fas fa-check-circle mr-2"></i>
      <p>{{ successMessage }}</p>
    </div>
    
    <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div class="p-4 bg-gray-50 border-b flex justify-between items-center">
        <div class="font-medium">
          รายการทั้งหมด ({{ menus.length }} รายการ)
        </div>
        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="ค้นหาเมนู..."
            class="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-8"
          />
          <i class="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
        </div>
      </div>
      
      <div v-if="isLoading" class="p-12 flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
      
      <div v-else-if="filteredMenus.length === 0 && !isLoading" class="p-12 text-center text-gray-500">
        <i class="fas fa-utensils text-gray-300 text-5xl mb-4"></i>
        <p v-if="searchQuery">ไม่พบเมนูที่ตรงกับคำค้นหา "{{ searchQuery }}"</p>
        <p v-else>ยังไม่มีรายการเมนูในระบบ</p>
        <div class="mt-4">
          <router-link to="/add-menu" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
            เพิ่มเมนูใหม่
          </router-link>
        </div>
      </div>
      
      <div v-else class="grid grid-cols-1 md:/div>