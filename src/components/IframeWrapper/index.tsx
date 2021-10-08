import React from 'react';
import './style.less';
import { IFRAME_COMPONENT_NAME } from '@/constants';

export type IframeWrapperProps = {
  id?: string;
  path?: string;
};

/**
 * iframe页面统一渲染组件
 * @type {React.NamedExoticComponent<object>}
 */
const IframeWrapper: React.FC<IframeWrapperProps> = React.memo(props => {
  const {
    id = 'id',
    path = 'https://www.163.com',
  } = props;
  return (
    <iframe
      id={id}
      className='iframe-content'
      src={path}
      frameBorder='0'
      title={path}
    />
  );
});

IframeWrapper.displayName = IFRAME_COMPONENT_NAME;
export default IframeWrapper;
