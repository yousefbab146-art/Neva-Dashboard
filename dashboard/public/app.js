// ============================================================
// NEVA MASTER NETWORK - MASTER DASHBOARD CLIENT
// ============================================================

const API = '';
let currentGuildData = null;

const app = {
    init() {
        this.setupNavigation();
        this.fetchGuildData();
        lucide.createIcons();
    },

    setupNavigation() {
        // Main Nav Buttons
        document.querySelectorAll('.nav-btn, .sub-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = btn.getAttribute('data-target');
                if (targetId) this.navigateTo(targetId);
            });
        });
    },

    navigateTo(targetId) {
        document.querySelectorAll('.nav-btn, .sub-nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active', 'animate-fade-in'));

        const targetBtn = document.querySelector(`[data-target="${targetId}"]`);
        if (targetBtn) targetBtn.classList.add('active');

        const targetPage = document.getElementById(targetId);
        if (targetPage) {
            targetPage.classList.add('active');
            setTimeout(() => targetPage.classList.add('animate-fade-in'), 10);
        }

        if (targetId === 'ticket-live') this.loadTickets();
        if (targetId === 'ticket-ratings') this.loadRatings();
    },

    toggleGroup(subId) {
        const subMenu = document.getElementById(subId);
        if (subMenu) subMenu.classList.toggle('open');
    },

    async fetchGuildData() {
        try {
            const res = await fetch(`${API}/api/guilds/current`);
            const data = await res.json();

            currentGuildData = data;

            document.getElementById('currentGuildName').innerText = data.guild.name;
            document.getElementById('stat-members').innerText = data.guild.memberCount;
            document.getElementById('stat-tickets-count').innerText = data.stats.totalTickets || 0;
            document.getElementById('stat-modlogs-count').innerText = data.stats.totalModLogs || 0;

            // SMART BOT DETECTION & UI LOCKING
            const modBot = data.bots.moderation;
            const ticketBot = data.bots.ticket;

            const badgeMod = document.getElementById('badge-mod');
            if (modBot.installed) {
                badgeMod.className = 'bot-badge active-badge';
                badgeMod.innerText = '🟢 Aktif';
            } else {
                badgeMod.className = 'bot-badge locked-badge';
                badgeMod.innerText = '🔒 Ekli Değil';
            }

            const badgeTicket = document.getElementById('badge-ticket');
            if (ticketBot.installed) {
                badgeTicket.className = 'bot-badge active-badge';
                badgeTicket.innerText = '🟢 Aktif';
            } else {
                badgeTicket.className = 'bot-badge locked-badge';
                badgeTicket.innerText = '🔒 Ekli Değil';
            }

            this.populateSelects(data.channels, data.categories, data.roles);
            this.renderModSettings(data.modSettings);
            this.renderTicketSettings(data.ticketSettings);

        } catch (e) {
            console.error(e);
            this.showToast('Merkezi sunucuya bağlanılamadı.', 'error');
        }
    },

    populateSelects(channels = [], categories = [], roles = []) {
        const channelHtml = '<option value="">-- Kanal Seçilmedi --</option>' + channels.map(c => `<option value="${c.id}"># ${c.name}</option>`).join('');
        const categoryHtml = '<option value="">-- Kategori Seçilmedi --</option>' + categories.map(c => `<option value="${c.id}">📁 ${c.name}</option>`).join('');
        const roleHtml = '<option value="">-- Rol Seçilmedi --</option>' + roles.map(r => `<option value="${r.id}">@ ${r.name}</option>`).join('');

        document.querySelectorAll('.channel-select').forEach(s => s.innerHTML = channelHtml);
        document.querySelectorAll('.category-select').forEach(s => s.innerHTML = categoryHtml);
        document.querySelectorAll('.role-select').forEach(s => s.innerHTML = roleHtml);
    },

    renderModSettings(s) {
        if (!s) return;
        document.getElementById('log-ban').value = s.banLogChannel || '';
        document.getElementById('log-mute').value = s.muteLogChannel || '';
        document.getElementById('log-kick').value = s.kickLogChannel || '';
        document.getElementById('log-warn').value = s.warnLogChannel || '';
        document.getElementById('log-message').value = s.messageLogChannel || '';
        document.getElementById('log-voice').value = s.voiceLogChannel || '';
        document.getElementById('log-member').value = s.memberLogChannel || '';

        document.getElementById('guard-antibot').checked = !!s.guard?.antiBotJoin;
        document.getElementById('guard-antiraid').checked = !!s.automod?.antiRaid;

        document.getElementById('jtc-enabled').checked = !!s.tempVoice?.enabled;
        document.getElementById('jtc-channel').value = s.tempVoice?.createChannelId || '';
        document.getElementById('jtc-banner').value = s.tempVoice?.bannerUrl || '';

        this.renderAutoModBadWords(s);
    },

    renderAutoModBadWords(s) {
        const am = s.automod || {};
        const badWords = s.badWords || ['amk', 'sik', 'piç', 'yarrak', 'orospu'];

        const badWordsListHtml = badWords.map((word, index) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #161616; border: 1px solid #333; border-radius: 6px; margin-bottom: 6px;">
                <span style="font-weight: 600; color: #f59e0b; font-size: 0.9rem;">${index + 1}. <span style="color: #fff; font-weight: 400;">${word}</span></span>
                <button class="icon-btn" onclick="app.removeBadWord('${word}')" style="width: 28px; height: 28px;" title="Sil">
                    <i data-lucide="trash-2" style="width: 14px; height: 14px; color: var(--danger)"></i>
                </button>
            </div>
        `).join('');

        const html = `
            <div class="setting-item" style="flex-direction: column; align-items: flex-start; gap: 16px;">
                <div style="display: flex; justify-content: space-between; width: 100%;">
                    <div>
                        <h3><i data-lucide="message-square-off" style="width:16px;"></i> Küfür Koruması</h3>
                        <p>Kapsamlı Türkçe + İngilizce engelleme listesi.</p>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="am-swear" ${am.filterProfanity ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div style="width: 100%; background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 16px;">
                    <h4 style="color: #f59e0b; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="shield-alert" style="width:16px;"></i> Engellenecek Kelimeler Listesi (Sıralı)
                    </h4>
                    <div style="display: flex; gap: 10px; margin-bottom: 16px;">
                        <input type="text" id="new-bad-word" placeholder="Yeni engellenecek kelime..." class="sleek-input" style="flex: 1;">
                        <button class="action-btn primary" onclick="app.addBadWord()" style="background: #f59e0b; color: #000; font-weight: 700;">
                            + Ekle
                        </button>
                    </div>
                    <div style="max-height: 250px; overflow-y: auto;">
                        ${badWordsListHtml}
                    </div>
                </div>
            </div>
            <button class="save-btn" onclick="app.saveAutoMod()"><i data-lucide="save"></i> Oto-Mod Kaydet</button>
        `;
        document.getElementById('automod-container').innerHTML = html;
        lucide.createIcons();
    },

    renderTicketSettings(s) {
        if (!s) return;
        document.getElementById('tset-category').value = s.ticketCategory || '';
        document.getElementById('tset-role').value = s.supportRoleId || '';
        document.getElementById('tset-log').value = s.logChannel || '';
        document.getElementById('tset-banner').value = s.panelBanner || '';
    },

    async saveModLogs() {
        const payload = {
            guildId: currentGuildData?.guild?.id,
            banLogChannel: document.getElementById('log-ban').value || null,
            muteLogChannel: document.getElementById('log-mute').value || null,
            kickLogChannel: document.getElementById('log-kick').value || null,
            warnLogChannel: document.getElementById('log-warn').value || null,
            messageLogChannel: document.getElementById('log-message').value || null,
            voiceLogChannel: document.getElementById('log-voice').value || null,
            memberLogChannel: document.getElementById('log-member').value || null
        };
        await this.postSettings('/api/settings/moderation', payload, 'Log kanalları kaydedildi!');
    },

    async saveGuard() {
        const payload = {
            guildId: currentGuildData?.guild?.id,
            guard: { antiBotJoin: document.getElementById('guard-antibot').checked },
            automod: { ...currentGuildData?.modSettings?.automod, antiRaid: document.getElementById('guard-antiraid').checked }
        };
        await this.postSettings('/api/settings/moderation', payload, 'Guard ayarları kaydedildi!');
    },

    async saveTempVoice() {
        const payload = {
            guildId: currentGuildData?.guild?.id,
            tempVoice: {
                enabled: document.getElementById('jtc-enabled').checked,
                createChannelId: document.getElementById('jtc-channel').value || null,
                bannerUrl: document.getElementById('jtc-banner').value || null
            }
        };
        await this.postSettings('/api/settings/moderation', payload, 'Geçici Ses Odaları kaydedildi!');
    },

    async saveAutoMod() {
        const payload = {
            guildId: currentGuildData?.guild?.id,
            automod: {
                ...currentGuildData?.modSettings?.automod,
                filterProfanity: document.getElementById('am-swear').checked
            }
        };
        await this.postSettings('/api/settings/moderation', payload, 'Oto-Mod kaydedildi!');
    },

    async addBadWord() {
        const word = document.getElementById('new-bad-word').value.trim().toLowerCase();
        if (!word) return;
        const words = currentGuildData?.modSettings?.badWords || [];
        if (!words.includes(word)) {
            words.push(word);
            await this.postSettings('/api/settings/moderation', { guildId: currentGuildData?.guild?.id, badWords: words }, `"${word}" eklendi!`);
            this.fetchGuildData();
        }
    },

    async removeBadWord(word) {
        let words = currentGuildData?.modSettings?.badWords || [];
        words = words.filter(w => w.toLowerCase() !== word.toLowerCase());
        await this.postSettings('/api/settings/moderation', { guildId: currentGuildData?.guild?.id, badWords: words }, `"${word}" silindi.`);
        this.fetchGuildData();
    },

    async saveTicketSettings() {
        const payload = {
            guildId: currentGuildData?.guild?.id,
            ticketCategory: document.getElementById('tset-category').value || null,
            supportRoleId: document.getElementById('tset-role').value || null,
            logChannel: document.getElementById('tset-log').value || null,
            panelBanner: document.getElementById('tset-banner').value || null
        };
        await this.postSettings('/api/settings/ticket', payload, 'Bilet ayarları kaydedildi!');
    },

    async postSettings(url, payload, successMsg) {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) this.showToast(successMsg, 'success');
        } catch (e) {
            this.showToast('Hata oluştu', 'error');
        }
    },

    async loadTickets() {
        try {
            const res = await fetch('/api/tickets');
            const tickets = await res.json();
            const tbody = document.getElementById('ticket-table-body');
            tbody.innerHTML = '';
            tickets.forEach(t => {
                tbody.innerHTML += `
                    <tr>
                        <td><span class="bot-badge ${t.status === 'open' ? 'active-badge' : 'locked-badge'}">${t.status.toUpperCase()}</span></td>
                        <td>${t.userTag || t.userId}</td>
                        <td>${t.category}</td>
                        <td>${t.claimedBy ? `<@${t.claimedBy}>` : 'Yok'}</td>
                        <td>${t.rating ? `${t.rating} ⭐` : 'Yok'}</td>
                        <td>${new Date(t.createdAt).toLocaleString('tr-TR')}</td>
                    </tr>
                `;
            });
        } catch (e) {}
    },

    async loadRatings() {
        try {
            const res = await fetch('/api/ratings');
            const ratings = await res.json();
            const tbody = document.getElementById('ratings-table-body');
            tbody.innerHTML = '';
            ratings.forEach((r, i) => {
                tbody.innerHTML += `
                    <tr>
                        <td>#${i + 1}</td>
                        <td><@${r.staffId}></td>
                        <td>${r.totalRatings} Değerlendirme</td>
                        <td><strong style="color: #f59e0b">${r.averageRating} ⭐</strong></td>
                    </tr>
                `;
            });
        } catch (e) {}
    },

    async refreshData() {
        await this.fetchGuildData();
        this.showToast('Tüm ağ verileri yenilendi', 'success');
    },

    showToast(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i> <span>${msg}</span>`;
        container.appendChild(toast);
        lucide.createIcons();
        setTimeout(() => toast.remove(), 3000);
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
