export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // 如果已经是完整URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // 获取API基础URL
  const apiBaseUrl = import.meta.env.VITE_API_URL || '';
  
  // 如果路径以 /uploads 开头，直接拼接API URL
  if (imagePath.startsWith('/uploads')) {
    return apiBaseUrl ? `${apiBaseUrl}${imagePath}` : imagePath;
  }
  
  // 如果路径不以 /uploads 开头，说明是文件名，需要添加 /uploads 前缀
  const fullPath = `/uploads/${imagePath}`;
  return apiBaseUrl ? `${apiBaseUrl}${fullPath}` : fullPath;
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
