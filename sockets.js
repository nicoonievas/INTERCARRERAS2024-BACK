import { Server as socketIO } from "socket.io";

const initSocket = (server) => {
  const io = new socketIO(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    socket.on("accion_mascota", (data) => {
      console.log(`Acción de mascota recibida: ${data.action}`);
      console.log(`Detalles: `, data);

      switch (data.action) {
        case "alimentar":
          console.log("La mascota ha sido alimentada.");
          break;
        case "dormir":
          console.log("La mascota está durmiendo.");
          break;
        case "curar":
          console.log("La mascota ha sido curada.");
          break;
        default:
          console.log("Acción desconocida:", data.action);
      }
    });

    socket.on("disconnect", () => {
      console.log("Cliente desconectado:", socket.id);
    });
  });
};

export default initSocket;
