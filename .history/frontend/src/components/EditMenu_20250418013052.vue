<template>
  <div class="mb-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">แก้ไขเมนูอาหาร</h1>
      <button 
        @click="goBack" 
        class="flex items-center text-gray-600 hover:text-gray-800 transition"
      >
        <i class="fas fa-arrow-left mr-1"></i> กลับไปรายการเมนู
      </button>
    </div>
    
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else-if="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
      <div class="flex items-center">
        <i class="fas fa-exclamation-circle mr-2"></i>
        <p>{{ errorMessage }}</p>
      </div>
      <div class="mt-4">
        <button 
          @click="goBack" 
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          กลับไปรายการเมนู
        </button>
      </div>
    </div>
    
    <div v-else-if="!menu.id" class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
      <div class="flex items-center">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        <p>ไม่พบข้อมูลเมนูที่ต้องการแก้ไข หรือยังไม่ได้โหลดข้อมูล</p>
      </div>
      <div class="mt-4">
        <button 
          @click="goBack" 
          class="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
        >
          กลับไปรายการเมนู
        </button>
      </div>
    </div>
    
    <div v-else>
      <div v-if="successMessage" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
        <div class="flex items-center">
          <i class="fas fa-check-circle mr-2"></i>
          <p>{{ successMessage }}</p>
        </div>
      </div>
      
      <form @submit.prevent="updateMenu" class="bg-white rounded-lg shadow-md p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="md:col-span-2 space-y-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2" for="name">
                ชื่อเมนู <span class="text-red-500">*</span>
              </label>
              <input
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                id="name"
                type="text"
                v-model="menu.name"
                required
                placeholder="ชื่อเมนูอาหาร"
              />
            </div>
            
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2" for="description">
                รายละเอียด <span class="text-red-500">*</span>
              </label>
              <textarea
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                id="description"
                v-model="menu.description"
                rows="4"
                required
                placeholder="อธิบายรายละเอียดของเมนูนี้"
              ></textarea>
            </div>
            
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2" for="price">
                ราคา (บาท) <span class="text-red-500">*</span>
              </label>
              <input
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                id="price"
                type="number"
                v-model="menu.price"
                min="0"
                step="0.01"
                required
                placeholder="ราคาเมนู"
              />
            </div>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">
                รูปภาพเมนู
              </label>
              <div v-if="menu.image_url" class="mb-3">
                <img
                  :src="menu.image_url"
                  alt="รูปภาพเมนู"
                  class="w-full h-44 object-cover rounded border"
                  @error="handleImageError"
                />
              </div>
              <div class="border-2 border-dashed border-gray-300 rounded p-4 text-center hover:bg-gray-50 transition cursor-pointer" @click="triggerFileInput">
                <i class="fas fa-upload text-gray-400 text-2xl mb-2"></i>
                <p class="text-gray-500 font-medium">คลิกเพื่ออัปโหลดรูปภาพใหม่</p>
                <p class="text-gray-400 text-xs mt-1">รองรับไฟล์ .jpg, .png, .jpeg</p>
                <input
                  ref="fileInput"
                  type="file"
                  @change="handleImageChange"
                  accept="image/*"
                  class="hidden"
                />
              </div>
              <p v-if="selectedFile" class="text-green-600 text-sm mt-2">
                <i class="fas fa-check-circle mr-1"></i> {{ selectedFile.name }}
              </p>
              <p class="text-gray-500 text-xs mt-2">
                <i class="fas fa-info-circle mr-1"></i> หากไม่ต้องการเปลี่ยนรูปภาพ ให้เว้นช่องนี้ไว้
              </p>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end mt-6 space-x-3">
          <button
            type="button"
            @click="goBack"
            class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center"
            :disabled="isSubmitting"
          >
            <i class="fas fa-spinner fa-spin mr-2" v-if="isSubmitting"></i>
            {{ isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'EditMenu',
  props: {
    id: {
      type: [String, Number],
      required: false
    }
  },
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
      isSubmitting: false,
      errorMessage: '',
      successMessage: '',
      loadingError: false,
      imgError: false
    };
  },
  created() {
    // รับ id จาก route parameter
    const menuId = this.id || this.$route.params.id;
    if (menuId) {
      this.fetchMenuData(menuId);
    } else {
      this.errorMessage = 'ไม่พบรหัสเมนูที่ต้องการแก้ไข';
    }
  },
  methods: {
    async fetchMenuData(id) {
      try {
        this.isLoading = true;
        this.errorMessage = '';
        
        const response = await axios.get(`http://localhost:5000/menus/${id}`);
        
        if (response.data) {
          this.menu = response.data;
        } else {
          this.errorMessage = 'ไม่พบข้อมูลเมนูที่ต้องการแก้ไข';
        }
      } catch (error) {
        console.error('Error fetching menu data:', error);
        this.errorMessage = 'ไม่สามารถดึงข้อมูลเมนูได้ กรุณาลองใหม่อีกครั้ง';
        this.loadingError = true;
      } finally {
        this.isLoading = false;
      }
    },
    
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    
    handleImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        // ตรวจสอบว่าเป็นไฟล์รูปภาพหรือไม่
        if (!file.type.match('image.*')) {
          alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
          return;
        }
        
        // จำกัดขนาดไฟล์ (5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
          return;
        }
        
        this.selectedFile = file;
        
        // แสดงตัวอย่างรูปภาพ
        const reader = new FileReader();
        reader.onload = (e) => {
          this.menu.image_url = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    
    handleImageError() {
      this.imgError = true;
      this.menu.image_url = 'https://via.placeholder.com/300x200?text=ไม่พบรูปภาพ';
    },
    
    async updateMenu() {
      if (!this.menu.id) {
        this.errorMessage = 'ไม่พบข้อมูลเมนูที่ต้องการแก้ไข';
        return;
      }
      
      try {
        this.isSubmitting = true;
        this.errorMessage = '';
        this.successMessage = '';
        
        const formData = new FormData();
        formData.append('name', this.menu.name);
        formData.append('description', this.menu.description);
        formData.append('price', this.menu.price);
        
        // ส่ง URL รูปภาพเดิมเสมอ (สำคัญ!)
        formData.append('image_url', this.menu.image_url);
        
        // ถ้ามีการเลือกรูปภาพใหม่ ให้เพิ่มลงใน FormData
        if (this.selectedFile) {
          formData.append('image', this.selectedFile);
        }
        
        // ส่งข้อมูลไปยัง API
        await axios.put(
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
          this.goBack();
        }, 1500);
        
      } catch (error) {
        console.error('Error updating menu:', error);
        this.errorMessage = 'เกิดข้อผิดพลาดในการอัปเดตเมนู กรุณาลองใหม่อีกครั้ง';
      } finally {
        this.isSubmitting = false;
      }
    },
    
    goBack() {
      this.$router.push('/menus');
    }
  }
};
</script>

<style scoped>
/* เพิ่ม transition สำหรับ hover effects */
.transition {
  transition: all 0.3s ease;
}

/* เพิ่ม animation สำหรับ spinner */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>