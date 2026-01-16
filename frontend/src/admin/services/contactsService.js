import adminApi from './adminApi';

const contactsService = {
  // Get all contacts
  getAllContacts: async () => {
    const response = await adminApi.get('/contacts');
    console.log('Raw contacts response:', response);
    // Ensure we return an array
    return Array.isArray(response) ? response : [response];
  },

  // Get contact by ID
  getContactById: async (id) => {
    return await adminApi.get(`/contacts/${id}`);
  },

  // Create contact
  createContact: async (contactData) => {
    return await adminApi.post('/contacts', contactData);
  },

  // Update contact
  updateContact: async (id, contactData) => {
    return await adminApi.put(`/contacts/${id}`, contactData);
  },

  // Delete contact
  deleteContact: async (id) => {
    return await adminApi.delete(`/contacts/${id}`);
  }
};

export default contactsService;