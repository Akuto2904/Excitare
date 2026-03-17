import api from './api';

//Handles the reviews for alarms 
export const getReviewsByAlarmId = async (alarmId) => {
  const response = await api.get(`/alarms/${alarmId}/reviews`);
  return response.data;
};