/**
 * Recruitment information list component / 招生信息列表组件
 * Refactored with separated concerns / 重构后职责分离
 */

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { Row, Col, Empty, Pagination, Typography, message } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import RecruitmentCard from './RecruitmentCard';
import RecruitmentCardSkeleton from './RecruitmentCardSkeleton';
import FilterBar from './FilterBar';
import Statistics from './Statistics';
import { useRecruitmentState } from '../hooks/useRecruitmentState';
import { useFilteredData } from '../hooks/useFilteredData';
import { loadRecruitmentData, refreshData } from '../utils/dataLoader';
import { exportToCSV, exportToJSON } from '../utils/export';
import styles from './RecruitmentList.module.css';

const { Title } = Typography;

const RecruitmentList: React.FC = () => {
  const {
    state,
    setData,
    setTimestamp,
    setTag,
    setSchool,
    toggleFavorites,
    toggleSort,
    setPage,
    setPageSize,
    setStatus,
    reset,
  } = useRecruitmentState();

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { filteredData, paginatedData, statistics, uniqueTags, uniqueSchools, totalCount } =
    useFilteredData(
      state.data,
      { ...state.filter, searchTerm: debouncedSearchTerm },
      state.pagination.page,
      state.pagination.pageSize,
    );

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setStatus('loading');
        const result = await loadRecruitmentData();
        setData(result.data);
        setTimestamp(result.timestamp ?? Date.now());
        if (result.fromCache) {
          message.info('已从缓存加载数据');
        }
      } catch {
        message.error('加载数据失败，请刷新页面');
      } finally {
        setStatus('idle');
      }
    };
    loadData();
  }, [setData, setTimestamp, setStatus]);

  // Debounced search
  const handleSearch = useCallback((term: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(term);
      setPage(1);
    }, 300);
  }, [setPage]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Filter handlers
  const handleTagChange = useCallback((tag: string) => {
    setTag(tag);
    scrollToTop();
  }, [setTag, scrollToTop]);

  const handleSchoolChange = useCallback((school: string) => {
    setSchool(school);
    scrollToTop();
  }, [setSchool, scrollToTop]);

  const handleToggleFavorites = useCallback(() => {
    toggleFavorites();
    scrollToTop();
  }, [toggleFavorites, scrollToTop]);

  const handleSortChange = useCallback((field: Parameters<typeof toggleSort>[0]) => {
    toggleSort(field);
    scrollToTop();
  }, [toggleSort, scrollToTop]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      setStatus('refreshing');
      const result = await refreshData();
      setData(result.data);
      setTimestamp(result.timestamp);
      message.success('数据已刷新');
    } catch {
      message.error('刷新数据失败');
    } finally {
      setStatus('idle');
    }
  }, [setData, setTimestamp, setStatus]);

  // Export handler
  const handleExport = useCallback((format: 'csv' | 'json') => {
    if (format === 'csv') {
      exportToCSV(filteredData, 'muchong_recruitment');
    } else {
      exportToJSON(filteredData, 'muchong_recruitment');
    }
  }, [filteredData]);

  // Reset handler
  const handleReset = useCallback(() => {
    reset();
    setDebouncedSearchTerm('');
    scrollToTop();
  }, [reset, scrollToTop]);

  // Pagination handler
  const handlePageChange = useCallback((page: number, size?: number) => {
    if (size && size !== state.pagination.pageSize) {
      setPageSize(size);
    } else {
      setPage(page);
    }
    scrollToTop();
  }, [state.pagination.pageSize, setPage, setPageSize, scrollToTop]);

  // Format timestamp
  const formattedTimestamp = state.timestamp
    ? new Date(state.timestamp).toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const isLoading = state.status === 'loading';
  const isRefreshing = state.status === 'refreshing';

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Title level={2} className={styles.headerTitle}>
          <BookOutlined /> 最新招生信息
        </Title>
        <div className={styles.headerActions}>
          <span>共找到 {totalCount} 条招生信息</span>
          {formattedTimestamp && (
            <span className={styles.timestamp}>更新时间: {formattedTimestamp}</span>
          )}
        </div>
      </div>

      {/* Statistics */}
      <Statistics statistics={statistics} />

      {/* Filter Bar */}
      <FilterBar
        filter={state.filter}
        uniqueTags={uniqueTags}
        uniqueSchools={uniqueSchools}
        loading={isLoading}
        refreshing={isRefreshing}
        onSearch={handleSearch}
        onTagChange={handleTagChange}
        onSchoolChange={handleSchoolChange}
        onToggleFavorites={handleToggleFavorites}
        onSortChange={handleSortChange}
        onRefresh={handleRefresh}
        onExport={handleExport}
        onReset={handleReset}
      />

      {/* Content */}
      <div className={styles.content}>
        {isLoading ? (
          <Row gutter={[24, 24]}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Col key={i} xs={24} lg={12}>
                <RecruitmentCardSkeleton />
              </Col>
            ))}
          </Row>
        ) : filteredData.length > 0 ? (
          <>
            <Row gutter={[24, 24]}>
              {paginatedData.map((item) => (
                <Col key={item.id} xs={24} lg={12}>
                  <RecruitmentCard item={item} />
                </Col>
              ))}
            </Row>

            <div className={styles.paginationContainer}>
              <Pagination
                current={state.pagination.page}
                total={totalCount}
                pageSize={state.pagination.pageSize}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条数据`}
                pageSizeOptions={['6', '12', '24', '48']}
                onChange={handlePageChange}
                onShowSizeChange={handlePageChange}
                className={styles.pagination}
              />
            </div>
          </>
        ) : (
          <Empty description="暂无符合条件的招生信息" className={styles.empty} />
        )}
      </div>
    </div>
  );
};

export default RecruitmentList;
