<template>
  <div class="edit-menu-container">
    <div class="form-card">
      <h2 class="form-title">แก้ไขเมนูอาหาร</h2>
      <!-- ฟอร์ม -->
      <form @submit.prevent="updateMenu">
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

        <!-- รูปภาพ -->
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

        <!-- แสดงรูปเดิมหากมีอยู่ -->
        <div v-if="menu.image_url && !menu.image" class="existing-image">
          <p>รูปภาพปัจจุบัน:</p>
          <div class="action">
            <img
              :src="menu.image_url"
              alt="Current Image"
              class="current-image"
            />
            <!-- ปุ่มลบรูปภาพ -->
            <button type="button" @click="deleteImage" class="delete-image-btn">
              ลบรูปภาพ
            </button>
          </div>
        </div>

        <!-- ปุ่มอัปเดตเมนู -->
        <button type="submit" class="submit-button">
          <span>อัปเดตเมนู</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      menu: {
        id: "",
        name: "",
        description: "",
        price: 0,
        image: null,
        imageName: "",
        image_url: "", // สำหรับเก็บ URL ของภาพที่มีอยู่ในฐานข้อมูล
      },
    };
  },
mounted() {
  this.fetchMenu();
},
methods: {
  fetchMenu() {
    const menuId = this.$route.params.id; // ดึง ID จาก URL
    axios
      .get(`http://localhost:5000/menus/${menuId}`)
      .then((response) => {
        console.log(response.data); // เช็คข้อมูลที่ได้รับ
        const menu = response.data;
        this.menu.id = menu.id;
        this.menu.name = menu.name;
        this.menu.description = menu.description;
        this.menu.price = menu.price;
        this.menu.image_url = menu.image_url;
        this.menu.category = menu.category;
      })
      .catch((error) => {
        console.error("ไม่สามารถดึงข้อมูลเมนูได้:", error);
      });
  },

,
    // ฟังก์ชันจัดการไฟล์ภาพที่อัปโหลด
    onImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.menu.image = file;
        this.imageName = file.name;
      } else {
        this.menu.image = null;
        this.imageName = "";
      }
    },
    // ฟังก์ชันลบรูปภาพ
    deleteImage() {
      // ถ้ามีการคลิกปุ่มลบ จะลบภาพจาก menu และ image_url
      this.menu.image = null;
      this.menu.imageName = "";
      this.menu.image_url = "";
    },
    // ฟังก์ชันอัปเดตเมนู
    updateMenu() {
      const formData = new FormData();
      formData.append("name", this.menu.name);
      formData.append("description", this.menu.description);
      formData.append("price", this.menu.price);
      formData.append("image", this.menu.image);

      axios
        .put(`http://localhost:5000/menus/${this.menu.id}`, formData)
        .then(() => {
          alert("อัปเดตเมนูสำเร็จ!");
          this.$router.push("/menu-list"); // กลับไปยังหน้ารายการเมนู
        })
        .catch((error) => {
          console.error("เกิดข้อผิดพลาดในการอัปเดตเมนู:", error);
          alert("เกิดข้อผิดพลาดในการอัปเดตเมนู");
        });
    },
  },
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
.existing-image {
  margin-top: 15px;
}

.current-image {
  width: 30%;
  max-height: auto;
  object-fit: cover;
  border-radius: 6px;
}

.delete-image-btn {
  display: block;
  width: 100%;
  padding: 14px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.15s ease;
}

.delete-image-btn:hover {
  background-color: #d32f2f;
}
.action {
  display: flex;
  flex-direction: column; /* เปลี่ยนให้เป็นแนวตั้ง */
  gap: 10px; /* เพิ่มช่องว่างระหว่างปุ่ม */
}
</style>
