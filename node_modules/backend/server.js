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
app.put('/inventorypage/:id', upload.single('image'), (req, res) => {
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
app.delete('/inventorypage/:id', (req, res) => {
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

// Route สำหรับดึงรายการคำสั่งซื้อทั้งหมด
app.get('/orders', (req, res) => {
  const { status, date, limit } = req.query;
  let query = 'SELECT * FROM orders';
  let params = [];
  let conditions = [];
  
  // กรองตามสถานะ
  if (status) {
    conditions.push('order_status = $' + (params.length + 1));
    params.push(status);
  }
  
  // กรองตามวันที่
  if (date) {
    conditions.push('DATE(order_date) = $' + (params.length + 1));
    params.push(date);
  }
  
  // เพิ่มเงื่อนไขในคำสั่ง SQL
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  // เรียงลำดับตามวันที่ล่าสุด
  query += ' ORDER BY order_date DESC';
  
  // จำกัดผลลัพธ์
  if (limit) {
    query += ' LIMIT $' + (params.length + 1);
    params.push(parseInt(limit));
  }
  
  client.query(query, params, (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ:', err);
      return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลคำสั่งซื้อได้' });
    }
    res.status(200).json(result.rows);
  });
});

// Route สำหรับดึงรายละเอียดคำสั่งซื้อตาม ID
app.get('/orders/:id', (req, res) => {
  const orderId = req.params.id;
  
  // ดึงข้อมูลคำสั่งซื้อ
  client.query('SELECT * FROM orders WHERE id = $1', [orderId], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ:', err);
      return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลคำสั่งซื้อได้' });
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบคำสั่งซื้อ' });
    }
    
    const order = result.rows[0];
    
    // ดึงรายการอาหารในคำสั่งซื้อ
    client.query(
      `SELECT oi.*, m.name AS menu_name, m.image_url 
       FROM order_items oi 
       JOIN menus m ON oi.menu_id = m.id 
       WHERE oi.order_id = $1`,
      [orderId],
      (err, itemsResult) => {
        if (err) {
          console.error('เกิดข้อผิดพลาดในการดึงรายการอาหาร:', err);
          return res.status(500).json({ error: 'ไม่สามารถดึงรายการอาหารได้' });
        }
        
        // ดึงข้อมูลต้นทุน (ถ้ามี)
        client.query(
          'SELECT * FROM order_costs WHERE order_id = $1',
          [orderId],
          (err, costsResult) => {
            if (err) {
              console.error('เกิดข้อผิดพลาดในการดึงข้อมูลต้นทุน:', err);
              // ไม่ return error เพราะข้อมูลต้นทุนอาจไม่จำเป็น
            }
            
            // รวมข้อมูลและส่งกลับ
            res.status(200).json({
              order,
              items: itemsResult.rows,
              costs: costsResult ? costsResult.rows[0] : null
            });
          }
        );
      }
    );
  });
});

// Route สำหรับสร้างคำสั่งซื้อใหม่
app.post('/orders', (req, res) => {
  const { 
    customer_name, 
    table_number, 
    order_type, 
    total_amount, 
    discount_amount, 
    payment_method,
    payment_status,
    notes,
    items  // อาร์เรย์ของรายการอาหาร [{menu_id, quantity, unit_price, special_instructions}]
  } = req.body;
  
  // ตรวจสอบข้อมูลที่จำเป็น
  if (!order_type || !total_amount || !items || items.length === 0) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
  }
  
  // สร้างรหัสคำสั่งซื้อ
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `ORD-${dateStr}-${randomStr}`;
  
  // เริ่มทำ Transaction
  client.query('BEGIN', err => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการเริ่ม transaction:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ' });
    }
    
    // สร้างคำสั่งซื้อ
    client.query(
      `INSERT INTO orders 
        (order_number, customer_name, table_number, order_type, total_amount, 
         discount_amount, payment_method, payment_status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        orderNumber,
        customer_name || null,
        table_number || null,
        order_type,
        total_amount,
        discount_amount || 0,
        payment_method || null,
        payment_status || 'pending',
        notes || null
      ],
      (err, result) => {
        if (err) {
          console.error('เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ:', err);
          client.query('ROLLBACK');
          return res.status(500).json({ error: 'ไม่สามารถสร้างคำสั่งซื้อได้' });
        }
        
        const newOrder = result.rows[0];
        const orderId = newOrder.id;
        
        // เตรียมคำสั่ง SQL สำหรับเพิ่มรายการอาหาร
        const itemValues = [];
        const itemParams = [];
        let paramCount = 1;
        
        items.forEach(item => {
          const subtotal = item.quantity * item.unit_price;
          itemValues.push(`($${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++})`);
          itemParams.push(
            orderId,
            item.menu_id,
            item.quantity,
            item.unit_price,
            subtotal,
            item.special_instructions || null
          );
        });
        
        const itemsQuery = `
          INSERT INTO order_items 
            (order_id, menu_id, quantity, unit_price, subtotal, special_instructions)
          VALUES ${itemValues.join(', ')}
          RETURNING *
        `;
        
        // เพิ่มรายการอาหาร
        client.query(itemsQuery, itemParams, (err, itemsResult) => {
          if (err) {
            console.error('เกิดข้อผิดพลาดในการเพิ่มรายการอาหาร:', err);
            client.query('ROLLBACK');
            return res.status(500).json({ error: 'ไม่สามารถเพิ่มรายการอาหารได้' });
          }
          
          // คำนวณต้นทุน (อย่างง่าย)
          const ingredients_cost = total_amount * 0.4; // สมมติว่าต้นทุนวัตถุดิบคือ 40% ของราคาขาย
          const packaging_cost = order_type === 'delivery' || order_type === 'takeaway' ? total_amount * 0.05 : 0;
          const total_cost = ingredients_cost + packaging_cost;
          const profit = total_amount - total_cost;
          
          // บันทึกข้อมูลต้นทุน
          client.query(
            `INSERT INTO order_costs 
              (order_id, ingredients_cost, packaging_cost, total_cost, profit)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [orderId, ingredients_cost, packaging_cost, total_cost, profit],
            (err, costsResult) => {
              if (err) {
                console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูลต้นทุน:', err);
                // ไม่ rollback เพราะข้อมูลต้นทุนไม่สำคัญเท่าข้อมูลคำสั่งซื้อ
              }
              
              // ยืนยัน Transaction
              client.query('COMMIT', err => {
                if (err) {
                  console.error('เกิดข้อผิดพลาดในการยืนยัน transaction:', err);
                  client.query('ROLLBACK');
                  return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ' });
                }
                
                // ส่งข้อมูลกลับ
                res.status(201).json({
                  message: 'สร้างคำสั่งซื้อสำเร็จ',
                  order: newOrder,
                  items: itemsResult.rows,
                  costs: costsResult ? costsResult.rows[0] : null
                });
              });
            }
          );
        });
      }
    );
  });
});

