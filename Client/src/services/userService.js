// Handles user-related API requests

import { apiRequest } from './api';

// Updates a user's chosen alarm
export const updateUserChosenAlarm = async (userData) => {
  return await apiRequest('/users', {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};