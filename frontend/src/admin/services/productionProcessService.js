import adminApi from './adminApi';

const productionProcessService = {
  // Get all production processes
  getAllProductionProcesses: async () => {
    return await adminApi.get('/production-processes');
  },

  // Get production process by ID
  getProductionProcessById: async (id) => {
    return await adminApi.get(`/production-processes/${id}`);
  },

  // Create production process
  createProductionProcess: async (productionProcessData) => {
    return await adminApi.post('/production-processes', productionProcessData);
  },

  // Update production process
  updateProductionProcess: async (id, productionProcessData) => {
    return await adminApi.put(`/production-processes/${id}`, productionProcessData);
  },

  // Delete production process
  deleteProductionProcess: async (id) => {
    return await adminApi.delete(`/production-processes/${id}`);
  }
};

export default productionProcessService;