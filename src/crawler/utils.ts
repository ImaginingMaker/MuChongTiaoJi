/**
 * Crawler utilities / 爬虫工具
 * Core crawling logic / 核心爬取逻辑
 */

import { UA_POOL, INDEX_URL, CRAWLER_CONFIG } from './config';
import axios from 'axios';
import iconv from 'iconv-lite';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Post, ForumMix } from '../types/recruitment';

const getRandomUserAgent = () => {
  return UA_POOL[Math.floor(Math.random() * UA_POOL.length)];
};

/**
 * Fetch a page with random User-Agent and decode as gbk
 */
const fetchPageWithUA = async (url: string): Promise<string> => {
  const userAgent = getRandomUserAgent();
  const response = await axios.get(url, {
    headers: {
      'User-Agent': userAgent,
    },
    responseType: 'arraybuffer',
  });
  return iconv.decode(Buffer.from(response.data), 'gbk');
};

/**
 * Forum mix key mapping / 字段映射
 */
const forumMixKeyMap: Record<string, keyof ForumMix> = {
  学校: 'school',
  专业: 'major',
  年级: 'grade',
  招生人数: 'quota',
  招生状态: 'status',
  联系方式: 'contact',
};

/**
 * Get data directory path / 获取数据目录路径
 */
const getDataDir = (): string => {
  return path.resolve(__dirname, '../web/assets');
};

/**
 * Get source file path / 获取源文件路径
 */
const getSourceFilePath = (): string => {
  return path.join(getDataDir(), 'source.json');
};

/**
 * Ensure data directory exists / 确保数据目录存在
 */
const ensureDataDir = (): void => {
  const dataDir = getDataDir();
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

/**
 * Fetch index page and extract post links
 * 爬取列表页，提取招生帖子链接
 */
const fetchIndexUrl = async (): Promise<Post[]> => {
  const html = await fetchPageWithUA(INDEX_URL);
  const $ = cheerio.load(html);
  const baseUrl = 'https://muchong.com';
  const results: Post[] = [];

  $('tr.forum_list').each((_, tr) => {
    const threadNameTh = $(tr).find('th.thread-name');
    const typeText = threadNameTh.find('span > a.xmc_blue').text();

    if (typeText.includes('招生')) {
      const postA = threadNameTh.find('a.a_subject');
      const title = postA.text().trim();
      let url = postA.attr('href') || '';
      url = url.startsWith('http') ? url : baseUrl + url;
      const id = crypto.createHash('md5').update(url).digest('hex');

      const dateStr = $(tr).find('td.by em').text().trim();
      let timestamp = Date.now();
      if (dateStr) {
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          timestamp = parsedDate.getTime();
        }
      }

      results.push({
        tag: typeText,
        title,
        url,
        id,
        timestamp,
        detail: {
          forumMix: {
            school: '',
            major: '',
            grade: '',
            quota: '',
            status: '',
            contact: '',
          },
          content: '',
        },
        ok: false,
      });
    }
  });

  ensureDataDir();
  const filePath = getSourceFilePath();

  let existing: Post[] = [];
  if (fs.existsSync(filePath)) {
    try {
      existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      existing = [];
    }
  }

  const dedupedMap = new Map<string, Post>();

  for (const item of existing) {
    dedupedMap.set(item.id, item);
  }

  for (const item of results) {
    const existingItem = dedupedMap.get(item.id);
    dedupedMap.set(item.id, { ...existingItem, ...item });
  }

  const deduped = Array.from(dedupedMap.values())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, CRAWLER_CONFIG.maxRecords);

  fs.writeFileSync(filePath, JSON.stringify(deduped, null, 2), 'utf-8');
  return deduped;
};

/**
 * Fetch post details concurrently
 * 并发爬取详情页
 */
const fetchPostsDetail = async (): Promise<Post[]> => {
  const filePath = getSourceFilePath();

  if (!fs.existsSync(filePath)) {
    throw new Error('source.json not found');
  }

  const posts: Post[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const results: Post[] = [];

  const concurrency = CRAWLER_CONFIG.concurrency;
  let idx = 0;

  async function worker() {
    while (idx < posts.length) {
      const current = idx++;
      const post = posts[current];

      if (post.ok) {
        results.push(post);
        continue;
      }

      try {
        const html = await fetchPageWithUA(post.url);
        const $ = cheerio.load(html);
        const forumMix: ForumMix = {
          school: '',
          major: '',
          grade: '',
          quota: '',
          status: '',
          contact: '',
        };

        const forumDiv = $('div.forum_Mix');
        if (forumDiv.length) {
          forumDiv.find('table.adjust_table tr').each((_, tr) => {
            const tds = $(tr).find('td');
            if (tds.length === 2) {
              let key = $(tds[0]).text().replace(/[:：\s]/g, '').trim();
              let value = $(tds[1]).text().replace(/\s{2,}/g, ' ').trim();
              if (key && value) {
                const mappedKey = forumMixKeyMap[key];
                if (mappedKey) {
                  forumMix[mappedKey] = value;
                }
              }
            }
          });
        }

        let content = '';
        const tfszDiv = $('div.t_fsz').first();
        if (tfszDiv.length) {
          tfszDiv.find('img').remove();
          content = tfszDiv.html() || '';
        }

        results.push({
          ...post,
          detail: { forumMix, content },
          ok: true,
        });
      } catch {
        results.push({
          ...post,
          detail: {
            forumMix: {
              school: '',
              major: '',
              grade: '',
              quota: '',
              status: '',
              contact: '',
            },
            content: '',
          },
          ok: false,
        });
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  const sorted = results.sort((a, b) => b.timestamp - a.timestamp);
  fs.writeFileSync(filePath, JSON.stringify(sorted, null, 2), 'utf-8');

  return sorted.filter((item) => item.ok);
};

export { getRandomUserAgent, fetchIndexUrl, fetchPostsDetail, fetchPageWithUA };
