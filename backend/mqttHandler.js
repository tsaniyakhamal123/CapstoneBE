// backend/mqttHandler.js
const client = require('./config/mqttClient');
const Data = require('./models/Data');

client.on('connect', () => {
  console.log('✅ MQTT Handler aktif dan siap menerima data');
});

client.on('message', async (topic, message) => {
  try {
    // --- 1️⃣ Ubah buffer ke string dan bersihkan karakter aneh ---
    let payload = message.toString().trim();
    payload = payload.replace(/[\u0000-\u001F]+/g, ""); // hapus karakter kontrol

    // --- 2️⃣ Ambil bagian JSON valid (berhenti di kurung tutup terakhir) ---
    const lastBrace = payload.lastIndexOf('}');
    if (lastBrace !== -1) {
      payload = payload.substring(0, lastBrace + 1);
    }

    // --- 3️⃣ Parse JSON ---
    const data = JSON.parse(payload);
    console.log('📥 MQTT payload diterima:', data);

    // --- 4️⃣ Dukungan format fleksibel (pakai "data" atau langsung flat) ---
    const body = data.data ? data.data : data;
    const { voltage, current, force, power, timestamp } = body;

    // --- 5️⃣ Validasi sederhana ---
    if (
      voltage == null ||
      current == null ||
      force == null ||
      power == null
    ) {
      console.warn('⚠️ Missing required fields:', body);
      return;
    }

    // --- 6️⃣ Simpan ke MongoDB ---
    const newData = new Data({
      voltage,
      current,
      force,
      power,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    await newData.save();
    console.log('✅ Data berhasil disimpan ke MongoDB');

  } catch (err) {
    console.error('❌ Error processing MQTT message:', err.message);
    console.log('⚠️ Raw message:', message.toString());
  }
});
