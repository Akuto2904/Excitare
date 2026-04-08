import {apiRequest} from "./api";

export const getReviewsByAlarmId = async (alarmId) => {
  return await apiRequest(`/reviews/${alarmId}`);
};