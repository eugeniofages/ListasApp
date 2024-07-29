const WebSocket = require('ws');
const { db } = require('./firebase');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log('received: %s', message);
  });
});

const sendNotification = (userId, message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.userId === userId) {
      client.send(message);
    }
  });
};

module.exports = { sendNotification };
