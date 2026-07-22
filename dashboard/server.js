const express = require('express');
const cors = require('cors');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');
const connectDB = require('../database/connect');

const GuildSettings = require('../database/models/GuildSettings');
const TicketSettings = require('../database/models/TicketSettings');
const TicketData = require('../database/models/TicketData');
const StaffRating = require('../database/models/StaffRating');
const ModLog = require('../database/models/ModLog');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Discord Clients for status & channel/role fetching
const modClient = new Client({ intents: [GatewayIntentBits.Guilds] });
const ticketClient = new Client({ intents: [GatewayIntentBits.Guilds] });

let modBotActive = false;
let ticketBotActive = false;

if (process.env.MODERATION_BOT_TOKEN) {
    modClient.login(process.env.MODERATION_BOT_TOKEN)
        .then(() => { modBotActive = true; console.log('[Master Server] Moderation Bot bağlı!'); })
        .catch(() => console.log('[Master Server] Moderation Bot token verilmedi veya bağlanamadı.'));
}

if (process.env.TICKET_BOT_TOKEN) {
    ticketClient.login(process.env.TICKET_BOT_TOKEN)
        .then(() => { ticketBotActive = true; console.log('[Master Server] Ticket Bot bağlı!'); })
        .catch(() => console.log('[Master Server] Ticket Bot token verilmedi veya bağlanamadı.'));
}

connectDB();

// Serve Static Files
const buildPath = path.join(__dirname, 'public');
if (require('fs').existsSync(buildPath)) {
    app.use(express.static(buildPath));
}

// API: System Status & Bot Detection
app.get('/api/status', (req, res) => {
    res.json({
        moderationBot: {
            online: modBotActive && modClient.isReady(),
            tag: modClient.user?.tag || 'Neva Moderation',
            ping: modClient.ws.ping || 0
        },
        ticketBot: {
            online: ticketBotActive && ticketClient.isReady(),
            tag: ticketClient.user?.tag || 'Neva Ticket',
            ping: ticketClient.ws.ping || 0
        },
        uptime: process.uptime()
    });
});

// API: Current Guild Information & Smart Bot Detection
app.get('/api/guilds/current', async (req, res) => {
    // Primary client: modClient if ready, else ticketClient
    const activeClient = modClient.isReady() ? modClient : (ticketClient.isReady() ? ticketClient : null);
    const guild = activeClient ? activeClient.guilds.cache.first() : null;

    const guildId = guild ? guild.id : 'demo_guild';

    // Check if each bot is in the guild
    const hasModBot = modClient.isReady() && guild ? modClient.guilds.cache.has(guild.id) : true;
    const hasTicketBot = ticketClient.isReady() && guild ? ticketClient.guilds.cache.has(guild.id) : true;

    let modSettings = await GuildSettings.findOne({ guildId });
    if (!modSettings) modSettings = await GuildSettings.create({ guildId });

    let ticketSettings = await TicketSettings.findOne({ guildId });
    if (!ticketSettings) ticketSettings = await TicketSettings.create({ guildId });

    let channels = [];
    let categories = [];
    let roles = [];

    if (guild) {
        channels = guild.channels.cache.filter(c => c.isTextBased()).map(c => ({ id: c.id, name: c.name }));
        categories = guild.channels.cache.filter(c => c.type === 4).map(c => ({ id: c.id, name: c.name }));
        roles = guild.roles.cache.map(r => ({ id: r.id, name: r.name, color: r.hexColor }));
    }

    const openTickets = await TicketData.countDocuments({ guildId, status: 'open' });
    const totalTickets = await TicketData.countDocuments({ guildId });
    const totalModLogs = await ModLog.countDocuments({ guildId });

    res.json({
        guild: {
            id: guildId,
            name: guild ? guild.name : 'Neva Network Sunucusu',
            icon: guild ? guild.iconURL({ dynamic: true }) : null,
            memberCount: guild ? guild.memberCount : 0
        },
        bots: {
            moderation: { installed: hasModBot, status: modBotActive ? 'online' : 'offline' },
            ticket: { installed: hasTicketBot, status: ticketBotActive ? 'online' : 'offline' }
        },
        stats: {
            openTickets,
            totalTickets,
            totalModLogs
        },
        channels,
        categories,
        roles,
        modSettings,
        ticketSettings
    });
});

// API: Moderasyon Ayarları Kaydet
app.post('/api/settings/moderation', async (req, res) => {
    try {
        const guildId = req.body.guildId || 'demo_guild';
        const settings = await GuildSettings.findOneAndUpdate(
            { guildId },
            { $set: req.body },
            { upsert: true, returnDocument: 'after' }
        );
        res.json({ success: true, settings });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// API: Ticket Ayarları Kaydet
app.post('/api/settings/ticket', async (req, res) => {
    try {
        const guildId = req.body.guildId || 'demo_guild';
        const settings = await TicketSettings.findOneAndUpdate(
            { guildId },
            { $set: req.body },
            { upsert: true, returnDocument: 'after' }
        );
        res.json({ success: true, settings });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// API: Biletler & Ratingler & Loglar
app.get('/api/tickets', async (req, res) => {
    const tickets = await TicketData.find().sort({ createdAt: -1 }).limit(50);
    res.json(tickets);
});

app.get('/api/ratings', async (req, res) => {
    const ratings = await StaffRating.find().sort({ averageRating: -1, totalRatings: -1 });
    res.json(ratings);
});

app.get('/api/modlogs', async (req, res) => {
    const logs = await ModLog.find().sort({ createdAt: -1 }).limit(50);
    res.json(logs);
});

app.use((req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (require('fs').existsSync(indexPath)) res.sendFile(indexPath);
    else res.json({ message: 'Neva Master Dashboard API aktif.' });
});

app.listen(PORT, () => {
    console.log(`\n👑 [Neva Master Network] Ortak Web Paneli http://localhost:${PORT} adresinde aktif!`);
});
