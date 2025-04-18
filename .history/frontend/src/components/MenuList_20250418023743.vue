<template>
  <div class="menu-list-container">
    <div class="page-header">
      <h2>จัดการเมนูอาหาร</h2>
      <div class="header-actions">
        <button class="add-btn" @click="$router.push('/add-menu')">
          <span>+ เพิ่มเมนูใหม่</span>
        </button>
        <div class="search-box">
          <input type="text" placeholder="ค้นหาเมนู..." v-model="searchTerm" @input="filterMenus" />
          <i class="search-icon">🔍</i>
        </div>
      </div>
    </div>

    <div class="menu-filters">
      <button 
        class="filter-btn" 
        :class="{ active: activeFilter === 'all' }" 
        @click="setFilter('all')"
      >
        ทั้งหมด
      </button>
      <button 
        class="filter-btn" 
        :class="{ active: activeFilter === 'popular' }" 
        @click="setFilter('popular')"
      >
        ยอดนิยม
      </button>
      <button 
        class="filter-btn" 
        :class="{ active: activeFilter === 'new' }" 
        @click="setFilter('new')"
      >
        มาใหม่
      </button>
    </div>

    <!-- แสดงตัวโหลดข้อมูล -->
    <div v-if="loading" class="loading-indicator">
      กำลังโหลดข้อมูล...
    </div>

    <!-- แสดงข้อความเมื่อไม่มีเมนู -->
    <div v-else-if="filteredMenus.length === 0" class="empty-state">
      <div class="empty-icon">🍽️</div>
      <h3>ไม่พบเมนูอาหาร</h3>
      <p v-if="searchTerm">ไม่พบเมนูที่ตรงกับคำค้นหา "{{ searchTerm }}"</p>
      <p v-else>ยังไม่มีเมนูอาหารในระบบ</p>
      <button class="add-menu-btn" @click="$router.push('/add-menu')">เพิ่มเมนูใหม่</button>
    </div>

    <!-- รายการเมนู -->
    <div v-else class="menu-grid">
      <div class="menu-card" v-for="(menu, index) in filteredMenus" :key="index">
        <div class="menu-image">
          <img v-if="menu.image_url" :src="menu.image_url" :alt="menu.name" />
          <div v-else class="no-image">ไม่มีรูปภาพ</div>
        </div>
        <div class="menu-info">
          <h3>{{ menu.name }}</h3>
          <p class="menu-description">{{ menu.description }}</p>
          <div class="menu-price">{{ menu.price }} บาท</div>
        </div>
        <div class="menu-actions">
          <button class="edit-btn" @click="editMenu(menu)">แก้ไข</button>
          <button class="delete-btn" @click="confirmDelete(menu)">ลบ</button>
        </div>
      </div>
    </div>

    <!-- Modal ยืนยันการลบ -->
    <div class="delete-modal" v-if="showDeleteModal">
      <div class="modal-content">
        <h3>ยืนยันการลบเมนู</h3>
        <p>คุณต้องการลบเมนู "{{ menuToDelete.name }}" ใช่หรือไม่?</p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="cancelDelete">ยกเลิก</button>
          <button class="confirm-btn" @click="deleteMenu">ยืนยันการลบ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      menus: [],
      filteredMenus: [],
      loading: true,
      searchTerm: '',
      activeFilter: 'all',
      showDeleteModal: false,
      menuToDelete: {}
    };
  },
  mounted() {
    this.fetchMenus();
  },
  methods: {
    fetchMenus() {
      this.loading = true;
      axios.get('http://localhost:5000/menus')
        .then(response => {
          this.menus = response.data;
          this.filteredMenus = [...this.menus];  // ใช้ข้อมูลที่ดึงมาใน initial state
          this.loading = false;
        })
        .catch(error => {
          console.error('เกิดข้อผิดพลาดในการดึงข้อมูลเมนู:', error);
          this.loading = false;
        });
    },
    filterMenus() {
      if (!this.searchTerm) {
        this.filteredMenus = [...this.menus];
      } else {
        const term = this.searchTerm.toLowerCase();
        this.filteredMenus = this.menus.filter(menu => 
          menu.name.toLowerCase().includes(term) || 
          menu.description.toLowerCase().includes(term)
        );
      }

      this.applyFilter();  // เรียกใช้ filter หลังจากกรอง
    },
    setFilter(filter) {
      this.activeFilter = filter;
      this.applyFilter();
    },
    applyFilter() {
      if (this.activeFilter === 'popular') {
        this.filteredMenus.sort((a, b) => b.price - a.price);  // ตัวอย่างการกรองตามยอดนิยม
      } else if (this.activeFilter === 'new') {
        this.filteredMenus.reverse();  // ตัวอย่างการกรองเมนูใหม่
      }
    },
    editMenu(menu) {
      this.$router.push(`/edit-menu/${menu.id}`);
    },
    confirmDelete(menu) {
      this.menuToDelete = menu;
      this.showDeleteModal = true;
    },
    cancelDelete() {
      this.showDeleteModal = false;
      this.menuToDelete = {};
    },
    deleteMenu() {
      axios.delete(`http://localhost:5000/menus/${this.menuToDelete.id}`)
        .then(() => {
          this.menus = this.menus.filter(menu => menu.id !== this.menuToDelete.id);
          this.filterMenus();  // รีเฟรชเมนูที่กรอง
          this.showDeleteModal = false;
          this.menuToDelete = {};
          alert('ลบเมนูสำเร็จ');
        })
        .catch(error => {
          console.error('เกิดข้อผิดพลาดในการลบเมนู:', error);
          alert('เกิดข้อผิดพลาดในการลบเมนู');
          this.showDeleteModal = false;
        });
    }
  }
};
</script>

