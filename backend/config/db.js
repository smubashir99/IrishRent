// Database connection setup using Mongoose ODM
const mongoose = require('mongoose');

// MongoDB connection configuration
// Ref: https://mongoosejs.com/docs/connections.html
const connectDB = async () => {
    try {
        // Connect to MongoDB using the connection string from environment variables
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
        // Note: The connection object can be used for further operations if needed
    } catch (error) {
        console.error(`Database connection failed: ${error.message}`);
        process.exit(1);
    }
};

// Export the connectDB function for use in other parts of the application
module.exports = connectDB;