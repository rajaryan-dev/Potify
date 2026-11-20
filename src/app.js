const path = require('path');
const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const musicRoutes = require('./routes/music.routes');
const playlistRoutes = require('./routes/playlist.routes');
const likeRoutes = require('./routes/like.routes');
const userRoutes = require('./routes/user.routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/users', userRoutes);
app.use('/api', notFound);

// Serve the built React app from the same origin when available, or redirect to Vite dev server
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('/{*splat}', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
} else {
    app.get('/', (req, res) => res.redirect('http://localhost:5173'));
}

app.use(errorHandler);

module.exports = app;
