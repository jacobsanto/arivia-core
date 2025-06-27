
// API endpoint configurations
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile'
  },
  
  // Task endpoints
  TASKS: {
    LIST: '/tasks',
    CREATE: '/tasks',
    UPDATE: (id: string) => `/tasks/${id}`,
    DELETE: (id: string) => `/tasks/${id}`,
    TEMPLATES: '/tasks/templates'
  },
  
  // Property endpoints
  PROPERTIES: {
    LIST: '/properties',
    CREATE: '/properties',
    UPDATE: (id: string) => `/properties/${id}`,
    DELETE: (id: string) => `/properties/${id}`
  },
  
  // Booking endpoints
  BOOKINGS: {
    LIST: '/bookings',
    CREATE: '/bookings',
    UPDATE: (id: string) => `/bookings/${id}`,
    DELETE: (id: string) => `/bookings/${id}`
  },
  
  // Inventory endpoints
  INVENTORY: {
    LIST: '/inventory',
    CREATE: '/inventory',
    UPDATE: (id: string) => `/inventory/${id}`,
    DELETE: (id: string) => `/inventory/${id}`,
    USAGE: '/inventory/usage'
  }
};

export default API_ENDPOINTS;
