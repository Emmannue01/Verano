
        // Mobile menu toggle
        document.getElementById('mobile-menu-button').addEventListener('click', function() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
        });

        // Student modal toggle
        const classCards = document.querySelectorAll('.rounded-r-lg');
        const studentModal = document.getElementById('student-modal');
        const closeModal = document.getElementById('close-modal');

        // Add click event to all class cards to open modal
        classCards.forEach(card => {
            card.addEventListener('click', function(e) {
                // Don't open modal if clicking on edit/delete buttons
                if (!e.target.closest('button')) {
                    studentModal.classList.remove('hidden');
                }
            });
        });

        // Close modal when clicking X button
        closeModal.addEventListener('click', function() {
            studentModal.classList.add('hidden');
        });

        // Close modal when clicking outside
        studentModal.addEventListener('click', function(e) {
            if (e.target === studentModal) {
                studentModal.classList.add('hidden');
            }
        });

        // Filter functionality (example)
        document.querySelectorAll('select, input[type="date"]').forEach(element => {
            element.addEventListener('change', function() {
                // In a real app, this would filter the classes
                console.log('Filtering classes...');
            });
        });

        // Animation for cards
        document.addEventListener('DOMContentLoaded', function() {
            const cards = document.querySelectorAll('.fade-in');
            cards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
            });
        });
        
        type="module"
		import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
		import { 
			getFirestore, doc, getDoc
		} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
		import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

		// --- Guardia de Autenticación y Roles para Entrenador ---
		onAuthStateChanged(auth, async (user) => {
			if (user) {
				// Usuario autenticado, ahora verificamos su rol
				const userDocRef = doc(db, "usuarios", user.uid);
				const userDoc = await getDoc(userDocRef);

				// Permite el acceso si el rol es 'entrenador' O 'administrador'
				if (userDoc.exists() && (userDoc.data().rol === 'entrenador' || userDoc.data().rol === 'administrador')) {
					console.log("Acceso de entrenador concedido.");
					
					// --- Importar datos del perfil de Google ---
					const userNameEl = document.getElementById('userName');
					const userAvatarEl = document.getElementById('userAvatar');
					const mobileUserNameEl = document.getElementById('mobileUserName');
					const mobileUserAvatarEl = document.getElementById('mobileUserAvatar');
					
					const displayName = user.displayName || user.email.split('@')[0];
					const photoURL = user.photoURL || `https://i.pravatar.cc/40?u=${user.uid}`;

					if (userNameEl) userNameEl.textContent = displayName;
					if (userAvatarEl) userAvatarEl.src = photoURL;
					if (mobileUserNameEl) mobileUserNameEl.textContent = displayName;
					if (mobileUserAvatarEl) mobileUserAvatarEl.src = photoURL;

				} else {
					console.log("Acceso denegado. El usuario no tiene rol de entrenador.");
					window.location.href = 'index.html';
				}
			} else {
				console.log("Usuario no autenticado, redirigiendo a login.");
				window.location.href = 'index.html';
			}
		});

		// --- Funcionalidad del Menú de Usuario ---
		const userMenuButton = document.getElementById('userMenuButton');
		const userMenu = document.getElementById('userMenu');

		userMenuButton.addEventListener('click', () => {
			userMenu.classList.toggle('hidden');
		});

		// Cerrar el menú si se hace clic fuera
		window.addEventListener('click', (e) => {
			if (userMenuButton && userMenu && !userMenuButton.contains(e.target) && !userMenu.contains(e.target)) {
				userMenu.classList.add('hidden');
			}
		});

		// --- Funcionalidad de Cerrar Sesión ---
		const handleLogout = (e) => {
			e.preventDefault();
			signOut(auth).catch(error => console.error('Error al cerrar sesión:', error));
		};

		document.getElementById('logoutButton').addEventListener('click', handleLogout);
		document.getElementById('sidebarLogoutButton').addEventListener('click', handleLogout);
		document.getElementById('mobileLogoutButton').addEventListener('click', handleLogout);
	