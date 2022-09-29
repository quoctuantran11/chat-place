import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { userAuthContext, UserAuthProvider } from '../context/authContext';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Chat from '../pages/Chat';
import { useContext } from 'react';

function PrivateRoute({ element: Component, authenticated }) {
    return (
        authenticated ? <Component /> :
            <Navigate to="/login" replace={true} />
    )
}

function PublicRoute({ element: Component, authenticated }) {
    return (
        !authenticated ? <Component /> :
            <Navigate to="/chat" replace={true} />
    )
}

export default function ChatRoute() {
    const {authenticated, setAuthenticated, loading, setLoading} = useContext(userAuthContext);
    return (
        <Router>
            <UserAuthProvider>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/chat" element ={<PrivateRoute authenticated={authenticated} element={Chat} />} />
                    <Route path="/login" element={<PublicRoute authenticated={authenticated} element={Login} />} />
                    <Route path="/register" element={<PublicRoute authenticated={authenticated} element={Login} />} />
                </Routes>
            </UserAuthProvider>
        </Router>
    )
};