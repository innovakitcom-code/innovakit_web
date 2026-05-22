// ============================================
// js_cart.js - Sistema de carrito completo
// ============================================

// Cargar carrito del usuario
async function cargarCarrito() {
    if (!usuarioActual) {
        // Invitado: cargar desde localStorage
        const local = localStorage.getItem('cart_invitado');
        carritoGlobal = local ? JSON.parse(local) : [];
        actualizarUICarrito();
        return;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('carrito')
            .select('*, productos(nombre, precio, imagen_principal)')
            .eq('usuario_id', usuarioActual.id);
        
        if (error) throw error;
        
        carritoGlobal = (data || []).map(item => ({
            id: item.id,
            producto_id: item.producto_id,
            nombre: item.productos?.nombre || 'Producto',
            precio: item.productos?.precio || 0,
            cantidad: item.cantidad || 1,
            imagen: item.productos?.imagen_principal || 'img/placeholder.png'
        }));
        
        actualizarUICarrito();
    } catch (error) {
        console.error('Error cargando carrito:', error);
    }
}

// Agregar al carrito
async function agregarAlCarrito(productoId, nombre, precio, imagen) {
    if (!usuarioActual) {
        // Modo invitado
        carritoGlobal.push({ 
            producto_id: productoId, 
            nombre: nombre, 
            precio: precio, 
            cantidad: 1, 
            imagen: imagen || 'img/placeholder.png' 
        });
        localStorage.setItem('cart_invitado', JSON.stringify(carritoGlobal));
        mostrarNotificacion(`📦 ${nombre} agregado`, 'success');
        actualizarUICarrito();
        return;
    }
    
    try {
        // Verificar si ya existe en el carrito
        const existe = carritoGlobal.find(item => item.producto_id === productoId);
        
        if (existe) {
            const { error } = await supabaseClient
                .from('carrito')
                .update({ cantidad: (existe.cantidad || 1) + 1 })
                .eq('id', existe.id);
            if (error) throw error;
        } else {
            const { error } = await supabaseClient
                .from('carrito')
                .insert([{ usuario_id: usuarioActual.id, producto_id: productoId, cantidad: 1 }]);
            if (error) throw error;
        }
        
        mostrarNotificacion(`📦 ${nombre} agregado`, 'success');
        await cargarCarrito();
    } catch (error) {
        console.error('Error agregando al carrito:', error);
        mostrarNotificacion('Error al agregar', 'error');
    }
}

// Eliminar del carrito
async function eliminarDelCarrito(itemId) {
    if (!usuarioActual) {
        carritoGlobal = carritoGlobal.filter((_, i) => i !== itemId);
        localStorage.setItem('cart_invitado', JSON.stringify(carritoGlobal));
    } else {
        await supabaseClient.from('carrito').delete().eq('id', itemId);
        await cargarCarrito();
    }
    actualizarUICarrito();
    mostrarNotificacion('Producto eliminado', 'info');
}

// Vaciar carrito
async function vaciarCarrito() {
    if (confirm('¿Vaciar todo el carrito?')) {
        if (!usuarioActual) {
            carritoGlobal = [];
            localStorage.setItem('cart_invitado', '[]');
        } else {
            await supabaseClient.from('carrito').delete().eq('usuario_id', usuarioActual.id);
            await cargarCarrito();
        }
        actualizarUICarrito();
        mostrarNotificacion('Carrito vaciado', 'info');
    }
}

// Actualizar UI del carrito (contadores + modal)
function actualizarUICarrito() {
    const count = carritoGlobal.reduce((sum, item) => sum + (item.cantidad || 1), 0);
    const total = carritoGlobal.reduce((sum, item) => sum + (parseInt(item.precio) * (item.cantidad || 1)), 0);
    
    // Actualizar contadores en header
    const desktopCount = document.getElementById('carrito-count-desktop');
    const mobileCount = document.getElementById('carrito-count-mobile');
    if (desktopCount) desktopCount.textContent = count;
    if (mobileCount) mobileCount.textContent = count;
    
    // Actualizar modal del carrito si está abierto
    const container = document.getElementById('carrito-lista');
    const totalSpan = document.getElementById('carrito-total');
    
    if (container) {
        if (carritoGlobal.length === 0) {
            container.innerHTML = `<p class="text-gray-500 py-6 text-center">Tu carrito está vacío.</p>`;
        } else {
            container.innerHTML = carritoGlobal.map((item, idx) => `
                <div class="flex items-center justify-between py-3 border-b">
                    <div class="flex-1">
                        <p class="font-medium">${item.nombre}</p>
                        <p class="text-sm text-green-700">${parseInt(item.precio).toLocaleString()} Gs.</p>
                    </div>
                    <button onclick="eliminarDelCarrito(${usuarioActual ? item.id : idx})" class="text-red-500 px-2 py-1 rounded hover:bg-red-50">
                        ✕
                    </button>
                </div>
            `).join('');
        }
    }
    
    if (totalSpan) {
        totalSpan.textContent = `Gs. ${total.toLocaleString()}`;
    }
}

