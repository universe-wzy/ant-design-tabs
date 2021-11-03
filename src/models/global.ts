// @ts-nocheck
import type { Reducer } from 'umi';
import { dynamic } from 'umi';
import LoadingComponent from '@ant-design/pro-layout';
import { DEFAULT_ACTIVE_KTY } from '@/constants';
import type {TabPaneProps} from '@/layouts/typings';

export interface GlobalModelState {
  collapsed: boolean;
  activeKey: string;
  defaultTabPaneList: TabPaneProps[];
  tabPaneList: TabPaneProps[];
}

export interface GlobalModelType {
  namespace: 'global';
  state: GlobalModelState;
  effects: {
  };
  reducers: {
    // 改变缩放状态，触发若干效果
    changeLayoutCollapsed: Reducer<GlobalModelState>;
    // 设置当前的页签列表
    setTabPaneList: Reducer<GlobalModelState>;
    // 设置当前激活的页签
    setActiveKey: Reducer<GlobalModelState>;
    // 重置多页签
    resetTabPaneList: Reducer<GlobalModelState>;
  };
}

/**
 * 定义常量
 */
const defaultTabPaneList = [
  {
    tab: '首页',
    key: '/',
    route: '/',
    closable: false,
    content: dynamic({
      loader: () => import(`@/pages/Welcome`),
      loading: LoadingComponent,
    }),
  },
];

/**
 * 全局model，定义一些影响整个页面渲染的状态
 */
const GlobalModel: GlobalModelType = {
  namespace: 'global',

  state: {
    collapsed: false,
    activeKey: DEFAULT_ACTIVE_KTY,
    defaultTabPaneList,
    tabPaneList: [...defaultTabPaneList],
  },

  effects: {
  },

  reducers: {
    changeLayoutCollapsed(state: any, { payload }) {
      return { ...state, collapsed: payload };
    },
    setTabPaneList(state, { payload }) {
      return {
        ...state,
        tabPaneList: payload,
      };
    },
    setActiveKey(state, { payload }) {
      return {
        ...state,
        activeKey: payload,
      };
    },
    resetTabPaneList(state) {
      return {
        ...state,
        activeKey: '/',
        tabPaneList: defaultTabPaneList,
      };
    },
  },
};
export default GlobalModel;
