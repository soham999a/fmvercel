import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA5Huc5rxx1pheN1tFq3ri_ETmN8Gag_A8",
  authDomain: "fmwebversion.firebaseapp.com",
  projectId: "fmwebversion",
  storageBucket: "fmwebversion.firebasestorage.app",
  messagingSenderId: "707870265432",
  appId: "1:707870265432:web:cde73c28e94fe78d877a2d",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
