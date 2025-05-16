import React, { useState, useEffect } from 'react';
import { List, Card, Tag } from 'antd';
import { getNotesByCategory } from '@/api/noteApi';
import { useStore } from '@/store/userStore';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { getCategory } from '@/api/categoryApi';

const CategoryNotes = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [notes, setNotes] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const fetchNotesByCategory = async () => {
      try {
        setLoading(true);
        const categoryData = await getCategory(categoryId);
        if (categoryData && categoryData.data) {
          setCategoryName(categoryData.data.name);
        }
        const fetchedNotes = await getNotesByCategory(user.id, categoryId);
        if (fetchedNotes && fetchedNotes.data) {
          setNotes(fetchedNotes.data);
        }
      } catch (error) {
        console.error('获取数据失败: ', error);
        setError('获取数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchNotesByCategory();
  }, [categoryId]);

  if (loading) return <div>Loading ...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <Navbar />
      <h1>{categoryName}分类的笔记列表</h1>
      <List
        grid={{ gutter: 16, column: 4 }}
        dataSource={notes}
        renderItem={(item) => (
          <Card className="note-card" key={item.id}>
            <Card.Meta
              title={item.title}
              description={item.content.substring(0, 60) + ' ... '}
            />
            {item.tags && item.tags.length > 0 && (
              <div className="tags-container">
                {item.tags.map((tag) => (
                  <Tag color="cyan" key={tag}>
                    {tag}
                  </Tag>
                ))}
              </div>
            )}
            <Link to={`/notes/${item.id}`}>查看详情</Link>
          </Card>
        )}
      />
    </>
  );
};

export default CategoryNotes;
