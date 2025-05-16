import React, { useState, useEffect } from 'react';
import { List, Card, Button, Modal, Space, message, Layout } from 'antd';
import { getCategories, deleteCategory } from '@/api/categoryApi';
import CreateCategoryModal from '@/components/CreateCategoryModal';
import EditCategoryModal from '@/components/EditCategoryModal';
import { useStore } from '@/store/userStore';
import { useNavigate } from 'react-router-dom';
import NavbarWrapper from '@/components/NavbarWrapper';

const { Content } = Layout;

const Categories = () => {
  const navigate = useNavigate();
  const { user } = useStore();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate, user]);

  const [categories, setCategories] = useState([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchCategoriesData = async () => {
    try {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      alert('获取分类失败');
    }
  };

  useEffect(() => {
    fetchCategoriesData();
  }, []);

  const showCreateModal = () => {
    setIsCreateModalVisible(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalVisible(false);
  };

  const showEditModal = (category) => {
    setSelectedCategory(category);
    setIsEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    setSelectedCategory(null);
  };

  const handleDelete = (category) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除分类 "${category.name}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteCategory(category.id);
          message.success('分类删除成功');
          fetchCategoriesData();
        } catch (error) {
          console.error('Failed to delete category:', error);
          message.error('删除分类失败');
        }
      },
    });
  };

  const handleCreateSuccess = () => {
    fetchCategoriesData();
  };

  return (
    <Layout>
      <NavbarWrapper />
      <Content className="p-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h1>分类列表</h1>
            <Button type="primary" onClick={showCreateModal}>
              新建分类
            </Button>
          </div>
          <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={categories}
            renderItem={(item) => (
              <Card hoverable className="m-2" key={item.id}>
                <Card.Meta title={item.name} />
                <div className="mt-4 flex justify-between items-center">
                  <a href={`/notes/categories/${item.id}`}>查看分类笔记</a>
                  <Space>
                    <Button type="link" onClick={() => showEditModal(item)}>
                      编辑
                    </Button>
                    <Button
                      type="link"
                      danger
                      onClick={() => handleDelete(item)}
                    >
                      删除
                    </Button>
                  </Space>
                </div>
              </Card>
            )}
          />
        </div>
        <CreateCategoryModal
          visible={isCreateModalVisible}
          onClose={handleCreateModalClose}
          onSuccess={handleCreateSuccess}
        />
        <EditCategoryModal
          visible={isEditModalVisible}
          onClose={handleEditModalClose}
          onSuccess={handleCreateSuccess}
          category={selectedCategory}
        />
      </Content>
    </Layout>
  );
};

export default Categories;
