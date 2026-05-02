/**
 * Statistics component / 统计组件
 * Displays recruitment statistics cards / 展示招生统计卡片
 */

import React, { memo } from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { BookOutlined, BarChartOutlined } from '@ant-design/icons';
import { Statistics as StatisticsType } from '../../types/recruitment';
import styles from './Statistics.module.css';

interface StatisticsProps {
  statistics: StatisticsType;
}

const StatisticsComponent: React.FC<StatisticsProps> = memo(({ statistics }) => {
  return (
    <Row gutter={[16, 16]} className={styles.statisticsRow}>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic title="总信息数" value={statistics.total} prefix={<BookOutlined />} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic title="学校数量" value={statistics.schoolCount} prefix={<BarChartOutlined />} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="博士招生"
            value={statistics.byTag['博士招生'] || 0}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="硕士招生"
            value={statistics.byTag['硕士招生'] || 0}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
    </Row>
  );
});

StatisticsComponent.displayName = 'Statistics';

export default StatisticsComponent;
