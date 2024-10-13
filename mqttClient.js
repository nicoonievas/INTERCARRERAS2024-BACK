const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://test.mosquitto.org');

client.on('connect', () => {
    console.log('Conectado al broker MQTT');
});

client.on('error', (error) => {
    console.error('Error en la conexión MQTT:', error);
});

// Función para publicar en el tema test25
const publicarTest25 = (estado) => {
    try {
        client.publish('test25', JSON.stringify(estado)); // Publicar en test25
        console.log(`Datos enviados a test25: ${JSON.stringify(estado)}`);
    } catch (error) {
        console.error('Error al enviar datos a test25:', error);
    }
};

module.exports = { client, publicarTest25 };
