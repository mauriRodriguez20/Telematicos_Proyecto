CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO productos (nombre, categoria, precio, stock, descripcion)
SELECT 'MacBook Pro M3', 'Computadoras', 1999.99, 15, 'Laptop profesional con chip M3, 16GB RAM y 512GB SSD. Pantalla Retina de 14 pulgadas.'
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'MacBook Pro M3');

INSERT INTO productos (nombre, categoria, precio, stock, descripcion)
SELECT 'iPhone 15 Pro', 'Smartphones', 1099.99, 8, 'Smartphone con chip A17 Pro, camara de 48MP y pantalla Super Retina XDR de 6.1 pulgadas.'
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'iPhone 15 Pro');

INSERT INTO productos (nombre, categoria, precio, stock, descripcion)
SELECT 'iPad Air', 'Tablets', 599.99, 12, 'Tablet con chip M1, pantalla Liquid Retina de 10.9 pulgadas y soporte para Apple Pencil.'
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'iPad Air');

INSERT INTO productos (nombre, categoria, precio, stock, descripcion)
SELECT 'AirPods Pro', 'Audio', 249.99, 25, 'Auriculares inalambricos con cancelacion activa de ruido y audio espacial.'
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'AirPods Pro');