<style scoped>
/* สไตล์ทั่วไป */
.menu-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Prompt', 'Kanit', sans-serif;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.add-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background-color: #45a049;
}

.search-box {
  position: relative;
}

.search-box input {
  padding: 10px 16px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 240px;
  font-size: 14px;
}

.search-box input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.15);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  font-size: 16px;
}

/* Menu Filters */
.menu-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
}

.filter-btn {
  padding: 8px 20px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background-color: #e8e8e8;
}

.filter-btn.active {
  background-color: #4CAF50;
  color: white;
}

/* Loading & Empty States */
.loading-indicator, .empty-state {
  text-align: center;
  padding: 60px 0;
  color: #666;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 20px;
  margin: 0 0 10px 0;
  color: #333;
}

.empty-state p {
  color: #666;
  margin-bottom: 25px;
}

.add-menu-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
}

/* Menu Grid */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.menu-card {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 400px; /* กำหนดความสูงของการ์ด */
  display: flex;
  flex-direction: column;
}

.menu-image {
  height: 200px; /* กำหนดความสูงของภาพ */
  overflow: hidden;
  background-color: #f9f9f9;
  border: 10px solid red;
  width: 100%;
}

.menu-image img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* ทำให้ภาพไม่เบี้ยวและไม่ขยายเกินขอบการ์ด */
}

.menu-info {
  padding: 15px;
  flex-grow: 1; /* ทำให้เนื้อหาภายในการ์ดเติบโตเต็มที่ */
}

.menu-actions {
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
}

.edit-btn, .delete-btn {
  flex: 1;
  padding: 8px 0;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-btn {
  background-color: #2196F3;
  color: white;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.menu-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* Delete Modal */
.delete-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background-color: white;
  border-radius: 10px;
  padding: 25px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
  font-size: 18px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
}

.cancel-btn, .confirm-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #e0e0e0;
  color: #333;
}

.confirm-btn {
  background-color: #f44336;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    margin-top: 15px;
  }
  
  .search-box {
    flex-grow: 1;
  }
  
  .search-box input {
    width: 100%;
  }
  
  .menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 480px) {
  .menu-list-container {
    padding: 15px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .menu-filters {
    overflow-x: auto;
    padding-bottom: 5px;
  }
  
  .menu-grid {
    grid-template-columns: 1fr;
  }
}
</style>
