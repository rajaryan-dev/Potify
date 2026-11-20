const Music = require('../models/music.model');
const Playlist = require('../models/playlist.model');
const User = require('../models/user.model');
const HttpError = require('../utils/httpError');
const { isString, isHttpUrl, escapeRegex } = require('../utils/helpers');

const MAX_RECENT = 20;

const exact = (value) => new RegExp(`^${escapeRegex(value)}$`, 'i');

async function getSongs(req, res) {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

    const filter = {};
    if (isString(req.query.genre)) filter.genre = exact(req.query.genre.trim());

    const sort = req.query.sort === 'popular' ? { plays: -1, createdAt: -1 } : { createdAt: -1 };

    const [songs, total] = await Promise.all([
        Music.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
        Music.countDocuments(filter),
    ]);
    res.json({ songs, total, page, pages: Math.ceil(total / limit) });
}

async function getSongById(req, res) {
    const song = await Music.findById(req.params.id);
    if (!song) throw new HttpError(404, 'Song not found');
    res.json({ song });
}

async function searchSongs(req, res) {
    const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
    if (!q) return res.json({ songs: [], artists: [], albums: [] });

    const rx = new RegExp(escapeRegex(q), 'i');
    const [songs, artists, albums] = await Promise.all([
        Music.find({ $or: [{ title: rx }, { artist: rx }, { album: rx }] })
            .sort({ plays: -1, title: 1 })
            .limit(30),
        Music.aggregate([
            { $match: { artist: rx } },
            {
                $group: {
                    _id: '$artist',
                    songCount: { $sum: 1 },
                    plays: { $sum: '$plays' },
                    coverImage: { $first: '$coverImage' },
                },
            },
            { $sort: { plays: -1, _id: 1 } },
            { $limit: 10 },
            { $project: { _id: 0, name: '$_id', songCount: 1, plays: 1, coverImage: 1 } },
        ]),
        Music.aggregate([
            { $match: { album: rx } },
            {
                $group: {
                    _id: { album: '$album', artist: '$artist' },
                    songCount: { $sum: 1 },
                    coverImage: { $first: '$coverImage' },
                },
            },
            { $sort: { '_id.album': 1 } },
            { $limit: 10 },
            {
                $project: {
                    _id: 0,
                    name: '$_id.album',
                    artist: '$_id.artist',
                    songCount: 1,
                    coverImage: 1,
                },
            },
        ]),
    ]);
    res.json({ songs, artists, albums });
}

async function getPopularArtists(req, res) {
    const artists = await Music.aggregate([
        {
            $group: {
                _id: '$artist',
                songCount: { $sum: 1 },
                plays: { $sum: '$plays' },
                coverImage: { $first: '$coverImage' },
            },
        },
        { $sort: { plays: -1, songCount: -1, _id: 1 } },
        { $limit: 12 },
        { $project: { _id: 0, name: '$_id', songCount: 1, plays: 1, coverImage: 1 } },
    ]);
    res.json({ artists });
}

async function getRecommended(req, res) {
    const songs = await Music.aggregate([{ $sample: { size: 10 } }]);
    res.json({ songs });
}

async function getGenres(req, res) {
    const genres = (await Music.distinct('genre')).filter(Boolean).sort();
    res.json({ genres });
}

async function getRecentlyPlayed(req, res) {
    const user = await User.findById(req.user._id).populate('recentlyPlayed.song');
    const songs = user.recentlyPlayed.filter((r) => r.song).map((r) => r.song);
    res.json({ songs });
}

async function getMySongs(req, res) {
    const songs = await Music.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ songs });
}

async function recordPlay(req, res) {
    const song = await Music.findById(req.params.id);
    if (!song) throw new HttpError(404, 'Song not found');

    const update = { $inc: { plays: 1 } };
    const duration = Number(req.body?.duration);
    if (!song.duration && Number.isFinite(duration) && duration > 0 && duration < 86400) {
        update.$set = { duration: Math.round(duration) };
    }
    await Music.updateOne({ _id: song._id }, update);

    // MongoDB can't $pull and $push the same field in one update, so do it in two steps
    await User.updateOne({ _id: req.user._id }, { $pull: { recentlyPlayed: { song: song._id } } });
    await User.updateOne(
        { _id: req.user._id },
        {
            $push: {
                recentlyPlayed: {
                    $each: [{ song: song._id, playedAt: new Date() }],
                    $position: 0,
                    $slice: MAX_RECENT,
                },
            },
        }
    );
    res.json({ message: 'Play recorded' });
}

async function addSong(req, res) {
    const { title, artist, album, coverImage, uri, genre, duration, releaseDate } = req.body || {};

    if (!isString(title)) throw new HttpError(400, 'Title is required');
    if (!isHttpUrl(uri)) throw new HttpError(400, 'A valid http(s) audio URL is required');
    if (coverImage && !isHttpUrl(coverImage)) throw new HttpError(400, 'Cover image must be a valid URL');
    if (duration !== undefined && !(Number(duration) >= 0)) throw new HttpError(400, 'Invalid duration');
    if (releaseDate && Number.isNaN(Date.parse(releaseDate))) throw new HttpError(400, 'Invalid release date');

    const song = await Music.create({
        title,
        artist: isString(artist) ? artist : req.user.username,
        album: album || '',
        coverImage: coverImage || '',
        uri,
        genre: genre || '',
        duration: duration !== undefined ? Number(duration) : 0,
        releaseDate: releaseDate || undefined,
        uploadedBy: req.user._id,
    });
    res.status(201).json({ message: 'Song added', song });
}

async function deleteSong(req, res) {
    const song = await Music.findById(req.params.id);
    if (!song) throw new HttpError(404, 'Song not found');
    if (!song.uploadedBy || !song.uploadedBy.equals(req.user._id)) {
        throw new HttpError(403, 'You can only delete songs you added');
    }

    await Promise.all([
        Music.deleteOne({ _id: song._id }),
        Playlist.updateMany({ songs: song._id }, { $pull: { songs: song._id } }),
        User.updateMany(
            {},
            { $pull: { likedSongs: song._id, recentlyPlayed: { song: song._id } } }
        ),
    ]);
    res.json({ message: 'Song deleted' });
}

module.exports = {
    getSongs,
    getSongById,
    searchSongs,
    getPopularArtists,
    getRecommended,
    getGenres,
    getRecentlyPlayed,
    getMySongs,
    recordPlay,
    addSong,
    deleteSong,
};
