<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">รายการเมนูอาหาร</h1>
    
    <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ errorMessage }}
    </div>
    
    <div v-if="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      {{ successMessage }}
    </div>
    
    <div class="mb-4 flex justify-between items-center">
      <h2 class="text-xl">รายการทั้งหมด ({{ menus.length }} รายการ)</h2>
      <router-link to="/add-menu" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
        เพิ่มเมนูใหม่
      </router-link>
    </div>
    
    <div v-if="isLoading" class="text-center py-8">
      <p>กำลังโหลดข้อมูล...</p>
    </div>
    
    <div v-else-if="menus.length === 0" class="text-center py-8 bg-gray-100 rounded">
      <p>ยังไม่มีรายการเมนูในระบบ</p>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="menu in menus" :key="menu.id" class="bg-white rounded-lg shadow-lg overflow-hidden">
        <img
          :src="menu.image_url"
          :alt="menu.name"
          class="w-full h-48 object-cover"
          onerror="this.src='https://via.placeholder.com/300x200?text=ไม่มีรูปภาพ'"
        />
        <div class="p-4">
          <h3 class="text-xl font-semibold mb-2">{{ menu.name }}</h3>
          <p class="text-gray-700 mb-2">{{ menu.description }}</p>
          <p class="text-lg font-bold text-green-600 mb-4">{{ menu.price }} บาท</p>
          <div class="flex justify-between">
            <router-link :to="'/edit-menu/' + menu.id" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">
              แก้ไข
            </router-link>
            <button
              @click="confirmDelete(menu)"
              class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
            >
              ลบ
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal สำหรับยืนยันการลบ -->
    <div v-if="showConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">ยืนยันการลบเมนู</h3>
        <p class="mb-4">คุณต้องการลบเมนู "{{ menuToDelete.name }}" ใช่หรือไม่?</p>
        <div class="flex justify-end">
          <button
            @click="cancelDelete"
            class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            ยกเลิก
          </button>
          <button
            @click="deleteMenu"
            class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            ลบ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'MenuList',
  data() {
    return {
      menus: [],
      isLoading: false,
      errorMessage: '',
      successMessage: '',
      showConfirmModal: false,
      menuToDelete: null
    };
  },
  created() {
    this.fetchMenus();
  },
  methods: {
    async fetchMenus() {
      try {
        this.isLoading = true;
        const response = await axios.get('http://localhost:5000/menus');
        this.menus = response.data;
      } catch (error) {
        this.errorMessage = 'ไม่สามารถดึงข้อมูลเมนูได้ กรุณาลองใหม่อีกครั้ง';
        console.error('Error fetching menus:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    confirmDelete(menu) {
      this.menuToDelete = menu;
      this.showConfirmModal = true;
    },
    
    cancelDelete() {
      this.showConfirmModal = false;
      this.menuToDelete = null;
    },
    
    async deleteMenu() {
      try {
        await axios.delete(`http://localhost:5000/menus/${this.menuToDelete.id}`);
        this.successMessage = `ลบเมนู "${this.menuToDelete.name}" สำเร็จแล้ว`;
        // อัปเดตรายการเมนูหลังจากลบ
        this.menus = this.menus.filter(menu => menu.id !== this.menuToDelete.id);
        
        // ปิด modal
        this.showConfirmModal = false;
        this.menuToDelete = null;
        
        // ล้างข้อความแจ้งเตือนหลังจาก 3 วินาที
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      } catch (error) {
        this.errorMessage = 'ไม่สามารถลบเมนูได้ กรุณาลองใหม่อีกครั้ง';
        console.error('Error deleting menu:', error);
        this.showConfirmModal = false;
      }
    }
  }
};
</script>

<style scoped>
/* สามารถเพิ่ม CSS เพิ่มเติมตามต้องการได้ที่นี่ */
</style>

<style scoped>
/* สไตล์ทั่วไป */
.menu-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Prompt', 'Kanit', sans-serif;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.add-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background-color: #45a049;
}

.search-box {
  position: relative;
}

.search-box input {
  padding: 10px 16px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 240px;
  font-size: 14px;
}

.search-box input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.15);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  font-size: 16px;
}

/* Menu Filters */
.menu-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
}

.filter-btn {
  padding: 8px 20px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background-color: #e8e8e8;
}

.filter-btn.active {
  background-color: #4CAF50;
  color: white;
}

/* Loading & Empty States */
.loading-indicator, .empty-state {
  text-align: center;
  padding: 60px 0;
  color: #666;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 20px;
  margin: 0 0 10px 0;
  color: #333;
}

.empty-state p {
  color: #666;
  margin-bottom: 25px;
}

.add-menu-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
}

/* Menu Grid */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.menu-card {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.menu-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.menu-image {
  height: 180px;
  overflow: hidden;
  background-color: #f9f9f9;
}

.menu-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #aaa;
  font-size: 14px;
}

.menu-info {
  padding: 15px;
}

.menu-info h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.menu-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
  line-height: 1.4;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.menu-price {
  color: #4CAF50;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 15px;
}

.menu-actions {
  display: flex;
  padding: 0 15px 15px;
  gap: 10px;
}

.edit-btn, .delete-btn {
  flex: 1;
  padding: 8px 0;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-btn {
  background-color: #2196F3;
  color: white;
}

.edit-btn:hover {
  background-color: #1976D2;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

/* Delete Modal */
.delete-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background-color: white;
  border-radius: 10px;
  padding: 25px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
  font-size: 18px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
}

.cancel-btn, .confirm-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #e0e0e0;
  color: #333;
}

.confirm-btn {
  background-color: #f44336;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    margin-top: 15px;
  }
  
  .search-box {
    flex-grow: 1;
  }
  
  .search-box input {
    width: 100%;
  }
  
  .menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 480px) {
  .menu-list-container {
    padding: 15px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .menu-filters {
    overflow-x: auto;
    padding-bottom: 5px;
  }
  
  .menu-grid {
    grid-template-columns: 1fr;
  }
}
</style>
