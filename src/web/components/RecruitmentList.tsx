import React, { useState, useMemo, useCallback, useEffect, useRef, startTransition } from 'react';
import {
  Input,
  Select,
  Row,
  Col,
  Empty,
  Typography,
  Space,
  Pagination,
  Button,
  Statistic,
  Dropdown,
  message,
  Card as AntCard,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  BookOutlined,
  ReloadOutlined,
  DownloadOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  StarOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import RecruitmentCard from './RecruitmentCard';
import RecruitmentCardSkeleton from './RecruitmentCardSkeleton';
import { RecruitmentItem } from '../types';
import { loadRecruitmentData, refreshData } from '../utils/dataLoader';
import { exportToCSV, exportToJSON } from '../utils/export';
import { getFavoriteItems } from '../utils/favorites';
import styles from './RecruitmentList.module.css';

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

type SortField = 'timestamp' | 'school' | 'major' | 'title';
type SortOrder = 'asc' | 'desc';

/**
 * Recruitment information list component / 招生信息列表组件
 * Displays filterable and searchable list of recruitment information with pagination
 * 展示可过滤、搜索和分页的招生信息列表
 *
 * @returns RecruitmentList component / 招生信息列表组件
 */
const RecruitmentList: React.FC = () => {
  const [recruitmentData, setRecruitmentData] = useState<RecruitmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [dataTimestamp, setDataTimestamp] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Pagination state variables / 分页状态变量
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  // Add transition state for smooth page changes / 添加过渡状态以实现平滑页面切换
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Refs for debouncing and optimization / 用于防抖和优化的引用
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load data on mount / 挂载时加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setInitialLoading(true);
        const result = await loadRecruitmentData();
        setRecruitmentData(result.data);
        setDataTimestamp(result.timestamp);
        if (result.fromCache) {
          message.info('已从缓存加载数据 / Data loaded from cache');
        }
      } catch (error) {
        console.error('Error loading data / 加载数据错误:', error);
        message.error('加载数据失败，请刷新页面 / Failed to load data, please refresh');
      } finally {
        setInitialLoading(false);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Smooth scroll to top function / 平滑滚动到顶部函数
  const scrollToTop = useCallback(() => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }, []);

  // Debounced search function / 防抖搜索函数
  const debouncedSearch = useCallback(
    (value: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      setLoading(true);

      searchTimeoutRef.current = setTimeout(() => {
        startTransition(() => {
          setSearchTerm(value);
          setCurrentPage(1);
        });

        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }

        loadingTimeoutRef.current = setTimeout(() => {
          setLoading(false);
          if (value) {
            scrollToTop();
          }
        }, 100);
      }, 300);
    },
    [scrollToTop],
  );

  // Clean up timeouts on component unmount / 组件卸载时清理超时
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Extract unique values for filter options (memoized for performance)
  // 提取唯一值用于过滤选项（缓存以提高性能）
  const { uniqueTags, uniqueSchools } = useMemo(() => {
    const tags = new Set<string>();
    const schools = new Set<string>();

    recruitmentData.forEach((item) => {
      tags.add(item.tag);
      schools.add(item.detail.forumMix.school);
    });

    return {
      uniqueTags: Array.from(tags),
      uniqueSchools: Array.from(schools).sort(),
    };
  }, [recruitmentData]);

  // Calculate statistics / 计算统计信息
  const statistics = useMemo(() => {
    const total = recruitmentData.filter((item) => item.ok).length;
    const byTag = recruitmentData.reduce((acc, item) => {
      if (item.ok) {
        acc[item.tag] = (acc[item.tag] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    const bySchool = recruitmentData.reduce((acc, item) => {
      if (item.ok) {
        const school = item.detail.forumMix.school;
        acc[school] = (acc[school] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return { total, byTag, bySchool, schoolCount: Object.keys(bySchool).length };
  }, [recruitmentData]);

  // Filter and search data based on current state (optimized with useMemo)
  // 根据当前状态过滤和搜索数据（使用 useMemo 优化性能）
  const filteredData = useMemo(() => {
    let filtered = recruitmentData.filter((item) => item.ok);

    // Filter by favorites / 按收藏过滤
    if (showFavoritesOnly) {
      const favoriteItems = getFavoriteItems(recruitmentData);
      filtered = filtered.filter((item) => favoriteItems.some((fav) => fav.id === item.id));
    }

    // Filter by tag / 按标签过滤
    if (selectedTag !== 'all') {
      filtered = filtered.filter((item) => item.tag === selectedTag);
    }

    // Filter by school / 按学校过滤
    if (selectedSchool !== 'all') {
      filtered = filtered.filter((item) => item.detail.forumMix.school === selectedSchool);
    }

    // Search in title, school, and major / 在标题、学校和专业中搜索
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(lowerSearchTerm) ||
          item.detail.forumMix.school.toLowerCase().includes(lowerSearchTerm) ||
          item.detail.forumMix.major.toLowerCase().includes(lowerSearchTerm),
      );
    }

    // Sort data / 排序数据
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'timestamp':
          aValue = a.timestamp;
          bValue = b.timestamp;
          break;
        case 'school':
          aValue = a.detail.forumMix.school;
          bValue = b.detail.forumMix.school;
          break;
        case 'major':
          aValue = a.detail.forumMix.major;
          bValue = b.detail.forumMix.major;
          break;
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        default:
          aValue = a.timestamp;
          bValue = b.timestamp;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue, 'zh-CN')
          : bValue.localeCompare(aValue, 'zh-CN');
      } else {
        return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
      }
    });

    return filtered;
  }, [recruitmentData, searchTerm, selectedTag, selectedSchool, showFavoritesOnly, sortField, sortOrder]);

  // Calculate paginated data (optimized with useMemo)
  // 计算分页数据（使用 useMemo 优化性能）
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  // Handle search input change (optimized with useCallback and debouncing)
  // 处理搜索输入变化（使用 useCallback 和防抖优化性能）
  const handleSearch = useCallback(
    (value: string) => {
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  // Handle filter changes (optimized with useCallback)
  // 处理筛选变化（使用 useCallback 优化性能）
  const handleTagChange = useCallback(
    (value: string) => {
      startTransition(() => {
        setSelectedTag(value);
        setCurrentPage(1);
      });
      scrollToTop();
    },
    [scrollToTop],
  );

  const handleSchoolChange = useCallback(
    (value: string) => {
      startTransition(() => {
        setSelectedSchool(value);
        setCurrentPage(1);
      });
      scrollToTop();
    },
    [scrollToTop],
  );

  // Handle sort change / 处理排序变化
  const handleSortChange = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortOrder('desc');
      }
      setCurrentPage(1);
      scrollToTop();
    },
    [sortField, sortOrder, scrollToTop],
  );

  // Reset all filters (optimized with useCallback)
  // 重置所有过滤器（使用 useCallback 优化性能）
  const handleReset = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    startTransition(() => {
      setSearchTerm('');
      setSelectedTag('all');
      setSelectedSchool('all');
      setShowFavoritesOnly(false);
      setSortField('timestamp');
      setSortOrder('desc');
      setCurrentPage(1);
    });
    setLoading(false);
    scrollToTop();
  }, [scrollToTop]);

  // Handle pagination change with smooth transitions
  // 处理分页变化并实现平滑过渡
  const handlePageChange = useCallback(
    (page: number, size?: number) => {
      setIsTransitioning(true);

      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      startTransition(() => {
        if (size && size !== pageSize) {
          setPageSize(size);
          setCurrentPage(1);
        } else {
          setCurrentPage(page);
        }
      });

      scrollToTop();

      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 200);
    },
    [pageSize, scrollToTop],
  );

  // Handle search input change without triggering immediate search
  // 处理搜索输入变化但不立即触发搜索
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      startTransition(() => {
        setSearchTerm('');
        setCurrentPage(1);
      });
      setLoading(false);
    }
  }, []);

  // Handle refresh / 处理刷新
  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const result = await refreshData();
      setRecruitmentData(result.data);
      setDataTimestamp(result.timestamp);
      message.success('数据已刷新 / Data refreshed');
    } catch (error) {
      console.error('Error refreshing data / 刷新数据错误:', error);
      message.error('刷新数据失败 / Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Handle export / 处理导出
  const handleExport = useCallback(
    (format: 'csv' | 'json') => {
      try {
        if (format === 'csv') {
          exportToCSV(filteredData, 'muchong_recruitment');
          message.success('CSV导出成功 / CSV exported successfully');
        } else {
          exportToJSON(filteredData, 'muchong_recruitment');
          message.success('JSON导出成功 / JSON exported successfully');
        }
      } catch (error) {
        console.error('Error exporting / 导出错误:', error);
        message.error('导出失败 / Export failed');
      }
    },
    [filteredData],
  );

  // Export menu items / 导出菜单项
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

  // Sort menu items / 排序菜单项
  const sortMenuItems: MenuProps['items'] = [
    {
      key: 'timestamp',
      label: '按时间排序',
      icon: sortField === 'timestamp' ? (sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />) : null,
      onClick: () => handleSortChange('timestamp'),
    },
    {
      key: 'school',
      label: '按学校排序',
      icon: sortField === 'school' ? (sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />) : null,
      onClick: () => handleSortChange('school'),
    },
    {
      key: 'major',
      label: '按专业排序',
      icon: sortField === 'major' ? (sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />) : null,
      onClick: () => handleSortChange('major'),
    },
    {
      key: 'title',
      label: '按标题排序',
      icon: sortField === 'title' ? (sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />) : null,
      onClick: () => handleSortChange('title'),
    },
  ];

  // Format timestamp / 格式化时间戳
  const formattedTimestamp = useMemo(() => {
    if (!dataTimestamp) return null;
    return new Date(dataTimestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [dataTimestamp]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={2} className={styles.headerTitle}>
          <BookOutlined /> 最新招生信息
        </Title>
        <div className={styles.headerActions}>
          <Space>
            <div className={styles.stats}>
              <span>共找到 {filteredData.length} 条招生信息</span>
            </div>
            {formattedTimestamp && (
              <div className={styles.timestamp}>
                <span>更新时间: {formattedTimestamp}</span>
              </div>
            )}
          </Space>
        </div>
      </div>

      {/* Statistics Cards / 统计卡片 */}
      <Row gutter={[16, 16]} className={styles.statisticsRow}>
        <Col xs={24} sm={12} md={6}>
          <AntCard>
            <Statistic title="总信息数" value={statistics.total} prefix={<BookOutlined />} />
          </AntCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <AntCard>
            <Statistic title="学校数量" value={statistics.schoolCount} prefix={<BarChartOutlined />} />
          </AntCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <AntCard>
            <Statistic
              title="博士招生"
              value={statistics.byTag['博士招生'] || 0}
              valueStyle={{ color: '#722ed1' }}
            />
          </AntCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <AntCard>
            <Statistic
              title="硕士招生"
              value={statistics.byTag['硕士招生'] || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </AntCard>
        </Col>
      </Row>

      <div className={styles.filters}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={8} lg={8}>
            <Search
              placeholder="搜索学校、专业或标题..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={handleSearchInputChange}
              className={styles.searchInput}
              loading={loading}
            />
          </Col>

          <Col xs={12} sm={12} md={3} lg={3}>
            <Select
              value={selectedTag}
              onChange={handleTagChange}
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
          </Col>

          <Col xs={12} sm={12} md={4} lg={4}>
            <Select
              value={selectedSchool}
              onChange={handleSchoolChange}
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
          </Col>

          <Col xs={24} sm={24} md={9} lg={9}>
            <Space wrap>
              <Button
                type={showFavoritesOnly ? 'primary' : 'default'}
                icon={<StarOutlined />}
                onClick={() => {
                  setShowFavoritesOnly(!showFavoritesOnly);
                  setCurrentPage(1);
                }}
                size="large"
              >
                {showFavoritesOnly ? '显示全部' : '仅收藏'}
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
                onClick={handleRefresh}
                loading={refreshing}
              >
                刷新
              </Button>
              <button onClick={handleReset} className={styles.resetButton}>
                重置筛选
              </button>
            </Space>
          </Col>
        </Row>
      </div>

      <div
        className={`${styles.content} ${loading ? styles.loading : ''} ${
          isTransitioning ? styles.transitioning : ''
        }`}
      >
        {initialLoading ? (
          <div className={styles.cardsContainer}>
            <Row gutter={[24, 24]}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Col key={i} xs={24} lg={12} xl={12}>
                  <RecruitmentCardSkeleton />
                </Col>
              ))}
            </Row>
          </div>
        ) : filteredData.length > 0 ? (
          <>
            <div className={styles.cardsContainer}>
              <Row gutter={[24, 24]} key={`page-${currentPage}-${pageSize}`}>
                {paginatedData.map((item) => (
                  <Col key={item.id} xs={24} lg={12} xl={12}>
                    <RecruitmentCard item={item} />
                  </Col>
                ))}
              </Row>
            </div>

            {/* Pagination component with optimized performance / 性能优化的分页组件 */}
            <div className={styles.paginationContainer}>
              <Pagination
                current={currentPage}
                total={filteredData.length}
                pageSize={pageSize}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条数据`}
                pageSizeOptions={['6', '12', '24', '48']}
                onChange={handlePageChange}
                onShowSizeChange={handlePageChange}
                className={styles.pagination}
                hideOnSinglePage={false}
                disabled={loading || isTransitioning}
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
