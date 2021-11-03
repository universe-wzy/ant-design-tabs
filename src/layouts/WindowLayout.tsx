import React from 'react';
import type { TabContentProps } from '@/layouts/Content';
import {CURRENT_TAB_KEY, CURRENT_TAB_PANE_LIST} from '@/constants';

export type WindowLayoutProps = {

} & TabContentProps;

const WindowLayout: React.FC<WindowLayoutProps> = props => {

  const {
    activeKey,
    tabPaneList,
  } = props;

  window.onbeforeunload = () => {
    let newActiveKey = activeKey;
    if (tabPaneList) {
      tabPaneList.forEach(tabPane => {
        if (tabPane.renderType === 1 || tabPane.key.indexOf('openPageIframeWrapper') !== -1) {
          if (tabPane.key === newActiveKey) {
            newActiveKey = "/";
          }
          tabPaneList.remove(tabPane);
        }
      })
    }
    // 刷新之前将当前tabPane列表存入sessionStorage
    sessionStorage.setItem(CURRENT_TAB_PANE_LIST, JSON.stringify(tabPaneList));
    sessionStorage.setItem(CURRENT_TAB_KEY, newActiveKey);
  }

  return <></>;
}

export default WindowLayout;
