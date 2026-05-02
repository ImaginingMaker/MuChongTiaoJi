/**
 * Recruitment state management hook / 招生状态管理 Hook
 * Centralized state management using useReducer / 使用 useReducer 集中管理状态
 */

import { useReducer, useCallback } from 'react';
import {
  RecruitmentItem,
  FilterState,
  PaginationState,
  SortField,
  SortOrder,
} from '../../types/recruitment';

/**
 * App state type / 应用状态类型
 */
export interface RecruitmentState {
  data: RecruitmentItem[];
  filter: FilterState;
  pagination: PaginationState;
  status: 'idle' | 'loading' | 'refreshing' | 'transitioning';
  timestamp: number | null;
}

/**
 * Action types / 操作类型
 */
type Action =
  | { type: 'SET_DATA'; payload: RecruitmentItem[] }
  | { type: 'SET_TIMESTAMP'; payload: number }
  | { type: 'SET_FILTER'; payload: Partial<FilterState> }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_PAGE_SIZE'; payload: number }
  | { type: 'SET_STATUS'; payload: RecruitmentState['status'] }
  | { type: 'TOGGLE_FAVORITES' }
  | { type: 'TOGGLE_SORT'; payload: SortField }
  | { type: 'RESET' };

/**
 * Initial state / 初始状态
 */
const initialState: RecruitmentState = {
  data: [],
  filter: {
    searchTerm: '',
    selectedTag: 'all',
    selectedSchool: 'all',
    showFavoritesOnly: false,
    sortField: 'timestamp',
    sortOrder: 'desc',
  },
  pagination: {
    page: 1,
    pageSize: 6,
  },
  status: 'loading',
  timestamp: null,
};

/**
 * Reducer function / Reducer 函数
 */
function recruitmentReducer(state: RecruitmentState, action: Action): RecruitmentState {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, data: action.payload, status: 'idle' };

    case 'SET_TIMESTAMP':
      return { ...state, timestamp: action.payload };

    case 'SET_FILTER':
      return {
        ...state,
        filter: { ...state.filter, ...action.payload },
        pagination: { ...state.pagination, page: 1 },
      };

    case 'SET_PAGE':
      return {
        ...state,
        pagination: { ...state.pagination, page: action.payload },
      };

    case 'SET_PAGE_SIZE':
      return {
        ...state,
        pagination: { page: 1, pageSize: action.payload },
      };

    case 'SET_STATUS':
      return { ...state, status: action.payload };

    case 'TOGGLE_FAVORITES':
      return {
        ...state,
        filter: {
          ...state.filter,
          showFavoritesOnly: !state.filter.showFavoritesOnly,
        },
        pagination: { ...state.pagination, page: 1 },
      };

    case 'TOGGLE_SORT': {
      const newSortOrder =
        state.filter.sortField === action.payload
          ? state.filter.sortOrder === 'asc'
            ? 'desc'
            : 'asc'
          : 'desc';
      return {
        ...state,
        filter: {
          ...state.filter,
          sortField: action.payload,
          sortOrder: newSortOrder as SortOrder,
        },
        pagination: { ...state.pagination, page: 1 },
      };
    }

    case 'RESET':
      return {
        ...initialState,
        data: state.data,
        timestamp: state.timestamp,
      };

    default:
      return state;
  }
}

/**
 * Hook return type / Hook 返回类型
 */
interface UseRecruitmentStateReturn {
  state: RecruitmentState;
  setData: (data: RecruitmentItem[]) => void;
  setTimestamp: (timestamp: number) => void;
  setFilter: (filter: Partial<FilterState>) => void;
  setSearchTerm: (term: string) => void;
  setTag: (tag: string) => void;
  setSchool: (school: string) => void;
  toggleFavorites: () => void;
  toggleSort: (field: SortField) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setStatus: (status: RecruitmentState['status']) => void;
  reset: () => void;
}

/**
 * Recruitment state management hook / 招生状态管理 Hook
 */
export const useRecruitmentState = (): UseRecruitmentStateReturn => {
  const [state, dispatch] = useReducer(recruitmentReducer, initialState);

  const setData = useCallback((data: RecruitmentItem[]) => {
    dispatch({ type: 'SET_DATA', payload: data });
  }, []);

  const setTimestamp = useCallback((timestamp: number) => {
    dispatch({ type: 'SET_TIMESTAMP', payload: timestamp });
  }, []);

  const setFilter = useCallback((filter: Partial<FilterState>) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: 'SET_FILTER', payload: { searchTerm: term } });
  }, []);

  const setTag = useCallback((tag: string) => {
    dispatch({ type: 'SET_FILTER', payload: { selectedTag: tag } });
  }, []);

  const setSchool = useCallback((school: string) => {
    dispatch({ type: 'SET_FILTER', payload: { selectedSchool: school } });
  }, []);

  const toggleFavorites = useCallback(() => {
    dispatch({ type: 'TOGGLE_FAVORITES' });
  }, []);

  const toggleSort = useCallback((field: SortField) => {
    dispatch({ type: 'TOGGLE_SORT', payload: field });
  }, []);

  const setPage = useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  const setPageSize = useCallback((size: number) => {
    dispatch({ type: 'SET_PAGE_SIZE', payload: size });
  }, []);

  const setStatus = useCallback((status: RecruitmentState['status']) => {
    dispatch({ type: 'SET_STATUS', payload: status });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    setData,
    setTimestamp,
    setFilter,
    setSearchTerm,
    setTag,
    setSchool,
    toggleFavorites,
    toggleSort,
    setPage,
    setPageSize,
    setStatus,
    reset,
  };
};
