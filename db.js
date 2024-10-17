import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://intercarreras2024:intercarreras2024@beto2024.4a3jg.mongodb.net/?retryWrites=true&w=majority&appName=beto2024');
        console.log('Conectado a MongoDB');
    } catch (err) {
        console.error('Error al conectar a MongoDB:', err);
        throw err; // Lanza el error para manejarlo en otro lugar
    }
};

export default connectDB;