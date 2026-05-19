// ============================================
// CONFIGURACIÓN DE SUPABASE
// ⚠️ REEMPLAZA CON TUS DATOS ⚠️
// ============================================

const SUPABASE_URL = 'https://lvdjczfblanbadikccxo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_O9oR1xmyeAy1ludJJlo3Rw_2gW9XZ_F';

// Inicializar Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variables globales
let usuarioActual = null;
let productosGlobal = [];
let kitsGlobal = [];
let carritoGlobal = [];

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.textContent = mensaje;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}