<template>
  <div class="cart-container">
    <div class="cart-header">
      <h1>ตะกร้าสั่งซื้อ</h1>
      <button class="back-btn" @click="goBack">
        <i class="back-icon">←</i> กลับไปเลือกเมนู
      </button>
    </div>

    <div v-if="cartItems.length === 0" class="empty-cart">
      <div class="empty-cart-icon">🛒</div>
      <h2>ตะกร้าของคุณว่างเปล่า</h2>
      <p>กรุณาเลือกเมนูอาหารเพื่อเพิ่มลงในตะกร้า</p>
      <button class="browse-menu-btn" @click="goToMenuOrder">เลือกเมนูเลย</button>
    </div>

    <div v-else class="cart-content">
      <div class="cart-items">
        <div v-for="item in cartItems" :key="item.id" class="cart-item">
          <div class="item-image">
            <img :src="item.image_url" :alt="item.name" />
          </div>
          <div class="item-details">
            <h3 class="item-name">{{ item.name }}</h3>
            <div class="item-price">{{ item.price }} บาท</div>
          </div>
          <div class="item-quantity">
            <div class="quantity-controls">
              <button class="quantity-btn" @click="decreaseQuantity(item)">-</button>
              <span class="quantity">{{ item.quantity }}</span>
              <button class="quantity-btn" @click="increaseQuantity(item)">+</button>
            </div>
            <div class="item-subtotal">
              รวม: {{ (item.price * item.quantity).toFixed(2) }} บาท
            </div>
          </div>
          <button class="remove-btn" @click="removeItem(item)">
            <i class="remove-icon">×</i>
          </button>
        </div>
      </div>

      <div class="cart-summary">
        <div class="summary-header">
          <h2>สรุปคำสั่งซื้อ</h2>
        </div>
        <div class="summary-details">
          <div class="summary-row">
            <span>จำนวนรายการ:</span>
            <span>{{ totalItems }} รายการ</span>
          </div>
          <div class="summary-row">
            <span>ราคารวม:</span>
            <span>{{ totalPrice.toFixed(2) }} บาท</span>
          </div>
          <div class="summary-row discount" v-if="discount > 0">
            <span>ส่วนลด:</span>
            <span>-{{ discount.toFixed(2) }} บาท</span>
          </div>
          <div class="summary-total">
            <span>ยอดรวมสุทธิ:</span>
            <span>{{ finalPrice.toFixed(2) }} บาท</span>
          </div>
        </div>
        <div class="summary-actions">
          <div class="promo-code">
            <input
              type="text"
              v-model="promoCode"
              placeholder="ใส่โค้ดส่วนลด"
              class="promo-input"
            />
            <button class="apply-btn" @click="applyPromoCode">ใช้โค้ด</button>
          </div>
          <button class="checkout-btn" @click="checkout">
            ยืนยันการสั่งซื้อ
          </button>
          <button class="clear-cart-btn" @click="clearCart">
            ล้างตะกร้า
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CartPage',
  data() {
    return {
      cartItems: [],
      promoCode: '',
      discount: 0,
      promoApplied: false,
    };
  },
  computed: {
    totalItems() {
      return this.cartItems.reduce((total, item) => total + item.quantity, 0);
    },
    totalPrice() {
      return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    finalPrice() {
      return Math.max(0, this.totalPrice - this.discount);
    }
  },
  created() {
    this.loadCartFromLocalStorage();
  },
  methods: {
    loadCartFromLocalStorage() {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        this.cartItems = JSON.parse(storedCart);
      }
    },
    saveCartToLocalStorage() {
      localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    },
    increaseQuantity(item) {
      item.quantity += 1;
      this.saveCartToLocalStorage();
    },
    decreaseQuantity(item) {
      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        this.removeItem(item);
      }
      this.saveCartToLocalStorage();
    },
    removeItem(item) {
      const index = this.cartItems.findIndex(cartItem => cartItem.id === item.id);
      if (index !== -1) {
        this.cartItems.splice(index, 1);
        this.saveCartToLocalStorage();
      }
    },
    clearCart() {
      if (confirm('คุณแน่ใจหรือไม่ที่จะล้างตะกร้าทั้งหมด?')) {
        this.cartItems = [];
        this.discount = 0;
        this.promoApplied = false;
        this.promoCode = '';
        this.saveCartToLocalStorage();
      }
    },
    applyPromoCode() {
      // ตัวอย่างโค้ดส่วนลดอย่างง่าย
      const promoCodes = {
        'WELCOME10': 10,
        'SAVE15': 15,
        'SPECIAL20': 20
      };
      
      if (this.promoCode && promoCodes[this.promoCode.toUpperCase()] && !this.promoApplied) {
        const discountPercent = promoCodes[this.promoCode.toUpperCase()];
        this.discount = (this.totalPrice * discountPercent) / 100;
        this.promoApplied = true;
        alert(`ใช้โค้ดส่วนลด ${discountPercent}% สำเร็จ!`);
      } else if (this.promoApplied) {
        alert('คุณได้ใช้โค้ดส่วนลดไปแล้ว');
      } else {
        alert('โค้ดส่วนลดไม่ถูกต้อง');
      }
    },
    checkout() {
      // ในระบบจริงควรส่งข้อมูลไปยัง backend เพื่อบันทึกออเดอร์
      alert('ขอบคุณสำหรับการสั่งซื้อ! กรุณารอรับอาหารของคุณ');
      this.cartItems = [];
      this.discount = 0;
      this.promoApplied = false;
      this.promoCode = '';
      this.saveCartToLocalStorage();
      // อาจจะนำทางไปยังหน้าสรุปคำสั่งซื้อหรือหน้าขอบคุณ
      // this.$router.push('/order-confirmation');
    },
    goBack() {
      this.$router.go(-1);
    },
    goToMenuOrder() {
      this.$router.push('/menu-order');
    }
  }
};
</script>

