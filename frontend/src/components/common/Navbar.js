import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

// Navbar component
const Navbar = () => {
    // Get auth state from context
    const { user, isAuthenticated, logout } = useAuth();
    //
    const navigate = useNavigate();
// Handle logout
    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/');
    };
// Note: The navbar will show different links based on whether the user is authenticated and their role 
// (landlord/admin can see "List Property" link)
    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Link to="/">🏠 IrishRent</Link>
            </div>
            <div className="nav-links">
                <Link to="/properties">Properties</Link>
                {isAuthenticated ? (
                    <>
                        <Link to="/dashboard">Dashboard</Link>
                        {(user?.role === 'landlord' || user?.role === 'admin') && (
                            <Link to="/add-property">+ List Property</Link>
                        )}
                        <button onClick={handleLogout}>Logout</button>
                        <span>Hi, {user?.name}</span>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;