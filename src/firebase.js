import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBuM0lrdBP63rL_CnFyQokYkp8IY7iXdYE",
  authDomain: "animelikethis-7d0f7.firebaseapp.com",
  projectId: "animelikethis-7d0f7",
  storageBucket: "animelikethis-7d0f7.appspot.com",
  messagingSenderId: "920038781237",
  appId: "1:920038781237:web:f36d7a5b2fac0332929c7c",
  measurementId: "G-LLXLLMG111",
};

// const analytics = getAnalytics(app);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, app, db };
