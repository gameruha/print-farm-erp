import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

const API = 'http://localhost:3000/api';

const defaultProductForm = {
  category_id: '1',
  model_id: '1',
  sku: '',
  product_name: '',
  unit_name: 'pcs',
  description_text: '',
  base_price: '',
  min_stock_qty: '0',
  is_printed_on_demand: '1',
  is_active: '1',
};

const defaultOrderForm = {
  client_id: '1',
  manager_id: '',
  order_date: new Date().toISOString().slice(0, 10),
  due_date: '',
  source_name: 'website',
  status: 'new',
  payment_status: 'unpaid',
  delivery_address: '',
  shipping_cost: '0',
  discount_amount: '0',
  comment_text: '',
};

const defaultMaterialForm = {
  material_category_id: '1',
  supplier_id: '1',
  sku: '',
  material_name: '',
  unit_name: 'pcs',
  unit_cost: '0',
  min_stock_qty: '0',
  notes: '',
  is_active: '1',
};

const defaultOrderItemForm = {
  order_id: '',
  variant_id: '',
  quantity: '1',
  planned_unit_price: '',
  planned_unit_cost: '0',
  actual_unit_cost: '',
  line_status: 'planned',
  notes: '',
};

const defaultPrintJobForm = {
  item_id: '',
  printer_id: '',
  spool_id: '',
  operator_id: '',
  bambu_job_code: '',
  status: 'queued',
  qty_planned: '1',
  qty_good: '0',
  qty_failed: '0',
  filament_cost: '0',
  avg_power_w: '120',
  electricity_tariff: '4.32',
  electricity_cost: '0',
  wear_cost: '0',
  other_cost: '0',
  total_cost: '0',
  filament_used_g: '0',
  support_used_g: '0',
  waste_g: '0',
  start_time: '',
  end_time: '',
  notes: '',
};

function formatMoney(value) {
  const num = Number(value || 0);
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDate(value) {
  if (!value) return '—';
  return String(value).slice(0, 10);
}

function formatInputDate(value) {
  return value ? String(value).slice(0, 10) : '';
}

function formatInputDateTime(value) {
  if (!value) return '';
  return String(value).replace(' ', 'T').slice(0, 16);
}


function parseDateOnly(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(23, 59, 59, 999);
  return date;
}

function getFinancePeriodRange(period, customFrom, customTo) {
  if (period === 'all') return { start: null, end: null };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);
  const start = new Date(today);

  if (period === 'week') {
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
  } else if (period === 'month') {
    start.setDate(1);
  } else if (period === 'custom') {
    return { start: parseDateOnly(customFrom), end: endOfDay(customTo) };
  }

  return { start, end };
}

function isWithinRange(value, range) {
  const date = parseDateOnly(value);
  if (!date) return !range.start && !range.end;
  if (range.start && date < range.start) return false;
  if (range.end && date > range.end) return false;
  return true;
}

function getValueTone(value) {
  const num = Number(value || 0);
  if (num > 0) return 'finance-positive';
  if (num < 0) return 'finance-negative';
  return 'finance-neutral';
}

function getStatusBadge(status) {
  const s = String(status || '').toLowerCase();
  if (['done', 'ready', 'completed', 'paid', 'success', 'delivered', 'shipped'].includes(s)) return 'badge badge-green';
  if (['running', 'queued', 'printing', 'in_production', 'processing', 'approved', 'new'].includes(s)) return 'badge badge-blue';
  if (['maintenance', 'pending', 'waiting', 'partial', 'planned', 'unpaid'].includes(s)) return 'badge badge-orange';
  if (['failed', 'cancelled', 'error', 'low'].includes(s)) return 'badge badge-red';
  return 'badge badge-gray';
}

function safeArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function normalizeDateTime(value) {
  return value ? value.replace('T', ' ') : null;
}

function removeEmptyFields(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== '' && value !== undefined)
  );
}

function copyFields(source, defaults, formatters = {}) {
  return Object.fromEntries(
    Object.keys(defaults).map((key) => {
      const value = source?.[key] ?? defaults[key];
      return [key, formatters[key] ? formatters[key](value) : String(value ?? '')];
    })
  );
}


