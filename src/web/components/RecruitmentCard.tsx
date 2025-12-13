import React, { memo, useCallback, useState, useEffect } from 'react';
import { Card, Tag, Typography, Divider, Button } from 'antd';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  BookOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
  StarOutlined,
  StarFilled,
} from '@ant-design/icons';
import { RecruitmentItem } from '../types';
import { isFavorite, toggleFavorite } from '../utils/favorites';
import styles from './RecruitmentCard.module.css';

const { Title, Text, Paragraph } = Typography;

interface RecruitmentCardProps {
  item: RecruitmentItem;
}

/**
 * Recruitment information card component / 招生信息卡片组件
 * Displays detailed recruitment information in a structured card format
 * 以结构化卡片格式展示详细的招生信息
 *
 * @param item Recruitment item data / 招生项目数据
 * @returns RecruitmentCard component / 招生信息卡片组件
 */
const RecruitmentCard: React.FC<RecruitmentCardProps> = memo(({ item }) => {
  const [favorited, setFavorited] = useState<boolean>(false);

  // Check favorite status on mount / 挂载时检查收藏状态
  useEffect(() => {
    setFavorited(isFavorite(item.id));
  }, [item.id]);

  // Format timestamp to readable date (memoized)
  // 将时间戳格式化为可读日期（缓存）
  const formattedDate = React.useMemo(() => {
    return new Date(item.timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [item.timestamp]);

  // Get tag color based on recruitment type (memoized)
  // 根据招生类型获取标签颜色（缓存）
  const tagColor = React.useMemo(() => {
    switch (item.tag) {
      case '博士招生':
        return 'purple';
      case '硕士招生':
        return 'blue';
      default:
        return 'default';
    }
  }, [item.tag]);

  // Extract clean text from HTML content (memoized)
  // 从HTML内容中提取纯文本（缓存）
  const cleanContent = React.useMemo(() => {
    const div = document.createElement('div');
    div.innerHTML = item.detail.content;
    return div.textContent || div.innerText || '';
  }, [item.detail.content]);

  // Handle view original post (memoized callback)
  // 处理查看原文（缓存回调）
  const handleViewOriginal = useCallback(() => {
    window.open(item.url, '_blank');
  }, [item.url]);

  // Handle favorite toggle (memoized callback)
  // 处理收藏切换（缓存回调）
  const handleToggleFavorite = useCallback(() => {
    const newStatus = toggleFavorite(item.id);
    setFavorited(newStatus);
  }, [item.id]);

  const { detail } = item;

  return (
    <Card
      className={styles.card}
      hoverable
      actions={[
        <Button
          key="favorite"
          type={favorited ? 'default' : 'default'}
          icon={favorited ? <StarFilled /> : <StarOutlined />}
          onClick={handleToggleFavorite}
          style={{ color: favorited ? '#faad14' : undefined }}
        >
          {favorited ? '已收藏' : '收藏'}
        </Button>,
        <Button
          key="view-original"
          type="primary"
          icon={<LinkOutlined />}
          onClick={handleViewOriginal}
        >
          查看原文
        </Button>,
      ]}
    >
      <div className={styles.cardHeader}>
        <div className={styles.tagContainer}>
          <Tag color={tagColor} className={styles.typeTag}>
            {item.tag}
          </Tag>
          <Tag color="green" className={styles.statusTag}>
            {detail.forumMix.status}
          </Tag>
        </div>
        <Text type="secondary" className={styles.date}>
          <CalendarOutlined /> {formattedDate}
        </Text>
      </div>

      <Title level={4} className={styles.title}>
        {item.title}
      </Title>

      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <EnvironmentOutlined className={styles.icon} />
          <div>
            <Text strong>学校</Text>
            <br />
            <Text>{detail.forumMix.school}</Text>
          </div>
        </div>

        <div className={styles.infoItem}>
          <BookOutlined className={styles.icon} />
          <div>
            <Text strong>专业</Text>
            <br />
            <Text>{detail.forumMix.major}</Text>
          </div>
        </div>

        <div className={styles.infoItem}>
          <CalendarOutlined className={styles.icon} />
          <div>
            <Text strong>年级</Text>
            <br />
            <Text>{detail.forumMix.grade}</Text>
          </div>
        </div>

        <div className={styles.infoItem}>
          <TeamOutlined className={styles.icon} />
          <div>
            <Text strong>名额</Text>
            <br />
            <Text>{detail.forumMix.quota}</Text>
          </div>
        </div>
      </div>

      <Divider />

      <div className={styles.content}>
        <Title level={5}>
          <ExclamationCircleOutlined /> 详细信息
        </Title>
        <Paragraph
          ellipsis={{ rows: 4, expandable: true, symbol: '展开更多' }}
          className={styles.contentText}
        >
          {cleanContent}
        </Paragraph>
      </div>

      <div className={styles.contact}>
        <Text type="secondary">
          <ExclamationCircleOutlined /> 联系方式：{detail.forumMix.contact}
        </Text>
      </div>
    </Card>
  );
});

// Add display name for debugging / 添加显示名称用于调试
RecruitmentCard.displayName = 'RecruitmentCard';

export default RecruitmentCard;
