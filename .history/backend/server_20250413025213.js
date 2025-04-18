const express = require('express');
const { Client } = require('pg');  // ใช้ Client จาก pg library
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// เชื่อมต่อกับ PostgreSQL
const client = new Client({
  host: 'localhost',       // ใช้ host เป็น localhost
  user: 'postgres',        // ชื่อผู้ใช้ PostgreSQL
  password: '1234',        // รหัสผ่านของผู้ใช้
  database: 'food',        // ชื่อฐานข้อมูลที่คุณสร้าง
  port: 5432               // พอร์ตที่ PostgreSQL ใช้ (ค่าพื้นฐานคือ 5432)
});

client.connect()
  .then(() => console.log('เชื่อมต่อกับฐานข้อมูล PostgreSQL สำเร็จ'))
  .catch(err => console.error('ไม่สามารถเชื่อมต่อกับฐานข้อมูล PostgreSQL:', err));

// API สำหรับดึงข้อมูลเมนู
app.get('/menus', (req, res) => {
  client.query('SELECT * FROM menus', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลเมนูได้' });
    }
    res.json(results.rows);  // ใช้ results.rows ในการดึงข้อมูลจาก PostgreSQL
  });
});

// เริ่มเซิร์ฟเวอร์ที่พอร์ต 5000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
