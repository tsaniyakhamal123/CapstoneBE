// File: backend/mqttHandler.js (PERBAIKAN)

const client = require('./config/mqttClient');
const Data = require('./models/Data');

// ... (kode client.on('connect') Anda tetap sama) ...
client.on('connect', () => {
  console.log('✅ MQTT Handler aktif dan siap menerima data');
  // ... (kode subscribe Anda) ...
});


// UBAH BAGIAN INI
client.on('message', async (topic, message) => {

  // 1. Terima dan log payload mentah DULUAN
  let payload = message.toString().trim();
  console.log(`📥 PESAN DITERIMA di ${topic}:`);
  console.log(`   Payload Mentah: ${payload}`);

  try {
    // 2. Bersihkan karakter aneh (dari kode lama Anda)
    payload = payload.replace(/[\u0000-\u001F]+/g, ""); 
    const lastBrace = payload.lastIndexOf('}');
    if (lastBrace !== -1) {
      payload = payload.substring(0, lastBrace + 1);
    }

    // 3. Sekarang baru coba parse
    const data = JSON.parse(payload);
    console.log('   Payload JSON valid:', data);

    // 4. Simpan ke DB
    const body = data.data ? data.data : data;
    const { voltage, current, force, power, timestamp } = body;

    // (Validasi Anda, dll...)

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
    // 4. Jika parse gagal, kita tetap tahu karena log pertama sudah jalan
    console.error('❌ Error processing MQTT message:', err.message);
    console.log('   (Payload mentah yang gagal ada di atas)');
  }
});
