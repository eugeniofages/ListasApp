// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC2JE9X_avH52Snd4gWmTtjtdep2qT9y7k",
    authDomain: "lista-de-tareas-9f5c5.firebaseapp.com",
    projectId: "lista-de-tareas-9f5c5",
    storageBucket: "lista-de-tareas-9f5c5.appspot.com",
    messagingSenderId: "988464040686",
    appId: "1:988464040686:web:cde4b1724eed15ac5881ff"
  };

const app = initializeApp(firebaseConfig);
getAuth().settings.appVerificationDisabledForTesting = true;

const auth = getAuth(app);
export { auth };
