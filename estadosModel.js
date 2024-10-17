import mongoose from 'mongoose';

const estadosSchema = new mongoose.Schema({
    temperature: { type: Number, required: true }, // Temperatura
    humidity: { type: Number, required: true }, // Humedad
    ldr: { type: Number, required: true },
    estado: { type: String, required: true },
    readTime: { type: String, required: true },
    ventilador: { type: Boolean, required: true },
    nivelVida: { type: Number, required: true }
 
    // fecha: { type: Date, default: Date.now }  // Timestamp por defecto
});

const Estados = mongoose.model('estados', estadosSchema);

export default Estados;