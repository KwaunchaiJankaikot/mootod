<template>
  <div class="inventory-container">
    <div class="inventory-header">
      <h1>จัดการวัตถุดิบ</h1>
      <div class="button-all">
        <button @click="showAddForm = true" class="add-button">
          <i class="add-icon">+</i>
          <span>เพิ่มวัตถุดิบใหม่</span>
        </button>
        <button @click="showCalculateForm = true" class="calculate-button">
          <i class="add-icon">=</i>
          <span>คำนวณราคาที่ควรขาย</span>
        </button>
      </div>
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
            <th>หมายเหตุ</th>
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in inventoryItems" :key="item.id">
            <td>
              <img v-if="item.image_url" :src="item.image_url" alt="รูปวัตถุดิบ" class="inventory-image" />
              <div v-else class="no-image">ไม่มีรูป</div>
            </td>
            <td>{{ item.name }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.unit }}</td>
            <td>{{ item.price_per_unit }} บาท</td>
            <td>{{ formatDate(item.received_date) }}</td>
            <td>
              <span :class="{
                'status-low': item.quantity < item.min_quantity,
                'status-ok': item.quantity >= item.min_quantity,
              }">
                {{ item.quantity < item.min_quantity ? "ใกล้หมด" : "ปกติ" }} </span>
            </td>
            <td>{{ item.notes }}</td>
            <td class="action-buttons">
              <button @click="editItem(item)" class="edit-button">แก้ไข</button>
              <button @click="confirmDelete(item.id)" class="delete-button">
                ลบ
              </button>
            </td>
          </tr>
          <tr v-if="inventoryItems.length === 0">
            <td colspan="9" class="no-data">ไม่พบข้อมูลวัตถุดิบ</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- คำนวณต้นทุนและกำไร -->
    <div v-if="showCalculateForm" class="calculate-form">
      <h3>คำนวณต้นทุนและกำไร</h3>

      <!-- เลือกวัตถุดิบ -->
      <div class="form-group">
        <label for="ingredient">เลือกวัตถุดิบ:</label>
        <select id="ingredient" v-model="selectedIngredient" @change="updateMaxAmount" class="form-control">
          <option value="">-- เลือกวัตถุดิบ --</option>
          <option v-for="item in inventoryItems" :key="item.id" :value="item.id">
            {{ item.name }} - {{ item.price_per_unit }} บาท/{{ item.unit }}
          </option>
        </select>
      </div>

      <!-- จำนวนที่ใช้ (กรัม) -->
      <div class="form-group">
        <label for="ingredientAmount">จำนวนที่ใช้ (กรัม): </label>
        <input type="number" id="ingredientAmount" v-model="ingredientAmount" class="form-control"
          :max="maxAmountInGrams" min="0" step="0.01" placeholder="กรอกจำนวนที่ต้องการใช้" />
        <small v-if="selectedIngredient" class="form-text text-muted">
          จำนวนทั้งหมดที่มี: {{ maxAmountInGrams }} กรัม
        </small>
      </div>

      <!-- กำไรที่ต้องการ -->
      <div class="form-group">
        <label for="profitMargin">กำไร (%) :</label>
        <input type="number" id="profitMargin" v-model="profitMargin" class="form-control" placeholder="เปอร์เซ็นต์กำไร"
          min="0" step="1" />
        <small class="form-text text-muted">
          สามารถกำหนดเปอร์เซ็นต์กำไรได้ตามต้องการ เช่น 5%, 10%, 20%
        </small>
      </div>

      <!-- ปุ่มเพิ่ม/ปิดรายการ -->
      <div class="form-group">
        <button @click="addItemToList" class="btn btn-primary">เพิ่มรายการ</button>
        <button @click="showCalculateForm = false" class="btn btn-danger ">ปิด</button>
      </div>
      
      <!-- แสดงรายการทั้งหมดที่เพิ่ม -->
      <div v-if="addedItems.length > 0" class="added-items">
        <h4>รายการวัตถุดิบที่ใช้:</h4>
        <table class="table">
          <thead>
            <tr>
              <th>วัตถุดิบ</th>
              <th>จำนวน</th>
              <th>ต้นทุน</th>
              <th>กำไร</th>
              <th>ราคาขาย</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in addedItems" :key="index">
              <td>{{ item.name }}</td>
              <td>{{ item.amount }} {{ item.unit }}</td>
              <td>{{ item.costPrice.toFixed(2) }} บาท</td>
              <td>{{ item.profitMargin }}%</td>
              <td>{{ item.price }} บาท</td>
              <td>
                <button @click="removeItem(index)" class="btn btn-danger btn-sm">ลบ</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- สรุปผลการคำนวณ -->
        <div class="calculation-summary">
          <div class="price-summary">
            <div class="summary-item">
              <strong>ต้นทุนรวม:</strong> {{ calculatedCost }} บาท
            </div>
            <div class="summary-item">
              <strong>ราคาขายรวม:</strong> {{ calculatedPrice }} บาท
            </div>
            <div class="summary-item">
              <strong>กำไรรวม:</strong> {{ totalProfit }} บาท ({{ totalProfitPercent }}%)
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- ฟอร์มเพิ่มวัตถุดิบ -->
    <div v-if="showAddForm" class="modal-overlay">
      <div class="modal-content">
        <h2>เพิ่มวัตถุดิบใหม่</h2>
        <form @submit.prevent="addInventoryItem">
          <div class="form-group">
            <label for="name">ชื่อวัตถุดิบ</label>
            <input type="text" id="name" v-model="newItem.name" required class="form-control"
              placeholder="ใส่ชื่อวัตถุดิบ" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="quantity">จำนวน</label>
              <input type="number" id="quantity" v-model="newItem.quantity" required class="form-control" min="0"
                step="0.01" />
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
              <input type="number" id="price_per_unit" v-model="newItem.price_per_unit" required class="form-control"
                min="0" step="0.01" />
            </div>

            <div class="form-group">
              <label for="min_quantity">จำนวนขั้นต่ำ</label>
              <input type="number" id="min_quantity" v-model="newItem.min_quantity" required class="form-control"
                min="0" step="0.01" placeholder="แจ้งเตือนเมื่อน้อยกว่า" />
            </div>
          </div>

          <div class="form-group">
            <label for="received_date">วันที่รับเข้า</label>
            <input type="date" id="received_date" v-model="newItem.received_date" required class="form-control" />
          </div>

          <div class="form-group">
            <label for="notes">หมายเหตุ</label>
            <textarea id="notes" v-model="newItem.notes" class="form-control" placeholder="ใส่หมายเหตุ (ถ้ามี)"
              rows="3"></textarea>
          </div>

          <div class="form-group file-upload">
            <label for="image">
              <div class="upload-area">
                <i class="upload-icon">📷</i>
                <span>อัปโหลดรูปภาพ</span>
                <span class="filename" v-if="imageName">{{ imageName }}</span>
              </div>
            </label>
            <input type="file" id="image" @change="onImageChange" accept="image/*" class="file-input" />
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
            <input type="text" id="edit-name" v-model="editingItem.name" required class="form-control"
              placeholder="ใส่ชื่อวัตถุดิบ" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="edit-quantity">จำนวน</label>
              <input type="number" id="edit-quantity" v-model="editingItem.quantity" required class="form-control"
                min="0" step="0.01" />
            </div>

            <div class="form-group">
              <label for="edit-unit">หน่วย</label>
              <select id="edit-unit" v-model="editingItem.unit" required class="form-control">
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
              <input type="number" id="edit-price_per_unit" v-model="editingItem.price_per_unit" required
                class="form-control" min="0" step="0.01" />
            </div>

            <div class="form-group">
              <label for="edit-min_quantity">จำนวนขั้นต่ำ</label>
              <input type="number" id="edit-min_quantity" v-model="editingItem.min_quantity" required
                class="form-control" min="0" step="0.01" placeholder="แจ้งเตือนเมื่อน้อยกว่า" />
            </div>
          </div>

          <div class="form-group">
            <label for="edit-received_date">วันที่รับเข้า</label>
            <input type="date" id="edit-received_date" v-model="editingItem.received_date" required
              class="form-control" />
          </div>

          <div class="form-group">
            <label for="edit-notes">หมายเหตุ</label>
            <textarea id="edit-notes" v-model="editingItem.notes" class="form-control" placeholder="ใส่หมายเหตุ (ถ้ามี)"
              rows="3"></textarea>
          </div>

          <div class="form-group file-upload">
            <label for="edit-image">
              <div class="upload-area">
                <i class="upload-icon">📷</i>
                <span>อัปโหลดรูปภาพใหม่</span>
                <span class="filename" v-if="editImageName">{{
                  editImageName
                }}</span>
              </div>
            </label>
            <input type="file" id="edit-image" @change="onEditImageChange" accept="image/*" class="file-input" />
          </div>

          <!-- แสดงรูปเดิมหากมีอยู่ -->
          <div v-if="editingItem.image_url && !editingItem.newImage" class="existing-image">
            <p>รูปภาพปัจจุบัน:</p>
            <div class="action">
              <img :src="editingItem.image_url" alt="Current Image" class="current-image" />
              <!-- ปุ่มลบรูปภาพ -->
              <button type="button" @click="deleteEditImage" class="delete-image-btn">
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
  name: "InventoryPage",
  data() {
    return {
      inventoryItems: [],
      showAddForm: false,
      selectedIngredient: "",
      ingredientAmount: 0,
      maxAmountInGrams: 0,
      profitMargin: 0,
      addedItems: [],
      calculatedPrice: null,
      calculatedCost: null,
      totalProfit: null,
      totalProfitPercent: null,
      showCalculateForm: false,
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
        notes: ""
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
        notes: ""
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
        .get("http://localhost:5000/inventorypage")
        .then((response) => {
          this.inventoryItems = response.data;
        })
        .catch((error) => {
          console.error("ไม่สามารถดึงข้อมูลวัตถุดิบได้:", error);
          alert("เกิดข้อผิดพลาดในการดึงข้อมูลวัตถุดิบ");
        });
    },
    // ดึงจำนวนสูงสุดที่มีในฐานข้อมูลสำหรับวัตถุดิบที่เลือก
    getMaxAmount() {
      const selectedItem = this.inventoryItems.find(item => item.id === this.selectedIngredient);
      // หากหน่วยเป็นกิโลกรัม จะต้องแปลงเป็นกรัม
      if (selectedItem) {
        return selectedItem.unit === 'กิโลกรัม' ? selectedItem.quantity * 1000 : selectedItem.quantity;
      }
      return 0; // กรณีไม่มีข้อมูล
    },
    // อัพเดทจำนวนสูงสุดที่ใช้ได้เมื่อเลือกวัตถุดิบ
    updateMaxAmount() {
      if (!this.selectedIngredient) return;

      const selectedItem = this.inventoryItems.find(item => item.id === this.selectedIngredient);
      if (!selectedItem) return;

      // แปลงหน่วยเป็นกรัมเสมอเพื่อความสะดวกในการคำนวณ
      if (selectedItem.unit === 'กิโลกรัม') {
        this.maxAmountInGrams = selectedItem.quantity * 1000;
      } else if (selectedItem.unit === 'กรัม') {
        this.maxAmountInGrams = selectedItem.quantity;
      } else {
        // สำหรับหน่วยอื่นๆ ที่ไม่ใช่น้ำหนัก อาจต้องมีการแปลงที่ซับซ้อนมากขึ้น
        this.maxAmountInGrams = selectedItem.quantity;
      }

      // รีเซ็ตจำนวนที่ใช้
      this.ingredientAmount = 0;
    },

    // เพิ่มรายการลงในลิสต์
    addItemToList() {
      if (!this.selectedIngredient || this.ingredientAmount <= 0) {
        alert('กรุณาเลือกวัตถุดิบและระบุจำนวนที่ถูกต้อง');
        return;
      }

      const selectedItem = this.inventoryItems.find(item => item.id === this.selectedIngredient);
      if (!selectedItem) return;

      // คำนวณราคาต้นทุนตามสัดส่วนที่ใช้
      let costPrice = 0;

      if (selectedItem.unit === 'กิโลกรัม') {
        // ราคาต่อกรัม = ราคาต่อกิโล / 1000
        costPrice = (selectedItem.price_per_unit / 1000) * this.ingredientAmount;
      } else if (selectedItem.unit === 'กรัม') {
        costPrice = (selectedItem.price_per_unit / selectedItem.quantity) * this.ingredientAmount;
      } else {
        // สำหรับหน่วยอื่นๆ
        costPrice = (selectedItem.price_per_unit / selectedItem.quantity) * this.ingredientAmount;
      }

      // คำนวณราคาขายรวมกำไร (ใช้กำไรจากอินพุต profitMargin)
      const profitRate = 1 + (this.profitMargin / 100);
      const priceWithProfit = costPrice * profitRate;

      // เพิ่มรายการ
      this.addedItems.push({
        id: selectedItem.id,
        name: selectedItem.name,
        amount: this.ingredientAmount,
        unit: 'กรัม',
        costPrice: costPrice,
        priceWithProfit: priceWithProfit,
        price: priceWithProfit.toFixed(2), // แสดงในรูปแบบทศนิยม 2 ตำแหน่ง
        profitMargin: this.profitMargin
      });

      // รีเซ็ตค่า
      this.ingredientAmount = 0;

      // คำนวณราคาทันทีเมื่อเพิ่มรายการ
      this.calculatePrice();
    },

    // คำนวณราคาขายรวมทั้งหมด
    calculatePrice() {
      let totalCost = 0;
      let totalPrice = 0;

      // คำนวณราคาขายรวมจากรายการที่เพิ่ม
      this.addedItems.forEach(item => {
        totalCost += item.costPrice;
        totalPrice += item.priceWithProfit;
      });

      this.calculatedCost = totalCost.toFixed(2);
      this.calculatedPrice = totalPrice.toFixed(2);

      // คำนวณกำไรรวม
      this.totalProfit = (totalPrice - totalCost).toFixed(2);
      this.totalProfitPercent = totalCost > 0 ? (((totalPrice - totalCost) / totalCost) * 100).toFixed(2) : 0;
    },

    // ลบรายการที่เลือก
    removeItem(index) {
      this.addedItems.splice(index, 1);

      // คำนวณราคาใหม่หลังจากลบ
      if (this.addedItems.length > 0) {
        this.calculatePrice();
      } else {
        // รีเซ็ตค่าเมื่อไม่มีรายการ
        this.calculatedCost = null;
        this.calculatedPrice = null;
        this.totalProfit = null;
        this.totalProfitPercent = null;
      }
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
      formData.append("notes", this.newItem.notes);

      if (this.newItem.image) {
        formData.append("image", this.newItem.image);
      }

      axios
        .post("http://localhost:5000/inventorypage", formData)
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
        notes: item.notes
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
      formData.append("notes", this.editingItem.notes);

      if (this.editingItem.newImage) {
        formData.append("image", this.editingItem.newImage);
      }

      axios
        .put(`http://localhost:5000/inventorypage/${this.editingItem.id}`, formData)
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
        .delete(`http://localhost:5000/inventorypage/${this.deleteItemId}`)
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
        notes: ""
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
        notes: ""
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
  /* justify-content: space-between; */
  gap: 20px;
  margin-bottom: 20px;

}

.inventory-header h1 {
  color: #333;
  font-size: 28px;
  margin: 0;
}

.button-all {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.calculate-button {
  display: flex;
  align-items: center;
  background-color: #ffb300;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-button {
  display: flex;
  align-items: right;
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

.calculate-button:hover {
  background-color: #d49604;
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
  text-align: center;
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
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.edit-button {
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  transition: background-color 0.3s;
  width:65%;

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
  width:65%;
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

textarea.form-control {
  resize: vertical;
  min-height: 80px;
}

/* สไตล์สำหรับฟอร์มคำนวณต้นทุนและกำไร */
.calculate-form {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.calculate-form h3 {
  color: #388e3c;
  margin-bottom: 20px;
  font-size: 24px;
  border-bottom: 2px solid #4caf50;
  padding-bottom: 10px;
}

.calculate-form h4 {
  color: #2e7d32;
  margin: 25px 0 15px;
  font-size: 18px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 15px;
  transition: border-color 0.3s;
}

.form-control:focus {
  border-color: #4caf50;
  outline: none;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
}

.form-text {
  margin-top: 5px;
  font-size: 12px;
  color: #757575;
}

.text-muted {
  color: #757575;
}

/* ปุ่มเพิ่มรายการ */
.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  width: 10%;
}

.btn-primary {
  background-color: #4caf50;
  color: white;
  margin-right: 10px;
}

.btn-primary:hover {
  background-color: #388e3c;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-danger:hover {
  background-color: #d32f2f;
}

.btn-sm {
  padding: 6px 10px;
  font-size: 13px;
}

/* ตารางแสดงรายการ */
.table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 25px;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table th {
  background-color: #4caf50;
  color: white;
  padding: 12px 15px;
  text-align: left;
  font-weight: 500;
}

.table td {
  padding: 12px 15px;
  border-top: 1px solid #f0f0f0;
}

.table tbody tr:hover {
  background-color: #f5f5f5;
}

/* สรุปผลการคำนวณ */
.calculation-summary {
  margin-top: 20px;
}

.price-summary {
  background-color: #e8f5e9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-item {
  padding: 10px 0;
  border-bottom: 1px solid #c8e6c9;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item strong {
  font-weight: 600;
  color: #2e7d32;
}

/* อนิเมชั่น */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.added-items {
  animation: fadeIn 0.4s ease-out;
}

/* สำหรับ select option */
select.form-control {
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%234caf50' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 12px;
  padding-right: 30px;
}

/* Responsive */
@media (max-width: 768px) {
  .table {
    display: block;
    overflow-x: auto;
  }

  .summary-item {
    padding: 8px 0;
  }
}
</style>