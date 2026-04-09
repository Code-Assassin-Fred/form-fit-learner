import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC3fMLM4DprNcev4YYuYDj41CqKcdli84g",
  authDomain: "form-fit-learner-c8f18.firebaseapp.com",
  projectId: "form-fit-learner-c8f18",
  storageBucket: "form-fit-learner-c8f18.firebasestorage.app",
  messagingSenderId: "458450081375",
  appId: "1:458450081375:web:d0ac9a2b6c99bedb3cadea",
  measurementId: "G-VY0QPFMG0X"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
