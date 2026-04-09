import {apiRequest} from "./api";

export const getAlarms = async () => {
  return await apiRequest("/alarms");
};

export const getAlarmById = async (id) => {
  return await apiRequest(`/alarm/${id}`);
};

// Updates a user's chosen alarm
export const updateUserChosenAlarm = async (userData) => {
  return await apiRequest('/users', {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};