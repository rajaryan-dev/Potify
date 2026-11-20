const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 150 },
        artist: { type: String, required: true, trim: true, maxlength: 100 },
        album: { type: String, trim: true, maxlength: 150, default: '' },
        coverImage: { type: String, default: '' },
        // Audio URL (field name kept from the original schema)
        uri: { type: String, required: true },
        genre: { type: String, trim: true, maxlength: 50, default: '' },
        // seconds; filled in from the player the first time a track is played if unknown
        duration: { type: Number, min: 0, default: 0 },
        releaseDate: { type: Date },
        plays: { type: Number, default: 0 },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    },
    { timestamps: true, versionKey: false }
);

musicSchema.index({ title: 1 });
musicSchema.index({ artist: 1 });
musicSchema.index({ album: 1 });

module.exports = mongoose.model('music', musicSchema);
