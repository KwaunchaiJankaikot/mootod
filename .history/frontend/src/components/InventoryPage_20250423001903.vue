<template>
  <div class="inventory-container">
    <div class="inventory-header">
      <h1>จัดการวัตถุดิบ</h1>
      <button @click="showAddForm = true" class="add-button">
        <i class="add-icon">+</i>
        <span>เพิ่มวัตถุดิบใหม่</span>
      </button>
    </div>

    <!-- ตารางแสดงวัตถุดิบ -->
    <div class="inventory-table-container">
      <table class="inventory-table">
        <thead>
          <tr>
            <th>รูปภาพ</th>
            <th>ชื่อวัตถุดิบ</th>
            <th>จำนวนคงเหลือ</th>
            <th>หน่วย</th>
            <th>ราคาต่อหน่วย</th>
            <th>วันที่รับเข้า</th>
            <th>สถานะ</th>
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in inventoryItems" :key="item.id">
            <td>
              <img
                v-if="item.image_url"
                :src="item.image_url"
                alt="รูปวัตถุดิบ"
                class="inventory-image"
              />
              <div v-else class="no-image">ไม่มีรูป</div>
            </td>
            <td>{{ item.name }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.unit }}</td>
            <td>{{ item.price_per_unit }} บาท</td>
            <td>{{ formatDate(item.received_date) }}</td>
            <td>
              <span
                :class="{
                  'status-low': item.quantity < item.min_quantity,
                  'status-ok': item.quantity >= item.min_quantity,
                }"
              >
                {{ item.quantity < item.min_quantity ? "ใกล้หมด" : "ปกติ" }}
              </span>
            </td>
            <td class="action-buttons">
              <button @click="editItem(item)" class="edit-button">แก้ไข</button>
              <button @click="confirmDelete(item.id)" class="delete-button">
                ลบ
              </button>
            </td>
          </tr>
          <tr v-if="inventoryItems.length === 0">
            <td colspan="8" class="no-data">ไม่พบข้อมูลวัตถุดิบ</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ฟอร์มเพิ่มวัตถุดิบ -->
    <div v-if="showAddForm" class="modal-overlay">
      <div class="modal-content">
        <h2>เพิ่มวัตถุดิบใหม่</h2>
        <form @submit.prevent="addInventoryItem">
          <div class="form-group">
            <label for="name">ชื่อวัตถุดิบ</label>
            <input
              type="text"
              id="name"
              v-model="newItem.name"
              required
              class="form-control"
              placeholder="ใส่ชื่อวัตถุดิบ"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="quantity">จำนวน</label>
              <input
                type="number"
                id="quantity"
                v-model="newItem.quantity"
                required
                class="form-control"
                min="0"
                step="0.01"
              />
            </div>

            <div class="form-group">
              <label for="unit">หน่วย</label>
              <select id="unit" v-model="newItem.unit" required class="form-control">
                <option value="กรัม">กรัม</option>
                <option value="กิโลกรัม">กิโลกรัม</option>
                <option value="มิลลิลิตร">มิลลิลิตร</option>
                <option value="ลิตร">ลิตร</option>
                <option value="ชิ้น">ชิ้น</option>
                <option value="อัน">อัน</option>
                <option value="ถุง">ถุง</option>
                <option value="กล่อง">กล่อง</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="price_per_unit">ราคาต่อหน่วย (บาท)</label>
              <input
                type="number"
                id="price_per_unit"
                v-model="newItem.price_per_unit"
                required
                class="form-control"
                min="0"
                step="0.01"
              />
            </div>

            <div class="form-group">
              <label for="min_quantity">จำนวนขั้นต่ำ</label>
              <input
                type="number"
                id="min_quantity"
                v-model="newItem.min_quantity"
                required
                class="form-control"
                min="0"
                step="0.01"
                placeholder="แจ้งเตือนเมื่อน้อยกว่า"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="received_date">วันที่รับเข้า</label>
            <input
              type="date"
              id="received_date"
              v-model="newItem.received_date"
              required
              class="form-control"
            />
          </div>

          <div class="form-group file-upload">
            <label for="image">
              <div class="upload-area">
                <i class="upload-icon">📷</i>
                <span>อัปโหลดรูปภาพ</span>
                <span class="filename" v-if="imageName">{{ imageName }}</span>
              </div>
            </label>
            <input
              type="file"
              id="image"
              @change="onImageChange"
              accept="image/*"
              class="file-input"
            />
          </div>

          <div class="form-buttons">
            <button type="submit" class="submit-button">บันทึก</button>
            <button type="button" @click="cancelAdd" class="cancel-button">
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ฟอร์มแก้ไขวัตถุดิบ -->
    <div v-if="showEditForm" class="modal-overlay">
      <div class="modal-content">
        <h2>แก้ไขวัตถุดิบ</h2>
        <form @submit.prevent="updateInventoryItem">
          <div class="form-group">
            <label for="edit-name">ชื่อวัตถุดิบ</label>
            <input
              type="text"
              id="edit-name"
              v-model="editingItem.name"
              required
              class="form-control"
              placeholder="ใส่ชื่อวัตถุดิบ"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="edit-quantity">จำนวน</label>
              <input
                type="number"
                id="edit-quantity"
                v-model="editingItem.quantity"
                required
                class="form-control"
                min="0"
                step="0.01"
              />
            </div>

            <div class="form-group">
              <label for="edit-unit">หน่วย</label>
              <select
                id="edit-unit"
                v-model="editingItem.unit"
                required
                class="form-control"
              >
                <option value="กรัม">กรัม</option>
                <option value="กิโลกรัม">กิโลกรัม</option>
                <option value="มิลลิลิตร">มิลลิลิตร</option>
                <option value="ลิตร">ลิตร</option>
                <option value="ชิ้น">ชิ้น</option>
                <option value="อัน">อัน</option>
                <option value="ถุง">ถุง</option>
                <option value="กล่อง">กล่อง</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="edit-price_per_unit">ราคาต่อหน่วย (บาท)</label>
              <input
                type="number"
                id="edit-price_per_unit"
                v-model="editingItem.price_per_unit"
                required
                class="form-control"
                min="0"
                step="0.01"
              />
            </div>

            <div class="form-group">
              <label for="edit-min_quantity">จำนวนขั้นต่ำ</label>
              <input
                type="number"
                id="edit-min_quantity"
                v-model="editingItem.min_quantity"
                required
                class="form-control"
                min="0"
                step="0.01"
                placeholder="แจ้งเตือนเมื่อน้อยกว่า"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="edit-received_date">วันที่รับเข้า</label>
            <input
              type="date"
              id="edit-received_date"
              v-model="editingItem.received_date"
              required
              class="form-control"
            />
          </div>

          <div class="form-group file-upload">
            <label for="edit-image">
              <div class="upload-area">
                <i class="upload-icon">📷</i>
                <span>อัปโหลดรูปภาพใหม่</span>
                <span class="filename" v-if="editImageName">{{ editImageName }}</span>
              </div>
            </label>
            <input
              type="file"
              id="edit-image"
              @change="onEditImageChange"
              accept="image/*"
              class="file-input"
            />
          </div>

          <!-- แสดงรูปเดิมหากมีอยู่ -->
          <div
            v-if="editingItem.image_url && !editingItem.newImage"
            class="existing-image"
          >
            <p>รูปภาพปัจจุบัน:</p>
            <div class="action">
              <img
                :src="editingItem.image_url"
                alt="Current Image"
                class="current-image"
              />
              <!-- ปุ่มลบรูปภาพ -->
              <button
                type="button"
                @click="deleteEditImage"
                class="delete-image-btn"
              >
                ลบรูปภาพ
              </button>
            </div>
          </div>

          <div class="form-buttons">
            <button type="submit" class="submit-button">บันทึก</button>
            <button type="button" @click="cancelEdit" class="cancel-button">
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ยืนยันการลบ -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal-content confirm-dialog">
        <h2>ยืนยันการลบ</h2>
        <p>คุณต้องการลบวัตถุดิบนี้ใช่หรือไม่?</p>
        <div class="confirm-buttons">
          <button @click="deleteInventoryItem" class="delete-button">
            ยืนยัน
          </button>
          <button @click="cancelDelete" class="cancel-button">ยกเลิก</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'InventoryPage',
  data() {
    return {
      inventoryItems: [],
      showAddForm: false,
      showEditForm: false,
      showDeleteConfirm: false,
      deleteItemId: null,
      imageName: "",
      editImageName: "",
      newItem: {
        name: "",
        quantity: 0,
        unit: "กรัม",
        price_per_unit: 0,
        min_quantity: 0,
        received_date: new Date().toISOString().substr(0, 10),
        image: null,
      },
      editingItem: {
        id: null,
        name: "",
        quantity: 0,
        unit: "",
        price_per_unit: 0,
        min_quantity: 0,
        received_date: "",
        image_url: "",
        newImage: null,
      },
    };
  },
  mounted() {
    this.fetchInventoryItems();
  },
  methods: {
    // ดึงรายการวัตถุดิบทั้งหมด
    fetchInventoryItems() {
      axios
        .get("http://localhost:5000/inventory")
        .then((response) => {
  this.inventoryItems = response.data;
})
        .catch((error) => {
          console.error("ไม่สามารถดึงข้อมูลวัตถุดิบได้:", error);
          alert("เกิดข้อผิดพลาดในการดึงข้อมูลวัตถุดิบ");
        });
    },

    // จัดการไฟล์ภาพสำหรับเพิ่มใหม่
    onImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.newItem.image = file;
        this.imageName = file.name;
      } else {
        this.newItem.image = null;
        this.imageName = "";
      }
    },

    // จัดการไฟล์ภาพสำหรับแก้ไข
    onEditImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.editingItem.newImage = file;
        this.editImageName = file.name;
      } else {
        this.editingItem.newImage = null;
        this.editImageName = "";
      }
    },

    // ลบรูปภาพในโหมดแก้ไข
    deleteEditImage() {
      this.editingItem.image_url = "";
      this.editingItem.newImage = null;
      this.editImageName = "";
    },

    // เพิ่มวัตถุดิบใหม่
    addInventoryItem() {
      const formData = new FormData();
      formData.append("name", this.newItem.name);
      formData.append("quantity", this.newItem.quantity);
      formData.append("unit", this.newItem.unit);
      formData.append("price_per_unit", this.newItem.price_per_unit);
      formData.append("min_quantity", this.newItem.min_quantity);
      formData.append("received_date", this.newItem.received_date);

      if (this.newItem.image) {
        formData.append("image", this.newItem.image);
      }

      axios
        .post("http://localhost:5000/inventory", formData)
        .then(() => {
          alert("เพิ่มวัตถุดิบสำเร็จ!");
          this.fetchInventoryItems();
          this.cancelAdd();
        })
        .catch((error) => {
          console.error("เกิดข้อผิดพลาดในการเพิ่มวัตถุดิบ:", error);
          alert("เกิดข้อผิดพลาดในการเพิ่มวัตถุดิบ");
        });
    },

    // เริ่มการแก้ไขวัตถุดิบ
    editItem(item) {
      this.editingItem = {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price_per_unit: item.price_per_unit,
        min_quantity: item.min_quantity,
        received_date: item.received_date.substr(0, 10),
        image_url: item.image_url,
        newImage: null,
      };
      this.showEditForm = true;
      this.editImageName = "";
    },

    // อัปเดตวัตถุดิบ
    updateInventoryItem() {
      const formData = new FormData();
      formData.append("name", this.editingItem.name);
      formData.append("quantity", this.editingItem.quantity);
      formData.append("unit", this.editingItem.unit);
      formData.append("price_per_unit", this.editingItem.price_per_unit);
      formData.append("min_quantity", this.editingItem.min_quantity);
      formData.append("received_date", this.editingItem.received_date);

      if (this.editingItem.newImage) {
        formData.append("image", this.editingItem.newImage);
      }

      axios
        .put(
          `http://localhost:5000/inventory/${this.editingItem.id}`,
          formData
        )
        .then(() => {
          alert("อัปเดตวัตถุดิบสำเร็จ!");
          this.fetchInventoryItems();
          this.cancelEdit();
        })
        .catch((error) => {
          console.error("เกิดข้อผิดพลาดในการอัปเดตวัตถุดิบ:", error);
          alert("เกิดข้อผิดพลาดในการอัปเดตวัตถุดิบ");
        });
    },

    // ยืนยันการลบวัตถุดิบ
    confirmDelete(id) {
      this.deleteItemId = id;
      this.showDeleteConfirm = true;
    },

    // ลบวัตถุดิบ
    deleteInventoryItem() {
      axios
        .delete(`http://localhost:5000/inventory/${this.deleteItemId}`)
        .then(() => {
          alert("ลบวัตถุดิบสำเร็จ!");
          this.fetchInventoryItems();
          this.cancelDelete();
        })
        .catch((error) => {
          console.error("เกิดข้อผิดพลาดในการลบวัตถุดิบ:", error);
          alert("เกิดข้อผิดพลาดในการลบวัตถุดิบ");
        });
    },

    // ยกเลิกการเพิ่ม
    cancelAdd() {
      this.showAddForm = false;
      this.newItem = {
        name: "",
        quantity: 0,
        unit: "กรัม",
        price_per_unit: 0,
        min_quantity: 0,
        received_date: new Date().toISOString().substr(0, 10),
        image: null,
      };
      this.imageName = "";
    },

    // ยกเลิกการแก้ไข
    cancelEdit() {
      this.showEditForm = false;
      this.editingItem = {
        id: null,
        name: "",
        quantity: 0,
        unit: "",
        price_per_unit: 0,
        min_quantity: 0,
        received_date: "",
        image_url: "",
        newImage: null,
      };
      this.editImageName = "";
    },

    // ยกเลิกการลบ
    cancelDelete() {
      this.showDeleteConfirm = false;
      this.deleteItemId = null;
    },

    // จัดรูปแบบวันที่
    formatDate(dateString) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString("th-TH", options);
    },
  },
};
</script>

