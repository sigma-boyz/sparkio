import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAxFWyQVaObhihQYpDw4YasfrFuBBXiwsE",
  authDomain: "react-d8ba4.firebaseapp.com",
  projectId: "react-d8ba4",
  storageBucket: "react-d8ba4.appspot.com", 
  messagingSenderId: "23446227601",
  appId: "1:23446227601:web:acecca3092f08326c00d30",
  measurementId: "G-TH8V8WHJZF"
};

const app = initializeApp(firebaseConfig);

let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export const auth = getAuth(app);
export const db = getFirestore(app);
