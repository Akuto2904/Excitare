// Client/src/services/alarmAdminService.js

import { apiRequest } from './api';

// List all alarms (for admin table)
export const getAllAlarmsAdmin = async () => {
  return await apiRequest('/alarms');
};

// Create a new alarm with a given id
export const createAlarmAdmin = async (id, alarmData) => {
  return await apiRequest(`/alarm/${id}`, {
    method: 'POST',
    body: JSON.stringify(alarmData),
  });
};

// Update an existing alarm
export const updateAlarmAdmin = async (alarmData) => {
  // alarmData must contain alarmData.id
  return await apiRequest('/alarms', {
    method: 'PUT',
    body: JSON.stringify(alarmData),
  });
};

// Delete an alarm by id
export const deleteAlarmAdmin = async (id) => {
  return await apiRequest('/alarms', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  });
};