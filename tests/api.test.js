const { test, before, after, describe } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = 'test-secret';

let mongod;
let app;
let Music;

before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    app = require('../src/app');
    Music = require('../src/models/music.model');
});

after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});

const creds = { username: 'tester', email: 'tester@example.com', password: 'password123' };

async function login(agent, body = creds) {
    return agent.post('/api/auth/login').send(body);
}

describe('auth', () => {
    const agent = request.agent(() => app);

    test('registers a user and sets an httpOnly cookie', async () => {
        const res = await request(app).post('/api/auth/register').send(creds);
        assert.equal(res.status, 201);
        assert.equal(res.body.user.username, 'tester');
        assert.equal(res.body.user.password, undefined);
        assert.match(res.headers['set-cookie'][0], /token=.*HttpOnly/i);
    });

    test('rejects duplicate registration (409)', async () => {
        const res = await request(app).post('/api/auth/register').send(creds);
        assert.equal(res.status, 409);
    });

    test('rejects invalid registration input (400)', async () => {
        const a = await request(app).post('/api/auth/register').send({});
        const b = await request(app).post('/api/auth/register').send({ ...creds, username: 'x1', password: 'short' });
        assert.equal(a.status, 400);
        assert.equal(b.status, 400);
    });

    test('invalid login -> 401, wrong shape -> 400', async () => {
        const wrong = await request(app).post('/api/auth/login').send({ email: creds.email, password: 'nope-nope' });
        assert.equal(wrong.status, 401);
        const inj = await request(app).post('/api/auth/login').send({ email: { $ne: null }, password: 'x' });
        assert.equal(inj.status, 400);
    });

    test('protected route without cookie -> 401', async () => {
        assert.equal((await request(app).get('/api/auth/me')).status, 401);
        assert.equal((await request(app).get('/api/music')).status, 401);
    });

    test('login by email or username, /me, then logout clears access', async () => {
        const a = request.agent(app);
        assert.equal((await login(a, { email: 'TESTER@example.com', password: creds.password })).status, 200);
        assert.equal((await a.get('/api/auth/me')).body.user.email, creds.email);
        assert.equal((await a.post('/api/auth/logout')).status, 200);
        assert.equal((await a.get('/api/auth/me')).status, 401);

        const b = request.agent(app);
        assert.equal((await login(b, { username: 'tester', password: creds.password })).status, 200);
    });
});

