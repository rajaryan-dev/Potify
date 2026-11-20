require('dotenv').config();
const app = require('../src/app');
const connectDB = require('../src/db/db');

module.exports = async (req, res) => {
    try {
        await connectDB();
        return app(req, res);
    } catch (err) {
        console.error('Serverless connection error:', err);
        return res.status(500).json({ message: 'Database connection error' });
    }
};
