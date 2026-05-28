/* tienda.js*/

// ── Datos locales de respaldo (mientras no hay BD real) ──────
const PRODUCTOS_LOCAL = [
  { id_producto:1, nombre:'Pro Plan Adulto 3kg',      descripcion:'Alimento balanceado premium para perros adultos', precio:185, stock:12, categoria:'Alimento',    imagen:'https://i.imgur.com/5e2a262.png' },
  { id_producto:2, nombre:'Royal Canin Gato 1.5kg',   descripcion:'Nutrición específica para gatos domésticos',      precio:135, stock:8,  categoria:'Alimento',    imagen:'https://i.imgur.com/4f2XKPt.png' },
  { id_producto:3, nombre:'Shampoo Neutro 500ml',      descripcion:'Shampoo suave sin parabenos para todo tipo de pelo',precio:35, stock:20, categoria:'Higiene',     imagen:'https://i.imgur.com/nlyxC5d.png' },
  { id_producto:4, nombre:'Cepillo Desmallador',       descripcion:'Reduce enredos y caída de pelo eficientemente',  precio:28, stock:15, categoria:'Higiene',     imagen:'' },
  { id_producto:5, nombre:'Cuerda Trenzada Resistente',descripcion:'Juguete dental de cuerda para perros medianos',   precio:22, stock:30, categoria:'Juguetes',    imagen:'https://m.media-amazon.com/images/I/81V3yf82dcL._AC_UF400,400_QL80_.jpg' },
  { id_producto:6, nombre:'Pelota Interactiva',        descripcion:'Pelota con sonido para gatos y perros pequeños',  precio:18, stock:25, categoria:'Juguetes',    imagen:'' },
  { id_producto:7, nombre:'Plato Acero Inoxidable',    descripcion:'Antideslizante, apto para lavavajillas',          precio:30, stock:10, categoria:'Accesorios',  imagen:'' },
  { id_producto:8, nombre:'Correa Retráctil 5m',       descripcion:'Con freno de bloqueo y mango ergonómico',         precio:65, stock:6,  categoria:'Accesorios',  imagen:'' },
  { id_producto:9, nombre:'Cama Acolchada Talla L',    descripcion:'Relleno de fibra suave, funda lavable',           precio:120, stock:4, categoria:'Camas',       imagen:'https://tottoco.vtexassets.com/arquivos/ids/514234/PDCBCA1009.jpg?v=1' },
  { id_producto:10,nombre:'Cama Cáscara de Nuez M',   descripcion:'Diseño nórdico, antideslizante, súper suave',     precio:95,  stock:0, categoria:'Camas',       imagen:'' },
];

// Imagen genérica si no hay foto
const IMG_DEFAULT = 'img/producto1.webp';

// ── Estado global ────────────────────────────────────────────
let todosLosProductos = [];
let productosFiltrados = [];
let carrito = [];      // [{...producto, cantidad}]
let deseos  = [];      // [id_producto]
let categoriaActiva = 'todos';

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  cargarDesdesLocalStorage();
  cargarProductos();
  bindUI();
});

// ── Cargar productos (API PHP → respaldo local) ──────────────
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

