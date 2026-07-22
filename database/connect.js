const mongoose = require('mongoose');

async function connectDB() {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.log('[DB] MONGO_URI ayarlanmamış.');
            return;
        }
        await mongoose.connect(uri);
        console.log('[DB] Neva Master Network MongoDB veritabanı bağlantısı başarılı!');
    } catch (err) {
        console.error('[DB] Bağlantı hatası:', err.message);
    }
}

module.exports = connectDB;
