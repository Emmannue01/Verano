// Importaciones de Firebase
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
        import { 
            getAuth, 
            onAuthStateChanged,
            GoogleAuthProvider,
            signInWithPopup
        } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
        import { 
            getFirestore, 
            doc, 
            getDoc, 
            query, 
            collection, 
            where,
            getDocs,
            writeBatch,
            setDoc,
            Timestamp
        } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

        
  const firebaseConfig = {
      // IMPORTANTE: Asegúrate de que esta configuración sea la correcta de tu proyecto
      apiKey: "AIzaSyBE7XnFDoaC7qPY8nykIGI-SCCMM6P_iG0", 
      authDomain: "gymrats-d16eb.firebaseapp.com",
      projectId: "gymrats-d16eb",
      storageBucket: "gymrats-d16eb.appspot.com",
      messagingSenderId: "106526343668278361492",
      appId: "1:106526343668278361492:web:abcd1234efgh5678"
  };

        // Inicializar Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        // Obtener elementos del DOM
        const googleLoginBtn = document.getElementById('googleLoginBtn');

        // Función para manejar el estado de carga de los botones
        const setLoading = (isLoading) => {
            if (isLoading) {
                googleLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Cargando...';
                googleLoginBtn.disabled = true;
            } else {
                googleLoginBtn.innerHTML = '<img class="w-5 h-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo"> Ingresar con Google';
                googleLoginBtn.disabled = false;
            }
        };

        // Función para mostrar errores
        const showError = (message) => {
            alert(message);
        };

        // Observador del estado de autenticación: redirige si el usuario ya está logueado
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Usuario autenticado, ahora verificamos su rol en Firestore
                setLoading(true); // Mostrar spinner mientras se verifica
                try {
                    let userData;
                    let userDoc;

                    // 1. Buscar por email primero, es el caso más común para migrar.
                    if (user.email) {
                        const userEmail = user.email.toLowerCase();
                        console.log(`Buscando usuario por email: ${userEmail}`);
                        const q = query(collection(db, "usuarios"), where("Email", "==", userEmail));
                        const querySnapshot = await getDocs(q);

                        if (!querySnapshot.empty) {
                            // 1a. Encontrado por email.
                            const foundDoc = querySnapshot.docs[0];
                            console.log(`Usuario encontrado por email con doc ID: ${foundDoc.id}.`);

                            // Si el ID del documento no es el UID de Auth, migrarlo.
                            if (foundDoc.id !== user.uid) {
                                console.log(`El ID del documento (${foundDoc.id}) no coincide con el UID de Auth (${user.uid}). Migrando...`);
                                const batch = writeBatch(db);
                                const oldData = foundDoc.data();
                                const newUserDocRef = doc(db, "usuarios", user.uid);

                                batch.set(newUserDocRef, { ...oldData, uid: user.uid, Email: userEmail });
                                batch.delete(foundDoc.ref);
                                await batch.commit();
                                
                                userDoc = await getDoc(newUserDocRef);
                                console.log("Migración completada.");
                            } else {
                                // El ID del documento ya es el UID de Auth, todo correcto.
                                userDoc = foundDoc;
                            }
                            userData = userDoc.data();
                        }
                    }

                    // 2. Si no se encontró por email, buscar por UID como fallback.
                    if (!userData) {
                        console.log("No se encontró por email, buscando por UID...");
                        const userDocRef = doc(db, "usuarios", user.uid);
                        userDoc = await getDoc(userDocRef);

                        if (userDoc.exists()) {
                            console.log(`Usuario encontrado por UID (${user.uid}).`);
                            userData = userDoc.data();
                        }
                    }

                    // 3. Si no se encontró por ningún método, es un usuario nuevo.
                    if (!userData) {
                        console.log("Usuario no encontrado. Creando nuevo registro de cliente.");
                        const userEmail = user.email.toLowerCase();
                        const userDocRef = doc(db, "usuarios", user.uid);
                        const fechaInicio = new Date();
                        const fechaFin = new Date();
                        fechaFin.setMonth(fechaFin.getMonth()); // Membresía de 1 mes por defecto

                        const newUser = {
                            uid: '',
                            Nombre: user.displayName ? user.displayName.split(' ')[0] : 'Nuevo',
                            Apellido: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : 'Usuario',
                            Email: userEmail,
                            rol: 'cliente',
                            Tipo: 'Basica',
                            Creado: Timestamp.fromDate(fechaInicio),
                            SuscripcionHasta: Timestamp.fromDate(fechaFin),
                            Telefono: '',
                            Genero: 'Otro'
                        };
                        
                        await setDoc(userDocRef, newUser);
                        userData = newUser;
                        console.log("Nuevo cliente creado exitosamente.");
                    }

                    if (userData) {
                        const userRole = userData.rol || 'cliente';
                        console.log(`Usuario autenticado con rol: ${userRole}`);
                        switch (userRole) {
                            case 'administrador': window.location.href = 'dashboard.html'; break;
                            case 'recepcion': window.location.href = 'recepcion.html'; break;
                            case 'entrenador': window.location.href = 'entrenadores.html'; break;
                            default: window.location.href = 'usuarios.html'; break;
                        }
                    } else {
                        console.log("No se pudieron obtener los datos del usuario. Redirigiendo a portal de cliente.");
                        window.location.href = 'usuarios.html';
                    }
                } catch (error) {
                    console.error("Error al obtener o migrar el rol del usuario:", error);
                    showError("No se pudo verificar tu rol. Intenta de nuevo.");
                    // Opcional: cerrar sesión si hay un error crítico
                    // auth.signOut();
                    setLoading(false);
                }
            } else {
                console.log('No hay usuario autenticado.');
            }
        });

        // Evento para el inicio de sesión con Google
        googleLoginBtn.addEventListener('click', async () => {
            const provider = new GoogleAuthProvider();
            setLoading(true);
            try {
                await signInWithPopup(auth, provider);
                // La redirección la maneja onAuthStateChanged
            } catch (error) {
                // Mejoramos el log para ver el error específico de Firebase
                console.error("--- ERROR DE AUTENTICACIÓN CON GOOGLE ---");
                console.error("Código:", error.code);
                console.error("Mensaje:", error.message);
                console.error("Objeto de error completo:", error);
                console.error("-----------------------------------------");

                // Damos un mensaje más útil al usuario
                let friendlyMessage = 'No se pudo iniciar sesión con Google. Revisa la consola para más detalles.';
                if (error.code === 'auth/popup-closed-by-user') {
                    friendlyMessage = 'La ventana de inicio de sesión fue cerrada antes de completar el proceso.';
                } else if (error.code) {
                    friendlyMessage = `Error: ${error.code}. Revisa la consola para más detalles.`;
                }
                showError(friendlyMessage);
            } finally {
                setLoading(false);
            }
        });