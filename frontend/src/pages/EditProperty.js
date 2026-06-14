import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyAPI } from '../services/api';
import { toast } from 'react-toastify';

const EditProperty = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        title: '', description: '', type: 'apartment',
        price: '', bedrooms: '', bathrooms: '',
        area: '', address: '', amenities: '',
        images: '', available: true
    });

    useEffect(() => {
        loadProperty();
    }, [id]);

    const loadProperty = async () => {
        try {
            const res = await propertyAPI.getOne(id);
            const p = res.data.property;
            const images = p.images ? JSON.parse(p.images) : [];
            const amenities = p.amenities ? JSON.parse(p.amenities) : [];

            setFormData({
                title: p.title,
                description: p.description,
                type: p.type,
                price: p.price,
                bedrooms: p.bedrooms,
                bathrooms: p.bathrooms,
                area: p.area,
                address: p.address,
                amenities: amenities.join(', '),
                images: images[0] || '',
                available: !!p.available
            });
        } catch (error) {
            toast.error('Property not found');
            navigate('/dashboard');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = {
                ...formData,
                price: parseFloat(formData.price),
                bedrooms: parseInt(formData.bedrooms),
                bathrooms: parseInt(formData.bathrooms),
                amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
                images: formData.images ? [formData.images] : [],
                available: formData.available
            };
            await propertyAPI.update(id, data);
            toast.success('Property updated successfully!');
            navigate(`/properties/${id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating property');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="loading">Loading...</div>;

    return (
        <div className="form-container">
            <h2>✏️ Edit Property</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group form-full">
                        <label>Property Title *</label>
                        <input type="text" name="title" value={formData.title}
                            onChange={handleChange} required />
                    </div>
                    <div className="form-group form-full">
                        <label>Description *</label>
                        <textarea rows="4" name="description" value={formData.description}
                            onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Property Type *</label>
                        <select name="type" value={formData.type} onChange={handleChange}>
                            <option value="apartment">Apartment</option>
                            <option value="house">House</option>
                            <option value="studio">Studio</option>
                            <option value="room">Room</option>
                            <option value="shared">Shared</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Monthly Rent (€) *</label>
                        <input type="number" name="price" value={formData.price}
                            onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Bedrooms *</label>
                        <input type="number" name="bedrooms" value={formData.bedrooms}
                            onChange={handleChange} min="0" required />
                    </div>
                    <div className="form-group">
                        <label>Bathrooms *</label>
                        <input type="number" name="bathrooms" value={formData.bathrooms}
                            onChange={handleChange} min="1" required />
                    </div>
                    <div className="form-group">
                        <label>Area *</label>
                        <input type="text" name="area" value={formData.area}
                            onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Full Address *</label>
                        <input type="text" name="address" value={formData.address}
                            onChange={handleChange} required />
                    </div>
                    <div className="form-group form-full">
                        <label>Amenities (comma separated)</label>
                        <input type="text" name="amenities" value={formData.amenities}
                            onChange={handleChange}
                            placeholder="WiFi, Parking, Washing Machine, Garden" />
                    </div>
                    <div className="form-group form-full">
                        <label>Image URL</label>
                        <input type="url" name="images" value={formData.images}
                            onChange={handleChange} />
                    </div>
                    <div className="form-group form-full">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input type="checkbox" name="available" checked={formData.available}
                                onChange={handleChange} style={{ width: 'auto' }} />
                            Property is available for rent
                        </label>
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Updating...' : '💾 Save Changes'}
                    </button>
                    <button type="button" className="btn btn-outline"
                        onClick={() => navigate(`/properties/${id}`)}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProperty;