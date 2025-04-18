<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">แก้ไขเมนูอาหาร</h1>
    
    <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ errorMessage }}
    </div>
    
    <div v-if="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      {{ successMessage }}
    </div>
    
<form @submit.prevent="updateMenu">
  <div>
    <label for="name">ชื่อเมนู</label>
    <input id="name" type="text" v-model="menu.name" required>
  </div>
  
  <div>
    <label for="description">รายละเอียด</label>
    <textarea id="description" v-model="menu.description" required></textarea>
  </div>
  
  <div>
    <label for="price">ราคา (บาท)</label>
    <input id="price" type="number" v-model="menu.price" required>
  </div>
  
  <div>
    <label for="image">รูปภาพ</label>
    <input id="image" type="file" @change="handleFileChange">
    <p>* หากไม่ต้องการเปลี่ยนรูปภาพ ให้เว้นช่องนี้ไว้</p>
  </div>
  
  <button type="submit">บันทึกการแก้ไข</button>
  <button type="button" @click="goBack">ยกเลิก</button>
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
  async updateMenu() {
    try {
      const formData = new FormData();
      formData.append('name', this.menu.name);
      formData.append('description', this.menu.description);
      formData.append('price', this.menu.price);
      
      // สิ่งสำคัญ: ส่ง image_url เดิมไปด้วยเสมอ
      formData.append('image_url', this.menu.image_url);
      
      // ถ้ามีการเลือกรูปภาพใหม่
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }
      
      await axios.put(`http://localhost:5000/menus/${this.menu.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // แสดงข้อความสำเร็จและกลับไปหน้าหลัก
      alert('อัปเดตเมนูสำเร็จแล้ว');
      this.$router.push('/menus');
      
    } catch (error) {
      console.error('Error updating menu:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตเมนู กรุณาลองใหม่อีกครั้ง');
    }
  },
  
  handleFileChange(event) {
    this.selectedFile = event.target.files[0];
  },
  
  goBack() {
    this.$router.push('/menus');
  }
}
};
</script>

<style scoped>
/* สไตล์ทั่วไป */
.edit-menu-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Prompt", "Kanit", sans-serif;
}

/* สไตล์การ์ด */
.form-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 30px;
}

/* ฟอร์ม */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  transition: border 0.3s ease;
}

.form-control:focus {
  border-color: #4caf50;
  outline: none;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.15);
}

/* อัปโหลดไฟล์ */
.file-upload {
  margin-bottom: 25px;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 6px;
  padding: 25px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #4caf50;
  background-color: rgba(76, 175, 80, 0.05);
}

.upload-icon {
  display: block;
  font-size: 32px;
  margin-bottom: 10px;
}

.file-input {
  display: none;
}

.filename {
  display: block;
  margin-top: 10px;
  font-size: 13px;
  color: #4caf50;
  word-break: break-all;
}

/* ปุ่มส่งฟอร์ม */
.submit-button {
  display: block;
  width: 100%;
  padding: 14px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.15s ease;
}

.submit-button:hover {
  background-color: #45a049;
}

.submit-button:active {
  transform: scale(0.98);
}
</style>
