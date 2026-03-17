import api from './api';


//gets alarms from backend
export const getAlarms = async () => {
  const response = await api.get('/alarms');
  return response.data;
};

export const getAlarmById = async (id) => {
  const response = await api.get(`/alarms/${id}`);
  return response.data;
};