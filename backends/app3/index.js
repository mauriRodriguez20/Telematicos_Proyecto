const http = require('http');
const os = require('os');
 
const SERVER_ID = process.env.SERVER_ID || 'backend-1';
const PORT = process.env.PORT || 3000;
 
const COLORS = {
  'backend-1': { primary: '#2563eb', light: '#eff6ff' },
  'backend-2': { primary: '#16a34a', light: '#f0fdf4' },
  'backend-3': { primary: '#9333ea', light: '#faf5ff' },
};
 
const color = COLORS[SERVER_ID] || { primary: '#64748b', light: '#f8fafc' };
 
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', server: SERVER_ID }));
    return;
  }
 
  const timestamp = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
  const num = SERVER_ID.split('-')[1];
 
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Backend ${num} — Balanceador de Carga</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: ${color.light};
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      width: 100%;
      max-width: 480px;
      overflow: hidden;
    }
    .card-header {
      background: ${color.primary};
      padding: 28px 32px;
      color: white;
    }
    .badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 20px;
      margin-bottom: 12px;
    }
    .card-header h1 { font-size: 26px; font-weight: 700; }
    .card-header p { margin-top: 4px; font-size: 13px; opacity: 0.8; }
    .card-body { padding: 28px 32px; }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #94a3b8; font-weight: 500; }
    .info-value { color: #1e293b; font-weight: 600; font-family: monospace; font-size: 13px; }
    .dot {
      display: inline-block; width: 8px; height: 8px;
      background: #22c55e; border-radius: 50%; margin-right: 6px;
      animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .footer {
      background: #f8fafc; padding: 14px 32px;
      font-size: 11px; color: #94a3b8; text-align: center;
      border-top: 1px solid #f1f5f9;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="card-header">
      <div class="badge">Activo</div>
      <h1>Backend ${num}</h1>
      <p>Servicios Telemáticos — Balanceo de Carga con NGINX</p>
    </div>
    <div class="card-body">
      <div class="info-row">
        <span class="info-label">Estado</span>
        <span class="info-value"><span class="dot"></span>Corriendo</span>
      </div>
      <div class="info-row">
        <span class="info-label">Servidor</span>
        <span class="info-value">${SERVER_ID}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Hostname</span>
        <span class="info-value">${os.hostname()}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Puerto</span>
        <span class="info-value">${PORT}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Timestamp</span>
        <span class="info-value">${timestamp}</span>
      </div>
    </div>
    <div class="footer">Recarga la página para ver el balanceo entre backends</div>
  </div>
</body>
</html>`;
 
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});
 
server.listen(PORT, () => console.log(`${SERVER_ID} corriendo en puerto ${PORT}`));