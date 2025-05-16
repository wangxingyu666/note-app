import React from 'react';
import { Layout, Button, Drawer } from 'antd';
import { useStore } from '@/store/userStore';
import Navbar from './Navbar';
import Navbar1 from './Navbar1';
import Navbar2 from './Navbar2';
import Navbar3 from './Navbar3';
import Navbar4 from './Navbar4';
import { MenuOutlined } from '@ant-design/icons';

const { Sider } = Layout;

const NavbarWrapper = () => {
  const { user, setUser } = useStore();
  const themeId = user?.theme_id || 0;
  const position = user?.navbar_position || 'top';
  const visible = user?.navbar_visible !== false;

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
        }}
      >
        {renderNavbar()}
      </Sider>
    );
  }

  return renderNavbar();
};

export default NavbarWrapper;
