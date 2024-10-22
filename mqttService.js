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

function hasBadTemp(temperature) { //tiene temperatura mala
    return (temperature >= hottemp || temperature <= coldtemp) 
}

function hasBadHumidity(humidity) { //tiene humedad mala
    return (humidity >= humidityHigh || humidity <= humidityLow)
}

function hasEaten() { //comio?
    return true //TODO: implementar
}

function killPet() { //matar mascota
    //TODO: implementar
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

    const esDia = ldr < ldrThreshold;

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
            if (hasEaten() && !hasBadTemp(temperatura) && !hasBadHumidity(humidity)) {
                nuevoEstado = 'Feliz';
                nivelVida += 20;
            } else if (hasEaten() && (hasBadTemp(temperatura) || hasBadHumidity(humidity))) {
                nuevoEstado = 'Activo';
                nivelVida += 10;
            } else if (hasBadTemp(temperatura) || hasBadHumidity(humidity)) {
                nuevoEstado = 'Enfermo';
                nivelVida -= 10;
            }
            break;
        case 'Enfermo':
            if (!hasBadTemp(temperatura) && !hasBadHumidity(humidity)) {
                nuevoEstado = 'Activo';
                nivelVida += 10;
            }
            break;
    }

    if (nivelVida <= 0) {
        killPet() //TODO: completar
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
        const nivelVida = 80;

        if (isNaN(temperature) || isNaN(humidity)) {
            console.error(`Mensaje recibido no es un número válido: '${msgString}'`);
            return;
        }
        // deberiamos devolver la promesa
        const estado = determinarEstado(temperature, humidity);
        console.log(`El estado es: ${estado}`);

        let ventilador = false;
        if (estado === 'calor' || estado === 'extremadamente caluroso') {
            ventilador = true;
        }
        console.log('Ventilador:', ventilador);
        
        client.publish('estado', `El estado es: ${estado}`);

        // Almacenar en la base de datos
        const nuevosEstados = new Estados({ temperature, humidity, ldr, estado, ventilador, readTime, nivelVida });

        try {
            await nuevosEstados.save();
            console.log('Datos guardados en la base de datos:', nuevosEstados);

            const estadosMQTT = { estado, ventilador, nivelVida };

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
