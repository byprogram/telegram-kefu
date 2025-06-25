// websocket.js
const WebSocket = require('ws');
const clients = new Map();

const sendMessageToClient = (id, message) => {
  const client = clients.get(id);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message));
  console.log(message)
  }
};

const setupWebSocket = (server, pool) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', async (ws, req) => {
    const params = new URLSearchParams(req.url.replace('/ws?', ''));
    const staffToken = params.get('staffToken');

    const [rows] = await pool.query('SELECT * FROM staffs WHERE token = ?', [staffToken]);
    if (!rows.length) return ws.close();

    const staffId = rows[0].id;
    clients.set(staffId, ws);

    ws.on('close', () => {
      clients.delete(staffId);
    });
  });
};

module.exports = {
  setupWebSocket,
  sendMessageToClient,
};
