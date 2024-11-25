
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBkN44FbRAPJGeRDsDkTJ5HQwwkj-4dC5A",
  authDomain: "warplane-3a99e.firebaseapp.com",
  projectId: "warplane-3a99e",
  storageBucket: "warplane-3a99e.firebasestorage.app",
  messagingSenderId: "306953737961",
  appId: "1:306953737961:web:7939113df50f2511048278"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);