const express = require('express');
const http = require('http');
const cors = require('cors');
const pool = require('./db/pool');
const bot = require('./bot/index');
const { setupWebSocket } = require('./ws/index');


const app = express();

const server = http.createServer(app);
setupWebSocket(server, pool);

const routes = require('./routes');
app.use(cors());
app.use(express.json());
app.use('/api', routes);


// 启动服务
server.listen(3000, () => {
  console.log('✅ Server and WebSocket running on port 3000');
});
