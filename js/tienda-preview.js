/* =========================================================
   MINI TIENDA HOME
========================================================= */

const productosPreview = [

  {
    nombre:'Pro Plan Adulto 3kg',
    descripcion:'Alimento premium para perros adultos',
    precio:185,
    categoria:'Alimento',
    imagen:'https://i.imgur.com/5e2a262.png',
    stock:12
  },

  {
    nombre:'Royal Canin Gato 1.5kg',
    descripcion:'Nutrición balanceada para gatos',
    precio:135,
    categoria:'Alimento',
    imagen:'https://i.imgur.com/4f2XKPt.png',
    stock:8
  },

  {
    nombre:'Shampoo Neutro',
    descripcion:'Shampoo suave sin parabenos',
    precio:35,
    categoria:'Higiene',
    imagen:'https://i.imgur.com/nlyxC5d.png',
    stock:20
  },

  {
    nombre:'Correa Retráctil 5m',
    descripcion:'Correa ergonómica con bloqueo',
    precio:65,
    categoria:'Accesorios',
    imagen:'https://m.media-amazon.com/images/I/61xzuoD2wFL.jpg',
    stock:4
  }

];

document.addEventListener('DOMContentLoaded', () => {

  renderProductos(productosPreview);

  const btnBuscar = document.getElementById('btn-buscar');
  const inputBusqueda = document.getElementById('input-busqueda');

  if(btnBuscar){
    btnBuscar.addEventListener('click', buscarProductos);
  }

  if(inputBusqueda){
    inputBusqueda.addEventListener('keyup', buscarProductos);
  }

});

function buscarProductos(){

  const input = document.getElementById('input-busqueda');

  if(!input) return;

  const texto = input.value.toLowerCase();

  const filtrados = productosPreview.filter(p =>

    p.nombre.toLowerCase().includes(texto) ||
    p.descripcion.toLowerCase().includes(texto) ||
    p.categoria.toLowerCase().includes(texto)

  );

  renderProductos(filtrados);
}

function renderProductos(lista){

  const contenedor = document.getElementById('contenedor-productos');

  if(!contenedor) return;

  contenedor.innerHTML = '';

  if(lista.length === 0){

    contenedor.innerHTML = `
      <p style="color:#777;">
        No encontramos productos.
      </p>
    `;

    return;
  }

  lista.forEach(p => {

    let badge = '';

    if(p.stock <= 5){

      badge = `
        <span class="stock-badge stock-low">
          Últimos
        </span>
      `;

    }else{

      badge = `
        <span class="stock-badge stock-ok">
          Disponible
        </span>
      `;
    }

    contenedor.innerHTML += `

      <div class="prod-card">

        <div class="prod-img-wrap">

          <img src="${p.imagen}" alt="${p.nombre}">

          ${badge}

        </div>

        <div class="prod-info">

          <div class="prod-categoria">
            ${p.categoria}
          </div>

          <div class="prod-nombre">
            ${p.nombre}
          </div>

          <div class="prod-desc">
            ${p.descripcion}
          </div>

          <div class="prod-precio">
            Bs. ${p.precio}
            <span>/ unidad</span>
          </div>

          <button class="btn-carrito">

            <i class="fas fa-lock"></i>

            Inicia sesión para comprar

          </button>

        </div>

      </div>

    `;
  });

}