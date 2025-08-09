
    // Funcionalidad para abrir el modal de Miembros
    document.querySelector('a[href="#"]:has(i.fa-users)').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('membersModal').classList.remove('hidden');
        cargarMiembrosModal();
    });

    // Funcionalidad para abrir el modal de Membresías
    document.querySelector('a[href="#"]:has(i.fa-id-card)').addEventListener('click', function(e) {
        e.preventDefault();
        mostrarModalMembresias();
    });

    // Modal específico para gestionar costos de membresías
    function mostrarModalMembresias() {
        let costos = {
            Basica: 200,
            Estandar: 500,
            Premium: 900,
            VIP: 1500
        };
        // Cargar los costos actuales desde Firestore
        import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js').then(async ({ getDocs, collection }) => {
            const snap = await getDocs(collection(db, 'subscripciones'));
            snap.forEach(doc => {
                const d = doc.data();
                if (d.nombre && d.costo) {
                    if (d.nombre === 'Basica') costos.Basica = d.costo;
                    if (d.nombre === 'Estandar') costos.Estandar = d.costo;
                    if (d.nombre === 'Premium') costos.Premium = d.costo;
                    if (d.nombre === 'VIP') costos.VIP = d.costo;
                }
            });
            renderModal();
        });

        function renderModal() {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
                    <button class="absolute top-2 right-2 text-gray-500 hover:text-gray-700" id="closeMembresiasModal"><i class="fas fa-times"></i></button>
                    <h3 class="text-xl font-semibold mb-4">Gestión de Membresías</h3>
                    <form id="formCostosMembresias">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Costo Básica (1 mes)</label>
                            <input type="number" min="0" step="1" name="Basica" value="${costos.Basica}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Costo Estándar (3 meses)</label>
                            <input type="number" min="0" step="1" name="Estandar" value="${costos.Estandar}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Costo Premium (6 meses)</label>
                            <input type="number" min="0" step="1" name="Premium" value="${costos.Premium}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                        </div>
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Costo VIP (12 meses)</label>
                            <input type="number" min="0" step="1" name="VIP" value="${costos.VIP}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                        </div>
                        <div class="flex justify-end gap-2">
                            <button type="button" id="closeMembresiasModalBtn" class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancelar</button>
                            <button type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Guardar Cambios</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('closeMembresiasModal').onclick = () => modal.remove();
            document.getElementById('closeMembresiasModalBtn').onclick = () => modal.remove();
            document.getElementById('formCostosMembresias').onsubmit = async function(e) {
                e.preventDefault();
                const data = new FormData(e.target);
                const subs = [
                    { nombre: 'Basica', costo: parseInt(data.get('Basica')) },
                    { nombre: 'Estandar', costo: parseInt(data.get('Estandar')) },
                    { nombre: 'Premium', costo: parseInt(data.get('Premium')) },
                    { nombre: 'VIP', costo: parseInt(data.get('VIP')) }
                ];
                const { setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
                for (const sub of subs) {
                    await setDoc(doc(db, 'subscripciones', sub.nombre), { nombre: sub.nombre, costo: sub.costo });
                }
                alert('Costos actualizados correctamente y guardados en la base de datos.');
                modal.remove();
            };
        }
    }

    // Funcionalidad para abrir el modal de Asistencias
    document.querySelector('a[href="#"]:has(i.fa-calendar-check)').addEventListener('click', function(e) {
        e.preventDefault();
        mostrarModalAsistencias();
    });

    function mostrarModalAsistencias() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl relative">
                <button class="absolute top-2 right-2 text-gray-500 hover:text-gray-700" id="closeAsistenciasModal"><i class="fas fa-times"></i></button>
                <h3 class="text-xl font-semibold mb-4">Asistencias en Tiempo Real</h3>
                <div class="overflow-x-auto max-h-96">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UID</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora de Entrada</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora de Salida</th>
                            </tr>
                        </thead>
                        <tbody id="asistenciasBody" class="bg-white divide-y divide-gray-200">
                            <tr><td colspan="4" class="px-6 py-4 text-center text-gray-400">Cargando...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('closeAsistenciasModal').onclick = () => modal.remove();

        cargarAsistenciasRealtimeRTDB(document.getElementById('asistenciasBody'));
    }

    async function cargarAsistenciasRealtimeRTDB(tbody) {
        try {
            // Obtener mapeo UID → Nombre
            let uidToName = {};
            try {
                const { getDocs, collection } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
                const usuariosSnap = await getDocs(collection(db, 'usuarios'));
                usuariosSnap.forEach(doc => {
                    const d = doc.data();
                    const nombreCompleto = (d.Nombre ? d.Nombre : '') + (d.Apellido ? ' ' + d.Apellido : '');
                    uidToName[doc.id] = nombreCompleto.trim() || doc.id;
                    if (d.uid) {
                        uidToName[d.uid] = nombreCompleto.trim() || d.uid;
                    }
                });
            } catch (e) {}

            const { getDatabase, ref, onValue } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
            const dbRTDB = getDatabase();
            const lecturasRef = ref(dbRTDB, 'lecturas');
            onValue(lecturasRef, (snapshot) => {
                tbody.innerHTML = '';
                const data = snapshot.val();
                if (!data) {
                    tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-400">Sin registros</td></tr>';
                    return;
                }
                // Agrupar por UID
                const registros = Object.values(data);
                const porUid = {};
                registros.forEach(reg => {
                    const uid = reg.uid || reg.id;
                    if (!uid) return;
                    if (!porUid[uid]) porUid[uid] = [];
                    porUid[uid].push(reg);
                });
                Object.entries(porUid).forEach(([uid, lista]) => {
                    // Ordenar por timestamp ascendente
                    lista.sort((a, b) => {
                        const tA = extraerTimestamp(a.timestamp);
                        const tB = extraerTimestamp(b.timestamp);
                        return tA - tB;
                    });
                    const nombre = uidToName[uid] || uid;
                    // Procesar en pares de lecturas (entrada/salida)
                    for (let i = 0; i < lista.length; i += 2) {
                        const entrada = lista[i];
                        const salida = lista[i + 1];
                        const horaEntrada = entrada ? formatearFecha24(entrada.timestamp) : '-';
                        const horaSalida = salida ? formatearFecha24(salida.timestamp) : '-';
                        tbody.innerHTML += `
                            <tr>
                                <td class="px-4 py-4 whitespace-nowrap">${uid}</td>
                                <td class="px-4 py-4 whitespace-nowrap">${nombre}</td>
                                <td class="px-4 py-4 whitespace-nowrap">${horaEntrada}</td>
                                <td class="px-4 py-4 whitespace-nowrap">${horaSalida}</td>
                            </tr>
                        `;
                    }
                });
            }, (err) => {
                tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-red-400">Error al cargar asistencias</td></tr>';
            });
        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-red-400">Error al cargar asistencias</td></tr>';
        }
    }

    // Función auxiliar para extraer el timestamp en milisegundos
    function extraerTimestamp(hora) {
       return hora;
    }

    // Función auxiliar para formatear la fecha
    function formatearFecha24(hora) {
        if (!hora) {
            return '-';
        }

        return hora;
    }



    // Función genérica para mostrar modales simples
    function mostrarModalGenerico(titulo, contenido) {
        // Si es la sección de reportes, mostrar UI especial
        if (titulo === 'Reportes') {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl relative">
                    <button class="absolute top-2 right-2 text-gray-500 hover:text-gray-700" id="closeGenericModal"><i class="fas fa-times"></i></button>
                    <h3 class="text-xl font-semibold mb-4">Reportes del Gimnasio</h3>
                    <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-gray-50 rounded-lg p-4 shadow">
                            <h4 class="font-semibold mb-2 text-indigo-700"><i class="fas fa-users mr-2"></i>Reporte General de Usuarios</h4>
                            <button class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full" onclick="generarReporteUsuarios()">Descargar Excel</button>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4 shadow">
                            <h4 class="font-semibold mb-2 text-green-700"><i class="fas fa-calendar-check mr-2"></i>Reporte de Asistencias</h4>
                            <button class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full" onclick="generarReporteAsistencias()">Descargar Excel</button>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4 shadow">
                            <h4 class="font-semibold mb-2 text-yellow-700"><i class="fas fa-id-card mr-2"></i>Reporte de Membresías</h4>
                            <button class="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 w-full" onclick="generarReporteMembresias()">Descargar Excel</button>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4 shadow">
                            <h4 class="font-semibold mb-2 text-purple-700"><i class="fas fa-wallet mr-2"></i>Reporte de Ingresos</h4>
                            <button class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full" onclick="generarReporteIngresos()">Descargar Excel</button>
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button type="button" id="closeGenericModalBtn" class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cerrar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('closeGenericModal').onclick = () => modal.remove();
            document.getElementById('closeGenericModalBtn').onclick = () => modal.remove();
        } else {
            // Modal genérico por defecto
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
                    <button class="absolute top-2 right-2 text-gray-500 hover:text-gray-700" id="closeGenericModal"><i class="fas fa-times"></i></button>
                    <h3 class="text-xl font-semibold mb-4">${titulo}</h3>
                    <div class="mb-8 text-gray-700">${contenido}</div>
                    <div class="flex justify-end">
                        <button type="button" id="closeGenericModalBtn" class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cerrar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('closeGenericModal').onclick = () => modal.remove();
            document.getElementById('closeGenericModalBtn').onclick = () => modal.remove();
        }
    }
