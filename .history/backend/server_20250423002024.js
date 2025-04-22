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
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลเมนู:', err);
      return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลเมนูได้' });
    }
    res.status(200).json(result.rows);
  });
});

// Route สำหรับดึงเมนูตาม ID
app.get('/menus/:id', (req, res) => {
  const menuId = req.params.id;
  
  client.query('SELECT * FROM menus WHERE id = $1', [menuId], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลเมนู:', err);
      return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลเมนูได้' });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบเมนู' });
    }
    res.status(200).json(result.rows[0]);
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
  const menuId = req.params.id;
  console.log(menuId); 
  const { name, description, price, category } = req.body;

  // ตรวจสอบข้อมูลจำเป็นสำหรับการอัปเดต
  if (!name || !description || !price || !category) {
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
        'UPDATE menus SET name = $1, description = $2, price = $3, category = $4, image_url = $5 WHERE id = $6 RETURNING *',
        [name, description, price, category, imageUrl, menuId],
        (err, updateResult) => {
          if (err) {
            console.error('เกิดข้อผิดพลาดในการอัปเดตเมนู:', err);
            return res.status(500).json({ error: 'ไม่สามารถอัปเดตข้อมูลเมนูได้' });
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

// เพิ่มเส้นทาง API สำหรับระบบจัดการวัตถุดิบ

// Route สำหรับดึงรายการวัตถุดิบทั้งหมด
app.get('/inventorypage', (req, res) => {
  client.query('SELECT * FROM inventory ORDER BY name', (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลวัตถุดิบ:', err);
      return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลวัตถุดิบได้' });
    }
    res.status(200).json(result.rows);
  });
});

// Route สำหรับดึงวัตถุดิบตาม ID
app.get('/inventorypage/:id', (req, res) => {
  const itemId = req.params.id;
  
  client.query('SELECT * FROM inventory WHERE id = $1', [itemId], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลวัตถุดิบ:', err);
      return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลวัตถุดิบได้' });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบวัตถุดิบ' });
    }
    res.status(200).json(result.rows[0]);
  });
});

// Route สำหรับเพิ่มวัตถุดิบใหม่
app.post('/inventorypage', upload.single('image'), (req, res) => {
  const { name, quantity, unit, price_per_unit, min_quantity, received_date } = req.body;
  
  // ตรวจสอบข้อมูลที่จำเป็น
  if (!name || !quantity || !unit || !price_per_unit || !min_quantity || !received_date) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
  }
  
  // กำหนด URL รูปภาพ (ถ้ามี)
  let imageUrl = null;
  if (req.file) {
    imageUrl = `http://localhost:5000/images/${req.file.filename}`;
  }
  
  // เพิ่มข้อมูลวัตถุดิบในฐานข้อมูล
  client.query(
    'INSERT INTO inventory (name, quantity, unit, price_per_unit, min_quantity, received_date, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [name, quantity, unit, price_per_unit, min_quantity, received_date, imageUrl],
    (err, result) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการเพิ่มวัตถุดิบ:', err);
        return res.status(500).json({ error: 'ไม่สามารถเพิ่มวัตถุดิบได้' });
      }
      
      res.status(201).json({
        message: 'เพิ่มวัตถุดิบสำเร็จ',
        item: result.rows[0]
      });
    }
  );
});

// Route สำหรับอัปเดตวัตถุดิบ
app.put('/inventory-page/:id', upload.single('image'), (req, res) => {
  const itemId = req.params.id;
  const { name, quantity, unit, price_per_unit, min_quantity, received_date } = req.body;
  
  // ตรวจสอบข้อมูลที่จำเป็น
  if (!name || !quantity || !unit || !price_per_unit || !min_quantity || !received_date) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
  }
  
  // ดึงข้อมูลเดิมเพื่อใช้ URL รูปภาพเดิมถ้าไม่มีการอัปโหลดรูปใหม่
  client.query(
    'SELECT image_url FROM inventory WHERE id = $1',
    [itemId],
    (err, result) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลวัตถุดิบ:', err);
        return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลวัตถุดิบเดิมได้' });
      }
      
      // ถ้าไม่พบวัตถุดิบที่ต้องการอัปเดต
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'ไม่พบวัตถุดิบที่ต้องการอัปเดต' });
      }
      
      // กำหนดค่า URL รูปภาพ
      let imageUrl = result.rows[0].image_url; // ใช้ URL รูปภาพเดิม
      
      // ถ้ามีการอัปโหลดรูปภาพใหม่ ให้ใช้ URL รูปภาพใหม่
      if (req.file) {
        imageUrl = `http://localhost:5000/images/${req.file.filename}`;
      }
      
      // อัปเดตข้อมูลวัตถุดิบในฐานข้อมูล
      client.query(
        'UPDATE inventory SET name = $1, quantity = $2, unit = $3, price_per_unit = $4, min_quantity = $5, received_date = $6, image_url = $7 WHERE id = $8 RETURNING *',
        [name, quantity, unit, price_per_unit, min_quantity, received_date, imageUrl, itemId],
        (err, updateResult) => {
          if (err) {
            console.error('เกิดข้อผิดพลาดในการอัปเดตวัตถุดิบ:', err);
            return res.status(500).json({ error: 'ไม่สามารถอัปเดตข้อมูลวัตถุดิบได้' });
          }
          
          res.status(200).json({
            message: 'อัปเดตวัตถุดิบสำเร็จ',
            item: updateResult.rows[0]
          });
        }
      );
    }
  );
});

// Route สำหรับลบวัตถุดิบ
app.delete('/inventory/:id', (req, res) => {
  const itemId = req.params.id;
  
  client.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [itemId], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการลบวัตถุดิบ:', err);
      return res.status(500).json({ error: 'ไม่สามารถลบวัตถุดิบได้' });
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบวัตถุดิบที่ต้องการลบ' });
    }
    
    res.status(200).json({
      message: 'ลบวัตถุดิบสำเร็จ',
      item: result.rows[0]
    });
  });
});

// เสิร์ฟไฟล์รูปจากโฟลเดอร์ images
app.use('/images', express.static(path.join(__dirname, 'images')));

// เริ่มเซิร์ฟเวอร์ที่พอร์ต 5000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
