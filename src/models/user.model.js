const mongoose = require('mongoose');

const recentlySchema = new mongoose.Schema(
    {
        song: { type: mongoose.Schema.Types.ObjectId, ref: 'music', required: true },
        playedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        role: {
            type: String,
            enum: ['user', 'artist'],
            default: 'user',
        },
        profileImage: { type: String, default: '' },
        likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'music' }],
        recentlyPlayed: [recentlySchema],
    },
    { timestamps: true, versionKey: false }
);

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
