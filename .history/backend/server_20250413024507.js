const express = require('express');
const { Client } = require('pg'); // ใช้ Client จาก pg library
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// เชื่อมต่อกับ PostgreSQL
const client = new Client({
  host: 'localhost',
  user: 'postgres',        // ชื่อผู้ใช้ PostgreSQL
  password: '1234',        // รหัสผ่าน PostgreSQL
  database: 'py\'w',       // ชื่อฐานข้อมูล PostgreSQL
  port: 5432               // พอร์ตที่ใช้โดย PostgreSQL (ค่าเริ่มต้นคือ 5432)
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
    res.json(results.rows);  // ใช้ results.rows สำหรับผลลัพธ์จาก PostgreSQL
  });
});

// เริ่มเซิร์ฟเวอร์ที่พอร์ต 5000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
