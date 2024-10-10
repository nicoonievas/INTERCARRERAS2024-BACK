const mqtt = require('mqtt');
const { db } = require('./config'); // Importar la conexión de MongoDB existente
const { updateEnvironmentData } = require('./petLogic'); // Asegúrate de que esta función esté exportada correctamente

// URL del broker MQTT
const brokerUrl = 'mqtt://broker.hivemq.com'; // Puedes usar el broker que prefieras

// Crear cliente MQTT
const client = mqtt.connect(brokerUrl);

// Canales a suscribirse
const topic1 = 'test23';
const topic2 = 'test24';
const topic3 = 'test25';

// Conectar a MQTT
client.on('connect', () => {
    console.log('Conectado al broker MQTT');

    // Suscribirse a los canales
    client.subscribe([topic1, topic2], (err) => {
        if (!err) {
            console.log(`Suscrito a los canales: ${topic1}, ${topic2} y ${topic3}`);
        } else {
            console.error('Error al suscribirse a los canales:', err);
        }
    });
});

// Manejar los mensajes de MQTT
client.on('message', async (topic, message) => {
    console.log(`Mensaje recibido del canal ${topic}: ${message.toString()}`);
    const newData = JSON.parse(message);

    if (topic === topic1) {
        console.log('Procesando datos del canal test23');
        await updateEnvironmentData(newData, db); // Usa la conexión de db ya existente
    } else if (topic === topic2) {
        console.log('Procesando datos del canal test24');

    } else if (topic === topic3) {
        console.log('Procesando datos del canal test25');
        
    }
});
// Manejar errores de MQTT
client.on('error', (err) => {
    console.error('Error de conexión:', err);
});

module.exports = client;