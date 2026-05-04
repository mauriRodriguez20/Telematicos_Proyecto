const http = require('http');
const os = require('os');

const SERVER_ID = process.env.SERVER_ID || 'backend-1';
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const response = {
    server: SERVER_ID,
    hostname: os.hostname(),
    timestamp: new Date().toISOString(),
    message: `Hola desde ${SERVER_ID}!`
  };

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(response, null, 2));
});

server.listen(PORT, () => {
  console.log(`${SERVER_ID} corriendo en puerto ${PORT}`);
});
