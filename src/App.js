import React from "react";
import Header from './components/Header';
import Footer from './components/Footer';
import ChatRoute from "./routes/ChatRoute";

function App() {
    return (
        <div className="App">
            <>
            <Header />
            <ChatRoute />
            <Footer />
            </>
        </div>
    );
}

export default App;