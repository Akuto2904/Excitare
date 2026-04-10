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

//submit a review for a specific alarrm
export const submitReview = async (alarmId, reviewData) => {
  return await apiRequest(`/reviews/${alarmId}`, {
    method: "POST",
    body: JSON.stringify(reviewData),
  });
};