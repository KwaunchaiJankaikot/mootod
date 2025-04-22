<template>
  <div class="navbar-wrapper">
    <nav class="navbar">
      <div class="navbar-logo" @click="goToHome">
        <img src="../assets/logo.png" alt="Logo" class="logo-image" v-if="hasLogo" />
        <h1 class="logo-text" v-else>{{ storeName }}</h1>
      </div>
      
      <div class="navbar-links">
        <router-link to="/" exact class="nav-link">
          <i class="nav-icon home-icon">🏠</i>
          <span class="nav-text">หน้าแรก</span>
        </router-link>
        
        <router-link to="/menu-order" class="nav-link">
          <i class="nav-icon menu-icon">🍽️</i>
          <span class="nav-text">เมนูอาหาร</span>
        </router-link>
        
        <router-link to="/inventory" class="nav-link" v-if="isAdmin">
          <i class="nav-icon inventory-icon">📦</i>
          <span class="nav-text">วัตถุดิบ</span>
        </router-link>
        
        <router-link to="/orders" class="nav-link" v-if="isAdmin">
          <i class="nav-icon orders-icon">📋</i>
          <span class="nav-text">ออเดอร์</span>
        </router-link>
        
        <router-link to="/reports" class="nav-link" v-if="isAdmin">
          <i class="nav-icon reports-icon">📊</i>
          <span class="nav-text">รายงาน</span>
        </router-link>
        
        <div class="nav-link cart-link" @click="goToCart">
          <div class="cart-icon">
            <i class="nav-icon">🛒</i>
            <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
          </div>
          <span class="nav-text">ตะกร้า</span>
        </div>
      </div>
      
      <div class="navbar-right">
        <div class="user-menu" v-if="isLoggedIn" @click="toggleUserMenu">
          <div class="user-avatar">
            <img :src="userAvatar" alt="User" v-if="userAvatar" />
            <span class="avatar-placeholder" v-else>{{ userInitials }}</span>
          </div>
          <span class="username">{{ userName }}</span>
          <i class="dropdown-icon">▼</i>
        </div>
        
        <div class="user-dropdown" v-if="showUserMenu">
          <div class="dropdown-item" @click="goToProfile">
            <i class="dropdown-icon">👤</i>
            <span>โปรไฟล์</span>
          </div>
          <div class="dropdown-item" @click="logout">
            <i class="dropdown-icon">🚪</i>
            <span>ออกจากระบบ</span>
          </div>
        </div>
        
        <button v-else class="login-button" @click="login">เข้าสู่ระบบ</button>
      </div>
      
      <div class="mobile-menu-toggle" @click="toggleMobileMenu">
        <div class="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
    
    <!-- โมบายล์เมนู -->
    <div class="mobile-menu" :class="{ 'open': showMobileMenu }">
      <router-link to="/" class="mobile-nav-link" @click="closeMobileMenu">
        <i class="nav-icon">🏠</i>
        <span>หน้าแรก</span>
      </router-link>
      
      <router-link to="/menu-order" class="mobile-nav-link" @click="closeMobileMenu">
        <i class="nav-icon">🍽️</i>
        <span>เมนูอาหาร</span>
      </router-link>
      
      <router-link to="/inventory" class="mobile-nav-link" v-if="isAdmin" @click="closeMobileMenu">
        <i class="nav-icon">📦</i>
        <span>วัตถุดิบ</span>
      </router-link>
      
      <router-link to="/orders" class="mobile-nav-link" v-if="isAdmin" @click="closeMobileMenu">
        <i class="nav-icon">📋</i>
        <span>ออเดอร์</span>
      </router-link>
      
      <router-link to="/reports" class="mobile-nav-link" v-if="isAdmin" @click="closeMobileMenu">
        <i class="nav-icon">📊</i>
        <span>รายงาน</span>
      </router-link>
      
      <div class="mobile-nav-link" @click="goToCartMobile">
        <i class="nav-icon">🛒</i>
        <span>ตะกร้า</span>
        <span v-if="cartItemCount > 0" class="mobile-cart-badge">{{ cartItemCount }}</span>
      </div>
      
      <div class="mobile-nav-link login-link" v-if="!isLoggedIn" @click="login">
        <i class="nav-icon">🔑</i>
        <span>เข้าสู่ระบบ</span>
      </div>
      
      <div class="mobile-nav-link logout-link" v-else @click="logout">
        <i class="nav-icon">🚪</i>
        <span>ออกจากระบบ</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NavbarComponent',
  data() {
    return {
      storeName: 'ร้านอาหารมูตอด',
      showUserMenu: false,
      showMobileMenu: false,
      cartItems: [],
      isAdmin: false, // ต้องเปลี่ยนเป็น computed property ที่ตรวจสอบจากระบบการล็อกอิน
      isLoggedIn: false, // ต้องเปลี่ยนเป็น computed property ที่ตรวจสอบจากระบบการล็อกอิน
      userAvatar: null,
      userName: 'ผู้ใช้งาน'
    };
  },
  computed: {
    hasLogo() {
      // ตรวจสอบว่ามีโลโก้หรือไม่
      return false; // เปลี่ยนเป็น true ถ้ามีไฟล์โลโก้
    },
    cartItemCount() {
      return this.cartItems.reduce((total, item) => total + item.quantity, 0);
    },
    userInitials() {
      // สร้างอักษรย่อจากชื่อผู้ใช้
      if (!this.userName) return '';
      const names = this.userName.split(' ');
      if (names.length === 1) return names[0].charAt(0).toUpperCase();
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
  },
  created() {
    this.loadCartFromLocalStorage();
    // ตรวจสอบสถานะการล็อกอิน
    this.checkLoginStatus();
    
    // ตรวจสอบการเปลี่ยนแปลงของตะกร้า
    window.addEventListener('storage', this.handleStorageChange);
  },
  beforeDestroy() {
    window.removeEventListener('storage', this.handleStorageChange);
  },
  methods: {
    loadCartFromLocalStorage() {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        this.cartItems = JSON.parse(storedCart);
      }
    },
    handleStorageChange(event) {
      if (event.key === 'cartItems') {
        this.loadCartFromLocalStorage();
      }
    },
    goToHome() {
      this.$router.push('/');
      this.closeMobileMenu();
    },
    goToCart() {
      this.$router.push('/cart');
      this.closeMobileMenu();
    },
    goToCartMobile() {
      this.goToCart();
      this.closeMobileMenu();
    },
    goToProfile() {
      this.$router.push('/profile');
      this.showUserMenu = false;
      this.closeMobileMenu();
    },
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu;
    },
    toggleMobileMenu() {
      this.showMobileMenu = !this.showMobileMenu;
      this.showUserMenu = false;
    },
    closeMobileMenu() {
      this.showMobileMenu = false;
    },
    login() {
      // ลิงก์ไปยังหน้าล็อกอิน
      this.$router.push('/login');
      this.closeMobileMenu();
    },
    logout() {
      // ล็อกเอาท์ผู้ใช้
      this.isLoggedIn = false;
      this.isAdmin = false;
      this.showUserMenu = false;
      this.closeMobileMenu();
      // ลบข้อมูลการล็อกอินจาก localStorage หรือ sessionStorage
      localStorage.removeItem('user');
      // นำทางกลับไปยังหน้าแรก
      this.$router.push('/');
    },
    checkLoginStatus() {
      // ตรวจสอบสถานะการล็อกอินจาก localStorage หรือ sessionStorage
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        this.isLoggedIn = true;
        this.userName = userData.name || 'ผู้ใช้งาน';
        this.userAvatar = userData.avatar || null;
        this.isAdmin = userData.role === 'admin';
      }
    }
  }
};
</script>

