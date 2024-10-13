const mongoose = require('mongoose');

const estadosSchema = new mongoose.Schema({
    temperatura: { type: Number, required: true }, // Temperatura
    humedad: { type: Number, required: true }, // Humedad
    luz: { type: String, required: true },
    estado: { type: String, required: true },
    fecha: { type: Date, default: Date.now }  // Timestamp por defecto
});

const Estados = mongoose.model('estados', estadosSchema);

module.exports = Estados;
