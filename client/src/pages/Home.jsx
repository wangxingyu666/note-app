import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Spin, message } from 'antd';

const formatDate = (dateStr) => {
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
import Navbar from '@/components/Navbar';
import { useStore } from '@/store/userStore';
import { getAllCategoryNotes } from '@/api/noteApi';
import { getCategories } from '@/api/categoryApi';
import { Link } from 'react-router-dom';

const { Content } = Layout;
const { Title, Text } = Typography;

const Home = () => {
  const { user } = useStore();
  const [loading, setLoading] = useState(true);
  const [categoryNotes, setCategoryNotes] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notesResponse, categoriesResponse] = await Promise.all([
          getAllCategoryNotes(user?.id),
          getCategories(),
        ]);

        // 添加字段名转换处理
        const convertedData = notesResponse.data.map((category) => ({
          ...category,
          notes: category.notes?.map((note) => ({
            ...note,
            createdAt: note.created_at,
          })),
        }));

        convertedData.forEach((category) => {
          category.notes?.forEach((note) => {});
        });
        setCategoryNotes(convertedData);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('数据获取失败:', error);
        message.error('数据加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <Navbar />
      <Content className="p-6">
        <div className="mb-6">
          {user ? (
            <Title level={2}>欢迎, {user.nickname || user.username}</Title>
          ) : (
            <Title level={2}>欢迎来到笔记应用</Title>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          <div className="space-y-8">
            {categoryNotes.map((category) => (
              <div key={category.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <Title level={3}>{category.category.name}</Title>
                  <Link
                    to={'/notes'}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    查看更多 ›
                  </Link>
                </div>
                {category.notes && category.notes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.notes.map((note) => (
                      <Link to={`/notes/${note.id}`} key={note.id}>
                        <Card hoverable className="h-full">
                          <Title level={4}>{note.title}</Title>
                          <Text className="line-clamp-2 text-gray-600">
                            {note.content}
                          </Text>
                          <div className="mt-2">
                            <Text type="secondary">
                              {formatDate(note.createdAt)}
                            </Text>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Text className="text-gray-500">暂无笔记</Text>
                )}
              </div>
            ))}
            {categoryNotes.length === 0 && (
              <div className="text-center text-gray-500">
                <Text>暂无分类和笔记</Text>
              </div>
            )}
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default Home;
