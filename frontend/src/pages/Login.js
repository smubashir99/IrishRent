import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

// Login page with JWT authentication
// Ref: https://react.dev/reference/react/useState
// Note: This component uses the useAuth hook to access the login function from the AuthContext. When the form is submitted, 
// it calls the login function with the email and password. If the login is successful, it shows a success toast and navigates 
// to the dashboard. If there is an error, it shows an error toast with the message from the backend (if available) or a generic 
// 'Login failed' message. The form also has a loading state to disable the button while the login request is in progress.
const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
// Handle input changes — update formData state
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
// Handle form submission — call login function from AuthContext
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(formData.email, formData.password);
            toast.success(`Welcome back, ${user.name}!`);
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };
// Note: The form has two input fields for email and password, which are controlled components. The value of each input is
    return (
        <div className="auth-container">
            <h2>🏠 Welcome Back</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            {/* Demo accounts */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Demo Accounts:</p>
                <p style={{ fontSize: '0.85rem' }}>🏠 Landlord: john@landlord.ie / Landlord123!</p>
                <p style={{ fontSize: '0.85rem' }}>👤 Tenant: mubashir@tenant.ie / Tenant123!</p>
            </div>

            <div className="auth-link">
                <p>Don't have an account? <Link to="/register">Register here</Link></p>
            </div>
        </div>
    );
};

export default Login;