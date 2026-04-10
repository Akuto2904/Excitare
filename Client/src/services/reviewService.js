import { apiRequest } from "./api";

export const getAlarms = async () => {
  return await apiRequest("/alarms");
};

export const getReviewsByAlarmId = async (alarmId) => {
  return await apiRequest(`/reviews/${alarmId}`);
};

// Gets the average rating for a specific alarm
export const getAlarmRating = async (alarmId) => {
  return await apiRequest(`/rating/${alarmId}`);
};