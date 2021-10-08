import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import LoadingComponent, { PageLoading } from '@ant-design/pro-layout';
import type { RequestConfig } from 'umi';
import { dynamic, history } from 'umi';
import {notification} from 'antd';
import type { ResponseError, RequestOptionsInit } from 'umi-request';
import { isEmpty } from 'lodash';
import type {Route} from '@/layouts/typings';
import IframeWrapper from '@/components/IframeWrapper';
import { currentUser as queryCurrentUser, fetchRoutes } from './services/ant-design-pro/api';
import defaultSettings from '../config/defaultSettings';
import { ACCESS_TOKEN, LOGIN_PATH } from '@/constants';

/**
 * 动态拼接路由
 */
let extraRoutes: [] = [];

/**
 * 拼接路由
 * @param routes
 */
export function patchRoutes({routes}: {routes: Route[]}) {
  // 约定索引4的路由动态拼接服务端的路由
  [].push.apply(routes[4].routes, extraRoutes);
}

/**
 * 从服务端读取路由
 * @param oldRender
 */
export function render(oldRender: () => void) {
  /**
   * 根据渲染类型和组件字符串描述，生成对应的组件对象
   * @param renderType 渲染类型 0：组件渲染， 1：iframe渲染
   * @param componentStr 组件名称，对应组件目录
   * @returns {React.NamedExoticComponent<object>|React.ComponentClass<{}, any>|*}
   */
  const renderComponent = (renderType: number, componentStr: string) => {
    if (renderType === 1) {
      return IframeWrapper;
    }
    return dynamic({
      loader: async function() {
        // 因为动态引入组件 需要 webpack 打包，引入时需要具体到目录文件所以
        // @/pages/dynamicPages硬编码  约定组件文件都放在 @/pages/dynamicPages下
        const {default: Page} = await import(`@/pages/dynamicPages/${componentStr}`);
        return (props: any) => <Page {...props} />;
      },
      loading: LoadingComponent,
    });
  };

  /**
   * 服务端读取的组件字段为字符串，需要导入组件
   * @param routes
   */
  const addComponent = (routes: Route[]) => {
    if (Array.isArray(routes)) {
      routes.forEach(route => {
        if (route.children) {
          addComponent(route.children);
        } else {
          route.componentStr = route.component;
          route.component = renderComponent(route.renderType, route.component);
        }
      });
    }
  };

  // 判断是否有token信息，如果没有则跳转到登录页
  if (isEmpty(localStorage.getItem(ACCESS_TOKEN))) {
    history.push(LOGIN_PATH);
    oldRender();
  } else {
    fetchRoutes().then(res => {
      addComponent(res.data);
      extraRoutes = res.data;
      oldRender();
    });
  }
}

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading/>,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings & {logo?: string}>;
  currentUser?: API.CurrentUser;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser();
      return msg.data;
    } catch (error) {
      history.push(LOGIN_PATH);
    }
    return undefined;
  };
  // 如果是登录页面，不执行
  if (history.location.pathname !== LOGIN_PATH) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}

/**
 * 异常处理程序
 */
const errorHandler = (error: ResponseError) => {
  const codeMessage = {
    200: '服务器成功返回请求的数据。',
    201: '新建或修改数据成功。',
    202: '一个请求已经进入后台排队（异步任务）。',
    204: '删除数据成功。',
    400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401: '用户没有权限（令牌、用户名、密码错误）。',
    403: '用户得到授权，但是访问是被禁止的。',
    404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的。',
    422: '当创建一个对象时，发生一个验证错误。',
    500: '服务器发生错误，请检查服务器。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',
  };

  const { data, response } = error;

  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;
    switch (status) {
      case 401:
        localStorage.clear();
        break;
      case 402:
        break;
      case 400:
        if (isEmpty(data) || data.code !== 'A0301') {
          notification.error({
            message: `参数异常 ${status}: ${url}`,
            description: errorText,
          });
        }
        break;
      case 500:
        notification.error({
          message: `请求错误 ${status}: ${url}, 请联系系统管理员`,
          description: errorText,
        });
        break;
      default:
        notification.error({
          message: `请求错误 ${status}: ${url}`,
          description: errorText,
        });
    }
  } else if (!response) {
    // 跨域接口同样会进入该结构
    // 所以对于没有响应的请求，暂时屏蔽处理
    // notification.error({
    //   description: '您的网络发生异常，无法连接服务器',
    //   message: '网络异常',
    // });
  }
  return {
    ...response,
    data,
  };
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-request
 * */
export const request: RequestConfig = {
  timeout: 10000,
  errorConfig: {},
  errorHandler,
  requestInterceptors: [
    (url: string, options: RequestOptionsInit) => {
      if (
        options.method === 'post' ||
        options.method === 'put' ||
        options.method === 'delete' ||
        options.method === 'get'
      ) {
        const headers: {
          'Content-Type'?: string;
          Accept?: string;
          Authorization?: string;
        } & HeadersInit = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          ...options.headers,
        };
        // 如果是开放api，则不需要携带Authorization
        if(options && options.openApi) {
          delete headers.Authorization;
        }
        // 上传文件的fetch请求header里面不能写Content-Type，需fetch自己适配，所以上传文件是将Content-Type设置为upload用以删除默认Content-Type;
        if (options && options.headers && options.headers['Content-Type'] === 'upload') {
          delete headers["Content-Type"];
        }
        return {
          url,
          options: { ...options, headers },
        };
      }
      return {
        url,
        options: { ...options },
      };
    },
  ],
  responseInterceptors: [],
};
