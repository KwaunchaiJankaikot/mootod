<template>
  <header class="header">
    <div class="logo">
      <img src="@/assets/logo.png" alt="Mootod Logo" v-if="false" />
      <h1 hre>Mootod <span>อาหาร</span></h1>
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
</template>

<script>
export default {
  name: "HeaderNavbar",
  props: {
    // ถ้าต้องการส่งค่าจาก parent component
  },
  data() {
    return {
      cartItems: []
    };
  },
  mounted() {
    // โหลดข้อมูลตะกร้าจาก localStorage (ถ้ามี)
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
    }
  },
  methods: {
    toggleCart() {
      // ส่ง emit เพื่อให้ parent component จัดการการแสดงตะกร้า
      this.$emit('toggle-cart');
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