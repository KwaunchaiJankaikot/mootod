<template>
  <header class="header">
    <div class="logo" @click="goToHome">
      <img src="@/assets/logo.png" alt="Mootod Logo" v-if="false" />
      <h1>Mootod <span>อาหาร</span></h1>
    </div>
    <div class="right-menu">
      <div class="cart-icon" @click="toggleCartEvent">
        <span>🛒</span>
        <span class="cart-badge" v-if="cartItemCount > 0">{{
          cartItemCount
        }}</span>
      </div>
      <button class="user-btn">
        <i class="user-icon">👤</i>
        <span>ผู้ดูแลระบบ</span>
      </button>
    </div>
  </header>
</template>

<script>
export default {
  name: "HeaderNavbar",
  data() {
    return {
      cartItems: []
    };
  },
  computed: {
    // คำนวณจำนวนสินค้าในตะกร้า (นับรวมจำนวนแต่ละรายการ)
    cartItemCount() {
      return this.cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
    }
  },
  mounted() {
    // โหลดข้อมูลตะกร้าจาก localStorage ตอนโหลดหน้า
    this.loadCartFromLocalStorage();
    
    // ติดตั้ง event listener เพื่อตรวจจับการเปลี่ยนแปลงใน localStorage
    window.addEventListener('storage', this.handleStorageChange);
  },
  beforeDestroy() {
    // ลบ event listener เมื่อ component ถูกทำลาย
    window.removeEventListener('storage', this.handleStorageChange);
  },
  methods: {
    // โหลดข้อมูลตะกร้าจาก localStorage
    loadCartFromLocalStorage() {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        this.cartItems = JSON.parse(savedCart);
      }
    },
    
    // จัดการเมื่อมีการเปลี่ยนแปลงใน localStorage
    handleStorageChange(event) {
      if (event.key === 'cart') {
        this.loadCartFromLocalStorage();
      }
    },
    
    // ส่ง event เมื่อกดปุ่มตะกร้า
    toggleCartEvent() {
      this.$emit('toggle-cart');
    },
    
    // นำทางกลับไปหน้าหลัก
    goToHome() {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
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
  cursor: pointer; /* เพิ่ม cursor: pointer เมื่อชี้ที่โลโก้ */
  transition: opacity 0.2s; /* เพิ่ม transition effect */
}

.logo:hover {
  opacity: 0.8; /* ทำให้โลโก้จางลงเล็กน้อยเมื่อชี้ */
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
  transition: transform 0.2s; /* เพิ่ม transition effect */
}

.cart-icon:hover {
  transform: scale(1.1); /* ทำให้ไอคอนตะกร้าขยายเล็กน้อยเมื่อชี้ */
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

@media (max-width: 480px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .right-menu {
    margin-top: 15px;
    width: 100%;
    justify-content: space-between;
  }
}
</style>