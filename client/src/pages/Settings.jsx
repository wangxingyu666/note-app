import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Radio,
  Upload,
  message,
  Avatar,
  Space,
  Divider,
  App,
} from 'antd';
import {
  UserOutlined,
  UploadOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/userStore';
import { useThemeStore } from '@/store/themeStore';
import NavbarWrapper from '@/components/NavbarWrapper';
import Navbar from '@/components/Navbar';
import Navbar1 from '@/components/Navbar1';
import Navbar2 from '@/components/Navbar2';
import Navbar3 from '@/components/Navbar3';
import Navbar4 from '@/components/Navbar4';
import { updateUserSettings, updateUserProfile } from '@/api/userApi';
import './Settings.css';

const { Content } = Layout;
const { Title, Text } = Typography;

const Settings = () => {
  const { user, setUser, logout } = useStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [navbarTheme, setNavbarTheme] = useState(user?.theme_id || 0);
  const [navbarPosition, setNavbarPosition] = useState(
    user?.navbar_position || 'top',
  );
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        nickname: user.nickname || '',
        username: user.username || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
      });
      setNavbarTheme(user.theme_id || 0);
      setNavbarPosition(user.navbar_position || 'top');
    }
  }, [user, form]);

  const handleThemeChange = async (value) => {
    setNavbarTheme(value);
    if (user) {
      try {
        await updateUserSettings(user.id, { theme: value });
        setUser({ ...user, theme_id: value });
        message.success('导航栏主题已更新');
      } catch (error) {
        console.error('更新主题失败:', error);
        message.error('更新主题失败');
      }
    }
  };

  const handleNavbarPositionChange = async (e) => {
    const position = e.target.value;
    setNavbarPosition(position);
    if (user) {
      try {
        await updateUserSettings(user.id, { navbar_position: position });
        setUser({ ...user, navbar_position: position });
        message.success('导航栏位置已更新');
      } catch (error) {
        console.error('更新导航栏位置失败:', error);
        message.error('更新导航栏位置失败');
      }
    }
  };

  const handleProfileUpdate = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        nickname: values.nickname,
        avatar_url: avatarUrl,
      };

      if (values.password) {
        updateData.password = values.password;
      }

      await updateUserProfile(user.id, updateData);
      setUser({ ...user, ...updateData });
      message.success('个人信息已更新');
      form.resetFields(['password', 'confirmPassword']);
    } catch (error) {
      console.error('更新个人信息失败:', error);
      message.error('更新个人信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (info) => {
    if (info.file.status === 'done') {
      const url = info.file.response.url;
      setAvatarUrl(url);
      message.success('头像上传成功');
    } else if (info.file.status === 'error') {
      message.error('头像上传失败');
    }
  };

  const handleLogout = () => {
    if (window.confirm('确定退出登录?')) {
      logout();
      navigate('/login');
    }
  };

  const renderNavbarPreview = (theme) => {
    switch (theme) {
      case 1:
        return (
          <div className="navbar-preview navbar1-preview">
            <Navbar1 />
          </div>
        );
      case 2:
        return (
          <div className="navbar-preview navbar2-preview">
            <Navbar2 />
          </div>
        );
      case 3:
        return (
          <div className="navbar-preview navbar3-preview">
            <Navbar3 />
          </div>
        );
      case 4:
        return (
          <div className="navbar-preview navbar4-preview">
            <Navbar4 />
          </div>
        );
      default:
        return (
          <div className="navbar-preview navbar-default-preview">
            <Navbar />
          </div>
        );
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  // 定义Tabs的items
  const tabsItems = [
    {
      key: 'theme',
      label: '主题设置',
      children: (
        <>
          <Card title="导航栏主题" className="settings-card">
            <div className="theme-options">
              <div
                className={`theme-option ${navbarTheme === 0 ? 'active' : ''}`}
                onClick={() => handleThemeChange(0)}
              >
                <div className="theme-preview default-theme"></div>
                <Text>默认主题</Text>
              </div>
              <div
                className={`theme-option ${navbarTheme === 1 ? 'active' : ''}`}
                onClick={() => handleThemeChange(1)}
              >
                <div className="theme-preview green-theme"></div>
                <Text>绿色清新</Text>
              </div>
              <div
                className={`theme-option ${navbarTheme === 2 ? 'active' : ''}`}
                onClick={() => handleThemeChange(2)}
              >
                <div className="theme-preview code-theme"></div>
                <Text>代码风格</Text>
              </div>
              <div
                className={`theme-option ${navbarTheme === 3 ? 'active' : ''}`}
                onClick={() => handleThemeChange(3)}
              >
                <div className="theme-preview sport-theme"></div>
                <Text>青春运动</Text>
              </div>
              <div
                className={`theme-option ${navbarTheme === 4 ? 'active' : ''}`}
                onClick={() => handleThemeChange(4)}
              >
                <div className="theme-preview dream-theme"></div>
                <Text>梦幻</Text>
              </div>
            </div>
            <Divider />
            <div className="navbar-preview-container">
              <Text strong>预览:</Text>
              {renderNavbarPreview(navbarTheme)}
            </div>
          </Card>

          <Card title="导航栏位置" className="settings-card">
            <Radio.Group
              onChange={handleNavbarPositionChange}
              value={navbarPosition}
            >
              <Radio value="top">顶部</Radio>
              <Radio value="left">左侧</Radio>
            </Radio.Group>
          </Card>

          <Card title="暗黑模式" className="settings-card">
            <Space>
              <Text>切换暗黑模式:</Text>
              <Button
                type={isDarkMode ? 'default' : 'primary'}
                onClick={toggleTheme}
              >
                {isDarkMode ? '切换到亮色模式' : '切换到暗黑模式'}
              </Button>
            </Space>
          </Card>
        </>
      ),
    },
    {
      key: 'profile',
      label: '个人信息',
      children: (
        <Card className="settings-card">
          <Form form={form} layout="vertical" onFinish={handleProfileUpdate}>
            <div className="avatar-upload">
              <Avatar
                size={100}
                src={avatarUrl}
                icon={!avatarUrl && <UserOutlined />}
              />
              <Upload
                name="avatar"
                action="/api/upload"
                onChange={handleAvatarUpload}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>上传头像</Button>
              </Upload>
            </div>

            <Form.Item
              name="nickname"
              label="昵称"
              rules={[{ required: true, message: '请输入昵称' }]}
            >
              <Input placeholder="请输入昵称" />
            </Form.Item>

            <Form.Item name="username" label="用户名">
              <Input disabled />
            </Form.Item>

            <Form.Item name="email" label="邮箱">
              <Input disabled />
            </Form.Item>

            <Form.Item
              name="password"
              label="新密码"
              rules={[{ min: 6, message: '密码长度至少为6个字符' }]}
            >
              <Input.Password placeholder="留空表示不修改" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认密码"
              dependencies={['password']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="再次输入新密码" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存修改
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <App>
      <Layout className="settings-layout">
        <NavbarWrapper />
        <Content className="settings-content">
          <Title level={2} className="settings-title">
            设置
          </Title>
          <Tabs
            defaultActiveKey="theme"
            items={tabsItems}
            className="settings-tabs"
          />

          <Card className="settings-card logout-card">
            <Button
              type="danger"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              退出登录
            </Button>
          </Card>
        </Content>
      </Layout>
    </App>
  );
};

export default Settings;
