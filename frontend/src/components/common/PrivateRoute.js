import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Protected route component
// Ref: https://reactrouter.com/en/main/start/concepts#protected-routes
// Usage: <PrivateRoute roles={['admin']}><AdminPage /></PrivateRoute>
const PrivateRoute = ({ children, roles }) => {
    // Get auth state from context
    const { isAuthenticated, user, loading } = useAuth();
// Show loading state while checking auth
    if (loading) return <div className="loading">Loading...</div>;
// If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
// If user doesn't have required role, redirect to home
    if (roles && !roles.includes(user?.role)) {
        return <Navigate to="/" replace />;
    }
// If authenticated and has required role, render the children components
    return children;
};
// Note: The 'roles' prop is optional. If not provided, it will only check for authentication. If provided, it will also check 
// if the user's role is included in the allowed roles.
export default PrivateRoute;