// Cargar SheetJS para exportar a Excel
let sheetjsLoaded = false;
async function loadSheetJS() {
    if (!sheetjsLoaded) {
        await import('https://cdn.sheetjs.com/xlsx-latest/package/xlsx.mjs');
        sheetjsLoaded = true;
    }
}

// Reporte General de Usuarios
async function generarReporteUsuarios() {
    await loadSheetJS();
    const { getDocs, collection } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const usuariosSnap = await getDocs(collection(db, 'usuarios'));
    const rows = [];
    usuariosSnap.forEach(doc => {
        const d = doc.data();
        let fechaCreacion = '-';
        if (d.Creado) {
            if (typeof d.Creado.toDate === 'function') {
                fechaCreacion = d.Creado.toDate().toLocaleDateString('es-ES');
            } else if (typeof d.Creado === 'string' || typeof d.Creado === 'number') {
                fechaCreacion = new Date(d.Creado).toLocaleDateString('es-ES');
            }
        }
        rows.push({
            UID: d.uid || doc.id,
            Nombre: d.Nombre || '',
            Apellido: d.Apellido || '',
            Email: d.Email || '',
            Teléfono: d.Telefono || '',
            Tipo: d.Tipo || '',
            'Fecha de Creación': fechaCreacion,
            'Fecha Fin': d.SuscripcionHasta ? (d.SuscripcionHasta.toDate ? d.SuscripcionHasta.toDate().toLocaleDateString('es-ES') : '-') : '-',
            Estado: d.Estado || '-',
        });
    });
    if (rows.length === 0) return alert('No hay usuarios para exportar.');
    exportarExcel(rows, 'Usuarios.xlsx');
}

// Reporte de Asistencias
async function generarReporteAsistencias() {
    await loadSheetJS();
    const { getDatabase, ref, get } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
    const dbRTDB = getDatabase();
    const lecturasRef = ref(dbRTDB, 'lecturas');
    const snap = await get(lecturasRef);
    const data = snap.val();
    if (!data) return alert('No hay asistencias para exportar.');
    const rows = Object.values(data).map(reg => ({
        UID: reg.uid || reg.id || '-',
        Nombre: reg.nombre || '-',
        'Hora': reg.horaEntrada || reg.hora || reg.timestamp || '-',
    }));
    exportarExcel(rows, 'Asistencias.xlsx');
}

