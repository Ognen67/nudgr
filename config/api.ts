import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get the local IP address for development
const getLocalIP = () => {
  if (__DEV__ && Platform.OS !== 'web') {
    // For physical device, you'll need to replace this with your computer's IP
    // Find your IP with: ipconfig (Windows) or ifconfig (Mac/Linux)
    return '192.168.1.100'; // Replace with your actual IP address
  }
  return 'localhost';
};

// === BASE URL: Update this value only to change the backend ===
export const API_BASE_URL = 'https://nudgr-server-production.up.railway.app/api';

// Export the API configuration
export const API = {
  baseURL: API_BASE_URL,
  // Endpoint builders
  goals: `${API_BASE_URL}/goals`,
  tasks: `${API_BASE_URL}/tasks`,
  ai: `${API_BASE_URL}/ai`,
  auth: `${API_BASE_URL}/auth`,
  // Helper function to build endpoints
  endpoint: (path: string) => `${API_BASE_URL}${path}`,
};

// Log current configuration in development
if (__DEV__) {
  console.log('🌐 API Configuration:', {
    baseURL: API.baseURL,
  });
}

export default API; 