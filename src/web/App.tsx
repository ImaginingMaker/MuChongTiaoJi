import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import ThemeToggle from './components/ThemeToggle';
import RecruitmentList from './components/RecruitmentList';
import styles from './App.module.css';

/**
 * Main application component / 主应用组件
 * @returns App component / 应用组件
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ConfigProvider locale={zhCN}>
          <div className={styles.app}>
            <header className={styles.header}>
              <ThemeToggle />
              <h1 className={styles.title}>小木虫调剂信息平台</h1>
            </header>
            <main className={styles.main}>
              <RecruitmentList />
            </main>
          </div>
        </ConfigProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
