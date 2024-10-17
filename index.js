const express = require('express');
const { Server } = require('socket.io');
const { createServer } = require('node:http');
const http = require('http');
const cors = require('cors'); // Importar el paquete cors
const connectDB = require('./db');
const { initMqttClient } = require('./mqttService');

// Conectar a la base de datos
connectDB();
const app = express();
const PORT = 5000;

// Habilitar CORS
// app.use(cors({
//     origin: 'http://localhost:3000' // Cambia esto por el dominio de tu frontend
// }));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", 
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    
    console.log("A user has connected!");
    socket.on('message test', (message) => {
        console.log("Mensaje recibido desde el front:", message);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

// Conectar a la base de datos
connectDB();

// Rutas para obtener los estados
// app.get('/estados', async (req, res) => {
//     try {
//         const estados = await Estados.find().sort({ fecha: -1 }).limit(1); // Obtener el último estado
//         res.json(estados[0]); // Retornar solo el último registro
//     } catch (error) {
//         console.error('Error al obtener los estados:', error);
//         res.status(500).json({ error: 'Error interno del servidor' });
//     }
// });

initMqttClient();
// Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Inicializar el cliente MQTT
