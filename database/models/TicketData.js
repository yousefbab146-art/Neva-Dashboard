const mongoose = require('mongoose');

const TicketDataSchema = new mongoose.Schema({
    guildId:      { type: String, required: true },
    channelId:    { type: String, required: true, unique: true },
    userId:       { type: String, required: true },
    userTag:      { type: String, default: '' },
    category:     { type: String, default: 'Genel' },
    status:       { type: String, default: 'open' },
    claimedBy:    { type: String, default: null },
    formAnswers:  [{ question: String, answer: String }],
    rating:       { type: Number, default: null },
    transcriptUrl:{ type: String, default: null },
    closedBy:     { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('TicketData', TicketDataSchema);
