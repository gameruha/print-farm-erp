import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'print_farm_erp',
  waitForConnections: true,
  connectionLimit: 10,
});

const resources = {
  products: {
    table: 'products',
    id: 'product_id',
    columns: ['category_id', 'model_id', 'sku', 'product_name', 'unit_name', 'description_text', 'base_price', 'min_stock_qty', 'is_printed_on_demand', 'is_active'],
    defaults: { category_id: 1, model_id: 1, unit_name: 'pcs', min_stock_qty: 0, is_printed_on_demand: 1, is_active: 1 },
  },
  orders: {
    table: 'orders',
    id: 'order_id',
    columns: ['client_id', 'manager_id', 'order_date', 'due_date', 'source_name', 'status', 'payment_status', 'delivery_address', 'shipping_cost', 'discount_amount', 'comment_text'],
    defaults: { client_id: 1, order_date: () => new Date().toISOString().slice(0, 10), source_name: 'website', status: 'new', payment_status: 'unpaid', shipping_cost: 0, discount_amount: 0 },
  },
  materials: {
    table: 'materials',
    id: 'material_id',
    columns: ['material_category_id', 'supplier_id', 'sku', 'material_name', 'unit_name', 'unit_cost', 'min_stock_qty', 'notes', 'is_active'],
    defaults: { material_category_id: 1, supplier_id: 1, unit_name: 'pcs', unit_cost: 0, min_stock_qty: 0, is_active: 1 },
  },
  'order-items': {
    table: 'order_items',
    id: 'item_id',
    columns: ['order_id', 'variant_id', 'quantity', 'planned_unit_price', 'planned_unit_cost', 'actual_unit_cost', 'line_status', 'notes'],
    defaults: { quantity: 1, planned_unit_price: 0, planned_unit_cost: 0, line_status: 'planned' },
  },
  'print-jobs': {
    table: 'print_jobs',
    id: 'job_id',
    columns: ['item_id', 'printer_id', 'spool_id', 'operator_id', 'bambu_job_code', 'start_time', 'end_time', 'status', 'qty_planned', 'qty_good', 'qty_failed', 'filament_used_g', 'support_used_g', 'waste_g', 'electricity_tariff', 'avg_power_w', 'filament_cost', 'electricity_cost', 'wear_cost', 'other_cost', 'total_cost', 'notes'],
    defaults: { printer_id: 1, status: 'queued', qty_planned: 1, qty_good: 0, qty_failed: 0, filament_used_g: 0, support_used_g: 0, waste_g: 0, electricity_tariff: 4.32, avg_power_w: 120, filament_cost: 0, electricity_cost: 0, wear_cost: 0, other_cost: 0, total_cost: 0 },
  },
};

function cleanValue(value) {
  return value === '' || value === undefined ? null : value;
}

function buildPayload(body, config, useDefaults = false) {
  const payload = {};

  for (const column of config.columns) {
    if (body[column] !== undefined && body[column] !== '') {
      payload[column] = cleanValue(body[column]);
    } else if (useDefaults && config.defaults && config.defaults[column] !== undefined) {
      const defaultValue = config.defaults[column];
      payload[column] = typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    }
  }

  return payload;
}

async function listResource(req, res, config) {
  const [rows] = await pool.query(`SELECT * FROM \`${config.table}\` ORDER BY \`${config.id}\` DESC`);
  res.json(rows);
}

async function createResource(req, res, config) {
  const payload = buildPayload(req.body, config, true);
  if (Object.keys(payload).length === 0) {
    return res.status(400).json({ error: 'Request body does not contain valid fields.' });
  }

  const [result] = await pool.query(`INSERT INTO \`${config.table}\` SET ?`, payload);
  const [rows] = await pool.query(`SELECT * FROM \`${config.table}\` WHERE \`${config.id}\` = ?`, [result.insertId]);
  return res.status(201).json(rows[0]);
}

async function updateResource(req, res, config) {
  const payload = buildPayload(req.body, config, false);
  if (Object.keys(payload).length === 0) {
    return res.status(400).json({ error: 'Request body does not contain valid fields.' });
  }

  const [result] = await pool.query(`UPDATE \`${config.table}\` SET ? WHERE \`${config.id}\` = ?`, [payload, req.params.id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Record not found.' });
  }

  const [rows] = await pool.query(`SELECT * FROM \`${config.table}\` WHERE \`${config.id}\` = ?`, [req.params.id]);
  return res.json(rows[0]);
}

async function deleteResource(req, res, config) {
  try {
    const [result] = await pool.query(`DELETE FROM \`${config.table}\` WHERE \`${config.id}\` = ?`, [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Record not found.' });
    }

    return res.status(204).send();
  } catch (error) {
    if (config.table === 'products' && error?.code === 'ER_ROW_IS_REFERENCED_2') {
      const [result] = await pool.query('UPDATE `products` SET `is_active` = 0 WHERE `product_id` = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Record not found.' });
      }

      return res.json({ archived: true, message: 'Product is linked to other records, so it was archived instead of deleted.' });
    }

    throw error;
  }
}

function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

for (const [path, config] of Object.entries(resources)) {
  app.get(`/api/${path}`, asyncHandler((req, res) => listResource(req, res, config)));
  app.post(`/api/${path}`, asyncHandler((req, res) => createResource(req, res, config)));
  app.put(`/api/${path}/:id`, asyncHandler((req, res) => updateResource(req, res, config)));
  app.delete(`/api/${path}/:id`, asyncHandler((req, res) => deleteResource(req, res, config)));
}

app.get('/api/order_items', asyncHandler((req, res) => listResource(req, res, resources['order-items'])));

app.get('/api/printers', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM `printers` ORDER BY `printer_id` DESC');
  res.json(rows);
}));

app.get('/api/product-variants', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT pv.*, p.product_name, p.sku, p.base_price
    FROM product_variants pv
    LEFT JOIN products p ON p.product_id = pv.product_id
    WHERE pv.is_active = 1
    ORDER BY pv.variant_id DESC
  `);
  res.json(rows);
}));


app.get('/api/expenses', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM `expenses` ORDER BY `expense_date` DESC, `expense_id` DESC');
  res.json(rows);
}));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (error?.code === 'ER_ROW_IS_REFERENCED_2' || error?.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(409).json({ error: 'Database relationship prevents this operation. Check linked records first.' });
  }

  if (error?.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Duplicate value violates a unique database constraint.' });
  }

  return res.status(500).json({ error: 'Backend error.', details: error.message });
});

app.listen(port, () => {
  console.log(`Print Farm ERP API listening on http://localhost:${port}`);
});
