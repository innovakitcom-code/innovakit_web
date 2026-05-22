// ============================================
// js_supabase-auth.js - Autenticación unificada
// ============================================

let usuarioActual = null;

// Registrar nuevo usuario
async function registrarUsuarioSupabase(email, password, nombre, telefono) {
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: { data: { nombre: nombre, telefono: telefono } }
        });
        
        if (error) throw error;
        
        if (data.user) {
            await supabaseClient.from('perfiles').insert([{
                id: data.user.id,
                nombre: nombre || email.split('@')[0],
                telefono: telefono || null,
                es_admin: false
            }]);
        }
        
        mostrarNotificacion('✅ Registro exitoso. Ya puedes iniciar sesión.', 'success');
        return true;
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
        return false;
    }
}

// Iniciar sesión
async function iniciarSesionSupabase(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ 
            email: email, 
            password: password 
        });
        if (error) throw error;
        
        await cargarUsuarioActualSupabase();
        actualizarUIUsuario();
        
        // Sincronizar carrito después del login
        if (typeof sincronizarCarritoConSupabase === 'function') {
            await sincronizarCarritoConSupabase();
        }
        
        mostrarNotificacion('✅ ¡Bienvenido, ' + (usuarioActual?.nombre || email) + '!', 'success');
        return true;
    } catch (error) {
        mostrarNotificacion('Email o contraseña incorrectos', 'error');
        return false;
    }
}

// Cerrar sesión
async function cerrarSesionSupabase() {
    await supabaseClient.auth.signOut();
    usuarioActual = null;
    actualizarUIUsuario();
    
    if (typeof cargarCarrito === 'function') {
        await cargarCarrito();
    }
    
    mostrarNotificacion('Sesión cerrada', 'info');
}

// Cargar usuario actual
async function cargarUsuarioActualSupabase() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
        usuarioActual = null;
        actualizarUIUsuario();
        return null;
    }
    
    const { data: perfil } = await supabaseClient
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    usuarioActual = {
        id: user.id,
        email: user.email,
        nombre: perfil?.nombre || user.email.split('@')[0],
        telefono: perfil?.telefono,
        es_admin: perfil?.es_admin || false
    };
    
    actualizarUIUsuario();
    return usuarioActual;
}

// Actualizar UI según usuario
function actualizarUIUsuario() {
    var userDesktop = document.getElementById('user-desktop');
    var mobileContainer = document.querySelector('.sm\\:hidden .flex.justify-between');
    
    if (userDesktop) {
        if (usuarioActual) {
            userDesktop.innerHTML = '\n                <div class="flex items-center gap-2 ml-4">\n                    <span class="text-sm font-semibold text-gray-700">👋 ' + usuarioActual.nombre + '</span>\n                    <button onclick="cerrarSesionSupabase()" class="text-red-600 text-sm hover:text-red-700 font-semibold">Cerrar</button>\n                </div>\n            ';
        } else {
            userDesktop.innerHTML = '\n                <button onclick="mostrarModalLogin()" class="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold btn-hover">\n                    <i class="fas fa-user"></i> Ingresar\n                </button>\n            ';
        }
    }
    
    if (mobileContainer) {
        var existingBtn = mobileContainer.querySelector('.auth-mobile-btn');
        if (usuarioActual) {
            if (existingBtn && existingBtn.textContent.includes('Salir')) {
                existingBtn.outerHTML = '<button onclick="cerrarSesionSupabase()" class="auth-mobile-btn bg-red-600 text-white px-2 py-1 rounded-lg text-sm font-semibold ml-2">Salir</button>';
            }
        } else {
            if (existingBtn && existingBtn.textContent.includes('Salir')) {
                existingBtn.outerHTML = '<button onclick="mostrarModalLogin()" class="auth-mobile-btn bg-blue-600 text-white px-2 py-1 rounded-lg text-sm font-semibold ml-2"><i class="fas fa-user"></i></button>';
            }
        }
    }
}

// Modales de login/registro
function mostrarModalLogin() {
    var modal = document.getElementById('modal-login');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
}

function cerrarModalLogin(event) {
    if (event && event.target !== event.currentTarget) return;
    var modal = document.getElementById('modal-login');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        var emailInput = document.getElementById('login-email');
        var passInput = document.getElementById('login-password');
        if (emailInput) emailInput.value = '';
        if (passInput) passInput.value = '';
    }
}

