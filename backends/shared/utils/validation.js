const CATEGORIAS = [
  'Computadoras',
  'Smartphones',
  'Tablets',
  'Audio',
  'Accesorios',
  'Otros',
];

function validateProduct(input, isUpdate = false) {
  const errors = [];
  const product = {};

  if (!isUpdate || input.nombre !== undefined) {
    product.nombre = String(input.nombre || '').trim();
    if (!product.nombre) errors.push('El nombre es obligatorio');
    if (product.nombre.length > 150) errors.push('El nombre no puede superar 150 caracteres');
  }

  if (!isUpdate || input.categoria !== undefined) {
    product.categoria = String(input.categoria || '').trim();
    if (!product.categoria) errors.push('La categoria es obligatoria');
    if (product.categoria.length > 100) errors.push('La categoria no puede superar 100 caracteres');
  }

  if (!isUpdate || input.precio !== undefined) {
    const precio = Number(input.precio);
    if (!Number.isFinite(precio) || precio < 0) {
      errors.push('El precio debe ser un numero mayor o igual a 0');
    } else {
      product.precio = precio;
    }
  }

  if (!isUpdate || input.stock !== undefined) {
    const stock = Number(input.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      errors.push('El stock debe ser un numero entero mayor o igual a 0');
    } else {
      product.stock = stock;
    }
  }

  if (!isUpdate || input.descripcion !== undefined) {
    product.descripcion = String(input.descripcion || '').trim();
  }

  return {
    isValid: errors.length === 0,
    errors,
    product,
  };
}

module.exports = {
  CATEGORIAS,
  validateProduct,
};
