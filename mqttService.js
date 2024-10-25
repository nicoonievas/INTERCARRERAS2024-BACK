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
};

// datos que vienen desde front, se guarda en cada variable
export const handleFeed = (data) => {
  const feedValue = data.value;
  console.log(`Recibido: Acción: Valor: ${data.value}`); // Agregado el uso correcto de comillas invertidas
  client.publish('test24', JSON.stringify({"alimentar": feedValue}));
};

export const handleSleep = (data) => {
  const sleepValue = data.value;
  console.log(`Recibido: Acción: Valor: ${data.value}`); // Agregado el uso correcto de comillas invertidas
  client.publish('test24', JSON.stringify({"dormir": sleepValue}));
};

export const handleHeal = (data) => {
  const feed = data.value;
  console.log(`Recibido: Acción: Valor: ${data.value}`); // Agregado el uso correcto de comillas invertidas
  client.publish('test24', JSON.stringify({"curar": feed}));
};

function hasBadTemp(temperature) { // tiene temperatura mala
    return (temperature >= hottemp || temperature <= coldtemp);
}

function hasBadHumidity(humidity) { // tiene humedad mala
    return (humidity >= humidityHigh || humidity <= humidityLow);
}

function hasEaten() { // ¿comió?
    return true; // TODO: implementar
}

function killPet() { // matar mascota
    // TODO: implementar
}

const subscribeToTopic = () => {
    client.subscribe('test23', (err) => {
        if (!err) {
            console.log('Suscrito al tema test23');
        } else {
            console.error('Error al suscribirse al tema:', err);
        }
    });
};

const determinarEstado = async (temperatura, humedad, ldr, nivelVida) => {

    const estadoPingüino = await Estados.findOne({ _id: 'estado-pinguino' });

    if (!estadoPingüino) {
        console.error("No se encontró el estado del pingüino en la base de datos.");
        return { estado: 'desconocido', nivelvida: 0 };
    }

    let estado = estadoPingüino.estado; // Estado anterior
    let nuevoEstado; // Variable para el nuevo estado

    const esDia = ldr < ldrThreshold; // Asegúrate de que ldrThreshold esté definido

    switch(estado) {
        case 'Activo':
            if (!hasEaten()) {
                nuevoEstado = 'Hambriento';
                nivelVida -= 10;
            } else if (hasBadTemp(temperatura) || hasBadHumidity(humedad)) {
                nuevoEstado = 'Enfermo';
                nivelVida -= 10;
            } else if (!hasBadTemp(temperatura) && !hasBadHumidity(humedad) && esDia) {
                nuevoEstado = 'Feliz';
                nivelVida += 20;
            }
            break;
        case 'Feliz':
            if (!hasEaten()) {
                nuevoEstado = 'Hambriento';
                nivelVida -= 10;
            } else if (hasBadTemp(temperatura) || hasBadHumidity(humedad)) {
                nuevoEstado = 'Enfermo';
                nivelVida -= 10;
            } else if (!esDia) {
                nuevoEstado = 'Cansado';
                nivelVida -= 10;
            }
            break;
        case 'Cansado':
            if (!hasEaten()) {
                nuevoEstado = 'Hambriento';
                nivelVida -= 10;
            } else if (hasBadTemp(temperatura) || hasBadHumidity(humedad)) {
                nuevoEstado = 'Enfermo';
                nivelVida -= 10;
            } else if (!hasBadTemp(temperatura) && !hasBadHumidity(humedad) && esDia) {
                nuevoEstado = 'Feliz';
                nivelVida += 20;
            }
            break;
        case 'Hambriento':
            if (hasEaten() && !hasBadTemp(temperatura) && !hasBadHumidity(humedad)) {
                nuevoEstado = 'Feliz';
                nivelVida += 20;
            } else if (hasEaten() && (hasBadTemp(temperatura) || hasBadHumidity(humedad))) {
                nuevoEstado = 'Activo';
                nivelVida += 10;
            } else if (hasBadTemp(temperatura) || hasBadHumidity(humedad)) {
                nuevoEstado = 'Enfermo';
                nivelVida -= 10;
            }
            break;
        case 'Enfermo':
            if (!hasBadTemp(temperatura) && !hasBadHumidity(humedad)) {
                nuevoEstado = 'Activo';
                nivelVida += 10;
            }
            break;
    }

    if (nivelVida <= 0) {
        killPet(); // TODO: completar
    } else {
        nivelVida = Math.max(0, Math.min(100, nivelVida));
    }

    if (nuevoEstado !== estado || estadoPingüino.nivelVida !== nivelVida) {
        estadoPingüino.estado = nuevoEstado;
        estadoPingüino.nivelVida = nivelVida;
        await estadoPingüino.save();
    }

    return { estado: nuevoEstado, nivelvida: nivelVida };
};

const procesarMensaje = async (msgString) => {
    console.log("Mensaje recibido:", msgString);
     
    try {
        const data = JSON.parse(msgString);
        const temperature = parseFloat(data.temperature);
        const humidity = parseFloat(data.humidity);
        const ldr = parseFloat(data.ldr);
        const readTime = data.time;
        let nivelVida = 80; // Asegúrate de que este valor sea un número al principio

        if (isNaN(temperature) || isNaN(humidity)) {
            console.error(`Mensaje recibido no es un número válido: '${msgString}'`); // Agregado uso de comillas invertidas
            return;
        }

        const { estado, nivelvida } = await determinarEstado(temperature, humidity, ldr, nivelVida); // Llama a determinarEstado y espera su resultado

        const estadoFinalId = estadosId[estado];
        console.log('Id del estado:', estadoFinalId);
        console.log(`El estado es: ${estado}`); // Agregado uso de comillas invertidas

        let ventilador = false;
        let ventiladorId = 0;
        if (estado === 'calor' || estado === 'extremadamente caluroso') {
            ventilador = true;
            ventiladorId = 1;
        }
        console.log('Ventilador:', ventilador);
        
        client.publish('estado', `El estado es: ${estado}`); // Agregado uso de comillas invertidas

        // Almacenar en la base de datos
        const nuevosEstados = new Estados({ temperature, humidity, ldr, estado, ventilador, readTime, nivelVida });

        try {
            await nuevosEstados.save();
            console.log('Datos guardados en la base de datos:', nuevosEstados);

            const estadosMQTT = { estadoFinalId, estado, ventilador, ventiladorId, nivelVida };

            // Publicar en MQTT
            client.publish('test25', JSON.stringify(estadosMQTT));
            console.log("Datos enviados a MQTT", estadosMQTT);

            // *Enviar datos por WebSocket*
            broadcast({ nuevosEstados });

            console.log("Datos enviados a través de WebSocket");
            console.log(nuevosEstados);

        } catch (error) {
            console.error('Error al almacenar la temperatura en la base de datos:', error);
        }
    } catch (error) {
        console.error(`Error al parsear el mensaje: ${msgString}, ${error}`); // Agregado uso de comillas invertidas
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
