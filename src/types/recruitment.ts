/**
 * Shared type definitions / 共享类型定义
 * Used by both crawler and frontend / 爬虫和前端共用
 */

/**
 * Forum mix information type / 论坛混合信息类型
 */
export interface ForumMix {
  school: string;
  major: string;
  grade: string;
  quota: string;
  status: string;
  contact: string;
}

/**
 * Detail information type / 详细信息类型
 */
export interface PostDetail {
  forumMix: ForumMix;
  content: string;
}

/**
 * Recruitment item type / 招生项目类型
 */
export interface RecruitmentItem {
  tag: string;
  title: string;
  url: string;
  id: string;
  timestamp: number;
  detail: PostDetail;
  ok: boolean;
}

/**
 * Post type for crawler / 爬虫使用的帖子类型
 */
export interface Post {
  tag: string;
  title: string;
  url: string;
  id: string;
  timestamp: number;
  detail: PostDetail;
  ok: boolean;
}

/**
 * Sort field type / 排序字段类型
 */
export type SortField = 'timestamp' | 'school' | 'major' | 'title';

/**
 * Sort order type / 排序顺序类型
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Filter state type / 过滤状态类型
 */
export interface FilterState {
  searchTerm: string;
  selectedTag: string;
  selectedSchool: string;
  showFavoritesOnly: boolean;
  sortField: SortField;
  sortOrder: SortOrder;
}

/**
 * Pagination state type / 分页状态类型
 */
export interface PaginationState {
  page: number;
  pageSize: number;
}

/**
 * Statistics type / 统计信息类型
 */
export interface Statistics {
  total: number;
  byTag: Record<string, number>;
  bySchool: Record<string, number>;
  schoolCount: number;
}
