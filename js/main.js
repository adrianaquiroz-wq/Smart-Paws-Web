//main.js
document.addEventListener('DOMContentLoaded', () => {

  const menuToggle = document.getElementById('mobile-menu');
  const navMenu = document.querySelector('.nav-menu');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
  }

  const contenedor = document.getElementById('contenedor-productos');
  if (!contenedor) return;

  const IMG_DEFAULT = 'img/producto1.webp';

  const PRODUCTOS_LOCAL = [
    { nombre:'Pro Plan Adulto 3kg',       precio:185, imagen:'https://i.imgur.com/5e2a262.png' },
    { nombre:'Royal Canin Gato 1.5kg',    precio:135, imagen:'https://i.imgur.com/4f2XKPt.png' },
    { nombre:'Shampoo Neutro 500ml',      precio:35,  imagen:'https://i.imgur.com/nlyxC5d.png' },
    { nombre:'Cepillo Desmallador',       precio:28,  imagen:'' },
    { nombre:'Cuerda Trenzada Resistente',precio:22,  imagen:'' },
    { nombre:'Pelota Interactiva',        precio:18,  imagen:'' },
    { nombre:'Plato Acero Inoxidable',    precio:30,  imagen:'' },
    { nombre:'Correa Retráctil 5m',       precio:65,  imagen:'' },
    { nombre:'Cama Acolchada Talla L',    precio:120, imagen:'' },
    { nombre:'Cama Cáscara de Nuez M',   precio:95,  imagen:'' },
  ];

  let todosLosProductos = [];

  async function cargarProductos() {
    try {
      const res = await fetch('php/get_productos.php');
      if (!res.ok) throw new Error();
      const data = await res.json();
      return data.length ? data : PRODUCTOS_LOCAL;
    } catch {
      return PRODUCTOS_LOCAL;
    }
  }

  function renderProductos(lista) {
    contenedor.innerHTML = '';
    lista.forEach(p => {
      const img = p.imagen || IMG_DEFAULT;
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${img}" alt="${p.nombre}" onerror="this.src='${IMG_DEFAULT}'">
        <div class="card-info">
          <h3>${p.nombre}</h3>
          <p class="price">Bs. ${Number(p.precio).toFixed(2)}</p>
          <a href="login.html" style="
            display:block; margin-top:10px; text-align:center;
            background:var(--verde-vivo); color:#fff; padding:8px;
            border-radius:999px; font-size:.8rem; text-decoration:none;
            font-weight:700;">
            <i class="fas fa-sign-in-alt"></i> Inicia sesión para comprar
          </a>
        </div>`;
      contenedor.appendChild(card);
    });
  }

  function filtrar() {
    const q = document.getElementById('input-busqueda')?.value.trim().toLowerCase() || '';
    renderProductos(q ? todosLosProductos.filter(p => p.nombre.toLowerCase().includes(q)) : todosLosProductos);
  }

  cargarProductos().then(data => {
    todosLosProductos = data;
    renderProductos(data);
  });

  document.getElementById('btn-buscar')?.addEventListener('click', filtrar);
  document.getElementById('input-busqueda')?.addEventListener('keypress', e => { if (e.key === 'Enter') filtrar(); });
  document.getElementById('input-busqueda')?.addEventListener('input', () => {
    clearTimeout(window._db);
    window._db = setTimeout(filtrar, 300);
  });

});
