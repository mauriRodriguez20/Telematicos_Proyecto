# Inventario de Productos Tecnologicos

Proyecto final de Servicios Telematicos. La aplicacion permite gestionar un inventario de productos tecnologicos con un frontend web, tres backends Node.js balanceados por NGINX y una base de datos MySQL.

## Que hace la aplicacion

- Lista todos los productos registrados.
- Busca productos por nombre o descripcion.
- Filtra productos por categoria.
- Crea nuevos productos.
- Edita productos existentes.
- Elimina productos.
- Muestra el total de productos encontrados.
- Muestra el total general de unidades en inventario.

Categorias disponibles:

- Computadoras
- Smartphones
- Tablets
- Audio
- Accesorios
- Otros

## Arquitectura

```text
Cliente web
   |
   v
NGINX :8080
   |-- sirve frontend estatico desde /frontend
   |-- balancea /api/productos entre 3 backends
          |
          |-- backend-1 Node.js :3000
          |-- backend-2 Node.js :3000
          |-- backend-3 Node.js :3000
                  |
                  v
              MySQL :3306
```

NGINX conserva tres algoritmos definidos:

- `backend_round_robin`: reparte las peticiones en orden entre los tres backends.
- `backend_least_conn`: envia al backend con menos conexiones activas.
- `backend_ip_hash`: mantiene afinidad por IP.

El algoritmo activo esta en `nginx/nginx.conf`:

```nginx
proxy_pass http://backend_round_robin;
```

## Puertos

| Servicio | Puerto host | Descripcion |
|---|---:|---|
| NGINX / Frontend | 8080 | Aplicacion web y proxy de API |
| MySQL | 3307 | Base de datos publicada en el host |
| nginx-exporter | 9113 | Metricas NGINX para Prometheus |
| Prometheus | 9090 | Panel de metricas |
| Backends | interno 3000 | Solo accesibles dentro de Docker |

## Variables de entorno

Usa `.env.example` como referencia:

```env
PUBLIC_PORT=8080
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=inventario_productos
DB_PORT=3306
MYSQL_PUBLIC_PORT=3307
MYSQL_ROOT_PASSWORD=
PORT=3000
```

En Docker, los backends usan `DB_HOST=mysql` y `DB_PORT=3306` porque se conectan al servicio MySQL por la red interna de Compose. En el host se publica como `3307` para evitar conflictos con instalaciones locales de MySQL o XAMPP.

## Base de datos

El archivo `database/init.sql` crea la tabla:

```sql
CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

Tambien inserta datos iniciales:

- MacBook Pro M3
- iPhone 15 Pro
- iPad Air
- AirPods Pro

## Backend

La logica compartida de la API esta en `backends/shared`:

```text
backends/shared/
  config/database.js          Conexion pool a MySQL
  controllers/productController.js
  models/productModel.js
  routes/productRoutes.js
  utils/http.js
  utils/validation.js
  server.js                   Servidor HTTP principal
```

Los tres servicios `backend1`, `backend2` y `backend3` construyen esa misma API. Se diferencian por la variable `SERVER_ID`, lo cual permite seguir demostrando balanceo de carga.

### Rutas REST

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/productos` | Lista productos |
| GET | `/productos/:id` | Obtiene un producto por id |
| GET | `/productos?categoria=Computadoras` | Filtra por categoria |
| GET | `/productos?search=macbook` | Busca por nombre o descripcion |
| POST | `/productos` | Crea un producto |
| PUT | `/productos/:id` | Actualiza un producto |
| DELETE | `/productos/:id` | Elimina un producto |

Desde el navegador se consume por NGINX usando el prefijo `/api`:

```text
/api/productos
/api/productos/1
```

NGINX remueve el prefijo `/api` antes de enviar la peticion al backend.

## Frontend

El frontend esta en `frontend/index.html`. Es una aplicacion estatica con HTML, CSS y JavaScript.

Funciones principales:

- Carga inicial con `GET /api/productos`.
- Busqueda con `GET /api/productos?search=texto`.
- Filtro con `GET /api/productos?categoria=Computadoras`.
- Creacion con `POST /api/productos`.
- Edicion con `PUT /api/productos/:id`.
- Eliminacion con `DELETE /api/productos/:id`.
- Validaciones de nombre, categoria, precio y stock.
- Contadores actualizados despues de cada accion.

## Como ejecutar el proyecto completo

1. Copiar variables de ejemplo si es necesario:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

2. Levantar todo con Docker:

```bash
docker compose up --build -d
```

3. Verificar contenedores:

```bash
docker compose ps
```

4. Abrir la aplicacion:

```text
http://localhost:8080
```

5. Probar API directamente:

```powershell
Invoke-WebRequest -Uri "http://localhost:8080/api/productos" -UseBasicParsing
```

6. Apagar todo:

```bash
docker compose down
```

7. Apagar y borrar datos de MySQL para reiniciar la base:

```bash
docker compose down -v
```

## Como probar el CRUD

1. Abre `http://localhost:8080`.
2. Verifica que aparecen los cuatro productos iniciales.
3. Escribe `macbook` en el buscador.
4. Selecciona una categoria, por ejemplo `Computadoras`.
5. Crea un producto desde `Nuevo Producto`.
6. Edita el producto con el icono de lapiz.
7. Elimina el producto con el icono de papelera.
8. Confirma que los contadores cambian automaticamente.

## Pruebas de carga

Artillery consulta la API balanceada:

```bash
docker compose --profile testing run --rm artillery
```

El escenario esta en `artillery/load-test.yml` y apunta a:

```text
http://nginx:80/api/productos
```

## Metricas

Prometheus queda disponible en:

```text
http://localhost:9090
```

Consultas utiles:

```promql
nginx_connections_active
nginx_connections_handled_total
rate(nginx_http_requests_total[1m])
```

## Flujo completo

1. El usuario abre `http://localhost:8080`.
2. NGINX entrega `frontend/index.html`.
3. JavaScript llama a `/api/productos`.
4. NGINX balancea esa peticion hacia uno de los tres backends.
5. El backend valida la ruta y consulta MySQL mediante `mysql2/promise`.
6. MySQL responde con los datos de `productos`.
7. El backend devuelve JSON.
8. El frontend renderiza tarjetas y actualiza contadores.

Para crear, editar o eliminar, el flujo es igual, pero usando `POST`, `PUT` o `DELETE`. Despues de una accion exitosa, el frontend vuelve a consultar la lista para mostrar el estado real guardado en MySQL.
