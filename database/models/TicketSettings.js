const mongoose = require('mongoose');

const TicketSettingsSchema = new mongoose.Schema({
    guildId:        { type: String, required: true, unique: true },
    ticketCategory: { type: String, default: null },
    logChannel:     { type: String, default: null },
    supportRoleId:  { type: String, default: null },
    panelTitle:       { type: String, default: '✨ NEVA DESTEK MERKEZİ' },
    panelDescription: { type: String, default: '> **Sunucumuzda yardım ve destek almak için aşağıdaki menüyü kullanabilirsiniz.**' },
    panelBanner:      { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('TicketSettings', TicketSettingsSchema);
