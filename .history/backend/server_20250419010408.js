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

// API สำหรับอัปโหลดเมนู
app.post('/upload', upload.single('image'), (req, res) => {
  const { name, description, price } = req.body;  // ข้อมูลที่ได้จากฟอร์ม
  const { filename } = req.file;  // ชื่อไฟล์ที่อัปโหลด
  const imageUrl = `http://localhost:5000/images/${filename}`;  // URL สำหรับเข้าถึงรูปภาพ

  // ตรวจสอบข้อมูลก่อนบันทึก
  if (!name || !description || !price || !filename) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
  }

  // บันทึกข้อมูลในฐานข้อมูล PostgreSQL
  client.query(
    'INSERT INTO menus (name, description, price, image_url) VALUES ($1, $2, $3, $4)',
    [name, description, price, imageUrl],
    (err, result) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', err);
        return res.status(500).json({ error: 'ไม่สามารถบันทึกข้อมูลได้' });
      }
      res.status(200).json({ message: 'เมนูถูกเพิ่มสำเร็จ', imageUrl: imageUrl });
    }
  );
});

// Route สำหรับการอัปเดตเมนู
app.put('/menus/:id', upload.single('image'), (req, res) => {
  const { name, description, price } = req.body;
  const menuId = req.params.id;  // รับ ID เมนูจาก URL

  // ตรวจสอบข้อมูลจำเป็นสำหรับการอัปเดต
  if (!name || !description || !price) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
  }

  // เริ่มด้วยการดึงข้อมูลเดิมเพื่อใช้ URL รูปภาพเดิมถ้าไม่มีการอัปโหลดรูปใหม่
  client.query(
    'SELECT image_url FROM menus WHERE id = $1',
    [menuId],
    (err, result) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลเมนู:', err);
        return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลเมนูเดิมได้' });
      }

      // ถ้าไม่พบเมนูที่ต้องการอัปเดต
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'ไม่พบเมนูที่ต้องการอัปเดต' });
      }

      // กำหนดค่า URL รูปภาพ
      let imageUrl = result.rows[0].image_url; // ใช้ URL รูปภาพเดิม

      // ถ้ามีการอัปโหลดรูปภาพใหม่ ให้ใช้ URL รูปภาพใหม่
      if (req.file) {
        imageUrl = `http://localhost:5000/images/${req.file.filename}`;
      }

      // อัปเดตข้อมูลเมนูในฐานข้อมูล PostgreSQL
      client.query(
        'UPDATE menus SET name = $1, description = $2, price = $3, image_url = $4 WHERE id = $5 RETURNING *',
        [name, description, price, imageUrl, menuId],
        (err, updateResult) => {
          if (err) {
            console.error('เกิดข้อผิดพลาดในการอัปเดตเมนู:', err);
            return res.status(500).json({ error: 'ไม่สามารถอัปเดตข้อมูลเมนูได้' });
          }

          if (updateResult.rows.length === 0) {
            return res.status(404).json({ error: 'ไม่พบเมนูที่ต้องการอัปเดต' });
          }

          res.status(200).json({
            message: 'อัปเดตเมนูสำเร็จ',
            menu: updateResult.rows[0]
          });
        }
      );
    }
  );
});



// เสิร์ฟไฟล์รูปจากโฟลเดอร์ images
app.use('/images', express.static(path.join(__dirname, 'images')));

// เริ่มเซิร์ฟเวอร์ที่พอร์ต 5000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
