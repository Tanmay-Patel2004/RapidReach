import dotenv from 'dotenv';
// Load environment variables based on the current environment
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.development' });
} else if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config({ path: '.env.production' });
}

const config = {
  api: {
    baseURL: process.env.DB_BASE_URL || 'http://localhost:3000/api',
  },
  app: {
    name: process.env.VITE_APP_NAME || 'Warehouse Management System', 
    version: process.env.VITE_APP_VERSION || '1.0.0',
  },
};

export default config;