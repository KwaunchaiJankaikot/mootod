<template>
  <div class="checkout-page">
    <!-- โมดาลชำระเงิน -->
    <div class="modal-overlay" @click.self="closeCheckout">
      <div class="checkout-modal">
        <div class="modal-header">
          <h3>ชำระเงิน</h3>
          <button class="close-btn" @click="closeCheckout">✕</button>
        </div>

        <div class="checkout-content">
          <h4>รายการสั่งซื้อ</h4>
          <div class="checkout-items">
            <div
              v-for="(item, index) in cartItems"
              :key="index"
              class="checkout-item"
            >
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
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  v-model="paymentMethod"
                />
                <span class="radio-custom"></span>
                <span>เงินสด</span>
              </label>
              <label class="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="transfer"
                  v-model="paymentMethod"
                />
                <span class="radio-custom"></span>
                <span>โอนเงิน</span>
              </label>
              <!-- <label class="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="credit"
                  v-model="paymentMethod"
                />
                <span class="radio-custom"></span>
                <span>บัตรเครดิต</span>
              </label> -->
            </div>
          </div>

          <div class="customer-info">
            <h4>ข้อมูลลูกค้า</h4>
            <div class="form-group">
              <label>ชื่อ-นามสกุล</label>
              <input
                type="text"
                v-model="customerName"
                placeholder="กรุณากรอกชื่อ-นามสกุล"
              />
            </div>
            <div class="form-group">
              <label>เบอร์โทรศัพท์</label>
              <input
                type="tel"
                v-model="customerPhone"
                placeholder="กรุณากรอกเบอร์โทรศัพท์"
              />
            </div>
          </div>

          <button class="pay-now-btn" @click="processPayment">
            ชำระเงินตอนนี้
          </button>
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
        <button class="close-success-btn" @click="closeSuccessModal">
          ปิด
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "CheckoutPage",
  props: {
    cartItems: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      paymentMethod: "cash",
      customerName: "",
      customerPhone: "",
      orderNumber: "",
      isPaymentSuccessModalOpen: false
    };
  },
  methods: {
    calculateTotal() {
      return this.cartItems.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0);
    },
    closeCheckout() {
      this.$emit("close-checkout");
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
          phone: this.customerPhone,
        },
        orderDate: new Date().toISOString(),
      };

      // ตัวอย่างการส่งข้อมูลไปยัง API
      axios
        .post("http://localhost:5000/orders", orderData)
        .then((response) => {
          // สมมติว่า API ส่งข้อมูลกลับมาพร้อม order ID
          this.orderNumber = response.data.orderId || `ORD-${Date.now()}`;

          // แสดงโมดาลสำเร็จ
          this.isPaymentSuccessModalOpen = true;
          
          // แจ้งคอมโพเนนต์หลักว่าชำระเงินสำเร็จ
          this.$emit("payment-success");
        })
        .catch((error) => {
          console.error("เกิดข้อผิดพลาดในการชำระเงิน:", error);

          // สำหรับการทดสอบ (หากไม่มี API จริง)
          this.orderNumber = `ORD-${Date.now()}`;
          this.isPaymentSuccessModalOpen = true;
          
          // แจ้งคอมโพเนนต์หลักว่าชำระเงินสำเร็จ
          this.$emit("payment-success");
        });
    },
    closeSuccessModal() {
      this.isPaymentSuccessModalOpen = false;
      this.customerName = "";
      this.customerPhone = "";
      this.paymentMethod = "cash";
      
      // แจ้งคอมโพเนนต์หลักให้ปิดหน้าชำระเงิน
      this.$emit("close-checkout");
    },
  },
};
</script>

<style scoped>
.checkout-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
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
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}

.modal-header h3 {
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
  max-height: 200px;
  overflow-y: auto;
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
  content: "";
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

@media (max-width: 480px) {
  .checkout-modal {
    width: 95%;
  }
}
</style>