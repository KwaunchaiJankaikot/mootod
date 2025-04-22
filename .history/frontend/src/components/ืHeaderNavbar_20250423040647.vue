<template>
  <header class="header-navbar">
    <div class="container">
      <div class="logo-section" @click="goToHome">
        <h1 class="site-logo">Mootod <span class="text-green">อาหาร</span></h1>
      </div>

      <nav class="main-nav">
        <ul class="nav-links">
          <li><router-link to="/" exact>หน้าแรก</router-link></li>
          <li><router-link to="/menu-order">เมนูอาหาร</router-link></li>
          <li v-if="isAdmin"><router-link to="/inventory">วัตถุดิบ</router-link></li>
          <li v-if="isAdmin"><router-link to="/orders">ออเดอร์</router-link></li>
          <li v-if="isAdmin"><router-link to="/reports">รายงาน</router-link></li>
        </ul>
      </nav>

      <div class="header-actions">
        <div class="cart-icon" @click="goToCart">
          <i class="icon">🛒</i>
          <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
        </div>

        <div class="user-section">
          <div v-if="isLoggedIn" class="user-profile" @click="toggleUserMenu">
            <span class="username">{{ userName }}</span>
            <div class="user-avatar">
              <img :src="userAvatar" alt="User" v-if="userAvatar" />
              <span class="avatar-placeholder" v-else>{{ userInitials }}</span>
            </div>
          </div>
          <router-link v-else to="/login" class="login-btn">ผู้ดูแลระบบ</router-link>
        </div>
      </div>

      <!-- User Menu Dropdown -->
      <div class="user-dropdown" v-if="showUserMenu && isLoggedIn">
        <div class="dropdown-items">
          <div class="dropdown-item" @click="goToProfile">
            <i class="dropdown-icon">👤</i>
            <span>โปรไฟล์</span>
          </div>
          <div class="dropdown-item" @click="logout">
            <i class="dropdown-icon">🚪</i>
            <span>ออกจากระบบ</span>
          </div>
        </div>
      </div>

      <!-- Mobile Menu Toggle -->
      <div class="mobile-menu-toggle" @click="toggleMobileMenu">
        <div class="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div class="mobile-menu" :class="{ 'open': showMobileMenu }">
      <router-link to="/" class="mobile-nav-item" @click="closeMobileMenu">หน้าแรก</router-link>
      <router-link to="/menu-order" class="mobile-nav-item" @click="closeMobileMenu">เมนูอาหาร</router-link>
      <router-link v-if="isAdmin" to="/inventory" class="mobile-nav-item" @click="closeMobileMenu">วัตถุดิบ</router-link>
      <router-link v-if="isAdmin" to="/orders" class="mobile-nav-item" @click="closeMobileMenu">ออเดอร์</router-link>
      <router-link v-if="isAdmin" to="/reports" class="mobile-nav-item" @click="closeMobileMenu">รายงาน</router-link>
      <div class="mobile-nav-item" @click="goToCartMobile">
        ตะกร้า
        <span v-if="cartItemCount > 0" class="mobile-cart-badge">{{ cartItemCount }}</span>
      </div>
      <div v-if="!isLoggedIn" class="mobile-nav-item" @click="login">เข้าสู่ระบบ</div>
      <div v-else class="mobile-nav-item" @click="logout">ออกจากระบบ</div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'HeaderNavbar',
  data() {
    return {
      showUserMenu: false,
      showMobileMenu: false,
      cartItems: [],
      isAdmin: false,
      isLoggedIn: false,
      userAvatar: null,
      userName: 'ผู้ใช้งาน'
    };
  },
  computed: {
    cartItemCount() {
      return this.cartItems.reduce((total, item) => total + item.quantity, 0);
    },
    userInitials() {
      if (!this.userName) return '';
      const names = this.userName.split(' ');
      if (names.length === 1) return names[0].charAt(0).toUpperCase();
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
  },
  created() {
    this.loadCartFromLocalStorage();
    this.checkLoginStatus();
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
      this.$router.push('/login');
      this.closeMobileMenu();
    },
    logout() {
      this.isLoggedIn = false;
      this.isAdmin = false;
      this.showUserMenu = false;
      this.closeMobileMenu();
      localStorage.removeItem('user');
      this.$router.push('/');
    },
    checkLoginStatus() {
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
.header-navbar {
  width: 100%;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
  font-family: 'Prompt', 'Kanit', sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  height: 70px;
}

.logo-section {
  cursor: pointer;
  margin-right: 30px;
}

.site-logo {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #333;
}

.text-green {
  color: #4caf50;
}

.main-nav {
  flex: 1;
}

.nav-links {
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
}

.nav-links li {
  margin: 0 15px;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover, 
.nav-links a.router-link-active {
  color: #4caf50;
}

.header-actions {
  display: flex;
  align-items: center;
}

.cart-icon {
  position: relative;
  margin-right: 20px;
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
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.user-section {
  display: flex;
  align-items: center;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 20px;
  transition: background-color 0.3s;
}

.user-profile:hover {
  background-color: #f5f5f5;
}

.username {
  margin-right: 10px;
  font-weight: 500;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
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
  font-weight: 600;
  font-size: 14px;
}

.login-btn {
  padding: 8px 15px;
  background-color: #4caf50;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #45a049;
}

.user-dropdown {
  position: absolute;
  top: 70px;
  right: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 200px;
  z-index: 1000;
}

.dropdown-items {
  padding: 5px 0;
}

.dropdown-item {
  padding: 12px 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-icon {
  margin-right: 10px;
  font-size: 18px;
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
  flex-direction: column;
  position: absolute;
  top: 70px;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transform: translateY(-100%);
  transition: transform 0.3s ease-in-out;
  z-index: 999;
}

.mobile-menu.open {
  transform: translateY(0);
}

.mobile-nav-item {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  text-decoration: none;
  color: #333;
  position: relative;
}

.mobile-cart-badge {
  position: absolute;
  right: 20px;
  background-color: #f44336;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

@media (max-width: 768px) {
  .main-nav {
    display: none;
  }

  .username {
    display: none;
  }

  .mobile-menu-toggle {
    display: block;
    margin-left: 20px;
  }

  .mobile-menu {
    display: flex;
  }
  
  .container {
    justify-content: space-between;
  }
}
</style>