// Route สำหรับอัปเดตสถานะคำสั่งซื้อ
app.patch('/orders/:id/status', (req, res) => {
  const orderId = req.params.id;
  const { order_status, payment_status } = req.body;
  
  if (!order_status && !payment_status) {
    return res.status(400).json({ error: 'ต้องระบุ order_status หรือ payment_status' });
  }
  
  let updateFields = [];
  let params = [orderId];
  let paramCount = 2;
  
  if (order_status) {
    updateFields.push(`order_status = $${paramCount++}`);
    params.push(order_status);
    
    // ถ้าสถานะเป็น 'completed' ให้บันทึกเวลาเสร็จสิ้น
    if (order_status === 'completed') {
      updateFields.push(`completed_date = CURRENT_TIMESTAMP`);
    }
  }
  
  if (payment_status) {
    updateFields.push(`payment_status = $${paramCount++}`);
    params.push(payment_status);
  }
  
  // เพิ่ม updated_at
  updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
  
  const query = `
    UPDATE orders 
    SET ${updateFields.join(', ')} 
    WHERE id = $1 
    RETURNING *
  `;
  
  client.query(query, params, (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตสถานะคำสั่งซื้อ:', err);
      return res.status(500).json({ error: 'ไม่สามารถอัปเดตสถานะคำสั่งซื้อได้' });
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบคำสั่งซื้อ' });
    }
    
    res.status(200).json({
      message: 'อัปเดตสถานะคำสั่งซื้อสำเร็จ',
      order: result.rows[0]
    });
  });
});

