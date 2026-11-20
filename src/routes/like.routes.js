const express = require('express');
const likes = require('../controllers/like.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();
router.use(authenticate);

router.get('/', likes.getLikedSongs);
router.post('/:songId', validateObjectId('songId'), likes.likeSong);
router.delete('/:songId', validateObjectId('songId'), likes.unlikeSong);

module.exports = router;
