import React, { useState, useEffect } from 'react';
import { Card, Tag, Layout, Button, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { getNote, exportNotes } from '@/api/noteApi';
import { useStore } from '@/store/userStore';
import { useNavigate, useParams } from 'react-router-dom';
import NavbarWrapper from '@/components/NavbarWrapper';
import { formatDate } from '@/utils/dateFormatter';
import { MdPreview } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import '../style/NoteDetail.css';

const { Content } = Layout;

const Note = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const { id } = useParams();
  const [note, setNote] = useState(null);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate, user]);

  useEffect(() => {
    const fetchNoteDetails = async () => {
      try {
        const fetchedNote = await getNote(id);
        // 确保content是字符串
        const content =
          typeof fetchedNote.data.content === 'string'
            ? fetchedNote.data.content
            : JSON.stringify(fetchedNote.data.content);
        setNote({
          ...fetchedNote.data,
          content,
        });
      } catch (error) {
        console.error('Failed to fetch note details: ', error);
        message.error('获取笔记详情失败');
        navigate('/notes');
      }
    };

    fetchNoteDetails();
  }, [id, navigate]);

  // 处理导出当前笔记
  const handleExport = async () => {
    try {
      const response = await exportNotes(user.id, id); // 这里传入笔记ID，只导出当前笔记
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `note_${id}_export.json`;
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

  if (!note) return <div>Loading ...</div>;

  return (
    <Layout>
      <NavbarWrapper />
      <Content>
        <Card className="note-detail-container" hoverable>
          <div className="flex justify-between items-center mb-4">
            <div className="note-detail-title">{note.title}</div>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              导出笔记
            </Button>
          </div>
          <div className="note-detail-content">
            <MdPreview
              modelValue={note.content || ''}
              previewTheme="github"
              style={{ backgroundColor: 'transparent' }}
            />
          </div>
          <div className="note-detail-tags">
            {note.tags.map((tag) => (
              <Tag color="cyan" key={tag}>
                {tag}
              </Tag>
            ))}
          </div>
          <div className="note-detail-time">
            创建时间：{formatDate(note.created_at)}
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default Note;
