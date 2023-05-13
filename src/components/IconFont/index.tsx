import { useModel } from '@@/exports';
import { createFromIconfontCN } from '@ant-design/icons';
import { IconFontProps } from '@ant-design/icons/lib/components/IconFont';
import React from 'react';

const IconFont: React.FC<IconFontProps> = (props) => {
  const { initialState } = useModel('@@initialState');
  const settings = initialState?.settings;

  const IconFontDom = createFromIconfontCN({
    scriptUrl: ['//at.alicdn.com/t/font_2852613_51v19ezau6v.js', settings.iconfontUrl],
  });

  return <IconFontDom {...props} />;
};

export default IconFont;
