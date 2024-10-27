import mongoose from 'mongoose';

const estadosSchema = new mongoose.Schema({
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    ldr: { type: Number, required: true },
    estado: { type: String, required: true },
    readTime: { type: String, required: true },
    ventilador: { type: Boolean, required: true },
    nivelVida: { type: Number, required: true }, 
    fecha: { type: Date, default: Date.now }
});

const Estados = mongoose.model('Estados', estadosSchema);

export default Estados;