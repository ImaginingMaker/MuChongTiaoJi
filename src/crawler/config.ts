/**
 * Crawler configuration / 爬虫配置
 */

import { generateUserAgent } from '@imaginerlabs/user-agent-generator';

export const INDEX_URL = 'https://muchong.com/f-430-1-threadtype-11';

export const UA_POOL_SIZE = 100;

export const UA_POOL: string[] = (generateUserAgent({
  browser: 'chrome',
  device: 'mac',
  count: UA_POOL_SIZE,
}) as unknown) as string[];

export const CRAWLER_CONFIG = {
  concurrency: 5,
  maxRecords: 1000,
} as const;
