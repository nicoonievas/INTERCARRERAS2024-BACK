const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 2000 });

function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

wss.on('connection', (ws) => {
    console.log('Cliente WebSocket conectado');
    
    ws.on('close', () => {
        console.log('Cliente WebSocket desconectado');
    });
});

module.exports = { wss, broadcast };