<style scoped>
/* สไตล์ทั่วไป */
.inventory-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Prompt", "Kanit", sans-serif;
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.inventory-header h1 {
  color: #333;
  font-size: 28px;
  margin: 0;
}

.add-button {
  display: flex;
  align-items: center;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-button:hover {
  background-color: #45a049;
}

.add-icon {
  font-size: 20px;
  margin-right: 8px;
}

/* ตาราง */
.inventory-table-container {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 30px;
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
}

.inventory-table th,
.inventory-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.inventory-table th {
  background-color: #f9f9f9;
  font-weight: 600;
  color: #333;
}

.inventory-table tbody tr:hover {
  background-color: #f5f5f5;
}

.inventory-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.no-image {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  color: #888;
}

.status-low {
  color: #f44336;
  font-weight: 500;
}

.status-ok {
  color: #4caf50;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-button {
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.edit-button:hover {
  background-color: #1976d2;
}

.delete-button {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.delete-button:hover {
  background-color: #d32f2f;
}

.no-data {
  text-align: center;
  padding: 30px;
  color: #888;
  font-style: italic;
}

/* โมดัล */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 10px;
  padding: 30px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-content h2 {
  color: #333;
  margin-top: 0;
  margin-bottom: 20px;
}

/* ฟอร์ม */
.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-row .form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  transition: border 0.3s ease;
}

.form-control:focus {
  border-color: #4caf50;
  outline: none;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.15);
}

/* อัปโหลดไฟล์ */
.file-upload {
  margin-bottom: 25px;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 6px;
  padding: 25px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #4caf50;
  background-color: rgba(76, 175, 80, 0.05);
}

.upload-icon {
  display: block;
  font-size: 32px;
  margin-bottom: 10px;
}

.file-input {
  display: none;
}

.filename {
  display: block;
  margin-top: 10px;
  font-size: 13px;
  color: #4caf50;
  word-break: break-all;
}

/* ปุ่มในฟอร์ม */
.form-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.submit-button {
  flex: 1;
  padding: 14px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.15s ease;
}

.submit-button:hover {
  background-color: #45a049;
}

.submit-button:active {
  transform: scale(0.98);
}

.cancel-button {
  flex: 1;
  padding: 14px;
  background-color: #f5f5f5;
  color: #555;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.15s ease;
}

.cancel-button:hover {
  background-color: #e0e0e0;
}

.cancel-button:active {
  transform: scale(0.98);
}

/* กล่องยืนยันการลบ */
.confirm-dialog {
  width: 400px;
  text-align: center;
}

.confirm-dialog p {
  margin-bottom: 20px;
  color: #555;
}

.confirm-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.existing-image {
  margin-top: 15px;
  margin-bottom: 20px;
}

.current-image {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 6px;
  margin-bottom: 10px;
}

.delete-image-btn {
  width: 100%;
  padding: 10px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.delete-image-btn:hover {
  background-color: #d32f2f;
}

.action {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>