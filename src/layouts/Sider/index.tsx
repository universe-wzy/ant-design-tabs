import React, {Suspense} from 'react';
import {Layout} from 'antd';
import classNames from 'classnames';
import PageLoading from '@ant-design/pro-layout';
import type {BaseMenuProps} from './BaseMenu';
import BaseMenu from './BaseMenu';
import styles from './style.less';

const {Sider} = Layout;

export const defaultRenderLogo = (logo: React.ReactNode): React.ReactNode => {
  if (typeof logo === 'string') {
    return <img src={logo} alt='logo'/>;
  }
  if (typeof logo === 'function') {
    return logo();
  }
  return logo;
};

export const defaultRenderLogoAndTitle = (
  props: SiderMenuProps,
  renderKey: string = 'menuHeaderRender',
): React.ReactNode => {
  const {logo, title, layout} = props;
  const renderFunction = props[renderKey || ''];
  if (renderFunction === false) {
    return null;
  }
  const logoDom = defaultRenderLogo(logo);
  const titleDom = <h1 style={{color: '#1890ff', fontSize: '17px'}}>{title}</h1>;

  if (renderFunction) {
    // when collapsed, no render title
    return renderFunction(logoDom, props.collapsed ? null : titleDom, props);
  }

  if (layout === 'mix' && renderKey === 'menuHeaderRender') {
    return null;
  }

  return (
    <a>
      {logoDom}
      {props.collapsed ? null : titleDom}
    </a>
  );
};

export type SiderMenuProps = {
  logo?: React.ReactNode;
  layout?: string;
  collapsed?: boolean;
  theme?: 'light' | 'dark';
  fixSiderBar?: boolean;
} & Pick<BaseMenuProps, Exclude<keyof BaseMenuProps, ['onCollapse']>>;

const SiderMenu: React.FC<SiderMenuProps> = React.memo(props => {

  const {
    collapsed,
    theme,
    fixSiderBar,
    prefixCls,
  } = props;

  const baseClassName = `${prefixCls}-sider`;

  const headerDom = defaultRenderLogoAndTitle(props);


  const siderClassName = classNames(styles.sider, {
    [styles.fixSiderBar]: fixSiderBar,
    [styles.light]: theme === 'light',
  });

  return (
    <Sider
      collapsible
      trigger={null}
      collapsed={collapsed}
      breakpoint='lg'
      width={208}
      theme={theme}
      className={siderClassName}
    >
      {headerDom && (
        <div
          className={classNames(`${baseClassName}-logo`, {
            [`${baseClassName}-collapsed`]: collapsed,
          })}
          id='logo'
        >
          {headerDom}
        </div>
      )}
      <Suspense fallback={<PageLoading/>}>
        <BaseMenu
          className={styles['Suspense-box']}
          mode='inline'
          style={{width: '100%'}}
          {...props}
        />
      </Suspense>
    </Sider>
  );
});

export default SiderMenu;
