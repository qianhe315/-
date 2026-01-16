import adminApi from './adminApi';

const carouselService = {
  // Get all carousels
  getAllCarousels: async () => {
    const result = await adminApi.get('/carousels');
    return result;
  },

  // Get active carousels
  getActiveCarousels: async () => {
    const result = await adminApi.get('/carousels/active');
    return result;
  },

  // Get carousel by ID
  getCarouselById: async (id) => {
    const result = await adminApi.get(`/carousels/${id}`);
    return result;
  },

  // Create carousel
  createCarousel: async (carouselData) => {
    const result = await adminApi.post('/carousels', carouselData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return result;
  },

  // Update carousel
  updateCarousel: async (id, carouselData) => {
    const result = await adminApi.put(`/carousels/${id}`, carouselData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return result;
  },

  // Delete carousel
  deleteCarousel: async (id) => {
    const result = await adminApi.delete(`/carousels/${id}`);
    return result;
  }
};

export default carouselService;