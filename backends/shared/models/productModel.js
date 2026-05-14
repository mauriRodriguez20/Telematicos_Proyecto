const { pool } = require('../config/database');

function mapProduct(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria,
    precio: Number(row.precio),
    stock: Number(row.stock),
    descripcion: row.descripcion || '',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function findAll(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.categoria) {
    conditions.push('categoria = ?');
    params.push(filters.categoria);
  }

  if (filters.search) {
    conditions.push('(nombre LIKE ? OR descripcion LIKE ?)');
    const term = `%${filters.search}%`;
    params.push(term, term);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.execute(
    `SELECT id, nombre, categoria, precio, stock, descripcion, created_at, updated_at
     FROM productos
     ${whereClause}
     ORDER BY created_at DESC, id DESC`,
    params,
  );

  return rows.map(mapProduct);
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT id, nombre, categoria, precio, stock, descripcion, created_at, updated_at
     FROM productos
     WHERE id = ?`,
    [id],
  );

  return rows.length ? mapProduct(rows[0]) : null;
}

async function create(product) {
  const [result] = await pool.execute(
    `INSERT INTO productos (nombre, categoria, precio, stock, descripcion)
     VALUES (?, ?, ?, ?, ?)`,
    [
      product.nombre,
      product.categoria,
      product.precio,
      product.stock,
      product.descripcion,
    ],
  );

  return findById(result.insertId);
}

async function update(id, product) {
  await pool.execute(
    `UPDATE productos
     SET nombre = ?, categoria = ?, precio = ?, stock = ?, descripcion = ?
     WHERE id = ?`,
    [
      product.nombre,
      product.categoria,
      product.precio,
      product.stock,
      product.descripcion,
      id,
    ],
  );

  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM productos WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
