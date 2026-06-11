import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyAPI } from '../services/api';
import { toast } from 'react-toastify';

const AddProperty = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', type: 'apartment',
        price: '', bedrooms: '', bathrooms: '',
        area: '', address: '', amenities: '',
        images: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
                images: formData.images ? [formData.images] : []
            };
            const res = await propertyAPI.create(data);
            toast.success('Property listed successfully!');
            navigate(`/properties/${res.data.property.id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating property');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>🏠 List a Property</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group form-full">
                        <label>Property Title *</label>
                        <input type="text" name="title" value={formData.title}
                            onChange={handleChange} placeholder="Modern 2 Bed Apartment in Dublin 2"
                            required />
                    </div>
                    <div className="form-group form-full">
                        <label>Description *</label>
                        <textarea rows="4" name="description" value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the property..." required />
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
                            onChange={handleChange} placeholder="1500" required />
                    </div>
                    <div className="form-group">
                        <label>Bedrooms *</label>
                        <input type="number" name="bedrooms" value={formData.bedrooms}
                            onChange={handleChange} placeholder="2" min="0" required />
                    </div>
                    <div className="form-group">
                        <label>Bathrooms *</label>
                        <input type="number" name="bathrooms" value={formData.bathrooms}
                            onChange={handleChange} placeholder="1" min="1" required />
                    </div>
                    <div className="form-group">
                        <label>Area *</label>
                        <input type="text" name="area" value={formData.area}
                            onChange={handleChange} placeholder="Dublin 2" required />
                    </div>
                    <div className="form-group">
                        <label>Full Address *</label>
                        <input type="text" name="address" value={formData.address}
                            onChange={handleChange}
                            placeholder="12 Grafton Street, Dublin 2" required />
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
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg" />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Listing...' : '🏠 List Property'}
                    </button>
                    <button type="button" className="btn btn-outline"
                        onClick={() => navigate('/dashboard')}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProperty;