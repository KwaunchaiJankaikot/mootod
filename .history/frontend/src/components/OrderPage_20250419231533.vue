<template>
  <div class="order-page-container">
    <h2>เลือกเมนูอาหาร</h2>
    <div class="menu-list">
      <div
        v-for="menu in menus"
        :key="menu.id"
        class="menu-card"
        @click="orderMenu(menu)"
      >
        <div class="menu-name">{{ menu.name }}</div>
        <div class="menu-price">{{ menu.price }} บาท</div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "OrderPage",
  data() {
    return {
      menus: [], // เก็บรายการเมนู
    };
  },
  mounted() {
    this.fetchMenus();
  },
  methods: {
    // ฟังก์ชันดึงข้อมูลเมนูอาหารจาก API
    fetchMenus() {
      axios
        .get("http://localhost:5000/menus") // เปลี่ยนเป็น URL ของ API ที่คุณใช้
        .then((response) => {
          this.menus = response.data; // บันทึกข้อมูลเมนูใน state
        })
        .catch((error) => {
          console.error("เกิดข้อผิดพลาดในการดึงข้อมูลเมนู:", error);
        });
    },
    // ฟังก์ชันเมื่อคลิกเมนูอาหารเพื่อทำการสั่ง
    orderMenu(menu) {
      // สร้างการสั่งซื้อที่ต้องการ เช่นส่งไปยัง API
      console.log("สั่งเมนู:", menu);

      // ตัวอย่างการส่งข้อมูลการสั่งซื้อไปยังเซิร์ฟเวอร์ (คุณสามารถปรับใช้ได้ตามต้องการ)
      axios
        .post("http://localhost:5000/orders", {
          menuId: menu.id,
          quantity: 1, // ปรับจำนวนตามต้องการ
        })
        .then((response) => {
          alert("สั่งอาหารเรียบร้อย");
          console.log("ข้อมูลการสั่งซื้อ:", response.data); // ใช้ข้อมูลจาก response
        })
        .catch((error) => {
          console.error("เกิดข้อผิดพลาดในการสั่งอาหาร:", error);
        });
    },
  },
};
</script>

<style scoped>
.order-page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Prompt", "Kanit", sans-serif;
}

h2 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.menu-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
}

.menu-card {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.menu-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.menu-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.menu-price {
  font-size: 16px;
  color: #4caf50;
}
</style>
