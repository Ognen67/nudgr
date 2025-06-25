/**
 * Central configuration for API endpoints
 */

// API base URL - change this to toggle between local and production
export const API_BASE_URL = 'https://nudgr-server-production.up.railway.app';

// API endpoints
export const ENDPOINTS = {
  GOALS: `${API_BASE_URL}/api/goals`,
  TASKS: `${API_BASE_URL}/api/tasks`,
  TRANSFORM_THOUGHT: `${API_BASE_URL}/api/ai/transform-thought-to-goal`,
  TRANSFORM_THOUGHT_STREAMING: `${API_BASE_URL}/api/ai/transform-thought-streaming`,
};

// Helper function for common fetch options
export const fetchWithOptions = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: any
) => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(endpoint, options);
  return response;
};
