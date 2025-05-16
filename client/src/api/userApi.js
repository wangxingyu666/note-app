import axiosInstance from './axiosInstance';

export const registerUser = async (userData) => {
  return axiosInstance.post('/users/register', userData);
};

export const loginUser = async (userData) => {
  return axiosInstance.post('/users/login', userData);
};

export const getUser = async (userId) => {
  return axiosInstance.get(`/users/${userId}`);
};

export const updateUserSettings = async (userId, settingsData) => {
  return axiosInstance.put(`/users/${userId}/settings`, settingsData);
};

export const updateUserProfile = async (userId, profileData) => {
  return axiosInstance.put(`/users/${userId}/profile`, profileData);
};
