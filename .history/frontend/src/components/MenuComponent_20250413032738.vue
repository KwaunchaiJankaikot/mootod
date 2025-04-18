<template>
  <div class="menu-container">
    <div class="form-card">
      <h2 class="form-title">เพิ่มเมนูอาหาร</h2>
      <form @submit.prevent="uploadMenu">
        <div class="form-group">
          <label for="name">ชื่อเมนู</label>
          <input type="text" id="name" v-model="menu.name" required class="form-control" placeholder="ใส่ชื่อเมนูอาหาร" />
        </div>

        <div class="form-group">
          <label for="description">รายละเอียด</label>
          <textarea 
            id="description" 
            v-model="menu.description" 
            required 
            class="form-control" 
            rows="4" 
            placeholder="ใส่รายละเอียดเมนูอาหาร เช่น ส่วนประกอบ รสชาติ"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="price">ราคา (บาท)</label>
          <input 
            type="number" 
            id="price" 
            v-model="menu.price" 
            required 
            class="form-control" 
            min="0" 
            step="1" 
            placeholder="0" 
          />
        </div>

        <div class="form-group file-upload">
          <label for="image">
            <div class="upload-area">
              <i class="upload-icon">📷</i>
              <span>อัปโหลดรูปภาพ</span>
              <span class="filename" v-if="imageName">{{ imageName }}</span>
            </div>
          </label>
          <input 
            type="file" 
            id="image" 
            @change="onImageChange" 
            required 
            accept="image/*" 
            class="file-input" 
          />
        </div>

        <button type="submit" class="submit-button">
          <span>เพิ่มเมนู</span>
        </button>
      </form>
    </div>

    <!-- แสดงรายการเมนูที่มีอยู่ (เพิ่มเติม) -->
    <div class="menus-list" v-if="menus.length > 0">
      <h3>เมนูทั้งหมด</h3>
      <div class="menus-grid">
        <div class="menu-item" v-for="(item, index) in menus" :key="index">
          <div class="menu-image" v-if="item.image_url">
            <img :src="item.image_url" :alt="item.name">
          </div>
          <div class="menu-image placeholder" v-else>
            <span>ไม่มีรูปภาพ</span>
          </div>
          <div class="menu-details">
            <h4>{{ item.name }}</h4>
            <p class="menu-description">{{ item.description }}</p>
            <p class="menu-price">{{ item.price }} บาท</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      menus: [],
      menu: {
        name: '',
        description: '',
        price: 0,
        image: null
      },
      imageName: ''
    };
  },
  mounted() {
    this.fetchMenus();
  },
  methods: {
    fetchMenus() {
      axios.get('http://localhost:5000/menus')
        .then(response => {
          this.menus = response.data;
        })
        .catch(error => {
          console.error('เกิดข้อผิดพลาดในการดึงข้อมูลเมนู:', error);
        });
    },
    onImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.menu.image = file;
        this.imageName = file.name;
      } else {
        this.menu.image = null;
        this.imageName = '';
      }
    },
    uploadMenu() {
      const formData = new FormData();
      formData.append('name', this.menu.name);
      formData.append('description', this.menu.description);
      formData.append('price', this.menu.price);
      formData.append('image', this.menu.image);

      // แสดง loading state ได้ตรงนี้

      axios.post('http://localhost:5000/upload', formData)
        .then(() => {
          // แสดง notification แบบสวยงาม
          alert('เมนูถูกเพิ่มสำเร็จ!');
          
          // ล้างฟอร์ม
          this.menu.name = '';
          this.menu.description = '';
          this.menu.price = 0;
          this.menu.image = null;
          this.imageName = '';
          
          // ดึงข้อมูลเมนูใหม่
          this.fetchMenus();
        })
        .catch(error => {
          console.error('เกิดข้อผิดพลาด:', error);
          alert('เกิดข้อผิดพลาดในการเพิ่มเมนู กรุณาลองใหม่อีกครั้ง');
        });
    }
  }
};
</script>

<style scoped>
/* สไตล์ทั่วไป */
.menu-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Prompt', 'Kanit', sans-serif;
}

.form-title {
  color: #333;
  margin-bottom: 25px;
  font-size: 1.8rem;
  text-align: center;
  font-weight: 600;
}

/* สไตล์การ์ด */
.form-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 30px;
}

/* สไตล์ฟอร์ม */
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
  border-color: #4CAF50;
  outline: none;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.15);
}

/* สไตล์อัปโหลดไฟล์ */
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
  border-color: #4CAF50;
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
  color: #4CAF50;
  word-break: break-all;
}

/* สไตล์ปุ่ม */
.submit-button {
  display: block;
  width: 100%;
  padding: 14px;
  background-color: #4CAF50;
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

/* สไตล์รายการเมนู */
.menus-list {
  margin-top: 40px;
}

.menus-list h3 {
  font-size: 1.6rem;
  margin-bottom: 20px;
  color: #333;
  font-weight: 600;
}

.menus-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.menu-item {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.menu-item:hover {
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

.menu-image.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #aaa;
}

.menu-details {
  padding: 15px;
}

.menu-details h4 {
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
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .form-card {
    padding: 20px;
  }
  
  .menus-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .menu-container {
    padding: 15px;
  }
  
  .form-title {
    font-size: 1.6rem;
  }
  
  .menus-grid {
    grid-template-columns: 1fr;
  }
}
</style>