// Reporte de Membresías
async function generarReporteMembresias() {
    await loadSheetJS();
    const { getDocs, collection } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const usuariosSnap = await getDocs(collection(db, 'usuarios'));
    const rows = [];
    usuariosSnap.forEach(doc => {
        const d = doc.data();
        let fechaCreacion = '-';
        if (d.Creado) {
            if (typeof d.Creado.toDate === 'function') {
                fechaCreacion = d.Creado.toDate().toLocaleDateString('es-ES');
            } else if (typeof d.Creado === 'string' || typeof d.Creado === 'number') {
                fechaCreacion = new Date(d.Creado).toLocaleDateString('es-ES');
            }
        }
        // Normalizar tipo para el reporte
        let tipo = (d.Tipo || "Basica").toLowerCase();
        if (tipo.includes("básica") || tipo.includes("basica")) tipo = "Básica";
        else if (tipo.includes("estándar") || tipo.includes("estandar")) tipo = "Estandar";
        else if (tipo.includes("premium")) tipo = "Premium";
        else if (tipo.includes("vip")) tipo = "VIP";
        rows.push({
            UID: d.uid || doc.id,
            Nombre: d.Nombre || '',
            Apellido: d.Apellido || '',
            Tipo: tipo,
            'Fecha de Creación': fechaCreacion,
            'Fecha Fin': d.SuscripcionHasta ? (d.SuscripcionHasta.toDate ? d.SuscripcionHasta.toDate().toLocaleDateString('es-ES') : '-') : '-',
            Estado: d.Estado || '-',
        });
    });
    if (rows.length === 0) return alert('No hay membresías para exportar.');
    exportarExcel(rows, 'Membresias.xlsx');
}

// Reporte de Ingresos (requiere campo de pagos o ingresos en la BD)
async function generarReporteIngresos() {
    await loadSheetJS();
    const { getDocs, collection } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    try {
        const pagosSnap = await getDocs(collection(db, 'pagos'));
        const rows = [];
        pagosSnap.forEach(doc => {
            const d = doc.data();
            rows.push({
                UID: d.uid || '-',
                Nombre: d.Nombre || '-',
                Monto: d.Monto || d.monto || '-',
                Fecha: d.Fecha ? (d.Fecha.toDate ? d.Fecha.toDate().toLocaleDateString('es-ES') : d.Fecha) : '-',
                Concepto: d.Concepto || '-',
            });
        });
        if (rows.length === 0) return alert('No hay ingresos registrados en la colección "pagos". Si no existe, crea la colección o avísame para ajustar el reporte.');
        exportarExcel(rows, 'Ingresos.xlsx');
    } catch (e) {
        alert('No se encontró la colección "pagos" en la base de datos. Por favor, crea la colección o avísame para ajustar el reporte.');
    }
}


