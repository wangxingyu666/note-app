import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { updateCategory } from '@/api/categoryApi';

const EditCategoryModal = ({ visible, onClose, onSuccess, category }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      form.setFieldsValue({
        name: category.name,
      });
    }
  }, [category, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      // 对输入值进行trim处理
      const trimmedValues = { name: values.name.trim() };
      await updateCategory(category.id, trimmedValues);
      message.success('分类更新成功');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update category:', error);
      // 显示后端返回的具体错误信息
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else {
        message.error('更新分类失败');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="编辑分类"
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="分类名称"
          rules={[{ required: true, message: '请输入分类名称' }]}
        >
          <Input placeholder="请输入分类名称" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCategoryModal;
