import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Tag,
  message,
  Select,
  Layout,
  Modal,
  Spin,
} from 'antd';
import { createNote } from '@/api/noteApi';
import { getCategories } from '@/api/categoryApi';
import { generateNoteContent } from '@/api/aiApi';
import { useStore } from '@/store/userStore';
import { useNavigate } from 'react-router-dom';
import NavbarWrapper from '@/components/NavbarWrapper';
import { RobotOutlined } from '@ant-design/icons';
import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';

const { Content } = Layout;

const CreateNote = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [tags, setTags] = useState([]);
  const [inputTag, setInputTag] = useState('');
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        message.error('获取分类失败');
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (values) => {
    try {
      const noteData = {
        ...values,
        content: content || '',
        tags,
        userId: user.id,
      };
      await createNote(noteData);
      message.success('笔记创建成功');
      navigate('/notes');
    } catch (error) {
      console.error('Failed to create note:', error);
      message.error('创建笔记失败');
    }
  };

  const handleInputChange = (e) => {
    setInputTag(e.target.value);
  };

  const handleAddTag = () => {
    if (inputTag && !tags.includes(inputTag)) {
      setTags([...tags, inputTag]);
      setInputTag('');
    }
  };

  const handleRemoveTag = (removedTag) => {
    const newTags = tags.filter((tag) => tag !== removedTag);
    setTags(newTags);
  };

  const handleGenerateContent = async () => {
    const title = form.getFieldValue('title');
    if (!title) {
      message.warning('请先输入笔记标题');
      return;
    }

    setIsGenerating(true);
    try {
      const generatedText = await generateNoteContent(title);
      setGeneratedContent(generatedText);
      setPreviewModalVisible(true);
    } catch (error) {
      console.error('生成笔记内容失败:', error);
      message.error('生成笔记内容失败');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseGeneratedContent = () => {
    setContent(generatedContent);
    setPreviewModalVisible(false);
  };

  return (
    <Layout>
      <NavbarWrapper />
      <Content className="p-4">
        <h1>创建笔记</h1>
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          className="max-w-4xl mx-auto"
        >
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入笔记标题' }]}
          >
            <Input placeholder="请输入标题" />
          </Form.Item>

          <Form.Item
            label={
              <div className="flex justify-between items-center w-full">
                <span>内容</span>
                <Button
                  type="primary"
                  icon={<RobotOutlined />}
                  onClick={handleGenerateContent}
                  loading={isGenerating}
                >
                  AI写笔记
                </Button>
              </div>
            }
            required
          >
            <MdEditor
              modelValue={content}
              onChange={setContent}
              language="zh-CN"
              style={{ height: '500px' }}
              theme="light"
              preview={false}
              previewOnly={false}
              showCodeRowNumber={false}
              defaultMode="edit"
              toolbarsExclude={[
                'github',
                'save',
                'htmlPreview',
                'catalog',
                'codeBlock',
                'codeRow',
                'preview',
                'pageFullscreen',
                'fullscreen',
              ]}
              defToolbars={[
                'bold',
                'underline',
                'italic',
                'strikeThrough',
                'title',
                'quote',
                'unorderedList',
                'orderedList',
                'task',
                'link',
                'image',
                'table',
                'revoke',
                'next',
                'save',
                'prettier',
              ]}
              onSave={() => {
                form.submit();
              }}
              sanitize={(html) => html}
              placeholder="请输入笔记内容..."
            />
          </Form.Item>

          <Form.Item
            label="类型"
            name="categoryId"
            rules={[{ required: true, message: '请选择笔记类型' }]}
          >
            <Select placeholder="请选择笔记类型">
              {categories.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="mb-4">
            <label className="block mb-2">标签</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={inputTag}
                onChange={handleInputChange}
                placeholder="输入标签"
                onPressEnter={handleAddTag}
              />
              <Button onClick={handleAddTag}>添加标签</Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag) => (
                <Tag key={tag} closable onClose={() => handleRemoveTag(tag)}>
                  {tag}
                </Tag>
              ))}
            </div>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              创建笔记
            </Button>
          </Form.Item>
        </Form>

        <Modal
          title="AI生成的笔记内容预览"
          open={previewModalVisible}
          onOk={handleUseGeneratedContent}
          onCancel={() => setPreviewModalVisible(false)}
          width={800}
          okText="使用此内容"
          cancelText="取消"
        >
          <MdEditor
            modelValue={generatedContent}
            previewOnly={true}
            previewTheme="github"
          />
        </Modal>
      </Content>
    </Layout>
  );
};

export default CreateNote;
