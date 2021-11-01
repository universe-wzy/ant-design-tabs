import React, {useEffect, useState, useMemo, useRef} from 'react';
import type {MenuProps} from 'antd';
import {Menu} from 'antd';
import classNames from 'classnames';

import {getMatchMenu} from '@umijs/route-utils';
import {isUrl, isImg, useMountMergeState} from '@ant-design/pro-utils';
import Icon, {createFromIconfontCN} from '@ant-design/icons';
import defaultSettings from '../../../config/defaultSettings';
import type {TabContentProps} from '@/layouts/Content';
import type {MenuDataItem, MessageDescriptor, Route, RouterTypes, WithFalse} from '@/layouts/typings';
import type {PureSettings} from '@ant-design/pro-layout/lib/defaultSettings';

const {SubMenu, ItemGroup} = Menu;

export type BaseMenuProps = {
  collapsed?: boolean;
  openKeys?: WithFalse<string[]> | undefined;
  iconPrefixes?: string;
  menuData: MenuDataItem[];
  formatMessage?: (message: MessageDescriptor) => string;
} & Partial<RouterTypes<Route>> &
  Omit<MenuProps, 'openKeys' | 'onOpenChange' | 'title'> &
  Partial<PureSettings> &
  TabContentProps;

const IconFont = createFromIconfontCN({
  scriptUrl: defaultSettings.iconfontUrl,
});

// Allow menu.js config icon as string or ReactNode
//   icon: 'setting',
//   icon: 'icon-setting' #For Iconfont ,
//   icon: 'http://demo.com/icon.png',
//   icon: '/favicon.png',
//   icon: <Icon type="setting" />,
const getIcon = (
  icon?: string | React.ReactNode,
  iconPrefixes: string = 'icon-',
): React.ReactNode => {
  if (typeof icon === 'string' && icon !== '') {
    if (isUrl(icon) || isImg(icon)) {
      return (
        <Icon component={() => <img src={icon} alt="icon" className="ant-pro-sider-menu-icon" />} />
      );
    }
    if (icon.startsWith(iconPrefixes)) {
      return <IconFont type={icon} />;
    }
  }
  return icon;
};

class MenuUtil {
  constructor(props: BaseMenuProps) {
    this.props = props;
  }

  props: BaseMenuProps;

  getNavMenuItems = (menusData: MenuDataItem[] = [], isChildren: boolean): React.ReactNode[] =>
    menusData.map((item) => this.getSubMenuOrItem(item, isChildren)).filter((item) => item);

  /** Get SubMenu or Item */
  getSubMenuOrItem = (item: MenuDataItem, isChildren: boolean): React.ReactNode => {
    if (Array.isArray(item.children) && item && item.children.length > 0) {
      const name = this.getIntlName(item);
      const { prefixCls, menu, iconPrefixes } = this.props;
      const title = item.icon ? (
        <span className={`${prefixCls}-menu-item`} title={name}>
          {!isChildren && getIcon(item.icon, iconPrefixes)}
          <span className={`${prefixCls}-menu-item-title`}>{name}</span>
        </span>
      ) : (
        <span className={`${prefixCls}-menu-item`} title={name}>
          {name}
        </span>
      );
      const MenuComponents: React.ElementType = menu?.type === 'group' ? ItemGroup : SubMenu;
      return (
        <MenuComponents title={title} key={item.key || item.path} >
          {this.getNavMenuItems(item.children, true)}
        </MenuComponents>
      );
    }

    return (
      <Menu.Item disabled={item.disabled} key={item.key || item.path} onClick={() => this.handleMenuClick(item)}>
        {this.getIntlName(item)}
      </Menu.Item>
    );
  };

  getIntlName = (item: MenuDataItem) => {
    const { name, locale } = item;
    const { menu, formatMessage } = this.props;
    if (locale && menu?.locale !== false) {
      return formatMessage?.({
        id: locale,
        defaultMessage: name,
      });
    }
    return name;
  };

  handleMenuClick = (item: MenuDataItem) => {
    const {
      tabPaneList,
      setTabPaneList,
      setActiveKey,
    } = this.props;
    const {path, renderType, component, componentStr, targetUrl} = item;
    if (tabPaneList.filter((tabPane) => tabPane.key === path).length === 0) {
      const tabPane = {
        tab: this.getIntlName(item),
        key: path,
        closable: true,
        content: component,
        renderType,
        componentStr,
        targetUrl,
      };
      setTabPaneList([...tabPaneList, tabPane]);
    }
    setActiveKey(path);
  };
}

