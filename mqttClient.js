import mqtt from 'mqtt';

const client = mqtt.connect('mqtt://test.mosquitto.org');

client.on('connect', () => {
    console.log('Conectado al broker MQTT');
});

client.on('error', (error) => {
    console.error('Error en la conexión MQTT:', error);
});

export default client;