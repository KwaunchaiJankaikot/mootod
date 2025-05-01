<template>
  <div id="app" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <SidebarNav 
      :collapsed="sidebarCollapsed" 
      @sidebar-toggle="updateSidebarState" 
    />
    
    <div class="main-content">
      <div class="header-wrapper">
        <HeaderNavbar @toggle-sidebar="toggleSidebar" />
      </div>
      
      <div class="content">
        <router-view></router-view>
      </div>
    </div>
    
    <!-- Backdrop for mobile version -->
    <div 
      class="sidebar-backdrop" 
      v-if="!sidebarCollapsed && isMobile"
      @click="closeSidebar"
    ></div>
  </div>
</template>

<script>
import SidebarNav from '@/components/Sidebar.vue';

export default {
  name: 'App',
  components: {
    SidebarNav,

  },
  data() {
    return {
      sidebarCollapsed: false,
      isMobile: false
    };
  },
  mounted() {
    // ตรวจสอบขนาดหน้าจอเมื่อโหลดแอป
    this.checkScreenSize();
    
    // ติดตามการเปลี่ยนขนาดหน้าจอ
    window.addEventListener('resize', this.checkScreenSize);
  },
  beforeDestroy() {
    // ลบการติดตามเมื่อแอปถูกทำลาย
    window.removeEventListener('resize', this.checkScreenSize);
  },
  methods: {
    updateSidebarState(collapsed) {
      this.sidebarCollapsed = collapsed;
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
    closeSidebar() {
      this.sidebarCollapsed = true;
    },
    checkScreenSize() {
      this.isMobile = window.innerWidth < 768;
      
      // หากเป็นมือถือและไม่ได้กำหนดค่าเริ่มต้น ให้ย่อ sidebar
      if (this.isMobile) {
        this.sidebarCollapsed = true;
      }
    }
  }
};
</script>

<style>
/* Reset CSS */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

body {
  font-family: 'Kanit', 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

#app {
  display: flex;
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  width: calc(100% - 250px);
  max-width: calc(100% - 250px);
  display: flex;
  flex-direction: column;
}

#app.sidebar-collapsed .main-content {
  margin-left: 60px;
  width: calc(100% - 60px);
  max-width: calc(100% - 60px);
}

.header-wrapper {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  width: 100%;
}

.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* สำหรับอุปกรณ์มือถือ */
@media (max-width: 767px) {
  .main-content {
    margin-left: 60px;
    width: calc(100% - 60px);
    max-width: calc(100% - 60px);
  }
  
  #app.sidebar-collapsed .main-content {
    margin-left: 0;
    width: 100%;
    max-width: 100%;
  }
  
  .content {
    padding: 15px;
  }
}

/* ป้องกันการเลื่อนเมื่อ sidebar เปิดบนมือถือ */
body.sidebar-open {
  overflow: hidden;
}

/* Container สำหรับหน้า */
.page-container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 20px;
}

/* ส่วนของเนื้อหาที่ต้องการจำกัดความกว้าง */
.content-wrapper {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}
</style>