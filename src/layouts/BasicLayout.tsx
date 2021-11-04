import React, {useCallback, useContext, useEffect} from 'react';
import type {Dispatch} from 'umi';
import {connect, history, isBrowser} from 'umi';
import {ConfigProvider, Layout} from 'antd';
import getLocales from '../locales';
import useMergedState from 'rc-util/lib/hooks/useMergedState';
import type {SiderMenuProps} from '@/layouts/Sider';
import Sider from '@/layouts/Sider';
import Header from '@/layouts/Header';
import Content from '@/layouts/Content';
import Footer from '@/layouts/Footer';
import type {MenuDataItem, MessageDescriptor, Route, TabPaneProps} from '@/layouts/typings';
import type {ConnectState} from '@/models/connect';
import WindowLayout from '@/layouts/WindowLayout';
import {CURRENT_TAB_KEY, CURRENT_TAB_PANE_LIST, DEFAULT_ACTIVE_KTY} from '@/constants';
import getMenuData from '@/layouts/utils/getMenuData';
import {useModel} from '@@/plugin-model/useModel';
import Omit from 'omit.js';
import {getPageTitle} from '@ant-design/pro-layout';
import {renderComponent} from '@/utils/utils';

export type BasicLayoutProps = {
  defaultTabPaneList: TabPaneProps[];
  dispatch: Dispatch;
  collapsed: boolean;
  menu?: {
    locale?: boolean;
    defaultOpenAll?: boolean;
    ignoreFlatMenu?: boolean;
    loading?: boolean;
    onLoadingChange?: (loading?: boolean) => void;
    params?: Record<string, any>;
    request?: (params: Record<string, any>, defaultMenuData: MenuDataItem[]) => Promise<MenuDataItem[]>;
    type?: 'sub' | 'group';
    autoClose?: false;
  };
  route: Route;
  formatMessage?: (message: MessageDescriptor) => string;
} & SiderMenuProps;

const BasicLayout: React.FC<BasicLayoutProps> = React.memo(props => {
  const {
    dispatch,
    location = {pathname: '/'},
    collapsed,
    activeKey,
    defaultTabPaneList,
    tabPaneList,
    menu,
    route,
    formatMessage: propsFormatMessage,
  } = props;

  const {initialState} = useModel('@@initialState');
  const settings = initialState?.settings;

  const context = useContext(ConfigProvider.ConfigContext);
  const prefixCls = props.prefixCls ?? context.getPrefixCls('pro');

  const formatMessage = useCallback(
    ({id, defaultMessage, ...restParams}: { id: string; defaultMessage?: string }): string => {
      if (propsFormatMessage) {
        return propsFormatMessage({
          id,
          defaultMessage,
          ...restParams,
        });
      }
      const locales = getLocales();
      return locales[id] ? locales[id] : (defaultMessage as string);
    },
    [propsFormatMessage],
  );

  const [menuInfoData] = useMergedState<{
    breadcrumb?: Record<string, MenuDataItem>;
    breadcrumbMap?: Map<string, MenuDataItem>;
    menuData?: MenuDataItem[];
  }>(() => getMenuData(route?.routes || [], menu, formatMessage));

  const {breadcrumb, breadcrumbMap, menuData = []} = menuInfoData || {};

  // 菜单缩放
  const handleMenuCollapse = (payload: boolean) => {
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload,
    });
  };

  // 设置tabPane列表
  const setTabPaneList = (payload: TabPaneProps[]) => {
    if (dispatch) {
      dispatch({
        type: 'global/setTabPaneList',
        payload,
      });
    }
  };

  /**
   * 设置当前激活的页签
   * 如果入参undefined，则激活默认页
   *
   * @param payload
   */
  const setActiveKey = (payload: string | undefined) => {
    if (dispatch) {
      if (payload !== undefined) {
        dispatch({
          type: 'global/setActiveKey',
          payload,
        });
        history.push(payload);
      } else {
        dispatch({
          type: 'global/setActiveKey',
          payload: DEFAULT_ACTIVE_KTY,
        });
        history.push(DEFAULT_ACTIVE_KTY);
      }
    }
  };

  // Splicing parameters, adding menuData and formatMessage in props
  const defaultProps = Omit(
    {
      prefixCls,
      ...props,
      formatMessage,
      breadcrumb,
      menu: {...menu},
    },
    ['className', 'style', 'breadcrumbRender'],
  );
  const pageTitle = getPageTitle({
    pathname: location.pathname,
    title: 'Ant Design Tabs',
    ...defaultProps,
    breadcrumbMap,
  });
  useEffect(() => {
    if (isBrowser()) {
      document.title = pageTitle;
    }
  }, [pageTitle]);
  useEffect(() => {
    // 渲染之前判断是否存在已有的tabPaneList，如果存在则优先渲染，为了刷新后保持tab页
    const historyTabPaneList = JSON.parse(sessionStorage.getItem(CURRENT_TAB_PANE_LIST) as string);
    if (historyTabPaneList) {
      const currentTabKey = sessionStorage.getItem(CURRENT_TAB_KEY) as string;
      sessionStorage.removeItem(CURRENT_TAB_PANE_LIST);
      sessionStorage.removeItem(CURRENT_TAB_KEY);
      const refreshCurrentTabPaneList = [...defaultTabPaneList];
      historyTabPaneList.forEach((tabPane: TabPaneProps) => {
        // 剔除默认的首页pane
        if (tabPane.key !== '/') {
          // eslint-disable-next-line no-param-reassign
          tabPane.content = renderComponent(tabPane.renderType, tabPane.componentStr);
          refreshCurrentTabPaneList.push(tabPane);
        }
      });
      setTabPaneList(refreshCurrentTabPaneList);
      setActiveKey(currentTabKey);
    }
  }, []);

  return (
    <>
      <Layout style={{minWidth: '1200px'}}>
        <Sider
          {...props}
          logo={settings?.logo}
          title={settings?.title}
          layout={settings?.layout}
          menuData={menuData}
          formatMessage={formatMessage}
          tabPaneList={tabPaneList}
          setTabPaneList={setTabPaneList}
          activeKey={activeKey}
          setActiveKey={setActiveKey}
          prefixCls={prefixCls}
        />
        <Layout>
          <Header
            collapsed={collapsed}
            handleMenuCollapse={handleMenuCollapse}
          />
          <Content
            tabPaneList={tabPaneList}
            setTabPaneList={setTabPaneList}
            activeKey={activeKey}
            setActiveKey={setActiveKey}
          />
          <Footer/>
        </Layout>
      </Layout>
      <WindowLayout
        tabPaneList={tabPaneList}
        setTabPaneList={setTabPaneList}
        activeKey={activeKey}
        setActiveKey={setActiveKey}
      />
    </>
  );
});

export default connect(({global}: ConnectState) => ({
  collapsed: global.collapsed,
  activeKey: global.activeKey,
  tabPaneList: global.tabPaneList,
  defaultTabPaneList: global.defaultTabPaneList,
}))(BasicLayout);
