const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

let lights = [false, false, false, false]; // Represents the state of each light
let score = 0;
server.on('connection', socket => {
    console.log('Client connected');

    // Send the initial state of lights to the client
    socket.send(JSON.stringify({ action: 'initialState', lights }));
    socket.send(JSON.stringify({ action: 'initialScore', score }));
    socket.on('message', message => {
        console.log(`Received: ${message}`);
        const { action, light } = JSON.parse(message);

        if (action === 'toggle' && light >= 0 && light < lights.length) {
            lights[light] = !lights[light]; // Toggle the state of the specified light
            // Broadcast the new state of lights to all connected clients
            server.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ action: 'updateState', light, state: lights[light] }));
                }
            });
        }
    });
    socket.on('message', message => {
        console.log(`Received: ${message}`);
        const { action, value } = JSON.parse(message);

        if (action === 'updateScore') {
            score += value; // Update the score based on the received value
            // Broadcast the new score to all connected clients
            server.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ action: 'updateScore', score }));
                }
            });
        }
    });
    socket.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server is listening on ws://localhost:8080');
