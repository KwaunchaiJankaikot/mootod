<template>
  <div class="menu-order-container">
    <div class="menu-header">
      <h1>เมนูอาหารทั้งหมด</h1>
      <div class="cart-summary" @click="goToCart">
        <div class="cart-icon">
          <i class="cart-icon-symbol">🛒</i>
          <span v-if="cartItems.length > 0" class="cart-badge">{{ cartItemCount }}</span>
        </div>
        <span class="cart-text">ตะกร้าของฉัน</span>
      </div>
    </div>

    <!-- การกรองเมนู -->
    <div class="filter-container">
      <div class="category-filters">
        <button 
          class="filter-btn" 
          :class="{ active: selectedCategory === 'ทั้งหมด' }" 
          @click="filterByCategory('ทั้งหมด')"
        >
          ทั้งหมด
        </button>
        <button 
          v-for="category in categories" 
          :key="category" 
          class="filter-btn" 
          :class="{ active: selectedCategory === category }" 
          @click="filterByCategory(category)"
        >
          {{ category }}
        </button>
      </div>
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="ค้นหาเมนูอาหาร..."
          class="search-input"
        />
      </div>
    </div>

    <!-- แสดงเมนูอาหารในรูปแบบกริด -->
    <div class="menu-grid">
      <div v-if="filteredMenus.length === 0" class="no-menu-found">
        <p>ไม่พบเมนูที่ค้นหา</p>
      </div>
      <div v-for="menu in filteredMenus" :key="menu.id" class="menu-card">
        <div class="menu-image-container">
          <img :src="menu.image_url" :alt="menu.name" class="menu-image" />
          <div v-if="isMenuInCart(menu.id)" class="in-cart-badge">
            <span>ในตะกร้า ({{ getMenuQuantityInCart(menu.id) }})</span>
          </div>
        </div>
        <div class="menu-details">
          <h3 class="menu-name">{{ menu.name }}</h3>
          <p class="category">{{ menu.category }}</p>
          <p class="menu-description">{{ menu.description }}</p>
          <div class="menu-footer">
            <span class="menu-price">{{ menu.price }} บาท</span>
            <div class="quantity-controls" v-if="isMenuInCart(menu.id)">
              <button class="quantity-btn" @click="decreaseQuantity(menu)">-</button>
              <span class="quantity">{{ getMenuQuantityInCart(menu.id) }}</span>
              <button class="quantity-btn" @click="addToCart(menu)">+</button>
            </div>
            <button v-else class="add-to-cart-btn" @click="addToCart(menu)">
              <i class="add-icon">+</i> เพิ่มลงตะกร้า
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'MenuOrderPage',
  data() {
    return {
      menus: [],
      categories: [],
      selectedCategory: 'ทั้งหมด',
      searchQuery: '',
      cartItems: [],
    };
  },
  computed: {
    filteredMenus() {
      let result = this.menus;
      
      // กรองตามหมวดหมู่
      if (this.selectedCategory !== 'ทั้งหมด') {
        result = result.filter(menu => menu.category === this.selectedCategory);
      }
      
      // กรองตามคำค้นหา
      if (this.searchQuery.trim() !== '') {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(menu => 
          menu.name.toLowerCase().includes(query) || 
          menu.description.toLowerCase().includes(query)
        );
      }
      
      return result;
    },
    cartItemCount() {
      return this.cartItems.reduce((total, item) => total + item.quantity, 0);
    }
  },
  created() {
    this.fetchMenus();
    this.loadCartFromLocalStorage();
  },
  methods: {
    fetchMenus() {
      axios.get('http://localhost:5000/menus')
        .then(response => {
          this.menus = response.data;
          // สร้างรายการหมวดหมู่ที่ไม่ซ้ำกัน
          this.categories = [...new Set(this.menus.map(menu => menu.category))];
        })
        .catch(error => {
          console.error('ไม่สามารถดึงข้อมูลเมนูได้:', error);
          alert('เกิดข้อผิดพลาดในการดึงข้อมูลเมนู');
        });
    },
    filterByCategory(category) {
      this.selectedCategory = category;
    },
    isMenuInCart(menuId) {
      return this.cartItems.some(item => item.id === menuId);
    },
    getMenuQuantityInCart(menuId) {
      const cartItem = this.cartItems.find(item => item.id === menuId);
      return cartItem ? cartItem.quantity : 0;
    },
    addToCart(menu) {
      const existingItem = this.cartItems.find(item => item.id === menu.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.cartItems.push({
          id: menu.id,
          name: menu.name,
          price: menu.price,
          image_url: menu.image_url,
          quantity: 1
        });
      }
      
      this.saveCartToLocalStorage();
    },
    decreaseQuantity(menu) {
      const existingItem = this.cartItems.find(item => item.id === menu.id);
      
      if (existingItem) {
        if (existingItem.quantity > 1) {
          existingItem.quantity -= 1;
        } else {
          // ลบรายการออกจากตะกร้าถ้าจำนวนเป็น 0
          const index = this.cartItems.findIndex(item => item.id === menu.id);
          if (index !== -1) {
            this.cartItems.splice(index, 1);
          }
        }
        
        this.saveCartToLocalStorage();
      }
    },
    saveCartToLocalStorage() {
      localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    },
    loadCartFromLocalStorage() {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        this.cartItems = JSON.parse(storedCart);
      }
    },
    goToCart() {
      this.$router.push('/cart');
    }
  }
};
</script>

<style scoped>
.menu-order-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Prompt', 'Kanit', sans-serif;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.menu-header h1 {
  font-size: 28px;
  color: #333;
  margin: 0;
}

.cart-summary {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.cart-summary:hover {
  background-color: #e9ecef;
}

.cart-icon {
  position: relative;
  margin-right: 10px;
}

.cart-icon-symbol {
  font-size: 24px;
}

.cart-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: #f44336;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.cart-text {
  font-weight: 500;
}

.filter-container {
  margin-bottom: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
}

.category-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background-color: #f5f5f5;
}

.filter-btn.active {
  background-color: #4caf50;
  color: white;
  border-color: #4caf50;
}

.search-box {
  flex: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: border 0.3s ease;
}

.search-input:focus {
  border-color: #4caf50;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.no-menu-found {
  grid-column: 1 / -1;
  text-align: center;
  padding: 50px 0;
  color: #666;
  font-style: italic;
}

.menu-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.menu-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.menu-image-container {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.menu-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.menu-card:hover .menu-image {
  transform: scale(1.05);
}

.in-cart-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(76, 175, 80, 0.9);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.menu-details {
  padding: 15px;
}

.menu-name {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 18px;
  color: #333;
}

.menu-description {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
  height: 60px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.menu-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-price {
  font-weight: bold;
  font-size: 16px;
  color: #4caf50;
}

.add-to-cart-btn {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
}

.add-to-cart-btn:hover {
  background-color: #45a049;
}

.add-icon {
  margin-right: 5px;
  font-weight: bold;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.quantity-btn:hover {
  background-color: #f5f5f5;
}

.quantity {
  font-weight: bold;
  min-width: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
  
  .filter-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: 100%;
  }
}
</style>