describe('songs, search, likes, playlists, profile', () => {
    let user;
    let artist;
    let songs;

    before(async () => {
        user = request.agent(app);
        await user.post('/api/auth/register').send({ username: 'listener', email: 'l@example.com', password: 'password123' });
        artist = request.agent(app);
        await artist.post('/api/auth/register').send({ username: 'artistone', email: 'a@example.com', password: 'password123', role: 'artist' });

        songs = await Music.insertMany([
            { title: 'Alpha Song', artist: 'Band One', album: 'First Album', uri: 'https://example.com/a.mp3', genre: 'Rock' },
            { title: 'Beta Tune', artist: 'Band Two', album: 'First Album', uri: 'https://example.com/b.mp3', genre: 'Jazz' },
            { title: 'Gamma (Live) [x]', artist: 'Band One', album: 'Other', uri: 'https://example.com/c.mp3', genre: 'Rock' },
        ]);
    });

    test('lists songs with pagination and genre filter', async () => {
        const all = await user.get('/api/music?limit=2');
        assert.equal(all.status, 200);
        assert.equal(all.body.songs.length, 2);
        assert.equal(all.body.total, 3);
        assert.equal(all.body.pages, 2);
        const rock = await user.get('/api/music?genre=rock');
        assert.equal(rock.body.total, 2);
    });

    test('gets a song by id; bad id -> 400; unknown id -> 404', async () => {
        assert.equal((await user.get(`/api/music/${songs[0]._id}`)).body.song.title, 'Alpha Song');
        assert.equal((await user.get('/api/music/not-an-id')).status, 400);
        assert.equal((await user.get(`/api/music/${new mongoose.Types.ObjectId()}`)).status, 404);
    });

    test('search matches title, artist and album; handles regex characters', async () => {
        const byTitle = await user.get('/api/music/search?q=alpha');
        assert.equal(byTitle.body.songs.length, 1);
        const byArtist = await user.get('/api/music/search?q=band one');
        assert.equal(byArtist.body.songs.length, 2);
        assert.equal(byArtist.body.artists[0].name, 'Band One');
        const byAlbum = await user.get('/api/music/search?q=first album');
        assert.equal(byAlbum.body.albums.length, 2); // same album name, two artists
        assert.equal(byAlbum.body.songs.length, 2);
        const special = await user.get('/api/music/search?q=' + encodeURIComponent('(Live) [x]'));
        assert.equal(special.status, 200);
        assert.equal(special.body.songs.length, 1);
        assert.deepEqual((await user.get('/api/music/search?q=')).body.songs, []);
    });

    test('only artists can add/delete songs, and only their own', async () => {
        const body = { title: 'My Track', uri: 'https://example.com/mine.mp3', genre: 'Pop' };
        assert.equal((await user.post('/api/music').send(body)).status, 403);
        assert.equal((await artist.post('/api/music').send({ title: 'x', uri: 'not-a-url' })).status, 400);
        const created = await artist.post('/api/music').send(body);
        assert.equal(created.status, 201);
        assert.equal(created.body.song.artist, 'artistone');
        const id = created.body.song._id;
        assert.equal((await artist.get('/api/music/mine')).body.songs.length, 1);
        assert.equal((await user.delete(`/api/music/${id}`)).status, 403);
        assert.equal((await artist.delete(`/api/music/${songs[0]._id}`)).status, 403);
        assert.equal((await artist.delete(`/api/music/${id}`)).status, 200);
        assert.equal((await user.get(`/api/music/${id}`)).status, 404);
    });

    test('likes: like, idempotent, list, unlike', async () => {
        const id = songs[0]._id;
        assert.equal((await user.post(`/api/likes/${id}`)).status, 200);
        assert.equal((await user.post(`/api/likes/${id}`)).status, 200);
        assert.equal((await user.post(`/api/likes/${songs[1]._id}`)).status, 200);
        const list = await user.get('/api/likes');
        assert.equal(list.body.songs.length, 2);
        assert.equal(list.body.songs[0].title, 'Beta Tune'); // most recent first
        assert.equal((await user.delete(`/api/likes/${id}`)).status, 200);
        assert.equal((await user.get('/api/likes')).body.songs.length, 1);
        assert.equal((await user.post(`/api/likes/${new mongoose.Types.ObjectId()}`)).status, 404);
    });

    test('recently played records plays, de-duplicates and stores duration', async () => {
        await user.post(`/api/music/${songs[0]._id}/play`).send({ duration: 215.4 });
        await user.post(`/api/music/${songs[1]._id}/play`).send({});
        await user.post(`/api/music/${songs[0]._id}/play`).send({});
        const recent = await user.get('/api/music/recent');
        assert.deepEqual(recent.body.songs.map((s) => s.title), ['Alpha Song', 'Beta Tune']);
        const song = await user.get(`/api/music/${songs[0]._id}`);
        assert.equal(song.body.song.plays, 2);
        assert.equal(song.body.song.duration, 215);
    });

    test('playlists: create, edit, add/remove songs, privacy, delete', async () => {
        assert.equal((await user.post('/api/playlists').send({})).status, 400);
        const created = await user.post('/api/playlists').send({ name: 'Road Trip', description: 'Drive' });
        assert.equal(created.status, 201);
        const pid = created.body.playlist._id;

        assert.equal((await user.post(`/api/playlists/${pid}/songs`).send({ songId: songs[0]._id })).status, 201);
        assert.equal((await user.post(`/api/playlists/${pid}/songs`).send({ songId: songs[0]._id })).status, 409);
        assert.equal((await user.post(`/api/playlists/${pid}/songs`).send({ songId: songs[1]._id })).status, 201);
        assert.equal((await user.post(`/api/playlists/${pid}/songs`).send({ songId: new mongoose.Types.ObjectId() })).status, 404);

        const edit = await user.patch(`/api/playlists/${pid}`).send({ name: 'Road Trip 2', isPublic: false });
        assert.equal(edit.body.playlist.name, 'Road Trip 2');

        const detail = await user.get(`/api/playlists/${pid}`);
        assert.equal(detail.body.playlist.songs.length, 2);
        assert.equal(detail.body.playlist.isOwner, true);

        const mine = await user.get('/api/playlists');
        assert.equal(mine.body.playlists[0].songCount, 2);

        // another user cannot see a private playlist or modify it
        assert.equal((await artist.get(`/api/playlists/${pid}`)).status, 403);
        assert.equal((await artist.patch(`/api/playlists/${pid}`).send({ name: 'hijack' })).status, 403);
        assert.equal((await artist.delete(`/api/playlists/${pid}`)).status, 403);

        // public playlists become visible and featured
        await user.patch(`/api/playlists/${pid}`).send({ isPublic: true });
        assert.equal((await artist.get(`/api/playlists/${pid}`)).body.playlist.isOwner, false);
        assert.equal((await artist.get('/api/playlists/featured')).body.playlists.length, 1);

        assert.equal((await user.delete(`/api/playlists/${pid}/songs/${songs[0]._id}`)).status, 200);
        assert.equal((await user.delete(`/api/playlists/${pid}/songs/${songs[0]._id}`)).status, 404);
        assert.equal((await user.delete(`/api/playlists/${pid}`)).status, 200);
        assert.equal((await user.get(`/api/playlists/${pid}`)).status, 404);
    });

    test('profile: stats, update username/image, conflicts and validation', async () => {
        const profile = await user.get('/api/users/profile');
        assert.equal(profile.status, 200);
        assert.equal(profile.body.stats.likedSongs, 1);
        assert.equal(profile.body.stats.recentlyPlayed, 2);
        assert.ok(Array.isArray(profile.body.topGenres));

        const ok = await user.patch('/api/users/profile').send({ username: 'listener2', profileImage: 'https://example.com/me.png' });
        assert.equal(ok.body.user.username, 'listener2');
        assert.equal((await user.patch('/api/users/profile').send({ username: 'artistone' })).status, 409);
        assert.equal((await user.patch('/api/users/profile').send({ username: 'a' })).status, 400);
        assert.equal((await user.patch('/api/users/profile').send({ profileImage: 'javascript:alert(1)' })).status, 400);
        assert.equal((await user.patch('/api/users/profile').send({})).status, 400);
    });

    test('unknown API route -> JSON 404; malformed JSON -> 400', async () => {
        assert.equal((await request(app).get('/api/nope')).status, 404);
        const bad = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{bad');
        assert.equal(bad.status, 400);
    });
});
