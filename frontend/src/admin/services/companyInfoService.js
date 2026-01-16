import adminApi from './adminApi';

const companyInfoService = {
  // Get all company info
  getAllCompanyInfo: async () => {
    return await adminApi.get('/company-info');
  },

  // Get company info by type
  getCompanyInfoByType: async (type) => {
    return await adminApi.get(`/company-info/type/${type}`);
  },

  // Get company info by ID
  getCompanyInfoById: async (id) => {
    return await adminApi.get(`/company-info/${id}`);
  },

  // Create company info
  createCompanyInfo: async (companyInfoData) => {
    return await adminApi.post('/company-info', companyInfoData);
  },

  // Update company info
  updateCompanyInfo: async (id, companyInfoData) => {
    return await adminApi.put(`/company-info/${id}`, companyInfoData);
  },

  // Delete company info
  deleteCompanyInfo: async (id) => {
    return await adminApi.delete(`/company-info/${id}`);
  }
};

export default companyInfoService;