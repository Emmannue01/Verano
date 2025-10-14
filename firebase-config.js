import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBE7XnFDoaC7qPY8nykIGI-SCCMM6P_iG0",
    authDomain: "gymrats-d16eb.firebaseapp.com",
    projectId: "gymrats-d16eb",
    storageBucket: "gymrats-d16eb.appspot.com",
    messagingSenderId: "106526343668278361492",
    appId: "1:106526343668278361492:web:abcd1234efgh5678"
};

// Inicializar Firebase y exportar servicios
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const dbRTDB = getDatabase(app);

export { db, auth, storage, dbRTDB, app, firebaseConfig };