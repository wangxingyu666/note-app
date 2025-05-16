import React, { useState, useEffect } from 'react';
import { Card, Tag, Layout } from 'antd';
import { getNote } from '@/api/noteApi';
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
        alert('获取笔记详情失败');
        navigate('/notes');
      }
    };

    fetchNoteDetails();
  }, [id, navigate]);

  if (!note) return <div>Loading ...</div>;

  return (
    <Layout>
      <NavbarWrapper />
      <Content>
        <Card className="note-detail-container" hoverable>
          <div className="note-detail-title">{note.title}</div>
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
