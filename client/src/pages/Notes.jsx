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
  Upload,
  Tooltip,
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { getNotes, deleteNote, exportNotes, importNotes } from '@/api/noteApi';
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
      const safeNotes = Array.isArray(fetchNotesData?.data)
        ? fetchNotesData.data
        : [];
      setNotes(safeNotes);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      message.error('获取笔记失败');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [searchParams]);

  // 处理导出笔记
  const handleExport = async () => {
    try {
      const response = await exportNotes(user.id);
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'notes_export.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('笔记导出成功');
    } catch (error) {
      console.error('导出笔记失败:', error);
      message.error('导出笔记失败');
    }
  };

  // 处理导入笔记
  const handleImport = async (file) => {
    try {
      // 首先验证文件类型
      if (file.type !== 'application/json') {
        message.error('请上传JSON格式的文件');
        return false;
      }

      // 读取文件内容并验证格式
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // 验证JSON格式
          const content = JSON.parse(e.target.result);
          if (!Array.isArray(content)) {
            message.error('文件格式错误：数据必须是数组格式');
            return;
          }

          // 验证数据结构
          const invalidData = content.some(
            (note) => !note.title || !note.content || !note.category_id,
          );
          if (invalidData) {
            message.error(
              '数据格式错误：每条笔记必须包含 title、content 和 category_id 字段',
            );
            return;
          }

          // 发送导入请求
          const response = await importNotes(user.id, file);
          if (response.data.success) {
            message.success(response.data.message);
            fetchNotes(); // 刷新笔记列表
          }
        } catch (parseError) {
          if (parseError.response?.data?.error) {
            // 显示服务器返回的具体错误信息
            message.error(parseError.response.data.error);
            if (parseError.response.data.tip) {
              message.info(parseError.response.data.tip);
            }
            if (parseError.response.data.expectedFormat) {
              Modal.info({
                title: '预期的JSON格式',
                content: (
                  <div>
                    <p>请按照以下格式准备您的JSON数据：</p>
                    <pre style={{ background: '#f5f5f5', padding: '10px' }}>
                      {JSON.stringify(
                        parseError.response.data.expectedFormat.example,
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                ),
              });
            }
          } else {
            message.error('JSON格式无效，请检查文件内容');
          }
        }
      };

      reader.readAsText(file);
      return false; // 阻止自动上传
    } catch (error) {
      console.error('导入笔记失败:', error);
      message.error(
        '导入失败：' + (error.response?.data?.error || error.message),
      );
      return false;
    }
  };

  // 显示JSON格式说明
  const showFormatHelp = () => {
    Modal.info({
      title: '笔记导入格式说明',
      width: 600,
      content: (
        <div>
          <p>导入的JSON文件应该包含一个笔记数组，每个笔记对象包含以下字段：</p>
          <pre style={{ background: '#f5f5f5', padding: '10px' }}>
            {JSON.stringify(
              [
                {
                  title: '笔记标题（必填）',
                  content: '笔记内容（必填）',
                  category_id: 1, // 分类ID（必填，数字类型）
                  tags: ['标签1', '标签2'], // 可选，数组类型
                },
              ],
              null,
              2,
            )}
          </pre>
          <p>注意事项：</p>
          <ul>
            <li>文件必须是有效的JSON格式</li>
            <li>数据必须是数组格式，即使只有一条笔记也要用[]包裹</li>
            <li>category_id必须是存在的分类ID</li>
            <li>tags字段可选，但如果提供则必须是字符串数组</li>
          </ul>
        </div>
      ),
    });
  };

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
          <div className="flex gap-2 items-center">
            <Upload
              showUploadList={false}
              beforeUpload={handleImport}
              accept=".json"
            >
              <Button icon={<UploadOutlined />}>导入笔记</Button>
            </Upload>
            <Tooltip title="查看导入格式说明">
              <Button
                type="text"
                icon={<QuestionCircleOutlined />}
                onClick={showFormatHelp}
              />
            </Tooltip>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              导出笔记
            </Button>
            <Button type="primary" onClick={() => navigate('/create-note')}>
              创建笔记
            </Button>
          </div>
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
