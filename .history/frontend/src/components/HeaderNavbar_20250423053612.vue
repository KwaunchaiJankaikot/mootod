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
  props: {
    // รับค่าจำนวนสินค้าในตะกร้าจาก parent component
    cartItems: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    // คำนวณจำนวนสินค้าในตะกร้า (นับรวมจำนวนแต่ละรายการ)
    cartItemCount() {
      return this.cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
    }
  },
  methods: {
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