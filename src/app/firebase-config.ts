import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "__apiKey__",
  authDomain: "__authDomain__",
  projectId: "__projectId__",
  storageBucket: "__storageBucket__",
  messagingSenderId: "__messagingSenderId__",
  appId: "__appId__"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);