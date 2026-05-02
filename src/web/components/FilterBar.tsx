/**
 * Filter bar component / 过滤栏组件
 * Isolated filter UI component / 独立的过滤 UI 组件
 */

import React, { memo, useCallback } from 'react';
import { Input, Select, Button, Space, Dropdown, message } from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  StarOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { FilterState, SortField } from '../../types/recruitment';
import styles from './FilterBar.module.css';

const { Search } = Input;
const { Option } = Select;

interface FilterBarProps {
  filter: FilterState;
  uniqueTags: string[];
  uniqueSchools: string[];
  loading: boolean;
  refreshing: boolean;
  onSearch: (term: string) => void;
  onTagChange: (tag: string) => void;
  onSchoolChange: (school: string) => void;
  onToggleFavorites: () => void;
  onSortChange: (field: SortField) => void;
  onRefresh: () => void;
  onExport: (format: 'csv' | 'json') => void;
  onReset: () => void;
}

const FilterBar: React.FC<FilterBarProps> = memo(({
  filter,
  uniqueTags,
  uniqueSchools,
  loading,
  refreshing,
  onSearch,
  onTagChange,
  onSchoolChange,
  onToggleFavorites,
  onSortChange,
  onRefresh,
  onExport,
  onReset,
}) => {
  const handleExport = useCallback((format: 'csv' | 'json') => {
    try {
      onExport(format);
      message.success(`${format.toUpperCase()}导出成功`);
    } catch {
      message.error('导出失败');
    }
  }, [onExport]);

  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'csv',
      label: '导出为 CSV',
      icon: <DownloadOutlined />,
      onClick: () => handleExport('csv'),
    },
    {
      key: 'json',
      label: '导出为 JSON',
      icon: <DownloadOutlined />,
      onClick: () => handleExport('json'),
    },
  ];

  const sortMenuItems: MenuProps['items'] = [
    {
      key: 'timestamp',
      label: '按时间排序',
      icon: filter.sortField === 'timestamp'
        ? filter.sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />
        : null,
      onClick: () => onSortChange('timestamp'),
    },
    {
      key: 'school',
      label: '按学校排序',
      icon: filter.sortField === 'school'
        ? filter.sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />
        : null,
      onClick: () => onSortChange('school'),
    },
    {
      key: 'major',
      label: '按专业排序',
      icon: filter.sortField === 'major'
        ? filter.sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />
        : null,
      onClick: () => onSortChange('major'),
    },
    {
      key: 'title',
      label: '按标题排序',
      icon: filter.sortField === 'title'
        ? filter.sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />
        : null,
      onClick: () => onSortChange('title'),
    },
  ];

  return (
    <div className={styles.filters}>
      <div className={styles.filterRow}>
        <Search
          placeholder="搜索学校、专业或标题..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={onSearch}
          className={styles.searchInput}
          loading={loading}
        />

        <Select
          value={filter.selectedTag}
          onChange={onTagChange}
          size="large"
          className={styles.filterSelect}
          suffixIcon={<FilterOutlined />}
        >
          <Option value="all">所有类型</Option>
          {uniqueTags.map((tag) => (
            <Option key={tag} value={tag}>
              {tag}
            </Option>
          ))}
        </Select>

        <Select
          value={filter.selectedSchool}
          onChange={onSchoolChange}
          size="large"
          className={styles.filterSelect}
          placeholder="选择学校"
          showSearch
          optionFilterProp="children"
        >
          <Option value="all">所有学校</Option>
          {uniqueSchools.map((school) => (
            <Option key={school} value={school}>
              {school}
            </Option>
          ))}
        </Select>

        <Space wrap className={styles.actionButtons}>
          <Button
            type={filter.showFavoritesOnly ? 'primary' : 'default'}
            icon={<StarOutlined />}
            onClick={onToggleFavorites}
            size="large"
          >
            {filter.showFavoritesOnly ? '显示全部' : '仅收藏'}
          </Button>

          <Dropdown menu={{ items: sortMenuItems }} trigger={['click']}>
            <Button size="large" icon={<SortDescendingOutlined />}>
              排序
            </Button>
          </Dropdown>

          <Dropdown menu={{ items: exportMenuItems }} trigger={['click']}>
            <Button size="large" icon={<DownloadOutlined />}>
              导出
            </Button>
          </Dropdown>

          <Button
            size="large"
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={refreshing}
          >
            刷新
          </Button>

          <Button size="large" onClick={onReset}>
            重置筛选
          </Button>
        </Space>
      </div>
    </div>
  );
});

FilterBar.displayName = 'FilterBar';

export default FilterBar;
