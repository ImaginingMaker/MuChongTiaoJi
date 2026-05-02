/**
 * Filtered data hook / 过滤数据 Hook
 * Encapsulates filtering and sorting logic / 封装过滤排序逻辑
 */

import { useMemo } from 'react';
import { RecruitmentItem, FilterState } from '../../types/recruitment';
import { applyFilters, calculateStatistics, paginateData } from '../utils/dataProcessing';
import { getFavorites } from '../utils/favorites';

/**
 * Hook return type / Hook 返回类型
 */
interface UseFilteredDataReturn {
  filteredData: RecruitmentItem[];
  paginatedData: RecruitmentItem[];
  statistics: {
    total: number;
    byTag: Record<string, number>;
    bySchool: Record<string, number>;
    schoolCount: number;
  };
  uniqueTags: string[];
  uniqueSchools: string[];
  totalCount: number;
}

/**
 * Filtered data hook / 过滤数据 Hook
 */
export const useFilteredData = (
  data: RecruitmentItem[],
  filter: FilterState,
  page: number,
  pageSize: number,
): UseFilteredDataReturn => {
  const favoriteIds = useMemo(() => new Set(getFavorites()), []);

  const filteredData = useMemo(
    () => applyFilters(data, filter, favoriteIds),
    [data, filter, favoriteIds],
  );

  const paginatedData = useMemo(
    () => paginateData(filteredData, page, pageSize),
    [filteredData, page, pageSize],
  );

  const statistics = useMemo(
    () => calculateStatistics(data),
    [data],
  );

  const uniqueTags = useMemo(
    () => {
      const tags = new Set<string>();
      data.forEach((item) => tags.add(item.tag));
      return Array.from(tags);
    },
    [data],
  );

  const uniqueSchools = useMemo(
    () => {
      const schools = new Set<string>();
      data.forEach((item) => schools.add(item.detail.forumMix.school));
      return Array.from(schools).sort();
    },
    [data],
  );

  return {
    filteredData,
    paginatedData,
    statistics,
    uniqueTags,
    uniqueSchools,
    totalCount: filteredData.length,
  };
};
