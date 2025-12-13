/**
 * Data loader utility / 数据加载工具
 * Handles async data loading with caching / 处理带缓存的异步数据加载
 */

import { RecruitmentItem } from '../types';
import { getCachedData, setCachedData, getCacheTimestamp } from './dataCache';
import sourceData from '../assets/source.json';

/**
 * Load recruitment data with caching / 加载带缓存的招生数据
 */
export const loadRecruitmentData = async (): Promise<{
  data: RecruitmentItem[];
  fromCache: boolean;
  timestamp: number | null;
}> => {
  // Try to get from cache first / 首先尝试从缓存获取
  const cachedData = getCachedData();
  const cacheTimestamp = getCacheTimestamp();
  
  if (cachedData) {
    return {
      data: cachedData,
      fromCache: true,
      timestamp: cacheTimestamp,
    };
  }
  
  // Load from source file / 从源文件加载
  try {
    // Use static import (Vite supports JSON imports) / 使用静态导入（Vite支持JSON导入）
    const data = sourceData as RecruitmentItem[];
    
    // Cache the data / 缓存数据
    setCachedData(data);
    
    return {
      data,
      fromCache: false,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error loading data / 加载数据错误:', error);
    throw new Error('Failed to load recruitment data / 加载招生数据失败');
  }
};

/**
 * Refresh data from source / 从源刷新数据
 */
export const refreshData = async (): Promise<{
  data: RecruitmentItem[];
  timestamp: number;
}> => {
  try {
    // Use static import (Vite supports JSON imports) / 使用静态导入（Vite支持JSON导入）
    const data = sourceData as RecruitmentItem[];
    
    // Update cache / 更新缓存
    setCachedData(data);
    
    return {
      data,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error refreshing data / 刷新数据错误:', error);
    throw new Error('Failed to refresh data / 刷新数据失败');
  }
};

