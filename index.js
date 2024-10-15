const express = require('express');
const cors = require('cors'); // Importar el paquete cors

const connectDB = require('./db');
const { initMqttClient } = require('./mqttService');

// Conectar a la base de datos
connectDB();
const app = express();
const PORT = 5000;

// Habilitar CORS
app.use(cors({
    origin: 'http://localhost:3000' // Cambia esto por el dominio de tu frontend
}));
// Conectar a la base de datos
connectDB();


// Rutas para obtener los estados
app.get('/estados', async (req, res) => {
    try {
        const estados = await Estados.find().sort({ fecha: -1 }).limit(1); // Obtener el último estado
        res.json(estados[0]); // Retornar solo el último registro
    } catch (error) {
        console.error('Error al obtener los estados:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

initMqttClient();
// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Inicializar el cliente MQTT
