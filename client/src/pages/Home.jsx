import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Spin, message } from 'antd';
import * as echarts from 'echarts';
import {
  getCategoryNotesStats,
  getRecentNotesStats,
  getAllCategoryNotes,
} from '@/api/noteApi';
import { getCategories } from '@/api/categoryApi';
import { Link } from 'react-router-dom';
import NavbarWrapper from '@/components/NavbarWrapper';
import { useStore } from '@/store/userStore';
import { formatDate } from '@/utils/dateFormatter';
import '@/style/index.css';

const { Content } = Layout;
const { Title, Text } = Typography;

const Home = () => {
  const { user } = useStore();
  const [loading, setLoading] = useState(true);
  const [categoryNotes, setCategoryNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [recentStats, setRecentStats] = useState([]);
  const pieChartRef = React.useRef(null);
  const barChartRef = React.useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          notesResponse,
          categoriesResponse,
          statsResponse,
          recentResponse,
        ] = await Promise.all([
          getAllCategoryNotes(user?.id),
          getCategories(),
          getCategoryNotesStats(user?.id),
          getRecentNotesStats(user?.id),
        ]);

        // 添加字段名转换处理
        const convertedData = (
          Array.isArray(notesResponse?.data) ? notesResponse.data : []
        ).map((category) => {
          // 强化数据校验
          const safeNotes = Array.isArray(category?.notes)
            ? category.notes
            : [];

          return {
            ...category,
            notes: safeNotes.map((note) => ({
              ...note,
              createdAt: note.created_at || new Date().toISOString(),
              tags: Array.isArray(note?.tags) ? note.tags : [],
            })),
          };
        });

        setCategoryNotes(convertedData);
        setCategories(
          Array.isArray(categoriesResponse?.data)
            ? categoriesResponse.data
            : [],
        );
        if (statsResponse.data) setCategoryStats(statsResponse.data);
        if (recentResponse.data) setRecentStats(recentResponse.data);
      } catch (error) {
        console.error('数据获取失败:', error);
        message.error('数据加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let pieChart = null;
    if (!loading && categoryStats.length > 0 && pieChartRef.current) {
      pieChart = echarts.init(pieChartRef.current);
      const option = {
        title: {
          text: '笔记分类统计',
          left: 'center',
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
        },
        series: [
          {
            type: 'pie',
            radius: '65%',
            center: ['50%', '50%'],
            data: categoryStats.map((item) => ({
              name: item.name,
              value: item.count,
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: function (idx) {
              return Math.random() * 200;
            },
          },
        ],
      };
      pieChart.setOption(option);

      const handleResize = () => {
        pieChart && pieChart.resize();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        pieChart && pieChart.dispose();
      };
    }
  }, [loading, categoryStats]);

  useEffect(() => {
    let barChart = null;
    if (!loading && recentStats.length > 0 && barChartRef.current) {
      barChart = echarts.init(barChartRef.current);
      const option = {
        title: {
          text: '最近7天笔记发布统计',
          left: 'center',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        xAxis: {
          type: 'category',
          data: recentStats.map((item) => item.date.split('T')[0]),
          axisLabel: {
            rotate: 45,
          },
        },
        yAxis: {
          type: 'value',
          minInterval: 1,
        },
        series: [
          {
            data: recentStats.map((item, index) => ({
              value: item.count,
              itemStyle: {
                color: '#4096ff',
              },
              name: item.date.split('T')[0],
              key: `bar-${index}`,
            })),
            type: 'bar',
            animationDelay: function (idx) {
              return idx * 100;
            },
          },
        ],
        animationEasing: 'elasticOut',
        animationDelayUpdate: function (idx) {
          return idx * 5;
        },
      };
      barChart.setOption(option);

      const handleResize = () => {
        barChart && barChart.resize();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        barChart && barChart.dispose();
      };
    }
  }, [loading, recentStats]);

  return (
    <Layout>
      <NavbarWrapper />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div ref={pieChartRef} style={{ height: '400px' }} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div ref={barChartRef} style={{ height: '400px' }} />
              </div>
            </div>
            {categoryNotes.map((category) => (
              <div key={category.id} className="category-section">
                <div className="category-header">
                  <Title level={3}>{category.category.name}</Title>
                  <Link
                    to={'/notes'}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    查看更多 ›
                  </Link>
                </div>
                {category.notes.length > 0 ? (
                  <div className="notes-grid">
                    {category.notes.slice(0, 4).map((note) => (
                      <Link to={`/notes/${note.id}`} key={note.id}>
                        <Card
                          hoverable
                          className="note-card"
                          style={{ height: '100%' }}
                        >
                          <Title level={4}>{note.title}</Title>
                          <Text
                            type="secondary"
                            className="ant-card-meta-description"
                          >
                            {note.content}
                          </Text>
                          <div style={{ marginTop: 8 }}>
                            {note.tags &&
                              note.tags.map((tag) => (
                                <span key={tag} style={{ marginRight: 8 }}>
                                  #{tag}
                                </span>
                              ))}
                          </div>
                          <div
                            style={{
                              marginTop: 8,
                              fontSize: 12,
                              color: '#888',
                            }}
                          >
                            {formatDate(note.createdAt)}
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
