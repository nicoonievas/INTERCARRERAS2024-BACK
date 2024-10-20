import express from 'express';
import { createServer } from 'node:http';
import connectDB from './db.js';
import { initMqttClient } from './mqttService.js';
import initSocket from './sockets.js'; 

connectDB();
const app = express();
const PORT = 5000;
const server = createServer(app);


try {
    initSocket(server);
    console.log('Sockets iniciados');
} catch (error) {
    console.error(error);
}

initMqttClient();

server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

