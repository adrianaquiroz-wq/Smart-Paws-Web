/* ============================================================
   SMART PAWS — TIENDA JS  (v2 con captura + factura + historial)
   ============================================================ */

// ── Productos de respaldo ─────────────────────────────────────
const PRODUCTOS_LOCAL = [
  { id_producto:1,  nombre:'Pro Plan Adulto 3kg',       descripcion:'Alimento balanceado premium para perros adultos', precio:185, stock:12, categoria:'Alimento',   imagen:'https://www.purina.com.co/sites/default/files/2022-01/Pro%20Plan%20Adult%201%2B%20Large%20Athletic.png' },
  { id_producto:2,  nombre:'Royal Canin Gato 1.5kg',    descripcion:'Nutrición específica para gatos domésticos',      precio:135, stock:8,  categoria:'Alimento',   imagen:'https://www.royalcanin.com/content/dam/royal-canin/product-images/cat/breed-health-nutrition/RC_BHN_MaineCoonAdult31_packshot_B1.png' },
  { id_producto:3,  nombre:'Shampoo Neutro 500ml',       descripcion:'Shampoo suave sin parabenos para todo tipo de pelo',precio:35, stock:20, categoria:'Higiene',    imagen:'https://tiendapet.com.bo/wp-content/uploads/2021/08/shampoo-perro-neutro.jpg' },
  { id_producto:4,  nombre:'Cepillo Desmallador',        descripcion:'Reduce enredos y caída de pelo eficientemente',  precio:28, stock:15, categoria:'Higiene',    imagen:'https://m.media-amazon.com/images/I/71Q9zL6IQZL._AC_SL1500_.jpg' },
  { id_producto:5,  nombre:'Cuerda Trenzada Resistente', descripcion:'Juguete dental de cuerda para perros medianos',  precio:22, stock:30, categoria:'Juguetes',   imagen:'https://m.media-amazon.com/images/I/81V3yf82dcL._AC_UF400,400_QL80_.jpg' },
  { id_producto:6,  nombre:'Pelota Interactiva',         descripcion:'Pelota con sonido para gatos y perros pequeños', precio:18, stock:25, categoria:'Juguetes',   imagen:'https://m.media-amazon.com/images/I/71jv3T4HFBL._AC_SL1500_.jpg' },
  { id_producto:7,  nombre:'Plato Acero Inoxidable',     descripcion:'Antideslizante, apto para lavavajillas',         precio:30, stock:10, categoria:'Accesorios', imagen:'https://petkorp.com/wp-content/uploads/2023/02/AP-D003-043_2.webp' },
  { id_producto:8,  nombre:'Correa Retráctil 5m',        descripcion:'Con freno de bloqueo y mango ergonómico',        precio:65, stock:6,  categoria:'Accesorios', imagen:'https://m.media-amazon.com/images/I/61VZmxGtO7L._AC_SL1200_.jpg' },
  { id_producto:9,  nombre:'Cama Acolchada Talla L',     descripcion:'Relleno de fibra suave, funda lavable',          precio:120, stock:4, categoria:'Camas',      imagen:'https://tottoco.vtexassets.com/arquivos/ids/514234/PDCBCA1009.jpg' },
  { id_producto:10, nombre:'Cama Cáscara de Nuez M',    descripcion:'Diseño nórdico, antideslizante, súper suave',    precio:95,  stock:0, categoria:'Camas',      imagen:'https://acdn-us.mitiendanube.com/stores/880/994/products/cama-nordico-pet-max-bbb870bbbc9c95738f17214116333463-1024-1024.webp' },
];

const IMG_DEFAULT = 'img/producto1.webp';

// ── Estado global ─────────────────────────────────────────────
let todosLosProductos = [];
let productosFiltrados = [];
let carrito   = [];
let deseos    = [];
let categoriaActiva = 'todos';
let capturaBase64   = null;   // guarda la imagen subida por el usuario

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  cargarDesdesLocalStorage();
  cargarProductos();
  bindUI();
});

// ── Cargar productos ──────────────────────────────────────────
async function cargarProductos() {
  try {
    const res = await fetch('php/get_productos.php');
    if (!res.ok) throw new Error('Sin servidor');
    const data = await res.json();
    todosLosProductos = data.length ? data : PRODUCTOS_LOCAL;
  } catch {
    todosLosProductos = PRODUCTOS_LOCAL;
  }
  filtrarYRenderizar();
}

