import express from 'express';
import { createServer } from 'node:http';
import connectDB from './db.js';
import { initMqttClient } from './mqttService.js';
import accionsBeto from './routes/accions.js';
import cors from 'cors';

connectDB();
const app = express();
const PORT = 5000;
const server = createServer(app);

app.use(cors()); 
app.use(express.json());
app.use('/', accionsBeto);

initMqttClient();

server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

