<template>
  <div class="home-container">
    <header class="header">
      <div class="logo">
        <img src="@/assets/logo.png" alt="Mootod Logo" v-if="false" />
        <h1>Mootod <span>อาหาร</span></h1>
      </div>
      <div class="right-menu">
        <div class="cart-icon" @click="toggleCart">
         <i class="fa-solid fa-cart-shopping"></i>
          <span class="cart-badge" v-if="cartItems.length > 0">{{ cartItems.length }}</span>
        </div>
        <button class="user-btn">
          <i class="user-icon">👤</i>
          <span>ผู้ดูแลระบบ</span>
        </button>
      </div>
    </header>

    <!-- ตะกร้าสินค้า - มองเห็นเมื่อคลิกที่ไอคอนตะกร้า -->
    <div class="cart-sidebar" :class="{ 'cart-active': isCartOpen }">
      <div class="cart-header">
        <h3>ตะกร้าสินค้า</h3>
        <button class="close-btn" @click="toggleCart">✕</button>
      </div>
      
      <div v-if="cartItems.length === 0" class="empty-cart">
        <span class="material-icons cart-empty-icon">shopping_cart</span>
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
            <button class="remove-btn" @click="removeFromCart(index)">ลบ</button>
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
    
    <!-- โมดาลชำระเงิน -->
    <div class="modal-overlay" v-if="isCheckoutModalOpen" @click.self="closeCheckoutModal">
      <div class="checkout-modal">
        <div class="modal-header">
          <h3>ชำระเงิน</h3>
          <button class="close-btn" @click="closeCheckoutModal">✕</button>
        </div>
        
        <div class="checkout-content">
          <h4>รายการสั่งซื้อ</h4>
          <div class="checkout-items">
            <div v-for="(item, index) in cartItems" :key="index" class="checkout-item">
              <span>{{ item.name }} x{{ item.quantity }}</span>
              <span>{{ item.price * item.quantity }} บาท</span>
            </div>
          </div>
          
          <div class="checkout-total">
            <h4>ยอดรวมทั้งสิ้น</h4>
            <div class="total-amount">{{ calculateTotal() }} บาท</div>
          </div>
          
          <div class="payment-methods">
            <h4>เลือกวิธีการชำระเงิน</h4>
            <div class="payment-options">
              <label class="payment-option">
                <input type="radio" name="payment" value="cash" v-model="paymentMethod">
                <span class="radio-custom"></span>
                <span>เงินสด</span>
              </label>
              <label class="payment-option">
                <input type="radio" name="payment" value="transfer" v-model="paymentMethod">
                <span class="radio-custom"></span>
                <span>โอนเงิน</span>
              </label>
              <label class="payment-option">
                <input type="radio" name="payment" value="credit" v-model="paymentMethod">
                <span class="radio-custom"></span>
                <span>บัตรเครดิต</span>
              </label>
            </div>
          </div>
          
          <div class="customer-info">
            <h4>ข้อมูลลูกค้า</h4>
            <div class="form-group">
              <label>ชื่อ-นามสกุล</label>
              <input type="text" v-model="customerName" placeholder="กรุณากรอกชื่อ-นามสกุล">
            </div>
            <div class="form-group">
              <label>เบอร์โทรศัพท์</label>
              <input type="tel" v-model="customerPhone" placeholder="กรุณากรอกเบอร์โทรศัพท์">
            </div>
          </div>
          
          <button class="pay-now-btn" @click="processPayment">ชำระเงินตอนนี้</button>
        </div>
      </div>
    </div>

    <!-- โมดาลการชำระเงินสำเร็จ -->
    <div class="modal-overlay" v-if="isPaymentSuccessModalOpen">
      <div class="success-modal">
        <div class="success-icon">✓</div>
        <h3>ชำระเงินสำเร็จ</h3>
        <p>ขอบคุณสำหรับการสั่งซื้อ</p>
        <p>หมายเลขคำสั่งซื้อของคุณ: {{ orderNumber }}</p>
        <button class="close-success-btn" @click="closeSuccessModal">ปิด</button>
      </div>
    </div>

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