function calculateOrderFinance(order, allOrderItems, allPrintJobs) {
  const items = allOrderItems.filter((item) => String(item.order_id) === String(order.order_id));
  const itemIds = new Set(items.map((item) => String(item.item_id)));
  const jobs = allPrintJobs.filter((job) => itemIds.has(String(job.item_id)));

  const itemRevenue = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.planned_unit_price || 0), 0);
  const discount = Number(order.discount_amount || 0);
  const revenue = Math.max(0, itemRevenue - discount);
  const productionCost = items.reduce((sum, item) => {
    const itemJobs = jobs.filter((job) => String(job.item_id) === String(item.item_id));
    const printJobCost = itemJobs.reduce((jobSum, job) => jobSum + Number(job.total_cost || 0), 0);
    const fallbackUnitCost = Number(item.actual_unit_cost ?? item.planned_unit_cost ?? 0);
    const fallbackCost = Number(item.quantity || 0) * fallbackUnitCost;
    return sum + (printJobCost > 0 ? printJobCost : fallbackCost);
  }, 0);
  const profit = revenue - productionCost;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  return { revenue, productionCost, profit, margin, itemCount: items.length, jobCount: jobs.length };
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function Field({ children, className = '', label, hint }) {
  return (
    <div className={`form-field ${className}`.trim()}>
      <label className="form-label">{label}</label>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}

function Modal({ children, onClose, subtitle, title, danger = false }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal ${danger ? 'modal-danger' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <button className="modal-close" onClick={onClose} type="button" aria-label="Close modal">×</button>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [orders, setOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [variants, setVariants] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [printJobs, setPrintJobs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState('');
  const [financePeriod, setFinancePeriod] = useState('all');
  const [financeFrom, setFinanceFrom] = useState('');
  const [financeTo, setFinanceTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [showProductModal, setShowProductModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showOrderItemModal, setShowOrderItemModal] = useState(false);
  const [showPrintJobModal, setShowPrintJobModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [editingProductId, setEditingProductId] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [editingOrderItemId, setEditingOrderItemId] = useState(null);
  const [editingPrintJobId, setEditingPrintJobId] = useState(null);

  const [productForm, setProductForm] = useState(defaultProductForm);
  const [orderForm, setOrderForm] = useState(defaultOrderForm);
  const [materialForm, setMaterialForm] = useState(defaultMaterialForm);
  const [orderItemForm, setOrderItemForm] = useState(defaultOrderItemForm);
  const [printJobForm, setPrintJobForm] = useState(defaultPrintJobForm);

  async function fetchOptional(path) {
    try {
      const res = await fetch(`${API}${path}`);
      if (!res.ok) return [];
      return safeArray(await res.json());
    } catch (error) {
      console.warn(`Optional endpoint ${path} unavailable:`, error);
      return [];
    }
  }

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, printersData, ordersData, materialsData, variantsData, orderItemsData, printJobsData, expensesData] = await Promise.all([
        fetchOptional('/products'),
        fetchOptional('/printers'),
        fetchOptional('/orders'),
        fetchOptional('/materials'),
        fetchOptional('/product-variants'),
        fetchOptional('/order-items'),
        fetchOptional('/print-jobs'),
        fetchOptional('/expenses'),
      ]);

      setProducts(productsData);
      setPrinters(printersData);
      setOrders(ordersData);
      setMaterials(materialsData);
      setVariants(variantsData);
      setOrderItems(orderItemsData);
      setPrintJobs(printJobsData);
      setExpenses(expensesData);
    } catch (error) {
      console.error('Load error:', error);
      setMessage({ type: 'error', text: 'Could not load data from backend.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadAllData();
    });
  }, [loadAllData]);

  const productVariantOptions = useMemo(() => {
    const seen = new Set();
    const source = variants.length > 0 ? variants : products;
    return source
      .map((item) => ({
        variant_id: item.variant_id ?? item.default_variant_id ?? item.product_variant_id ?? item.product_id,
        product_id: item.product_id,
        label: item.variant_code
          ? `${item.product_name || 'Product'} · ${item.variant_code}`
          : `${item.product_name || 'Product'}${item.sku ? ` · ${item.sku}` : ''}`,
        price: item.recommended_price ?? item.base_price ?? '',
      }))
      .filter((option) => {
        if (!option.variant_id || seen.has(String(option.variant_id))) return false;
        seen.add(String(option.variant_id));
        return true;
      });
  }, [products, variants]);

  const availableOrderItems = useMemo(() => {
    if (orderItems.length > 0) return orderItems;
    return orders.flatMap((order) => safeArray(order.items).map((item) => ({ ...item, order_id: order.order_id })));
  }, [orderItems, orders]);

  const availableSpools = useMemo(() => materials.flatMap((material) => safeArray(material.spools).map((spool) => ({ ...spool, material_name: material.material_name }))), [materials]);

  const filteredProducts = useMemo(() => products.filter((item) => [item.product_name, item.sku, item.description, item.description_text].join(' ').toLowerCase().includes(search.toLowerCase())), [products, search]);
  const filteredPrinters = useMemo(() => printers.filter((item) => [item.printer_name, item.model_name, item.brand, item.model, item.serial_number].join(' ').toLowerCase().includes(search.toLowerCase())), [printers, search]);
  const filteredOrders = useMemo(() => orders.filter((item) => [item.status, item.order_number, item.order_id, item.client_id, item.source_name].join(' ').toLowerCase().includes(search.toLowerCase())), [orders, search]);
  const filteredMaterials = useMemo(() => materials.filter((item) => [item.material_name, item.material_type, item.brand, item.sku].join(' ').toLowerCase().includes(search.toLowerCase())), [materials, search]);
  const filteredPrintJobs = useMemo(() => printJobs.filter((job) => [job.job_id, job.item_id, job.printer_id, job.status, job.bambu_job_code].join(' ').toLowerCase().includes(search.toLowerCase())), [printJobs, search]);

  const orderFinanceRows = useMemo(() => orders.map((order) => ({
    order,
    ...calculateOrderFinance(order, availableOrderItems, printJobs),
  })), [availableOrderItems, orders, printJobs]);
  const financeByOrderId = useMemo(() => new Map(orderFinanceRows.map((row) => [String(row.order.order_id), row])), [orderFinanceRows]);
  const totalProductValue = useMemo(() => products.reduce((sum, item) => sum + Number(item.base_price || 0), 0), [products]);
  const totalWearPerHour = useMemo(() => printers.reduce((sum, item) => sum + Number(item.wear_per_hour || 0), 0), [printers]);
  const activeOrders = useMemo(() => orders.filter((item) => !['ready', 'shipped', 'completed', 'cancelled'].includes(String(item.status || '').toLowerCase())).length, [orders]);
  const lowMaterials = useMemo(() => materials.filter((item) => Number(item.current_stock ?? item.quantity ?? 0) <= Number(item.min_stock ?? item.min_stock_qty ?? 0)).length, [materials]);
  const runningJobs = useMemo(() => printJobs.filter((job) => ['queued', 'running', 'printing'].includes(String(job.status || '').toLowerCase())).length, [printJobs]);
  const financeRange = useMemo(() => getFinancePeriodRange(financePeriod, financeFrom, financeTo), [financeFrom, financePeriod, financeTo]);
  const filteredFinanceRows = useMemo(() => orderFinanceRows.filter(({ order }) => isWithinRange(order.order_date || order.created_at, financeRange)), [financeRange, orderFinanceRows]);
  const filteredExpenses = useMemo(() => expenses.filter((expense) => isWithinRange(expense.expense_date, financeRange)), [expenses, financeRange]);
  const filteredCompletedJobs = useMemo(() => printJobs.filter((job) => {
    const status = String(job.status || '').toLowerCase();
    return ['done', 'completed'].includes(status) && isWithinRange(job.end_time || job.start_time, financeRange);
  }), [financeRange, printJobs]);
  const financeSummary = useMemo(() => {
    const totalRevenue = filteredFinanceRows.reduce((sum, row) => sum + row.revenue, 0);
    const totalProductionCost = filteredFinanceRows.reduce((sum, row) => sum + row.productionCost, 0);
    const totalProfit = totalRevenue - totalProductionCost;
    const expenseTotal = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const expensesByType = filteredExpenses.reduce((acc, expense) => {
      const key = expense.expense_type_id ? `Type #${expense.expense_type_id}` : 'Other';
      acc[key] = (acc[key] || 0) + Number(expense.amount || 0);
      return acc;
    }, {});

    return {
      totalRevenue,
      totalProductionCost,
      totalProfit,
      averageMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
      expenseTotal,
      netProfit: totalProfit - expenseTotal,
      expensesByType,
      orderCount: filteredFinanceRows.length,
      completedJobs: filteredCompletedJobs.length,
    };
  }, [filteredCompletedJobs.length, filteredExpenses, filteredFinanceRows]);
  const financeReportRows = useMemo(() => filteredFinanceRows.map((row) => {
    const allocatedExpenses = financeSummary.totalRevenue > 0
      ? (row.revenue / financeSummary.totalRevenue) * financeSummary.expenseTotal
      : 0;
    return { ...row, allocatedExpenses, netProfit: row.profit - allocatedExpenses };
  }), [filteredFinanceRows, financeSummary.expenseTotal, financeSummary.totalRevenue]);

  const dashboardAlerts = useMemo(() => {
    const alerts = [];
    if (lowMaterials > 0) alerts.push(`${lowMaterials} material(s) are at or below minimum stock.`);
    if (activeOrders > 0) alerts.push(`${activeOrders} active order(s) need production control.`);
    if (runningJobs > 0) alerts.push(`${runningJobs} print job(s) are queued or running.`);
    if (alerts.length === 0) alerts.push('System is online. No critical alerts at the moment.');
    return alerts;
  }, [lowMaterials, activeOrders, runningJobs]);

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

  async function requestJson(path, { method = 'POST', body } = {}) {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(removeEmptyFields(body)) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || `Request failed: ${method} ${path}`);
    return data;
  }

  function openProductModal(item = null) {
    setEditingProductId(item?.product_id || null);
    setProductForm(item ? copyFields(item, defaultProductForm) : defaultProductForm);
    setShowProductModal(true);
  }

  function openOrderModal(item = null) {
    setEditingOrderId(item?.order_id || null);
    setOrderForm(item ? copyFields(item, defaultOrderForm, { order_date: formatInputDate, due_date: formatInputDate }) : defaultOrderForm);
    setShowOrderModal(true);
  }

  function openMaterialModal(item = null) {
    setEditingMaterialId(item?.material_id || null);
    setMaterialForm(item ? copyFields(item, defaultMaterialForm) : defaultMaterialForm);
    setShowMaterialModal(true);
  }

  function openOrderItemModal(itemOrOrderId = '') {
    const item = typeof itemOrOrderId === 'object' ? itemOrOrderId : null;

    if (item) {
      setEditingOrderItemId(item.item_id);
      setOrderItemForm(copyFields(item, defaultOrderItemForm));
    } else {
      const orderId = typeof itemOrOrderId === 'string' ? itemOrOrderId : '';
      setEditingOrderItemId(null);
      setOrderItemForm((prev) => ({
        ...defaultOrderItemForm,
        order_id: orderId || prev.order_id || String(orders[0]?.order_id || ''),
        variant_id: prev.variant_id || String(productVariantOptions[0]?.variant_id || ''),
        planned_unit_price: prev.planned_unit_price || String(productVariantOptions[0]?.price || ''),
      }));
    }

    setShowOrderItemModal(true);
  }

  function openPrintJobModal(itemOrId = '') {
    const job = typeof itemOrId === 'object' ? itemOrId : null;
    const firstItemId = typeof itemOrId === 'string' ? itemOrId : availableOrderItems[0]?.item_id || '';

    if (job) {
      setEditingPrintJobId(job.job_id);
      setPrintJobForm(copyFields(job, defaultPrintJobForm, { start_time: formatInputDateTime, end_time: formatInputDateTime }));
    } else {
      setEditingPrintJobId(null);
      setPrintJobForm((prev) => ({
        ...defaultPrintJobForm,
        item_id: String(firstItemId || prev.item_id || ''),
        printer_id: String(printers[0]?.printer_id || prev.printer_id || ''),
        spool_id: String(availableSpools[0]?.spool_id || prev.spool_id || ''),
      }));
    }
    setShowPrintJobModal(true);
  }

  function closeProductModal() {
    setShowProductModal(false);
    setEditingProductId(null);
    setProductForm(defaultProductForm);
  }

  function closeOrderModal() {
    setShowOrderModal(false);
    setEditingOrderId(null);
    setOrderForm(defaultOrderForm);
  }

  function closeMaterialModal() {
    setShowMaterialModal(false);
    setEditingMaterialId(null);
    setMaterialForm(defaultMaterialForm);
  }

  function closeOrderItemModal() {
    setShowOrderItemModal(false);
    setEditingOrderItemId(null);
    setOrderItemForm(defaultOrderItemForm);
  }

  function closePrintJobModal() {
    setShowPrintJobModal(false);
    setEditingPrintJobId(null);
    setPrintJobForm(defaultPrintJobForm);
  }

  async function submitProduct(e) {
    e.preventDefault();
    try {
      await requestJson(editingProductId ? `/products/${editingProductId}` : '/products', { method: editingProductId ? 'PUT' : 'POST', body: productForm });
      setMessage({ type: 'success', text: `Product ${editingProductId ? 'updated' : 'added'} successfully.` });
      closeProductModal();
      await loadAllData();
      setTab('products');
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  }

  async function submitOrder(e) {
    e.preventDefault();
    try {
      await requestJson(editingOrderId ? `/orders/${editingOrderId}` : '/orders', { method: editingOrderId ? 'PUT' : 'POST', body: orderForm });
      setMessage({ type: 'success', text: `Order ${editingOrderId ? 'updated' : 'created'} successfully.` });
      closeOrderModal();
      await loadAllData();
      setTab('orders');
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  }

  async function submitMaterial(e) {
    e.preventDefault();
    try {
      await requestJson(editingMaterialId ? `/materials/${editingMaterialId}` : '/materials', { method: editingMaterialId ? 'PUT' : 'POST', body: materialForm });
      setMessage({ type: 'success', text: `Material ${editingMaterialId ? 'updated' : 'created'} successfully.` });
      closeMaterialModal();
      await loadAllData();
      setTab('materials');
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  }

  async function submitOrderItem(e) {
    e.preventDefault();
    try {
      await requestJson(editingOrderItemId ? `/order-items/${editingOrderItemId}` : '/order-items', {
        method: editingOrderItemId ? 'PUT' : 'POST',
        body: orderItemForm,
      });
      setMessage({ type: 'success', text: `Order item ${editingOrderItemId ? 'updated' : 'created'}. You can now register a print job for its item_id.` });
      closeOrderItemModal();
      await loadAllData();
      setTab('orders');
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  }

  async function submitPrintJob(e) {
    e.preventDefault();

    if (!printJobForm.item_id) {
      setMessage({ type: 'error', text: 'Select an order item first. print_jobs.item_id must reference order_items.item_id.' });
      return;
    }

    try {
      await requestJson(editingPrintJobId ? `/print-jobs/${editingPrintJobId}` : '/print-jobs', {
        method: editingPrintJobId ? 'PUT' : 'POST',
        body: {
          ...printJobForm,
          spool_id: printJobForm.spool_id || null,
          operator_id: printJobForm.operator_id || null,
          start_time: normalizeDateTime(printJobForm.start_time),
          end_time: normalizeDateTime(printJobForm.end_time),
        },
      });
      setMessage({ type: 'success', text: `Print job ${editingPrintJobId ? 'updated' : 'registered'} successfully against an order item.` });
      closePrintJobModal();
      await loadAllData();
      setTab('printers');
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  }

  function askDelete(resource, path, id, label) {
    setDeleteTarget({ resource, path, id, label });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      const result = await fetch(`${API}${deleteTarget.path}/${deleteTarget.id}`, { method: 'DELETE' }).then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const blockedMessage = res.status === 409
            ? `Delete blocked: ${deleteTarget.label} is linked to other database records. Remove dependent records first, or archive/edit it when possible.`
            : data.error || `Could not delete ${deleteTarget.resource}.`;
          throw new Error(blockedMessage);
        }
        return data;
      });
      setMessage({
        type: 'success',
        text: result.archived ? result.message : `${deleteTarget.label} deleted successfully.`,
      });
      setDeleteTarget(null);
      await loadAllData();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      setDeleteTarget(null);
    }
  }

  return (
    <div className="erp-app">
      <div className="erp-shell">
        <div className="hero-card">
          <div className="title-block">
            <span className="eyebrow">Production ERP · 3D Print Farm</span>
            <h1>Plan orders, register print jobs, and keep the farm moving.</h1>
            <p>One university-project interface for products, order items, printers, materials, and cost control.</p>
          </div>
          <div className="toolbar">
            <button className="btn btn-primary" onClick={() => openOrderModal()}>New Order</button>
            <button className="btn btn-soft" onClick={() => openOrderItemModal()}>Add Order Item</button>
            <button className="btn btn-soft" onClick={() => openProductModal()}>Add Product</button>
            <button className="btn btn-soft" onClick={() => openMaterialModal()}>Add Material</button>
            <button className="btn btn-dark" onClick={() => openPrintJobModal()}>Register Print Job</button>
          </div>
        </div>

        {message.text && <div className={`notice ${message.type === 'success' ? 'success' : 'error'}`}>{message.text}</div>}

        <div className="stats-grid">
          <div className="stat-card accent-blue"><span className="stat-label">Products</span><p className="stat-value">{products.length}</p><p className="stat-sub">Catalog entries ready for quoting</p></div>
          <div className="stat-card accent-purple"><span className="stat-label">Printers</span><p className="stat-value">{printers.length}</p><p className="stat-sub">Wear/hour: {totalWearPerHour.toFixed(2)}</p></div>
          <div className="stat-card accent-orange"><span className="stat-label">Active Orders</span><p className="stat-value">{activeOrders}</p><p className="stat-sub">Items: {orderItems.length}</p></div>
          <div className="stat-card accent-green"><span className="stat-label">Print Jobs</span><p className="stat-value">{printJobs.length}</p><p className="stat-sub">Queued/running: {runningJobs}</p></div>
        </div>

        <div className="main-grid">
          <aside className="sidebar">
            <h3>Workspace</h3>
            <div className="nav-list">
              {topNav.map(([key, label]) => (
                <button key={key} className={`nav-btn ${tab === key ? 'active' : ''}`} onClick={() => { setTab(key); setSearch(''); }}>{label}</button>
              ))}
            </div>
            <div className="sidebar-tip"><strong>Workflow</strong><span>Order → Order Item → Print Job. Jobs always reference order_items.item_id.</span></div>
          </aside>

          <main className="content">
            {loading && <div className="panel loading-panel">Loading ERP data…</div>}

            {!loading && tab === 'dashboard' && (
              <>
                <section className="panel workflow-panel">
                  <div className="panel-head"><div><h2 className="panel-title">Correct Production Workflow</h2><p className="panel-subtitle">Follow the database relationship required by the project.</p></div></div>
                  <div className="workflow-steps">
                    <div><span>1</span><strong>Create order</strong><p>Save customer order header and status.</p></div>
                    <div><span>2</span><strong>Add order item</strong><p>Create order_items row with product variant and quantity.</p></div>
                    <div><span>3</span><strong>Register print job</strong><p>Select item_id from order_items so print_jobs keeps its FK valid.</p></div>
                  </div>
                </section>

                <section className="two-col">
                  <div className="panel">
                    <div className="panel-head"><div><h2 className="panel-title">Alerts & Notes</h2><p className="panel-subtitle">Operational highlights from current data.</p></div></div>
                    <div className="list">{dashboardAlerts.map((alert, i) => <div className="list-item" key={alert}><div><p className="item-title">System note #{i + 1}</p><p className="item-sub">{alert}</p></div><span className="badge badge-blue">Info</span></div>)}</div>
                  </div>
                  <div className="panel">
                    <div className="panel-head"><div><h2 className="panel-title">Financial Snapshot</h2><p className="panel-subtitle">Quick estimates from product and line data.</p></div></div>
                    <div className="cards-grid compact"><div className="mini-card"><h4>Catalog Base Value</h4><p className="metric">{formatMoney(totalProductValue)}</p></div><div className="mini-card"><h4>Total Revenue</h4><p className="metric">{formatMoney(financeSummary.totalRevenue)}</p></div><div className="mini-card"><h4>Production Cost</h4><p className="metric">{formatMoney(financeSummary.totalProductionCost)}</p></div><div className="mini-card"><h4>Total Profit</h4><p className="metric">{formatMoney(financeSummary.totalProfit)}</p></div></div>
                  </div>
                </section>
              </>
            )}

            {!loading && tab === 'products' && (
              <section className="panel">
                <div className="panel-head"><div><h2 className="panel-title">Products Catalog</h2><p className="panel-subtitle">Reusable products for sales, costing and production planning.</p></div><input className="search" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                <div className="table-wrap"><table><thead><tr><th>ID</th><th>Product</th><th>SKU</th><th>Unit</th><th>Base Price</th><th>Status</th><th>Actions</th></tr></thead><tbody>
                  {filteredProducts.map((item) => <tr key={item.product_id}><td>#{item.product_id}</td><td><strong>{item.product_name || '—'}</strong><span>{item.description_text || item.description || 'No description'}</span></td><td>{item.sku || '—'}</td><td>{item.unit_name || 'pcs'}</td><td>{formatMoney(item.base_price)}</td><td><span className={Number(item.is_active ?? 1) ? 'badge badge-green' : 'badge badge-gray'}>{Number(item.is_active ?? 1) ? 'Active' : 'Inactive'}</span></td><td><div className="row-actions"><button className="inline-action" onClick={() => openProductModal(item)}>Edit</button><button className="inline-action danger" onClick={() => askDelete('product', '/products', item.product_id, `Product #${item.product_id}`)}>Delete</button></div></td></tr>)}
                </tbody></table>{filteredProducts.length === 0 && <div className="empty">No products match your search.</div>}</div>
              </section>
            )}

            {!loading && tab === 'printers' && (
              <section className="panel">
                <div className="panel-head"><div><h2 className="panel-title">Printers & Jobs</h2><p className="panel-subtitle">Machine registry plus recently loaded print jobs.</p></div><input className="search" placeholder="Search printers or jobs" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                <div className="list printer-list">
                  {filteredPrinters.map((item) => { const wearLevel = Math.min(100, Math.round(Number(item.wear_per_hour || 0) * 10)); return <div className="list-item" key={item.printer_id}><div><p className="item-title">{item.printer_name || `Printer #${item.printer_id}`}</p><p className="item-sub">{item.brand || item.model_name || 'Model'} {item.model || ''} · Serial: {item.serial_number || '—'}</p></div><div><p className="item-sub right">Wear/hour {Number(item.wear_per_hour || 0).toFixed(2)}</p><div className="progress"><span style={{ width: `${wearLevel}%` }} /></div></div></div>; })}
                  {filteredPrinters.length === 0 && <div className="empty">No printers match your search.</div>}
                </div>
                <div className="subsection-head"><h3>Registered Print Jobs</h3><button className="btn btn-soft" onClick={() => openPrintJobModal()}>Register Print Job</button></div>
                <div className="table-wrap"><table><thead><tr><th>Job</th><th>Order Item</th><th>Printer</th><th>Status</th><th>Good/Failed</th><th>Total Cost</th><th>Actions</th></tr></thead><tbody>
                  {filteredPrintJobs.map((job) => <tr key={job.job_id}><td><strong>#{job.job_id}</strong><span>{job.bambu_job_code || 'Manual job'}</span></td><td>item_id #{job.item_id}</td><td>#{job.printer_id}</td><td><span className={getStatusBadge(job.status)}>{job.status || 'queued'}</span></td><td>{job.qty_good ?? 0}/{job.qty_failed ?? 0}</td><td>{formatMoney(job.total_cost)}</td><td><div className="row-actions"><button className="inline-action" onClick={() => openPrintJobModal(job)}>Edit</button><button className="inline-action danger" onClick={() => askDelete('print job', '/print-jobs', job.job_id, `Print job #${job.job_id}`)}>Delete</button></div></td></tr>)}
                </tbody></table>{filteredPrintJobs.length === 0 && <div className="empty">No print jobs loaded yet.</div>}</div>
              </section>
            )}

            {!loading && tab === 'orders' && (
              <section className="panel">
                <div className="panel-head"><div><h2 className="panel-title">Orders Management</h2><p className="panel-subtitle">Create orders, add order_items, then link print jobs.</p></div><input className="search" placeholder="Search orders" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                <div className="table-wrap"><table><thead><tr><th>Order</th><th>Client</th><th>Status</th><th>Revenue</th><th>Production Cost</th><th>Profit</th><th>Margin</th><th>Actions</th></tr></thead><tbody>
                  {filteredOrders.map((item) => {
                    const finance = financeByOrderId.get(String(item.order_id)) || calculateOrderFinance(item, availableOrderItems, printJobs);
                    return <tr key={item.order_id}><td><strong>#{item.order_id}</strong><span>{item.source_name || item.order_number || formatDate(item.order_date || item.created_at)}</span></td><td>Client #{item.client_id ?? '—'}</td><td><span className={getStatusBadge(item.status)}>{item.status || 'new'}</span><span>{item.payment_status || 'unpaid'}</span></td><td>{formatMoney(finance.revenue)}</td><td>{formatMoney(finance.productionCost)}</td><td><span className={getValueTone(finance.profit)}>{formatMoney(finance.profit)}</span></td><td><span className={getValueTone(finance.margin)}>{formatPercent(finance.margin)}</span></td><td><div className="row-actions"><button className="inline-action" onClick={() => openOrderItemModal(String(item.order_id))}>Add item</button><button className="inline-action" onClick={() => openOrderModal(item)}>Edit</button><button className="inline-action danger" onClick={() => askDelete('order', '/orders', item.order_id, `Order #${item.order_id}`)}>Delete</button></div></td></tr>;
                  })}
                </tbody></table>{filteredOrders.length === 0 && <div className="empty">No orders match your search.</div>}</div>

                <div className="subsection-head"><h3>Order Items</h3><button className="btn btn-soft" onClick={() => openOrderItemModal()}>Add Order Item</button></div>
                <div className="table-wrap"><table><thead><tr><th>Item ID</th><th>Order</th><th>Variant</th><th>Qty</th><th>Revenue</th><th>Cost</th><th>Status</th><th>Actions</th></tr></thead><tbody>
                  {availableOrderItems.map((item) => <tr key={item.item_id}><td><strong>#{item.item_id}</strong></td><td>Order #{item.order_id}</td><td>Variant #{item.variant_id}</td><td>{item.quantity}</td><td>{formatMoney(Number(item.quantity || 0) * Number(item.planned_unit_price || 0))}</td><td>{formatMoney(Number(item.quantity || 0) * Number(item.actual_unit_cost ?? item.planned_unit_cost ?? 0))}</td><td><span className={getStatusBadge(item.line_status)}>{item.line_status || 'planned'}</span></td><td><div className="row-actions"><button className="inline-action" onClick={() => openPrintJobModal(String(item.item_id))}>Print</button><button className="inline-action" onClick={() => openOrderItemModal(item)}>Edit</button><button className="inline-action danger" onClick={() => askDelete('order item', '/order-items', item.item_id, `Order item #${item.item_id}`)}>Delete</button></div></td></tr>)}
                </tbody></table>{availableOrderItems.length === 0 && <div className="empty">No order_items loaded. Add an order item before registering print jobs.</div>}</div>
              </section>
            )}

            {!loading && tab === 'materials' && (
              <section className="panel">
                <div className="panel-head"><div><h2 className="panel-title">Materials Inventory</h2><p className="panel-subtitle">Packaging, accessories and stock control.</p></div><input className="search" placeholder="Search materials" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                <div className="table-wrap"><table><thead><tr><th>ID</th><th>Material</th><th>SKU</th><th>Unit</th><th>Cost</th><th>Stock Alert</th><th>Actions</th></tr></thead><tbody>
                  {filteredMaterials.map((item) => <tr key={item.material_id}><td>#{item.material_id}</td><td><strong>{item.material_name || '—'}</strong><span>{item.notes || item.material_type || item.brand || 'Consumable'}</span></td><td>{item.sku || '—'}</td><td>{item.unit_name || 'pcs'}</td><td>{formatMoney(item.unit_cost || item.cost_per_unit)}</td><td><span className={Number(item.current_stock ?? item.quantity ?? 0) <= Number(item.min_stock ?? item.min_stock_qty ?? 0) ? 'badge badge-red' : 'badge badge-green'}>{Number(item.current_stock ?? item.quantity ?? 0) <= Number(item.min_stock ?? item.min_stock_qty ?? 0) ? 'Low' : 'OK'}</span></td><td><div className="row-actions"><button className="inline-action" onClick={() => openMaterialModal(item)}>Edit</button><button className="inline-action danger" onClick={() => askDelete('material', '/materials', item.material_id, `Material #${item.material_id}`)}>Delete</button></div></td></tr>)}
                </tbody></table>{filteredMaterials.length === 0 && <div className="empty">No materials match your search.</div>}</div>
              </section>
            )}

            {!loading && tab === 'finance' && (
              <section className="panel finance-report">
                <div className="panel-head">
                  <div><h2 className="panel-title">Finance Report</h2><p className="panel-subtitle">Revenue, production cost, expenses and profitability by period.</p></div>
                  <div className="finance-filters">
                    {[['today', 'Today'], ['week', 'This week'], ['month', 'This month'], ['all', 'All time'], ['custom', 'Custom']].map(([key, label]) => (
                      <button key={key} className={`period-btn ${financePeriod === key ? 'active' : ''}`} onClick={() => setFinancePeriod(key)} type="button">{label}</button>
                    ))}
                  </div>
                </div>
                {financePeriod === 'custom' && <div className="custom-range"><Field label="From"><input className="form-input" type="date" value={financeFrom} onChange={(e) => setFinanceFrom(e.target.value)} /></Field><Field label="To"><input className="form-input" type="date" value={financeTo} onChange={(e) => setFinanceTo(e.target.value)} /></Field></div>}

                <div className="finance-metrics">
                  <div className="kpi-box"><h4>Total Revenue</h4><p>{formatMoney(financeSummary.totalRevenue)}</p></div>
                  <div className="kpi-box"><h4>Production Cost</h4><p>{formatMoney(financeSummary.totalProductionCost)}</p></div>
                  <div className="kpi-box"><h4>Recorded Expenses</h4><p>{formatMoney(financeSummary.expenseTotal)}</p></div>
                  <div className="kpi-box"><h4>Net Profit Before Expenses</h4><p className={getValueTone(financeSummary.totalProfit)}>{formatMoney(financeSummary.totalProfit)}</p></div>
                  <div className="kpi-box"><h4>Net Profit After Expenses</h4><p className={getValueTone(financeSummary.netProfit)}>{formatMoney(financeSummary.netProfit)}</p></div>
                  <div className="kpi-box"><h4>Average Margin</h4><p>{formatPercent(financeSummary.averageMargin)}</p></div>
                  <div className="kpi-box"><h4>Orders</h4><p>{financeSummary.orderCount}</p></div>
                  <div className="kpi-box"><h4>Completed Print Jobs</h4><p>{financeSummary.completedJobs}</p></div>
                </div>

                <div className="subsection-head"><h3>Order Profitability</h3><span className="muted">Expenses are allocated by revenue share for report visibility.</span></div>
                <div className="table-wrap finance-table"><table><thead><tr><th>Order ID</th><th>Date</th><th>Revenue</th><th>Production Cost</th><th>Expenses</th><th>Profit</th><th>Margin %</th></tr></thead><tbody>
                  {financeReportRows.map((row) => <tr key={row.order.order_id}><td><strong>#{row.order.order_id}</strong></td><td>{formatDate(row.order.order_date || row.order.created_at)}</td><td>{formatMoney(row.revenue)}</td><td>{formatMoney(row.productionCost)}</td><td>{formatMoney(row.allocatedExpenses)}</td><td><span className={getValueTone(row.netProfit)}>{formatMoney(row.netProfit)}</span></td><td><span className={getValueTone(row.margin)}>{formatPercent(row.margin)}</span></td></tr>)}
                </tbody></table>{financeReportRows.length === 0 && <div className="empty">No finance rows for this period yet. Values are shown as {formatMoney(0)}.</div>}</div>

                {Object.keys(financeSummary.expensesByType).length > 0 && <div className="table-wrap finance-expenses"><table><thead><tr><th>Expense Type</th><th>Amount</th></tr></thead><tbody>{Object.entries(financeSummary.expensesByType).map(([type, amount]) => <tr key={type}><td>{type}</td><td>{formatMoney(amount)}</td></tr>)}</tbody></table></div>}
                <p className="footer-note">Finance uses existing orders → order_items → print_jobs relationships and falls back to planned/actual item cost when no print job cost exists.</p>
              </section>
            )}
          </main>
        </div>
      </div>

      {showProductModal && (
        <Modal title={editingProductId ? 'Edit Product' : 'Add Product'} subtitle="Create or update a catalog item for sales and variants." onClose={closeProductModal}>
          <form onSubmit={submitProduct}><div className="modal-body"><div className="form-grid">
            <Field label="SKU"><input className="form-input" value={productForm.sku} onChange={(e) => updateForm(setProductForm, 'sku', e.target.value)} required /></Field>
            <Field label="Unit"><input className="form-input" value={productForm.unit_name} onChange={(e) => updateForm(setProductForm, 'unit_name', e.target.value)} required /></Field>
            <Field label="Product Name" className="full"><input className="form-input" value={productForm.product_name} onChange={(e) => updateForm(setProductForm, 'product_name', e.target.value)} required /></Field>
            <Field label="Description" className="full"><textarea className="form-textarea" rows="3" value={productForm.description_text} onChange={(e) => updateForm(setProductForm, 'description_text', e.target.value)} /></Field>
            <Field label="Category ID"><input className="form-input" type="number" value={productForm.category_id} onChange={(e) => updateForm(setProductForm, 'category_id', e.target.value)} required /></Field>
            <Field label="Model ID"><input className="form-input" type="number" value={productForm.model_id} onChange={(e) => updateForm(setProductForm, 'model_id', e.target.value)} required /></Field>
            <Field label="Base Price"><input className="form-input" type="number" step="0.01" value={productForm.base_price} onChange={(e) => updateForm(setProductForm, 'base_price', e.target.value)} required /></Field>
            <Field label="Minimum Stock"><input className="form-input" type="number" step="0.01" value={productForm.min_stock_qty} onChange={(e) => updateForm(setProductForm, 'min_stock_qty', e.target.value)} required /></Field>
            <Field label="Active"><select className="form-select" value={productForm.is_active} onChange={(e) => updateForm(setProductForm, 'is_active', e.target.value)}><option value="1">active</option><option value="0">inactive</option></select></Field>
          </div></div><div className="modal-actions"><button type="button" className="btn btn-soft" onClick={closeProductModal}>Cancel</button><button type="submit" className="btn btn-primary">{editingProductId ? 'Update Product' : 'Save Product'}</button></div></form>
        </Modal>
      )}

      {showOrderModal && (
        <Modal title={editingOrderId ? 'Edit Order' : 'New Order'} subtitle="Create or update an order header. Add order_items next." onClose={closeOrderModal}>
          <form onSubmit={submitOrder}><div className="modal-body"><div className="form-grid">
            <Field label="Client ID"><input className="form-input" type="number" value={orderForm.client_id} onChange={(e) => updateForm(setOrderForm, 'client_id', e.target.value)} required /></Field>
            <Field label="Order Date"><input className="form-input" type="date" value={orderForm.order_date} onChange={(e) => updateForm(setOrderForm, 'order_date', e.target.value)} required /></Field>
            <Field label="Due Date"><input className="form-input" type="date" value={orderForm.due_date} onChange={(e) => updateForm(setOrderForm, 'due_date', e.target.value)} /></Field>
            <Field label="Source"><input className="form-input" value={orderForm.source_name} onChange={(e) => updateForm(setOrderForm, 'source_name', e.target.value)} /></Field>
            <Field label="Status"><select className="form-select" value={orderForm.status} onChange={(e) => updateForm(setOrderForm, 'status', e.target.value)}><option value="new">new</option><option value="approved">approved</option><option value="in_production">in_production</option><option value="ready">ready</option><option value="shipped">shipped</option><option value="completed">completed</option><option value="cancelled">cancelled</option></select></Field>
            <Field label="Payment"><select className="form-select" value={orderForm.payment_status} onChange={(e) => updateForm(setOrderForm, 'payment_status', e.target.value)}><option value="unpaid">unpaid</option><option value="partial">partial</option><option value="paid">paid</option></select></Field>
            <Field label="Delivery Address" className="full"><input className="form-input" value={orderForm.delivery_address} onChange={(e) => updateForm(setOrderForm, 'delivery_address', e.target.value)} /></Field>
            <Field label="Comment" className="full"><textarea className="form-textarea" rows="3" value={orderForm.comment_text} onChange={(e) => updateForm(setOrderForm, 'comment_text', e.target.value)} /></Field>
          </div></div><div className="modal-actions"><button type="button" className="btn btn-soft" onClick={closeOrderModal}>Cancel</button><button type="submit" className="btn btn-primary">{editingOrderId ? 'Update Order' : 'Create Order'}</button></div></form>
        </Modal>
      )}

      {showMaterialModal && (
        <Modal title={editingMaterialId ? 'Edit Material' : 'Add Material'} subtitle="Create or update a material without changing the database schema." onClose={closeMaterialModal}>
          <form onSubmit={submitMaterial}><div className="modal-body"><div className="form-grid">
            <Field label="SKU"><input className="form-input" value={materialForm.sku} onChange={(e) => updateForm(setMaterialForm, 'sku', e.target.value)} required /></Field>
            <Field label="Material Name"><input className="form-input" value={materialForm.material_name} onChange={(e) => updateForm(setMaterialForm, 'material_name', e.target.value)} required /></Field>
            <Field label="Category ID"><input className="form-input" type="number" value={materialForm.material_category_id} onChange={(e) => updateForm(setMaterialForm, 'material_category_id', e.target.value)} required /></Field>
            <Field label="Supplier ID"><input className="form-input" type="number" value={materialForm.supplier_id} onChange={(e) => updateForm(setMaterialForm, 'supplier_id', e.target.value)} required /></Field>
            <Field label="Unit"><input className="form-input" value={materialForm.unit_name} onChange={(e) => updateForm(setMaterialForm, 'unit_name', e.target.value)} required /></Field>
            <Field label="Unit Cost"><input className="form-input" type="number" step="0.01" value={materialForm.unit_cost} onChange={(e) => updateForm(setMaterialForm, 'unit_cost', e.target.value)} required /></Field>
            <Field label="Minimum Stock"><input className="form-input" type="number" step="0.01" value={materialForm.min_stock_qty} onChange={(e) => updateForm(setMaterialForm, 'min_stock_qty', e.target.value)} required /></Field>
            <Field label="Active"><select className="form-select" value={materialForm.is_active} onChange={(e) => updateForm(setMaterialForm, 'is_active', e.target.value)}><option value="1">active</option><option value="0">inactive</option></select></Field>
            <Field label="Notes" className="full"><textarea className="form-textarea" rows="3" value={materialForm.notes} onChange={(e) => updateForm(setMaterialForm, 'notes', e.target.value)} /></Field>
          </div></div><div className="modal-actions"><button type="button" className="btn btn-soft" onClick={closeMaterialModal}>Cancel</button><button type="submit" className="btn btn-primary">{editingMaterialId ? 'Update Material' : 'Save Material'}</button></div></form>
        </Modal>
      )}

      {showOrderItemModal && (
        <Modal title={editingOrderItemId ? 'Edit Order Item' : 'Add Order Item'} subtitle="Create or update the order_items row that print_jobs must reference." onClose={closeOrderItemModal}>
          <form onSubmit={submitOrderItem}><div className="modal-body"><div className="form-grid">
            <Field label="Order"><select className="form-select" value={orderItemForm.order_id} onChange={(e) => updateForm(setOrderItemForm, 'order_id', e.target.value)} required><option value="">Select order</option>{orders.map((order) => <option value={order.order_id} key={order.order_id}>Order #{order.order_id} · Client #{order.client_id}</option>)}</select></Field>
            <Field label="Product Variant" hint="Uses variant_id; product_id is used only if your backend maps it."><select className="form-select" value={orderItemForm.variant_id} onChange={(e) => updateForm(setOrderItemForm, 'variant_id', e.target.value)} required><option value="">Select variant</option>{productVariantOptions.map((option) => <option value={option.variant_id} key={option.variant_id}>{option.label} · variant #{option.variant_id}</option>)}</select></Field>
            <Field label="Quantity"><input className="form-input" type="number" min="1" value={orderItemForm.quantity} onChange={(e) => updateForm(setOrderItemForm, 'quantity', e.target.value)} required /></Field>
            <Field label="Planned Unit Price"><input className="form-input" type="number" step="0.01" value={orderItemForm.planned_unit_price} onChange={(e) => updateForm(setOrderItemForm, 'planned_unit_price', e.target.value)} required /></Field>
            <Field label="Planned Unit Cost"><input className="form-input" type="number" step="0.01" value={orderItemForm.planned_unit_cost} onChange={(e) => updateForm(setOrderItemForm, 'planned_unit_cost', e.target.value)} required /></Field>
            <Field label="Line Status"><select className="form-select" value={orderItemForm.line_status} onChange={(e) => updateForm(setOrderItemForm, 'line_status', e.target.value)}><option value="planned">planned</option><option value="queued">queued</option><option value="printing">printing</option><option value="ready">ready</option><option value="delivered">delivered</option><option value="cancelled">cancelled</option></select></Field>
            <Field label="Notes" className="full"><textarea className="form-textarea" rows="3" value={orderItemForm.notes} onChange={(e) => updateForm(setOrderItemForm, 'notes', e.target.value)} /></Field>
          </div></div><div className="modal-actions"><button type="button" className="btn btn-soft" onClick={closeOrderItemModal}>Cancel</button><button type="submit" className="btn btn-primary">{editingOrderItemId ? 'Update Order Item' : 'Create Order Item'}</button></div></form>
        </Modal>
      )}

      {showPrintJobModal && (
        <Modal title={editingPrintJobId ? 'Edit Print Job' : 'Register Print Job'} subtitle="Link the job to order_items.item_id before choosing printer and costs." onClose={closePrintJobModal}>
          <form onSubmit={submitPrintJob}><div className="modal-body"><div className="relationship-note"><strong>Foreign key safety:</strong> this form sends <code>item_id</code> from an existing order item, not an order_id or product_id.</div><div className="form-grid">
            <Field label="Order Item"><select className="form-select" value={printJobForm.item_id} onChange={(e) => updateForm(setPrintJobForm, 'item_id', e.target.value)} required><option value="">Select order item</option>{availableOrderItems.map((item) => <option value={item.item_id} key={item.item_id}>item_id #{item.item_id} · order #{item.order_id} · variant #{item.variant_id}</option>)}</select></Field>
            <Field label="Printer"><select className="form-select" value={printJobForm.printer_id} onChange={(e) => updateForm(setPrintJobForm, 'printer_id', e.target.value)} required><option value="">Select printer</option>{printers.map((printer) => <option value={printer.printer_id} key={printer.printer_id}>{printer.printer_name || `Printer #${printer.printer_id}`}</option>)}</select></Field>
            <Field label="Spool ID"><input className="form-input" type="number" value={printJobForm.spool_id} onChange={(e) => updateForm(setPrintJobForm, 'spool_id', e.target.value)} placeholder="Optional" /></Field>
            <Field label="Status"><select className="form-select" value={printJobForm.status} onChange={(e) => updateForm(setPrintJobForm, 'status', e.target.value)}><option value="queued">queued</option><option value="running">running</option><option value="done">done</option><option value="failed">failed</option><option value="cancelled">cancelled</option></select></Field>
            <Field label="Qty Planned"><input className="form-input" type="number" min="1" value={printJobForm.qty_planned} onChange={(e) => updateForm(setPrintJobForm, 'qty_planned', e.target.value)} required /></Field>
            <Field label="Qty Good"><input className="form-input" type="number" min="0" value={printJobForm.qty_good} onChange={(e) => updateForm(setPrintJobForm, 'qty_good', e.target.value)} required /></Field>
            <Field label="Qty Failed"><input className="form-input" type="number" min="0" value={printJobForm.qty_failed} onChange={(e) => updateForm(setPrintJobForm, 'qty_failed', e.target.value)} required /></Field>
            <Field label="Bambu Job Code"><input className="form-input" value={printJobForm.bambu_job_code} onChange={(e) => updateForm(setPrintJobForm, 'bambu_job_code', e.target.value)} /></Field>
            <Field label="Filament Cost"><input className="form-input" type="number" step="0.01" value={printJobForm.filament_cost} onChange={(e) => updateForm(setPrintJobForm, 'filament_cost', e.target.value)} required /></Field>
            <Field label="Average Power (W)"><input className="form-input" type="number" step="0.01" value={printJobForm.avg_power_w} onChange={(e) => updateForm(setPrintJobForm, 'avg_power_w', e.target.value)} required /></Field>
            <Field label="Electricity Tariff"><input className="form-input" type="number" step="0.01" value={printJobForm.electricity_tariff} onChange={(e) => updateForm(setPrintJobForm, 'electricity_tariff', e.target.value)} required /></Field>
            <Field label="Filament Used (g)"><input className="form-input" type="number" step="0.01" value={printJobForm.filament_used_g} onChange={(e) => updateForm(setPrintJobForm, 'filament_used_g', e.target.value)} required /></Field>
            <Field label="Support Used (g)"><input className="form-input" type="number" step="0.01" value={printJobForm.support_used_g} onChange={(e) => updateForm(setPrintJobForm, 'support_used_g', e.target.value)} required /></Field>
            <Field label="Waste (g)"><input className="form-input" type="number" step="0.01" value={printJobForm.waste_g} onChange={(e) => updateForm(setPrintJobForm, 'waste_g', e.target.value)} required /></Field>
            <Field label="Other Cost"><input className="form-input" type="number" step="0.01" value={printJobForm.other_cost} onChange={(e) => updateForm(setPrintJobForm, 'other_cost', e.target.value)} required /></Field>
            <Field label="Start Time"><input className="form-input" type="datetime-local" value={printJobForm.start_time} onChange={(e) => updateForm(setPrintJobForm, 'start_time', e.target.value)} /></Field>
            <Field label="End Time"><input className="form-input" type="datetime-local" value={printJobForm.end_time} onChange={(e) => updateForm(setPrintJobForm, 'end_time', e.target.value)} /></Field>
            <Field label="Notes" className="full"><textarea className="form-textarea" rows="3" value={printJobForm.notes} onChange={(e) => updateForm(setPrintJobForm, 'notes', e.target.value)} /></Field>
          </div></div><div className="modal-actions"><button type="button" className="btn btn-soft" onClick={closePrintJobModal}>Cancel</button><button type="submit" className="btn btn-primary">{editingPrintJobId ? 'Update Print Job' : 'Save Print Job'}</button></div></form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Confirm Delete" subtitle="This action cannot be undone. Database relationships may prevent deleting linked records." onClose={() => setDeleteTarget(null)} danger>
          <div className="modal-body"><div className="delete-warning"><strong>Delete {deleteTarget.label}?</strong><p>Confirm only if this record is not needed by related ERP data.</p></div></div>
          <div className="modal-actions"><button type="button" className="btn btn-soft" onClick={() => setDeleteTarget(null)}>Cancel</button><button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button></div>
        </Modal>
      )}
    </div>
  );
}
