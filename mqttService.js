const client = require('./mqttClient');
const { broadcast } = require('./webSocketServer');
const Estados = require('./estadosModel');

// Umbrales de temperatura
const coldtemp = -3;    // Menor o igual a -3 °C = Frío
const idealtemp = 0;    // Entre 0°C y 5°C = Normal
const hottemp = 5;      // Mayor o igual a 5°C = Calor
const extremeHotTemp = 10;  // Mayor o igual a 10°C = Extremadamente caluroso
// Rango de humedad ideal para los pingüinos
const humidityLow = 30;  // Menor o igual a 30% = Incomodo
const humidityIdeal = 60; // Entre 30% y 60% = Ideal
const humidityHigh = 80;  // Mayor o igual a 80% = Incomodo

const subscribeToTopic = () => {
    client.subscribe('test23', (err) => {
        if (!err) {
            console.log('Suscrito al tema test23');
        } else {
            console.error('Error al suscribirse al tema:', err);
        }
    });
};

const determinarEstado = (temperatura, humedad) => {
    let estado;

    if (temperatura <= coldtemp) {
        estado = 'frio';
    } else if (temperatura > coldtemp && temperatura < idealtemp) {
        estado = 'normal'; // Estado normal en temperaturas cercanas a 0°C
    } else if (temperatura >= idealtemp && temperatura < hottemp) {
        estado = (humedad >= humidityLow && humedad <= humidityIdeal) ? 'normal' : 'incomodo';
    } else if (temperatura >= hottemp && temperatura < extremeHotTemp) {
        estado = (humedad >= humidityLow && humedad <= humidityIdeal) ? 'calor' : 'incomodo';
    } else {
        estado = 'extremadamente caluroso';
    }

    return estado;
};

const procesarMensaje = async (msgString) => {
    console.log("Mensaje recibido:", msgString);

    try {
        const data = JSON.parse(msgString);
        const temperature = parseFloat(data.temperature);
        const humidity = parseFloat(data.humidity);
        const ldr = parseFloat(data.ldr);
        const readTime = data.time;
        const nivelVida = 80;

        if (isNaN(temperature) || isNaN(humidity)) {
            console.error(`Mensaje recibido no es un número válido: '${msgString}'`);
            return;
        }


        const estado = determinarEstado(temperature, humidity);
        console.log(`El estado es: ${estado}`);

        // Ajustar el ventilador
        let ventilador = false;
        if (estado === 'calor' || estado === 'extremadamente caluroso') {
            ventilador = true;
        }
        console.log('Ventilador:', ventilador);
        // Publicar el estado en el broker MQTT
        client.publish('estado', `El estado es: ${estado}`);


        // Almacenar en la base de datos
        const nuevosEstados = new Estados({ temperature, humidity, ldr, estado, ventilador, readTime, nivelVida });

        try {
            await nuevosEstados.save();
            console.log('Datos guardados en la base de datos:', nuevosEstados);

            const estadosMQTT = { estado, ventilador, nivelVida };

            client.publish('test25', JSON.stringify(estadosMQTT));
            console.log("Datos enviados a MQTT", estadosMQTT);
        } catch (error) {
            console.error('Error al almacenar la temperatura en la base de datos:', error);
        }
    } catch (error) {
        console.error(`Error al parsear el mensaje: ${msgString}, ${error}`);
    }
};
const initMqttClient = () => {
    client.on('connect', () => {
        subscribeToTopic();
    });

    client.on('message', (topic, message) => {
        if (topic === 'test23') {
            const msgString = message.toString().trim();
            procesarMensaje(msgString);
        }
    });
};

module.exports = { initMqttClient };
