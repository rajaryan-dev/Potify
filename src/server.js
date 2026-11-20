require('dotenv').config();
const app = require('./app');
const connectDB = require('./db/db');

for (const key of ['MONGO_URI', 'JWT_SECRET']) {
    if (!process.env[key]) {
        console.error(`Missing ${key}. Copy .env.example to .env and fill it in.`);
        process.exit(1);
    }
}

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
