/**inventario.js */

// Datos de respaldo por si no hay servidor
const INV_LOCAL = [
  { id_producto:1,  nombre:'Pro Plan Adulto 3kg',       categoria:'Alimento',   precio:185, stock:12, total_vendido:3,  ingresos:555  },
  { id_producto:2,  nombre:'Royal Canin Gato 1.5kg',    categoria:'Alimento',   precio:135, stock:8,  total_vendido:2,  ingresos:270  },
  { id_producto:3,  nombre:'Shampoo Neutro 500ml',       categoria:'Higiene',    precio:35,  stock:4,  total_vendido:8,  ingresos:280  },
  { id_producto:4,  nombre:'Cepillo Desmallador',        categoria:'Higiene',    precio:28,  stock:15, total_vendido:1,  ingresos:28   },
  { id_producto:5,  nombre:'Cuerda Trenzada Resistente', categoria:'Juguetes',   precio:22,  stock:30, total_vendido:5,  ingresos:110  },
  { id_producto:6,  nombre:'Pelota Interactiva',         categoria:'Juguetes',   precio:18,  stock:0,  total_vendido:10, ingresos:180  },
  { id_producto:7,  nombre:'Plato Acero Inoxidable',     categoria:'Accesorios', precio:30,  stock:10, total_vendido:2,  ingresos:60   },
  { id_producto:8,  nombre:'Correa Retráctil 5m',        categoria:'Accesorios', precio:65,  stock:3,  total_vendido:4,  ingresos:260  },
  { id_producto:9,  nombre:'Cama Acolchada Talla L',     categoria:'Camas',      precio:120, stock:4,  total_vendido:1,  ingresos:120  },
  { id_producto:10, nombre:'Cama Nórdica Talla M',       categoria:'Camas',      precio:95,  stock:0,  total_vendido:3,  ingresos:285  },
];

let invDatos = [];
let invFiltrados = [];

// ── Arranque ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  cargarInventario();
  bindInvUI();
});

// ── Cargar desde PHP o respaldo ──────────────────────────────
async function cargarInventario() {
  try {
    const res = await fetch('php/get_inventario.php');
    if (!res.ok) throw new Error();
    const data = await res.json();
    invDatos = data.length ? data : INV_LOCAL;
  } catch {
    invDatos = INV_LOCAL;
  }
  invFiltrados = [...invDatos];
  renderStats();
  renderTabla();
  notificarStockBajo();
}

// ── Stats resumen ────────────────────────────────────────────
function renderStats() {
  const total    = invDatos.length;
  const bajos    = invDatos.filter(p => p.stock > 0 && p.stock <= 5).length;
  const agotados = invDatos.filter(p => p.stock === 0).length;
  const ingresos = invDatos.reduce((s, p) => s + Number(p.ingresos), 0);

  document.getElementById('ist-total').textContent    = total;
  document.getElementById('ist-bajos').textContent    = bajos;
  document.getElementById('ist-agotados').textContent = agotados;
  document.getElementById('ist-ingresos').textContent = `Bs. ${ingresos.toFixed(0)}`;
}

