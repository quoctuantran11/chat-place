import { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";

export const userAuthContext = createContext("");

export function UserAuthProvider({children}) {
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubcribe = onAuthStateChanged(auth, (currentUser) => {
            if(currentUser) {
                setAuthenticated(true);
                setLoading(false);
            }
            else {
                setAuthenticated(false);
                setLoading(false);
            }
        });

        return () => {
            unsubcribe();
        }
    }, [])

    return(
        <userAuthContext.Provider value={{authenticated, setAuthenticated, loading, setLoading}}>
            {children}
        </userAuthContext.Provider>
    )
}