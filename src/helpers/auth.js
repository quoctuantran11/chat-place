import { auth, db } from '../services/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
  } from "firebase/auth";
import { ref, set } from 'firebase/database';

export async function signUp(email, username, password) {
    try {
        var credential = await createUserWithEmailAndPassword(auth, email, password)
        
        await updateProfile(credential.user, {
            displayName: username
        })

        await set(ref(db, 'users/' + username), {
            email: email,
            username: username, 
            uid: credential.user?.uid
        })
    } catch (e) {
        console.log(e);
    }
}
  
export function signIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

export function logOut() {
    return signOut(auth);
}