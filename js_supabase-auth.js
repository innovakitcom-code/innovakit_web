// ============================================
// AUTENTICACIÓN CON SUPABASE
// Para integrar con tu index original
// ============================================

async function registrarUsuarioSupabase(email, password, nombre, telefono) {
    if (!supabase) return false;
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: { data: { nombre, telefono } }
        });
        
        if (error) throw error;
        
        if (data.user) {
            await supabase.from('perfiles').insert([{
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

async function iniciarSesionSupabase(email, password) {
    if (!supabase) return false;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        await cargarUsuarioActualSupabase();
        mostrarNotificacion(`✅ ¡Bienvenido, ${usuarioActual?.nombre || email}!`, 'success');
        return true;
    } catch (error) {
        mostrarNotificacion('Email o contraseña incorrectos', 'error');
        return false;
    }
}

async function cerrarSesionSupabase() {
    if (!supabase) return;
    await supabase.auth.signOut();
    usuarioActual = null;
    mostrarNotificacion('Sesión cerrada', 'info');
    location.reload(); // Recargar para actualizar UI
}

async function cargarUsuarioActualSupabase() {
    if (!supabase) return null;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data: perfil } = await supabase.from('perfiles').select('*').eq('id', user.id).single();
    
    usuarioActual = {
        id: user.id,
        email: user.email,
        nombre: perfil?.nombre || user.email.split('@')[0],
        es_admin: perfil?.es_admin || false
    };
    
    return usuarioActual;
}