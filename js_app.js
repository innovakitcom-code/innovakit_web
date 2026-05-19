// ============================================
// APP PRINCIPAL - INICIALIZACIÓN
// ============================================

// Inicializar todo
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando Innovakit...');
    
    // Cargar datos
    await cargarUsuarioActual();
    await cargarProductos();
    await cargarKits();
    await cargarCarrito();
    
    // Renderizar
    renderizarProductos(productosGlobal);
    renderizarKits(kitsGlobal);
    
    // Configurar eventos
    configurarEventos();
    
    console.log('✅ Innovakit listo');
});

// Configurar eventos de UI
function configurarEventos() {
    // Menú móvil
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    if (menuBtn && mobileNav) {
        menuBtn.onclick = () => mobileNav.classList.toggle('hidden');
    }
    
    // Botón carrito
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.onclick = verCarrito;
    }
    
    // Botón usuario
    const userBtn = document.getElementById('user-btn');
    if (userBtn) {
        userBtn.onclick = () => {
            if (usuarioActual) {
                // Mostrar menú de usuario
                mostrarMenuUsuario();
            } else {
                mostrarModalLogin();
            }
        };
    }
    
    // Solicitar asesoría
    const asesoriaBtn = document.getElementById('solicitar-asesoria');
    if (asesoriaBtn) {
        asesoriaBtn.onclick = () => {
            window.open('https://wa.me/595972292392?text=¡Hola! Necesito asesoría para un proyecto técnico', '_blank');
        };
    }
    
    // Scroll suave para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Mostrar menú de usuario
function mostrarMenuUsuario() {
    const dropdown = document.getElementById('user-dropdown');
    if (!dropdown) return;
    
    dropdown.innerHTML = `
        <div class="py-2">
            <div class="px-4 py-2 border-b">
                <p class="font-semibold">${usuarioActual.nombre}</p>
                <p class="text-xs text-gray-500">${usuarioActual.email}</p>
            </div>
            ${usuarioActual.es_admin ? '<a href="admin.html" class="block px-4 py-2 hover:bg-gray-100">📊 Panel Admin</a>' : ''}
            <button onclick="cerrarSesion()" class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">
                Cerrar sesión
            </button>
        </div>
    `;
    
    dropdown.classList.toggle('hidden');
    
    // Cerrar al hacer clic fuera
    setTimeout(() => {
        document.addEventListener('click', function cerrar(e) {
            if (!dropdown.contains(e.target) && e.target !== document.getElementById('user-btn')) {
                dropdown.classList.add('hidden');
                document.removeEventListener('click', cerrar);
            }
        });
    }, 100);
}