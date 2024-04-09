import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore'; 

const firebaseConfig = {
  apiKey: "AIzaSyA5DfzhWiBKeheokGzJB2pnNy-mHfEs2zM",
  authDomain: "cartoon-f49d5.firebaseapp.com",
  databaseURL: "https://cartoon-f49d5-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cartoon-f49d5",
  storageBucket: "cartoon-f49d5.appspot.com",
  messagingSenderId: "353158526527",
  appId: "1:353158526527:web:f0874a858c7f733fe7ea8a",
  measurementId: "G-K1SRNJSBNT"
};

    const app = initializeApp(firebaseConfig); 
    const db = getFirestore(app); 
    const storage = getStorage(app); export { storage, db }; // ส่งออก storage และ db
