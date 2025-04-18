axios.get('http://localhost:5000/menus')
  .then(response => {
    // ถ้าคุณไม่ใช้ response ในที่นี้ ให้ลบหรือไม่ใช้
    this.menus = response.data;
  })
  .catch(error => {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลเมนู:', error);
  });

<template>
  <div>
    <h2>เพิ่มเมนูอาหาร</h2>
    <form @submit.prevent="uploadMenu">
      <div>
        <label for="name">ชื่อเมนู:</label>
        <input type="text" id="name" v-model="menu.name" required />
      </div>

      <div>
        <label for="description">รายละเอียด:</label>
        <textarea id="description" v-model="menu.description" required></textarea>
      </div>

      <div>
        <label for="price">ราคา:</label>
        <input type="number" id="price" v-model="menu.price" required />
      </div>

      <div>
        <label for="image">อัปโหลดรูปภาพ:</label>
        <input type="file" id="image" @change="onImageChange" required />
      </div>

      <button type="submit">เพิ่มเมนู</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      menu: {
        name: '',
        description: '',
        price: 0,
        image: null
      }
    };
  },
  methods: {
    onImageChange(event) {
      this.menu.image = event.target.files[0];  // เก็บไฟล์รูปที่อัปโหลด
    },
    uploadMenu() {
      const formData = new FormData();
      formData.append('name', this.menu.name);
      formData.append('description', this.menu.description);
      formData.append('price', this.menu.price);
      formData.append('image', this.menu.image);

      axios.post('http://localhost:5000/upload', formData)
        .then(response => {
          alert('เมนูถูกเพิ่มสำเร็จ!');
          this.menu.name = '';
          this.menu.description = '';
          this.menu.price = 0;
          this.menu.image = null;
        })
        .catch(error => {
          console.error('เกิดข้อผิดพลาด:', error);
        });
    }
  }
};
</script>

<style scoped>
/* สไตล์ฟอร์ม */
form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input, textarea {
  padding: 8px;
  font-size: 14px;
  margin: 5px 0;
}

button {
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