export default {
  name: "HomePage",
  data() {
    return {
      menus: [],
      totalMenus: 0,
      cartItems: [],
      isCartOpen: false,
      isCheckoutModalOpen: false,
      isPaymentSuccessModalOpen: false,
      paymentMethod: "cash",
      customerName: "",
      customerPhone: "",
      orderNumber: ""
    };
  },
  mounted() {
    this.fetchMenus();
    // โหลดข้อมูลตะกร้าจาก localStorage (ถ้ามี)
    const savedCart = localStorage.getItem('cart');
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
        });
    },
    // ฟังก์ชันเกี่ยวกับตะกร้าสินค้า
    addToCart(menu) {
      // ตรวจสอบว่ามีรายการนี้ในตะกร้าหรือไม่
      const existingItem = this.cartItems.find(item => item.id === menu.id);
      
      if (existingItem) {
        // ถ้ามีอยู่แล้ว เพิ่มจำนวน
        existingItem.quantity += 1;
      } else {
        // ถ้ายังไม่มี เพิ่มรายการใหม่พร้อมจำนวน = 1
        this.cartItems.push({
          ...menu,
          quantity: 1
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
    calculateTotal() {
      return this.cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    },
    saveCart() {
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
    },
    // ฟังก์ชันเกี่ยวกับการชำระเงิน
    goToCheckout() {
      this.isCheckoutModalOpen = true;
      this.isCartOpen = false; // ปิดตะกร้าเมื่อไปที่หน้าชำระเงิน
    },
    closeCheckoutModal() {
      this.isCheckoutModalOpen = false;
    },
    processPayment() {
      // ตรวจสอบข้อมูลลูกค้า
      if (!this.customerName || !this.customerPhone) {
        alert("กรุณากรอกข้อมูลลูกค้าให้ครบถ้วน");
        return;
      }
      
      // สร้างข้อมูลการสั่งซื้อ
      const orderData = {
        items: this.cartItems,
        totalAmount: this.calculateTotal(),
        paymentMethod: this.paymentMethod,
        customerInfo: {
          name: this.customerName,
          phone: this.customerPhone
        },
        orderDate: new Date().toISOString()
      };
      
      // ตัวอย่างการส่งข้อมูลไปยัง API
      axios.post("http://localhost:5000/orders", orderData)
        .then(response => {
          // สมมติว่า API ส่งข้อมูลกลับมาพร้อม order ID
          this.orderNumber = response.data.orderId || `ORD-${Date.now()}`;
          
          // แสดงโมดาลสำเร็จ
          this.isCheckoutModalOpen = false;
          this.isPaymentSuccessModalOpen = true;
          
          // ล้างตะกร้า
          this.cartItems = [];
          this.saveCart();
        })
        .catch(error => {
          console.error("เกิดข้อผิดพลาดในการชำระเงิน:", error);
          
          // สำหรับการทดสอบ (หากไม่มี API จริง)
          this.orderNumber = `ORD-${Date.now()}`;
          this.isCheckoutModalOpen = false;
          this.isPaymentSuccessModalOpen = true;
          this.cartItems = [];
          this.saveCart();
        });
    },
    closeSuccessModal() {
      this.isPaymentSuccessModalOpen = false;
      this.customerName = "";
      this.customerPhone = "";
      this.paymentMethod = "cash";
    }
  }
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

.material-icons {
  font-family: 'Material Icons';
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

.cart-empty-icon {
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

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Checkout Modal */
.checkout-modal {
  background-color: white;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eaeaea;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.checkout-content {
  padding: 20px;
}

.checkout-content h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.checkout-items {
  margin-bottom: 20px;
}

.checkout-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.checkout-total {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.total-amount {
  font-size: 22px;
  font-weight: 600;
  color: #4caf50;
  text-align: right;
}

.payment-methods {
  margin-bottom: 20px;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.payment-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 10px;
  border: 1px solid #eaeaea;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.payment-option:hover {
  background-color: #f9f9f9;
}

.radio-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #4caf50;
  border-radius: 50%;
  margin-right: 10px;
  position: relative;
  display: inline-block;
}

input[type="radio"]:checked + .radio-custom:after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4caf50;
}

input[type="radio"] {
  position: absolute;
  opacity: 0;
}

.customer-info {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.pay-now-btn {
  width: 100%;
  padding: 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 16px;
}

.pay-now-btn:hover {
  background-color: #45a049;
}

/* Success Modal */
.success-modal {
  background-color: white;
  border-radius: 10px;
  padding: 30px;
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.success-icon {
  width: 60px;
  height: 60px;
  background-color: #4caf50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  margin: 0 auto 20px;
}

.success-modal h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 20px;
}

.success-modal p {
  margin: 5px 0;
  color: #666;
}

.close-success-btn {
  margin-top: 20px;
  padding: 10px 30px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.close-success-btn:hover {
  background-color: #45a049;
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
  .cart-sidebar {
    width: 300px;
  }
  
  .menu-cards, .admin-cards {
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
  
  .cart-sidebar {
    width: 85%;
  }
  
  .menu-cards, .admin-cards {
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
  
  .checkout-modal {
    width: 95%;
  }
}
</style >