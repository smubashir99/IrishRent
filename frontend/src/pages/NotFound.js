import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h1 style={{ fontSize: '5rem', color: 'var(--primary)' }}>404</h1>
        <h2>Page Not Found</h2>
        <p style={{ color: 'var(--grey-600)', margin: '1rem 0 2rem' }}>
            The page you are looking for does not exist.
        </p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
);

export default NotFound;