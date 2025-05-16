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
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { useStore } from '@/store/userStore';
import { useThemeStore } from '@/store/themeStore';
import { updateUserSettings } from '@/api/userApi';
import './Navbar.css';

const { Header } = Layout;
const { Text } = Typography;

const Navbar1 = () => {
  const { user, setUser, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const position = user?.navbar_position || 'top';
  const visible = user?.navbar_visible !== false;

  const handleLogout = () => {
    if (window.confirm('确定退出?')) {
      logout();
      navigate('/login');
    }
  };

  const handleVisibilityToggle = async () => {
    const newVisible = !visible;
    try {
      await updateUserSettings(user.id, { navbar_visible: newVisible });
      setUser({ ...user, navbar_visible: newVisible });
    } catch (error) {
      console.error('切换导航栏显示状态失败:', error);
    }
  };

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
        background: 'linear-gradient(to right, #52c41a, #95de64)',
        color: '#fff',
        boxShadow: '0 2px 10px rgba(82, 196, 26, 0.4)',
        ...(position === 'left' && {
          flexDirection: 'column',
          height: '100vh',
          padding: '20px 0',
        }),
      }}
      className="green-theme-navbar"
    >
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <Button
          type="text"
          icon={visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          onClick={handleVisibilityToggle}
          style={{
            color: '#fff',
            marginRight: position === 'top' ? '16px' : '0',
            marginBottom: position === 'left' ? '16px' : '0',
          }}
        />
        <Menu
          style={{
            background: 'transparent',
            color: '#fff',
            borderRight: 'none',
            fontWeight: 'bold',
            width: '100%',
          }}
          mode={position === 'left' ? 'vertical' : 'horizontal'}
          selectedKeys={selectedKeys}
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
      </div>

      <Space
        size="middle"
        style={{
          ...(position === 'left' ? { marginTop: 'auto' } : {}),
          flexShrink: 0,
          marginLeft: position === 'top' ? '16px' : '0',
        }}
        direction={position === 'left' ? 'vertical' : 'horizontal'}
      >
        <Switch
          checkedChildren={<BulbOutlined />}
          unCheckedChildren={<BulbOutlined />}
          checked={isDarkMode}
          onChange={toggleTheme}
        />
        {user ? (
          <Space
            onClick={handleLogout}
            style={{ cursor: 'pointer' }}
            direction={position === 'left' ? 'vertical' : 'horizontal'}
          >
            {user.avatar_url ? (
              <Avatar
                src={user.avatar_url}
                style={{ border: '2px solid #fff' }}
              />
            ) : (
              <Avatar
                icon={<UserOutlined />}
                style={{
                  background: '#fff',
                  color: '#52c41a',
                  border: '2px solid #fff',
                }}
              />
            )}
            <Text
              style={{
                color: '#fff',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {user.nickname || user.username}
            </Text>
          </Space>
        ) : (
          <Button
            type="primary"
            onClick={() => navigate('/login')}
            style={{
              background: '#fff',
              borderColor: '#fff',
              color: '#52c41a',
              fontWeight: 'bold',
            }}
          >
            登录
          </Button>
        )}
      </Space>
    </Header>
  );
};

export default Navbar1;
