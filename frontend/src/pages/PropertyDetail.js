import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyAPI, reviewAPI, bookmarkAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const PropertyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [review, setReview] = useState({ rating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);

    useEffect(() => {
        loadProperty();
        if (isAuthenticated) checkBookmark();
    }, [id]);

    const loadProperty = async () => {
        try {
            const res = await propertyAPI.getOne(id);
            setProperty(res.data.property);
        } catch {
            toast.error('Property not found');
            navigate('/properties');
        } finally {
            setLoading(false);
        }
    };

    const checkBookmark = async () => {
        try {
            const res = await bookmarkAPI.getAll();
            const bookmarks = res.data.bookmarks || [];
            setBookmarked(bookmarks.some(b => b.property_id === parseInt(id)));
        } catch {}
    };

    const handleBookmark = async () => {
        if (!isAuthenticated) { toast.info('Please login to bookmark'); return; }
        try {
            if (bookmarked) {
                await bookmarkAPI.remove(id);
                setBookmarked(false);
                toast.success('Bookmark removed');
            } else {
                await bookmarkAPI.add(id);
                setBookmarked(true);
                toast.success('Property bookmarked!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating bookmark');
        }
    };

    const handleReview = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) { toast.info('Please login to review'); return; }
        setSubmitting(true);
        try {
            await reviewAPI.add(id, review);
            toast.success('Review added!');
            setReview({ rating: 5, comment: '' });
            loadProperty();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error adding review');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this property?')) return;
        try {
            await propertyAPI.delete(id);
            toast.success('Property deleted');
            navigate('/dashboard');
        } catch {
            toast.error('Error deleting property');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (!property) return null;

    const images = property.images ? JSON.parse(property.images) : [];
    const amenities = property.amenities ? JSON.parse(property.amenities) : [];

    return (
        <div className="property-detail">
            <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '1rem' }}>
                ← Back
            </button>

            <img
                src={images[0] || 'https://via.placeholder.com/900x400?text=No+Image'}
                alt={property.title}
                className="property-detail-image"
            />

            <div className="property-detail-header">
                <div>
                    <h1>{property.title}</h1>
                    <p>📍 {property.address}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span className="property-detail-price">€{property.price}/mo</span>
                    <span className="property-type">{property.type}</span>
                    <button onClick={handleBookmark} className={`btn ${bookmarked ? 'btn-danger' : 'btn-outline'}`}>
                        {bookmarked ? '❤️ Saved' : '🤍 Save'}
                    </button>
                </div>
            </div>

            <div className="property-info-grid">
                <div className="info-item">
                    <div className="info-value">🛏 {property.bedrooms}</div>
                    <div className="info-label">Bedrooms</div>
                </div>
                <div className="info-item">
                    <div className="info-value">🚿 {property.bathrooms}</div>
                    <div className="info-label">Bathrooms</div>
                </div>
                <div className="info-item">
                    <div className="info-value">📍 {property.area}</div>
                    <div className="info-label">Area</div>
                </div>
                <div className="info-item">
                    <div className="info-value">{property.available ? '✅ Yes' : '❌ No'}</div>
                    <div className="info-label">Available</div>
                </div>
                {property.avg_rating > 0 && (
                    <div className="info-item">
                        <div className="info-value">⭐ {Number(property.avg_rating).toFixed(1)}</div>
                        <div className="info-label">Rating</div>
                    </div>
                )}
            </div>

            <div className="section-card">
                <h3>Description</h3>
                <p>{property.description}</p>
            </div>

            {amenities.length > 0 && (
                <div className="section-card">
                    <h3>Amenities</h3>
                    <div className="amenities">
                        {amenities.map((a, i) => (
                            <span key={i} className="amenity-tag">{a}</span>
                        ))}
                    </div>
                </div>
            )}

            <div className="section-card">
                <h3>Contact Landlord</h3>
                <p><strong>{property.landlord_name}</strong></p>
                {property.landlord_phone && <p>📞 {property.landlord_phone}</p>}
                {property.landlord_email && <p>✉️ {property.landlord_email}</p>}
            </div>

            {/* Reviews */}
            <div className="section-card">
                <h3>Reviews ({property.reviews?.length || 0})</h3>
                {property.reviews?.length === 0 ? (
                    <p style={{ color: 'var(--grey-600)' }}>No reviews yet. Be the first!</p>
                ) : (
                    property.reviews?.map(r => (
                        <div key={r.id} className="review-item">
                            <div className="review-header">
                                <span className="review-author">{r.reviewer_name}</span>
                                <span className="review-rating">{'⭐'.repeat(r.rating)}</span>
                            </div>
                            <p>{r.comment}</p>
                            <span className="review-date">
                                {new Date(r.created_at).toLocaleDateString('en-IE')}
                            </span>
                        </div>
                    ))
                )}

                {isAuthenticated && user?.role === 'tenant' && (
                    <form onSubmit={handleReview} style={{ marginTop: '1.5rem' }}>
                        <h4 style={{ marginBottom: '1rem' }}>Add Your Review</h4>
                        <div className="form-group">
                            <label>Rating</label>
                            <select value={review.rating}
                                onChange={(e) => setReview({ ...review, rating: e.target.value })}>
                                <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                                <option value="4">⭐⭐⭐⭐ Good</option>
                                <option value="3">⭐⭐⭐ Average</option>
                                <option value="2">⭐⭐ Poor</option>
                                <option value="1">⭐ Terrible</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Comment</label>
                            <textarea rows="3" value={review.comment}
                                onChange={(e) => setReview({ ...review, comment: e.target.value })}
                                placeholder="Share your experience..." required />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                )}
            </div>

            {/* Admin/Owner actions */}
            {(user?.id === property.landlord_id || user?.role === 'admin') && (
                <div className="section-card" style={{ borderTop: '3px solid var(--danger)' }}>
                    <h3>Owner Actions</h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => navigate(`/edit-property/${id}`)} className="btn btn-secondary">
                            ✏️ Edit Property
                        </button>
                        <button onClick={handleDelete} className="btn btn-danger">
                            🗑️ Delete Property
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyDetail;