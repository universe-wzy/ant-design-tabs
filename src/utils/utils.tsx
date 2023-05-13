import IframeWrapper from '@/components/IframeWrapper';
import PageNotFound from '@/pages/404';
import { ActionType } from '@ant-design/pro-components';
import { message } from 'antd';
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

/**
 * 转换接口数据为proTable需要的数据
 */
export const handleProTableRes = (res: API.RestResult<any>) => {
  return {
    success: res?.ok,
    total: res?.data?.total,
    data: res?.data?.records,
  };
};

/**
 * 公共的处理请求封装
 */
export const handleRes = (
  res: API.RestResult<any>,
  actionRef: React.MutableRefObject<ActionType | undefined>,
) => {
  if (res?.ok) {
    message.info('操作成功');
    actionRef?.current?.reload();
    return true;
  } else {
    message.error(res.msg);
  }
};

/**
 * 判断传入对象是否为空
 */
export const isEmpty = (obj: any) => {
  if (null === obj) {
    return true;
  }
  if ('object' === typeof obj) {
    return 0 === Object.keys(obj).length;
  }
  return typeof obj === 'undefined' || obj === '';
};
