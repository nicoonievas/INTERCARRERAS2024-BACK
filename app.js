// En este archivo vamos a manejar el servidor y conecta todo

const express = require('express');
const { connectDB } = require('./config');
const routes = require('./routes');
const mqttClient = require('./mqttClient');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', routes);

connectDB();

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});