import { apiRequest } from './api';

// Get user's calendars
export const getCalendars = async (userId) => {
  return await apiRequest(`/${userId}/calendars`);
};

// Save chosen calendar
export const setCalendar = async (userId, calendarId) => {
  return await apiRequest(`/setCalendar/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ id: calendarId }),
  });
};

// Get next class
export const getFirstClass = async (userId) => {
  return await apiRequest(`/${userId}/firstClass`);
};