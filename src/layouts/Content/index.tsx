import type {CSSProperties} from 'react';
import React from 'react';
import {Route, KeepAlive, useAliveController, history} from 'umi';
import {Dropdown, Layout, Menu, Tabs} from 'antd';
import {ConfigProviderWrap} from '@ant-design/pro-provider';
import {ErrorBoundary} from '@ant-design/pro-utils';
import {isEqual} from 'lodash';
import type {TabPaneProps} from '@/layouts/typings';
import {DEFAULT_ACTIVE_KTY, IFRAME_COMPONENT_NAME} from '@/constants';
import type {MenuInfo} from 'rc-menu/lib/interface';
import {DownOutlined, UnorderedListOutlined} from '@ant-design/icons';
import styles from './style.less';
import IframeWrapper from '@/components/IframeWrapper';

export type TabContentProps = {
  tabPaneList: TabPaneProps[];
  setTabPaneList: (tabPanList: TabPaneProps[]) => void;
  activeKey: string;
  setActiveKey: (key: string | undefined) => void;
};

const WrapContent: React.FC<{
  className?: string;
  style?: CSSProperties;
  location?: any;
  ErrorBoundary?: any;
} & TabContentProps> = (props) => {
  const {
    style,
    tabPaneList,
    setTabPaneList,
    activeKey,
    setActiveKey,
  } = props;
  const ErrorComponent = props.ErrorBoundary || ErrorBoundary;

  // 清理keepalive缓存，关于清理本缓存，有如下issues
  // https://github.com/CJY0208/react-activation/issues/73
  const {drop, dropScope} = useAliveController();
  const clearKeepaliveCache = (key: string) => {
    new Promise<void>((resolve) => {
      if (history.location.pathname !== key) {
        resolve();
      }
    }).then(() => {
      dropScope(key);
      drop(key);
    });
  };
  // 关闭tab页
  const remove = (key: string) => {
    const newTabPaneList = tabPaneList.filter(tabPane => tabPane.key !== key || tabPane.key === DEFAULT_ACTIVE_KTY);
    setTabPaneList(newTabPaneList);
    if (isEqual(key, activeKey)) {
      setActiveKey(newTabPaneList[newTabPaneList.length - 1].key);
    }
    clearKeepaliveCache(key);
  };
  // 新增和删除页签的回调，在 type="editable-card" 时有效
  const onEdit = (targetKey: any, action: 'remove' | 'add'): void => {
    if (isEqual(action, 'remove')) {
      remove(targetKey);
    }
  };

  // 更多操作处理事件
  const onClickHover = (e: MenuInfo, currentKey: string) => {
    const {key} = e;
    if (key === '1') {
      remove(currentKey);
    } else if (key === '2') {
      setActiveKey(currentKey);
      setTabPaneList(
        tabPaneList.filter((v) => v.key === currentKey || v.key === DEFAULT_ACTIVE_KTY),
      );
    } else if (key === '3') {
      setTabPaneList(tabPaneList.filter((v) => v.key === DEFAULT_ACTIVE_KTY));
      setActiveKey(DEFAULT_ACTIVE_KTY);
    }
  };

  const dropdownMenu = (currentKey: string) => {
    return (
      <Menu
        onClick={(e) => {
          onClickHover(e, currentKey);
        }}
      >
        <Menu.Item key='1'>关闭当前标签页</Menu.Item>
        <Menu.Item key='2'>关闭其他标签页</Menu.Item>
        <Menu.Item key='3'>关闭全部标签页</Menu.Item>
        <Menu.Item key='4'>收藏当前页面</Menu.Item>
      </Menu>
    );
  };
  // 更多操作
  const operations = (
    <Dropdown overlay={dropdownMenu(activeKey)}>
      <a>
        <UnorderedListOutlined/>
        <span style={{margin: '0 10px'}}>更多操作</span>
        <DownOutlined/>
      </a>
    </Dropdown>
  );

  const tabBarDom = (innerProps: any, DefaultTabBar: React.ComponentType) => (
    <DefaultTabBar {...innerProps}>
      {(node: any) => (
        <Dropdown key={node.key} overlay={dropdownMenu(node.key)} trigger={['contextMenu']}>
          <span className={styles.tabTitle}>{node}</span>
        </Dropdown>
      )}
    </DefaultTabBar>
  );

  return (
    <ConfigProviderWrap>
      <ErrorComponent>
        <Layout.Content
          className={styles.content}
          style={style}
        >
          {tabPaneList && tabPaneList.length ? (
            <Tabs
              animated={true}
              renderTabBar={tabBarDom}
              activeKey={activeKey}
              onChange={key => setActiveKey(key)}
              tabBarExtraContent={operations}
              tabBarStyle={{margin: '0 0 8px 0'}}
              tabPosition='top'
              tabBarGutter={4}
              hideAdd
              type='editable-card'
              onEdit={onEdit}
              className={styles.layoutTabs}
            >
              {tabPaneList.map((item) => {
                const Component = item.content;
                if (undefined === Component) {
                  return null;
                }
                return (
                  <Tabs.TabPane
                    key={item.key}
                    tab={<span title={item.tab}>{item.tab}</span>}
                    closable={item.closable}
                    forceRender
                  >
                    {
                      Component.displayName === IFRAME_COMPONENT_NAME ?
                        <IframeWrapper id={item.key} path={item.targetUrl}/>
                        :
                        <Route
                          key={item.key}
                          path={item.route}
                          render={(innerProps) => (
                            // keepAlive来对路由中加载的组件进行缓存 id是为了存储多份数据
                            // 参考地址: https://github.com/CJY0208/react-activation/blob/master/README_CN.md
                            <KeepAlive name={item.key}>
                              <Component {...innerProps}/>
                            </KeepAlive>
                          )}
                        />
                    }
                  </Tabs.TabPane>
                );
              })}
            </Tabs>
          ) : null}
        </Layout.Content>
      </ErrorComponent>
    </ConfigProviderWrap>
  );
};

export default WrapContent;
