// Seeds DEMO content for local development.
// Audio: SoundHelix example tracks (algorithmically generated, offered by soundhelix.com for testing).
// Artists, albums and titles below are fictional. Check SoundHelix's terms before any public deployment.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../db/db');
const Music = require('../models/music.model');
const User = require('../models/user.model');
const Playlist = require('../models/playlist.model');

const AUDIO = (n) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;
const COVER = (seed) => `https://picsum.photos/seed/${seed}/400/400`;

const DEMO_SONGS = [
    ['Neon Skyline', 'Aurora Vale', 'Demo Sessions Vol. 1', 'Electronic'],
    ['Midnight Transit', 'Aurora Vale', 'Demo Sessions Vol. 1', 'Electronic'],
    ['Glass Horizon', 'Aurora Vale', 'Demo Sessions Vol. 2', 'Ambient'],
    ['Paper Moons', 'The Paper Moons', 'Demo Sessions Vol. 2', 'Indie'],
    ['Slow Orbit', 'The Paper Moons', 'Demo Sessions Vol. 2', 'Indie'],
    ['Harbor Lights', 'Neon Harbor', 'Demo Sessions Vol. 3', 'Synthwave'],
    ['Chrome Daydream', 'Neon Harbor', 'Demo Sessions Vol. 3', 'Synthwave'],
    ['Quiet Engines', 'Echo Meridian', 'Demo Sessions Vol. 3', 'Ambient'],
    ['Lantern Walk', 'Echo Meridian', 'Demo Sessions Vol. 4', 'Chillout'],
    ['Afterglow', 'Lumen Drift', 'Demo Sessions Vol. 4', 'Chillout'],
    ['Static Bloom', 'Lumen Drift', 'Demo Sessions Vol. 4', 'Electronic'],
    ['Compass Rose', 'Kite & Compass', 'Demo Sessions Vol. 5', 'Folk'],
    ['River Cartography', 'Kite & Compass', 'Demo Sessions Vol. 5', 'Folk'],
    ['Copper Sky', 'Marlowe Hart', 'Demo Sessions Vol. 6', 'Jazz'],
    ['Blue Hour Waltz', 'Marlowe Hart', 'Demo Sessions Vol. 6', 'Jazz'],
    ['Last Train Home', 'Marlowe Hart', 'Demo Sessions Vol. 6', 'Jazz'],
];

const DEMO_PLAYLISTS = [
    { name: 'Demo: Focus Flow', description: 'Ambient and chillout demo tracks.', genres: ['Ambient', 'Chillout'] },
    { name: 'Demo: Night Drive', description: 'Electronic and synthwave demo tracks.', genres: ['Electronic', 'Synthwave'] },
    { name: 'Demo: Acoustic Corner', description: 'Folk, indie and jazz demo tracks.', genres: ['Folk', 'Indie', 'Jazz'] },
];

async function seed() {
    await connectDB();

    let added = 0;
    for (let i = 0; i < DEMO_SONGS.length; i++) {
        const [title, artist, album, genre] = DEMO_SONGS[i];
        const result = await Music.updateOne(
            { uri: AUDIO(i + 1) },
            {
                $setOnInsert: {
                    title,
                    artist,
                    album,
                    genre,
                    uri: AUDIO(i + 1),
                    coverImage: COVER(album.replace(/\W+/g, '-').toLowerCase()),
                    releaseDate: new Date('2025-01-01'),
                },
            },
            { upsert: true }
        );
        if (result.upsertedCount) added++;
    }
    console.log(`Songs: ${added} added, ${DEMO_SONGS.length - added} already present`);

    if (process.env.NODE_ENV === 'production') {
        console.log('Production mode: skipping demo user and playlists.');
        return;
    }

    let demo = await User.findOne({ email: 'demo@example.com' });
    if (!demo) {
        demo = await User.create({
            username: 'demo',
            email: 'demo@example.com',
            password: await bcrypt.hash('Demo12345!', 10),
        });
        console.log('Created demo user -> demo@example.com / Demo12345!');
    }

    for (const p of DEMO_PLAYLISTS) {
        if (await Playlist.exists({ owner: demo._id, name: p.name })) continue;
        const songs = await Music.find({ genre: { $in: p.genres } }).select('_id');
        await Playlist.create({
            name: p.name,
            description: p.description,
            owner: demo._id,
            isPublic: true,
            songs: songs.map((s) => s._id),
        });
        console.log(`Created featured playlist: ${p.name}`);
    }
}

seed()
    .catch((err) => {
        console.error('Seed failed:', err.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
