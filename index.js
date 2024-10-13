const connectDB = require('./db');
const { client, publicarTest25 } = require('./mqttClient');
const { wss, broadcast } = require('./webSocketServer');
const Estados = require('./estadosModel');

// Conectar a la base de datos
connectDB();

// Umbrales de temperatura
const coldtemp = -3;  // Menor o igual a 5 °C = Frío
const idealtemp = 0;   // Entre 0°C y 5°C = Normal
const hottemp = 5;  // Mayor o igual a 5°C = Calor

// Rango de humedad ideal para los pingüinos
const humidityLow = 30;  // Menor o igual a 30% = Incomodo
const humidityIdeal = 60; // Entre 30% y 60% = Ideal
const humidityHigh = 80;  // Mayor o igual a 80% = Incomodo

client.subscribe('test23', (err) => {
    if (!err) {
        console.log('Suscrito al tema test23');
    }
});

client.on('message', async (topic, message) => {
    if (topic === 'test23') {
        const msgString = message.toString().trim();

        try {
            // Parsear el mensaje JSON
            const data = JSON.parse(msgString);
            const temperatura = parseFloat(data.temperatura); // Extraer la temperatura
            const humedad = parseFloat(data.humedad); // Extraer la humedad
            const luz = data.luz; // Extraer la luz

            if (isNaN(temperatura) || isNaN(humedad)) {
                console.error(`Mensaje recibido no es un número válido: '${msgString}'`);
                return;
            }

            console.log(`Temperatura recibida: ${temperatura}°C, Humedad recibida: ${humedad}%`);

            // Determinar el estado de la temperatura y la humedad
            let estado;
            if (temperatura <= coldtemp) {
                estado = 'frio';
            } else if (temperatura > coldtemp && temperatura < idealtemp) {
                estado = 'normal'; // Estado normal en temperaturas cercanas a 0°C
            } else if (temperatura >= idealtemp && temperatura <= hottemp) {
                if (humedad >= humidityLow && humedad <= humidityIdeal) {
                    estado = 'normal';
                } else if (humedad < humidityLow) {
                    estado = 'incomodo';
                } else {
                    estado = 'incomodo'; // Si la humedad es demasiado alta
                }
            } else {
                if (humedad < humidityLow) {
                    estado = 'incomodo';
                } else if (humedad >= humidityLow && humedad <= humidityIdeal) {
                    estado = 'calor';
                } else {
                    estado = 'incomodo'; // Humedad demasiado alta
                }
            }

            // Publicar el estado en el broker MQTT
            client.publish('estado', `El estado es: ${estado}`);
            console.log(`Estado publicado: ${estado}`);

            // Almacenar en la base de datos
            const nuevosEstados = new Estados({ temperatura, humedad, luz, estado });
            try {
                await nuevosEstados.save();
                console.log(nuevosEstados);

                // Publicar en el tema test25
                publicarTest25(nuevosEstados);

                // Enviar los datos al cliente WebSocket
                broadcast({
                    temperatura,
                    humedad,
                    estado
                });
            } catch (error) {
                console.error('Error al almacenar la temperatura en la base de datos:', error);
            }
        } catch (error) {
            console.error(`Error al parsear el mensaje: ${msgString}, ${error}`);
        }
    }
});
