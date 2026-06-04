const bcrypt = require('bcryptjs');
const db = require('./config/db');
// The seedData function is an asynchronous function that populates the IrishRent database with initial data for testing and 
// development purposes.
const seedData = async () => {
    try {
        console.log('Seeding IrishRent database...');

        // Clear existing data
        db.exec('DELETE FROM bookmarks');
        db.exec('DELETE FROM reviews');
        db.exec('DELETE FROM properties');
        db.exec('DELETE FROM users');

        // Create users
        const salt = await bcrypt.genSalt(12);
// The function first clears any existing data from the bookmarks, reviews, properties, and users tables to ensure a clean slate.
        const adminPass = await bcrypt.hash('Admin123!', salt);
        const landlordPass = await bcrypt.hash('Landlord123!', salt);
        const tenantPass = await bcrypt.hash('Tenant123!', salt);
// Next, it creates three users: an admin, a landlord, and a tenant. Each user is inserted into the users table with their name, 
// email, hashed password, role, and phone number.
        db.prepare(`INSERT INTO users (name, email, password, role, phone)
            VALUES (?, ?, ?, ?, ?)`
        ).run('Admin User', 'admin@irishrent.ie', adminPass, 'admin', '0871234567');

        db.prepare(`INSERT INTO users (name, email, password, role, phone)
            VALUES (?, ?, ?, ?, ?)`
        ).run('John Murphy', 'john@landlord.ie', landlordPass, 'landlord', '0861234567');

        db.prepare(`INSERT INTO users (name, email, password, role, phone)
            VALUES (?, ?, ?, ?, ?)`
        ).run('Mubashir Ahmed', 'mubashir@tenant.ie', tenantPass, 'tenant', '0851234567');

        // Create properties
        const properties = [
            {
                title: 'Modern Studio in Dublin City Centre',
                description: 'Beautiful studio apartment in the heart of Dublin. Close to all amenities, transport links, and universities.',
                type: 'studio',
                price: 1800,
                bedrooms: 0,
                bathrooms: 1,
                area: 'Dublin 1',
                address: '12 O\'Connell Street, Dublin 1',
                images: JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800']),
                amenities: JSON.stringify(['WiFi', 'Heating', 'Washing Machine'])
            },
            {
                title: '2 Bed Apartment in Rathmines',
                description: 'Spacious 2 bedroom apartment in popular Rathmines. Perfect for students or young professionals.',
                type: 'apartment',
                price: 2400,
                bedrooms: 2,
                bathrooms: 1,
                area: 'Rathmines',
                address: '45 Rathmines Road, Dublin 6',
                images: JSON.stringify(['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800']),
                amenities: JSON.stringify(['WiFi', 'Parking', 'Garden', 'Dishwasher'])
            },
            {
                title: 'Single Room in Shared House — Ranelagh',
                description: 'Lovely single room in a friendly shared house. Bills included. Great location near Luas stop.',
                type: 'room',
                price: 950,
                bedrooms: 1,
                bathrooms: 1,
                area: 'Ranelagh',
                address: '23 Ranelagh Village, Dublin 6',
                images: JSON.stringify(['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800']),
                amenities: JSON.stringify(['WiFi', 'Bills Included', 'Luas Access'])
            },
            {
                title: '3 Bed House in Clontarf',
                description: 'Stunning 3 bedroom house near the sea in Clontarf. Ideal for families or professional sharers.',
                type: 'house',
                price: 3200,
                bedrooms: 3,
                bathrooms: 2,
                area: 'Clontarf',
                address: '8 Vernon Avenue, Clontarf, Dublin 3',
                images: JSON.stringify(['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800']),
                amenities: JSON.stringify(['Garden', 'Parking', 'Washing Machine', 'Near Sea'])
            },
        ];

        properties.forEach(p => {
            db.prepare(`
                INSERT INTO properties
                (title, description, type, price, bedrooms, bathrooms,
                area, address, images, amenities, landlord_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 2)
            `).run(
                p.title, p.description, p.type, p.price,
                p.bedrooms, p.bathrooms, p.area, p.address,
                p.images, p.amenities
            );
        });

        // Add reviews
        db.prepare(`
            INSERT INTO reviews (rating, comment, property_id, user_id)
            VALUES (?, ?, ?, ?)
        `).run(5, 'Amazing apartment! Very clean and modern. Landlord is very responsive.', 1, 3);

        db.prepare(`
            INSERT INTO reviews (rating, comment, property_id, user_id)
            VALUES (?, ?, ?, ?)
        `).run(4, 'Great location in Rathmines. Close to everything. Highly recommended.', 2, 3);

        console.log('✅ Seed data inserted successfully!');
        console.log('Login credentials:');
        console.log('Admin:    admin@irishrent.ie / Admin123!');
        console.log('Landlord: john@landlord.ie / Landlord123!');
        console.log('Tenant:   mubashir@tenant.ie / Tenant123!');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};
//
seedData();