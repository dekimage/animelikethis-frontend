import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCivVD9EZuETjb_7ApMrEn56zbNyg5UeBs",
  authDomain: "todos-aae9f.firebaseapp.com",
  projectId: "todos-aae9f",
  storageBucket: "todos-aae9f.appspot.com",
  messagingSenderId: "599128021132",
  appId: "1:599128021132:web:cc59d7ff101e91a06943a9",
  measurementId: "G-BDW6BJZ57K",
};

// const analytics = getAnalytics(app);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, app, db };
