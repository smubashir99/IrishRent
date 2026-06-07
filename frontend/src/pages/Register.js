import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
// Register page with JWT authentication
// Ref: https://react.dev/reference/react/useState
// Note: This component uses the useAuth hook to access the register function from the AuthContext. When the form is submitted,
const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '',
        confirmPassword: '', role: 'tenant', phone: ''
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
// Handle input changes — update formData state
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
// Handle form submission — call register function from AuthContext
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        // Note: We also check if the password is at least 6 characters long before calling the register function. 
        // If the validation fails, we show an error toast and return early without making the API call.
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        // If the validation passes, we proceed to call the register function from the AuthContext with the formData. 
        setLoading(true);
        try {
            const user = await register(formData);
            toast.success(`Welcome to IrishRent, ${user.name}!`);
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };
// Note: The form has several input fields for name, email, phone, role (tenant or landlord), password, and confirm password.
    return (
        <div className="auth-container" style={{ maxWidth: '550px' }}>
            <h2>🏠 Create Account</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" name="name" value={formData.name}
                        onChange={handleChange} placeholder="John Murphy" required />
                </div>
                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" value={formData.email}
                        onChange={handleChange} placeholder="your@email.com" required />
                </div>
                <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone}
                        onChange={handleChange} placeholder="087 123 4567" />
                </div>
                <div className="form-group">
                    <label>I am a</label>
                    <select name="role" value={formData.role} onChange={handleChange}>
                        <option value="tenant">Tenant — Looking for accommodation</option>
                        <option value="landlord">Landlord — Listing properties</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" name="password" value={formData.password}
                        onChange={handleChange} placeholder="Min 6 characters" required />
                </div>
                <div className="form-group">
                    <label>Confirm Password</label>
                    <input type="password" name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange} placeholder="Repeat password" required />
                </div>
                <button type="submit" className="btn btn-primary"
                    style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                </button>
            </form>
            <div className="auth-link">
                <p>Already have an account? <Link to="/login">Login here</Link></p>
            </div>
        </div>
    );
};
// Note: The form has several input fields for name, email, phone, role (tenant or landlord), password, and confirm password.
export default Register;