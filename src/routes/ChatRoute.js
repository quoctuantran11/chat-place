import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Chat from '../pages/Chat';
import ErrorPage from '../pages/Error';
import Loading from '../components/Loading';

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
    const {
        authenticated, 
        loading,
    } = useAuth();
    return (
        loading ? <Loading /> : (
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/chat" element ={<PrivateRoute authenticated={authenticated} element={Chat} />} />
                    <Route path="/login" element={<PublicRoute authenticated={authenticated}
                     element={Login} />} />
                    <Route path="/register" element={<PublicRoute authenticated={authenticated} element={Login} />} />
                    <Route path="*" element={<ErrorPage />} />
                </Routes>
        </Router>
        )
    )
};