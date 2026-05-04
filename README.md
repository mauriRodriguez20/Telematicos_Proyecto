# Proyecto Final — Balanceador de Carga Web con NGINX
**Servicios Telemáticos | Lista 1 | 2026**  
**Grupo:** Lista 1  
**Herramientas:** NGINX, Node.js, Docker, Docker Compose, Artillery

---

## ¿De qué trata este proyecto?

Implementamos un **balanceador de carga** usando NGINX como proxy inverso. En lugar de que todos los usuarios lleguen a un solo servidor web, NGINX distribuye el tráfico entre 3 backends (servidores Node.js). Esto mejora el rendimiento, evita que un solo servidor se sature y permite que el sistema siga funcionando aunque uno de los servidores falle.

Se implementaron y compararon 3 algoritmos de balanceo:
- **Round Robin** — distribuye las peticiones en orden rotativo entre los backends
- **Least Conn** — envía cada petición al backend con menos conexiones activas
- **IP Hash** — el mismo usuario siempre llega al mismo backend (útil para sesiones)

---

## Arquitectura

```
         Cliente (navegador / Artillery)
                      │
                      ▼
         ┌─────────────────────┐
         │   NGINX :8080       │  ← Balanceador de carga
         │   (load-balancer)   │
         └──────┬──────┬───────┘
                │      │      │
          ┌─────▼─┐ ┌──▼───┐ ┌▼──────┐
          │back-1 │ │back-2│ │back-3 │  ← Servidores Node.js
          │:3000  │ │:3000 │ │:3000  │
          └───────┘ └──────┘ └───────┘

       Red interna Docker: balanceo-network
       (los backends NO son accesibles desde fuera)
```

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y **abierto**
- Git instalado

---

## Cómo correr el proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/mauriRodriguez20/Telematicos_Proyecto.git
cd Telematicos_Proyecto
```

### 2. Levantar toda la infraestructura

```bash
docker compose up --build -d
```

Esto construye las imágenes y levanta 4 contenedores:
- `load-balancer` → NGINX
- `backend-1`, `backend-2`, `backend-3` → servidores Node.js

### 3. Verificar que todo está corriendo

```bash
docker compose ps
```

Todos deben aparecer con estado `running`.

### 4. Probar el balanceador en el navegador

Abrir: **http://localhost:8080**

Recargar varias veces con `F5` y se verá cómo rota entre los backends:
```json
{ "server": "backend-1", "message": "Hola desde backend-1!" }
{ "server": "backend-2", "message": "Hola desde backend-2!" }
{ "server": "backend-3", "message": "Hola desde backend-3!" }
```

### 5. Probar desde la terminal (9 peticiones seguidas)

```powershell
1..9 | ForEach-Object { Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing | Select-Object -ExpandProperty Content }
```

### 6. Ver métricas de NGINX en tiempo real

```powershell
Invoke-WebRequest -Uri "http://localhost:8080/nginx_status" -UseBasicParsing | Select-Object -ExpandProperty Content
```

---

## Cambiar el algoritmo de balanceo

Abrir `nginx/nginx.conf` y cambiar esta línea:

```nginx
# Opciones disponibles:
proxy_pass http://backend_round_robin;   # Por defecto
proxy_pass http://backend_least_conn;   # Menor carga
proxy_pass http://backend_ip_hash;      # Persistencia de sesión
```

Luego reiniciar solo NGINX (sin bajar los backends):

```bash
docker restart load-balancer
```

---

## Prueba de resiliencia — bajar un backend en vivo

```powershell
# 1. Bajar backend-2 mientras el servicio está corriendo
docker stop backend-2

# 2. Verificar que el servicio sigue respondiendo (solo con backend-1 y backend-3)
1..6 | ForEach-Object { Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing | Select-Object -ExpandProperty Content }

# 3. Volver a levantar backend-2
docker start backend-2
```

**Resultado esperado:** El servicio nunca se interrumpe. NGINX detecta el fallo y redirige el tráfico automáticamente.

---

## Pruebas de carga con Artillery

```bash
docker compose --profile testing run --rm artillery
```

El escenario en `artillery/load-test.yml` tiene 3 fases:
1. **Ramp-up** (30s) — sube de 5 a 50 usuarios gradualmente
2. **Carga sostenida** (60s) — 1000 usuarios concurrentes
3. **Enfriamiento** (20s) — baja la carga

Al finalizar muestra un reporte con latencia media, p95, p99 y requests por segundo.

---

## Apagar todo

```bash
docker compose down
```

---

## Estructura del proyecto

```
Telematicos_Proyecto/
├── docker-compose.yml        # Orquestación: NGINX + 3 backends + Artillery
├── .env                      # Variables de entorno (puerto público)
├── nginx/
│   └── nginx.conf            # Configuración NGINX con los 3 algoritmos
├── backends/
│   ├── app1/
│   │   ├── index.js          # Servidor Node.js — backend-1
│   │   └── Dockerfile
│   ├── app2/
│   │   ├── index.js          # Servidor Node.js — backend-2
│   │   └── Dockerfile
│   └── app3/
│       ├── index.js          # Servidor Node.js — backend-3
│       └── Dockerfile
└── artillery/
    └── load-test.yml         # Escenario de prueba de carga
```

---

## Resultados obtenidos

### Algoritmos de balanceo

| Algoritmo | Comportamiento observado |
|---|---|
| `round_robin` | Rota en orden exacto: 1 → 2 → 3 → 1 → 2 → 3 |
| `least_conn` | Similar a round robin en carga baja (normal) |
| `ip_hash` | Siempre el mismo backend por IP (persistencia de sesión) |

### Prueba de resiliencia
Al detener `backend-2`, el servicio continua sin interrupciones usando solo `backend-1` y `backend-3`. Al reiniciarlo, NGINX lo reincorpora automáticamente.

### Prueba de carga (round_robin)
| Métrica | Valor |
|---|---|
| Requests exitosos (200) | 45,058 |
| Request rate | 164 req/seg |
| Latencia media | 47.9 ms |
| Latencia mediana | 7.9 ms |
| p95 | 144 ms |
| p99 | 804.5 ms |

---
 
## Nota sobre pruebas de carga con 1000 usuarios en Windows
 
Durante las pruebas de carga con 1000 usuarios concurrentes se presentaron errores de tipo `EADDRNOTAVAIL`. Estos errores **no son un fallo del balanceador**, sino una limitación del sistema operativo Windows al agotar el rango de puertos efímeros disponibles cuando se generan miles de conexiones simultáneas desde una sola máquina.
 
A pesar de esto, los resultados obtenidos demuestran el correcto funcionamiento del sistema:
 
| Métrica | Resultado |
|---|---|
| Peticiones exitosas (HTTP 200) | 38,277 |
| Request rate | 271 req/seg |
| Latencia media | 51 ms |
| Latencia mediana | 7.9 ms |
| p95 | 347.3 ms |
| p99 | 889.1 ms |
| Usuarios completados | 38,277 |
 
En un entorno Linux o en la nube (donde se ejecutaría este sistema en producción), esta limitación no existe y la prueba de 1000 usuarios correría sin errores.