import client from './mqttClient.js';
import { broadcast } from './webSocketServer.js'; // Importamos broadcast para WebSocket
import Estados from './estadosModel.js';

// Umbrales de temperatura
const coldtemp = -3;    
const idealtemp = 0;    
const hottemp = 5;      
const extremeHotTemp = 10;  
const humidityLow = 30;  
const humidityIdeal = 60;
const humidityHigh = 80;  

const estadosId = {
    "frio": 1,
    "normal": 2,
    "calor": 3,
    "incomodo": 4,
    "extremadamente caluroso": 5
}

// datos que vienen desde front, se guarda en cada variable
export const handleFeed = (data) => {
  const feedValue = data.value;
  console.log(`Recibido: Acción: Valor: ${data.value}`);
  client.publish('test24', JSON.stringify({"alimentar": feedValue}));
};

export const handleSleep = (data) => {
  const sleepValue = data.value;
  console.log(`Recibido: Acción: Valor: ${data.value}`);
  client.publish('test24', JSON.stringify({"dormir": sleepValue}));
};

export const handleHeal = (data) => {
  const feed = data.value;
  console.log(`Recibido: Acción: Valor: ${data.value}`);
  client.publish('test24', JSON.stringify({"curar": feed}));
};


const subscribeToTopic = () => {
    client.subscribe('test23', (err) => {
        if (!err) {
            console.log('Suscrito al tema test23');
        } else {
            console.error('Error al suscribirse al tema:', err);
        }
    });
};

const determinarEstado = (temperatura, humedad, ldr) => {
    let estado;

    if (temperatura <= coldtemp) {
        estado = 'frio';
    } else if (temperatura > coldtemp && temperatura < idealtemp) {
        estado = 'normal';
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

        const estado = determinarEstado(temperature, humidity, ldr);

        const estadoFinalId = estadosId[estado];
        console.log( 'Id del estado:', estadoFinalId);
        console.log(`El estado es: ${estado}`);

        let ventilador = false;
        let ventiladorId = 0;
        if (estado === 'calor' || estado === 'extremadamente caluroso') {
            ventilador = true;
            ventiladorId = 1;
        }
        console.log('Ventilador:', ventilador);
        
        client.publish('estado', `El estado es: ${estado}`);

        // Almacenar en la base de datos
        const nuevosEstados = new Estados({ temperature, humidity, ldr, estado, ventilador, readTime, nivelVida });

        try {
            await nuevosEstados.save();
            console.log('Datos guardados en la base de datos:', nuevosEstados);

            const estadosMQTT = { estadoFinalId, estado, ventilador, ventiladorId, nivelVida };

            // Publicar en MQTT
            client.publish('test25', JSON.stringify(estadosMQTT));
            console.log("Datos enviados a MQTT", estadosMQTT);

            // **Enviar datos por WebSocket**
            broadcast({ nuevosEstados });

            console.log("Datos enviados a través de WebSocket");
            console.log(nuevosEstados);

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

export { initMqttClient };
