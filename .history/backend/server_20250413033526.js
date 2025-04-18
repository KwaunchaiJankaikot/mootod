const express = require('express');
const multer = require('multer');
const path = require('path');
const { Client } = require('pg');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());  // สำหรับรับข้อมูล JSON
app.use(express.urlencoded({ extended: true }));  // สำหรับรับข้อมูลจากฟอร์ม

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
  .catch(err => console.error('ไม่สามารถเชื่อมต่อกับฐานข้อมูล PostgreSQL:', err));

// API สำหรับอัปโหลดเมนู
app.post('/upload', upload.single('image'), (req, res) => {
  const { name, description, price } = req.body;  // ข้อมูลที่ได้จากฟอร์ม
  const { filename } = req.file;  // ชื่อไฟล์ที่อัปโหลด
  const imageUrl = `http://localhost:5000/images/${filename}`;  // URL สำหรับเข้าถึงรูปภาพ

  // บันทึกข้อมูลในฐานข้อมูล PostgreSQL
  client.query(
    'INSERT INTO menus (name, description, price, image_url) VALUES ($1, $2, $3, $4)',
    [name, description, price, imageUrl],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'ไม่สามารถบันทึกข้อมูลได้' });
      }
      res.status(200).json({ message: 'เมนูถูกเพิ่มสำเร็จ', imageUrl: imageUrl });
    }
  );
});

// เสิร์ฟไฟล์รูปจากโฟลเดอร์ images
app.use('/images', express.static('backend/images'));

// เริ่มเซิร์ฟเวอร์ที่พอร์ต 5000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
