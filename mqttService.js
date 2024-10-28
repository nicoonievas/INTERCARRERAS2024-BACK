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
const VENTILAR = 'ventilar';
const ALIMENTAR = 'alimentar';
const DORMIR = 'dormir';
const CURAR = 'curar';
const REVIVIR = 'revivir';
const APAGAR_VENTILADOR = 'apagar_ventilador';
const ESTADO_ACTIVO = 'Activo';
const ESTADO_DORMIDO = 'Dormido';
const ESTADO_ENFERMO = 'Enfermo';
const ESTADO_CANSADO = 'Cansado';
const ESTADO_FELIZ = 'Feliz';
const ESTADO_HAMBRIENTO = 'Hambriento';
const ESTADO_CALUROSO = 'Caluroso';
const ESTADO_MUERTO = 'Muerto';



const estadosId = new Map([
  [ESTADO_ACTIVO, 1],
  [ESTADO_DORMIDO, 2],
  [ESTADO_ENFERMO, 3],
  [ESTADO_CANSADO, 4],
  [ESTADO_FELIZ, 5],
  [ESTADO_HAMBRIENTO, 6],
  [ESTADO_CALUROSO, 7],
  [ESTADO_MUERTO, 8],
]);

 function resendToMQTTandWS(object, topic) {
    const parsedObjectForTopic = { 
            nivelVida: object.nivelVida,
            estado: estadosId.get(object.estado),
            prenderVentilador: object.prenderVentilador,
            apagarVentilador: object.apagarVentilador
        }

    const parsedObjectForFrontEnd = { ...object, estado: estadosId.get(object.estado)}
    broadcast({ parsedObjectForFrontEnd });
    client.publish(topic, JSON.stringify(parsedObjectForTopic));
 }

// datos que vienen desde front, se guarda en cada variable
export const handleFeed = async () => {
  const estadoObject = await determinarEstado('', '', '', '', true, ALIMENTAR)
  resendToMQTTandWS(estadoObject, 'test24')
};

export const handleSleep = async  () => {
    const estadoObject = await determinarEstado('', '', '', '', true, DORMIR)
    resendToMQTTandWS(estadoObject, 'test24')
};

export const handleHeal = async  () => {
    const estadoObject = await determinarEstado('', '', '', '', true, CURAR)
    resendToMQTTandWS(estadoObject, 'test24')
};

export const handleVent = async (data) => {
    if (data.vent === true) {
        const estadoObject = await determinarEstado('', '', '', '', true, VENTILAR)
        resendToMQTTandWS(estadoObject, 'test24')
    } else if (data.vent === false)  {
        const estadoObject = await determinarEstado('', '', '', '', true, APAGAR_VENTILADOR)
        resendToMQTTandWS(estadoObject, 'test24')
    }
    
};

export const handleRevive = async () => {
    const estadoObject = await determinarEstado('', '', '', '', true, REVIVIR)
    resendToMQTTandWS({estadoObject}, 'test24')
};

function hasBadTemp(temperature) { // tiene temperatura mala
    return (temperature >= hottemp || temperature <= coldtemp);
}

function hasHotTemp(temperature) {
    return temperature >= hottemp
}

function hasBadHumidity(humidity) { // tiene humedad mala
    return (humidity >= humidityHigh || humidity <= humidityLow);
}

