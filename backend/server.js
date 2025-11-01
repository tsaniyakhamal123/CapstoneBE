// backend/server.js (SUDAH DIPERBAIKI)

// --- FIX ---
const dotenv = require('dotenv');
dotenv.config(); // HARUS DIJALANKAN PALING PERTAMA
// -----------

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Sekarang variabel .env sudah dimuat,
// kita aman meng-impor file-file ini
require('./mqttHandler'); 
const connectDB = require('./config/db'); 

const dataRoutes = require('./routes/dataRoutes');
const { errorHandler } = require('./middleware/errorHandler');

// Panggil koneksi DB (yang sekarang akan berhasil)
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/data', dataRoutes); // Endpoint untuk menerima data STM32

app.use(errorHandler); // Middleware error handling

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
