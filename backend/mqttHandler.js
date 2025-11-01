const client = require('./config/mqttClient');
const Data = require('./models/Data');

// Ganti ini dengan topik Anda yang sebenarnya
const MQTT_TOPIC = "Caps/coba/aja123";

/**
 * ===================================================================
 * KONEKSI DAN SUBSCRIBE SAAT PERTAMA KALI TERHUBUNG
 * ===================================================================
 */
client.on('connect', () => {
  console.log('✅ MQTT Handler aktif dan siap menerima data');
  
  // Beritahu broker kita mau mendengarkan topik apa
  client.subscribe(MQTT_TOPIC, (err) => {
    if (!err) {
      console.log(`📈 Berhasil subscribe ke topik: ${MQTT_TOPIC}`);
    } else {
      console.error(`❌ Gagal subscribe ke topik: ${MQTT_TOPIC}`, err);
    }
  });
});


/**
 * ===================================================================
 * LOGIKA UTAMA: APA YANG HARUS DILAKUKAN SAAT PESAN MASUK
 * ===================================================================
 */
client.on('message', async (topic, message) => {

  // --- 1. LOG DATA MENTAH DULUAN (INI PERBAIKANNYA) ---
  // Kita ubah buffer ke string dan log SEBELUM melakukan hal lain
  let payload = message.toString().trim();
  console.log(`📥 PESAN DITERIMA di topik: ${topic}`);
  console.log(`   Payload Mentah: ${payload}`);


  try {
    // --- 2. Bersihkan payload dari karakter aneh ---
    payload = payload.replace(/[\u0000-\u001F]+/g, ""); // hapus karakter kontrol
    const lastBrace = payload.lastIndexOf('}');
    if (lastBrace !== -1) {
      payload = payload.substring(0, lastBrace + 1);
    }

    // --- 3. Coba Parse JSON ---
    const data = JSON.parse(payload);
    console.log('   Payload JSON valid:', data);

    // --- 4. Ambil data (mendukung format { "data": {...} } atau flat) ---
    const body = data.data ? data.data : data;
    const { voltage, current, force, power, timestamp } = body;

    // --- 5. Validasi sederhana ---
    if (
      voltage == null ||
      current == null ||
      force == null ||
      power == null
    ) {
      console.warn('⚠️ Data tidak lengkap, dilewati:', body);
      return; // Hentikan jika data penting tidak ada
    }

    // --- 6. Simpan ke MongoDB ---
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
    // --- 7. Tangkap Error (jika JSON.parse gagal, dll) ---
    console.error('❌ Error processing MQTT message:', err.message);
    console.log('   (Payload mentah yang gagal ada di log atas)');
  }
});

// Menangani error koneksi MQTT lainnya
client.on('error', (err) => {
  console.error('❌ Error Koneksi MQTT:', err.message);
});
