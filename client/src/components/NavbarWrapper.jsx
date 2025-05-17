import React from 'react';
import { Layout, Button } from 'antd';
import { useStore } from '@/store/userStore';
import Navbar from './Navbar';
import Navbar1 from './Navbar1';
import Navbar2 from './Navbar2';
import Navbar3 from './Navbar3';
import Navbar4 from './Navbar4';
import { MenuOutlined } from '@ant-design/icons';
import '@/style/Layout.css';

const { Sider } = Layout;

const NavbarWrapper = () => {
  const { user, setUser } = useStore();
  // 优先使用theme_id，如果不存在则尝试使用theme，都不存在则使用默认值0
  const themeId =
    user?.theme_id !== undefined
      ? user.theme_id
      : user?.theme !== undefined
        ? user.theme
        : 0;
  const position = user?.navbar_position || 'top';
  const visible = user?.navbar_visible !== false;

  // 如果user存在但theme_id和theme不一致，更新用户状态
  React.useEffect(() => {
    if (user && user.theme !== undefined && user.theme_id !== user.theme) {
      setUser({ ...user, theme_id: user.theme });
    }
  }, [user, setUser]);

  // 根据用户的theme_id选择显示的导航栏组件
  const renderNavbar = () => {
    switch (themeId) {
      case 1:
        return <Navbar1 />;
      case 2:
        return <Navbar2 />;
      case 3:
        return <Navbar3 />;
      case 4:
        return <Navbar4 />;
      default:
        return <Navbar />;
    }
  };

  if (!visible) {
    return (
      <Button
        type="primary"
        icon={<MenuOutlined />}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1000,
        }}
        onClick={() => setUser({ ...user, navbar_visible: true })}
      />
    );
  }

  if (position === 'left') {
    return (
      <Sider
        width={200}
        style={{
          background: '#fff',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1001,
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          overflow: 'auto',
        }}
      >
        {renderNavbar()}
      </Sider>
    );
  }

  return renderNavbar();
};

export default NavbarWrapper;
