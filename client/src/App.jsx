import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import AppRoutes from '@/routes';
import { useThemeStore } from '@/store/themeStore';
import '@/style/index.css';
import '@/style/theme.css';

const App = () => {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#4096ff',
        },
      }}
    >
      <Router>
        <AppRoutes />
      </Router>
    </ConfigProvider>
  );
};

export default App;
