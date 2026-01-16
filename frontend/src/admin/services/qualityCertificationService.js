import adminApi from './adminApi';

const qualityCertificationService = {
  // Get all quality certifications
  getAllQualityCertifications: async () => {
    return await adminApi.get('/quality-certifications');
  },

  // Get quality certification by ID
  getQualityCertificationById: async (id) => {
    return await adminApi.get(`/quality-certifications/${id}`);
  },

  // Create quality certification
  createQualityCertification: async (qualityCertificationData) => {
    return await adminApi.post('/quality-certifications', qualityCertificationData);
  },

  // Update quality certification
  updateQualityCertification: async (id, qualityCertificationData) => {
    return await adminApi.put(`/quality-certifications/${id}`, qualityCertificationData);
  },

  // Delete quality certification
  deleteQualityCertification: async (id) => {
    return await adminApi.delete(`/quality-certifications/${id}`);
  }
};

export default qualityCertificationService;