// ── Filtro + render ───────────────────────────────────────────
function filtrarYRenderizar() {
  const q = document.getElementById('input-busqueda').value.trim().toLowerCase();
  productosFiltrados = todosLosProductos.filter(p => {
    const matchCat = categoriaActiva === 'todos' || p.categoria === categoriaActiva;
    const matchQ   = !q || p.nombre.toLowerCase().includes(q) || (p.descripcion||'').toLowerCase().includes(q);
    return matchCat && matchQ;
  });
  renderProductos(productosFiltrados);
  document.getElementById('count-label').textContent =
    `${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? 's' : ''}`;
}

function renderProductos(lista) {
  const grid = document.getElementById('contenedor-productos');
  grid.innerHTML = '';
  if (!lista.length) {
    grid.innerHTML = `<div class="estado-vacio"><i class="fas fa-search"></i><p>No encontramos productos con ese filtro</p></div>`;
    return;
  }
  lista.forEach(p => {
    const enDeseo = deseos.includes(p.id_producto);
    const stock   = p.stock ?? 99;
    const agotado = stock === 0;
    let stockBadge = '';
    if      (agotado)    stockBadge = `<span class="stock-badge stock-out">Agotado</span>`;
    else if (stock <= 5) stockBadge = `<span class="stock-badge stock-low">Últimos ${stock}</span>`;
    else                 stockBadge = `<span class="stock-badge stock-ok">En stock</span>`;
    const img = p.imagen || IMG_DEFAULT;
    const card = document.createElement('div');
    card.className = 'prod-card';
    card.innerHTML = `
      <div class="prod-img-wrap">
        <img src="${img}" alt="${p.nombre}" onerror="this.src='${IMG_DEFAULT}'">
        ${stockBadge}
        <button class="btn-deseo ${enDeseo ? 'activo' : ''}" data-id="${p.id_producto}" title="${enDeseo ? 'Quitar de deseos' : 'Añadir a deseos'}">
          <i class="${enDeseo ? 'fas' : 'far'} fa-heart"></i>
        </button>
      </div>
      <div class="prod-info">
        <div class="prod-categoria">${p.categoria || 'General'}</div>
        <div class="prod-nombre">${p.nombre}</div>
        <div class="prod-desc">${p.descripcion || ''}</div>
        <div class="prod-precio">Bs. ${Number(p.precio).toFixed(2)} <span>/ unidad</span></div>
        <button class="btn-carrito" data-id="${p.id_producto}" ${agotado ? 'disabled' : ''}>
          ${agotado ? '<i class="fas fa-ban"></i> Agotado' : '<i class="fas fa-cart-plus"></i> Añadir al carrito'}
        </button>
      </div>`;
    card.querySelector('.btn-deseo').addEventListener('click', () => toggleDeseo(p.id_producto));
    if (!agotado) card.querySelector('.btn-carrito').addEventListener('click', () => agregarAlCarrito(p));
    grid.appendChild(card);
  });
  renderDeseos();
}

