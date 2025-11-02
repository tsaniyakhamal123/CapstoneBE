// config/mqttClient.js (Full Code)

const mqtt = require('mqtt');

// 1. Ambil URL broker dari file .env
// Ini akan membaca 'mqtt://127.0.0.1:1883' dari .env Anda
const MQTT_URL = process.env.MQTT_BROKER;

// 2. Buat koneksi ke broker (127.0.0.1)
// Kita tidak mengirim 'options' (username/password)
// karena broker lokal Anda tidak membutuhkannya.
const client = mqtt.connect(MQTT_URL);

// 3. Langsung export client agar bisa dipakai file lain
module.exports = client;
