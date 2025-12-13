/**
 * Export utility / 导出工具
 * Handles data export to CSV and JSON / 处理数据导出为CSV和JSON
 */

import { RecruitmentItem } from '../types';
import Papa from 'papaparse';

/**
 * Export data to CSV / 导出数据为CSV
 */
export const exportToCSV = (data: RecruitmentItem[], filename: string = 'recruitment_data'): void => {
  try {
    // Flatten data for CSV / 扁平化数据用于CSV
    const flattenedData = data.map((item) => ({
      类型: item.tag,
      标题: item.title,
      学校: item.detail.forumMix.school,
      专业: item.detail.forumMix.major,
      年级: item.detail.forumMix.grade,
      名额: item.detail.forumMix.quota,
      状态: item.detail.forumMix.status,
      联系方式: item.detail.forumMix.contact,
      发布时间: new Date(item.timestamp).toLocaleString('zh-CN'),
      链接: item.url,
      内容: item.detail.content.replace(/\n/g, ' ').replace(/<[^>]*>/g, '').substring(0, 200),
    }));

    const csv = Papa.unparse(flattenedData, {
      header: true,
    });

    // Add BOM for Excel compatibility / 添加BOM以兼容Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to CSV / 导出CSV错误:', error);
    throw new Error('Failed to export CSV / 导出CSV失败');
  }
};

/**
 * Export data to JSON / 导出数据为JSON
 */
export const exportToJSON = (data: RecruitmentItem[], filename: string = 'recruitment_data'): void => {
  try {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to JSON / 导出JSON错误:', error);
    throw new Error('Failed to export JSON / 导出JSON失败');
  }
};

