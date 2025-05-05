<template>
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>รายงานสถิติ</h1>
        <div class="date-filter">
          <label for="start-date">ตั้งแต่: </label>
          <input type="date" id="start-date" v-model="startDate" class="date-input">
          <label for="end-date">ถึง: </label>
          <input type="date" id="end-date" v-model="endDate" class="date-input">
          <button @click="fetchData" class="apply-filter-btn">ดูรายงาน</button>
        </div>
      </div>
  
      <div class="stats-overview" v-if="dataLoaded">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <div class="stat-content">
            <h3>ยอดขายรวม</h3>
            <div class="stat-value">฿{{ formatNumber(summaryData.total_sales) }}</div>
          </div>
        </div>
  
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-file-invoice-dollar"></i>
          </div>
          <div class="stat-content">
            <h3>กำไรรวม</h3>
            <div class="stat-value">฿{{ formatNumber(summaryData.total_profit) }}</div>
          </div>
        </div>
  
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-utensils"></i>
          </div>
          <div class="stat-content">
            <h3>คำสั่งซื้อทั้งหมด</h3>
            <div class="stat-value">{{ formatNumber(summaryData.total_orders) }}</div>
          </div>
        </div>
  
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-boxes"></i>
          </div>
          <div class="stat-content">
            <h3>วัตถุดิบทั้งหมด</h3>
            <div class="stat-value">{{ formatNumber(inventoryCount) }}</div>
            <div class="stat-comparison" :class="{ 'negative': lowStockItems.length > 0 }">
              {{ lowStockItems.length }} รายการใกล้หมด
            </div>
          </div>
        </div>
      </div>
  
      <div v-else class="loading-indicator">
        <div class="spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
  
      <div class="charts-container" v-if="dataLoaded">
        <div class="chart-card">
          <h3>ยอดขายตามวัน</h3>
          <canvas id="salesChart" ref="salesChart"></canvas>
        </div>
        
        <div class="chart-card">
          <h3>สินค้าขายดี</h3>
          <canvas id="popularItemsChart" ref="popularItemsChart"></canvas>
        </div>
      </div>
  
      <div class="data-table-section" v-if="dataLoaded">
        <h3>รายการสินค้าขายดี</h3>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>รูปภาพ</th>
                <th>รายการ</th>
                <th>จำนวนที่ขายได้</th>
                <th>ยอดขาย</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in popularItems" :key="item.id">
                <td>{{ index + 1 }}</td>
                <td><img :src="item.image_url" :alt="item.name" class="item-thumbnail"></td>
                <td>{{ item.name }}</td>
                <td>{{ formatNumber(item.total_ordered) }}</td>
                <td>฿{{ formatNumber(item.total_sales) }}</td>
              </tr>
              <tr v-if="popularItems.length === 0">
                <td colspan="5" class="no-data">ไม่พบข้อมูล</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <div class="data-table-section" v-if="dataLoaded">
        <h3>วัตถุดิบที่ต้องสั่งเพิ่ม</h3>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>รูปภาพ</th>
                <th>รายการ</th>
                <th>จำนวนคงเหลือ</th>
                <th>จำนวนขั้นต่ำ</th>
                <th>สถานะ</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in lowStockItems" :key="item.id">
                <td><img :src="item.image_url" :alt="item.name" class="item-thumbnail"></td>
                <td>{{ item.name }}</td>
                <td>{{ item.quantity }} {{ item.unit }}</td>
                <td>{{ item.min_quantity }} {{ item.unit }}</td>
                <td><span class="stock-status low">ใกล้หมด</span></td>
                <td><button class="order-button" @click="navigateToInventory(item.id)">สั่งเพิ่ม</button></td>
              </tr>
              <tr v-if="lowStockItems.length === 0">
                <td colspan="6" class="no-data">ไม่พบรายการที่ต้องสั่งเพิ่ม</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import Chart from 'chart.js/auto';
  
  export default {
    name: 'ReportPage  ',
    data() {
      return {
        startDate: this.getFirstDayOfMonth(),
        endDate: this.getLastDayOfMonth(),
        summaryData: {
          total_sales: 0,
          total_profit: 0,
          total_orders: 0,
          total_discounts: 0,
          collected_amount: 0,
          cancelled_amount: 0,
          total_costs: 0
        },
        inventoryCount: 0,
        popularItems: [],
        lowStockItems: [],
        salesChart: null,
        popularItemsChart: null,
        salesData: [],
        dataLoaded: false
      };
    },
    mounted() {
      this.fetchData();
    },
    methods: {
      getFirstDayOfMonth() {
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        return firstDay.toISOString().split('T')[0];
      },
      getLastDayOfMonth() {
        const date = new Date();
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return lastDay.toISOString().split('T')[0];
      },
      async fetchData() {
        try {
          this.dataLoaded = false;
          
          // ข้อมูลยอดขายรวม
          const salesResponse = await axios.get(`http://localhost:5000/reports/sales?start_date=${this.startDate}&end_date=${this.endDate}`);
          this.salesData = salesResponse.data.data;
          this.summaryData = salesResponse.data.summary;
          
          // ข้อมูลสินค้าขายดี
          const popularResponse = await axios.get(`http://localhost:5000/reports/popular-menus?start_date=${this.startDate}&end_date=${this.endDate}&limit=10`);
          this.popularItems = popularResponse.data;
          
          // ข้อมูลวัตถุดิบ
          const inventoryResponse = await axios.get('http://localhost:5000/inventorypage');
          this.inventoryCount = inventoryResponse.data.length;
          this.lowStockItems = inventoryResponse.data.filter(item => item.quantity < item.min_quantity);
          
          // สร้างกราฟ
          this.$nextTick(() => {
            this.createCharts();
            this.dataLoaded = true;
          });
        } catch (error) {
          console.error('เกิดข้อผิดพลาดในการดึงข้อมูล', error);
          alert('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
        }
      },
      createCharts() {
        // สร้างกราฟยอดขายรายวัน
        if (this.salesChart) {
          this.salesChart.destroy();
        }
        
        const salesCtx = this.$refs.salesChart.getContext('2d');
        
        // เตรียมข้อมูลสำหรับกราฟ
        const labels = this.salesData.map(data => {
          // แปลง date ให้อยู่ในรูปแบบที่ต้องการ
          const date = new Date(data.date);
          return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
        });
        
        const salesValues = this.salesData.map(data => data.total_sales);
        const profitValues = this.salesData.map(data => data.total_profit);
        
        this.salesChart = new Chart(salesCtx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'ยอดขาย',
                data: salesValues,
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                borderColor: '#4CAF50',
                borderWidth: 2,
                tension: 0.3
              },
              {
                label: 'กำไร',
                data: profitValues,
                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                borderColor: '#2196F3',
                borderWidth: 2,
                tension: 0.3
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              }
            }
          }
        });
        
        // สร้างกราฟสินค้าขายดี
        if (this.popularItemsChart) {
          this.popularItemsChart.destroy();
        }
        
        const popularCtx = this.$refs.popularItemsChart.getContext('2d');
        
        // กำหนดจำนวนสินค้าขายดีที่จะแสดงในกราฟ
        const topItems = this.popularItems.slice(0, 5);
        
        this.popularItemsChart = new Chart(popularCtx, {
          type: 'bar',
          data: {
            labels: topItems.map(item => item.name),
            datasets: [{
              label: 'จำนวนที่ขายได้',
              data: topItems.map(item => item.total_ordered),
              backgroundColor: [
                '#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0'
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
      },
      formatNumber(number) {
        return new Intl.NumberFormat('th-TH').format(number);
      },
      navigateToInventory(itemId) {
        // นำทางไปยังหน้าจัดการวัตถุดิบ
        this.$router.push(`/inventory/edit/${itemId}`);
      }
    }
  };
  </script>
  
  <style scoped>
  .dashboard-container {
    padding: 20px;
    max-width: 1280px;
    margin: 0 auto;
    font-family: 'Prompt', 'Sarabun', sans-serif;
  }
  
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-wrap: wrap;
  }
  
  .dashboard-header h1 {
    font-size: 28px;
    color: #333;
    margin: 0;
  }
  
  .date-filter {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  
  .date-input {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: inherit;
  }
  
  .apply-filter-btn {
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 15px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .apply-filter-btn:hover {
    background-color: #388E3C;
  }
  
  /* Cards สถิติภาพรวม */
  .stats-overview {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .stat-card {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    display: flex;
    align-items: center;
    transition: transform 0.3s, box-shadow 0.3s;
  }
  
  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #E8F5E9;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
  }
  
  .stat-icon i {
    font-size: 24px;
    color: #4CAF50;
  }
  
  .stat-content {
    flex: 1;
  }
  
  .stat-content h3 {
    font-size: 16px;
    color: #757575;
    margin: 0 0 5px 0;
    font-weight: 500;
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: 600;
    color: #333;
  }
  
  .stat-comparison {
    font-size: 14px;
    margin-top: 5px;
  }
  
  .positive {
    color: #4CAF50;
  }
  
  .negative {
    color: #F44336;
  }
  
  /* กราฟและชาร์ต */
  .charts-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }
  
  @media (max-width: 1100px) {
    .charts-container {
      grid-template-columns: 1fr;
    }
  }
  
  .chart-card {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    height: 400px;
  }
  
  .chart-card h3 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
    font-size: 18px;
  }
  
  /* ตารางข้อมูล */
  .data-table-section {
    margin-bottom: 30px;
  }
  
  .data-table-section h3 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
    font-size: 18px;
  }
  
  .table-responsive {
    overflow-x: auto;
  }
  
  .data-table {
    width: 100%;
    border-collapse: collapse;
    background-color: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .data-table th,
  .data-table td {
    padding: 15px;
    text-align: left;
  }
  
  .data-table th {
    background-color: #4CAF50;
    color: white;
    font-weight: 500;
  }
  
  .data-table tbody tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  
  .data-table tbody tr:hover {
    background-color: #f0f0f0;
  }
  
  .item-thumbnail {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .stock-status {
    display: inline-block;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 13px;
  }
  
  .stock-status.low {
    background-color: #FFEBEE;
    color: #F44336;
  }
  
  .order-button {
    background-color: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .order-button:hover {
    background-color: #1976D2;
  }
  
  .no-data {
    text-align: center;
    color: #757575;
    padding: 30px;
  }
  
  /* Loading Indicator */
  .loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 50px 0;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(76, 175, 80, 0.3);
    border-radius: 50%;
    border-top-color: #4CAF50;
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 15px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .date-filter {
      margin-top: 15px;
    }
    
    .stats-overview {
      grid-template-columns: 1fr;
    }
  }
  </style>