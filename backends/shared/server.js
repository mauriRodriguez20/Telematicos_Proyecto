const http = require('http');
const { testConnection } = require('./config/database');
const { handleProductRoutes } = require('./routes/productRoutes');
const { sendJson } = require('./utils/http');

const SERVER_ID = process.env.SERVER_ID || 'backend';
const PORT = Number(process.env.PORT || 3000);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (url.pathname === '/health') {
    sendJson(res, 200, {
      success: true,
      message: 'Backend activo',
      data: {
        server: SERVER_ID,
        status: 'ok',
      },
    });
    return;
  }

  if (url.pathname === '/info') {
    sendJson(res, 200, {
      success: true,
      message: 'Informacion del backend',
      data: {
        server: SERVER_ID,
        database: process.env.DB_NAME || 'inventario_productos',
      },
    });
    return;
  }

  const wasHandled = await handleProductRoutes(req, res, url);
  if (wasHandled) return;

  sendJson(res, 404, {
    success: false,
    message: 'Ruta no encontrada',
    error: `No existe ${req.method} ${url.pathname}`,
  });
});

async function startServer() {
  try {
    await testConnection();
    server.listen(PORT, () => {
      console.log(`${SERVER_ID} escuchando en puerto ${PORT}`);
    });
  } catch (error) {
    console.error(`${SERVER_ID} no pudo conectarse a MySQL:`, error.message);
    process.exit(1);
  }
}

startServer();
