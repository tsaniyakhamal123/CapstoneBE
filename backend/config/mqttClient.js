const mqtt = require('mqtt');

// Ganti dengan URL broker kamu
// Contoh: mqtt://broker.emqx.io:1883  atau wss://xxx.cloudmqtt.com:port
const MQTT_URL = 'mqtt://test.mosquitto.org:1883';
const TOPIC = 'Caps/coba/aja123'; // topik tempat publish & subscribe

// Jika broker kamu pakai username & password
// const options = {
//   username: 'YOUR_MQTT_USERNAME',
//   password: 'YOUR_MQTT_PASSWORD',
//   clientId: 'backend-' + Math.random().toString(16).substring(2, 8)
// };

const client = mqtt.connect(MQTT_URL);

client.on('connect', () => {
  console.log('Connected to MQTT Broker');
  client.subscribe(TOPIC, (err) => {
    if (!err) console.log(`Subscribed to topic: ${TOPIC}`);
  });
});

client.on('error', (err) => {
  console.error('MQTT Connection error:', err);
});

module.exports = client;
