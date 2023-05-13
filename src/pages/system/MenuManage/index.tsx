import SearchTree from '@/components/SearchTree';
import MenuInfo from '@/pages/system/MenuManage/components/MenuInfo';
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  InsuranceOutlined,
  SisternodeOutlined,
  SubnodeOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { ProCard, ProFormInstance } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Input, MenuProps, message, Modal, Tabs } from 'antd';
import { isEmpty, isNull, isUndefined } from 'lodash';
import React, { Key, useEffect, useRef, useState } from 'react';
import { delMenu, dndMenu, getMenu, getMenuTree } from './service';

const { confirm } = Modal;

const MenuManage: React.FC<void> = () => {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>({});
  const [activeKey, setActiveKey] = useState<string>('info');

  const formRef = useRef<ProFormInstance>();

  const { initialState } = useModel('@@initialState');
  const settings = initialState?.settings;

  // 初始化树结构数据
  const initTreeData = (selectedKeys?: Key[]) => {
    getMenuTree().then((res) => {
      if (res.ok) {
        setTreeData(res.data as any);
        if (selectedKeys !== undefined && !isEmpty(selectedKeys)) {
          setSelectedKeys(selectedKeys);
          expandedKeys.push(...selectedKeys);
          setExpandedKeys(selectedKeys);
          setAutoExpandParent(true);
        }
      } else {
        message.error(res.msg);
      }
    });
  };

  useEffect(() => {
    initTreeData();
  }, []);

  // 删除菜单
  const handleDelete = (id: number, title: string) => {
    if (isNull(id) || isUndefined(id)) {
      message.info('请先选择一个要删除的目录或菜单');
    } else {
      confirm({
        title: (
          <>
            你确定要删除 <span style={{ color: settings.colorPrimary }}>{title}</span> 吗？
          </>
        ),
        icon: <ExclamationCircleOutlined />,
        onOk() {
          if (selectedNode.id === id) {
            formRef?.current?.resetFields();
          }
          delMenu(id).then((res) => {
            if (res.ok) {
              message.success('删除成功！');
              setSelectedNode({});
              initTreeData();
            } else {
              message.error(res.msg);
            }
          });
        },
      });
    }
  };

  // 树节点右击下拉菜单
  const treeRightClickMenu: (node: any) => MenuProps = (node: any): MenuProps => {
    const handleAddClick = (initFields: any) => {
      setActiveKey('info');
      formRef?.current?.resetFields();
      formRef?.current?.setFieldsValue(initFields);
      setSelectedKeys([]);
      setSelectedNode(initFields);
    };

    return {
      items: [
        {
          key: 'title',
          label: <div style={{ textAlign: 'center' }}>{node.title}</div>,
        },
        { type: 'divider' },
        {
          key: 'addBrother',
          icon: <SisternodeOutlined />,
          label: '新增同级菜单',
          onClick: ({ domEvent }) => {
            domEvent.stopPropagation();
            handleAddClick({ parentId: node.parentKey, menuSort: node.sort + 1 });
          },
        },
        {
          key: 'addSub',
          icon: <SubnodeOutlined />,
          label: '新增子级菜单',
          onClick: ({ domEvent }) => {
            domEvent.stopPropagation();
            handleAddClick({ parentId: node.key });
          },
        },
        {
          key: 'del',
          icon: <DeleteOutlined />,
          label: '删除',
          danger: true,
          onClick: ({ domEvent }) => {
            domEvent.stopPropagation();
            handleDelete(node.key, node.title.props.children[2]);
          },
        },
      ],
    };
  };

  const menuDetailsTitle = (
    <span>
      菜单详情
      {selectedNode.id && (
        <span style={{ color: settings.colorPrimary }}>{` : ${selectedNode.menuName}`}</span>
      )}
    </span>
  );

  const menuTabItems = [
    {
      key: 'info',
      label: (
        <span>
          <InfoCircleOutlined />
          基本信息
        </span>
      ),
      children: (
        <MenuInfo
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          treeData={treeData}
          initTreeData={initTreeData}
          handleDelete={handleDelete}
          formRef={formRef}
        />
      ),
    },
    {
      key: 'buttons',
      label: (
        <span>
          <ToolOutlined />
          菜单按钮
        </span>
      ),
      children: <Input></Input>,
    },
    {
      key: 'auth',
      label: (
        <span>
          <InsuranceOutlined />
          权限配置
        </span>
      ),
      children: <Input></Input>,
    },
  ];

  return (
    <ProCard split="vertical">
      <ProCard title="菜单树" tooltip="可右击菜单节点进行相关操作" colSpan="22%">
        <SearchTree
          height={document.body.clientHeight - 311}
          treeData={treeData}
          selectedKeys={selectedKeys}
          expandedKeys={expandedKeys}
          setExpandedKeys={setExpandedKeys}
          autoExpandParent={autoExpandParent}
          setAutoExpandParent={setAutoExpandParent}
          rightClickMenu={treeRightClickMenu}
          notSelectedKeys={[]}
          notRightClickKeys={[]}
          onSelect={(selectedKeys, e) => {
            setSelectedKeys(selectedKeys);
            if (selectedKeys.length === 0) {
              formRef?.current?.resetFields();
              setSelectedNode({});
              return;
            }
            getMenu(e?.node?.key as number).then((res) => {
              if (res.ok) {
                formRef?.current?.setFieldsValue(res.data);
                setSelectedNode(res.data);
              } else {
                message.error(res.msg);
              }
            });
          }}
          draggable
          onDrop={(info: any) => {
            const dropPos = info.node.pos.split('-');
            const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
            dndMenu({
              dragKey: info.dragNode.key,
              dropKey: dropPosition === 1 ? info.node.key : null,
              parentKey:
                dropPosition === 1
                  ? info.node.parentKey
                  : dropPosition === 0
                  ? info.node.key
                  : null,
            }).then((res) => res.ok && initTreeData());
          }}
        />
      </ProCard>
      <ProCard title={menuDetailsTitle} headerBordered>
        <Tabs
          activeKey={activeKey}
          items={menuTabItems}
          onChange={(activeKey) => setActiveKey(activeKey)}
        />
      </ProCard>
    </ProCard>
  );
};

export default MenuManage;
