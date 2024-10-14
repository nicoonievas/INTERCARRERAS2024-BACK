const connectDB = require('./db');
const { initMqttClient } = require('./mqttService');

// Conectar a la base de datos
connectDB();

// Inicializar el cliente MQTT
initMqttClient();