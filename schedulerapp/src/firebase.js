// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBr91AFK7BDWOpYwz2pJxqD8LR_9Pls8QM",
  authDomain: "scheduler-6fd36.firebaseapp.com",
  projectId: "scheduler-6fd36",
  storageBucket: "scheduler-6fd36.appspot.com",
  messagingSenderId: "787205020024",
  appId: "1:787205020024:web:58aa940671296f902b108d",
  measurementId: "G-5T6J7RL9HS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
export { db }

export { app, analytics };