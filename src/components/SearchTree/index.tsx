import IconFont from '@/components/IconFont';
import { Dropdown, Input, MenuProps, Tree, TreeProps } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { isEmpty } from 'lodash';
import React, { Dispatch, Key, SetStateAction, useState } from 'react';

const Search = Input.Search;

export interface SearchTreeProps extends TreeProps {
  setExpandedKeys: Dispatch<SetStateAction<Key[]>>;
  setAutoExpandParent?: Dispatch<SetStateAction<boolean>>;
  rightClickMenu?: (node: any) => MenuProps;
  notSelectedKeys?: Key[];
  notRightClickKeys: Key[];
}

const SearchTree: React.FC<SearchTreeProps> = (props) => {
  const {
    treeData,
    height,
    selectedKeys,
    expandedKeys,
    setExpandedKeys,
    autoExpandParent,
    setAutoExpandParent,
    rightClickMenu,
    notSelectedKeys,
    notRightClickKeys,
    draggable,
    onSelect,
    onDrop,
  } = props;

  const [searchValue, setSearchValue] = useState<string>('');

  // 递归查询需要展开的key
  const findMatchData = (treeData: any[], expandedKeys: Key[], keyword: string) => {
    if (keyword === undefined || isEmpty(keyword)) {
      return;
    }
    treeData.forEach((item) => {
      if (item.title.indexOf(keyword) > -1 && item.parentKey) {
        expandedKeys.push(item.parentKey);
      }
      if (item.children) {
        findMatchData(item.children, expandedKeys, keyword);
      }
    });
  };

  const handleOnSearch = (value: string) => {
    const expandedKeys: Key[] = [];
    findMatchData(treeData as any[], expandedKeys, value);
    setSearchValue(value);
    setExpandedKeys(expandedKeys);
    if (setAutoExpandParent) {
      setAutoExpandParent(true);
    }
  };

  const handleOnExpand = (expandedKeys: Key[]) => {
    setExpandedKeys(expandedKeys);
    if (setAutoExpandParent) {
      setAutoExpandParent(false);
    }
  };

  const loop = (data: any[] | undefined): DataNode[] => {
    if (data) {
      return data.map((item) => {
        const strTitle = item.title as string;
        const index = strTitle.indexOf(searchValue);
        const beforeStr = strTitle.substring(0, index);
        const afterStr = strTitle.slice(index + searchValue.length);
        const title =
          index > -1 ? (
            <span style={{ opacity: item.enabled ? 0.5 : 1 }}>
              {beforeStr}
              <span className="site-tree-search-value">{searchValue}</span>
              {afterStr}
            </span>
          ) : (
            <span style={{ opacity: item.enabled ? 0.5 : 1 }}>{strTitle}</span>
          );
        if (item.children) {
          return { title, key: item.key, children: loop(item.children) };
        }

        return {
          title,
          key: item.key,
          icon: item.icon && <IconFont type={item.icon} />,
          children: item.children ? loop(item.children) : [],
          parentKey: item.parentKey,
          sort: item.sort,
          enabled: item.enabled,
          selectable: notSelectedKeys && notSelectedKeys.indexOf(item.key) <= -1,
        };
      });
    } else {
      return [];
    }
  };

  return (
    <>
      <Search style={{ marginBottom: 24 }} onSearch={handleOnSearch} allowClear />
      <Tree
        onExpand={handleOnExpand}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        blockNode={true}
        showLine={{ showLeafIcon: false }}
        showIcon
        treeData={loop(treeData)}
        height={height}
        selectedKeys={selectedKeys}
        titleRender={(node: any) => {
          // @ts-ignore
          if (rightClickMenu === undefined || notRightClickKeys.indexOf(node.key) > -1) {
            return <>{node.title}</>;
          } else {
            return (
              <Dropdown menu={rightClickMenu(node)} trigger={['contextMenu']}>
                {node.title}
              </Dropdown>
            );
          }
        }}
        onSelect={onSelect}
        draggable={draggable}
        onDrop={onDrop}
      />
    </>
  );
};

export default SearchTree;
