<template>
  <div class="menu-container">
    <div class="form-card">
      <h2 class="form-title">เพิ่มเมนูอาหาร</h2>
      <form @submit.prevent="uploadMenu">
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
            <img :src="item.image_url" :alt="item.name" />
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
import axios from "axios";

export default {
  data() {
    return {
      menus: [],
      menu: {
        name: "",
        description: "",
        price: 0,
        image: null,
      },
      imageName: "",
    };
  },
  mounted() {
    this.fetchMenus();
  },
  methods: {
    fetchMenus() {
      axios
        .get("http://localhost:5000/menus")
        .then((response) => {
          this.menus = response.data;
        })
        .catch((error) => {
          console.error(
            "เกิดข้อผิดพลาด:",
            error.response ? error.response.data : error
          );
          alert("เกิดข้อผิดพลาดในการเพิ่มเมนู กรุณาลองใหม่อีกครั้ง");
        });
    },
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
    uploadMenu() {
      const formData = new FormData();
      formData.append("name", this.menu.name);
      formData.append("description", this.menu.description);
      formData.append("price", this.menu.price);
      formData.append("image", this.menu.image);

      // แสดง loading state ได้ตรงนี้

      axios
        .post("http://localhost:5000/upload", formData)
        .then(() => {
          // แสดง notification แบบสวยงาม
          alert("เมนูถูกเพิ่มสำเร็จ!");

          // ล้างฟอร์ม
          this.menu.name = "";
          this.menu.description = "";
          this.menu.price = 0;
          this.menu.image = null;
          this.imageName = "";

          // ดึงข้อมูลเมนูใหม่
          this.fetchMenus();
        })
        .catch((error) => {
          console.error("เกิดข้อผิดพลาด:", error);
          alert("เกิดข้อผิดพลาดในการเพิ่มเมนู กรุณาลองใหม่อีกครั้ง");
        });
    },
  },
};
</script>
