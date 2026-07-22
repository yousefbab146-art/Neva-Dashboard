const mongoose = require('mongoose');

const ModLogSchema = new mongoose.Schema({
    guildId:   { type: String, required: true },
    type:      { type: String, required: true },
    userId:    { type: String, required: true },
    moderator: { type: String, required: true },
    reason:    { type: String, default: 'Sebep belirtilmedi' }
}, { timestamps: true });

module.exports = mongoose.model('ModLog', ModLogSchema);
