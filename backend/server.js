// backend/server.js (FINAL DENGAN CORS UNTUK VERCELL)

// --- FIX ---
const dotenv = require('dotenv');
dotenv.config(); // HARUS DIJALANKAN PALING PERTAMA
// -----------

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Tetap di-require di sini

// Sekarang variabel .env sudah dimuat,
// kita aman meng-impor file-file ini
require('./mqttHandler'); 
const connectDB = require('./config/db'); 

const dataRoutes = require('./routes/dataRoutes');
const { errorHandler } = require('./middleware/errorHandler');

// Panggil koneksi DB (yang sekarang akan berhasil)
connectDB();

const app = express();

// --- KONFIGURASI CORS YANG BENAR UNTUK VERCELL & LOKAL ---

// 1. Definisikan domain yang diizinkan (Whitelist)
const whitelist = [
    'http://localhost:5173',          // Izinkan Vite lokal (ganti port jika beda)
    'https://wazap-tau.vercel.app',   // URL Vercel Anda
    'https://wazap.biz.id'            // Production domain
];

// 2. Buat Opsi CORS
const corsOptions = {
    origin: function (origin, callback) {
        // Cek apakah 'origin' (domain pengirim) ada di whitelist
        // '!origin' ditambahkan untuk mengizinkan request dari Postman/curl
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true); // Izinkan
        } else {
            callback(new Error('Tidak diizinkan oleh CORS')); // Tolak
        }
    }
};

// 3. Gunakan CORS dengan opsi yang sudah dibuat
app.use(cors(corsOptions));

// ----------------------------------------------------

// Ini harus SETELAH konfigurasi cors
app.use(express.json());

app.use('/api/data', dataRoutes); // Endpoint untuk menerima data STM32

app.use(errorHandler); // Middleware error handling

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