// Mostrar/cerrar modal del carrito
function verCarrito() {
    actualizarUICarrito();
    const modal = document.getElementById('modal-carrito');
    if (modal) {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        document.body.classList.add('modal-active');
        if (window.innerWidth <= 768) document.body.style.overflow = 'hidden';
    }
}

function cerrarCarrito() {
    const modal = document.getElementById('modal-carrito');
    if (modal) {
        modal.classList.add('opacity-0', 'pointer-events-none');
        document.body.classList.remove('modal-active');
        if (window.innerWidth <= 768) document.body.style.overflow = '';
    }
}

// Enviar pedido por WhatsApp y guardar en Supabase
async function enviarCarritoWhatsApp() {
    if (carritoGlobal.length === 0) {
        mostrarNotificacion('Tu carrito está vacío', 'error');
        return;
    }
    
    const total = carritoGlobal.reduce((sum, item) => sum + (parseInt(item.precio) * (item.cantidad || 1)), 0);
    
    // Construir mensaje
    let mensaje = "¡Hola! Quiero comprar estos productos:\n\n";
    carritoGlobal.forEach((item, i) => {
        mensaje += `${i + 1}. ${item.nombre} - ${parseInt(item.precio).toLocaleString()} Gs.\n`;
    });
    mensaje += `\n💰 TOTAL: ${total.toLocaleString()} Gs.`;
    
    if (usuarioActual) {
        mensaje += `\n👤 Cliente: ${usuarioActual.nombre || usuarioActual.email}`;
        
        // Guardar pedido en Supabase
        try {
            await supabaseClient.from('pedidos').insert([{
                usuario_id: usuarioActual.id,
                productos: carritoGlobal.map(p => ({
                    id: p.producto_id,
                    nombre: p.nombre,
                    precio: p.precio,
                    cantidad: p.cantidad || 1
                })),
                total: total,
                estado: 'pendiente'
            }]);
        } catch (error) {
            console.error('Error guardando pedido:', error);
        }
    }
    
    // Abrir WhatsApp
    window.open(`https://wa.me/595972292392?text=${encodeURIComponent(mensaje)}`, '_blank');
    
    // Vaciar carrito después de enviar
    await vaciarCarrito();
    cerrarCarrito();
    mostrarNotificacion('Pedido enviado. Te contactaremos pronto.', 'success');
}

// Sincronizar carrito local al hacer login
async function sincronizarCarritoConSupabase() {
    if (!usuarioActual) return;
    
    const local = localStorage.getItem('cart_invitado');
    if (local) {
        const items = JSON.parse(local);
        for (const item of items) {
            await supabaseClient.from('carrito').insert([{
                usuario_id: usuarioActual.id,
                producto_id: item.producto_id,
                cantidad: item.cantidad || 1
            }]);
        }
        localStorage.removeItem('cart_invitado');
        await cargarCarrito();
    }
}

// Crear modal del carrito si no existe
function crearModalCarrito() {
    if (!document.getElementById('modal-carrito')) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="modal-carrito" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50 opacity-0 pointer-events-none transition-opacity duration-300"
                 onclick="if(event.target === this) cerrarCarrito()">
                <div class="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center border-b pb-4 mb-4">
                            <h2 class="text-2xl font-bold flex items-center gap-2">
                                <i class="fas fa-shopping-cart text-blue-600"></i> Tu carrito
                            </h2>
                            <button onclick="cerrarCarrito()" class="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <div id="carrito-lista" class="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                            <p class="text-gray-500 py-6 text-center">Tu carrito está vacío.</p>
                        </div>
                        <div class="border-t pt-4 mt-4">
                            <div class="flex justify-between items-center mb-4">
                                <span class="text-lg font-semibold">Total:</span>
                                <span id="carrito-total" class="text-2xl font-bold text-green-600">Gs. 0</span>
                            </div>
                            <div class="flex flex-col sm:flex-row gap-3">
                                <button onclick="vaciarCarrito()" class="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition">
                                    <i class="fas fa-trash mr-2"></i> Vaciar
                                </button>
                                <button onclick="enviarCarritoWhatsApp()" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition">
                                    <i class="fab fa-whatsapp mr-2"></i> Comprar por WhatsApp
                                </button>
                                <button onclick="cerrarCarrito()" class="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg font-semibold transition">
                                    Seguir comprando
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }
}

// Exponer funciones globalmente
window.agregarAlCarrito = agregarAlCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;
window.vaciarCarrito = vaciarCarrito;
window.verCarrito = verCarrito;
window.cerrarCarrito = cerrarCarrito;
window.enviarCarritoWhatsApp = enviarCarritoWhatsApp;
window.sincronizarCarritoConSupabase = sincronizarCarritoConSupabase;

// Inicializar modal cuando carga la página
document.addEventListener('DOMContentLoaded', () => {
    crearModalCarrito();
});
