const express = require('express');
const multer = require('multer');
const path = require('path');
const { Client } = require('pg');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ตั้งค่า multer สำหรับการอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'images'));  // ใช้ path แบบเต็ม
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // ตั้งชื่อไฟล์ใหม่ให้ไม่ซ้ำกัน
  }
});

const upload = multer({ storage: storage });

// เชื่อมต่อกับ PostgreSQL
const client = new Client({
  host: 'localhost',
  user: 'postgres',
  password: '1489900445559',
  database: 'food',
  port: 5432
});

client.connect()
  .then(() => console.log('เชื่อมต่อกับฐานข้อมูล PostgreSQL สำเร็จ'))
  .catch(err => {
    console.error('ไม่สามารถเชื่อมต่อกับฐานข้อมูล PostgreSQL:', err);
    process.exit(1);
  });

// Route สำหรับดึงเมนูทั้งหมด
app.get('/menus', (req, res) => {
  client.query('SELECT * FROM menus', (err, result) => {
    if (err) {
      console.error('ไม่สามารถดึงข้อมูลเมนูได้:', err);
      return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลเมนูได้' });
    }
    res.status(200).json(result.rows);
  });
});



// Route สำหรับการอัปเดตเมนู
app.put('/menus/:id', upload.single('image'), (req, res) => {
  const { name, description, price } = req.body;
  const { filename } = req.file; // ชื่อไฟล์ที่อัปโหลด
  const imageUrl = `http://localhost:5000/images/${filename}`;

  const menuId = req.params.id;  // รับ ID เมนูจาก URL

  // ตรวจสอบข้อมูลก่อนอัปเดต
  if (!name || !description || !price || !filename) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
  }

  // อัปเดตข้อมูลเมนูในฐานข้อมูล PostgreSQL
  client.query(
    'UPDATE menus SET name = $1, description = $2, price = $3, image_url = $4 WHERE id = $5',
    [name, description, price, imageUrl, menuId],
    (err, result) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการอัปเดตเมนู:', err);
        return res.status(500).json({ error: 'ไม่สามารถอัปเดตข้อมูลเมนูได้' });
      }
      res.status(200).json({ message: 'อัปเดตเมนูสำเร็จ' });
    }
  );
});

// เสิร์ฟไฟล์รูปจากโฟลเดอร์ images
app.use('/images', express.static(path.join(__dirname, 'images')));

// เริ่มเซิร์ฟเวอร์ที่พอร์ต 5000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
