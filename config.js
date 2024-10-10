// En este archivo vamos a menejar la conexion a la base de datos de mongodb
require('dotenv').config();  
const { MongoClient } = require('mongodb');

let db;  
async function connectToMongoDB() {
    if (!db) {
        try {
            const mongoClient = new MongoClient(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            await mongoClient.connect();
            db = mongoClient.db(); // Conectar a la base de datos especificada
            console.log('Conectado a MongoDB');
        } catch (err) {
            console.error('Error al conectar a la base de datos:', err);
            throw err;  
        }
    }
    return db; 
}

module.exports = {
    connectToMongoDB,
    
};