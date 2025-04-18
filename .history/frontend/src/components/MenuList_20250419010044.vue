<template>
  <div class="edit-menu-container">
    <div class="form-card">
      <h2 class="form-title">แก้ไขเมนูอาหาร</h2>
      <form @submit.prevent="updateMenu">
        <!-- ชื่อเมนู -->
        <div class="form-group">
          <label for="name">ชื่อเมนู</label>
          <input
            type="text"
            id="name"
            v-model="menu.name"
            required
            class="form-control"
            placeholder="ใส่ชื่อเมนูอาหาร"
          />
        </div>

        <!-- รายละเอียด -->
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

        <!-- ราคา -->
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

        <!-- หมวดหมู่อาหาร -->
        <div class="form-group">
          <label for="category">หมวดหมู่</label>
          <select
            id="category"
            v-model="menu.category"
            required
            class="form-control"
          >
            <option value="อาหารหลัก">อาหารหลัก</option>
            <option value="ของหวาน">ของหวาน</option>
            <option value="ข้าว">ข้าว</option>
            <option value="ผลไม้">ผลไม้</option>
          </select>
        </div>

        <!-- อัปโหลดรูปภาพ -->
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
            accept="image/*"
            class="file-input"
          />
        </div>

        <button type="submit" class="submit-button">
          <span>อัปเดตเมนู</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      menu: {
        id: '',
        name: '',
        description: '',
        price: 0,
        category: 'อาหารหลัก',  // ค่าเริ่มต้น
        image: null,
        imageName: '',
      },
    };
  },
  mounted() {
    this.fetchMenu();
  },
  methods: {
    fetchMenu() {
      const menuId = this.$route.params.id;
      axios
        .get(`http://localhost:5000/menus/${menuId}`)
        .then(response => {
          const menu = response.data;
          this.menu.id = menu.id;
          this.menu.name = menu.name;
          this.menu.description = menu.description;
          this.menu.price = menu.price;
          this.menu.category = menu.category;  // ดึงหมวดหมู่ออกมา
          this.menu.imageName = menu.image_url.split('/').pop();
        })
        .catch(error => {
          console.error('ไม่สามารถดึงข้อมูลเมนูได้:', error);
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
    updateMenu() {
      const formData = new FormData();
      formData.append('name', this.menu.name);
      formData.append('description', this.menu.description);
      formData.append('price', this.menu.price);
      formData.append('category', this.menu.category);  // เพิ่มหมวดหมู่ใน FormData
      formData.append('image', this.menu.image);

      axios
        .put(`http://localhost:5000/menus/${this.menu.id}`, formData)
        .then(() => {
          alert('อัปเดตเมนูสำเร็จ!');
          this.$router.push('/menu-list');
        })
        .catch(error => {
          console.error('เกิดข้อผิดพลาดในการอัปเดตเมนู:', error);
          alert('เกิดข้อผิดพลาดในการอัปเดตเมนู');
        });
    },
  },
};
</script>

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
  height: 400px; /* กำหนดความสูงของการ์ด */
  display: flex;
  flex-direction: column;
}

.menu-image {
  height: 200px; 
  overflow: hidden;
  background-color: #f9f9f9;
  /* border: 10px solid red; */
  
}

.menu-image img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* ทำให้ภาพไม่เบี้ยวและไม่ขยายเกินขอบการ์ด */
}

.menu-info {
  padding: 15px;
  flex-grow: 1; /* ทำให้เนื้อหาภายในการ์ดเติบโตเต็มที่ */
}

.menu-actions {
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
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

.delete-btn {
  background-color: #f44336;
  color: white;
}

.menu-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
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
.no-image {
  display: flex; 
  justify-content: center; 
  align-items: center; 
  height: 100%; 
  font-size: 16px;
  color: #aaa;
}

.form-group select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border 0.3s ease;
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