<style scoped>
.navbar-wrapper {
  position: relative;
  font-family: 'Prompt', 'Kanit', sans-serif;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 0 20px;
  height: 70px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-logo {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo-image {
  height: 40px;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #4caf50;
  margin: 0;
}

.navbar-links {
  display: flex;
  align-items: center;
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #333;
  margin: 0 15px;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
}

.nav-link.router-link-active {
  color: #4caf50;
}

.nav-icon {
  font-size: 22px;
  margin-bottom: 3px;
}

.nav-text {
  font-size: 14px;
}

.cart-icon {
  position: relative;
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
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.navbar-right {
  position: relative;
}

.user-menu {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 30px;
  transition: background-color 0.3s;
}

.user-menu:hover {
  background-color: #f5f5f5;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 8px;
  background-color: #e1e1e1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: #555;
  font-weight: 500;
  font-size: 14px;
}

.username {
  font-size: 14px;
  margin-right: 5px;
}

.dropdown-icon {
  font-size: 12px;
  margin-left: 5px;
}

.user-dropdown {
  position: absolute;
  top: 45px;
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 180px;
  z-index: 1001;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-item i {
  margin-right: 10px;
  font-size: 16px;
}

.login-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #45a049;
}

.mobile-menu-toggle {
  display: none;
  cursor: pointer;
}

.hamburger-icon {
  width: 24px;
  height: 18px;
  position: relative;
}

.hamburger-icon span {
  display: block;
  position: absolute;
  height: 2px;
  width: 100%;
  background: #333;
  border-radius: 2px;
  opacity: 1;
  left: 0;
  transform: rotate(0deg);
  transition: .25s ease-in-out;
}

.hamburger-icon span:nth-child(1) {
  top: 0px;
}

.hamburger-icon span:nth-child(2) {
  top: 8px;
}

.hamburger-icon span:nth-child(3) {
  top: 16px;
}

.mobile-menu {
  display: none;
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background-color: white;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 999;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
}

.mobile-menu.open {
  max-height: 100vh;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  text-decoration: none;
  color: #333;
  position: relative;
}

.mobile-nav-link i {
  margin-right: 15px;
  font-size: 20px;
}

.mobile-nav-link.router-link-active {
  background-color: #f5f5f5;
  color: #4caf50;
}

.mobile-cart-badge {
  position: absolute;
  right: 20px;
  background-color: #f44336;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.login-link, .logout-link {
  border-top: 1px solid #eee;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .navbar-links {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: block;
  }
  
  .mobile-menu {
    display: flex;
  }
  
  .user-menu .username, 
  .user-menu .dropdown-icon {
    display: none;
  }
  
  .user-menu {
    padding: 0;
    background-color: transparent;
  }
  
  .user-avatar {
    margin-right: 0;
  }
}
</style>