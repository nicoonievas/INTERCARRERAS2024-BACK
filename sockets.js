import { Server } from 'socket.io';
import Estados from './estadosModel.js';

const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log("A user has connected!");

        const obtenerUltimoRegistro = async () => {
            try {
                const ultimoEstado = await Estados.findOne().sort({ _id: -1 }); // Obtener el último registro

                console.log(ultimoEstado);

                if (ultimoEstado) { 
                    socket.emit('nuevas_estadisticas', ultimoEstado);
                } else {
                    console.log('No se encontró ningún estado');
                }
            } catch (error) {
                console.error('Error al obtener el último registro:', error);
            }
        };

        obtenerUltimoRegistro();
    });
};

export default initSocket;
