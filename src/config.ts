/**
 * Application configuration / 应用配置
 * Centralized configuration management / 集中配置管理
 */

import path from 'path';

export const config = {
  crawler: {
    indexUrl: 'https://muchong.com/f-430-1-threadtype-11',
    concurrency: 5,
    maxRecords: 1000,
    uaPoolSize: 100,
  },
  paths: {
    dataDir: path.resolve(__dirname, './web/assets'),
    sourceFile: 'source.json',
  },
  cache: {
    duration: 24 * 60 * 60 * 1000, // 24 hours
  },
  pagination: {
    defaultPageSize: 6,
    pageSizeOptions: ['6', '12', '24', '48'],
  },
} as const;

/**
 * Get the full path to the source data file
 */
export const getSourceFilePath = (): string => {
  return path.join(config.paths.dataDir, config.paths.sourceFile);
};
