Mascota Virtual
Este proyecto es una aplicación de Mascota Virtual que permite al usuario interactuar en tiempo real con una mascota, recibir actualizaciones de su estado y modificar su entorno virtual. Utiliza Node.js para el backend, MQTT para la comunicación de datos, WebSocket para actualizaciones en tiempo real y MongoDB como base de datos.

Características
Interacción en tiempo real: Permite recibir y enviar datos en tiempo real de los sensores y del estado de la mascota.
Almacenamiento de datos: Usa MongoDB para guardar el historial de estados de la mascota y condiciones ambientales.
Comunicaciones MQTT: Recibe datos de sensores y actualizaciones de estado a través de MQTT.
Actualizaciones vía WebSocket: Los cambios en el estado de la mascota se reflejan instantáneamente en la interfaz de usuario.
Tecnologías
Node.js: Plataforma del backend.
MongoDB: Base de datos para almacenar la información de la mascota y el entorno.
MQTT: Protocolo de comunicación para recibir datos en tiempo real.
WebSocket: Protocolo para actualizaciones instantáneas.
Socket.IO: Biblioteca de WebSocket para facilitar la implementación en Node.js.
Requisitos
Node.js v14 o superior
MongoDB (se recomienda MongoDB Atlas para una base de datos en la nube)
MQTT Broker (p. ej., Mosquitto)
Cliente MQTT
Instalación
Clonar el repositorio:

bash
Copiar código
git clone [https://github.com/usuario/mascota-virtual.git](https://github.com/nicoonievas/INTERCARRERAS2024-BACK)
cd mascota-virtual
Instalar las dependencias:

bash
Copiar código
npm install
Configurar variables de entorno: Crea un archivo .env en la raíz del proyecto y añade las siguientes configuraciones:


Iniciar el servidor:

bash
Copiar código
npm start
Uso
Conectar a MQTT: El servidor se suscribe a un canal MQTT (por ejemplo, test23) donde recibe datos de sensores (temperatura, humedad, luz) que afectan el estado de la mascota.

Actualizar en tiempo real: Los cambios en el estado de la mascota se envían al cliente mediante WebSocket, actualizando la interfaz automáticamente.

Ver el historial: El usuario puede consultar los datos históricos del estado de la mascota y las condiciones de su entorno almacenados en MongoDB.

Estructura del Proyecto
plaintext
Copiar código
├── src
│   ├── server.js          # Servidor principal (configuración de MQTT, WebSocket, MongoDB)
│   ├── mqttClient.js      # Conexión y configuración de MQTT
│   ├── websocketServer.js # Configuración del servidor WebSocket
│   ├── db.js              # Configuración y conexión a MongoDB
│   ├── controllers
│   │   └── mascota.js     # Lógica de negocio de la mascota virtual
│   └── models
│       └── mascotaModel.js # Definición del esquema de la mascota en MongoDB
└── README.md
API
Rutas principales
GET /mascota: Obtiene el estado actual de la mascota.
POST /mascota/actualizar: Actualiza el estado de la mascota basado en los datos recibidos.
GET /historial: Obtiene el historial de cambios del estado de la mascota.
Ejemplo de Mensaje MQTT
La mascota recibe datos de MQTT en formato JSON. Ejemplo de mensaje:

json
Copiar código
{
  "temperatura": 22,
  "humedad": 50,
  "luz": 300,
  "estado": "contenta"
}
Contribuir
Haz un fork del proyecto.
Crea una nueva rama (git checkout -b feature-nueva-funcionalidad).
Haz commit de tus cambios (git commit -m 'Añadir nueva funcionalidad').
Haz push a la rama (git push origin feature-nueva-funcionalidad).
Abre un Pull Request.
