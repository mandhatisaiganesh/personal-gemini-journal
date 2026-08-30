import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDIT4vXsABbKHRgRXToN2cPB5TcRaiBfVg",
  authDomain: "ai-bootcamp-481708.firebaseapp.com",
  projectId: "ai-bootcamp-481708",
  storageBucket: "ai-bootcamp-481708.firebasestorage.app",
  messagingSenderId: "865460239766",
  appId: "1:865460239766:web:2afcb33e2c7c2ccbdfb1b7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Enable custom database ID support
export const db = getFirestore(app, "ai-studio-a2374323-659e-490a-b95a-3dfe8bd1f9d7");
