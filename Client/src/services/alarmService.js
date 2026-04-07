import api from './api';

export const getAlarms = async () => {
  const response = await api.get('/alarms');
  return response.data;
};

export const getAlarmById = async (id) => {
  const response = await api.get(`/alarms/${id}`);
  return response.data;
};