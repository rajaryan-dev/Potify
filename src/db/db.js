const mongoose = require('mongoose');

async function connectDB() {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Database connection error:', error.message);
        throw error;
    }
}

module.exports = connectDB;
