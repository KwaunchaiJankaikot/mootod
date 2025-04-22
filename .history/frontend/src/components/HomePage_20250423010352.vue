<template>
  <div class="home-container">
    <header class="header">
      <div class="logo">
        <img src="@/assets/logo.png" alt="Mootod Logo" v-if="false" />
        <h1>Mootod <span>อาหาร</span></h1>
      </div>
      <div class="right-menu">
        <div class="cart-icon" @click="toggleCart">
          <span>🛒</span>
          <span class="cart-badge" v-if="cartItems.length > 0">{{
            cartItems.length
          }}</span>
        </div>
        <button class="user-btn">
          <i class="user-icon">👤</i>
          <span>ผู้ดูแลระบบ</span>
        </button>
      </div>
    </header>

    <!-- ตะกร้าสินค้า -->
    <CartSidebar
      :cartItems="cartItems"
      :isCartOpen="isCartOpen"
      @close-cart="toggleCart"
      @remove-item="removeFromCart"
      @increase-quantity="increaseQuantity"
      @decrease-quantity="decreaseQuantity"
      @go-to-checkout="goToCheckout"
    />

    <!-- หน้าชำระเงิน -->
    <CheckoutPage
      v-if="isCheckoutModalOpen"
      :cartItems="cartItems"
      @close-checkout="closeCheckoutModal"
      @payment-success="handlePaymentSuccess"
    />

    <div class="welcome-banner">
      <div class="banner-content">
        <h2>ยินดีต้อนรับสู่ระบบจัดการร้านอาหาร</h2>
        <p>จัดการเมนูอาหาร ตรวจสอบการสั่งซื้อ และรายงานสรุป</p>
      </div>
    </div>

    <!-- แสดงรายการเมนู -->
    <h3 class="section-title">เมนูแนะนำ</h3>
    <div class="menu-cards">
      <div v-for="menu in menus" :key="menu.id" class="menu-card">
        <div class="card-image-container">
          <img :src="menu.image_url" alt="เมนูอาหาร" class="card-image" />
        </div>
        <div class="card-content">
          <h3>{{ menu.name }}</h3>
          <p>{{ menu.description }}</p>
          <div class="card-footer">
            <span class="price">{{ menu.price }} บาท</span>
            <button class="card-btn" @click="addToCart(menu)">สั่งอาหาร</button>
          </div>
          <button class="view-btn" @click="viewAllMenus">ดูเมนูทั้งหมด</button>
        </div>
      </div>
    </div>

    <!-- ส่วนอื่นๆ ของหน้าจัดการ -->
    <h3 class="section-title">เครื่องมือจัดการ</h3>
    <div class="admin-cards">
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

      <div class="card" @click="goTo('inventorypage')">
        <div class="card-icon">🧺</div>
        <h3>จัดการวัตถุดิบ</h3>
        <p>ตรวจสอบคงคลัง เพิ่มวัตถุดิบ และจัดการสต็อก</p>
        <button class="card-btn">เปิด</button>
      </div>
    </div>

    <div class="quick-stats">
      <h3>สรุปข้อมูลล่าสุด</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <h4>จำนวนเมนู</h4>
          <div class="stat-value">{{ totalMenus || menus.length }}</div>
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
import CartSidebar from "@/components/CartSidebar.vue";
import CheckoutPage from "@/components/CheckoutPage.vue";

