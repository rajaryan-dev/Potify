const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        description: { type: String, trim: true, maxlength: 300, default: '' },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true },
        songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'music' }],
        isPublic: { type: Boolean, default: false },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('playlist', playlistSchema);
