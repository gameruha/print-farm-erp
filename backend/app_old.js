const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'print_farm_erp'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err.message);
    return;
  }
  console.log('Connected to MySQL');
});

app.get('/', (req, res) => {
  res.send('3D Print Farm ERP API is running');
});

/* =========================
   GET ROUTES
========================= */

app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM products ORDER BY product_id DESC', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.get('/api/printers', (req, res) => {
  db.query('SELECT * FROM printers ORDER BY printer_id DESC', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.get('/api/orders', (req, res) => {
  db.query('SELECT * FROM orders ORDER BY order_id DESC', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.get('/api/materials', (req, res) => {
  db.query('SELECT * FROM materials ORDER BY material_id DESC', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.get('/api/order-items', (req, res) => {
  db.query('SELECT * FROM order_items ORDER BY item_id DESC', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

/* =========================
   POST ROUTES
========================= */

app.post('/api/products', (req, res) => {
  const {
    category_id,
    model_id,
    sku,
    product_name,
    unit_name,
    description_text,
    base_price,
    min_stock_qty,
    is_printed_on_demand
  } = req.body;

  const sql = `
    INSERT INTO products
    (
      category_id,
      model_id,
      sku,
      product_name,
      unit_name,
      description_text,
      base_price,
      min_stock_qty,
      is_printed_on_demand,
      is_active
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `;

  db.query(
    sql,
    [
      category_id,
      model_id,
      sku,
      product_name,
      unit_name,
      description_text,
      base_price,
      min_stock_qty,
      is_printed_on_demand
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        message: 'Product added successfully',
        product_id: result.insertId
      });
    }
  );
});

app.post('/api/orders', (req, res) => {
  const { client_id, status } = req.body;

  const sql = `
    INSERT INTO orders
    (
      client_id,
      manager_id,
      order_date,
      due_date,
      source_name,
      status,
      payment_status,
      delivery_address,
      shipping_cost,
      discount_amount,
      comment_text
    )
    VALUES (?, NULL, CURDATE(), NULL, 'website', ?, 'unpaid', NULL, 0.00, 0.00, NULL)
  `;

  db.query(sql, [client_id, status], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      message: 'Order created successfully',
      order_id: result.insertId
    });
  });
});

app.post('/api/order-items', (req, res) => {
  const { order_id, product_id, quantity } = req.body;

  const sql = `
    INSERT INTO order_items
    (
      order_id,
      product_id,
      quantity,
      unit_price
    )
    SELECT ?, ?, ?, base_price
    FROM products
    WHERE product_id = ?
  `;

  db.query(sql, [order_id, product_id, quantity, product_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      message: 'Order item added successfully',
      item_id: result.insertId
    });
  });
});

app.post('/api/print-jobs', (req, res) => {
  const {
    item_id,
    printer_id,
    spool_id,
    status,
    filament_cost,
    avg_power_w,
    electricity_tariff,
    other_cost,
    filament_used_g,
    support_used_g,
    waste_g,
    start_time,
    end_time
  } = req.body;

  const sql = `
    INSERT INTO print_jobs
    (
      item_id,
      printer_id,
      spool_id,
      status,
      filament_cost,
      avg_power_w,
      electricity_tariff,
      other_cost,
      filament_used_g,
      support_used_g,
      waste_g,
      start_time,
      end_time
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      item_id,
      printer_id,
      spool_id,
      status,
      filament_cost,
      avg_power_w,
      electricity_tariff,
      other_cost,
      filament_used_g,
      support_used_g,
      waste_g,
      start_time,
      end_time
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        message: 'Print job created successfully',
        print_job_id: result.insertId
      });
    }
  );
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});