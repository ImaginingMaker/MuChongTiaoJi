/**
 * Favorites utility / 收藏工具
 * Handles favorite recruitment items / 处理收藏的招生信息
 */

import { RecruitmentItem } from '../types';

const FAVORITES_KEY = 'muchong_favorites';

/**
 * Get all favorites / 获取所有收藏
 */
export const getFavorites = (): string[] => {
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error reading favorites / 读取收藏错误:', error);
    return [];
  }
};

/**
 * Add to favorites / 添加到收藏
 */
export const addFavorite = (id: string): void => {
  try {
    const favorites = getFavorites();
    if (!favorites.includes(id)) {
      favorites.push(id);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Error adding favorite / 添加收藏错误:', error);
  }
};

/**
 * Remove from favorites / 从收藏中移除
 */
export const removeFavorite = (id: string): void => {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter((favId) => favId !== id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing favorite / 移除收藏错误:', error);
  }
};

/**
 * Check if item is favorited / 检查项目是否已收藏
 */
export const isFavorite = (id: string): boolean => {
  const favorites = getFavorites();
  return favorites.includes(id);
};

/**
 * Toggle favorite status / 切换收藏状态
 */
export const toggleFavorite = (id: string): boolean => {
  if (isFavorite(id)) {
    removeFavorite(id);
    return false;
  } else {
    addFavorite(id);
    return true;
  }
};

/**
 * Get favorite items from data / 从数据中获取收藏的项目
 */
export const getFavoriteItems = (data: RecruitmentItem[]): RecruitmentItem[] => {
  const favoriteIds = getFavorites();
  return data.filter((item) => favoriteIds.includes(item.id));
};

