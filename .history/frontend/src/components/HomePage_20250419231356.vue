<template>
  <div class="home-container">
    <header class="header">
      <div class="logo">
        <img src="@/assets/logo.png" alt="Mootod Logo" v-if="false" />
        <h1>Mootod <span>อาหาร</span></h1>
      </div>
      <div class="user-menu">
        <button class="user-btn">
          <i class="user-icon">👤</i>
          <span>ผู้ดูแลระบบ</span>
        </button>
      </div>
    </header>

    <div class="welcome-banner">
      <div class="banner-content">
        <h2>ยินดีต้อนรับสู่ระบบจัดการร้านอาหาร</h2>
        <p>จัดการเมนูอาหาร ตรวจสอบการสั่งซื้อ และรายงานสรุป</p>
      </div>
    </div>

    <div class="menu-cards">
      <div class="card" @click="goTo('menu')">
        <div class="card-icon">🍽️</div>
        <h3>จัดการเมนู</h3>
        <p>เพิ่ม แก้ไข ลบ และจัดการเมนูอาหารทั้งหมด</p>
        <button class="card-btn">เปิด</button>
      </div>

      <div class="card" @click="goTo('add-menu')">
        <div class="card-icon">➕</div>
        <h3>เพิ่มเมนูใหม่</h3>
        <p>เพิ่มเมนูอาหารใหม่เข้าสู่ระบบพร้อมรูปภาพ</p>
        <button class="card-btn">เปิด</button>
      </div>

      <div class="card" @click="goTo('orders')">
        <div class="card-icon">📋</div>
        <h3>รายการสั่งซื้อ</h3>
        <p>ตรวจสอบและจัดการรายการสั่งซื้อจากลูกค้า</p>
        <button class="card-btn">เปิด</button>
      </div>

      <div class="card" @click="goTo('reports')">
        <div class="card-icon">📊</div>
        <h3>รายงานสรุป</h3>
        <p>ดูรายงานยอดขาย สถิติและข้อมูลสำคัญ</p>
        <button class="card-btn">เปิด</button>
      </div>
    </div>

    <div class="card" @click="goTo('order-page')">
  <div class="card-icon">➕</div>
  <h3>เพิ่มเมนูใหม่</h3>
  <p>เพิ่มเมนูอาหารใหม่เข้าสู่ระบบพร้อมรูปภาพ</p>
  <button class="card-btn">เปิด</button>
</div>


    <div class="quick-stats">
      <h3>สรุปข้อมูลล่าสุด</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <h4>จำนวนเมนู</h4>
          <div class="stat-value">{{ totalMenus }}</div>
          <div class="stat-label">รายการ</div>
        </div>

        <div class="stat-card">
          <h4>ออเดอร์วันนี้</h4>
          <div class="stat-value">0</div>
          <div class="stat-label">รายการ</div>
        </div>

        <div class="stat-card">
          <h4>รายได้วันนี้</h4>
          <div class="stat-value">0</div>
          <div class="stat-label">บาท</div>
        </div>

        <div class="stat-card">
          <h4>ลูกค้าที่ใช้บริการ</h4>
          <div class="stat-value">0</div>
          <div class="stat-label">คน</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "HomePage",
  data() {
    return {
      totalMenus: 0,
    };
  },
  mounted() {
    this.fetchMenuCount();
  },
  methods: {
    goTo(route) {
      switch (route) {
        case "menu":
          this.$router.push("/menu-list");
          break;
        case "add-menu":
          this.$router.push("/add-menu");
          break;
        case "orders":
          this.$router.push("/orders");
          break;
        case "reports":
          this.$router.push("/reports");
          break;
        case "order-page":
          this.$router.push("/order-page");
          break;
        default:
          this.$router.push("/");
      }
    },
    fetchMenuCount() {
      axios
        .get("http://localhost:5000/menus")
        .then((response) => {
          this.totalMenus = response.data.length;
        })
        .catch((error) => {
          console.error("เกิดข้อผิดพลาดในการดึงข้อมูลเมนู:", error);
          this.totalMenus = 0;
        });
    },
  },
};
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Prompt", "Kanit", sans-serif;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eaeaea;
}

.logo {
  display: flex;
  align-items: center;
}

.logo h1 {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.logo span {
  color: #4caf50;
}

.logo img {
  height: 40px;
  margin-right: 10px;
}

.user-menu {
  display: flex;
  align-items: center;
}

.user-btn {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-btn:hover {
  background: #eaeaea;
}

.user-icon {
  margin-right: 5px;
  font-size: 18px;
}

/* Welcome Banner */
.welcome-banner {
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  border-radius: 12px;
  padding: 40px;
  margin-bottom: 40px;
  color: white;
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
}

.banner-content h2 {
  font-size: 28px;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.banner-content p {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
}

/* Menu Cards */
.menu-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
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

.card-btn {
  background-color: #4caf50;
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

/* Quick Stats */
.quick-stats {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.quick-stats h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-card h4 {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin: 0 0 10px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #888;
}

/* Responsive */
@media (max-width: 768px) {
  .menu-cards {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  .welcome-banner {
    padding: 30px;
  }

  .banner-content h2 {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .home-container {
    padding: 15px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .user-menu {
    margin-top: 15px;
  }

  .menu-cards {
    grid-template-columns: 1fr;
  }

  .welcome-banner {
    padding: 20px;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>