const productModel = require('../models/productModel');
const { validateProduct } = require('../utils/validation');
const { sendJson, readJsonBody } = require('../utils/http');

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function handleError(res, message, error, statusCode = 500) {
  sendJson(res, statusCode, {
    success: false,
    message,
    error: error.message || String(error),
  });
}

async function listProducts(req, res, url) {
  try {
    const products = await productModel.findAll({
      categoria: url.searchParams.get('categoria') || '',
      search: url.searchParams.get('search') || '',
    });

    sendJson(res, 200, {
      success: true,
      message: 'Productos obtenidos correctamente',
      data: products,
      meta: {
        total_productos: products.length,
        total_unidades: products.reduce((total, product) => total + product.stock, 0),
      },
    });
  } catch (error) {
    handleError(res, 'No se pudieron obtener los productos', error);
  }
}

async function getProductById(req, res, id) {
  try {
    const product = await productModel.findById(id);

    if (!product) {
      sendJson(res, 404, {
        success: false,
        message: 'Producto no encontrado',
        error: `No existe un producto con id ${id}`,
      });
      return;
    }

    sendJson(res, 200, {
      success: true,
      message: 'Producto obtenido correctamente',
      data: product,
    });
  } catch (error) {
    handleError(res, 'No se pudo obtener el producto', error);
  }
}

async function createProduct(req, res) {
  try {
    const body = await readJsonBody(req);
    const validation = validateProduct(body);

    if (!validation.isValid) {
      sendJson(res, 400, {
        success: false,
        message: 'No se pudo crear el producto',
        error: validation.errors.join('. '),
      });
      return;
    }

    const product = await productModel.create(validation.product);

    sendJson(res, 201, {
      success: true,
      message: 'Producto creado correctamente',
      data: product,
    });
  } catch (error) {
    handleError(res, 'No se pudo crear el producto', error, 400);
  }
}

async function updateProduct(req, res, id) {
  try {
    const currentProduct = await productModel.findById(id);

    if (!currentProduct) {
      sendJson(res, 404, {
        success: false,
        message: 'Producto no encontrado',
        error: `No existe un producto con id ${id}`,
      });
      return;
    }

    const body = await readJsonBody(req);
    const validation = validateProduct(body);

    if (!validation.isValid) {
      sendJson(res, 400, {
        success: false,
        message: 'No se pudo actualizar el producto',
        error: validation.errors.join('. '),
      });
      return;
    }

    const product = await productModel.update(id, validation.product);

    sendJson(res, 200, {
      success: true,
      message: 'Producto actualizado correctamente',
      data: product,
    });
  } catch (error) {
    handleError(res, 'No se pudo actualizar el producto', error, 400);
  }
}

async function deleteProduct(req, res, id) {
  try {
    const deleted = await productModel.remove(id);

    if (!deleted) {
      sendJson(res, 404, {
        success: false,
        message: 'Producto no encontrado',
        error: `No existe un producto con id ${id}`,
      });
      return;
    }

    sendJson(res, 200, {
      success: true,
      message: 'Producto eliminado correctamente',
      data: { id },
    });
  } catch (error) {
    handleError(res, 'No se pudo eliminar el producto', error);
  }
}

module.exports = {
  parseId,
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
