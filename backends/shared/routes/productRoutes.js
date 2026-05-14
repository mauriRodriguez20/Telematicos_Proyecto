const {
  parseId,
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { sendJson } = require('../utils/http');

async function handleProductRoutes(req, res, url) {
  const segments = url.pathname.split('/').filter(Boolean);

  if (segments[0] !== 'productos') {
    return false;
  }

  const id = segments[1] ? parseId(segments[1]) : null;

  if (segments.length > 2 || (segments[1] && !id)) {
    sendJson(res, 400, {
      success: false,
      message: 'Ruta de productos invalida',
      error: 'El id debe ser un numero entero positivo',
    });
    return true;
  }

  if (req.method === 'GET' && !id) {
    await listProducts(req, res, url);
    return true;
  }

  if (req.method === 'GET' && id) {
    await getProductById(req, res, id);
    return true;
  }

  if (req.method === 'POST' && !id) {
    await createProduct(req, res);
    return true;
  }

  if (req.method === 'PUT' && id) {
    await updateProduct(req, res, id);
    return true;
  }

  if (req.method === 'DELETE' && id) {
    await deleteProduct(req, res, id);
    return true;
  }

  sendJson(res, 405, {
    success: false,
    message: 'Metodo no permitido',
    error: `No se permite ${req.method} en ${url.pathname}`,
  });
  return true;
}

module.exports = {
  handleProductRoutes,
};
