const mongoose = require('mongoose');

const GuildSettingsSchema = new mongoose.Schema({
    guildId:          { type: String, required: true, unique: true },
    prefix:           { type: String, default: '!' },
    logChannel:       { type: String, default: null },
    modLogChannel:    { type: String, default: null },
    
    banLogChannel:    { type: String, default: null },
    muteLogChannel:   { type: String, default: null },
    kickLogChannel:   { type: String, default: null },
    warnLogChannel:   { type: String, default: null },
    messageLogChannel:{ type: String, default: null },
    voiceLogChannel:  { type: String, default: null },
    memberLogChannel: { type: String, default: null },

    tempVoice: {
        enabled:    { type: Boolean, default: false },
        categoryId: { type: String, default: null },
        createChannelId: { type: String, default: null },
        userLimit:  { type: Number, default: 16 },
        bannerUrl:  { type: String, default: null }
    },

    levelSystem: {
        enabled:    { type: Boolean, default: true },
        logChannel: { type: String, default: null },
        rewards:    [{ level: Number, roleId: String }]
    },

    whitelist: {
        channels: [String],
        roles:    [String]
    },

    automod: {
        enabled:         { type: Boolean, default: true },
        filterProfanity: { type: Boolean, default: true },
        filterLinks:     { type: Boolean, default: true },
        filterInvites:   { type: Boolean, default: true },
        antiSpam:        { type: Boolean, default: true },
        antiCaps:        { type: Boolean, default: false },
        antiRaid:        { type: Boolean, default: true }
    },

    guard: {
        antiBotJoin:        { type: Boolean, default: true },
        accountAgeDays:     { type: Number, default: 7 },
        actionOnYoungAccount: { type: String, default: 'quarantine' }
    },

    autoRole: {
        enabled: { type: Boolean, default: false },
        userRoleId: { type: String, default: null },
        botRoleId:  { type: String, default: null }
    },

    badWords: { 
        type: [String], 
        default: [
            'amk', 'aq', 'amq', 'amına', 'amınakoyayım', 'amınagoyayım', 'sik', 'sikik', 'sikerim', 
            'siktim', 'sikiş', 'siktir', 'piç', 'yarrak', 'yarak', 'orospu', 'göt', 'götveren', 
            'oç', 'kahpe', 'dalyarak', 'ibne', 'taşşak', 'puşt', 'yavşak', 'gavat', 'yarram',
            'fuck', 'fucking', 'bitch', 'shit', 'asshole', 'cunt', 'dick', 'bastard', 'slut', 
            'whore', 'motherfucker', 'nigger', 'cock', 'pussy'
        ] 
    }
}, { timestamps: true });

module.exports = mongoose.model('GuildSettings', GuildSettingsSchema);
