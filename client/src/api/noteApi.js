import axiosInstance from './axiosInstance';

//获取所有分类下的笔记
export const getAllCategoryNotes = async (userId) => {
  return axiosInstance.get(`/notes/home/${userId}`);
};

//创建笔记
export const createNote = async (noteData) => {
  return axiosInstance.post('/notes', noteData);
};

//查询某个用户的所有笔记
export const getNotes = (userId, params) => {
  return axiosInstance.get(`/notes/user/${userId}`, { params });
};

//查询笔记详情
export const getNote = async (noteId) => {
  return axiosInstance.get(`/notes/${noteId}`);
};

//查询某个用户某个分类的所有笔记
export const getNotesByCategory = async (userId, categoryId) => {
  return axiosInstance.get(`/notes/categories/${userId}/${categoryId}`);
};

//更新笔记
export const updateNote = async (noteId, noteData) => {
  return axiosInstance.put(`/notes/${noteId}`, noteData);
};

//删除笔记
export const deleteNote = async (noteId) => {
  return axiosInstance.delete(`/notes/${noteId}`);
};

//获取各分类的笔记数量统计
export const getCategoryNotesStats = async (userId) => {
  return axiosInstance.get(`/notes/stats/categories/${userId}`);
};

//获取最近7天的笔记发布统计
export const getRecentNotesStats = async (userId) => {
  return axiosInstance.get(`/notes/stats/recent/${userId}`);
};

// 导出笔记
export const exportNotes = async (userId) => {
  return axiosInstance.get(`/notes/export/${userId}`, {
    responseType: 'blob',
  });
};

// 导入笔记
export const importNotes = async (userId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axiosInstance.post(`/notes/import/${userId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
