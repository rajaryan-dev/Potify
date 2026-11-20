const express = require('express');
const music = require('../controllers/music.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();
router.use(authenticate);

// fixed paths first so they are not captured by /:id
router.get('/', music.getSongs);
router.get('/search', music.searchSongs);
router.get('/artists', music.getPopularArtists);
router.get('/recommended', music.getRecommended);
router.get('/genres', music.getGenres);
router.get('/recent', music.getRecentlyPlayed);
router.get('/mine', authorizeRoles('artist'), music.getMySongs);

router.post('/', authorizeRoles('artist'), music.addSong);
router.get('/:id', validateObjectId('id'), music.getSongById);
router.post('/:id/play', validateObjectId('id'), music.recordPlay);
router.delete('/:id', authorizeRoles('artist'), validateObjectId('id'), music.deleteSong);

module.exports = router;