function mostrarModalRegistro() {
    var modal = document.getElementById('modal-registro');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
}

function cerrarModalRegistro(event) {
    if (event && event.target !== event.currentTarget) return;
    var modal = document.getElementById('modal-registro');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        var form = document.getElementById('form-registro');
        if (form) form.reset();
    }
}

// Crear modales auth si no existen
function crearModalesAuth() {
    if (!document.getElementById('modal-login')) {
        document.body.insertAdjacentHTML('beforeend', '\n            <div id="modal-login" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50" onclick="cerrarModalLogin(event)">\n                <div class="bg-white rounded-2xl max-w-md w-full mx-4 p-6" onclick="event.stopPropagation()">\n                    <div class="flex justify-between items-center mb-4">\n                        <h3 class="text-2xl font-bold">Iniciar Sesión</h3>\n                        <button onclick="cerrarModalLogin()" class="text-2xl">&times;</button>\n                    </div>\n                    <form id="form-login">\n                        <input type="email" id="login-email" placeholder="Correo electrónico" class="w-full p-3 border rounded-lg mb-3" required>\n                        <input type="password" id="login-password" placeholder="Contraseña" class="w-full p-3 border rounded-lg mb-4" required>\n                        <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">Ingresar</button>\n                    </form>\n                    <p class="text-center mt-4">¿No tienes cuenta? <button onclick="mostrarModalRegistro()" class="text-blue-600">Regístrate</button></p>\n                </div>\n            </div>\n            \n            <div id="modal-registro" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50" onclick="cerrarModalRegistro(event)">\n                <div class="bg-white rounded-2xl max-w-md w-full mx-4 p-6" onclick="event.stopPropagation()">\n                    <div class="flex justify-between items-center mb-4">\n                        <h3 class="text-2xl font-bold">Crear Cuenta</h3>\n                        <button onclick="cerrarModalRegistro()" class="text-2xl">&times;</button>\n                    </div>\n                    <form id="form-registro">\n                        <input type="text" id="reg-nombre" placeholder="Nombre completo" class="w-full p-3 border rounded-lg mb-3">\n                        <input type="tel" id="reg-telefono" placeholder="Teléfono" class="w-full p-3 border rounded-lg mb-3">\n                        <input type="email" id="reg-email" placeholder="Correo electrónico" class="w-full p-3 border rounded-lg mb-3" required>\n                        <input type="password" id="reg-password" placeholder="Contraseña" class="w-full p-3 border rounded-lg mb-4" required>\n                        <button type="submit" class="w-full bg-green-600 text-white py-3 rounded-lg font-semibold">Registrarse</button>\n                    </form>\n                </div>\n            </div>\n        ');
        
        var formLogin = document.getElementById('form-login');
        if (formLogin) {
            formLogin.addEventListener('submit', async function(e) {
                e.preventDefault();
                var email = document.getElementById('login-email').value;
                var password = document.getElementById('login-password').value;
                if (await iniciarSesionSupabase(email, password)) {
                    cerrarModalLogin();
                }
            });
        }
        
        var formRegistro = document.getElementById('form-registro');
        if (formRegistro) {
            formRegistro.addEventListener('submit', async function(e) {
                e.preventDefault();
                var nombre = document.getElementById('reg-nombre').value;
                var telefono = document.getElementById('reg-telefono').value;
                var email = document.getElementById('reg-email').value;
                var password = document.getElementById('reg-password').value;
                if (await registrarUsuarioSupabase(email, password, nombre, telefono)) {
                    cerrarModalRegistro();
                    mostrarModalLogin();
                }
            });
        }
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', async function() {
    crearModalesAuth();
    await cargarUsuarioActualSupabase();
});

// Exponer globalmente
window.registrarUsuarioSupabase = registrarUsuarioSupabase;
window.iniciarSesionSupabase = iniciarSesionSupabase;
window.cerrarSesionSupabase = cerrarSesionSupabase;
window.cargarUsuarioActualSupabase = cargarUsuarioActualSupabase;
window.mostrarModalLogin = mostrarModalLogin;
window.cerrarModalLogin = cerrarModalLogin;
window.mostrarModalRegistro = mostrarModalRegistro;
window.cerrarModalRegistro = cerrarModalRegistro;
