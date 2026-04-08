import {apiRequest} from "./api";

export const getAlarms = async () => {
  return await apiRequest("/alarms");
};

export const getAlarmById = async (id) => {
  return await apiRequest(`/alarm/${id}`);
};