/**
 * 生成openKeys 的对象，因为设置了openKeys 就会变成受控，所以需要一个空对象
 *
 * @param openKeys
 * @param BaseMenuProps
 */
const getOpenKeysProps = (
  openKeys: React.ReactText[] | false,
  { layout, collapsed }: BaseMenuProps,
): {
  openKeys?: undefined | string[];
} => {
  let openKeysProps = {};
  if (openKeys && !collapsed && ['side', 'mix'].includes(layout || 'mix')) {
    openKeysProps = {
      openKeys,
    };
  }
  return openKeysProps;
};

const BaseMenu: React.FC<BaseMenuProps> = props => {
  const {
    theme,
    mode,
    className,
    style,
    menuData,
    menu,
    collapsed,
    selectedKeys: propsSelectedKeys,
    onSelect,
    openKeys: propsOpenKeys,
    location,
  } = props;

  // 用于减少 defaultOpenKeys 计算的组件
  const defaultOpenKeysRef = useRef<string[]>([]);

  const [openKeys, setOpenKeys] = useMountMergeState<WithFalse<React.Key[]>>(
    () => {
      if (propsOpenKeys === false) {
        return false;
      }
      return [];
    },
    {
      value: propsOpenKeys === false ? undefined : propsOpenKeys,
    },
  );

  const matchMenus = useMemo(() => {
    return getMatchMenu(location?.pathname || '/', menuData || [], true);
  }, [location?.pathname, menuData]);

  const matchMenuKeys = useMemo(
    () => Array.from(new Set(matchMenus.map((item) => item.key || item.path || ''))),
    [matchMenus],
  );

  const [selectedKeys, setSelectedKeys] = useMountMergeState<string[] | undefined>([], {
    value: propsSelectedKeys,
    onChange: onSelect
      ? (keys) => {
        if (onSelect && keys) {
          onSelect(keys as any);
        }
      }
      : undefined,
  });

  useEffect(() => {
    if (matchMenuKeys) {
      setOpenKeys(matchMenuKeys);
      setSelectedKeys(matchMenuKeys);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchMenuKeys.join('-')]);

  useEffect(() => {
    // if pathname can't match, use the nearest parent's key
    if (matchMenuKeys.join('-') !== (selectedKeys || []).join('-')) {
      setSelectedKeys(matchMenuKeys);
    }
    if (
      propsOpenKeys !== false &&
      matchMenuKeys.join('-') !== (openKeys || []).join('-')
    ) {
      let newKeys: React.Key[] = matchMenuKeys;
      // 如果不自动关闭，我需要把 openKeys 放进去
      if (menu?.autoClose === false) {
        newKeys = Array.from(new Set([...matchMenuKeys, ...(openKeys || [])]));
      }
      setOpenKeys(newKeys);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchMenuKeys.join('-'), collapsed]);

  const openKeysProps = useMemo(
    () => getOpenKeysProps(openKeys, props),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openKeys && openKeys.join(','), props.layout, props.collapsed],
  );

  const [menuUtils] = useState(() => new MenuUtil(props));

  const cls = classNames(className, {
    'top-nav-menu': mode === 'horizontal',
  });

  // sync props
  menuUtils.props = props;

  // 这次 openKeys === false 的时候的情况，这种情况下帮用户选中一次
  // 第二次不会使用，所以用了 defaultOpenKeys
  // 这里返回 null，是为了让 defaultOpenKeys 生效
  if (props.openKeys === false) {
    defaultOpenKeysRef.current = matchMenuKeys;
  }

  return (
    <Menu
      {...openKeysProps}
      key='Menu'
      mode={mode}
      inlineIndent={16}
      defaultOpenKeys={defaultOpenKeysRef.current}
      theme={theme}
      selectedKeys={selectedKeys}
      style={style}
      className={cls}
      onOpenChange={setOpenKeys}
    >
      {menuUtils.getNavMenuItems(menuData, false)}
    </Menu>
  );
};

export default BaseMenu;
