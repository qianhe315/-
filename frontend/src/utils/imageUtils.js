export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // 如果已经是完整URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // 如果是相对路径，根据环境构建完整URL
  const apiBaseUrl = import.meta.env.VITE_API_URL || '';
  
  if (imagePath.startsWith('/uploads')) {
    return apiBaseUrl ? `${apiBaseUrl}${imagePath}` : imagePath;
  }
  
  // 其他情况，假设是相对路径
  return imagePath;
};

export const getCarouselImageUrl = (carousel) => {
  return getImageUrl(carousel.image_url);
};

export const getProductImageUrl = (product) => {
  return getImageUrl(product.image_url);
};

export const getClientLogoUrl = (client) => {
  return getImageUrl(client.logo_url);
};

export const getCertificationImageUrl = (certification) => {
  return getImageUrl(certification.image_url);
};

export const getProcessImageUrl = (process) => {
  return getImageUrl(process.image_url);
};

export const getClientLogoUrl = (client) => {
  return getImageUrl(client.logo_url);
};