// ── Carrito ───────────────────────────────────────────────────
function agregarAlCarrito(producto) {
  const existe = carrito.find(i => i.id_producto === producto.id_producto);
  if (existe) {
    const maxStock = producto.stock ?? 99;
    if (existe.cantidad < maxStock) { existe.cantidad++; }
    else { mostrarToast(`Solo hay ${maxStock} unidades disponibles`); return; }
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  actualizarCarritoUI();
  mostrarToast(`✓ ${producto.nombre} añadido al carrito`);
}

function cambiarCantidad(id, delta) {
  const item = carrito.find(i => i.id_producto === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) carrito = carrito.filter(i => i.id_producto !== id);
  actualizarCarritoUI();
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(i => i.id_producto !== id);
  actualizarCarritoUI();
}

function actualizarCarritoUI() {
  const total  = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const cuenta = carrito.reduce((s, i) => s + i.cantidad, 0);
  document.getElementById('carrito-badge').textContent = cuenta;
  const fab = document.getElementById('btn-abrir-carrito');
  fab.style.display = cuenta > 0 ? 'flex' : 'none';
  document.getElementById('drawer-total').textContent = `Bs. ${total.toFixed(2)}`;
  document.getElementById('btn-pagar').disabled = cuenta === 0;

  const itemsEl = document.getElementById('drawer-items');
  const vacioEl = document.getElementById('drawer-vacio');
  if (!carrito.length) {
    vacioEl.style.display = 'block';
    Array.from(itemsEl.children).forEach(c => { if (c !== vacioEl) c.remove(); });
    return;
  }
  vacioEl.style.display = 'none';
  Array.from(itemsEl.querySelectorAll('.carrito-item')).forEach(e => e.remove());
  carrito.forEach(item => {
    const img = item.imagen || IMG_DEFAULT;
    const el  = document.createElement('div');
    el.className = 'carrito-item';
    el.innerHTML = `
      <img src="${img}" alt="${item.nombre}" onerror="this.src='${IMG_DEFAULT}'">
      <div class="ci-info">
        <div class="ci-nombre">${item.nombre}</div>
        <div class="ci-precio">Bs. ${Number(item.precio).toFixed(2)}</div>
        <div class="ci-controles">
          <button class="ci-menos" data-id="${item.id_producto}"><i class="fas fa-minus"></i></button>
          <span class="ci-cant">${item.cantidad}</span>
          <button class="ci-mas"  data-id="${item.id_producto}"><i class="fas fa-plus"></i></button>
        </div>
      </div>
      <button class="ci-eliminar" data-id="${item.id_producto}" title="Eliminar"><i class="fas fa-trash"></i></button>`;
    el.querySelector('.ci-menos').addEventListener('click', () => cambiarCantidad(item.id_producto, -1));
    el.querySelector('.ci-mas').addEventListener('click',  () => cambiarCantidad(item.id_producto, +1));
    el.querySelector('.ci-eliminar').addEventListener('click', () => eliminarDelCarrito(item.id_producto));
    itemsEl.appendChild(el);
  });
}

// ── Lista de deseos ───────────────────────────────────────────
function toggleDeseo(id) {
  if (deseos.includes(id)) {
    deseos = deseos.filter(d => d !== id);
    mostrarToast('Quitado de tu lista de deseos');
  } else {
    deseos.push(id);
    mostrarToast('❤️ Añadido a tu lista de deseos');
  }
  guardarDeseosLocalStorage();
  filtrarYRenderizar();
}

function renderDeseos() {
  const section = document.getElementById('deseos-section');
  const grid    = document.getElementById('deseos-grid');
  if (!deseos.length) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  grid.innerHTML = '';
  deseos.forEach(id => {
    const p = todosLosProductos.find(x => x.id_producto === id);
    if (!p) return;
    const img = p.imagen || IMG_DEFAULT;
    const card = document.createElement('div');
    card.className = 'deseo-card';
    card.innerHTML = `
      <img src="${img}" alt="${p.nombre}" onerror="this.src='${IMG_DEFAULT}'">
      <div><div class="d-nombre">${p.nombre}</div><div class="d-precio">Bs. ${Number(p.precio).toFixed(2)}</div></div>
      <button class="d-quitar" data-id="${id}" title="Quitar"><i class="fas fa-times"></i></button>`;
    card.querySelector('.d-quitar').addEventListener('click', () => toggleDeseo(id));
    grid.appendChild(card);
  });
}

function guardarDeseosLocalStorage() { localStorage.setItem('sp_deseos', JSON.stringify(deseos)); }
function cargarDesdesLocalStorage()  { const d = localStorage.getItem('sp_deseos'); deseos = d ? JSON.parse(d) : []; }

// ── MODAL QR — PASO 1: Mostrar QR ────────────────────────────
function abrirModalPago() {
  const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  document.getElementById('modal-total-monto').textContent = `Bs. ${total.toFixed(2)}`;
  const datos = encodeURIComponent(`SMART PAWS|CUENTA:1234567890|MONTO:${total.toFixed(2)} BOB`);
  document.getElementById('qr-img').src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${datos}`;
  document.getElementById('qr-cuenta').textContent = 'Cuenta: 1-234567-890 · Smart Paws S.R.L.';

  // Resetear captura y volver al paso 1
  capturaBase64 = null;
  mostrarPasoModal(1);

  document.getElementById('modal-pago').classList.add('open');
  cerrarDrawer();
}

function cerrarModalPago() {
  document.getElementById('modal-pago').classList.remove('open');
  capturaBase64 = null;
}

// Controla qué "paso" se ve dentro del modal
function mostrarPasoModal(paso) {
  document.getElementById('paso-qr').style.display       = paso === 1 ? 'block' : 'none';
  document.getElementById('paso-captura').style.display  = paso === 2 ? 'block' : 'none';
}

// PASO 1 → 2: el usuario dice "Ya pagué"
function irAPasoCaptura() {
  // Limpiar input de archivo anterior
  document.getElementById('input-captura').value = '';
  document.getElementById('preview-captura').style.display = 'none';
  document.getElementById('btn-enviar-compra').disabled = true;
  mostrarPasoModal(2);
}

// Preview de la imagen seleccionada
function onCapturaSeleccionada(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    capturaBase64 = e.target.result; // data:image/...;base64,...
    const preview = document.getElementById('preview-captura');
    preview.src = capturaBase64;
    preview.style.display = 'block';
    document.getElementById('btn-enviar-compra').disabled = false;
  };
  reader.readAsDataURL(file);
}

// PASO 2: Enviar compra con captura → generar factura
async function enviarCompraConCaptura() {
  if (!capturaBase64) { mostrarToast('Por favor adjunta la captura'); return; }

  const btn = document.getElementById('btn-enviar-compra');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando…';

  const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const nroPedido = 'SP-' + Date.now().toString().slice(-6);

  // Guardar en historial local
  guardarEnHistorialLocal(nroPedido, total);

  // Intentar enviar al servidor
  try {
    const payload = {
      nro_pedido: nroPedido,
      items: carrito.map(i => ({
        id_producto: i.id_producto,
        cantidad:    i.cantidad,
        costo:       (i.precio * i.cantidad).toFixed(2)
      })),
      captura: capturaBase64
    };
    await fetch('php/guardar_compra.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch { /* servidor no disponible, OK */ }

  cerrarModalPago();
  carrito = [];
  actualizarCarritoUI();
  mostrarFactura(nroPedido, total);
}

// ── FACTURA ───────────────────────────────────────────────────
function mostrarFactura(nroPedido, total) {
  const ahora   = new Date();
  const fechaStr = ahora.toLocaleDateString('es-BO', { year:'numeric', month:'long', day:'numeric' });
  const horaStr  = ahora.toLocaleTimeString('es-BO', { hour:'2-digit', minute:'2-digit' });

  // Construir filas de la tabla
  const filas = carrito.length
    ? '<!-- carrito vacío al generar -->'
    : (() => {
        // Al llegar aquí carrito ya fue vaciado, usamos snapshot guardado
        return '';
      })();

  // Usamos snapshot de carrito (copiado antes de vaciarlo)
  const snapItems = JSON.parse(localStorage.getItem('sp_ultima_compra') || '[]');

  const filasHTML = snapItems.map(i => `
    <tr>
      <td>${i.nombre}</td>
      <td style="text-align:center">${i.cantidad}</td>
      <td style="text-align:right">Bs. ${Number(i.precio).toFixed(2)}</td>
      <td style="text-align:right">Bs. ${(i.precio * i.cantidad).toFixed(2)}</td>
    </tr>`).join('');

  const facturaHTML = `
    <div id="modal-factura" class="modal-overlay open" onclick="if(event.target===this)cerrarFactura()">
      <div class="modal-factura-box">
        <div class="factura-header">
          <div class="factura-logo"><i class="fas fa-paw"></i> Smart <em>Paws</em></div>
          <div class="factura-titulo">FACTURA / RECIBO</div>
        </div>
        <div class="factura-meta">
          <div><strong>N° Pedido:</strong> ${nroPedido}</div>
          <div><strong>Fecha:</strong> ${fechaStr} — ${horaStr}</div>
          <div><strong>Método de pago:</strong> QR Bancario</div>
          <div><strong>Estado:</strong> <span class="factura-badge-ok">Captura recibida ✓</span></div>
        </div>
        <table class="factura-tabla">
          <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
          <tbody>${filasHTML || '<tr><td colspan="4" style="text-align:center;color:#999">Ver detalle en historial</td></tr>'}</tbody>
          <tfoot>
            <tr class="factura-total-row">
              <td colspan="3"><strong>TOTAL</strong></td>
              <td style="text-align:right"><strong>Bs. ${Number(total).toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
        <div class="factura-nota">
          <i class="fas fa-info-circle"></i>
          Tu pedido ha sido registrado. El veterinario verificará tu comprobante y te contactará pronto para coordinar la entrega.
        </div>
        <div class="factura-acciones">
          <button class="btn-imprimir" onclick="imprimirFactura()">
            <i class="fas fa-print"></i> Imprimir / Guardar PDF
          </button>
          <button class="btn-cerrar-factura" onclick="cerrarFactura()">
            <i class="fas fa-check"></i> Listo
          </button>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', facturaHTML);
}

function cerrarFactura() {
  const el = document.getElementById('modal-factura');
  if (el) el.remove();
}

function imprimirFactura() {
  const content = document.querySelector('.modal-factura-box').innerHTML;
  const win = window.open('', '_blank', 'width=700,height=600');
  win.document.write(`<!DOCTYPE html><html><head>
    <meta charset="UTF-8"><title>Factura Smart Paws</title>
    <style>
      body{font-family:'Segoe UI',sans-serif;padding:32px;color:#1a2e1a}
      .factura-header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1e7a4a;padding-bottom:16px;margin-bottom:20px}
      .factura-logo{font-size:1.5rem;font-weight:800;color:#1e7a4a}
      .factura-logo em{font-style:italic;color:#e07b39}
      .factura-titulo{font-size:.95rem;font-weight:700;letter-spacing:2px;color:#555}
      .factura-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:24px;font-size:.85rem}
      .factura-badge-ok{background:#e8f8f0;color:#1e7a4a;padding:2px 10px;border-radius:999px;font-weight:700}
      table{width:100%;border-collapse:collapse;margin-bottom:20px}
      th{background:#1e7a4a;color:#fff;padding:10px 12px;text-align:left;font-size:.82rem}
      td{padding:8px 12px;border-bottom:1px solid #eee;font-size:.83rem}
      .factura-total-row td{border-top:2px solid #1e7a4a;font-size:.95rem}
      .factura-nota{background:#fff4e0;border-left:4px solid #e07b39;padding:12px 16px;font-size:.8rem;color:#555;border-radius:4px}
    </style></head><body>${content}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

// ── Historial local ───────────────────────────────────────────
function guardarEnHistorialLocal(nroPedido, total) {
  // Snapshot del carrito actual para la factura
  localStorage.setItem('sp_ultima_compra', JSON.stringify(carrito));

  const historial = JSON.parse(localStorage.getItem('sp_historial') || '[]');
  historial.unshift({
    nro_pedido: nroPedido,
    fecha:      new Date().toISOString(),
    total,
    items: carrito.map(i => ({ nombre: i.nombre, cantidad: i.cantidad, precio: i.precio })),
    estado: 'pendiente_verificacion'
  });
  // Guardar solo los últimos 20
  localStorage.setItem('sp_historial', JSON.stringify(historial.slice(0, 20)));
}

// ── Drawer ─────────────────────────────────────────────────────
function abrirDrawer()  {
  document.getElementById('carrito-drawer').classList.add('open');
  document.getElementById('carrito-overlay').classList.add('open');
}
function cerrarDrawer() {
  document.getElementById('carrito-drawer').classList.remove('open');
  document.getElementById('carrito-overlay').classList.remove('open');
}

// ── Toast ──────────────────────────────────────────────────────
function mostrarToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Bind UI ────────────────────────────────────────────────────
function bindUI() {
  // Pills categorías
  document.getElementById('pills-categorias').addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    categoriaActiva = pill.dataset.cat;
    filtrarYRenderizar();
  });

  // Búsqueda
  document.getElementById('btn-buscar').addEventListener('click', filtrarYRenderizar);
  document.getElementById('input-busqueda').addEventListener('keypress', e => { if (e.key==='Enter') filtrarYRenderizar(); });
  document.getElementById('input-busqueda').addEventListener('input', () => {
    clearTimeout(window._debounce);
    window._debounce = setTimeout(filtrarYRenderizar, 300);
  });

  // Carrito
  document.getElementById('btn-abrir-carrito').addEventListener('click', abrirDrawer);
  document.getElementById('btn-cerrar-carrito').addEventListener('click', cerrarDrawer);
  document.getElementById('carrito-overlay').addEventListener('click', cerrarDrawer);
  document.getElementById('btn-pagar').addEventListener('click', abrirModalPago);

  // Modal QR — paso 1
  document.getElementById('btn-ya-pague').addEventListener('click', irAPasoCaptura);
  document.getElementById('btn-cancelar-modal').addEventListener('click', cerrarModalPago);
  document.getElementById('modal-pago').addEventListener('click', e => {
    if (e.target === e.currentTarget) cerrarModalPago();
  });

  // Modal QR — paso 2 (captura)
  document.getElementById('btn-volver-qr').addEventListener('click', () => mostrarPasoModal(1));
  document.getElementById('input-captura').addEventListener('change', onCapturaSeleccionada);
  document.getElementById('btn-enviar-compra').addEventListener('click', enviarCompraConCaptura);
}
