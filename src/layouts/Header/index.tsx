import React from 'react';
import { Layout } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import RightContent from './RightContent';
import styles from './style.less';

export type HeaderViewProps = {
  collapsed: boolean;
  handleMenuCollapse: (collapsed: boolean) => void;
};

const HeaderView: React.FC<HeaderViewProps> = React.memo(props => {
  const {
    collapsed,
    handleMenuCollapse
  } = props;

  return (
    <Layout.Header className={styles.header}>
      <span className={styles.trigger} onClick={() => handleMenuCollapse(!collapsed)}>
        {collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
      </span>
      <RightContent/>
    </Layout.Header>
  );
});

export default HeaderView;
