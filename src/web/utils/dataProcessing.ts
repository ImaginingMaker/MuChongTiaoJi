/**
 * Data processing utilities / 数据处理工具
 * Pure functions for filtering, sorting, and statistics / 过滤、排序、统计的纯函数
 */

import { RecruitmentItem, SortField, SortOrder, Statistics, FilterState } from '../../types/recruitment';

/**
 * Filter by tag / 按标签过滤
 */
export const filterByTag = (data: RecruitmentItem[], tag: string): RecruitmentItem[] =>
  tag === 'all' ? data : data.filter((item) => item.tag === tag);

/**
 * Filter by school / 按学校过滤
 */
export const filterBySchool = (data: RecruitmentItem[], school: string): RecruitmentItem[] =>
  school === 'all' ? data : data.filter((item) => item.detail.forumMix.school === school);

/**
 * Filter by favorites / 按收藏过滤
 */
export const filterByFavorites = (
  data: RecruitmentItem[],
  favoriteIds: Set<string>,
): RecruitmentItem[] => data.filter((item) => favoriteIds.has(item.id));

/**
 * Search items by term / 按关键词搜索
 */
export const searchItems = (data: RecruitmentItem[], term: string): RecruitmentItem[] => {
  if (!term) return data;
  const lower = term.toLowerCase();
  return data.filter(
    (item) =>
      item.title.toLowerCase().includes(lower) ||
      item.detail.forumMix.school.toLowerCase().includes(lower) ||
      item.detail.forumMix.major.toLowerCase().includes(lower),
  );
};

/**
 * Get sort value from item / 获取排序值
 */
const getSortValue = (item: RecruitmentItem, field: SortField): string | number => {
  switch (field) {
    case 'timestamp':
      return item.timestamp;
    case 'school':
      return item.detail.forumMix.school;
    case 'major':
      return item.detail.forumMix.major;
    case 'title':
      return item.title;
    default:
      return item.timestamp;
  }
};

/**
 * Sort items / 排序项目
 */
export const sortItems = (
  data: RecruitmentItem[],
  field: SortField,
  order: SortOrder,
): RecruitmentItem[] => {
  return [...data].sort((a, b) => {
    const aVal = getSortValue(a, field);
    const bVal = getSortValue(b, field);
    const cmp =
      typeof aVal === 'number'
        ? aVal - (bVal as number)
        : aVal.localeCompare(bVal as string, 'zh-CN');
    return order === 'asc' ? cmp : -cmp;
  });
};

/**
 * Apply all filters and sorting / 应用所有过滤和排序
 */
export const applyFilters = (
  data: RecruitmentItem[],
  filter: FilterState,
  favoriteIds: Set<string>,
): RecruitmentItem[] => {
  const steps = [
    (d: RecruitmentItem[]) => d.filter((item) => item.ok),
    (d: RecruitmentItem[]) => filterByTag(d, filter.selectedTag),
    (d: RecruitmentItem[]) => filterBySchool(d, filter.selectedSchool),
    (d: RecruitmentItem[]) =>
      filter.showFavoritesOnly ? filterByFavorites(d, favoriteIds) : d,
    (d: RecruitmentItem[]) => searchItems(d, filter.searchTerm),
    (d: RecruitmentItem[]) => sortItems(d, filter.sortField, filter.sortOrder),
  ];
  return steps.reduce((acc, step) => step(acc), data);
};

/**
 * Calculate statistics / 计算统计信息
 */
export const calculateStatistics = (data: RecruitmentItem[]): Statistics => {
  const validData = data.filter((item) => item.ok);
  const total = validData.length;

  const byTag = validData.reduce(
    (acc, item) => {
      acc[item.tag] = (acc[item.tag] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const bySchool = validData.reduce(
    (acc, item) => {
      const school = item.detail.forumMix.school;
      acc[school] = (acc[school] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    total,
    byTag,
    bySchool,
    schoolCount: Object.keys(bySchool).length,
  };
};

/**
 * Extract unique tags / 提取唯一标签
 */
export const extractUniqueTags = (data: RecruitmentItem[]): string[] => {
  const tags = new Set<string>();
  data.forEach((item) => tags.add(item.tag));
  return Array.from(tags);
};

/**
 * Extract unique schools / 提取唯一学校
 */
export const extractUniqueSchools = (data: RecruitmentItem[]): string[] => {
  const schools = new Set<string>();
  data.forEach((item) => schools.add(item.detail.forumMix.school));
  return Array.from(schools).sort();
};

/**
 * Paginate data / 分页数据
 */
export const paginateData = (
  data: RecruitmentItem[],
  page: number,
  pageSize: number,
): RecruitmentItem[] => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return data.slice(startIndex, endIndex);
};