async function exportarExcel(rows, nombreArchivo) {
   
    const XLSX = await import('https://cdn.sheetjs.com/xlsx-latest/package/xlsx.mjs');
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, nombreArchivo);
}

    document.getElementById('closeMembersModal').addEventListener('click', function() {
        document.getElementById('membersModal').classList.add('hidden');
    });

    window.addEventListener('click', function(e) {
        if (e.target === document.getElementById('membersModal')) {
            document.getElementById('membersModal').classList.add('hidden');
        }
    });

    let currentPage = 1;
    const membersPerPage = 10;
    let allMembers = [];
    let filteredMembers = [];
    let cuentasTotales = 0;

    async function cargarMiembrosModal() {
        try {
            const q = query(collection(db, "usuarios"), orderBy("Creado", "desc"));
            const snapshot = await getDocs(q);
            const allSnapshot = await getDocs(collection(db, "usuarios"));
            cuentasTotales = allSnapshot.size;
         allMembers = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                allMembers.push({
                    id: doc.id,
                    UID: data.uid || doc.id, // <-- Agregar UID
                    Nombre: data.Nombre || "Sin nombre",
                    Apellido: data.Apellido || "",
                    Email: data.Email || "Sin email",
                    Telefono: data.Telefono || "Sin teléfono",
                    Tipo: data.Tipo || "Básica",
                    SuscripcionHasta: data.SuscripcionHasta ? data.SuscripcionHasta.toDate() : new Date(),
                    Genero: data.Genero || "Masculino",
                    rol: data.rol || "cliente"
                });
            });
            filteredMembers = [...allMembers];
            mostrarMiembros();
            actualizarPaginacion();
            document.getElementById('totalAccounts').textContent = 0; // Inicializar en 0
        } catch (err) {

             document.getElementById('totalAccounts').textContent = 0;
            console.error("Error al cargar miembros:", err);
            alert("Error al cargar miembros. Verifica la consola para más detalles.");
        }
    }

    function mostrarMiembros() {
        const startIndex = (currentPage - 1) * membersPerPage;
        const endIndex = startIndex + membersPerPage;
        const membersToShow = filteredMembers.slice(startIndex, endIndex);
        const tbody = document.getElementById('membersModalBody');
        tbody.innerHTML = '';
        membersToShow.forEach(member => {
            const fechaFin = member.SuscripcionHasta instanceof Date ? member.SuscripcionHasta : new Date(member.SuscripcionHasta);
            const hoy = new Date();
            const estado = fechaFin >= hoy ? 'Activo' : 'Expirado';
            const estadoClass = fechaFin >= hoy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
            tbody.innerHTML += `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10">
                                <img class="h-10 w-10 rounded-full" src="https://i.pravatar.cc/40?u=${member.id}" alt="">
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${member.Nombre} ${member.Apellido}</div>
                                <div class="text-sm text-gray-500">${member.Email}</div>
                                <div class="text-xs text-gray-400">UID: ${member.UID || member.id}</div> <!-- Mostrar UID -->
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${member.Telefono}</div>
                        <div class="text-sm text-gray-500">${member.Email}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${member.Tipo}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${fechaFin.toLocaleDateString('es-ES')}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${estadoClass}">
                            ${estado}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="editarMiembro('${member.id}')" class="text-yellow-600 hover:text-yellow-900 mr-3"><i class="fas fa-edit"></i></button>
                        <button onclick="eliminarMiembro('${member.id}')" class="text-red-600 hover:text-red-900"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
            `;
        });
    }

    document.querySelector('#membersModal input[type="text"]').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        filtrarMiembros(searchTerm);
    });

    document.querySelectorAll('#membersModal select').forEach(select => {
        select.addEventListener('change', function() {
            filtrarMiembros();
        });
    });

    function filtrarMiembros(searchTerm = '') {
        const estadoFilter = document.querySelector('#membersModal select:first-of-type').value;
        const tipoFilter = document.querySelector('#membersModal select:last-of-type').value;
        
        filteredMembers = allMembers.filter(member => {
            const matchesSearch = member.Nombre.toLowerCase().includes(searchTerm) || 
                                member.Email?.toLowerCase().includes(searchTerm) ||
                                member.Telefono?.includes(searchTerm);
            
            const hoy = new Date();
            const fechaFin = member.fechaFin instanceof Date ? member.fechaFin : new Date(member.fechaFin);
            let matchesEstado = true;
            let matchesTipo = true;
            
            if (estadoFilter !== 'Todos los estados') {
                if (estadoFilter === 'Activos') matchesEstado = fechaFin >= hoy;
                if (estadoFilter === 'Expirados') matchesEstado = fechaFin < hoy;
                if (estadoFilter === 'Por vencer') {
                    const cincoDiasDespues = new Date();
                    cincoDiasDespues.setDate(hoy.getDate() + 5);
                    matchesEstado = fechaFin > hoy && fechaFin <= cincoDiasDespues;
                }
            }
            
            if (tipoFilter !== 'Todos los tipos') {
                matchesTipo = member.Tipo === tipoFilter;
            }
            
            return matchesSearch && matchesEstado && matchesTipo;
        });
        
        currentPage = 1;
        mostrarMiembros();
        actualizarPaginacion();
    }

    function actualizarPaginacion() {
        const totalPages = Math.ceil(filteredMembers.length / membersPerPage);
        const paginationInfo = document.querySelector('#membersModal .text-sm.text-gray-500');
        const paginationButtons = document.querySelectorAll('#membersModal .flex.space-x-2 button');
        
        const startItem = (currentPage - 1) * membersPerPage + 1;
        const endItem = Math.min(currentPage * membersPerPage, filteredMembers.length);
        
        paginationInfo.innerHTML = `Mostrando <span class="font-medium">${startItem}</span> a <span class="font-medium">${endItem}</span> de <span class="font-medium">${filteredMembers.length}</span> miembros`;
        
        paginationButtons.forEach((button, index) => {
            if (index === 0) {
                button.disabled = currentPage === 1;
                button.classList.toggle('bg-gray-200', !button.disabled);
                button.classList.toggle('bg-gray-100', button.disabled);
            } else if (index === paginationButtons.length - 1) {
                button.disabled = currentPage === totalPages;
                button.classList.toggle('bg-gray-200', !button.disabled);
                button.classList.toggle('bg-gray-100', button.disabled);
            } else {
                const pageNumber = index;
                button.textContent = pageNumber;
                button.classList.toggle('bg-indigo-600', pageNumber === currentPage);
                button.classList.toggle('text-white', pageNumber === currentPage);
                button.classList.toggle('bg-gray-200', pageNumber !== currentPage);
                button.style.display = pageNumber <= totalPages ? '' : 'none';
            }
        });
    }

    document.querySelector('#membersModal .flex.space-x-2').addEventListener('click', function(e) {
        const target = e.target.closest('button');
        if (!target) return;
        
        const totalPages = Math.ceil(filteredMembers.length / membersPerPage);
        
        if (target.innerHTML.includes('chevron-left')) {
            if (currentPage > 1) {
                currentPage--;
                mostrarMiembros();
                actualizarPaginacion();
            }
        } else if (target.innerHTML.includes('chevron-right')) {
            if (currentPage < totalPages) {
                currentPage++;
                mostrarMiembros();
                actualizarPaginacion();
            }
        } else if (!isNaN(parseInt(target.textContent))) {
            currentPage = parseInt(target.textContent);
            mostrarMiembros();
            actualizarPaginacion();
        }
    });

    // Nueva función para actualizar el estado en Realtime Database
    async function actualizarEstadoActivoEnRTDB(uid, fechaFin) {
        try {
            const { getDatabase, ref, set } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
            const dbRTDB = getDatabase();
            const hoy = new Date();
            // Maneja tanto objetos Date como Timestamps de Firestore
            const fechaExpiracion = fechaFin instanceof Date ? fechaFin : (fechaFin && typeof fechaFin.toDate === 'function' ? fechaFin.toDate() : new Date(fechaFin));
            const estaActivo = fechaExpiracion >= hoy;
            
            await set(ref(dbRTDB, 'activos/' + uid), {
                activa: estaActivo
            });
        } catch (error) {
            console.error("Error al actualizar estado en RTDB para UID " + uid, error);
        }
    }

    // Nueva función para eliminar el estado en Realtime Database
    async function eliminarEstadoActivoEnRTDB(uid) {
        try {
            const { getDatabase, ref, remove } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
            const dbRTDB = getDatabase();
            await remove(ref(dbRTDB, 'activos/' + uid));
        } catch (error) {
            console.error("Error al eliminar estado en RTDB para UID " + uid, error);
        }
    }

    async function eliminarMiembro(id) {
  if (confirm('¿Estás seguro de eliminar este miembro?')) {
    try {
      const { deleteDoc, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const memberDocRef = doc(db, 'usuarios', id);
      const memberDoc = await getDoc(memberDocRef);
      const memberData = memberDoc.data();
      if (memberData && memberData.uid) {
        await eliminarEstadoActivoEnRTDB(memberData.uid);
      }
      await deleteDoc(memberDocRef);
      alert('Miembro eliminado correctamente');
      cargarMiembrosModal();
      cargarUsuarios();
    } catch (err) {
      
    }
  }
}

async function editarMiembro(id) {
  const member = allMembers.find(m => m.id === id);
  if (!member) return;
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto flex items-center justify-center p-4 z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
      <div class="sticky top-0 bg-white px-6 py-4 border-b">
        <button class="absolute right-4 top-4 text-gray-500 hover:text-gray-700" id="closeEditModal">
          <i class="fas fa-times"></i>
        </button>
        <h3 class="text-lg font-semibold">Editar Miembro</h3>
      </div>
      <form id="editMemberForm" class="p-6">
        <div class="grid grid-cols-1 gap-4">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">UID</label>
              <input type="text" name="uid" value="${member.UID || member.id}" 
                class="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select name="rol" class="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="cliente"${member.rol === 'cliente' ? ' selected' : ''}>Cliente</option>
                <option value="recepcion"${member.rol === 'recepcion' ? ' selected' : ''}>Recepción</option>
                <option value="entrenador"${member.rol === 'entrenador' ? ' selected' : ''}>Entrenador</option>
                <option value="administrador"${member.rol === 'administrador' ? ' selected' : ''}>Administrador</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Género</label>
              <select name="genero" class="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="Masculino"${member.Genero === 'Masculino' ? ' selected' : ''}>Masculino</option>
                <option value="Femenino"${member.Genero === 'Femenino' ? ' selected' : ''}>Femenino</option>
                <option value="Otro"${member.Genero === 'Otro' ? ' selected' : ''}>No especificado</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" name="nombre" value="${member.Nombre}" 
                class="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input type="text" name="apellido" value="${member.Apellido}" 
                class="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
              <input type="email" name="email" value="${member.Email}" 
                class="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input type="tel" name="telefono" value="${member.Telefono}" 
                class="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Membresía</label>
                <select id="editMemberTipo" name="tipo" class="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="Basica"${member.Tipo.toLowerCase().includes('basica') ? ' selected' : ''}>Básica</option>
                    <option value="Estandar"${member.Tipo.toLowerCase().includes('estandar') ? ' selected' : ''}>Estándar</option>
                    <option value="Premium"${member.Tipo.toLowerCase().includes('premium') ? ' selected' : ''}>Premium</option>
                    <option value="VIP"${member.Tipo.toLowerCase().includes('vip') ? ' selected' : ''}>VIP</option>
                </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
              <input id="editMemberFechaFin" type="date" name="suscripcionHasta" value="${member.SuscripcionHasta.toISOString().slice(0,10)}" 
                class="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
          </div>
        </div>
        <div class="mt-6 flex flex-col sm:flex-row justify-end gap-3">
          <button type="button" id="cancelEditMember" 
            class="w-full sm:w-auto px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Cancelar
          </button>
          <button type="submit" 
            class="w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('closeEditModal').onclick = () => modal.remove();
  document.getElementById('cancelEditMember').onclick = () => modal.remove();

  // Al cambiar el tipo de membresía, calcula la nueva fecha de fin.
  document.getElementById('editMemberTipo').addEventListener('change', function(e) {
    const tipo = e.target.value;
    const fechaFinInput = document.getElementById('editMemberFechaFin');
    
    const hoy = new Date();
    // La fecha base para la renovación es el final de la membresía actual si aún está activa, o hoy si ya expiró.
    const fechaBase = member.SuscripcionHasta > hoy ? member.SuscripcionHasta : hoy;
    const nuevaFechaFin = new Date(fechaBase);

    let mesesAAgregar = 0;
    switch(tipo) {
        case 'Estandar': mesesAAgregar = 3; break;
        case 'Premium': mesesAAgregar = 6; break;
        case 'VIP': mesesAAgregar = 12; break;
        case 'Basica': default: mesesAAgregar = 1; break;
    }
    
    nuevaFechaFin.setMonth(nuevaFechaFin.getMonth() + mesesAAgregar);
    
    // Formatear a YYYY-MM-DD para el input de fecha
    const yyyy = nuevaFechaFin.getFullYear();
    const mm = String(nuevaFechaFin.getMonth() + 1).padStart(2, '0');
    const dd = String(nuevaFechaFin.getDate()).padStart(2, '0');
    
    fechaFinInput.value = `${yyyy}-${mm}-${dd}`;
  });

  document.getElementById('editMemberForm').onsubmit = async function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const uid = formData.get('uid').trim();
    const rol = formData.get('rol');
    const genero = formData.get('genero');
    const nombre = formData.get('nombre').trim();
    const apellido = formData.get('apellido').trim();
    const email = formData.get('email').trim().toLowerCase();
    const telefono = formData.get('telefono').trim();
    const tipo = formData.get('tipo');
    const suscripcionHasta = formData.get('suscripcionHasta');
    const nuevaFechaFin = new Date(suscripcionHasta + 'T00:00:00');
    const antiguaFechaFin = member.SuscripcionHasta;

    try {
      const { updateDoc, doc, Timestamp, addDoc, collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      
      // Si la fecha se extiende, es una renovación y se registra el pago
      if (nuevaFechaFin > antiguaFechaFin) {
          const costosSubscripcion = {};
          const subsSnap = await getDocs(collection(db, 'subscripciones'));
          subsSnap.forEach(doc => {
              costosSubscripcion[doc.data().nombre] = doc.data().costo || 0;
          });
          const costoMembresia = costosSubscripcion[tipo] || 0;

          await addDoc(collection(db, "pagos"), {
              uid: uid,
              Nombre: `${nombre} ${apellido}`,
              Monto: costoMembresia,
              Fecha: Timestamp.now(), // Se registra el pago en la fecha de la renovación
              Concepto: `Renovación - Membresía ${tipo}`
          });
      }

      await updateDoc(doc(db, 'usuarios', id), {
        uid: uid,
        rol: rol,
        Genero: genero,
        Nombre: nombre,
        Apellido: apellido,
        Email: email,
        Telefono: telefono,
        Tipo: tipo,
        SuscripcionHasta: Timestamp.fromDate(new Date(suscripcionHasta))
      });
      await actualizarEstadoActivoEnRTDB(uid, new Date(suscripcionHasta));
      alert('Miembro actualizado correctamente\nUID: ' + uid);
      modal.remove();
      cargarMiembrosModal();
      cargarUsuarios();
    } catch (err) {
     
    }
  };
}

// Mostrar modal de agregar miembro desde el botón en el modal de gestión de miembros
document.querySelector('#membersModal button.bg-indigo-600').addEventListener('click', function() {
    document.getElementById('addMemberModal').classList.remove('hidden');
});

function verMiembro(id) {
  let member = null;
  // Buscar en allMembers si está cargado, si no, buscar en Firestore
  if (typeof allMembers !== 'undefined' && Array.isArray(allMembers)) {
    member = allMembers.find(m => m.id === id);
  }
  if (!member) {
    // Buscar en Firestore si no está en allMembers
    getDocs(query(collection(db, "usuarios"))).then(snapshot => {
      snapshot.forEach(doc => {
        if (doc.id === id) {
          const data = doc.data();
          member = {
            id: doc.id,
            UID: data.uid || doc.id, // <-- Agregar UID
            Nombre: data.Nombre || "Sin nombre",
            Apellido: data.Apellido || "",
            Email: data.Email || "Sin email",
            Telefono: data.Telefono || "Sin teléfono",
            Tipo: data.Tipo || "Básica",
            SuscripcionHasta: data.SuscripcionHasta ? data.SuscripcionHasta.toDate() : new Date(),
            Creado: data.Creado ? data.Creado.toDate() : new Date(),
            Genero: data.Genero || "",
            rol: data.rol || "cliente"
          };
        }
      });
      if (member) mostrarModalVerMiembro(member);
    });
  } else {
    mostrarModalVerMiembro(member);
  }
}

function mostrarModalVerMiembro(member) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
      <button class="absolute top-2 right-2 text-gray-500 hover:text-gray-700" id="closeViewModal"><i class="fas fa-times"></i></button>
      <h3 class="text-xl font-semibold mb-4">Detalle del Miembro</h3>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">UID</label>
        <div class="text-xs text-gray-500">${member.UID || member.id}</div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <div class="text-gray-900">${member.Nombre}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
          <div class="text-gray-900">${member.Apellido}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
          <div class="text-gray-900">${member.Email}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <div class="text-gray-900">${member.Telefono}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Membresía</label>
          <div class="text-gray-900">${member.Tipo}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
          <div class="text-gray-900">${member.Creado ? new Date(member.Creado).toLocaleDateString('es-ES') : ''}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
          <div class="text-gray-900">${member.SuscripcionHasta ? new Date(member.SuscripcionHasta).toLocaleDateString('es-ES') : ''}</div>
        </div>
      </div>
      <div class="mt-8 flex justify-end">
        <button type="button" id="closeViewMember" class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cerrar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('closeViewModal').onclick = () => modal.remove();
  document.getElementById('closeViewMember').onclick = () => modal.remove();
}
window.verMiembro = verMiembro;

