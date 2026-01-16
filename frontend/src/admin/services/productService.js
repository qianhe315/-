import adminApi from './adminApi';

const productService = {
  // Get all products
  getAllProducts: async () => {
    return await adminApi.get('/products');
  },

  // Get product by ID
  getProductById: async (id) => {
    return await adminApi.get(`/products/${id}`);
  },

  // Create new product
  createProduct: async (productData) => {
    return await adminApi.post('/products', productData);
  },

  // Update product
  updateProduct: async (id, productData) => {
    return await adminApi.put(`/products/${id}`, productData);
  },

  // Delete product
  deleteProduct: async (id) => {
    return await adminApi.delete(`/products/${id}`);
  },

  // Add product image
  addProductImage: async (productId, formData) => {
    return await adminApi.post(`/products/${productId}/images`, formData);
  },

  // Delete product image
  deleteProductImage: async (imageId) => {
    return await adminApi.delete(`/products/images/${imageId}`);
  }
};

export default productService;
