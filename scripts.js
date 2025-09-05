let productosKits = [];

// Cargar productos desde JSON
fetch("productos.json")
  .then(res => res.json())
  .then(data => {
    productosKits = data;
    renderProductosPrincipales();
  });

// Renderizar los 3 kits principales
function renderProductosPrincipales() {
  const contenedor = document.getElementById("productos-principales");
  contenedor.innerHTML = `
    <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center w-full max-w-xs mx-auto mb-6">
      <img src="Kounshun.png" class="w-64 h-64 object-contain mb-4 rounded-lg">
      <h4 class="text-lg sm:text-xl font-bold mb-2 text-center">Kit de Electrónica Básico</h4>
      <p class="mb-4 text-center text-sm sm:text-base">Incluye componentes esenciales para aprender electrónica desde cero.</p>
      <button onclick="verProductosKit(1)" class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 mt-auto">Ver más</button>
    </div>
    <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center w-full max-w-xs mx-auto mb-6">
      <img src="LogoProduc.png" class="w-64 h-64 object-contain mb-4 rounded-lg">
      <h4 class="text-lg sm:text-xl font-bold mb-2 text-center">Kit de Arduino</h4>
      <p class="mb-4 text-center text-sm sm:text-base">Perfecto para programadores y creadores.</p>
      <button onclick="verProductosKit(2)" class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 mt-auto">Ver más</button>
    </div>
    <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center w-full max-w-xs mx-auto mb-6">
      <img src="Acebott.png" class="w-64 h-64 object-contain mb-4 rounded-lg">
      <h4 class="text-lg sm:text-xl font-bold mb-2 text-center">Kit Maker</h4>
      <p class="mb-4 text-center text-sm sm:text-base">Componentes avanzados para proyectos más complejos y creativos.</p>
      <button onclick="verProductosKit(3)" class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 mt-auto">Ver más</button>
    </div>
  `;
}

// Ver productos del kit
function verProductosKit(idx) {
  document.getElementById('main-content').style.display = 'none';
  document.getElementById('vista-productoskit').classList.remove('hidden');

  const productos = productosKits[idx-1];
  let html = `<h3 class="text-2xl sm:text-3xl font-bold text-center mb-8">Productos del kit</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">`;

  productos.forEach((p, i) => {
    const mensaje = encodeURIComponent(`¡Hola! Quiero comprar el producto: ${p.nombre} - ${p.desc} (Precio: ${p.precio})`);

    // Ver si es array de imágenes o una sola
    const imagenes = Array.isArray(p.img) ? 
      p.img.map(src => `<div class="swiper-slide"><img src="${src}" class="w-full h-full object-contain"></div>`).join('') :
      `<div class="swiper-slide"><img src="${p.img}" class="w-full h-full object-contain"></div>`;

    html += `
      <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center w-full max-w-xs mx-auto mb-6 text-center">
        <div class="swiper mySwiper-${idx}-${i} w-full h-48 rounded-lg overflow-hidden mb-4">
          <div class="swiper-wrapper">${imagenes}</div>
          <div class="swiper-button-next"></div>
          <div class="swiper-button-prev"></div>
        </div>
        <h4 class="text-lg sm:text-xl font-bold mb-2">${p.nombre}</h4>
        <p class="mb-2 text-sm sm:text-base">${p.desc}</p>
        <p class="mb-4 text-lg font-semibold text-green-600">${p.precio}</p>
        <a href="https://wa.me/595972292392?text=${mensaje}" target="_blank"
           class="w-full bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 mt-auto">
           Comprar por WhatsApp
        </a>
      </div>
    `;
  });

  html += `</div>`;
  document.getElementById('productoskit-content').innerHTML = html;

  // Inicializar Swipers
  productos.forEach((p, i) => {
    new Swiper(`.mySwiper-${idx}-${i}`, {
      loop: true,
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
    });
  });

  window.scrollTo({top:0, behavior:'smooth'});
}

// Volver al inicio
function volverAlInicio() {
  document.getElementById('main-content').style.display = '';
  document.getElementById('vista-productoskit').classList.add('hidden');
  window.scrollTo({top:0, behavior:'smooth'});
}
