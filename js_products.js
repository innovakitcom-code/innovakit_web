// ============================================
// GESTIÓN DE PRODUCTOS Y KITS
// ============================================

// Cargar productos desde Supabase
async function cargarProductos() {
    try {
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .eq('activo', true)
            .order('id');
        
        if (error) throw error;
        
        productosGlobal = data;
        return data;
    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarNotificacion('Error cargando productos', 'error');
        return [];
    }
}

// Cargar kits desde Supabase
async function cargarKits() {
    try {
        const { data, error } = await supabase
            .from('kits')
            .select('*')
            .eq('activo', true);
        
        if (error) throw error;
        
        kitsGlobal = data;
        return data;
    } catch (error) {
        console.error('Error cargando kits:', error);
        return [];
    }
}

// Renderizar productos en el grid
function renderizarProductos(productos) {
    const grid = document.getElementById('productos-grid');
    if (!grid) return;
    
    if (!productos || productos.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-microchip text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">No hay productos disponibles</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = productos.map(producto => `
        <div class="product-card" onclick="verProducto(${producto.id})">
            <img src="${producto.imagen_principal || 'img/placeholder.png'}" 
                 alt="${producto.nombre}"
                 loading="lazy">
            <div class="p-4">
                <h3 class="font-bold text-lg mb-1 line-clamp-2">${producto.nombre}</h3>
                <p class="text-gray-600 text-sm mb-2 line-clamp-2">${producto.descripcion || ''}</p>
                <div class="flex justify-between items-center mt-3">
                    <span class="text-green-600 font-bold text-xl">${producto.precio.toLocaleString()} Gs.</span>
                    <button onclick="event.stopPropagation(); agregarAlCarrito(${producto.id}, '${producto.nombre.replace(/'/g, "\\'")}', ${producto.precio}, '${producto.imagen_principal}')" 
                            class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Renderizar kits
function renderizarKits(kits) {
    const grid = document.getElementById('kits-grid');
    if (!grid) return;
    
    if (!kits || kits.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center">No hay kits disponibles</div>';
        return;
    }
    
    grid.innerHTML = kits.map(kit => `
        <div class="kit-card cursor-pointer" onclick="verKit(${kit.id})">
            <img src="${kit.imagen_portada || 'img/kit-placeholder.jpg'}" 
                 alt="${kit.nombre}"
                 loading="lazy">
            <div class="p-6">
                <h3 class="font-bold text-xl mb-2">${kit.nombre}</h3>
                <p class="text-gray-600 mb-4">${kit.descripcion || 'Kit completo para aprender electrónica'}</p>
                <button class="btn-primary w-full text-center" onclick="event.stopPropagation(); verKit(${kit.id})">
                    Ver detalles
                </button>
            </div>
        </div>
    `).join('');
}

// Ver detalle de producto
function verProducto(id) {
    const producto = productosGlobal.find(p => p.id === id);
    if (!producto) return;
    
    // Mostrar modal con detalles del producto
    mostrarModalProducto(producto);
}

// Ver detalle de kit
function verKit(id) {
    const kit = kitsGlobal.find(k => k.id === id);
    if (!kit) return;
    
    // Mostrar modal con detalles del kit
    mostrarModalKit(kit);
}