// ── Tabla ────────────────────────────────────────────────────
function renderTabla() {
  const tbody = document.getElementById('inv-tbody');
  tbody.innerHTML = '';

  if (!invFiltrados.length) {
    tbody.innerHTML = `
      <tr><td colspan="8">
        <div class="inv-empty">
          <i class="fas fa-box-open"></i>
          <p>No hay productos con ese filtro</p>
        </div>
      </td></tr>`;
    return;
  }

  invFiltrados.forEach((p, idx) => {
    let stockClass = 'stock-ok';
    if      (p.stock === 0)  stockClass = 'stock-out';
    else if (p.stock <= 5)   stockClass = 'stock-low';

    let stockLabel = p.stock === 0 ? 'Agotado' : `${p.stock} uds`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color:var(--texto-suave);font-size:.78rem;">${idx + 1}</td>
      <td style="font-weight:700;color:var(--verde-oscuro);">${p.nombre}</td>
      <td>
        <span style="background:var(--verde-claro);color:var(--verde-medio);
          border-radius:999px;padding:3px 10px;font-size:.72rem;font-weight:700;">
          ${p.categoria || '—'}
        </span>
      </td>
      <td style="font-weight:700;color:var(--ambar);">Bs. ${Number(p.precio).toFixed(2)}</td>
      <td>
        <span class="stock-pill ${stockClass}">
          <i class="fas fa-circle" style="font-size:.45rem;"></i>
          ${stockLabel}
        </span>
      </td>
      <td style="color:var(--texto-suave);">${p.total_vendido ?? 0}</td>
      <td style="font-weight:600;">Bs. ${Number(p.ingresos || 0).toFixed(2)}</td>
      <td>
        <div class="stock-edit-wrap" id="edit-wrap-${p.id_producto}">
          <span class="stock-valor" id="stock-val-${p.id_producto}">${p.stock}</span>
          <button class="btn-edit-stock" onclick="activarEdicion(${p.id_producto})" title="Editar stock">
            <i class="fas fa-pen"></i>
          </button>
          <input  class="stock-input"  id="stock-input-${p.id_producto}"  type="number" min="0" value="${p.stock}">
          <button class="btn-save-stock" id="stock-save-${p.id_producto}"
                  onclick="guardarStock(${p.id_producto})">
            <i class="fas fa-check"></i> Guardar
          </button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

// ── Edición inline de stock ──────────────────────────────────
function activarEdicion(id) {
  const val   = document.getElementById(`stock-val-${id}`);
  const input = document.getElementById(`stock-input-${id}`);
  const save  = document.getElementById(`stock-save-${id}`);
  const btn   = document.querySelector(`#edit-wrap-${id} .btn-edit-stock`);

  val.style.display   = 'none';
  btn.style.display   = 'none';
  input.style.display = 'inline-block';
  save.style.display  = 'inline-block';
  input.focus();
  input.select();

  // Enter para guardar
  input.onkeydown = (e) => { if (e.key === 'Enter') guardarStock(id); };
}

async function guardarStock(id) {
  const input   = document.getElementById(`stock-input-${id}`);
  const nuevoStock = parseInt(input.value);
  if (isNaN(nuevoStock) || nuevoStock < 0) {
    mostrarToastPanel('⚠️ Ingresa un número válido');
    return;
  }

  // Actualizar en servidor
  try {
    await fetch('php/actualizar_stock.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_producto: id, stock: nuevoStock })
    });
  } catch { /* Continúa sin servidor */ }

  // Actualizar local
  const prod = invDatos.find(p => p.id_producto === id);
  if (prod) prod.stock = nuevoStock;
  const prodF = invFiltrados.find(p => p.id_producto === id);
  if (prodF) prodF.stock = nuevoStock;

  // Restaurar UI sin re-render completo
  const val   = document.getElementById(`stock-val-${id}`);
  const inp   = document.getElementById(`stock-input-${id}`);
  const save  = document.getElementById(`stock-save-${id}`);
  const btn   = document.querySelector(`#edit-wrap-${id} .btn-edit-stock`);

  val.textContent     = nuevoStock;
  val.style.display   = 'inline';
  btn.style.display   = 'inline-flex';
  inp.style.display   = 'none';
  save.style.display  = 'none';

  renderStats();
  mostrarToastPanel(`✓ Stock actualizado a ${nuevoStock} unidades`);
}

// ── Notificación stock bajo en el panel ─────────────────────
function notificarStockBajo() {
  const bajos   = invDatos.filter(p => p.stock > 0 && p.stock <= 5);
  const agotados = invDatos.filter(p => p.stock === 0);
  const el = document.getElementById('notif-stock');
  if (!el) return;

  if (agotados.length) {
    el.innerHTML = `
      <span>🚨 ${agotados.length} producto(s) agotado(s) en tienda</span>
      <span class="status-badge pendiente" style="background:#fdecea;color:#c0392b;">Urgente</span>`;
  } else if (bajos.length) {
    el.innerHTML = `
      <span>⚠️ ${bajos.length} producto(s) con stock bajo</span>
      <span class="status-badge pendiente">Inventario</span>`;
  }
}

// ── Filtros ──────────────────────────────────────────────────
function filtrarInventario() {
  const q   = document.getElementById('inv-buscar').value.trim().toLowerCase();
  const cat = document.getElementById('inv-filtro-cat').value;

  invFiltrados = invDatos.filter(p => {
    const mQ   = !q   || p.nombre.toLowerCase().includes(q);
    const mCat = !cat || p.categoria === cat;
    return mQ && mCat;
  });
  renderTabla();
}

// ── Bind UI ──────────────────────────────────────────────────
function bindInvUI() {
  const buscar = document.getElementById('inv-buscar');
  const filtro = document.getElementById('inv-filtro-cat');
  if (buscar) {
    buscar.addEventListener('input', () => {
      clearTimeout(window._invDebounce);
      window._invDebounce = setTimeout(filtrarInventario, 280);
    });
  }
  if (filtro) filtro.addEventListener('change', filtrarInventario);
}

// ── Toast panel ──────────────────────────────────────────────
function mostrarToastPanel(msg) {
  const t = document.getElementById('panel-toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
