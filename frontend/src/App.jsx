import React, { useEffect, useMemo, useState } from 'react';

const API = 'http://localhost:3000/api';

const appStyles = `
  * { box-sizing: border-box; }

  body {
    margin: 0;
    display: block;
    min-width: 100%;
    min-height: 100vh;
    font-family: Inter, Arial, sans-serif;
    background: #f3f6fb;
    color: #1f2937;
    overflow-x: hidden;
  }

  #root {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    padding: 0;
    text-align: left;
  }

  .erp-app {
    min-height: 100vh;
    padding: 24px;
    background: linear-gradient(180deg, #f7f9fc 0%, #eef3f9 100%);
  }

  .erp-shell {
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 22px;
    flex-wrap: wrap;
  }

  .title-block h1 {
    margin: 0;
    font-size: 34px;
    font-weight: 800;
    color: #111827;
    letter-spacing: -0.03em;
  }

  .title-block p {
    margin: 8px 0 0;
    color: #6b7280;
    font-size: 15px;
  }

  .toolbar {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .btn {
    border: 0;
    border-radius: 14px;
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .btn-primary {
    background: #1d4ed8;
    color: white;
    box-shadow: 0 12px 24px rgba(29, 78, 216, 0.18);
  }

  .btn-primary:hover {
    background: #1b43bb;
  }

  .btn-soft {
    background: white;
    color: #1f2937;
    border: 1px solid #dbe3ef;
  }

  .btn-soft:hover {
    background: #f9fbff;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 18px;
    margin-bottom: 22px;
  }

  .stat-card {
    background: rgba(255,255,255,0.9);
    border: 1px solid #e7edf6;
    border-radius: 22px;
    padding: 20px;
    box-shadow: 0 12px 26px rgba(15, 23, 42, 0.05);
  }

  .stat-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .stat-label {
    color: #6b7280;
    font-size: 14px;
    font-weight: 600;
  }

  .stat-icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    background: #eef4ff;
    color: #1d4ed8;
    font-size: 18px;
    font-weight: 800;
  }

  .stat-value {
    font-size: 30px;
    font-weight: 800;
    color: #111827;
    margin: 0;
  }

  .stat-sub {
    margin: 8px 0 0;
    color: #6b7280;
    font-size: 13px;
  }

  .main-grid {
    display: grid;
    grid-template-columns: 260px minmax(0, 1fr);
    gap: 22px;
  }

  .sidebar {
    background: rgba(255,255,255,0.92);
    border: 1px solid #e7edf6;
    border-radius: 24px;
    padding: 18px;
    box-shadow: 0 12px 26px rgba(15, 23, 42, 0.05);
    height: fit-content;
    position: sticky;
    top: 18px;
  }

  .sidebar h3 {
    margin: 0 0 12px;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #6b7280;
  }

  .nav-list {
    display: grid;
    gap: 10px;
  }

  .nav-btn {
    width: 100%;
    border: 0;
    background: transparent;
    text-align: left;
    border-radius: 16px;
    padding: 13px 14px;
    font-size: 15px;
    font-weight: 700;
    color: #334155;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .nav-btn:hover {
    background: #f1f6ff;
    color: #1d4ed8;
  }

  .nav-btn.active {
    background: #1d4ed8;
    color: white;
    box-shadow: 0 12px 24px rgba(29, 78, 216, 0.18);
  }

  .content {
    display: grid;
    gap: 22px;
  }

  .panel {
    background: rgba(255,255,255,0.92);
    border: 1px solid #e7edf6;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 12px 26px rgba(15, 23, 42, 0.05);
  }

  .panel-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
    flex-wrap: wrap;
  }

  .panel-title {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    color: #111827;
  }

  .panel-subtitle {
    margin: 6px 0 0;
    color: #6b7280;
    font-size: 14px;
  }

  .search,
  .form-input,
  .form-select,
  .form-textarea {
    border: 1px solid #d7e1ee;
    background: #fbfdff;
    border-radius: 14px;
    padding: 12px 14px;
    font-size: 14px;
    color: #111827;
    outline: none;
    width: 100%;
  }

  .search {
    min-width: 260px;
    max-width: 340px;
  }

  .search:focus,
  .form-input:focus,
  .form-select:focus,
  .form-textarea:focus {
    border-color: #7aa2ff;
    box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
  }

  .two-col {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 22px;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .mini-card {
    border: 1px solid #e7edf6;
    border-radius: 18px;
    padding: 16px;
    background: #fbfdff;
  }

  .mini-card h4 {
    margin: 0 0 8px;
    font-size: 16px;
    color: #111827;
  }

  .muted {
    color: #6b7280;
  }

  .metric {
    font-size: 26px;
    font-weight: 800;
    margin: 0;
  }

  .list {
    display: grid;
    gap: 12px;
  }

  .list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    border: 1px solid #e7edf6;
    border-radius: 18px;
    padding: 15px 16px;
    background: #fbfdff;
  }

  .item-title {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #111827;
  }

  .item-sub {
    margin: 6px 0 0;
    font-size: 13px;
    color: #6b7280;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 7px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    white-space: nowrap;
  }

  .badge-blue { background: #dbeafe; color: #1d4ed8; }
  .badge-green { background: #dcfce7; color: #166534; }
  .badge-orange { background: #ffedd5; color: #c2410c; }
  .badge-red { background: #fee2e2; color: #b91c1c; }
  .badge-gray { background: #e5e7eb; color: #374151; }

  .table-wrap {
    overflow-x: auto;
    border: 1px solid #e7edf6;
    border-radius: 18px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 700px;
    background: white;
  }

  th {
    background: #111827;
    color: white;
    text-align: left;
    padding: 14px;
    font-size: 13px;
    letter-spacing: 0.02em;
  }

  td {
    padding: 14px;
    border-bottom: 1px solid #edf2f8;
    font-size: 14px;
    color: #1f2937;
  }

  tr:hover td {
    background: #f8fbff;
  }

  .empty {
    padding: 28px;
    text-align: center;
    color: #6b7280;
    font-weight: 600;
  }

  .progress {
    width: 140px;
    height: 10px;
    border-radius: 999px;
    background: #e5edf7;
    overflow: hidden;
  }

  .progress > span {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
    border-radius: 999px;
  }

  .kpi-row {
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
  }

  .kpi-box {
    flex: 1 1 220px;
    border: 1px solid #e7edf6;
    border-radius: 18px;
    padding: 16px;
    background: #fbfdff;
  }

  .kpi-box h4 {
    margin: 0 0 10px;
    font-size: 14px;
    color: #6b7280;
  }

  .kpi-box p {
    margin: 0;
    font-size: 26px;
    font-weight: 800;
    color: #111827;
  }

  .footer-note {
    margin-top: 14px;
    font-size: 13px;
    color: #6b7280;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 50;
  }

  .modal {
    width: 100%;
    max-width: 720px;
    background: white;
    border-radius: 24px;
    border: 1px solid #e7edf6;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.2);
    overflow: hidden;
  }

  .modal-head {
    padding: 20px 22px 12px;
    border-bottom: 1px solid #edf2f8;
  }

  .modal-head h3 {
    margin: 0;
    font-size: 24px;
    color: #111827;
  }

  .modal-head p {
    margin: 6px 0 0;
    color: #6b7280;
    font-size: 14px;
  }

  .modal-body {
    padding: 20px 22px;
    display: grid;
    gap: 16px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .form-field {
    display: grid;
    gap: 8px;
  }

  .form-field.full {
    grid-column: 1 / -1;
  }

  .form-label {
    font-size: 13px;
    font-weight: 700;
    color: #475569;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 0 22px 22px;
  }

  .notice {
    padding: 12px 14px;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 600;
  }

  .notice.success {
    background: #dcfce7;
    color: #166534;
  }

  .notice.error {
    background: #fee2e2;
    color: #b91c1c;
  }

  @media (max-width: 1200px) {
    .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .two-col, .main-grid { grid-template-columns: 1fr; }
    .sidebar { position: static; }
  }

  @media (max-width: 760px) {
    .erp-app { padding: 16px; }
    .stats-grid, .cards-grid, .form-grid { grid-template-columns: 1fr; }
    .title-block h1 { font-size: 28px; }
  }
`;