export default {
  name: "HomePage",
  components: {
    CartSidebar,
    CheckoutPage
  },
  data() {
    return {
      menus: [],
      totalMenus: 0,
      cartItems: [],
      isCartOpen: false,
      isCheckoutModalOpen: false,
    };
  },
  mounted() {
    this.fetchMenus();
    // โหลดข้อมูลตะกร้าจาก localStorage (ถ้ามี)
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
    }
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
         case "inventorypage":
          this.$router.push("/inventorypage");
          break;  
        default:
          this.$router.push("/");
      }
    },
    fetchMenus() {
      axios
        .get("http://localhost:5000/menus") // เปลี่ยนเป็น URL ของ API ที่คุณใช้
        .then((response) => {
          this.menus = response.data; // บันทึกข้อมูลเมนูใน state
          this.totalMenus = this.menus.length;
        })
        .catch((error) => {
          console.error("เกิดข้อผิดพลาดในการดึงข้อมูลเมนู:", error);
          this.totalMenus = this.menus.length;
        });
    },
    // ฟังก์ชันเกี่ยวกับตะกร้าสินค้า
    addToCart(menu) {
      // ตรวจสอบว่ามีรายการนี้ในตะกร้าหรือไม่
      const existingItem = this.cartItems.find((item) => item.id === menu.id);

      if (existingItem) {
        // ถ้ามีอยู่แล้ว เพิ่มจำนวน
        existingItem.quantity += 1;
      } else {
        // ถ้ายังไม่มี เพิ่มรายการใหม่พร้อมจำนวน = 1
        this.cartItems.push({
          ...menu,
          quantity: 1,
        });
      }

      // บันทึกลง localStorage
      this.saveCart();

      // เปิดตะกร้าสินค้า
      this.isCartOpen = true;
    },
    toggleCart() {
      this.isCartOpen = !this.isCartOpen;
    },
    removeFromCart(index) {
      this.cartItems.splice(index, 1);
      this.saveCart();
    },
    increaseQuantity(index) {
      this.cartItems[index].quantity += 1;
      this.saveCart();
    },
    decreaseQuantity(index) {
      if (this.cartItems[index].quantity > 1) {
        this.cartItems[index].quantity -= 1;
      } else {
        // ถ้าเหลือแค่ 1 ชิ้น แล้วกดลด ให้ลบรายการออกจากตะกร้า
        this.removeFromCart(index);
      }
      this.saveCart();
    },
    saveCart() {
      localStorage.setItem("cart", JSON.stringify(this.cartItems));
    },
    // ฟังก์ชันเกี่ยวกับการชำระเงิน
    goToCheckout() {
      this.isCheckoutModalOpen = true;
      this.isCartOpen = false; // ปิดตะกร้าเมื่อไปที่หน้าชำระเงิน
    },
    closeCheckoutModal() {
      this.isCheckoutModalOpen = false;
    },
    handlePaymentSuccess() {
      // ล้างตะกร้า
      this.cartItems = [];
      this.saveCart();
      // ปิดหน้าชำระเงิน (จะถูกจัดการโดย CheckoutPage component แล้ว)
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
  background-color: #f9f9f9;
  position: relative;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

.right-menu {
  display: flex;
  align-items: center;
  gap: 15px;
}

.cart-icon {
  position: relative;
  cursor: pointer;
  font-size: 24px;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #f44336;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  padding: 30px;
  margin-bottom: 30px;
  color: white;
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
}

.banner-content h2 {
  font-size: 24px;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.banner-content p {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
}

/* Section Titles */
.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-top: 30px;
  margin-bottom: 20px;
  border-left: 4px solid #4caf50;
  padding-left: 10px;
}

/* Menu Cards - แสดงเมนูอาหาร */
.menu-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.menu-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.menu-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.card-image-container {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.menu-card:hover .card-image {
  transform: scale(1.05);
}

.card-content {
  padding: 15px;
}

.card-content h3 {
  font-size: 18px;
  margin: 0 0 8px 0;
  color: #333;
}

.card-content p {
  font-size: 14px;
  color: #666;
  margin: 0 0 15px 0;
  height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-weight: 600;
  color: #4caf50;
}

/* Admin Cards - การ์ดจัดการระบบ */
.admin-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: white;
  border-radius: 10px;
  padding: 20px;
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
  font-size: 32px;
  margin-bottom: 15px;
}

.card h3 {
  font-size: 18px;
  margin: 0 0 10px 0;
  color: #333;
}

.card p {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
  height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
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
  gap: 15px;
}

.stat-card {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  border-top: 3px solid #4caf50;
}

.stat-card h4 {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin: 0 0 10px 0;
}

.stat-value {
  font-size: 24px;
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
  .menu-cards,
  .admin-cards {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }

  .welcome-banner {
    padding: 25px;
  }

  .banner-content h2 {
    font-size: 22px;
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

  .right-menu {
    margin-top: 15px;
    width: 100%;
    justify-content: space-between;
  }

  .menu-cards,
  .admin-cards {
    grid-template-columns: 1fr;
  }

  .welcome-banner {
    padding: 20px;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .card-image-container {
    height: 160px;
  }
}
</style>