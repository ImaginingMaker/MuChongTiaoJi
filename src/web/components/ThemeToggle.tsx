import React from 'react';
import { Button } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';
import styles from '../App.module.css';

/**
 * Theme toggle button component / 主题切换按钮组件
 */
const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      type="text"
      icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
      onClick={toggleTheme}
      className={styles.themeToggle}
      aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到暗色模式'}
    />
  );
};

export default ThemeToggle;

