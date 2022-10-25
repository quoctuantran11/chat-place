import { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { ref, onValue, set, onDisconnect, push, serverTimestamp } from 'firebase/database';

const UserAuthContext = createContext();

function UserAuthProvider({ children }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loggedUser, setLoggedUser] = useState(null);

    useEffect(() => {
        const unsubcribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setAuthenticated(true);
                setLoading(false);
                setLoggedUser(currentUser);
                let username = currentUser.displayName;

                const usernameRef = ref(db, `users/${username}/connections`);
                const lastOnlineRef = ref(db, `users/${username}/lastOnline`);
                const connectedRef = ref(db, '.info/connected');

                onValue(connectedRef, (snap) => {
                    if (snap.val() === true) {
                        const con = push(usernameRef);

                        onDisconnect(con).remove();

                        set(con, true);

                        onDisconnect(lastOnlineRef).set(serverTimestamp());
                    }
                })
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

    const value = {
        authenticated,
        setAuthenticated,
        loading,
        setLoading,
        loggedUser
    }

    return (
        <UserAuthContext.Provider value={value}>
            {children}
        </UserAuthContext.Provider>
    )
}

function useAuth() {
    const context = useContext(UserAuthContext)
    if (context === undefined) throw new Error("useAuth must be used within a AuthProvider")

    return context;
}

export { UserAuthProvider, useAuth }