// ── Filtro + render ──────────────────────────────────────────
function filtrarYRenderizar() {
  const q = document.getElementById('input-busqueda').value.trim().toLowerCase();

  productosFiltrados = todosLosProductos.filter(p => {
    const matchCat = categoriaActiva === 'todos' || p.categoria === categoriaActiva;
    const matchQ   = !q || p.nombre.toLowerCase().includes(q) || (p.descripcion||'').toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  renderProductos(productosFiltrados);
  document.getElementById('count-label').textContent = `${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? 's' : ''}`;
}

function renderProductos(lista) {
  const grid = document.getElementById('contenedor-productos');
  grid.innerHTML = '';

  if (!lista.length) {
    grid.innerHTML = `
      <div class="estado-vacio">
        <i class="fas fa-search"></i>
        <p>No encontramos productos con ese filtro</p>
      </div>`;
    return;
  }

  lista.forEach(p => {
    const enDeseo = deseos.includes(p.id_producto);
    const stock   = p.stock ?? 99;
    const agotado = stock === 0;

    let stockBadge = '';
    if      (agotado)   stockBadge = `<span class="stock-badge stock-out">Agotado</span>`;
    else if (stock <= 5) stockBadge = `<span class="stock-badge stock-low">Últimos ${stock}</span>`;
    else                 stockBadge = `<span class="stock-badge stock-ok">En stock</span>`;

    const img = p.imagen || IMG_DEFAULT;

    const card = document.createElement('div');
    card.className = 'prod-card';
    card.innerHTML = `
      <div class="prod-img-wrap">
        <img src="${img}" alt="${p.nombre}" onerror="this.src='${IMG_DEFAULT}'">
        ${stockBadge}
        <button class="btn-deseo ${enDeseo ? 'activo' : ''}"
                data-id="${p.id_producto}"
                title="${enDeseo ? 'Quitar de deseos' : 'Añadir a deseos'}">
          <i class="${enDeseo ? 'fas' : 'far'} fa-heart"></i>
        </button>
      </div>
      <div class="prod-info">
        <div class="prod-categoria">${p.categoria || 'General'}</div>
        <div class="prod-nombre">${p.nombre}</div>
        <div class="prod-desc">${p.descripcion || ''}</div>
        <div class="prod-precio">Bs. ${Number(p.precio).toFixed(2)} <span>/ unidad</span></div>
        <button class="btn-carrito" data-id="${p.id_producto}" ${agotado ? 'disabled' : ''}>
          ${agotado
            ? '<i class="fas fa-ban"></i> Agotado'
            : '<i class="fas fa-cart-plus"></i> Añadir al carrito'}
        </button>
      </div>`;

    // Eventos de la card
    card.querySelector('.btn-deseo').addEventListener('click', () => toggleDeseo(p.id_producto));
    if (!agotado) card.querySelector('.btn-carrito').addEventListener('click', () => agregarAlCarrito(p));

    grid.appendChild(card);
  });

  renderDeseos();
}

// ── Carrito ──────────────────────────────────────────────────
function agregarAlCarrito(producto) {
  const existe = carrito.find(i => i.id_producto === producto.id_producto);
  if (existe) {
    const maxStock = producto.stock ?? 99;
    if (existe.cantidad < maxStock) {
      existe.cantidad++;
    } else {
      mostrarToast(`Solo hay ${maxStock} unidades disponibles`);
      return;
    }
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

  // Badge FAB
  const badge = document.getElementById('carrito-badge');
  badge.textContent = cuenta;

  // Mostrar/ocultar FAB
  const fab = document.getElementById('btn-abrir-carrito');
  fab.style.display = cuenta > 0 ? 'flex' : 'none';

  // Total footer
  document.getElementById('drawer-total').textContent = `Bs. ${total.toFixed(2)}`;
  document.getElementById('btn-pagar').disabled = cuenta === 0;

  // Items del drawer
  const itemsEl = document.getElementById('drawer-items');
  const vacioEl = document.getElementById('drawer-vacio');

  if (!carrito.length) {
    vacioEl.style.display = 'block';
    // Limpiar items anteriores (excepto el vacío)
    Array.from(itemsEl.children).forEach(c => {
      if (c !== vacioEl) c.remove();
    });
    return;
  }

  vacioEl.style.display = 'none';
  // Re-render items
  Array.from(itemsEl.querySelectorAll('.carrito-item')).forEach(e => e.remove());

  carrito.forEach(item => {
    const img = item.imagen || IMG_DEFAULT;
    const el = document.createElement('div');
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
      <button class="ci-eliminar" data-id="${item.id_producto}" title="Eliminar">
        <i class="fas fa-trash"></i>
      </button>`;

    el.querySelector('.ci-menos').addEventListener('click', () => cambiarCantidad(item.id_producto, -1));
    el.querySelector('.ci-mas').addEventListener('click',  () => cambiarCantidad(item.id_producto, +1));
    el.querySelector('.ci-eliminar').addEventListener('click', () => eliminarDelCarrito(item.id_producto));
    itemsEl.appendChild(el);
  });
}

// ── Lista de deseos ──────────────────────────────────────────
function toggleDeseo(id) {
  if (deseos.includes(id)) {
    deseos = deseos.filter(d => d !== id);
    mostrarToast('Quitado de tu lista de deseos');
  } else {
    deseos.push(id);
    mostrarToast('❤️ Añadido a tu lista de deseos');
  }
  guardarDeseosLocalStorage();
  filtrarYRenderizar(); // Actualiza íconos corazón
}

function renderDeseos() {
  const section = document.getElementById('deseos-section');
  const grid    = document.getElementById('deseos-grid');

  if (!deseos.length) {
    section.style.display = 'none';
    return;
  }

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
      <div>
        <div class="d-nombre">${p.nombre}</div>
        <div class="d-precio">Bs. ${Number(p.precio).toFixed(2)}</div>
      </div>
      <button class="d-quitar" data-id="${id}" title="Quitar"><i class="fas fa-times"></i></button>`;
    card.querySelector('.d-quitar').addEventListener('click', () => toggleDeseo(id));
    grid.appendChild(card);
  });
}

function guardarDeseosLocalStorage() {
  localStorage.setItem('sp_deseos', JSON.stringify(deseos));
}

function cargarDesdesLocalStorage() {
  const d = localStorage.getItem('sp_deseos');
  deseos = d ? JSON.parse(d) : [];
}

// ── Modal QR ─────────────────────────────────────────────────
function abrirModalPago() {
  const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  document.getElementById('modal-total-monto').textContent = `Bs. ${total.toFixed(2)}`;

  // QR generado con servicio público (qrserver.com)
  const datos = encodeURIComponent(`SMART PAWS|CUENTA:1234567890|MONTO:${total.toFixed(2)} BOB`);
  document.getElementById('qr-img').src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${datos}`;
  document.getElementById('qr-cuenta').textContent = 'Cuenta: 1-234567-890 · Smart Paws S.R.L.';

  document.getElementById('modal-pago').classList.add('open');
  cerrarDrawer();
}

function cerrarModalPago() {
  document.getElementById('modal-pago').classList.remove('open');
}

async function confirmarPago() {
  // Enviar compra al servidor
  try {
    const payload = {
      items: carrito.map(i => ({
        id_producto: i.id_producto,
        cantidad:    i.cantidad,
        costo:       (i.precio * i.cantidad).toFixed(2)
      }))
    };
    await fetch('php/guardar_compra.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch { /* Si no hay servidor, no bloqueamos al usuario */ }

  cerrarModalPago();
  carrito = [];
  actualizarCarritoUI();
  mostrarToast('🎉 ¡Pedido registrado! Te contactaremos pronto');
}

// ── Drawer ───────────────────────────────────────────────────
function abrirDrawer() {
  document.getElementById('carrito-drawer').classList.add('open');
  document.getElementById('carrito-overlay').classList.add('open');
}

function cerrarDrawer() {
  document.getElementById('carrito-drawer').classList.remove('open');
  document.getElementById('carrito-overlay').classList.remove('open');
}

// ── Toast ────────────────────────────────────────────────────
function mostrarToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Bind de UI ───────────────────────────────────────────────
function bindUI() {
  // Menú hamburguesa
  const toggle = document.getElementById('mobile-menu');
  if (toggle) toggle.addEventListener('click', () => {
    document.getElementById('nav-menu').classList.toggle('active');
  });

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
  document.getElementById('input-busqueda').addEventListener('keypress', e => {
    if (e.key === 'Enter') filtrarYRenderizar();
  });
  document.getElementById('input-busqueda').addEventListener('input', () => {
    // Búsqueda en tiempo real con debounce
    clearTimeout(window._debounce);
    window._debounce = setTimeout(filtrarYRenderizar, 300);
  });

  // Carrito
  document.getElementById('btn-abrir-carrito').addEventListener('click', abrirDrawer);
  document.getElementById('btn-cerrar-carrito').addEventListener('click', cerrarDrawer);
  document.getElementById('carrito-overlay').addEventListener('click', cerrarDrawer);
  document.getElementById('btn-pagar').addEventListener('click', abrirModalPago);

  // Modal pago
  document.getElementById('btn-cancelar-modal').addEventListener('click', cerrarModalPago);
  document.getElementById('btn-confirmar-pago').addEventListener('click', confirmarPago);
  document.getElementById('modal-pago').addEventListener('click', e => {
    if (e.target === e.currentTarget) cerrarModalPago();
  });
}
