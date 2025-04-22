<template>
  <header class="header">
    <div class="logo">
      <img src="@/assets/logo.png" alt="Mootod Logo" v-if="false" />
      <h1>Mootod <span>อาหาร</span></h1>
      <div class="product-count" v-if="products.length > 0">
        (สินค้า {{ products.length }} ชนิด)
      </div>
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
      cartItems: [],
      products: []
    };
  },
  mounted() {
    // โหลดข้อมูลตะกร้าจาก localStorage (ถ้ามี)
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
    }
    
    // โหลดข้อมูลสินค้าจาก API หรือ localStorage
    this.fetchProducts();
  },
  methods: {
    toggleCart() {
      // ส่ง emit เพื่อให้ parent component จัดการการแสดงตะกร้า
      this.$emit('toggle-cart');
    },
    fetchProducts() {
      // ดึงข้อมูลสินค้าจาก API หรือ localStorage
      const savedProducts = localStorage.getItem("products");
      if (savedProducts) {
        this.products = JSON.parse(savedProducts);
      } else {
        // ถ้าไม่มีข้อมูลใน localStorage ให้ดึงข้อมูลจาก API
        // ตัวอย่างการดึงข้อมูลจาก API
        /*
        fetch('/api/products')
          .then(response => response.json())
          .then(data => {
            this.products = data;
            localStorage.setItem("products", JSON.stringify(data));
          })
          .catch(error => console.error('Error fetching products:', error));
        */
        
        // สำหรับการทดสอบ ใช้ข้อมูลตัวอย่าง
        this.products = [
          { id: 1, name: 'สินค้า 1', price: 100 },
          { id: 2, name: 'สินค้า 2', price: 200 },
          { id: 3, name: 'สินค้า 3', price: 300 },
          // เพิ่มสินค้าตัวอย่างได้ตามต้องการ
        ];
        localStorage.setItem("products", JSON.stringify(this.products));
      }
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

.product-count {
  margin-left: 10px;
  color: #666;
  font-size: 14px;
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
  
  .logo {
    flex-wrap: wrap;
  }
  
  .product-count {
    margin-left: 0;
    width: 100%;
    margin-top: 5px;
  }
}
</style>