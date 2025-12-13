import React from 'react';
import { Card, Skeleton } from 'antd';
import styles from './RecruitmentCard.module.css';

/**
 * Skeleton component for RecruitmentCard / 招生信息卡片的骨架屏组件
 */
const RecruitmentCardSkeleton: React.FC = () => {
  return (
    <Card className={styles.card} style={{ marginBottom: '1.5rem' }}>
      <div className={styles.cardHeader}>
        <Skeleton.Button active size="small" style={{ width: 80, height: 24 }} />
        <Skeleton.Button active size="small" style={{ width: 100, height: 20 }} />
      </div>
      
      <Skeleton active paragraph={{ rows: 1, width: '80%' }} style={{ marginBottom: '1.5rem' }} />
      
      <div className={styles.infoGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.infoItem}>
            <Skeleton.Avatar active size="small" shape="square" />
            <div style={{ flex: 1 }}>
              <Skeleton active paragraph={{ rows: 2, width: '100%' }} />
            </div>
          </div>
        ))}
      </div>
      
      <Skeleton active paragraph={{ rows: 3 }} style={{ marginTop: '1rem' }} />
    </Card>
  );
};

export default RecruitmentCardSkeleton;

