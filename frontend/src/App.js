import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddProperty from './pages/AddProperty';
import NotFound from './pages/NotFound';

// Components
import Navbar from './components/common/Navbar';
import PrivateRoute from './components/common/PrivateRoute';

import './styles/main.css';
// Note: The App component is the root of our application. It wraps everything inside the AuthProvider to provide authentication 
// context to all components. We use React Router to define our routes, including protected routes that require authentication.
// The ToastContainer is included for displaying notifications throughout the app.
function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app">
                    <Navbar />
                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/properties" element={<Properties />} />
                            <Route path="/properties/:id" element={<PropertyDetail />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/dashboard" element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            } />
                            <Route path="/add-property" element={
                                <PrivateRoute roles={['landlord', 'admin']}>
                                    <AddProperty />
                                </PrivateRoute>
                            } />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </main>
                    <ToastContainer position="top-right" autoClose={3000} />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;