// Funcionalidad para abrir el modal de Reportes
document.querySelector('a[href="#"]:has(i.fa-chart-bar)').addEventListener('click', function(e) {
    e.preventDefault();
    mostrarModalGenerico('Reportes', '');
});

// Sidebar móvil: abrir modal de Miembros
document.getElementById('mobileMiembros').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('membersModal').classList.remove('hidden');
  cargarMiembrosModal();
  document.getElementById('sidebar').classList.add('-translate-x-full');
  setTimeout(() => {
    document.getElementById('mobileSidebar').classList.add('hidden');
    document.body.style.overflow = '';
  }, 300);
});

// Sidebar móvil: abrir modal de Membresías
document.getElementById('mobileMembresias').addEventListener('click', function(e) {
  e.preventDefault();
  mostrarModalMembresias();
  document.getElementById('sidebar').classList.add('-translate-x-full');
  setTimeout(() => {
    document.getElementById('mobileSidebar').classList.add('hidden');
    document.body.style.overflow = '';
  }, 300);
});

// Sidebar móvil: abrir modal de Asistencias
document.getElementById('mobileAsistencia').addEventListener('click', function(e) {
  e.preventDefault();
  mostrarModalAsistencias();
  document.getElementById('sidebar').classList.add('-translate-x-full');
  setTimeout(() => {
    document.getElementById('mobileSidebar').classList.add('hidden');
    document.body.style.overflow = '';
  }, 300);
});

