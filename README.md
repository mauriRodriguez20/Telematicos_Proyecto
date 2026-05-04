# Proyecto Final — Balanceador de Carga Web con NGINX
**Servicios Telemáticos | Lista 1 | 2026**

## Arquitectura

```
Cliente
   │
   ▼
[NGINX - Load Balancer]  :8080
   │         │         │
   ▼         ▼         ▼
backend-1  backend-2  backend-3
(Node.js)  (Node.js)  (Node.js)
```

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado
- Git instalado

## Cómo correr el proyecto

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPO>
cd proyecto-balanceo
```

### 2. Levantar la infraestructura

```bash
docker compose up --build -d
```

### 3. Verificar que todo está corriendo

```bash
docker compose ps
```

### 4. Probar el balanceador

Abre el navegador en `http://localhost:8080` o ejecuta varias veces:

```bash
curl http://localhost:8080
```

Deberías ver respuestas rotando entre `backend-1`, `backend-2` y `backend-3`.

### 5. Ver métricas de NGINX

```bash
curl http://localhost:8080/nginx_status
```

---

## Cambiar el algoritmo de balanceo

Edita el archivo `.env` y cambia `BALANCING_POLICY`:

```env
# Opciones: round_robin | least_conn | ip_hash
BALANCING_POLICY=least_conn
```

Luego reinicia NGINX:

```bash
docker compose restart nginx
```

---

## Prueba de resiliencia (bajar un backend en vivo)

```bash
# Mientras el servicio corre, eliminar un backend
docker stop backend-2

# Verificar que el servicio sigue respondiendo
curl http://localhost:8080

# Volver a levantar el backend
docker start backend-2
```

---

## Pruebas de carga con Artillery

```bash
# Correr el escenario de carga (1000 usuarios / 60s)
docker compose --profile testing run --rm artillery
```

---

## Apagar todo

```bash
docker compose down
```

---

## Estructura del proyecto

```
proyecto-balanceo/
├── docker-compose.yml        # Orquestación principal
├── .env                      # Variables de entorno (política de balanceo, puerto)
├── nginx/
│   └── nginx.conf            # Configuración NGINX con los 3 algoritmos
├── backends/
│   ├── app1/
│   │   ├── index.js          # App Node.js backend 1
│   │   └── Dockerfile
│   ├── app2/
│   │   ├── index.js          # App Node.js backend 2
│   │   └── Dockerfile
│   └── app3/
│       ├── index.js          # App Node.js backend 3
│       └── Dockerfile
└── artillery/
    └── load-test.yml         # Escenario de prueba de carga
```
