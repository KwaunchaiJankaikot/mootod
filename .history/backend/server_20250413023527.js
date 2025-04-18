const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 5000;

// ใช้ CORS เพื่ออนุญาตให้ frontend สามารถเชื่อมต่อได้
app.use(cors());
app.use(express.json());

// เชื่อมต่อกับ MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',    // ชื่อผู้ใช้ MySQL
  password: '1234',    // รหัสผ่าน MySQL
  database: 'restaurant_db' // ชื่อฐานข้อมูล
});

db.connect((err) => {
  if (err) {
    console.error('ไม่สามารถเชื่อมต่อกับฐานข้อมูล:', err);
  } else {
    console.log('เชื่อมต่อกับฐานข้อมูล MySQL สำเร็จ');
  }
});

// API สำหรับดึงข้อมูลเมนู
app.get('/menus', (req, res) => {
  db.query('SELECT * FROM menus', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลเมนูได้' });
    }
    res.json(results);
  });
});

// เริ่มเซิร์ฟเวอร์ที่พอร์ต 5000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