function hasEaten() { // ¿comió?
    return true; // TODO: implementar
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

async function findLastPenguinStatus() {
    try {
        const lastStatus = await Estados.findOne({}).sort({ fecha: -1 }).exec();
        
        if (lastStatus) {
            console.log('Last Status:', lastStatus);
        } else {
            console.log('No statuses found.');
        }

        return lastStatus
    } catch (error) {
        console.error('Error finding last status:', error);
    }
}

const determinarEstado = async (temperatura, humedad, ldr, time,  nivelVida, isAction, action) => {
    const ldrThreshold = 650; //TODO: ajustar este valor
    const estadoPingüino = await findLastPenguinStatus();
    
    if (!estadoPingüino) {
        console.error("No se encontró el estado del pingüino en la base de datos.");
        return { estado: 'desconocido', nivelVida: 0 };
    }

    const lastKnownStatus = estadoPingüino._doc.estado;
    let lifeLevel = estadoPingüino._doc.nivelVida;
    let nuevoEstado = lastKnownStatus;

    if (isAction) {
        temperatura = estadoPingüino._doc.temperature;
        humedad = estadoPingüino._doc.humidity;
        ldr = estadoPingüino._doc.ldr;
    }

    const esDia = ldr < ldrThreshold; // Asegúrate de que ldrThreshold esté definido

    switch(lastKnownStatus) {
        case 'Activo':
            if (isAction) {
                switch(action) {
                    case ALIMENTAR: nuevoEstado = 'Feliz'; lifeLevel += 10; break
                    case DORMIR: nuevoEstado = 'Dormido'; break
                    case CURAR: lifeLevel += 10; break
                }
            } else if (!hasEaten()) {
                nuevoEstado = 'Hambriento';
                lifeLevel -= 10;
            } else if (hasHotTemp(temperatura)) {
                nuevoEstado = 'Caluroso';
                lifeLevel -= 10;
            } else if (hasBadTemp(temperatura) || hasBadHumidity(humedad)) {
                nuevoEstado = 'Enfermo';
                lifeLevel -= 10;
            } else if (!hasBadTemp(temperatura) && !hasBadHumidity(humedad) && esDia) {
                nuevoEstado = 'Feliz';
                lifeLevel += 20;
            }
            break;
        case 'Feliz':
            if (isAction) {
                switch(action) {
                    case ALIMENTAR: lifeLevel += 10; break
                    case DORMIR: nuevoEstado = 'Dormido'; break
                    case CURAR: lifeLevel += 10; break
                }
            } else if (!hasEaten()) {
                nuevoEstado = 'Hambriento';
                lifeLevel -= 10;
            } else if (hasHotTemp(temperatura)) {
                nuevoEstado = 'Caluroso';
                lifeLevel -= 10;
            } else if (hasBadTemp(temperatura) || hasBadHumidity(humedad)) {
                nuevoEstado = 'Enfermo';
                lifeLevel -= 10;
            } else if (!esDia) {
                nuevoEstado = 'Cansado';
                lifeLevel -= 10;
            }
            break;
        case 'Cansado':
            if (isAction) {
                switch(action) {
                    case ALIMENTAR: nuevoEstado = 'Activo'; lifeLevel += 10; break
                    case DORMIR: nuevoEstado = 'Dormido'; break
                    case CURAR: lifeLevel += 10; break
                }
            } else if (!hasEaten()) {
                nuevoEstado = 'Hambriento';
                lifeLevel -= 10;
            } else if (hasHotTemp(temperatura)) {
                nuevoEstado = 'Caluroso';
                lifeLevel -= 10;
            } else if (hasBadTemp(temperatura) || hasBadHumidity(humedad)) {
                nuevoEstado = 'Enfermo';
                lifeLevel -= 10;
            } else if (!hasBadTemp(temperatura) && !hasBadHumidity(humedad) && esDia) {
                nuevoEstado = 'Feliz';
                lifeLevel += 20;
            }
            break;
        case 'Hambriento':
            if (isAction) {
                switch(action) {
                    case ALIMENTAR: nuevoEstado = 'Feliz'; lifeLevel += 10; break
                    case DORMIR: nuevoEstado = 'Dormido'; break
                    case CURAR: lifeLevel += 10; break
                }
            } else if (hasEaten() && !hasBadTemp(temperatura) && !hasBadHumidity(humedad)) {
                nuevoEstado = 'Feliz';
                lifeLevel += 20;
            } else if (hasHotTemp(temperatura)) {
                nuevoEstado = 'Caluroso';
                lifeLevel -= 10;
            } else if (hasEaten() && (hasBadTemp(temperatura) || hasBadHumidity(humedad))) {
                nuevoEstado = 'Activo';
                lifeLevel += 10;
            } else if (hasBadTemp(temperatura) || hasBadHumidity(humedad)) {
                nuevoEstado = 'Enfermo';
                lifeLevel -= 10;
            }
            break;
        case 'Enfermo':
            if (isAction) {
                switch(action) {
                    case ALIMENTAR: nuevoEstado = 'Feliz'; lifeLevel += 10; break
                    case DORMIR: nuevoEstado = 'Dormido'; break
                    case CURAR: nuevoEstado = 'Activo'; lifeLevel += 10; break
                }
            } else if (hasBadTemp(temperatura) || hasBadHumidity(humedad)) {
                lifeLevel -= 10;
            } else if (!hasBadTemp(temperatura) && !hasBadHumidity(humedad)) {
                nuevoEstado = 'Activo';
                lifeLevel += 10;
            }
            break;
        case 'Dormido':
            if (isAction) {
                switch(action) {
                    case ALIMENTAR: nuevoEstado = 'Activo'; lifeLevel += 10; break
                    case CURAR: nuevoEstado = 'Activo'; lifeLevel += 10; break
                }
            } else if (!hasEaten() || hasHotTemp(temperatura)) {
                nuevoEstado = 'Activo';
            } else if (hasBadTemp(temperatura) || hasBadHumidity(humedad)) {
                nuevoEstado = 'Activo';
            } else if (!hasBadTemp(temperatura) && !hasBadHumidity(humedad) && esDia) {
                nuevoEstado = 'Activo';
            }
            break;
        case 'Caluroso':
            if (isAction) {
                switch(action) {
                    case ALIMENTAR: lifeLevel += 10; break
                    case CURAR: lifeLevel += 10; break
                    case VENTILAR: nuevoEstado = 'Activo'; lifeLevel += 10; break
                }
            } else if (!hasHotTemp(temperatura)) {
                nuevoEstado = 'Activo';
                lifeLevel += 10;
            } else if (!hasEaten()) {
                nuevoEstado = 'Enfermo';
                lifeLevel -= 10;
            } else if (hasBadTemp(temperatura) || hasBadHumidity(humedad)) {
                nuevoEstado = 'Enfermo';
                lifeLevel -= 10;
            }

            break;
            case 'Muerto':
                if (isAction && action === REVIVIR) {
                    nuevoEstado = ESTADO_ACTIVO;
                    lifeLevel = 100; //TODO: ajustar valores de vida, temperatura, humedad, ldr que se consideren optimos
                    temperatura = 4;
                    humedad = 40;
                    ldr = 650;
                } 
    
            break;
    }

    if (lifeLevel <= 0) {
        nuevoEstado = 'Muerto';
    } else {
        lifeLevel = Math.max(0, Math.min(100, lifeLevel));
    }

    let finalStatus

    if (nuevoEstado !== lastKnownStatus || estadoPingüino.nivelVida !== lifeLevel) {

      const newEstado = new Estados({
          temperature: temperatura,
          humidity: humedad,
          ldr: ldr,
          estado: nuevoEstado,
          readTime: time,
          ventilador: false, //TODO: actualizar segun corresponda
          nivelVida: lifeLevel
      });
    
      await newEstado.save()

      console.log('New Status:', newEstado);

        finalStatus = {... newEstado._doc, prenderVentilador: action === VENTILAR ? 1 : 0, apagarVentilador: action === APAGAR_VENTILADOR ? 1 : 0 }
    } else {
        finalStatus = {... estadoPingüino._doc, prenderVentilador: action === VENTILAR ? 1 : 0, apagarVentilador: action === APAGAR_VENTILADOR ? 1 : 0 }
    }

    return finalStatus;
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

        const estadoObject = await determinarEstado(temperature, humidity, ldr, readTime,  nivelVida); // Llama a determinarEstado y espera su resultado
        console.log('Estado obtenido:', estadoObject.estado); // Imprimir el estado para verificar

        try {
            resendToMQTTandWS(estadoObject, 'test24')
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
