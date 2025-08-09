
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
        import { 
            getFirestore, doc, getDoc, setDoc, addDoc,
            collection, query, onSnapshot, orderBy
        } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
        import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
        import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

        const firebaseConfig = {
            // IMPORTANTE: Reemplaza este objeto completo con la configuración de tu proyecto
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

        // --- Guardia de Autenticación para Clientes ---
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Usuario autenticado, puede quedarse.
                console.log("Acceso de cliente concedido.");

                // Actualizar UI con datos del usuario
                const userNameSpan = document.getElementById('userName');
                const userAvatarImg = document.getElementById('userAvatar');
                if (userNameSpan) {
                    userNameSpan.textContent = user.displayName || user.email.split('@')[0];
                }
                if (userAvatarImg && user.photoURL) {
                    userAvatarImg.src = user.photoURL;
                }

                // Cargar datos específicos del cliente desde Firestore
                try {
                    const userDocRef = doc(db, "usuarios", user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const welcomeMessage = document.getElementById('welcomeMessage');
                        const membershipStatus = document.getElementById('membershipStatus');
                        const membershipPlan = document.getElementById('membershipPlan');

                        welcomeMessage.textContent = `¡Bienvenido de nuevo, ${userData.Nombre || 'Usuario'}!`;
                        
                        if (userData.SuscripcionHasta) {
                            const fechaFin = userData.SuscripcionHasta.toDate();
                            membershipStatus.textContent = `Tu membresía está activa hasta el ${fechaFin.toLocaleDateString('es-ES')}`;
                        }
                        membershipPlan.textContent = `Plan: ${userData.Tipo || 'Básico'}`;

                        // El UID para las lecturas es el que está guardado en el documento (el manual),
                        // no necesariamente el UID de autenticación de Google.
                        const checkinUid = userData.uid || user.uid;
                        inicializarProgreso(checkinUid);
                        inicializarMetricas(checkinUid);
                    }
                } catch (error) {
                    console.error("Error al cargar datos del usuario:", error);
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

        // --- Funcionalidad del Dropdown de Perfil ---
        const profileBtn = document.getElementById('profileBtn');
        const profileDropdown = document.getElementById('profileDropdown');

        profileBtn.addEventListener('click', () => {
            profileDropdown.classList.toggle('hidden');
        });

        // Cerrar el dropdown si se hace clic fuera de él
        window.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.add('hidden');
            }
        });

        // --- Lógica para la tarjeta de Progreso ---
        function inicializarProgreso(uid) {
            const decreaseGoalBtn = document.getElementById('decreaseGoal');
            const increaseGoalBtn = document.getElementById('increaseGoal');
            const goalValueEl = document.getElementById('goalValue');
            const goalUnitEl = document.getElementById('goalUnit');
            const progressTextEl = document.getElementById('progressText');
            const progressPercentageEl = document.getElementById('progressPercentage');
            const progressBarEl = document.getElementById('progressBar');
            const progressCircleEl = document.getElementById('progressCircle');
            const progressLoader = document.getElementById('progressLoader');
            const progressContent = document.getElementById('progressContent');

            const circleCircumference = 251.2;
            let vistaActual = 'semana';
            // Cargar metas desde el almacenamiento local o usar valores por defecto
            let metaSemanal = parseInt(localStorage.getItem(`metaSemanal_${uid}`)) || 5;
            let metaMensual = parseInt(localStorage.getItem(`metaMensual_${uid}`)) || 20;
            let allLecturasData = {}; // Almacena los datos de las lecturas en tiempo real

            const cambiarVista = (nuevaVista) => {
                vistaActual = nuevaVista;
                if (vistaActual === 'semana') {
                    vistaSemanaBtn.classList.add('bg-white', 'text-indigos-600', 'shadow');
                    vistaMesBtn.classList.remove('bg-white', 'text-indigo-600', 'shadow');
                    vistaMesBtn.classList.add('text-gray-600');
                } else {
                    vistaMesBtn.classList.add('bg-white', 'text-indigo-600', 'shadow');
                    vistaSemanaBtn.classList.remove('bg-white', 'text-indigo-600', 'shadow');
                    vistaSemanaBtn.classList.add('text-gray-600');
                }
                cargarDatosProgreso();
            };

            const ajustarMeta = (ajuste) => {
                if (vistaActual === 'semana') {
                    metaSemanal = Math.max(1, metaSemanal + ajuste);
                    localStorage.setItem(`metaSemanal_${uid}`, metaSemanal);
                } else {
                    metaMensual = Math.max(1, metaMensual + ajuste);
                    localStorage.setItem(`metaMensual_${uid}`, metaMensual);
                }
                cargarDatosProgreso(); // Recalcular y mostrar con la nueva meta
            };

            const actualizarUI = (progreso, meta) => {
                const porcentaje = meta > 0 ? Math.min(100, (progreso / meta) * 100) : 0;
                
                goalValueEl.textContent = meta;
                goalUnitEl.textContent = 'visitas';
                progressTextEl.textContent = `${progreso}/${meta}`;
                
                progressPercentageEl.textContent = `${Math.round(porcentaje)}%`;
                progressBarEl.style.width = `${porcentaje}%`;
                
                const offset = circleCircumference - (porcentaje / 100) * circleCircumference;
                progressCircleEl.style.strokeDashoffset = offset;
            };

            const cargarDatosProgreso = () => {
                progressLoader.style.display = 'flex';
                progressContent.classList.add('hidden');

                const ahora = new Date();
                let inicio, fin;
                const meta = vistaActual === 'semana' ? metaSemanal : metaMensual;

                if (vistaActual === 'semana') {
                    // Lógica de cálculo de semana corregida para mayor robustez.
                    const hoy = new Date(ahora);
                    const diaDeLaSemana = hoy.getDay(); // 0=Domingo, 1=Lunes...
                    // Calcula el día del mes para el lunes de esta semana.
                    const diaLunes = hoy.getDate() - diaDeLaSemana + (diaDeLaSemana === 0 ? -6 : 1);

                    inicio = new Date(hoy.getFullYear(), hoy.getMonth(), diaLunes, 0, 0, 0, 0);
                    fin = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + 6, 23, 59, 59, 999);
                } else { // Mes
                    inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1, 0, 0, 0, 0);
                    fin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59, 999);
                }

                let progreso = 0;
                if (allLecturasData) {
                    const registrosUsuario = Object.values(allLecturasData).filter(reg => {
                        const esUsuarioCorrecto = reg.uid === uid || reg.id === uid;
                        if (!esUsuarioCorrecto || !reg.timestamp) return false;

                        const fechaRegistro = new Date(reg.timestamp);
                        return !isNaN(fechaRegistro) && fechaRegistro >= inicio && fechaRegistro <= fin;
                    });

                    // Se cuentan las visitas completas (entrada/salida), por eso se divide entre 2.
                    progreso = Math.floor(registrosUsuario.length / 2);
                }
                actualizarUI(progreso, meta);

                progressLoader.style.display = 'none';
                progressContent.classList.remove('hidden');
                progressContent.classList.add('w-full', 'flex', 'flex-col', 'items-center');
            };

            // Se establece un listener para obtener las lecturas en tiempo real.
            const lecturasRef = ref(dbRTDB, 'lecturas');
            onValue(lecturasRef, (snapshot) => {
                allLecturasData = snapshot.val() || {};
                cargarDatosProgreso(); // Actualiza la UI cada vez que los datos cambian.
            }, (error) => {
                console.error("Error al obtener el progreso en tiempo real:", error);
                actualizarUI(0, vistaActual === 'semana' ? metaSemanal : metaMensual);
            });

            // Event Listeners
            vistaSemanaBtn.addEventListener('click', () => cambiarVista('semana'));
            vistaMesBtn.addEventListener('click', () => cambiarVista('mes'));
            increaseGoalBtn.addEventListener('click', () => ajustarMeta(1));
            decreaseGoalBtn.addEventListener('click', () => ajustarMeta(-1));

            // Carga inicial
            cambiarVista('semana');
        }

        // --- Lógica para la tarjeta de Métricas ---
        function inicializarMetricas(uid) {
            // Elementos de la tarjeta
            const metricsLoader = document.getElementById('metricsLoader');
            const metricsContent = document.getElementById('metricsContent');
            const metricsMonthEl = document.getElementById('metricsMonth');
            const pesoValorEl = document.getElementById('pesoValor');
            const pesoDiferenciaEl = document.getElementById('pesoDiferencia');
            const grasaValorEl = document.getElementById('grasaValor');
            const grasaDiferenciaEl = document.getElementById('grasaDiferencia');
            const musculoValorEl = document.getElementById('musculoValor');
            const musculoDiferenciaEl = document.getElementById('musculoDiferencia');

            // Elementos del Modal
            const metricsModal = document.getElementById('metricsModal');
            const openModalBtn = document.getElementById('actualizarMetricasBtn');
            const closeModalBtn = document.getElementById('closeMetricsModal');
            const metricsForm = document.getElementById('metricsForm');
            const inputPeso = document.getElementById('inputPeso');
            const inputGrasa = document.getElementById('inputGrasa');
            const inputMusculo = document.getElementById('inputMusculo');

            // Lógica del Modal
            openModalBtn.addEventListener('click', () => metricsModal.classList.remove('hidden'));
            closeModalBtn.addEventListener('click', () => metricsModal.classList.add('hidden'));
            window.addEventListener('click', (e) => {
                if (e.target === metricsModal) metricsModal.classList.add('hidden');
            });

            // Guardar métricas
            metricsForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const peso = parseFloat(inputPeso.value);
                const grasa = parseFloat(inputGrasa.value);
                const musculo = parseFloat(inputMusculo.value);

                if (isNaN(peso) || isNaN(grasa) || isNaN(musculo)) {
                    alert("Por favor, introduce valores numéricos válidos.");
                    return;
                }

                const metricasCollectionRef = collection(db, 'metricas', uid, 'registros');

                try {
                    await addDoc(metricasCollectionRef, { peso, grasa, musculo, timestamp: new Date() });
                    alert("Métricas actualizadas con éxito.");
                    metricsModal.classList.add('hidden');
                    metricsForm.reset();
                } catch (error) {
                    console.error("Error al guardar las métricas:", error);
                    alert("Hubo un error al guardar tus métricas. Inténtalo de nuevo.");
                }
            });

            // Cargar y mostrar métricas en tiempo real
            const metricasCollectionRef = collection(db, 'metricas', uid, 'registros');
            const q = query(metricasCollectionRef, orderBy('timestamp', 'desc'));

            onSnapshot(q, (snapshot) => {
                metricsLoader.style.display = 'none';
                metricsContent.classList.remove('hidden');

                const metricas = snapshot.docs.map(doc => doc.data());

                const datosMasRecientes = metricas.length > 0 ? metricas[0] : null;
                const datosAnteriores = metricas.length > 1 ? metricas[1] : null;

                actualizarUIMetricas(datosMasRecientes, datosAnteriores);

            }, (error) => {
                console.error("Error al cargar métricas:", error);
                metricsLoader.innerHTML = '<span class="text-red-500">Error al cargar</span>';
            });

            function actualizarUIMetricas(actual, anterior) {
                const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                if (actual && actual.timestamp) {
                    const fechaMetrica = actual.timestamp.toDate();
                    metricsMonthEl.textContent = `${meses[fechaMetrica.getMonth()]} ${fechaMetrica.getFullYear()}`;
                } else {
                    metricsMonthEl.textContent = "Sin datos";
                }

                // Función auxiliar para actualizar una métrica
                const actualizarMetricaUI = (valorEl, diffEl, valorActual, valorAnterior, unidad, esBuenoBajar) => {
                    valorEl.textContent = valorActual !== null ? `${valorActual} ${unidad}` : `-- ${unidad}`;
                    
                    if (valorActual !== null && valorAnterior !== null) {
                        const diferencia = valorActual - valorAnterior;
                        diffEl.textContent = `${diferencia >= 0 ? '+' : ''}${diferencia.toFixed(1)} ${unidad} vs registro anterior`;
                        
                        if (diferencia === 0) {
                            diffEl.className = 'text-xs text-gray-500 mt-1 text-right';
                        } else if ((esBuenoBajar && diferencia < 0) || (!esBuenoBajar && diferencia > 0)) {
                            diffEl.className = 'text-xs text-green-500 mt-1 text-right font-semibold';
                        } else {
                            diffEl.className = 'text-xs text-red-500 mt-1 text-right font-semibold';
                        }
                    } else {
                        diffEl.textContent = '-- vs registro anterior';
                        diffEl.className = 'text-xs text-gray-500 mt-1 text-right';
                    }
                };

                // Actualizar Peso
                actualizarMetricaUI(pesoValorEl, pesoDiferenciaEl, actual?.peso ?? null, anterior?.peso ?? null, 'kg', true);

                // Actualizar Grasa
                actualizarMetricaUI(grasaValorEl, grasaDiferenciaEl, actual?.grasa ?? null, anterior?.grasa ?? null, '%', true);

                // Actualizar Músculo
                actualizarMetricaUI(musculoValorEl, musculoDiferenciaEl, actual?.musculo ?? null, anterior?.musculo ?? null, 'kg', false);

                // Actualizar barras (ejemplo simple, se puede mejorar)
                document.getElementById('pesoBarra').style.width = `${Math.min(100, (actual?.peso || 0) / 1.5)}%`;
                document.getElementById('grasaBarra').style.width = `${Math.min(100, (actual?.grasa || 0) * 2)}%`;
                document.getElementById('musculoBarra').style.width = `${Math.min(100, (actual?.musculo || 0) * 2)}%`;
            }
        }
