<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">แก้ไขเมนูอาหาร</h1>
    
    <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ errorMessage }}
    </div>
    
    <div v-if="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      {{ successMessage }}
    </div>
    
    <form @submit.prevent="updateMenu" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="name">
          ชื่อเมนู
        </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="name"
          type="text"
          v-model="menu.name"
          required
        />
      </div>
      
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="description">
          รายละเอียด
        </label>
        <textarea
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="description"
          v-model="menu.description"
          rows="4"
          required
        ></textarea>
      </div>
      
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="price">
          ราคา (บาท)
        </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="price"
          type="number"
          v-model="menu.price"
          min="0"
          step="0.01"
          required
        />
      </div>
      
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="image">
          รูปภาพ
        </label>
        <div v-if="menu.image_url" class="mb-2">
          <img :src="menu.image_url" alt="รูปภาพเมนู" class="w-32 h-32 object-cover" />
        </div>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="image"
          type="file"
          @change="handleImageChange"
          accept="image/*"
        />
        <p class="text-gray-500 text-xs mt-1">* หากไม่ต้องการเปลี่ยนรูปภาพ ให้เว้นช่องนี้ไว้</p>
      </div>
      
      <div class="flex items-center justify-between">
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
          :disabled="isLoading"
        >
          {{ isLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข' }}
        </button>
        <button
          class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="button"
          @click="goBack"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'EditMenu',
  data() {
    return {
      menu: {
        id: '',
        name: '',
        description: '',
        price: '',
        image_url: ''
      },
      selectedFile: null,
      isLoading: false,
      errorMessage: '',
      successMessage: ''
    };
  },
  created() {
    // รับ id จาก route parameter
    const menuId = this.$route.params.id;
    this.fetchMenuData(menuId);
  },
  methods: {
    async fetchMenuData(id) {
      try {
        this.isLoading = true;
        const response = await axios.get(`http://localhost:5000/menus/${id}`);
        this.menu = response.data;
      } catch (error) {
        this.errorMessage = 'ไม่สามารถดึงข้อมูลเมนูได้ กรุณาลองใหม่อีกครั้ง';
        console.error('Error fetching menu data:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    handleImageChange(event) {
      this.selectedFile = event.target.files[0];
    },
    
    async updateMenu() {
      try {
        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';
        
        const formData = new FormData();
        formData.append('name', this.menu.name);
        formData.append('description', this.menu.description);
        formData.append('price', this.menu.price);
        
        // ถ้ามีการเลือกรูปภาพใหม่ ให้เพิ่มลงใน FormData
        if (this.selectedFile) {
          formData.append('image', this.selectedFile);
        } else {
          // ถ้าไม่มีการเลือกรูปภาพใหม่ ให้ส่ง URL รูปภาพเดิม
          formData.append('image_url', this.menu.image_url);
        }
        
        // ใช้ axios ส่งข้อมูลไปยัง API
        const response = await axios.put(
          `http://localhost:5000/menus/${this.menu.id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        this.successMessage = 'อัปเดตเมนูสำเร็จแล้ว';
        
        // หลังจากสำเร็จให้รอสักครู่แล้วกลับไปหน้าแสดงเมนูทั้งหมด
        setTimeout(() => {
          this.$router.push('/menus');
        }, 2000);
        
      } catch (error) {
        console.error('Error updating menu:', error);
        this.errorMessage = 'เกิดข้อผิดพลาดในการอัปเดตเมนู กรุณาลองใหม่อีกครั้ง';
      } finally {
        this.isLoading = false;
      }
    },
    
    goBack() {
      this.$router.push('/menus');
    }
  }
};
</script>

<style scoped>
/* เพิ่ม CSS เพิ่มเติมตามต้องการ */
</style>