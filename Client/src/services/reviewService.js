import { apiRequest } from "./api";

export const getAlarms = async () => {
  return await apiRequest("/alarms");
};

export const getReviewsByAlarmId = async (alarmId) => {
  return await apiRequest(`/reviews/${alarmId}`);
};