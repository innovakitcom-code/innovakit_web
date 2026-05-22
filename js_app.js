// ============================================
// ja_app.js - Inicialización y eventos globales
// ============================================

// Productos y kits globales
let productosGlobal = [];
let kitsGlobal = [];

// Configurar todos los eventos de UI
function configurarEventosGlobales() {
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
    
    // Botón flotante de admin
    const adminFloatBtn = document.getElementById('admin-float-btn');
    if (adminFloatBtn) {
        adminFloatBtn.addEventListener('click', () => {
            window.location.href = '/admin.html';
        });
    }
    
    // Cerrar modales con overlay click
    document.querySelectorAll('.modal-overlay, [onclick*="cerrar"]').forEach(el => {
        // Los event listeners se manejan en cada modal
    });
}

// Cargar productos desde Supabase
async function cargarProductosGlobal() {
    try {
        const { data, error } = await supabaseClient
            .from('productos')
            .select('*')
            .eq('activo', true)
            .order('id', { ascending: false });
        
        if (error) throw error;
        productosGlobal = data || [];
        console.log(`✅ Cargados ${productosGlobal.length} productos`);
        return productosGlobal;
    } catch (error) {
        console.error('Error cargando productos:', error);
        return [];
    }
}

// Cargar kits desde Supabase
async function cargarKitsGlobal() {
    try {
        const { data, error } = await supabaseClient
            .from('kits')
            .select('*')
            .eq('activo', true);
        
        if (error) throw error;
        kitsGlobal = data || [];
        console.log(`✅ Cargados ${kitsGlobal.length} kits`);
        return kitsGlobal;
    } catch (error) {
        console.error('Error cargando kits:', error);
        return [];
    }
}

// Funciones de navegación
function volverAlInicio() {
    document.getElementById('main-content').style.display = '';
    document.getElementById('vista-productoskit')?.classList.add('hidden');
    document.getElementById('vista-asesorias')?.classList.add('hidden');
    document.getElementById('vista-componentes-sueltos')?.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function verAsesorias() {
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('vista-productoskit')?.classList.add('hidden');
    document.getElementById('vista-componentes-sueltos')?.classList.add('hidden');
    document.getElementById('vista-asesorias')?.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function verComponentesSueltos() {
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('vista-productoskit')?.classList.add('hidden');
    document.getElementById('vista-asesorias')?.classList.add('hidden');
    document.getElementById('vista-componentes-sueltos')?.classList.remove('hidden');
    if (typeof renderizarComponentesSueltos === 'function') {
        renderizarComponentesSueltos();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mostrar botón flotante de admin si es admin
async function mostrarBotonAdminSiCorresponde() {
    if (usuarioActual?.es_admin) {
        const btn = document.getElementById('admin-float-btn');
        if (btn) btn.style.display = 'block';
    }
}

// Inicialización principal
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando Innovakit...');
    
    mostrarLoading(true);
    
    // Configurar eventos
    configurarEventosGlobales();
    
    // Cargar datos
    await cargarProductosGlobal();
    await cargarKitsGlobal();
    
    // Cargar carrito
    if (typeof cargarCarrito === 'function') {
        await cargarCarrito();
    }
    
    // Mostrar botón admin si corresponde
    await mostrarBotonAdminSiCorresponde();
    
    // Registrar cierre con ESC
    if (typeof registrarCierreConEsc === 'function') {
        registrarCierreConEsc();
    }
    
    mostrarLoading(false);
    console.log('✅ Innovakit listo');
});

// Exponer funciones globalmente
window.volverAlInicio = volverAlInicio;
window.verAsesorias = verAsesorias;
window.verComponentesSueltos = verComponentesSueltos;
window.productosGlobal = () => productosGlobal;
window.kitsGlobal = () => kitsGlobal;
