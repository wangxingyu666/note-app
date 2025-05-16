export const formatDate = (dateStr) => {
  if (!dateStr) return '日期未记录';

  try {
    const date = new Date(dateStr);
    if (isNaN(date)) return '日期格式错误';

    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch (e) {
    return '日期格式错误';
  }
};
