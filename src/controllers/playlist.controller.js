const Playlist = require('../models/playlist.model');
const Music = require('../models/music.model');
const HttpError = require('../utils/httpError');
const { isString } = require('../utils/helpers');

const summary = (p) => ({
    _id: p._id,
    name: p.name,
    description: p.description,
    isPublic: p.isPublic,
    songCount: p.songs.length,
    coverImage: p.songs.find((s) => s && s.coverImage)?.coverImage || '',
    owner: p.owner && p.owner.username ? { _id: p.owner._id, username: p.owner.username } : p.owner,
    updatedAt: p.updatedAt,
});

async function findOwned(req) {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) throw new HttpError(404, 'Playlist not found');
    if (!playlist.owner.equals(req.user._id)) throw new HttpError(403, 'This is not your playlist');
    return playlist;
}

function readDetails(body, { requireName }) {
    const out = {};
    const { name, description, isPublic } = body || {};
    if (requireName || name !== undefined) {
        if (!isString(name)) throw new HttpError(400, 'Playlist name is required');
        if (name.trim().length > 100) throw new HttpError(400, 'Playlist name is too long (max 100)');
        out.name = name.trim();
    }
    if (description !== undefined) {
        if (typeof description !== 'string' || description.length > 300) {
            throw new HttpError(400, 'Description must be text up to 300 characters');
        }
        out.description = description.trim();
    }
    if (isPublic !== undefined) {
        if (typeof isPublic !== 'boolean') throw new HttpError(400, 'isPublic must be true or false');
        out.isPublic = isPublic;
    }
    return out;
}

async function createPlaylist(req, res) {
    const details = readDetails(req.body, { requireName: true });
    const playlist = await Playlist.create({ ...details, owner: req.user._id });
    res.status(201).json({ message: 'Playlist created', playlist: summary(playlist) });
}

async function getMyPlaylists(req, res) {
    const playlists = await Playlist.find({ owner: req.user._id })
        .sort({ updatedAt: -1 })
        .populate('songs', 'coverImage');
    res.json({ playlists: playlists.map(summary) });
}

async function getFeaturedPlaylists(req, res) {
    const playlists = await Playlist.find({ isPublic: true, 'songs.0': { $exists: true } })
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate('songs', 'coverImage')
        .populate('owner', 'username');
    res.json({ playlists: playlists.map(summary) });
}

async function getPlaylistById(req, res) {
    const playlist = await Playlist.findById(req.params.id)
        .populate('songs')
        .populate('owner', 'username');
    if (!playlist) throw new HttpError(404, 'Playlist not found');

    const isOwner = playlist.owner._id.equals(req.user._id);
    if (!isOwner && !playlist.isPublic) throw new HttpError(403, 'This playlist is private');

    const songs = playlist.songs.filter(Boolean);
    res.json({
        playlist: {
            _id: playlist._id,
            name: playlist.name,
            description: playlist.description,
            isPublic: playlist.isPublic,
            owner: { _id: playlist.owner._id, username: playlist.owner.username },
            isOwner,
            songs,
            coverImage: songs.find((s) => s.coverImage)?.coverImage || '',
            updatedAt: playlist.updatedAt,
        },
    });
}

async function updatePlaylist(req, res) {
    const playlist = await findOwned(req);
    const details = readDetails(req.body, { requireName: false });
    if (Object.keys(details).length === 0) throw new HttpError(400, 'Nothing to update');
    Object.assign(playlist, details);
    await playlist.save();
    res.json({ message: 'Playlist updated', playlist: summary(playlist) });
}

async function deletePlaylist(req, res) {
    const playlist = await findOwned(req);
    await playlist.deleteOne();
    res.json({ message: 'Playlist deleted' });
}

async function addSongToPlaylist(req, res) {
    const playlist = await findOwned(req);
    const { songId } = req.body || {};
    if (!/^[a-f\d]{24}$/i.test(songId || '')) throw new HttpError(400, 'A valid songId is required');
    if (!(await Music.exists({ _id: songId }))) throw new HttpError(404, 'Song not found');
    if (playlist.songs.some((id) => id.equals(songId))) {
        throw new HttpError(409, 'Song is already in this playlist');
    }
    playlist.songs.push(songId);
    await playlist.save();
    res.status(201).json({ message: 'Song added to playlist', songCount: playlist.songs.length });
}

async function removeSongFromPlaylist(req, res) {
    const playlist = await findOwned(req);
    const before = playlist.songs.length;
    playlist.songs = playlist.songs.filter((id) => !id.equals(req.params.songId));
    if (playlist.songs.length === before) throw new HttpError(404, 'Song is not in this playlist');
    await playlist.save();
    res.json({ message: 'Song removed from playlist', songCount: playlist.songs.length });
}

module.exports = {
    createPlaylist,
    getMyPlaylists,
    getFeaturedPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
};
