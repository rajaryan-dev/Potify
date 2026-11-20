const User = require('../models/user.model');
const Playlist = require('../models/playlist.model');
const HttpError = require('../utils/httpError');
const { isHttpUrl, publicUser } = require('../utils/helpers');

const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,30}$/;

async function getProfile(req, res) {
    const [playlists, withRecent] = await Promise.all([
        Playlist.countDocuments({ owner: req.user._id }),
        User.findById(req.user._id).populate('recentlyPlayed.song', 'genre'),
    ]);

    const genreCounts = {};
    for (const r of withRecent.recentlyPlayed) {
        const g = r.song?.genre;
        if (g) genreCounts[g] = (genreCounts[g] || 0) + 1;
    }
    const topGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre, count]) => ({ genre, count }));

    res.json({
        user: publicUser(req.user),
        stats: {
            likedSongs: req.user.likedSongs.length,
            playlists,
            recentlyPlayed: withRecent.recentlyPlayed.length,
        },
        topGenres,
    });
}

async function updateProfile(req, res) {
    const { username, profileImage } = req.body || {};
    const changes = {};

    if (username !== undefined) {
        if (typeof username !== 'string' || !USERNAME_RE.test(username.trim())) {
            throw new HttpError(400, 'Username must be 3-30 characters: letters, numbers, . _ -');
        }
        const clash = await User.findOne({ username: username.trim(), _id: { $ne: req.user._id } });
        if (clash) throw new HttpError(409, 'Username is already taken');
        changes.username = username.trim();
    }
    if (profileImage !== undefined) {
        if (profileImage !== '' && (!isHttpUrl(profileImage) || profileImage.length > 500)) {
            throw new HttpError(400, 'Profile image must be a valid http(s) URL');
        }
        changes.profileImage = profileImage;
    }
    if (Object.keys(changes).length === 0) throw new HttpError(400, 'Nothing to update');

    Object.assign(req.user, changes);
    await req.user.save();
    res.json({ message: 'Profile updated', user: publicUser(req.user) });
}

module.exports = { getProfile, updateProfile };
