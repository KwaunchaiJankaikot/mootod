<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">รายการเมนูอาหาร</h1>
      <router-link
        to="/add-menu"
        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center"
      >
        <i class="fas fa-plus mr-2"></i> เพิ่มเมนูใหม่
      </router-link>
    </div>

    <div
      v-if="errorMessage"
      class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
    >
      <div class="flex items-center">
        <i class="fas fa-exclamation-circle mr-2"></i>
        <p>{{ errorMessage }}</p>
      </div>
    </div>

    <div
      v-if="successMessage"
      class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 flex items-center"
    >
      <i class="fas fa-check-circle mr-2"></i>
      <p>{{ successMessage }}</p>
    </div>

    <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div class="p-4 bg-gray-50 border-b flex justify-between items-center">
        <div class="font-medium">รายการทั้งหมด ({{ menus.length }} รายการ)</div>
        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="ค้นหาเมนู..."
            class="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-8"
          />
          <i class="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
        </div>
      </div>

      <div v-if="isLoading" class="p-12 flex justify-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
        ></div>
      </div>

      <div
        v-else-if="filteredMenus.length === 0 && !isLoading"
        class="p-12 text-center text-gray-500"
      >
        <i class="fas fa-utensils text-gray-300 text-5xl mb-4"></i>
        <p v-if="searchQuery">ไม่พบเมนูที่ตรงกับคำค้นหา "{{ searchQuery }}"</p>
        <p v-else>ยังไม่มีรายการเมนูในระบบ</p>
        <div class="mt-4">
          <router-link
            to="/add-menu"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            เพิ่มเมนูใหม่
          </router-link>
        </div>
      </div>

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
      >
        <div
          v-for="menu in filteredMenus"
          :key="menu.id"
          class="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition"
        >
          <div class="relative h-48 bg-gray-100">
            <img
              :src="menu.image_url"
              :alt="menu.name"
              class="w-full h-full object-cover"
              @error="handleImageError($event, menu)"
            />
            <div class="absolute top-2 right-2">
              <span
                class="bg-green-500 text-white px-2 py-1 rounded text-sm font-medium"
              >
                {{ Number(menu.price).toFixed(2) }} บาท
              </span>
            </div>
          </div>

          <div class="p-4">
            <h3 class="font-bold text-lg mb-2">{{ menu.name }}</h3>
            <p class="text-gray-600 text-sm mb-4">
              {{ truncateDescription(menu.description) }}
            </p>

            <div class="flex justify-between mt-2">
              <router-link
                :to="'/edit-menu/' + menu.id"
                class="text-blue-600 hover:text-blue-800 transition flex items-center text-sm"
              >
                <i class="fas fa-edit mr-1"></i> แก้ไข
              </router-link>

              <button
                @click="confirmDelete(menu)"
                class="text-red-600 hover:text-red-800 transition flex items-center text-sm"
              >
                <i class="fas fa-trash-alt mr-1"></i> ลบ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal สำหรับยืนยันการลบ -->
    <div
      v-if="showConfirmModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4">
        <div class="mb-4">
          <div class="text-center text-red-500 mb-4">
            <i class="fas fa-exclamation-triangle text-4xl"></i>
          </div>
          <h3 class="text-lg font-bold text-center mb-2">ยืนยันการลบเมนู</h3>
          <p class="text-gray-600 text-center">
            คุณต้องการลบเมนู
            <span class="font-semibold">{{
              menuToDelete ? menuToDelete.name : ""
            }}</span>
            ใช่หรือไม่? <br />การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </p>
        </div>

        <div class="flex justify-center space-x-3">
          <button
            @click="cancelDelete"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
          >
            ยกเลิก
          </button>
          <button
            @click="deleteMenu"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center"
            :disabled="isDeleting"
          >
            <i class="fas fa-spinner fa-spin mr-2" v-if="isDeleting"></i>
            {{ isDeleting ? "กำลังลบ..." : "ลบเมนู" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "MenuList",
  data() {
    return {
      menus: [],
      searchQuery: "",
      isLoading: false,
      isDeleting: false,
      errorMessage: "",
      successMessage: "",
      showConfirmModal: false,
      menuToDelete: null,
    };
  },
  computed: {
    filteredMenus() {
      if (!this.searchQuery) return this.menus;

      const query = this.searchQuery.toLowerCase();
      return this.menus.filter(
        (menu) =>
          menu.name.toLowerCase().includes(query) ||
          menu.description.toLowerCase().includes(query)
      );
    },
  },
  created() {
    this.fetchMenus();
  },
  methods: {
    async fetchMenus() {
      try {
        this.isLoading = true;
        this.errorMessage = "";

        const response = await axios.get("http://localhost:5000/menus");
        this.menus = response.data;
      } catch (error) {
        console.error("Error fetching menus:", error);
        this.errorMessage = "ไม่สามารถดึงข้อมูลเมนูได้ กรุณาลองใหม่อีกครั้ง";
      } finally {
        this.isLoading = false;
      }
    },

   truncateDescription(description) {
  return description.length > 80 ? description.substring(0, 80) + '...' : description;
},

    handleImageError(event, menu) {
      event.target.src = "https://via.placeholder.com/300x200?text=ไม่พบรูปภาพ";
    },

    confirmDelete(menu) {
      this.menuToDelete = menu;
      this.showConfirmModal = true;
    },

    cancelDelete() {
      this.showConfirmModal = false;
      this.menuToDelete = null;
    },

    async deleteMenu() {
      if (!this.menuToDelete) return;

      try {
        this.isDeleting = true;

        await axios.delete(
          `http://localhost:5000/menus/${this.menuToDelete.id}`
        );

        // อัปเดตรายการเมนูหลังจากลบ
        this.menus = this.menus.filter(
          (menu) => menu.id !== this.menuToDelete.id
        );

        // แสดงข้อความสำเร็จ
        this.successMessage = `ลบเมนู "${this.menuToDelete.name}" สำเร็จแล้ว`;

        // ปิด modal
        this.showConfirmModal = false;
        this.menuToDelete = null;

        // ล้างข้อความแจ้งเตือนหลังจาก 3 วินาที
        setTimeout(() => {
          this.successMessage = "";
        }, 3000);
      } catch (error) {
        console.error("Error deleting menu:", error);
        this.errorMessage = "ไม่สามารถลบเมนูได้ กรุณาลองใหม่อีกครั้ง";
        this.showConfirmModal = false;
      } finally {
        this.isDeleting = false;
      }
    },
  },
};
</script>

<style scoped>
/* เพิ่ม transition สำหรับ hover effects */
.transition {
  transition: all 0.3s ease;
}

/* เพิ่ม animation สำหรับ spinner */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>