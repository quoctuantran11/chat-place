import React from "react";
import ChatRoute from "./routes/ChatRoute";
import { UserAuthProvider } from './context/authContext';

function App() {
    return (
        <div className="App">
            <UserAuthProvider>
                <ChatRoute />
            </UserAuthProvider>
        </div>
    );
}

export default App;