import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Avatar, Space, Button, Switch } from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  AppstoreOutlined,
  FileOutlined,
  BulbOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useStore } from '@/store/userStore';
import { useThemeStore } from '@/store/themeStore';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    if (window.confirm('确定退出?')) {
      logout();
      navigate('/login');
    }
  };

  //根据当前路由设置选中的菜单项
  const selectedKeys = React.useMemo(() => {
    switch (location.pathname) {
      case '/':
        return ['home'];
      case '/categories':
        return ['categories'];
      case '/notes':
        return ['notes'];
      case '/settings':
        return ['settings'];
      default:
        return [];
    }
  }, [location.pathname]);

  return (
    <Header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={selectedKeys}
        className="w-200"
        items={[
          {
            key: 'home',
            label: (
              <Space size="middle">
                <HomeOutlined />
                <span>首页</span>
              </Space>
            ),
            onClick: () => navigate('/'),
          },
          {
            key: 'categories',
            label: (
              <Space size="middle">
                <AppstoreOutlined />
                <span>分类</span>
              </Space>
            ),
            onClick: () => navigate('/categories'),
          },
          {
            key: 'notes',
            label: (
              <Space size="middle">
                <FileOutlined />
                <span>笔记</span>
              </Space>
            ),
            onClick: () => navigate('/notes'),
          },
          {
            key: 'settings',
            label: (
              <Space size="middle">
                <SettingOutlined />
                <span>设置</span>
              </Space>
            ),
            onClick: () => navigate('/settings'),
          },
        ]}
      />

      <Space size="middle">
        <Switch
          checkedChildren={<BulbOutlined />}
          unCheckedChildren={<BulbOutlined />}
          checked={isDarkMode}
          onChange={toggleTheme}
        />
        {user ? (
          <Space onClick={handleLogout}>
            {user.avatar_url ? (
              <Avatar src={user.avatar_url} />
            ) : (
              <Avatar icon={<UserOutlined />} />
            )}
            <Text style={{ color: isDarkMode ? '#fff' : '#fff' }}>
              {user.nickname || user.username}
            </Text>
          </Space>
        ) : (
          <Button type="primary" onClick={() => navigate('/login')}>
            登录
          </Button>
        )}
      </Space>
    </Header>
  );
};

export default Navbar;