// Sidebar móvil: abrir modal de Reportes
document.getElementById('mobileReportes').addEventListener('click', function(e) {
  e.preventDefault();
  mostrarModalGenerico('Reportes', '');
  document.getElementById('sidebar').classList.add('-translate-x-full');
  setTimeout(() => {
    document.getElementById('mobileSidebar').classList.add('hidden');
    document.body.style.overflow = '';
  }, 300);
});



  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
  import { 
    getFirestore, collection, getDocs, query, orderBy, limit, addDoc, Timestamp, doc, getDoc, where
  } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
  import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

  const firebaseConfig = {
     apiKey: "AIzaSyBE7XnFDoaC7qPY8nykIGI-SCCMM6P_iG0",
            authDomain: "gymrats-d16eb.firebaseapp.com",
            projectId: "gymrats-d16eb",
            storageBucket: "gymrats-d16eb.appspot.com",
            messagingSenderId: "106526343668278361492",
            appId: "1:106526343668278361492:web:abcd1234efgh5678"
        
  };

  const app = initializeApp(firebaseConfig);66
  const db = getFirestore(app);
  const auth = getAuth(app);

  let conteoTipos = { Basica: 0, Estandar: 0, Premium: 0, VIP: 0 };

  // --- Guardia de Autenticación y Roles ---
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Usuario autenticado, ahora verificamos su rol
      const userDocRef = doc(db, "usuarios", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().rol === 'administrador') {
        // El usuario es administrador, puede quedarse.
        console.log("Acceso de administrador concedido.");
        cargarUsuarios(); // Cargar los datos del dashboard

        // Actualizar UI con datos del usuario
        const userNameSpan = document.getElementById('userName');
        const userAvatarImg = document.getElementById('userAvatar');
        if (userNameSpan) {
            userNameSpan.textContent = user.displayName || user.email.split('@')[0];
        }
        if (userAvatarImg && user.photoURL) {
            userAvatarImg.src = user.photoURL;
        }

      } else {
        // No es administrador o no tiene documento, lo expulsamos.
        console.log("Acceso denegado. El usuario no es administrador.");
        window.location.href = 'index.html';
      }
    } else {
      // No hay usuario, lo expulsamos.
      console.log("Usuario no autenticado, redirigiendo a login.");
      window.location.href = 'index.html';
    }
  });

  // --- Funcionalidad de Cerrar Sesión ---
  document.getElementById('logoutButton').addEventListener('click', (e) => {
    e.preventDefault();
    signOut(auth).catch(error => console.error('Error al cerrar sesión:', error));
  });

  async function sincronizarEstadosDeMembresia() {
    try {
        const usuariosSnap = await getDocs(collection(db, 'usuarios'));
        
        const promesas = [];
        usuariosSnap.forEach(doc => {
            const data = doc.data();
            if (data.uid && data.SuscripcionHasta) {
                promesas.push(actualizarEstadoActivoEnRTDB(data.uid, data.SuscripcionHasta));
            }
        });
        
        await Promise.all(promesas);
    } catch (error) {
        console.error("Error durante la sincronización de estados de membresía:", error);
    }
  }

  async function cargarUsuarios() {
    try {
        // Obtener los costos de las suscripciones para calcular ingresos
        const costosSubscripcion = {};
        const subsSnap = await getDocs(collection(db, 'subscripciones'));
        subsSnap.forEach(doc => {
            const data = doc.data();
            costosSubscripcion[data.nombre] = data.costo || 0;
        });

        const allSnapshot = await getDocs(collection(db, "usuarios"));
        const q = query(collection(db, "usuarios"), orderBy("Creado", "desc"), limit(5));
        const snapshot = await getDocs(q);
        const miembrosTableBody = document.querySelector('tbody');
        const actividadReciente = document.querySelector('.space-y-4');
        cuentasTotales = allSnapshot.size;
        let membresiasActivas = 0;
        let ingresosMensuales = 0;
        let membresiasPorVencer = 0;
        const hoy = new Date();
        const ochoDiasDespues = new Date();
        ochoDiasDespues.setDate(hoy.getDate() + 8);
        
        // Calcular ingresos del mes actual desde la colección 'pagos'
        const inicioMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1, 0, 0, 0);
        const finMesActual = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59);
        const pagosQuery = query(collection(db, "pagos"), where("Fecha", ">=", Timestamp.fromDate(inicioMesActual)), where("Fecha", "<=", Timestamp.fromDate(finMesActual)));
        const pagosSnapshot = await getDocs(pagosQuery);
        pagosSnapshot.forEach(doc => {
            ingresosMensuales += doc.data().Monto || 0;
        });

        // Contar membresías activas y por vencer
        allSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.SuscripcionHasta) {
                const fechaFin = data.SuscripcionHasta.toDate();
                if (fechaFin >= hoy) {
                    membresiasActivas++;
                    // Comprobar si vence en los próximos 8 días
                    if (fechaFin <= ochoDiasDespues) {
                        membresiasPorVencer++;
                    }
                }
            }
        });

        // Actualizar contadores
        animateValue(document.getElementById('totalAccounts'), 0, cuentasTotales, 1500);
        animateValue(document.getElementById('activeMemberships'), 0, membresiasActivas, 1500);
        animateValue(document.getElementById('expiringSoon'), 0, membresiasPorVencer, 1500);
        animateValue(document.getElementById('monthlyRevenue'), 0, ingresosMensuales, 1500);
        // Reiniciar conteo de tipos de membresía
        conteoTipos = { Basica: 0, Estandar: 0, Premium: 0, VIP: 0 };

        // Procesar todos los usuarios para el conteo
        allSnapshot.forEach((doc) => {
            const data = doc.data();
            let tipo = (data.Tipo || "Basica").toLowerCase();
            if (tipo.includes("básica") || tipo.includes("basica")) tipo = "Basica";
            else if (tipo.includes("estándar") || tipo.includes("estandar")) tipo = "Estandar";
            else if (tipo.includes("premium")) tipo = "Premium";
            else if (tipo.includes("vip")) tipo = "VIP";
            
            if (conteoTipos.hasOwnProperty(tipo)) {
                conteoTipos[tipo]++;
            }
        });

        // Actualizar tabla de últimos miembros
        miembrosTableBody.innerHTML = '';
        snapshot.forEach((doc) => {
            const data = doc.data();
            const fechaFin = data.SuscripcionHasta.toDate();
            const fechaInicio = data.Creado.toDate();
            const estado = fechaFin >= new Date() ? 'Activa' : 'Expirada';
            const estadoClass = estado === 'Activa' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
            
            miembrosTableBody.innerHTML += `
                <tr class="fade-in">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10">
                                <img class="h-10 w-10 rounded-full" src="https://i.pravatar.cc/40?u=${doc.id}" alt="">
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${data.Nombre} ${data.Apellido || ''}</div>
                                <div class="text-sm text-gray-500">${data.Email || 'Sin email'}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${data.Tipo || 'Básica'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${fechaInicio.toLocaleDateString('es-ES')}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${fechaFin.toLocaleDateString('es-ES')}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${estadoClass}">
                            ${estado}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <button onclick="verMiembro('${doc.id}')" class="text-indigo-600 hover:text-indigo-900"><i class="fas fa-eye"></i></button>
                    </td>
                </tr>
            `;
        });

        // Actualizar actividad reciente
        actividadReciente.innerHTML = '';
        snapshot.forEach((doc) => {
            const data = doc.data();
            const fechaInicio = data.Creado.toDate();
            let tipo = (data.Tipo || "Basica");
            
            actividadReciente.innerHTML += `
                <div class="flex items-start">
                    <div class="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                        <i class="fas fa-user-plus"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium">Nuevo miembro registrado</p>
                        <p class="text-xs text-gray-500">${data.Nombre} ${data.Apellido || ''} ha adquirido la membresía ${tipo}</p>
                        <p class="text-xs text-gray-400 mt-1">${fechaInicio.toLocaleString('es-ES')}</p>
                    </div>
                </div>
            `;
        });

        // Actualizar la gráfica
        actualizarGraficoMembresias();
        
    } catch (err) {
        console.error("Error al cargar usuarios:", err);
        document.getElementById('totalAccounts').textContent = '0';
        document.getElementById('activeMemberships').textContent = '0';
        document.getElementById('expiringSoon').textContent = '0';
        document.getElementById('monthlyRevenue').textContent = '0';
    }
  }

  function actualizarGraficoMembresias() {
    // Asegura que los datos sean números y no undefined
    membershipChart.data.datasets[0].data = [
      conteoTipos.Basica || 0,
      conteoTipos.Estandar || 0,
      conteoTipos.Premium || 0,
      conteoTipos.VIP || 0
    ];
    membershipChart.update();
  }

  // Abrir el sidebar móvil al pulsar el botón de menú
  document.getElementById('sidebarToggle').addEventListener('click', function() {
    document.getElementById('mobileSidebar').classList.remove('hidden');
    document.getElementById('sidebar').classList.remove('-translate-x-full');
    // Permitir scroll bloqueado en fondo
    document.body.style.overflow = 'hidden';
  });

  // Cerrar el sidebar móvil al pulsar el botón de cerrar
  document.getElementById('closeSidebar').addEventListener('click', function() {
    document.getElementById('sidebar').classList.add('-translate-x-full');
    setTimeout(() => {
      document.getElementById('mobileSidebar').classList.add('hidden');
      document.body.style.overflow = '';
    }, 300);
  });

  // Cerrar el sidebar móvil al pulsar fuera del panel
  document.getElementById('mobileSidebar').addEventListener('click', function(e) {
    if (e.target === this) {
      document.getElementById('sidebar').classList.add('-translate-x-full');
      setTimeout(() => {
        document.getElementById('mobileSidebar').classList.add('hidden');
        document.body.style.overflow = '';
      }, 300);
    }
  });

  document.getElementById('userMenuButton').addEventListener('click', function() {
    document.getElementById('userMenu').classList.toggle('hidden');
  });

  window.addEventListener('click', function(e) {
    if (!e.target.closest('#userMenuButton') && !e.target.closest('#userMenu')) {
      document.getElementById('userMenu').classList.add('hidden');
    }
  });

  document.getElementById('closeModal').addEventListener('click', function() {
    document.getElementById('addMemberModal').classList.add('hidden');
  });

  const membershipCtx = document.getElementById('membershipChart').getContext('2d');
  const membershipChart = new Chart(membershipCtx, {
      type: 'doughnut',
      data: {
          labels: ['Básica', 'Estándar', 'Premium', 'VIP'],
          datasets: [{
              data: [0, 0, 0, 0],
              backgroundColor: [
                  '#3B82F6',
                  '#10B981',
                  '#F59E0B',
                  '#8B5CF6'
              ],
              borderWidth: 0
          }]
      },
      options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
              legend: {
                  position: 'right',
              },
              tooltip: {
                  callbacks: {
                      label: function(context) {
                          let label = context.label || '';
                          if (label) {
                              label += ': ';
                          }
                          label += context.raw + ' miembros';
                          return label;
                      }
                  }
              }
          },
          cutout: '70%'
      }
  });

  async function guardarNuevoMiembro() {
    const form = document.querySelector('#addMemberModal form');
    const uidManual = form.querySelector('#nuevoMiembroUID')?.value.trim();
    const nombre = form.querySelector('input[type="text"]:nth-of-type(1)')?.value.trim();
    const apellido = form.querySelectorAll('input[type="text"]')[1]?.value.trim() || "";
    const email = form.querySelector('input[type="email"]')?.value.trim().toLowerCase();
    const telefono = form.querySelector('input[type="tel"]')?.value.trim();
    const tipoSelect = form.querySelector('#tipoMembresia')?.value;
    const rol = form.querySelector('#nuevoMiembroRol')?.value || "cliente";
    let tipo = "Basica";
    if (tipoSelect.includes('Básica') || tipoSelect.includes('basica')) tipo = "Basica";
    else if (tipoSelect.includes('Estándar') || tipoSelect.includes('Estandar')) tipo = "Estandar";
    else if (tipoSelect.includes('Premium')) tipo = "premium";
    else if (tipoSelect.includes('VIP')) tipo = "VIP";
    const genero = form.querySelector('#Genero')?.value || "Masculino";    
    const fechaInicio = form.querySelector('input[type="date"]')?.value;
    if (!nombre || !email || !fechaInicio || !uidManual) {
      alert('Por favor complete los campos obligatorios: Nombre, Email, Fecha de Inicio y UID');
      return;
    }
    try {
      const fechaFin = new Date(fechaInicio);
      if (tipo === 'Estandar') fechaFin.setMonth(fechaFin.getMonth() + 3);
      else if (tipo === 'Premium') fechaFin.setMonth(fechaFin.getMonth() + 6);
      else if (tipo === 'VIP') fechaFin.setMonth(fechaFin.getMonth() + 12);
      else fechaFin.setMonth(fechaFin.getMonth() + 1);
      const docRef = await addDoc(collection(db,"usuarios"), {
        Nombre: nombre,
        Apellido: apellido,
        Email: email,
        Telefono: telefono,
        Tipo: tipo,
        Genero: genero,
        Creado: Timestamp.fromDate(new Date(fechaInicio)),
        SuscripcionHasta: Timestamp.fromDate(fechaFin),
        rol: rol, // Guardar el rol
        uid: uidManual // Usar el UID manual
      });
      await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js').then(async ({ updateDoc, doc }) => {
        await updateDoc(doc(db, "usuarios", docRef.id), { uid: uidManual });
      });
      await actualizarEstadoActivoEnRTDB(uidManual, fechaFin);
      alert('Miembro guardado exitosamente');
      document.getElementById('addMemberModal').classList.add('hidden');
      cargarMiembrosModal();
      cargarUsuarios();
      form.reset();
    } catch (err) {
      
    }
  }
  window.guardarNuevoMiembro = guardarNuevoMiembro;

  function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  window.db = db;
  window.query = query;
  window.collection = collection;
  window.getDocs = getDocs;
  window.orderBy = orderBy;
  window.addDoc = addDoc;