import adminApi from './adminApi';

const clientsService = {
  // Get all clients
  getAllClients: async () => {
    return await adminApi.get('/clients');
  },

  // Get client by ID
  getClientById: async (id) => {
    return await adminApi.get(`/clients/${id}`);
  },

  // Create client
  createClient: async (clientData) => {
    return await adminApi.post('/clients', clientData);
  },

  // Update client
  updateClient: async (id, clientData) => {
    return await adminApi.put(`/clients/${id}`, clientData);
  },

  // Delete client
  deleteClient: async (id) => {
    return await adminApi.delete(`/clients/${id}`);
  }
};

export default clientsService;