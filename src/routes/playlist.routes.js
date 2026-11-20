const express = require('express');
const playlist = require('../controllers/playlist.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();
router.use(authenticate);

router.post('/', playlist.createPlaylist);
router.get('/', playlist.getMyPlaylists);
router.get('/featured', playlist.getFeaturedPlaylists);
router.get('/:id', validateObjectId('id'), playlist.getPlaylistById);
router.patch('/:id', validateObjectId('id'), playlist.updatePlaylist);
router.delete('/:id', validateObjectId('id'), playlist.deletePlaylist);
router.post('/:id/songs', validateObjectId('id'), playlist.addSongToPlaylist);
router.delete('/:id/songs/:songId', validateObjectId('id', 'songId'), playlist.removeSongFromPlaylist);

module.exports = router;
