import {
  ProForm,
  ProFormDependency,
  ProFormInstance,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { Button, Col, message, Row, Space } from 'antd';
import React, { Dispatch, Key, MutableRefObject, SetStateAction } from 'react';
import { addMenu, MenuVO, updateMenu } from '../service';

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 14 },
};

interface MenuInfoProps {
  selectedNode: MenuVO;
  setSelectedNode: Dispatch<SetStateAction<MenuVO>>;
  treeData: any;
  initTreeData: (selectedKeys?: Key[]) => void;
  handleDelete: (id: number, title: string) => void;
  formRef: MutableRefObject<ProFormInstance>;
}

const MenuInfoContent: React.FC<MenuInfoProps> = (props) => {
  const { selectedNode, setSelectedNode, treeData, initTreeData, handleDelete, formRef } = props;

  return (
    <ProForm
      {...formItemLayout}
      layout="horizontal"
      formRef={formRef}
      onReset={() => formRef?.current?.setFieldsValue(selectedNode)}
      onFinish={async (values) => {
        if (values.id) {
          if (values.id === values.parentId) {
            message.error('上级菜单不能是其本身！');
            return;
          }
          updateMenu(values as MenuVO).then((res) => {
            if (res.ok) {
              message.success('修改成功！');
              setSelectedNode(values as MenuVO);
              initTreeData();
            } else {
              message.error(res.msg);
            }
          });
        } else {
          addMenu(values as MenuVO).then((res) => {
            if (res.ok) {
              message.success('创建成功！');
              initTreeData([res?.data?.id]);
              setSelectedNode(res.data);
              formRef?.current?.setFieldsValue(res.data);
            } else {
              message.error(res.msg);
            }
          });
        }
      }}
      submitter={{
        searchConfig: {
          submitText: formRef?.current?.getFieldValue('id') ? '保存' : '新增',
          resetText: '重置',
        },
        render: (props, doms) => (
          <Row>
            <Col span={14} offset={4}>
              <Space>
                {[
                  doms[1],
                  <Button
                    type="primary"
                    onClick={() => {
                      handleDelete(
                        formRef?.current?.getFieldValue('id'),
                        formRef?.current?.getFieldValue('menuName'),
                      );
                    }}
                    key="delete"
                    danger
                  >
                    删除
                  </Button>,
                  doms[0],
                ]}
              </Space>
            </Col>
          </Row>
        ),
      }}
    >
      <ProFormText label="菜单ID" name="id" readonly />
      <ProFormTreeSelect
        label="上级菜单"
        name="parentId"
        width="md"
        // @ts-ignore
        fieldProps={{ options: treeData, fieldNames: { value: 'key' } }}
        tooltip={{ title: '请右击左侧菜单树节点进行新增修改操作' }}
      />
      <ProFormSelect
        label="所属应用"
        name="appCode"
        width="md"
        placeholder="请选择所属应用"
        rules={[{ required: true, message: '请选择所属应用' }]}
        allowClear={false}
        options={[
          { value: 'portal', label: '统一门户中台' },
          { value: 'mdm', label: '主数据中台' },
          { value: 'codePlatform', label: '码中台' },
          { value: 'dms', label: '经销商综合服务平台' },
          { value: 'smp', label: '终端管理平台' },
          { value: 'sfa', label: '移动访销' },
        ]}
      />
      <ProFormText
        label="菜单编码"
        name="menuCode"
        width="md"
        placeholder="请输入菜单编码"
        rules={[{ required: true, message: '请输入菜单编码' }]}
      />
      <ProFormText
        label="菜单名称"
        name="menuName"
        width="md"
        placeholder="请输入菜单名称"
        rules={[{ required: true, message: '请输入菜单名称' }]}
      />
      <ProFormSwitch label="启停用" name="enabled" width="md" initialValue={true} />
      <ProFormText label="菜单排序" name="menuSort" width="md" hidden />
      <ProFormText label="菜单图标" name="icon" width="md" placeholder="请输入菜单图标" />
      <ProFormSelect
        label="菜单类型"
        name="menuType"
        width="md"
        placeholder="请选择菜单类型"
        tooltip={{ title: '目录不需要配置渲染类型和组件地址' }}
        options={[
          { value: 0, label: '目录' },
          { value: 1, label: '菜单' },
        ]}
      />
      <ProFormDependency name={['menuType']}>
        {({ menuType }) => {
          return (
            <>
              <ProFormSelect
                label="渲染类型"
                name="renderType"
                width="md"
                hidden={menuType === 0}
                initialValue={0}
                options={[
                  { value: 0, label: '组件渲染' },
                  { value: 1, label: 'iframe渲染' },
                ]}
              />
              <ProFormDependency name={['renderType']}>
                {({ renderType }) => {
                  return (
                    <>
                      <ProFormText
                        label={renderType === 0 ? '组件地址' : 'url地址'}
                        name="component"
                        width="xl"
                        hidden={menuType === 0}
                        placeholder="请输入组件地址"
                        tooltip={{
                          title:
                            '当渲染类型为组件渲染是，表示组件路径；当渲染类型为iframe渲染时，表示url',
                        }}
                      />
                    </>
                  );
                }}
              </ProFormDependency>
            </>
          );
        }}
      </ProFormDependency>
    </ProForm>
  );
};

export default MenuInfoContent;
