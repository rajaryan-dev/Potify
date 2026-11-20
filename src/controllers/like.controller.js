const User = require('../models/user.model');
const Music = require('../models/music.model');
const HttpError = require('../utils/httpError');

async function getLikedSongs(req, res) {
    const user = await User.findById(req.user._id).populate('likedSongs');
    // newest likes last in the array -> show most recent first
    const songs = user.likedSongs.filter(Boolean).reverse();
    res.json({ songs });
}

async function likeSong(req, res) {
    if (!(await Music.exists({ _id: req.params.songId }))) throw new HttpError(404, 'Song not found');
    await User.updateOne({ _id: req.user._id }, { $addToSet: { likedSongs: req.params.songId } });
    res.json({ message: 'Song liked', liked: true });
}

async function unlikeSong(req, res) {
    await User.updateOne({ _id: req.user._id }, { $pull: { likedSongs: req.params.songId } });
    res.json({ message: 'Song unliked', liked: false });
}

module.exports = { getLikedSongs, likeSong, unlikeSong };
