import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { propertyAPI } from '../services/api';
import { toast } from 'react-toastify';

// Home page — main landing page
// Ref: https://react.dev/learn
const Home = () => {
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
// Load featured properties on component mount
    useEffect(() => {
        loadFeatured();
    }, []);
// Load featured properties (for simplicity, we just load the first 3 properties. In a real app, we might have a separate 
// endpoint for featured properties)
    const loadFeatured = async () => {
        try {
            // Note: We call the getAll method of the propertyAPI with a limit of 3 to fetch the first 3 properties. 
            // The response is expected to have a 'properties' field which is an array of property objects.
            const res = await propertyAPI.getAll({ limit: 3 });
            setFeatured(res.data.properties || []);
        } catch (error) {
            toast.error('Failed to load properties');
        } finally {
            setLoading(false);
        }
    };
// Handle search form submission — navigate to properties page with search query as URL parameter
    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/properties?search=${search}`);
    };
// Note: The search input is controlled by the 'search' state variable. When the form is submitted, we prevent the default
    return (
        <div className="home">
            {/* Hero Section */}
            <div className="hero">
                <div className="hero-content">
                    <h1>Find Your Perfect Home in Ireland 🏠</h1>
                    <p>Search thousands of properties across Dublin and Ireland</p>
                    <form onSubmit={handleSearch} className="hero-search">
                        <input
                            type="text"
                            placeholder="Search by area, e.g. Dublin 1, Rathmines..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">
                            Search
                        </button>
                    </form>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-bar">
                <div className="stat">
                    <h3>🏘️ 1000+</h3>
                    <p>Properties Listed</p>
                </div>
                <div className="stat">
                    <h3>📍 Dublin</h3>
                    <p>Prime Locations</p>
                </div>
                <div className="stat">
                    <h3>✅ Verified</h3>
                    <p>Trusted Landlords</p>
                </div>
                <div className="stat">
                    <h3>🔒 Secure</h3>
                    <p>Safe & Reliable</p>
                </div>
            </div>

            {/* Featured Properties */}
            <div className="section">
                <h2>Featured Properties</h2>
                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <div className="properties-grid">
                        {featured.map(property => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                )}
                <div className="center-btn">
                    <Link to="/properties" className="btn btn-primary">
                        View All Properties
                    </Link>
                </div>
            </div>

            {/* How it works */}
            <div className="section how-it-works">
                <h2>How IrishRent Works</h2>
                <div className="steps-grid">
                    <div className="step">
                        <div className="step-icon">🔍</div>
                        <h3>Search</h3>
                        <p>Browse thousands of verified properties across Ireland</p>
                    </div>
                    <div className="step">
                        <div className="step-icon">📋</div>
                        <h3>Compare</h3>
                        <p>Read reviews and compare properties side by side</p>
                    </div>
                    <div className="step">
                        <div className="step-icon">🏠</div>
                        <h3>Move In</h3>
                        <p>Contact the landlord and secure your new home</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Property Card Component
const PropertyCard = ({ property }) => {
    // Note: The property object is expected to have fields like id, title, price, type, area, bedrooms, bathrooms, avg_rating, 
    // images (JSON string), and amenities (JSON string). We parse the images and amenities fields to get arrays that we can use 
    // in the UI.
    const navigate = useNavigate();
    const images = property.images ? JSON.parse(property.images) : [];
    const amenities = property.amenities ? JSON.parse(property.amenities) : [];
// Note: The card is clickable and will navigate to the property details page when clicked. We also display the first image,
    return (
        <div className="property-card" onClick={() => navigate(`/properties/${property.id}`)}>
            <img
                src={images[0] || 'https://via.placeholder.com/400x200?text=No+Image'}
                alt={property.title}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                }}
            />
            <div className="property-card-body">
                <div className="property-card-header">
                    <span className="property-price">€{property.price}/mo</span>
                    <span className="property-type">{property.type}</span>
                </div>
                <h3>{property.title}</h3>
                <p className="property-location">📍 {property.area}</p>
                <div className="property-details">
                    <span>🛏 {property.bedrooms} bed</span>
                    <span>🚿 {property.bathrooms} bath</span>
                    {property.avg_rating > 0 && (
                        <span>⭐ {Number(property.avg_rating).toFixed(1)}</span>
                    )}
                </div>
                {amenities.length > 0 && (
                    <div className="amenities">
                        {amenities.slice(0, 3).map((a, i) => (
                            <span key={i} className="amenity-tag">{a}</span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export { PropertyCard };
export default Home;