// Route สำหรับยกเลิกคำสั่งซื้อ
app.delete('/orders/:id', (req, res) => {
  const orderId = req.params.id;
  
  // อัปเดตสถานะเป็น "ยกเลิก" แทนที่จะลบข้อมูลจริง
  client.query(
    `UPDATE orders 
     SET order_status = 'cancelled', 
         payment_status = CASE 
                           WHEN payment_status = 'paid' THEN 'refunded' 
                           ELSE 'cancelled' 
                         END,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [orderId],
    (err, result) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ:', err);
        return res.status(500).json({ error: 'ไม่สามารถยกเลิกคำสั่งซื้อได้' });
      }
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'ไม่พบคำสั่งซื้อ' });
      }
      
      res.status(200).json({
        message: 'ยกเลิกคำสั่งซื้อสำเร็จ',
        order: result.rows[0]
      });
    }
  );
});

// Route สำหรับดึงข้อมูลสรุปรายรับรายจ่าย
app.get('/reports/sales', (req, res) => {
  const { start_date, end_date, period } = req.query;
  
  // ตรวจสอบว่ามีวันที่เริ่มต้นและวันที่สิ้นสุด
  if (!start_date || !end_date) {
    return res.status(400).json({ error: 'ต้องระบุ start_date และ end_date' });
  }
  
  // กำหนดการจัดกลุ่มตามช่วงเวลา (รายวัน, รายสัปดาห์, รายเดือน)
  let groupByDate;
  switch (period) {
    case 'week':
      groupByDate = `DATE_TRUNC('week', order_date)`;
      break;
    case 'month':
      groupByDate = `DATE_TRUNC('month', order_date)`;
      break;
    default:
      groupByDate = `DATE(order_date)`;
  }
  
  // คำสั่ง SQL สำหรับดึงข้อมูลสรุปรายรับรายจ่าย
  const query = `
    SELECT 
      ${groupByDate} AS date,
      COUNT(*) AS total_orders,
      SUM(total_amount) AS total_sales,
      SUM(discount_amount) AS total_discounts,
      SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) AS collected_amount,
      SUM(CASE WHEN order_status = 'cancelled' THEN total_amount ELSE 0 END) AS cancelled_amount,
      (
        SELECT COALESCE(SUM(total_cost), 0)
        FROM order_costs oc
        JOIN orders o ON oc.order_id = o.id
        WHERE o.order_date BETWEEN $1 AND $2
        AND DATE_TRUNC('day', o.order_date) = DATE_TRUNC('day', orders.order_date)
      ) AS total_costs,
      (
        SELECT COALESCE(SUM(profit), 0)
        FROM order_costs oc
        JOIN orders o ON oc.order_id = o.id
        WHERE o.order_date BETWEEN $1 AND $2
        AND DATE_TRUNC('day', o.order_date) = DATE_TRUNC('day', orders.order_date)
      ) AS total_profit
    FROM 
      orders
    WHERE 
      order_date BETWEEN $1 AND $2
    GROUP BY 
      ${groupByDate}
    ORDER BY 
      date
  `;
  
  client.query(query, [start_date, end_date], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสรุปรายรับรายจ่าย:', err);
      return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลสรุปรายรับรายจ่ายได้' });
    }
    
    // สร้างข้อมูลสรุปรวม
    const summary = {
      total_orders: 0,
      total_sales: 0,
      total_discounts: 0,
      collected_amount: 0,
      cancelled_amount: 0,
      total_costs: 0,
      total_profit: 0
    };
    
    result.rows.forEach(row => {
      summary.total_orders += parseInt(row.total_orders);
      summary.total_sales += parseFloat(row.total_sales);
      summary.total_discounts += parseFloat(row.total_discounts);
      summary.collected_amount += parseFloat(row.collected_amount);
      summary.cancelled_amount += parseFloat(row.cancelled_amount);
      summary.total_costs += parseFloat(row.total_costs);
      summary.total_profit += parseFloat(row.total_profit);
    });
    
    res.status(200).json({
      data: result.rows,
      summary
    });
  });
});

// Route สำหรับดึงข้อมูลเมนูขายดี
app.get('/reports/popular-menus', (req, res) => {
  const { start_date, end_date, limit } = req.query;
  
  // ตรวจสอบว่ามีวันที่เริ่มต้นและวันที่สิ้นสุด
  if (!start_date || !end_date) {
    return res.status(400).json({ error: 'ต้องระบุ start_date และ end_date' });
  }
  
  const query = `
    SELECT 
      m.id,
      m.name,
      m.image_url,
      m.category,
      SUM(oi.quantity) AS total_ordered,
      SUM(oi.subtotal) AS total_sales
    FROM 
      order_items oi
    JOIN 
      menus m ON oi.menu_id = m.id
    JOIN 
      orders o ON oi.order_id = o.id
    WHERE 
      o.order_date BETWEEN $1 AND $2
      AND o.order_status != 'cancelled'
    GROUP BY 
      m.id, m.name, m.image_url, m.category
    ORDER BY 
      total_ordered DESC
    LIMIT $3
  `;
  
  client.query(query, [start_date, end_date, limit || 10], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลเมนูขายดี:', err);
      return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลเมนูขายดีได้' });
    }
    
    res.status(200).json(result.rows);
  });
});

// เสิร์ฟไฟล์รูปจากโฟลเดอร์ images
app.use('/images', express.static(path.join(__dirname, 'images')));

// เริ่มเซิร์ฟเวอร์ที่พอร์ต 5000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
