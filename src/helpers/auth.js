import { auth } from '../services/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
  } from "firebase/auth";

export function signUp(email, password) {
    return createUserWithEmailAndPassword(email, password);
}
  
export function signIn(email, password) {
    return signInWithEmailAndPassword(email, password);
}

export function signOut() {
    return signOut(auth);
}