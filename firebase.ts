// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpPdSn_Ljb6mdS_ITtdbDMUqvvYf7qVbo",
  authDomain: "glass-lab-ec5a3.firebaseapp.com",
  projectId: "glass-lab-ec5a3",
  storageBucket: "glass-lab-ec5a3.firebasestorage.app",
  messagingSenderId: "472215763539",
  appId: "1:472215763539:web:bcdaf33b2220f7b5d724a6",
  measurementId: "G-G2F9NVNRQ7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);
export { app, db, storage, database };