function formatMoney(value) {
  const num = Number(value || 0);
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0,
  }).format(num);
}

function getStatusBadge(status) {
  const s = String(status || '').toLowerCase();
  if (['done', 'ready', 'completed', 'paid', 'success'].includes(s)) return 'badge badge-green';
  if (['printing', 'in production', 'processing', 'new'].includes(s)) return 'badge badge-blue';
  if (['maintenance', 'pending', 'waiting'].includes(s)) return 'badge badge-orange';
  if (['failed', 'cancelled', 'error', 'low'].includes(s)) return 'badge badge-red';
  return 'badge badge-gray';
}

function safeArray(data) {
  return Array.isArray(data) ? data : [];
}

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [orders, setOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [showProductModal, setShowProductModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showPrintJobModal, setShowPrintJobModal] = useState(false);

  const [productForm, setProductForm] = useState({
    category_id: '1',
    model_id: '1',
    sku: '',
    product_name: '',
    unit_name: 'pcs',
    description_text: '',
    base_price: '',
    min_stock_qty: '0',
    is_printed_on_demand: '1',
  });

 const [orderForm, setOrderForm] = useState({
  client_id: '1',
  status: 'new',
});

const [printJobForm, setPrintJobForm] = useState({
  item_id: '1',
  printer_id: '1',
  spool_id: '1',
  status: 'done',
  filament_cost: '',
  avg_power_w: '',
  electricity_tariff: '',
  other_cost: '0',
  filament_used_g: '0',
  support_used_g: '0',
  waste_g: '0',
  start_time: '',
  end_time: '',
});

  async function loadAllData() {
    try {
      const [productsRes, printersRes, ordersRes, materialsRes] = await Promise.all([
        fetch(`${API}/products`),
        fetch(`${API}/printers`),
        fetch(`${API}/orders`),
        fetch(`${API}/materials`),
      ]);

      const [productsData, printersData, ordersData, materialsData] = await Promise.all([
        productsRes.json(),
        printersRes.json(),
        ordersRes.json(),
        materialsRes.json(),
      ]);

      setProducts(safeArray(productsData));
      setPrinters(safeArray(printersData));
      setOrders(safeArray(ordersData));
      setMaterials(safeArray(materialsData));
    } catch (error) {
      console.error('Load error:', error);
      setMessage({ type: 'error', text: 'Could not load data from backend.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((item) =>
      [item.product_name, item.sku, item.description]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [products, search]);

  const filteredPrinters = useMemo(() => {
    return printers.filter((item) =>
      [item.printer_name, item.model_name, item.serial_number]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [printers, search]);

  const filteredOrders = useMemo(() => {
    return orders.filter((item) =>
      [item.status, item.order_number, item.client_id]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [orders, search]);

  const filteredMaterials = useMemo(() => {
    return materials.filter((item) =>
      [item.material_name, item.material_type, item.brand]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [materials, search]);

  const totalProductValue = useMemo(() => {
    return products.reduce((sum, item) => sum + Number(item.base_price || 0), 0);
  }, [products]);

  const totalWearPerHour = useMemo(() => {
    return printers.reduce((sum, item) => sum + Number(item.wear_per_hour || 0), 0);
  }, [printers]);

  const activeOrders = useMemo(() => {
    return orders.filter((item) => !['done', 'completed', 'cancelled'].includes(String(item.status || '').toLowerCase())).length;
  }, [orders]);

  const lowMaterials = useMemo(() => {
    return materials.filter((item) => Number(item.current_stock || item.quantity || 0) <= Number(item.min_stock || 0)).length;
  }, [materials]);

  const dashboardAlerts = useMemo(() => {
    const alerts = [];
    if (lowMaterials > 0) alerts.push(`${lowMaterials} material(s) are at or below minimum stock.`);
    if (activeOrders > 0) alerts.push(`${activeOrders} active order(s) need production control.`);
    if (printers.length > 0) alerts.push(`${printers.length} printers are connected in the production database.`);
    if (alerts.length === 0) alerts.push('System is online. No critical alerts at the moment.');
    return alerts;
  }, [lowMaterials, activeOrders, printers.length]);

  const topNav = [
    ['dashboard', 'Dashboard'],
    ['products', 'Products'],
    ['printers', 'Printers'],
    ['orders', 'Orders'],
    ['materials', 'Materials'],
    ['finance', 'Finance'],
  ];

  function updateForm(setter, field, value) {
    setter((prev) => ({ ...prev, [field]: value }));
  }

  async function submitProduct(e) {
    e.preventDefault();

    try {
      const res = await fetch(`${API}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not add product');

      setMessage({ type: 'success', text: 'Product added successfully.' });
      setShowProductModal(false);
      setProductForm({
        category_id: '1',
        model_id: '1',
        sku: '',
        product_name: '',
        unit_name: 'pcs',
        description_text: '',
        base_price: '',
        min_stock_qty: '0',
        is_printed_on_demand: '1',
      });
      loadAllData();
      setTab('products');
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  }

  async function submitOrder(e) {
    e.preventDefault();

    try {
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not add order');

      setMessage({ type: 'success', text: 'Order created successfully.' });
      setShowOrderModal(false);
     setOrderForm({
  client_id: '1',
  status: 'new',
    });
      loadAllData();
      setTab('orders');
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  }

  async function submitPrintJob(e) {
    e.preventDefault();

    try {
      const res = await fetch(`${API}/print-jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(printJobForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not register print job');

      setMessage({ type: 'success', text: 'Print job registered successfully.' });
      setShowPrintJobModal(false);    
  setPrintJobForm({
  item_id: '1',
  printer_id: '1',
  spool_id: '1',
  status: 'done',
  filament_cost: '',
  avg_power_w: '',
  electricity_tariff: '',
  other_cost: '0',
  filament_used_g: '0',
  support_used_g: '0',
  waste_g: '0',
  start_time: '',
  end_time: '',
});
      loadAllData();
      setTab('printers');
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  }

  return (
    <>
      <style>{appStyles}</style>

      <div className="erp-app">
        <div className="erp-shell">
          <div className="topbar">
            <div className="title-block">
              <h1>3D Print Farm ERP</h1>
              <p>Full control of products, 3D printers, materials, warehouse and orders in one production interface.</p>
            </div>

            <div className="toolbar">
              <button className="btn btn-primary" onClick={() => setShowOrderModal(true)}>
                New Order
              </button>
              <button className="btn btn-soft" onClick={() => setShowProductModal(true)}>
                Add Product
              </button>
              <button className="btn btn-soft" onClick={() => setShowPrintJobModal(true)}>
                Register Print Job
              </button>
            </div>
          </div>

          {message.text && (
            <div className={`notice ${message.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: 18 }}>
              {message.text}
            </div>
          )}

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-top">
                <span className="stat-label">Products in Catalog</span>
                <div className="stat-icon">P</div>
              </div>
              <p className="stat-value">{products.length}</p>
              <p className="stat-sub">Reusable product positions for fast sales and production.</p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span className="stat-label">Connected Printers</span>
                <div className="stat-icon">3D</div>
              </div>
              <p className="stat-value">{printers.length}</p>
              <p className="stat-sub">Includes wear calculation and machine accounting.</p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span className="stat-label">Orders in System</span>
                <div className="stat-icon">O</div>
              </div>
              <p className="stat-value">{orders.length}</p>
              <p className="stat-sub">Currently active: {activeOrders}</p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span className="stat-label">Materials</span>
                <div className="stat-icon">M</div>
              </div>
              <p className="stat-value">{materials.length}</p>
              <p className="stat-sub">Low stock positions: {lowMaterials}</p>
            </div>
          </div>

          <div className="main-grid">
            <aside className="sidebar">
              <h3>Sections</h3>
              <div className="nav-list">
                {topNav.map(([key, label]) => (
                  <button
                    key={key}
                    className={`nav-btn ${tab === key ? 'active' : ''}`}
                    onClick={() => setTab(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </aside>

            <main className="content">
              {tab === 'dashboard' && (
                <>
                  <section className="panel">
                    <div className="panel-head">
                      <div>
                        <h2 className="panel-title">Dashboard Overview</h2>
                        <p className="panel-subtitle">Quick operational view of production, orders, materials and printer accounting.</p>
                      </div>
                    </div>

                    <div className="two-col">
                      <div className="cards-grid">
                        <div className="mini-card">
                          <h4>Total Base Price of Catalog</h4>
                          <p className="metric">{formatMoney(totalProductValue)}</p>
                          <p className="muted">Sum of base prices from products table.</p>
                        </div>

                        <div className="mini-card">
                          <h4>Total Printer Wear / Hour</h4>
                          <p className="metric">{totalWearPerHour.toFixed(2)}</p>
                          <p className="muted">Calculated from printer purchase cost and resource hours.</p>
                        </div>

                        <div className="mini-card">
                          <h4>Active Orders</h4>
                          <p className="metric">{activeOrders}</p>
                          <p className="muted">Orders that still require production or closing.</p>
                        </div>

                        <div className="mini-card">
                          <h4>Material Control</h4>
                          <p className="metric">{lowMaterials}</p>
                          <p className="muted">Positions that need purchasing attention.</p>
                        </div>
                      </div>

                      <div className="panel" style={{ padding: 18 }}>
                        <div className="panel-head" style={{ marginBottom: 12 }}>
                          <div>
                            <h2 className="panel-title" style={{ fontSize: 18 }}>Alerts & Notes</h2>
                            <p className="panel-subtitle">Operational highlights from your ERP data.</p>
                          </div>
                        </div>

                        <div className="list">
                          {dashboardAlerts.map((alert, i) => (
                            <div className="list-item" key={i}>
                              <div>
                                <p className="item-title">System note #{i + 1}</p>
                                <p className="item-sub">{alert}</p>
                              </div>
                              <span className="badge badge-blue">Info</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="panel">
                    <div className="panel-head">
                      <div>
                        <h2 className="panel-title">Quick Lists</h2>
                        <p className="panel-subtitle">Latest products, printers and orders visible without switching sections.</p>
                      </div>
                    </div>

                    <div className="two-col">
                      <div className="list">
                        {products.slice(0, 5).map((item) => (
                          <div className="list-item" key={item.product_id}>
                            <div>
                              <p className="item-title">{item.product_name || 'Unnamed product'}</p>
                              <p className="item-sub">SKU: {item.sku || '—'} · Base price: {formatMoney(item.base_price)}</p>
                            </div>
                            <span className="badge badge-green">Product</span>
                          </div>
                        ))}
                        {products.length === 0 && <div className="empty">No products found in the database.</div>}
                      </div>

                      <div className="list">
                        {orders.slice(0, 5).map((item) => (
                          <div className="list-item" key={item.order_id}>
                            <div>
                              <p className="item-title">Order #{item.order_id}</p>
                              <p className="item-sub">Client ID: {item.client_id ?? '—'} · Status: {item.status || '—'}</p>
                            </div>
                            <span className={getStatusBadge(item.status)}>{item.status || 'Unknown'}</span>
                          </div>
                        ))}
                        {orders.length === 0 && <div className="empty">No orders found in the database.</div>}
                      </div>
                    </div>
                  </section>
                </>
              )}

              {tab === 'products' && (
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <h2 className="panel-title">Products Catalog</h2>
                      <p className="panel-subtitle">Stored reusable products for sales, costing and production planning.</p>
                    </div>
                    <input
                      className="search"
                      placeholder="Search by product name, SKU or description"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Product Name</th>
                          <th>SKU</th>
                          <th>Category</th>
                          <th>Base Price</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((item) => (
                          <tr key={item.product_id}>
                            <td>{item.product_id}</td>
                            <td>{item.product_name || '—'}</td>
                            <td>{item.sku || '—'}</td>
                            <td>{item.category_id ?? item.category_name ?? '—'}</td>
                            <td>{formatMoney(item.base_price)}</td>
                            <td><span className="badge badge-green">Active</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredProducts.length === 0 && <div className="empty">No products match your search.</div>}
                  </div>
                </section>
              )}

              {tab === 'printers' && (
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <h2 className="panel-title">Printers Registry</h2>
                      <p className="panel-subtitle">Monitoring of machines, wear accounting and production resources.</p>
                    </div>
                    <input
                      className="search"
                      placeholder="Search by printer, model or serial number"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <div className="list">
                    {filteredPrinters.map((item) => {
                      const wearLevel = Math.min(100, Math.round(Number(item.wear_per_hour || 0) * 10));

                      return (
                        <div className="list-item" key={item.printer_id}>
                          <div style={{ flex: 1 }}>
                            <p className="item-title">{item.printer_name || `Printer #${item.printer_id}`}</p>
                            <p className="item-sub">
                              Model: {item.model_name || '—'} · Serial: {item.serial_number || '—'} · Resource hours: {item.resource_hours ?? '—'}
                            </p>
                          </div>
                          <div>
                            <p className="item-sub" style={{ marginBottom: 6 }}>
                              Wear/hour: {Number(item.wear_per_hour || 0).toFixed(2)}
                            </p>
                            <div className="progress">
                              <span style={{ width: `${wearLevel}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {filteredPrinters.length === 0 && <div className="empty">No printers match your search.</div>}
                  </div>
                </section>
              )}

              {tab === 'orders' && (
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <h2 className="panel-title">Orders Management</h2>
                      <p className="panel-subtitle">Order control, production status and basic client linkage.</p>
                    </div>
                    <input
                      className="search"
                      placeholder="Search by status, order number or client id"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Order Number</th>
                          <th>Client</th>
                          <th>Status</th>
                          <th>Total Amount</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((item) => (
                          <tr key={item.order_id}>
                            <td>{item.order_id}</td>
                            <td>{item.order_number || `ORD-${item.order_id}`}</td>
                            <td>{item.client_id ?? '—'}</td>
                            <td><span className={getStatusBadge(item.status)}>{item.status || 'Unknown'}</span></td>
                            <td>{formatMoney(item.total_amount || item.total_price || 0)}</td>
                            <td>{item.created_at ? String(item.created_at).slice(0, 10) : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredOrders.length === 0 && <div className="empty">No orders match your search.</div>}
                  </div>
                </section>
              )}

              {tab === 'materials' && (
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <h2 className="panel-title">Materials & Components</h2>
                      <p className="panel-subtitle">Filament and other materials used in the 3D print farm.</p>
                    </div>
                    <input
                      className="search"
                      placeholder="Search by material name, type or brand"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Material</th>
                          <th>Type</th>
                          <th>Brand</th>
                          <th>Current Stock</th>
                          <th>Minimum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMaterials.map((item) => {
                          const current = Number(item.current_stock || item.quantity || 0);
                          const min = Number(item.min_stock || 0);
                          const low = current <= min && min > 0;

                          return (
                            <tr key={item.material_id}>
                              <td>{item.material_id}</td>
                              <td>{item.material_name || '—'}</td>
                              <td>{item.material_type || item.category_id || '—'}</td>
                              <td>{item.brand || '—'}</td>
                              <td>{current}</td>
                              <td>
                                <span className={low ? 'badge badge-red' : 'badge badge-green'}>
                                  {min || 0}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {filteredMaterials.length === 0 && <div className="empty">No materials match your search.</div>}
                  </div>
                </section>
              )}

              {tab === 'finance' && (
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <h2 className="panel-title">Finance Summary</h2>
                      <p className="panel-subtitle">Simple dashboard based on current catalog, printers and order data.</p>
                    </div>
                  </div>

                  <div className="kpi-row">
                    <div className="kpi-box">
                      <h4>Catalog Price Sum</h4>
                      <p>{formatMoney(totalProductValue)}</p>
                    </div>
                    <div className="kpi-box">
                      <h4>Total Orders Count</h4>
                      <p>{orders.length}</p>
                    </div>
                    <div className="kpi-box">
                      <h4>Total Printer Wear / Hour</h4>
                      <p>{totalWearPerHour.toFixed(2)}</p>
                    </div>
                    <div className="kpi-box">
                      <h4>Low Materials</h4>
                      <p>{lowMaterials}</p>
                    </div>
                  </div>

                  <p className="footer-note">
                    Current version already supports reading data and creating products, orders and print jobs through backend API.
                  </p>
                </section>
              )}

              {loading && (
                <section className="panel">
                  <div className="empty">Loading data from backend...</div>
                </section>
              )}
            </main>
          </div>
        </div>
      </div>

      {showProductModal && (
        <div className="modal-backdrop" onClick={() => setShowProductModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Add Product</h3>
              <p>Create a new product position in the product catalog.</p>
            </div>

            <form onSubmit={submitProduct}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-field">
                    <label className="form-label">Category ID</label>
                    <input
                      className="form-input"
                      value={productForm.category_id}
                      onChange={(e) => updateForm(setProductForm, 'category_id', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Model ID</label>
                    <input
                      className="form-input"
                      value={productForm.model_id}
                      onChange={(e) => updateForm(setProductForm, 'model_id', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">SKU</label>
                    <input
                      className="form-input"
                      value={productForm.sku}
                      onChange={(e) => updateForm(setProductForm, 'sku', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Unit</label>
                    <input
                      className="form-input"
                      value={productForm.unit_name}
                      onChange={(e) => updateForm(setProductForm, 'unit_name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field full">
                    <label className="form-label">Product Name</label>
                    <input
                      className="form-input"
                      value={productForm.product_name}
                      onChange={(e) => updateForm(setProductForm, 'product_name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field full">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-textarea"
                      rows="3"
                      value={productForm.description_text}
                      onChange={(e) => updateForm(setProductForm, 'description_text', e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Base Price</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.01"
                      value={productForm.base_price}
                      onChange={(e) => updateForm(setProductForm, 'base_price', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Minimum Stock</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.01"
                      value={productForm.min_stock_qty}
                      onChange={(e) => updateForm(setProductForm, 'min_stock_qty', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-soft" onClick={() => setShowProductModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showOrderModal && (
        <div className="modal-backdrop" onClick={() => setShowOrderModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>New Order</h3>
              <p>Register a new customer order in the ERP system.</p>
            </div>

            <form onSubmit={submitOrder}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-field">
                    <label className="form-label">Client ID</label>
                    <input
                      className="form-input"
                      value={orderForm.client_id}
                      onChange={(e) => updateForm(setOrderForm, 'client_id', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={orderForm.status}
                      onChange={(e) => updateForm(setOrderForm, 'status', e.target.value)}
                    >
                      <option value="new">new</option>
                      <option value="processing">processing</option>
                      <option value="done">done</option>
                    </select>
                  </div>

                  <div className="form-field full">
                    <label className="form-label">Order Number</label>
                    <input
                      className="form-input"
                      value={orderForm.order_number}
                      onChange={(e) => updateForm(setOrderForm, 'order_number', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field full">
                    <label className="form-label">Total Amount</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.01"
                      value={orderForm.total_amount}
                      onChange={(e) => updateForm(setOrderForm, 'total_amount', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-soft" onClick={() => setShowOrderModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPrintJobModal && (
        <div className="modal-backdrop" onClick={() => setShowPrintJobModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Register Print Job</h3>
              <p>Add a print job so cost calculation and spool logic can run.</p>
            </div>

            <form onSubmit={submitPrintJob}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-field">
  <label className="form-label">Order Item ID</label>
  <input
    className="form-input"
    value={printJobForm.item_id}
    onChange={(e) => updateForm(setPrintJobForm, 'item_id', e.target.value)}
    required
  />
</div>
                  <div className="form-field">
                    <label className="form-label">Printer ID</label>
                    <input
                      className="form-input"
                      value={printJobForm.printer_id}
                      onChange={(e) => updateForm(setPrintJobForm, 'printer_id', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Spool ID</label>
                    <input
                      className="form-input"
                      value={printJobForm.spool_id}
                      onChange={(e) => updateForm(setPrintJobForm, 'spool_id', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={printJobForm.status}
                      onChange={(e) => updateForm(setPrintJobForm, 'status', e.target.value)}
                    >
                      <option value="done">done</option>
                      <option value="failed">failed</option>
                      <option value="printing">printing</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Filament Cost</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.01"
                      value={printJobForm.filament_cost}
                      onChange={(e) => updateForm(setPrintJobForm, 'filament_cost', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Average Power (W)</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.01"
                      value={printJobForm.avg_power_w}
                      onChange={(e) => updateForm(setPrintJobForm, 'avg_power_w', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Electricity Tariff</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.01"
                      value={printJobForm.electricity_tariff}
                      onChange={(e) => updateForm(setPrintJobForm, 'electricity_tariff', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Filament Used (g)</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.01"
                      value={printJobForm.filament_used_g}
                      onChange={(e) => updateForm(setPrintJobForm, 'filament_used_g', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Support Used (g)</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.01"
                      value={printJobForm.support_used_g}
                      onChange={(e) => updateForm(setPrintJobForm, 'support_used_g', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Waste (g)</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.01"
                      value={printJobForm.waste_g}
                      onChange={(e) => updateForm(setPrintJobForm, 'waste_g', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Other Cost</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.01"
                      value={printJobForm.other_cost}
                      onChange={(e) => updateForm(setPrintJobForm, 'other_cost', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Start Time</label>
                    <input
                      className="form-input"
                      type="datetime-local"
                      value={printJobForm.start_time}
                      onChange={(e) => updateForm(setPrintJobForm, 'start_time', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">End Time</label>
                    <input
                      className="form-input"
                      type="datetime-local"
                      value={printJobForm.end_time}
                      onChange={(e) => updateForm(setPrintJobForm, 'end_time', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-soft" onClick={() => setShowPrintJobModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Print Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}