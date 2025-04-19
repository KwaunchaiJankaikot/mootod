<template>
  <div class="cart-sidebar" :class="{ 'cart-active': isCartOpen }">
    <div class="cart-header">
      <h3>ตะกร้าสินค้า</h3>
      <button class="close-btn" @click="closeCart">✕</button>
    </div>
    
    <div v-if="cartItems.length === 0" class="empty-cart">
      <span>🛒</span>
      <p>ไม่มีรายการในตะกร้า</p>
    </div>
    
    <div v-else class="cart-items">
      <div v-for="(item, index) in cartItems" :key="index" class="cart-item">
        <div class="cart-item-img">
          <img :src="item.image_url" alt="เมนูอาหาร" />
        </div>
        <div class="cart-item-info">
          <h4>{{ item.name }}</h4>
          <div class="item-price">{{ item.price }} บาท</div>
        </div>
        <div class="cart-item-actions">
          <button class="qty-btn" @click="decreaseQuantity(index)">-</button>
          <span class="item-qty">{{ item.quantity }}</span>
          <button class="qty-btn" @click="increaseQuantity(index)">+</button>
          <button class="remove-btn" @click="removeFromCart(index)">
            ลบ
          </button>
        </div>
      </div>
    </div>
    
    <div class="cart-summary" v-if="cartItems.length > 0">
      <div class="summary-row">
        <span>ยอดรวม:</span>
        <span class="summary-price">{{ calculateTotal() }} บาท</span>
      </div>
      <button class="checkout-btn" @click="goToCheckout">ไปชำระเงิน</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "CartSidebar",
  props: {
    cartItems: {
      type: Array,
      required: true
    },
    isCartOpen: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    closeCart() {
      this.$emit('close-cart');
    },
    removeFromCart(index) {
      this.$emit('remove-item', index);
    },
    increaseQuantity(index) {
      this.$emit('increase-quantity', index);
    },
    decreaseQuantity(index) {
      this.$emit('decrease-quantity', index);
    },
    calculateTotal() {
      return this.cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    },
    goToCheckout() {
      this.$emit('go-to-checkout');
    }
  }
};
</script>

<style scoped>
/* Cart Sidebar */
.cart-sidebar {
  position: fixed;
  top: 0;
  right: -350px;
  width: 350px;
  height: 100vh;
  background-color: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
}

.cart-active {
  right: 0;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eaeaea;
}

.cart-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #777;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  color: #777;
}

.empty-cart span {
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.5;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.cart-item {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid #eaeaea;
  margin-bottom: 10px;
}

.cart-item-img {
  width: 60px;
  height: 60px;
  overflow: hidden;
  border-radius: 6px;
  margin-right: 10px;
}

.cart-item-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item-info {
  flex: 1;
}

.cart-item-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.item-price {
  color: #4caf50;
  font-weight: 500;
}

.cart-item-actions {
  display: flex;
  align-items: center;
  gap: 5px;
}

.qty-btn {
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.item-qty {
  width: 20px;
  text-align: center;
}

.remove-btn {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 12px;
  cursor: pointer;
  margin-left: 5px;
}

.cart-summary {
  padding: 15px;
  border-top: 1px solid #eaeaea;
  background-color: #f9f9f9;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-weight: 500;
}

.summary-price {
  color: #4caf50;
  font-size: 18px;
  font-weight: 600;
}

.checkout-btn {
  width: 100%;
  padding: 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.checkout-btn:hover {
  background-color: #45a049;
}

@media (max-width: 768px) {
  .cart-sidebar {
    width: 300px;
  }
}

@media (max-width: 480px) {
  .cart-sidebar {
    width: 85%;
  }
}
</style>