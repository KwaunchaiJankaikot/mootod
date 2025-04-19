<template>
  <div class="home-container">
    <header class="header">
      <div class="logo">
        <h1>Mootod <span>อาหาร</span></h1>
      </div>
      <div class="user-menu">
        <button class="user-btn">
          <i class="user-icon">👤</i>
          <span>ผู้ดูแลระบบ</span>
        </button>
      </div>
    </header>

    <div class="menu-cards">
      <!-- แสดงรายการเมนูทั้งหมดที่ดึงมาจาก API -->
      <div v-for="menu in menus" :key="menu.id" class="card" @click="orderMenu(menu)">
        <div class="card-icon">🍽️</div>
        <h3>{{ menu.name }}</h3>
        <p>{{ menu.description }}</p>
        <div class="card-footer">
          <span>{{ menu.price }} บาท</span>
          <button class="card-btn">สั่งอาหาร</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "HomePage",
  data() {
    return {
      menus: []  // เก็บรายการเมนู
    };
  },
  mounted() {
    this.fetchMenus();  // ดึงข้อมูลเมนูเมื่อหน้าโหลด
  },
  methods: {
    // ฟังก์ชันดึงข้อมูลเมนูอาหารจาก API
    fetchMenus() {
      axios.get('http://localhost:5000/menus') // เปลี่ยนเป็น URL ของ API ที่คุณใช้
        .then(response => {
          this.menus = response.data; // บันทึกข้อมูลเมนูใน state
        })
        .catch(error => {
          console.error('เกิดข้อผิดพลาดในการดึงข้อมูลเมนู:', error);
        });
    },
    // ฟังก์ชันเมื่อคลิกเมนูอาหารเพื่อทำการสั่ง
    orderMenu(menu) {
      console.log('สั่งเมนู:', menu);  // คุณสามารถเพิ่มฟังก์ชันเพื่อสั่งเมนูนี้ได้

      // ตัวอย่างการส่งข้อมูลการสั่งซื้อไปยังเซิร์ฟเวอร์
      axios.post('http://localhost:5000/orders', {
        menuId: menu.id,
        quantity: 1,  // ปรับจำนวนตามต้องการ
      })
        .then(response => {
          alert('สั่งอาหารเรียบร้อย');
        })
        .catch(error => {
          console.error('เกิดข้อผิดพลาดในการสั่งอาหาร:', error);
        });
    }
  }
};
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Prompt', 'Kanit', sans-serif;
}

/* การแสดงการ์ดเมนู */
.menu-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
  margin-top: 20px;
}

.card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 36px;
  margin-bottom: 20px;
}

.card h3 {
  font-size: 18px;
  margin: 0 0 12px 0;
  color: #333;
}

.card p {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
  height: 40px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.card-btn:hover {
  background-color: #45a049;
}

</style>
