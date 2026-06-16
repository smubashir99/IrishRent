import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { propertyAPI } from '../services/api';
import { PropertyCard } from './Home';
import { toast } from 'react-toastify';

const Properties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [searchParams] = useSearchParams();

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        area: '',
        type: '',
        minPrice: '',
        maxPrice: '',
        bedrooms: '',
    });

    useEffect(() => {
        loadProperties();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const loadProperties = async () => {
        setLoading(true);
        try {
            const params = {};
            Object.keys(filters).forEach(key => {
                if (filters[key]) params[key] = filters[key];
            });
            const res = await propertyAPI.getAll(params);
            setProperties(res.data.properties || []);
            setTotal(res.data.total || 0);
        } catch (error) {
            toast.error('Failed to load properties');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const clearFilters = () => {
        setFilters({ search: '', area: '', type: '', minPrice: '', maxPrice: '', bedrooms: '' });
    };

    return (
        <div>
            <div className="properties-header">
                <h2>Properties in Ireland ({total} found)</h2>
                <button onClick={clearFilters} className="btn btn-outline">
                    Clear Filters
                </button>
            </div>

            <div className="filters">
                <div className="filter-group">
                    <label>Search</label>
                    <input type="text" name="search" value={filters.search}
                        onChange={handleFilter} placeholder="Keyword..." />
                </div>
                <div className="filter-group">
                    <label>Area</label>
                    <input type="text" name="area" value={filters.area}
                        onChange={handleFilter} placeholder="Dublin 1..." />
                </div>
                <div className="filter-group">
                    <label>Type</label>
                    <select name="type" value={filters.type} onChange={handleFilter}>
                        <option value="">All Types</option>
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="studio">Studio</option>
                        <option value="room">Room</option>
                        <option value="shared">Shared</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Min Price €</label>
                    <input type="number" name="minPrice" value={filters.minPrice}
                        onChange={handleFilter} placeholder="0" />
                </div>
                <div className="filter-group">
                    <label>Max Price €</label>
                    <input type="number" name="maxPrice" value={filters.maxPrice}
                        onChange={handleFilter} placeholder="5000" />
                </div>
                <div className="filter-group">
                    <label>Bedrooms</label>
                    <select name="bedrooms" value={filters.bedrooms} onChange={handleFilter}>
                        <option value="">Any</option>
                        <option value="0">Studio</option>
                        <option value="1">1 Bed</option>
                        <option value="2">2 Bed</option>
                        <option value="3">3 Bed</option>
                        <option value="4">4+ Bed</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading properties...</div>
            ) : properties.length === 0 ? (
                <div className="loading">No properties found. Try different filters.</div>
            ) : (
                <div className="properties-grid">
                    {properties.map(property => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Properties;