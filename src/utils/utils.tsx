import { dynamic } from 'umi';
import IframeWrapper from '@/components/IframeWrapper';
import LoadingComponent from '@ant-design/pro-layout';

/**
 * 根据渲染类型和组件字符串描述，生成对应的组件对象
 * @param renderType 渲染类型 0：组件渲染， 1：iframe渲染
 * @param componentStr 组件名称，对应组件目录
 * @returns {React.NamedExoticComponent<object>|React.ComponentClass<{}, any>|*}
 */
export const renderComponent = (renderType: number | undefined, componentStr: string | undefined) => {
  if (renderType === 1) {
    return IframeWrapper;
  }
  return dynamic({
    loader: async function () {
      // 因为动态引入组件 需要 webpack 打包，引入时需要具体到目录文件所以
      // @/pages/dynamicPages硬编码  约定组件文件都放在 @/pages/dynamicPages下
      const {default: Page} = await import(`@/pages/dynamicPages/${componentStr}`);
      return (props: any) => <Page {...props} />;
    },
    loading: LoadingComponent,
  });
};
