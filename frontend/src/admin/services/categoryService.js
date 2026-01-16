import adminApi from './adminApi';

const categoryService = {
  // Get all categories
  getAllCategories: async () => {
    return await adminApi.get('/categories');
  },

  // Get all categories including inactive
  getAllCategoriesIncludingInactive: async () => {
    return await adminApi.get('/categories/all');
  },

  // Get category by ID
  getCategoryById: async (id) => {
    return await adminApi.get(`/categories/${id}`);
  },

  // Create new category
  createCategory: async (categoryData) => {
    return await adminApi.post('/categories', categoryData);
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    return await adminApi.put(`/categories/${id}`, categoryData);
  },

  // Delete category
  deleteCategory: async (id) => {
    return await adminApi.delete(`/categories/${id}`);
  }
};

export default categoryService;
