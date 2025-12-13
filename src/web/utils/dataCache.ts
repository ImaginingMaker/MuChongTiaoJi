/**
 * Data cache utility / 数据缓存工具
 * Handles data caching and loading optimization / 处理数据缓存和加载优化
 */

import { RecruitmentItem } from '../types';

const CACHE_KEY = 'muchong_recruitment_data';
const CACHE_TIMESTAMP_KEY = 'muchong_recruitment_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours / 24小时

/**
 * Get cached data / 获取缓存数据
 */
export const getCachedData = (): RecruitmentItem[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (!cached || !timestamp) {
      return null;
    }
    
    const cacheTime = parseInt(timestamp, 10);
    const now = Date.now();
    
    // Check if cache is expired / 检查缓存是否过期
    if (now - cacheTime > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      return null;
    }
    
    return JSON.parse(cached);
  } catch (error) {
    console.error('Error reading cache / 读取缓存错误:', error);
    return null;
  }
};

/**
 * Set cached data / 设置缓存数据
 */
export const setCachedData = (data: RecruitmentItem[]): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error setting cache / 设置缓存错误:', error);
    // Handle quota exceeded error / 处理配额超出错误
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // Clear old cache and try again / 清除旧缓存并重试
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      } catch (retryError) {
        console.error('Failed to cache data after cleanup / 清理后缓存数据失败:', retryError);
      }
    }
  }
};

/**
 * Get cache timestamp / 获取缓存时间戳
 */
export const getCacheTimestamp = (): number | null => {
  try {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    console.error('Error reading cache timestamp / 读取缓存时间戳错误:', error);
    return null;
  }
};

/**
 * Clear cache / 清除缓存
 */
export const clearCache = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  } catch (error) {
    console.error('Error clearing cache / 清除缓存错误:', error);
  }
};

