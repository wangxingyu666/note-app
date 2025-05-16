import { useEffect, useState } from 'react';
import {
  List,
  Card,
  Tag,
  Button,
  Modal,
  message,
  Layout,
  Select,
  Input,
} from 'antd';
import { getNotes, deleteNote } from '@/api/noteApi';
import { getCategories } from '@/api/categoryApi';
import { useStore } from '@/store/userStore';
import { useNavigate } from 'react-router-dom';
import NavbarWrapper from '@/components/NavbarWrapper';
import '../style/Note.css';

const { Content } = Layout;

const Notes = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [notes, setNotes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    category: '',
    sortOrder: 'desc',
  });

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('获取分类失败:', error);
      }
    };
    fetchCategories();
  }, []);

  const fetchNotes = async () => {
    try {
      const fetchNotesData = await getNotes(user.id, {
        keyword: searchParams.keyword,
        categoryId: searchParams.category,
        sortOrder: searchParams.sortOrder,
      });
      // 添加数组验证
      const safeNotes = Array.isArray(fetchNotesData?.data)
        ? fetchNotesData.data
        : [];
      setNotes(safeNotes);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      alert('获取笔记失败');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [searchParams]); // 添加searchParams依赖

  return (
    <Layout>
      <NavbarWrapper />
      <Content style={{ padding: '0 24px' }}>
        <div className="flex justify-between items-center p-6">
          <div className="filter-toolbar mb-6 flex gap-4">
            <Input.Search
              placeholder="输入关键词搜索"
              onSearch={(value) =>
                setSearchParams((prev) => ({ ...prev, keyword: value }))
              }
              style={{ width: 200 }}
            />

            <Select
              placeholder="选择分类"
              style={{ width: 150 }}
              onChange={(value) =>
                setSearchParams((prev) => ({ ...prev, category: value }))
              }
              allowClear
            >
              {categories.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>

            <Button
              type={searchParams.sortOrder === 'desc' ? 'primary' : 'default'}
              onClick={() =>
                setSearchParams((prev) => ({
                  ...prev,
                  sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc',
                }))
              }
            >
              {searchParams.sortOrder === 'desc' ? '最新优先' : '默认排序'}
            </Button>
          </div>
          <Button type="primary" onClick={() => navigate('/create-note')}>
            创建笔记
          </Button>
        </div>
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={notes}
          className="p-4"
          pagination={{
            total: notes.length,
            pageSize: 12,
            showTotal: (total) => `共 ${total} 条笔记`,
            showSizeChanger: false,
          }}
          renderItem={(item) => (
            <Card
              className="note-card"
              hoverable
              style={{ width: 300, height: 200 }}
            >
              <Card.Meta
                title={item.title}
                description={item.content.substring(0, 100) + ' ... '}
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              />
              <div className="my-4">
                {item.tags &&
                  item.tags.length > 0 &&
                  item.tags.map((tag) => (
                    <Tag color="cyan" key={tag}>
                      {tag}
                    </Tag>
                  ))}
              </div>
              <a href={`/notes/${item.id}`}>点击查看详情</a>
              <Button
                type="primary"
                onClick={() => navigate(`/notes/edit/${item.id}`)}
              >
                编辑
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  setModalVisible(true);
                  setSelectedNoteId(item.id);
                }}
              >
                删除
              </Button>
            </Card>
          )}
        />

        <Modal
          title="确认删除"
          open={modalVisible}
          onOk={async () => {
            if (selectedNoteId) {
              try {
                await deleteNote(selectedNoteId);
                message.success('删除成功');
                fetchNotes();
              } catch (error) {
                message.error('删除失败');
              } finally {
                setModalVisible(false);
                setSelectedNoteId(null);
              }
            }
          }}
          onCancel={() => {
            setModalVisible(false);
            setSelectedNoteId(null);
          }}
        >
          <p>确定要删除这条笔记吗？此操作不可恢复</p>
        </Modal>
      </Content>
    </Layout>
  );
};

export default Notes;
