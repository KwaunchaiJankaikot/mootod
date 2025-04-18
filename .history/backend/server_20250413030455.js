const express = require('express');
const multer = require('multer');
const path = require('path');
const { Client } = require('pg');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// ตั้งค่า multer สำหรับจัดการการอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'backend/images');  // กำหนดให้ไฟล์ถูกอัปโหลดไปที่โฟลเดอร์ 'images'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // สร้างชื่อไฟล์ใหม่
  }
});

const upload = multer({ storage: storage });

// เชื่อมต่อกับ PostgreSQL
const client = new Client({
  host: 'localhost',
  user: 'postgres',
  password: '1234',
  database: 'food',
  port: 5432
});

client.connect()
  .then(() => console.log('เชื่อมต่อกับฐานข้อมูล PostgreSQL สำเร็จ'))
  .catch(err => console.error('ไม่สามารถเชื่อมต่อกับฐานข้อมูล PostgreSQL:', err));

// API สำหรับอัปโหลดรูปภาพ
app.post('/upload', upload.single('image'), (req, res) => {
  const { filename } = req.file;  // ได้รับชื่อไฟล์ที่อัปโหลด
  const imageUrl = `http://localhost:5000/images/${filename}`;  // URL สำหรับเข้าถึงรูปภาพ
  
  // บันทึก URL ของรูปภาพในฐานข้อมูล
  client.query(
    'INSERT INTO menus (name, description, price, image_url) VALUES ($1, $2, $3, $4)',
    ['ข้าวหมูทอด', 'ข้าวหมูทอดกับผักและน้ำจิ้ม', 50.00, imageUrl],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'ไม่สามารถบันทึกข้อมูลได้' });
      }
      res.status(200).json({ message: 'อัปโหลดรูปภาพสำเร็จ', imageUrl: imageUrl });
    }
  );
});

// ให้สามารถเข้าถึงรูปภาพในโฟลเดอร์ images
app.use('/images', express.static('backend/images'));

// เริ่มเซิร์ฟเวอร์ที่พอร์ต 5000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