<style scoped>
.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Prompt', 'Kanit', sans-serif;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.cart-header h1 {
  font-size: 28px;
  color: #333;
  margin: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background-color: #e9ecef;
}

.back-icon {
  margin-right: 8px;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 60px 0;
  text-align: center;
}

.empty-cart-icon {
  font-size: 60px;
  margin-bottom: 20px;
  color: #ccc;
}

.empty-cart h2 {
  margin-bottom: 10px;
  color: #333;
}

.empty-cart p {
  color: #666;
  margin-bottom: 30px;
}

.browse-menu-btn {
  padding: 12px 24px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.browse-menu-btn:hover {
  background-color: #45a049;
}

.cart-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.cart-items {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.cart-item {
  display: flex;
  padding: 20px;
  border-bottom: 1px solid #eee;
  position: relative;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 20px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-name {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #333;
}

.item-price {
  color: #666;
  font-size: 16px;
}

.item-quantity {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  margin-right: 40px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.quantity-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  transition: all 0.3s;
}

.quantity-btn:hover {
  background-color: #f5f5f5;
}

.quantity {
  margin: 0 10px;
  font-weight: 500;
  min-width: 25px;
  text-align: center;
}

.item-subtotal {
  font-weight: 500;
  color: #4caf50;
}

.remove-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background-color: #f8f9fa;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 18px;
}

.remove-btn:hover {
  background-color: #f44336;
  color: white;
}

.cart-summary {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
}

.summary-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.summary-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.summary-details {
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 16px;
  color: #555;
}

.summary-row.discount {
  color: #f44336;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  padding-top: 15px;
  border-top: 1px solid #eee;
  font-weight: bold;
  font-size: 18px;
  color: #333;
}

.summary-actions {
  margin-top: 30px;
}

.promo-code {
  display: flex;
  margin-bottom: 20px;
}

.promo-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px 0 0 6px;
  font-size: 14px;
  outline: none;
}

.promo-input:focus {
  border-color: #4caf50;
}

.apply-btn {
  padding: 10px 15px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.apply-btn:hover {
  background-color: #45a049;
}

.checkout-btn {
  width: 100%;
  padding: 14px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-bottom: 10px;
}

.checkout-btn:hover {
  background-color: #45a049;
}

.clear-cart-btn {
  width: 100%;
  padding: 12px;
  background-color: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.clear-cart-btn:hover {
  background-color: #f44336;
  color: white;
  border-color: #f44336;
}
style>