/**
 * Get authentication headers for API requests
 * @returns {Object} Headers object with Authorization token
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Create axios config with auth headers
 * @param {Object} config - Additional axios config
 * @returns {Object} Axios config with auth headers
 */
export const withAuth = (config = {}) => {
  return {
    ...config,
    headers: {
      ...config.headers,
      ...getAuthHeaders()
    }
  };
};
