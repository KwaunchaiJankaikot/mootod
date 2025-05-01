<template>
    <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
      <div class="sidebar-header">
        <h2 v-if="!isCollapsed">เมนูหลัก</h2>
        <button class="toggle-btn" @click="toggleSidebar">
          <span v-if="isCollapsed">→</span>
          <span v-else>←</span>
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <ul>
          <li v-for="(item, index) in menuItems" :key="index">
            <router-link :to="item.path" class="nav-link" :class="{ 'active': currentPath === item.path }">
              <span class="icon">{{ item.icon }}</span>
              <span class="text" v-if="!isCollapsed">{{ item.title }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
      
      <div class="sidebar-footer" v-if="!isCollapsed">
        <div class="user-info">
          <div class="avatar">👤</div>
          <div class="user-details">
            <p class="username">{{ userName }}</p>
            <small class="role">{{ userRole }}</small>
          </div>
        </div>
        <button class="logout-btn" @click="logout">ออกจากระบบ</button>
      </div>
      <div class="sidebar-footer-collapsed" v-else>
        <button class="logout-btn-small" @click="logout" title="ออกจากระบบ">🚪</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SidebarNav',
    props: {
      // ดึงค่าสถานะ sidebar จาก parent component
      collapsed: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        isCollapsed: this.collapsed,
        userName: 'ผู้ดูแลระบบ',
        userRole: 'แอดมิน',
        currentPath: '/',
        menuItems: [
          {
            title: 'หน้าหลัก',
            path: '/',
            icon: '🏠'
          },
          {
            title: 'รายการเมนู',
            path: '/menu-order',
            icon: '🍲'
          },
        ]
      };
    },
    watch: {
      // ตรวจสอบการเปลี่ยนแปลงของ props
      collapsed(newVal) {
        this.isCollapsed = newVal;
      },
      // ส่งค่า isCollapsed กลับไปยัง parent component
      isCollapsed(newVal) {
        this.$emit('sidebar-toggle', newVal);
      }
    },
    mounted() {
      // ตั้งค่าเส้นทางปัจจุบัน
      this.currentPath = this.$route ? this.$route.path : '/';
      
      // ติดตามการเปลี่ยนแปลงเส้นทาง
      if (this.$router) {
        this.$router.afterEach((to) => {
          this.currentPath = to.path;
          
          // ถ้าอยู่ในโหมดมือถือ ให้ปิด sidebar เมื่อคลิกที่เมนู
          if (window.innerWidth < 768) {
            this.isCollapsed = true;
            this.$emit('sidebar-toggle', true);
          }
        });
      }
      
      // ตรวจสอบขนาดหน้าจอเพื่อกำหนดสถานะเริ่มต้น
      this.checkScreenSize();
      
      // ดึงข้อมูลผู้ใช้จาก localStorage
      this.getUserInfo();
      
      // เพิ่มการติดตามการเปลี่ยนขนาดหน้าจอ
      window.addEventListener('resize', this.checkScreenSize);
    },
    beforeDestroy() {
      // ลบการติดตามเมื่อ component ถูกทำลาย
      window.removeEventListener('resize', this.checkScreenSize);
    },
    methods: {
      getUserInfo() {
        // ดึงข้อมูลผู้ใช้จาก localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            this.userName = userData.name || 'ผู้ดูแลระบบ';
            this.userRole = userData.role || 'แอดมิน';
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        }
      },
      toggleSidebar() {
        this.isCollapsed = !this.isCollapsed;
      },
      checkScreenSize() {
        // ตรวจสอบขนาดหน้าจอและปรับสถานะ sidebar ตามความเหมาะสม
        const newCollapsedState = window.innerWidth < 768;
        
        if (this.isCollapsed !== newCollapsedState) {
          this.isCollapsed = newCollapsedState;
          this.$emit('sidebar-toggle', newCollapsedState);
        }
      },
      logout() {
        // ลบข้อมูล token และ user จาก localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // นำทางไปยังหน้าล็อกอิน
        if (this.$router) {
          this.$router.push('/login');
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .sidebar {
    display: flex;
    flex-direction: column;
    width: 250px;
    height: 100vh;
    background: linear-gradient(to bottom, #4caf50, #2e7d32);
    color: white;
    transition: all 0.3s ease;
    overflow-y: auto;
    position: fixed;
    left: 0;
    top: 0;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }
  
  .sidebar.collapsed {
    width: 60px;
  }
  
  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .sidebar-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
  
  .toggle-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .toggle-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  .sidebar-nav {
    flex: 1;
    padding: 20px 0;
  }
  
  .sidebar-nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .sidebar-nav li {
    margin-bottom: 5px;
  }
  
  .nav-link {
    display: flex;
    align-items: center;
    padding: 12px 15px;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    transition: all 0.2s;
    border-radius: 0 30px 30px 0;
    margin-right: 10px;
  }
  
  .nav-link:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  .nav-link.active {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    font-weight: 600;
  }
  
  .icon {
    font-size: 18px;
    margin-right: 15px;
    min-width: 20px;
    text-align: center;
  }
  
  .sidebar-footer {
    padding: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .sidebar-footer-collapsed {
    padding: 15px 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: center;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .avatar {
    background: rgba(255, 255, 255, 0.2);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    font-size: 20px;
  }
  
  .user-details {
    overflow: hidden;
  }
  
  .username {
    margin: 0 0 2px 0;
    font-weight: 600;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .role {
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
  }
  
  .logout-btn {
    width: 100%;
    padding: 10px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
    font-size: 14px;
  }
  
  .logout-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  .logout-btn-small {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.2s;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .logout-btn-small:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  /* สำหรับอุปกรณ์มือถือ */
  @media (max-width: 767px) {
    .sidebar {
      width: 60px;
    }
    
    .sidebar.collapsed {
      width: 0;
      padding: 0;
      overflow: hidden;
    }
    
    .sidebar-header h2 {
      display: none;
    }
    
    .text {
      display: none;
    }
    
    .sidebar-footer {
      display: none;
    }
    
    .toggle-btn {
      margin-left: auto;
    }
  }
  </style>