import React from 'react';
import type { TabContentProps } from '@/layouts/Content';

export type WindowLayoutProps = {

} & TabContentProps;

const WindowLayout: React.FC<WindowLayoutProps> = props => {

  window.onbeforeunload = () => {
    console.log(props);
  }

  return <></>;
}

export default WindowLayout;
