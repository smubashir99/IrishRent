import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { propertyAPI, bookmarkAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PropertyCard } from './Home';
import { toast } from 'react-toastify';
// User dashboard page showing profile info, landlord listings, and tenant bookmarks
const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [myProperties, setMyProperties] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    // Load user-specific data on component mount
    useEffect(() => {
        loadData();
    }, []);
    // Load dashboard data: landlord's properties and tenant's bookmarks
    const loadData = async () => {
        try {
            if (user?.role === 'landlord' || user?.role === 'admin') {
                const res = await propertyAPI.getMyListings();
                setMyProperties(res.data.properties || []);
            }
            const bRes = await bookmarkAPI.getAll();
            setBookmarks(bRes.data.bookmarks || []);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };
    // Handle bookmark removal for tenants
    const handleRemoveBookmark = async (propertyId) => {
        try {
            await bookmarkAPI.remove(propertyId);
            setBookmarks(bookmarks.filter(b => b.property_id !== propertyId));
            toast.success('Bookmark removed');
        } catch {
            toast.error('Error removing bookmark');
        }
    };
    // Show loading state while fetching data
    if (loading) return <div className="loading">Loading dashboard...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Welcome, {user?.name}! 👋</h2>
                <span className="property-type" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                    {user?.role}
                </span>
            </div>

            {/* Stats */}
            <div className="dashboard-grid">
                <div className="dashboard-stat">
                    <h3>{user?.role === 'tenant' ? bookmarks.length : myProperties.length}</h3>
                    <p>{user?.role === 'tenant' ? 'Saved Properties' : 'My Listings'}</p>
                </div>
                <div className="dashboard-stat">
                    <h3 style={{ fontSize: '1rem', wordBreak: 'break-all' }}>
                        {user?.email}
                    </h3>
                    <p>Email Address</p>
                </div>
                <div className="dashboard-stat">
                    <h3>{user?.phone || 'Not set'}</h3>
                    <p>Phone Number</p>
                </div>
            </div>

            {/* Landlord Section */}
            {(user?.role === 'landlord' || user?.role === 'admin') && (
                <div className="section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>My Property Listings ({myProperties.length})</h3>
                        <Link to="/add-property" className="btn btn-primary">+ Add Property</Link>
                    </div>
                    {myProperties.length === 0 ? (
                        <div className="section-card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <p>No listings yet.</p>
                            <Link to="/add-property" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                List Your First Property
                            </Link>
                        </div>
                    ) : (
                        <div className="properties-grid">
                            {myProperties.map(p => (
                                <PropertyCard key={p.id} property={p} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Bookmarks Section */}
            <div className="section">
                <h3>Saved Properties ({bookmarks.length})</h3>
                {bookmarks.length === 0 ? (
                    <div className="section-card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <p>No saved properties yet.</p>
                        <Link to="/properties" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            Browse Properties
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {bookmarks.map(b => (
                            <div key={b.id} className="section-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4>{b.title}</h4>
                                    <p style={{ color: 'var(--grey-600)' }}>📍 {b.area} — €{b.price}/mo</p>
                                    <span className="property-type">{b.type}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => navigate(`/properties/${b.property_id}`)} className="btn btn-secondary">
                                        View
                                    </button>
                                    <button onClick={() => handleRemoveBookmark(b.property_id)} className="btn btn-danger">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;