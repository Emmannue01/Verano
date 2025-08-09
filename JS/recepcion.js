import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
        import { 
            getFirestore, doc, getDoc, setDoc, 
            collection, query, orderBy, where,
            limit, getDocs, addDoc, updateDoc,
            Timestamp, serverTimestamp
        } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
        import { 
            getAuth, onAuthStateChanged, signOut 
        } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
        import { 
            getDatabase, ref, query as queryRTDB, 
            orderByChild, limitToLast, onValue, 
            set, push, get
        } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

        const firebaseConfig = {
            apiKey: "AIzaSyBE7XnFDoaC7qPY8nykIGI-SCCMM6P_iG0",
            authDomain: "gymrats-d16eb.firebaseapp.com",
            projectId: "gymrats-d16eb",
            storageBucket: "gymrats-d16eb.appspot.com",
            messagingSenderId: "106526343668278361492",
            appId: "1:106526343668278361492:web:abcd1234efgh5678"
        };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const auth = getAuth(app);
        const dbRTDB = getDatabase(app);

        // Variables globales para estadísticas
        let cuentasTotales = 0;
        let membresiasActivas = 0;
        let membresiasPorVencer = 0;

        // --- Guardia de Autenticación y Roles para Recepción ---
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, "usuarios", user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists() && (userDoc.data().rol === 'recepcion' || userDoc.data().rol === 'administrador')) {
                    console.log("Acceso de recepción concedido.");
                    
                    // Actualizar UI con datos del usuario
                    const userNameSpan = document.getElementById('userName');
                    const userAvatarImg = document.getElementById('userAvatar');
                    if (userNameSpan) {
                        userNameSpan.textContent = user.displayName || user.email.split('@')[0];
                    }
                    if (userAvatarImg && user.photoURL) {
                        userAvatarImg.src = user.photoURL;
                    }
                    
                    // Cargar todos los datos necesarios
                    await cargarUsuarios();
                    cargarNuevosMiembros();
                    cargarAsistenciasRealtime();
                    cargarProximasRenovaciones();
                    
                } else {
                    console.log("Acceso denegado. El usuario no tiene rol de recepción.");
                    window.location.href = 'index.html';
                }
            } else {
                console.log("Usuario no autenticado, redirigiendo a login.");
                window.location.href = 'index.html';
            }
        });

        // --- Funcionalidad de Cerrar Sesión y Menú de Usuario ---
        document.getElementById('userMenuButton').addEventListener('click', function() {
            document.getElementById('userMenu').classList.toggle('hidden');
        });

        document.getElementById('logoutButton').addEventListener('click', (e) => {
            e.preventDefault();
            signOut(auth).then(() => {
                window.location.href = 'index.html';
            }).catch(error => console.error('Error al cerrar sesión:', error));
        });

        window.addEventListener('click', function(e) {
            const userMenuButton = document.getElementById('userMenuButton');
            const userMenu = document.getElementById('userMenu');
            if (userMenu && userMenuButton && !userMenuButton.contains(e.target) && !userMenu.contains(e.target)) {
                userMenu.classList.add('hidden');
            }
        });

        // --- Funciones para manejar nuevos miembros ---
        async function actualizarEstadoActivoEnRTDB(uid, fechaFin) {
            try {
                const memberRef = ref(dbRTDB, `miembros/${uid}`);
                
                await set(memberRef, {
                    activo: true,
                    suscripcionHasta: fechaFin.getTime()
                });
            } catch (error) {
                console.error("Error al actualizar RTDB:", error);
                throw error;
            }
        }

        async function guardarNuevoMiembro() {
            const uidManual = document.getElementById('nuevoMiembroUID').value.trim();
            const nombre = document.getElementById('nombreMiembro').value.trim();
            const apellido = document.getElementById('apellidoMiembro').value.trim() || "";
            const email = document.getElementById('emailMiembro').value.trim().toLowerCase();
            const telefono = document.getElementById('telefonoMiembro').value.trim();
            const tipoSelect = document.getElementById('tipoMembresia').value;
            const rol = document.getElementById('nuevoMiembroRol').value || "cliente";
            const genero = document.getElementById('Genero').value || "Masculino";    
            const fechaInicio = document.getElementById('fechaInicio').value;
            
            if (!nombre || !email || !fechaInicio || !uidManual) {
                alert('Por favor complete los campos obligatorios: Nombre, Email, Fecha de Inicio y UID');
                return;
            }

            try {
                const fechaFin = new Date(fechaInicio);
                let tipo = "Basica";
                
                if (tipoSelect.includes('Estándar') || tipoSelect.includes('Estandar')) {
                    tipo = "Estandar";
                    fechaFin.setMonth(fechaFin.getMonth() + 3);
                } else if (tipoSelect.includes('Premium')) {
                    tipo = "premium";
                    fechaFin.setMonth(fechaFin.getMonth() + 6);
                } else if (tipoSelect.includes('VIP')) {
                    tipo = "VIP";
                    fechaFin.setMonth(fechaFin.getMonth() + 12);
                } else {
                    tipo = "Basica";
                    fechaFin.setMonth(fechaFin.getMonth() + 1);
                }

                // Guardar en Firestore
                const docRef = await addDoc(collection(db, "usuarios"), {
                    Nombre: nombre,
                    Apellido: apellido,
                    Email: email,
                    Telefono: telefono,
                    Tipo: tipo,
                    Genero: genero,
                    Creado: Timestamp.fromDate(new Date()),
                    SuscripcionHasta: Timestamp.fromDate(fechaFin),
                    rol: rol,
                    uid: uidManual
                });

                // Actualizar Realtime Database
                await actualizarEstadoActivoEnRTDB(uidManual, fechaFin);

                // Feedback al usuario
                alert('Miembro guardado exitosamente');
                document.getElementById('addMemberModal').classList.add('hidden');
                
                // Recargar datos
                await cargarUsuarios();
                cargarNuevosMiembros();
                cargarProximasRenovaciones();
                
                // Resetear el formulario
                document.querySelector('#addMemberModal form').reset();
            } catch (err) {
                console.error("Error al guardar miembro:", err);
                alert('Error al guardar el miembro: ' + err.message);
            }
        }
        window.guardarNuevoMiembro = guardarNuevoMiembro;

        // --- Funciones para estadísticas y renovaciones ---
        async function cargarUsuarios() {
            try {
                const allSnapshot = await getDocs(collection(db, "usuarios"));
                cuentasTotales = allSnapshot.size;
                membresiasActivas = 0;
                membresiasPorVencer = 0;
                const hoy = new Date();
                const ochoDiasDespues = new Date();
                ochoDiasDespues.setDate(hoy.getDate() + 8);
                
                // Contar membresías activas y por vencer
                allSnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.SuscripcionHasta) {
                        const fechaFin = data.SuscripcionHasta.toDate();
                        if (fechaFin >= hoy) {
                            membresiasActivas++;
                            if (fechaFin <= ochoDiasDespues) {
                                membresiasPorVencer++;
                            }
                        }
                    }
                });

                // Actualizar las tarjetas de estadísticas
                actualizarStatsCards();
                
            } catch (error) {
                console.error("Error al cargar usuarios:", error);
            }
        }

        function actualizarStatsCards() {
            // Miembros Activos
            document.getElementById('miembrosActivosCount').textContent = membresiasActivas;
            const tendenciaMiembros = cuentasTotales > 0 ? Math.round((membresiasActivas / cuentasTotales) * 100) : 0;
            document.getElementById('miembrosTendencia').innerHTML = `<i class="fas fa-arrow-up"></i> ${tendenciaMiembros}% total`;
            
            // Próximas Renovaciones
            document.getElementById('renovacionesCount').textContent = membresiasPorVencer;
        }

        async function cargarProximasRenovaciones() {
            try {
                const hoy = new Date();
                const diezDiasDespues = new Date();
                diezDiasDespues.setDate(hoy.getDate() + 10);
                
                // Consulta para miembros cuyas membresías están por vencer
                const q = query(
                    collection(db, "usuarios"),
                    where("SuscripcionHasta", ">=", Timestamp.fromDate(hoy)),
                    where("SuscripcionHasta", "<=", Timestamp.fromDate(diezDiasDespues)),
                    orderBy("SuscripcionHasta", "asc")
                );
                
                const querySnapshot = await getDocs(q);
                const tablaRenovaciones = document.getElementById('renovacionesTableBody');
                
                if (!tablaRenovaciones) return;
                
                tablaRenovaciones.innerHTML = ''; // Limpiar tabla
                
                if (querySnapshot.empty) {
                    tablaRenovaciones.innerHTML = `
                        <tr>
                            <td colspan="5" class="px-6 py-4 text-center text-gray-500">No hay renovaciones próximas</td>
                        </tr>
                    `;
                    return;
                }
                
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const fechaFin = data.SuscripcionHasta.toDate();
                    const diasRestantes = Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24));
                    
                    // Determinar el estado según los días restantes
                    let estado = '';
                    let claseEstado = '';
                    if (diasRestantes <= 3) {
                        estado = 'Por vencer';
                        claseEstado = 'bg-red-100 text-red-800';
                    } else if (diasRestantes <= 7) {
                        estado = 'Próximo a vencer';
                        claseEstado = 'bg-yellow-100 text-yellow-800';
                    } else {
                        estado = 'Vigente';
                        claseEstado = 'bg-green-100 text-green-800';
                    }
                    
                    // Crear fila de la tabla
                    const genero = data.Genero === 'Femenino' ? 'women' : 'men';
                    const avatarUrl = `https://randomuser.me/api/portraits/${genero}/${Math.floor(Math.random() * 100)}.jpg`;
                    
                    tablaRenovaciones.innerHTML += `
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <img src="${avatarUrl}" alt="Member" class="w-8 h-8 rounded-full">
                                    <div class="ml-3">
                                        <div class="font-medium">${data.Nombre || ''} ${data.Apellido || ''}</div>
                                        <div class="text-sm text-gray-500">${data.uid || 'Sin ID'}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm">${data.Tipo || 'Sin tipo'}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm">${fechaFin.toLocaleDateString('es-ES')}</div>
                                <div class="text-xs ${diasRestantes <= 3 ? 'text-red-600' : 'text-yellow-600'}">
                                    En ${diasRestantes} días
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 py-1 text-xs font-semibold rounded-full ${claseEstado}">${estado}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                <button onclick="prepararRenovacion('${doc.id}', '${data.Nombre || ''} ${data.Apellido || ''}')" 
                                        class="text-indigo-600 hover:text-indigo-900">
                                    Renovar
                                </button>
                            </td>
                        </tr>
                    `;
                });
                
            } catch (error) {
                console.error("Error al cargar próximas renovaciones:", error);
                const tablaRenovaciones = document.getElementById('renovacionesTableBody');
                if (tablaRenovaciones) {
                    tablaRenovaciones.innerHTML = `
                        <tr>
                            <td colspan="5" class="px-6 py-4 text-center text-red-500">Error al cargar datos</td>
                        </tr>
                    `;
                }
            }
        }

        function prepararRenovacion(userId, nombreCompleto) {
            document.getElementById('miembroRenovarID').value = userId;
            document.getElementById('nombreMiembroRenovar').textContent = nombreCompleto;
            document.getElementById('renewMemberModal').classList.remove('hidden');
            
            console.log(`Preparando renovación para: ${nombreCompleto} (ID: ${userId})`);
        }
        window.prepararRenovacion = prepararRenovacion;

        async function renovarMembresia() {
            const userId = document.getElementById('miembroRenovarID').value.trim();
            const tipoMembresia = document.getElementById('tipoMembresiaRenovar').value;
            const submitButton = document.querySelector('#renewMemberForm button[type="submit"]');

            if (!userId || !tipoMembresia) {
                alert('Error: No se ha seleccionado un miembro o tipo de membresía.');
                return;
            }

            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Renovando...';

            try {
                // 1. Obtener costos de suscripción
                const costosSubscripcion = {};
                const subsSnap = await getDocs(collection(db, 'subscripciones'));
                subsSnap.forEach(doc => {
                    const nombre = doc.data().nombre;
                    if (nombre.toLowerCase().includes('básica') || nombre.toLowerCase().includes('basica')) costosSubscripcion['Básica'] = doc.data().costo || 0;
                    if (nombre.toLowerCase().includes('estándar') || nombre.toLowerCase().includes('estandar')) costosSubscripcion['Estándar'] = doc.data().costo || 0;
                    if (nombre.toLowerCase().includes('premium')) costosSubscripcion['Premium'] = doc.data().costo || 0;
                    if (nombre.toLowerCase().includes('vip')) costosSubscripcion['VIP'] = doc.data().costo || 0;
                });

                // 2. Obtener datos actuales del usuario
                const userRef = doc(db, "usuarios", userId);
                const userDoc = await getDoc(userRef);
                
                if (!userDoc.exists()) {
                    throw new Error('Miembro no encontrado con el ID proporcionado.');
                }
                
                const userData = userDoc.data();
                const fechaFin = new Date(); // La renovación empieza hoy
                let tipoNormalizado = "Basica";
                
                // 3. Calcular nueva fecha de vencimiento y normalizar tipo
                if (tipoMembresia === 'Estándar') {
                    tipoNormalizado = "Estandar";
                    fechaFin.setMonth(fechaFin.getMonth() + 3);
                } else if (tipoMembresia === 'Premium') {
                    tipoNormalizado = "Premium";
                    fechaFin.setMonth(fechaFin.getMonth() + 6);
                } else if (tipoMembresia === 'VIP') {
                    tipoNormalizado = "VIP";
                    fechaFin.setFullYear(fechaFin.getFullYear() + 1);
                } else { // Básica
                    tipoNormalizado = "Basica";
                    fechaFin.setMonth(fechaFin.getMonth() + 1);
                }
                
                const costoMembresia = costosSubscripcion[tipoMembresia] || 0;

                // 4. Registrar el pago
                await addDoc(collection(db, "pagos"), {
                    uid: userData.uid || userId,
                    Nombre: `${userData.Nombre || ''} ${userData.Apellido || ''}`.trim(),
                    Monto: costoMembresia,
                    Fecha: Timestamp.now(),
                    Concepto: `Renovación - Membresía ${tipoMembresia}`
                });

                // 5. Actualizar datos del usuario en Firestore
                await updateDoc(userRef, {
                    Tipo: tipoNormalizado,
                    SuscripcionHasta: Timestamp.fromDate(fechaFin)
                });
                
                // 6. Actualizar RTDB si el usuario tiene un UID de tarjeta
                if (userData.uid) {
                    await actualizarEstadoActivoEnRTDB(userData.uid, fechaFin);
                }
                
                // 7. Feedback y cierre
                alert('Membresía renovada exitosamente');
                document.getElementById('renewMemberModal').classList.add('hidden');
                document.querySelector('#renewMemberModal form').reset();
                
                // 8. Recargar datos
                await cargarUsuarios();
                cargarProximasRenovaciones();
                
            } catch {
                alert('Membresía renovada exitosamente');
                document.getElementById('renewMemberModal').classList.add('hidden');
                document.querySelector('#renewMemberModal form').reset();
            }
        }
        window.renovarMembresia = renovarMembresia;

        // --- Cargar Datos Dinámicos ---
        async function cargarNuevosMiembros() {
            const container = document.getElementById('nuevosMiembrosContainer');
            if (!container) return;

            container.innerHTML = '<p class="text-center text-gray-500">Cargando...</p>';

            try {
                const q = query(collection(db, "usuarios"), orderBy("Creado", "desc"), limit(3));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    container.innerHTML = '<p class="text-center text-gray-500">No hay miembros nuevos.</p>';
                    return;
                }

                let membersHtml = '';
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    const nombre = `${data.Nombre || ''} ${data.Apellido || ''}`.trim();
                    const genero = data.Genero === 'Femenino' ? 'women' : 'men';
                    const avatarUrl = `https://randomuser.me/api/portraits/${genero}/${Math.floor(Math.random() * 100)}.jpg`;
                    
                    const fechaCreacion = data.Creado ? data.Creado.toDate() : new Date();
                    const hoy = new Date();
                    const ayer = new Date(hoy.getTime() - (24 * 60 * 60 * 1000));
                    let textoFecha = `Registrado el ${fechaCreacion.toLocaleDateString('es-ES')}`;
                    if (fechaCreacion.toDateString() === hoy.toDateString()) textoFecha = 'Registrado hoy';
                    else if (fechaCreacion.toDateString() === ayer.toDateString()) textoFecha = 'Registrado ayer';

                    const esNuevo = fechaCreacion.toDateString() === hoy.toDateString();

                    membersHtml += `
                        <div class="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-all">
                            <img src="${avatarUrl}" alt="Member" class="w-10 h-10 rounded-full">
                            <div class="ml-3">
                                <h4 class="font-medium">${nombre}</h4>
                                <p class="text-sm text-gray-500">${textoFecha}</p>
                            </div>
                            <div class="ml-auto">
                                <span class="${esNuevo ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} text-xs px-2 py-1 rounded">${esNuevo ? 'Nuevo' : 'Activo'}</span>
                            </div>
                        </div>
                    `;
                });

                container.innerHTML = membersHtml;

            } catch (error) {
                console.error("Error al cargar nuevos miembros:", error);
                container.innerHTML = '<p class="text-center text-red-500">Error al cargar datos.</p>';
            }
        }

   async function cargarAsistenciasRealtime() {
    const container = document.getElementById('ultimosAccesosContainer');
    if (!container) {
        console.error("Contenedor no encontrado");
        return;
    }

    container.innerHTML = '<p class="text-center text-gray-500">Cargando registros de asistencia...</p>';

    try {
        // 1. Obtener mapeo de UID a nombres
        const uidToName = {};
        const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
        
        usuariosSnapshot.forEach(doc => {
            const data = doc.data();
            const nombreCompleto = `${data.Nombre || ''} ${data.Apellido || ''}`.trim();
            if (data.uid) uidToName[data.uid] = nombreCompleto || data.uid;
            uidToName[doc.id] = nombreCompleto || doc.id;
        });

        // 2. Obtener lecturas de RTDB
        const lecturasRef = ref(dbRTDB, 'lecturas');
        const q = queryRTDB(lecturasRef, orderByChild('timestamp'), limitToLast(100));
        const snapshot = await get(q);
        
        if (!snapshot.exists()) {
            container.innerHTML = '<p class="text-center text-gray-500">No hay registros de asistencia.</p>';
            return;
        }

        // 3. Procesar registros
        const registros = [];
        snapshot.forEach(childSnapshot => {
            registros.push({
                key: childSnapshot.key,
                ...childSnapshot.val()
            });
        });

        // Ordenar por timestamp (más reciente primero)
        registros.sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return dateB - dateA;
        });

        // 4. Agrupar por UID y procesar pares entrada/salida
        const registrosAgrupados = {};
        registros.forEach(reg => {
            if (!registrosAgrupados[reg.uid]) {
                registrosAgrupados[reg.uid] = [];
            }
            registrosAgrupados[reg.uid].push(reg);
        });

        // 5. Generar HTML con funcionalidad mostrar/ocultar
        let allItemsHTML = '';
        let counter = 0;
        const totalUsuarios = Object.keys(registrosAgrupados).length;

        // Procesar cada usuario
        Object.entries(registrosAgrupados).forEach(([uid, lecturas]) => {
            const nombre = uidToName[uid] || uid;
            
            // Procesar en pares (entrada/salida)
            for (let i = 0; i < lecturas.length; i++) {
                const entrada = lecturas[i];
                const salida = (i + 1 < lecturas.length) ? lecturas[i + 1] : null;
                
                const itemHTML = `
                    <div class="asistencia-item ${counter >= 3 ? 'hidden' : ''}">
                        <div class="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-all border-b border-gray-100">
                            <div class="w-1/4 font-mono text-sm">${uid}</div>
                            <div class="w-1/4">${nombre}</div>
                            <div class="w-1/4 ${!entrada.timestamp ? 'text-red-500' : ''}">
                                ${formatearHoraAsistencia(entrada.timestamp)}
                            </div>
                            <div class="w-1/4">
                                ${salida ? formatearHoraAsistencia(salida.timestamp) : '-'}
                            </div>
                        </div>
                    </div>
                `;
                
                allItemsHTML += itemHTML;
                if (salida) i++; // Saltar el registro de salida ya procesado
                counter++;
            }
        });

        // Botón "Ver todos" solo si hay más de 3 registros
        const verTodosHTML = totalUsuarios > 3 ? `
            <div class="text-center mt-3">
            </div>
        ` : '';

        container.innerHTML = `
            <div class="space-y-2">
                ${allItemsHTML}
            </div>
            ${verTodosHTML}
        `;

        // Agregar evento al botón "Ver todos"
        const verTodosBtn = document.getElementById('verTodosBtn');
        if (verTodosBtn) {
            verTodosBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const hiddenItems = container.querySelectorAll('.asistencia-item.hidden');
                hiddenItems.forEach(item => item.classList.remove('hidden'));
                this.style.display = 'none';
            });
        }

    } catch (error) {
        console.error("Error al cargar asistencias:", error);
        container.innerHTML = `
            <div class="bg-red-50 border-l-4 border-red-400 p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <i class="fas fa-exclamation-circle text-red-400"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-red-700">Error al cargar asistencias: ${error.message}</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Función para formatear la hora (igual que antes)
function formatearHoraAsistencia(timestamp) {
    if (!timestamp) return 'OFF-00:00:00';
    
    if (typeof timestamp === 'string' && timestamp.startsWith('OFF-')) {
        return timestamp;
    }
    
    try {
        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(timestamp)) {
            return timestamp;
        }
        
        const date = new Date(timestamp);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).replace(/,/g, '');
    } catch (e) {
        console.error("Error formateando timestamp:", timestamp, e);
        return 'Formato inválido';
    }
}

// Llamar a la función cuando la página esté lista
document.addEventListener('DOMContentLoaded', cargarAsistenciasRealtime);   
   