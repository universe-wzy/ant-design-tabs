import IframeWrapper from '@/components/IframeWrapper';
import PageNotFound from '@/pages/404';
import React from 'react';

/**
 * 根据渲染类型和组件字符串描述，生成对应的组件对象
 * @param renderType 渲染类型 0:组件渲染 1:iframe渲染 2:微应用渲染
 * @param appCode 应用编码
 * @param component 组件目录
 * @returns {React.NamedExoticComponent<object>|React.ComponentClass<{}, any>|*}
 */
export const renderComponent = (renderType?: number, appCode?: string, component?: string) => {
  if (renderType === 1) {
    return () => <IframeWrapper path={`${component}`} />;
  }
  if (renderType === 0) {
    return React.memo(
      React.lazy(() => import(`@/pages/${component}`).catch((e) => console.log(e))),
    );
  }
  if (appCode) {
    // return React.memo(() => <MicroAppWithMemoHistory name={appCode} url={component}/>);
  } else {
    return React.memo(() => <PageNotFound />);
  }
};
