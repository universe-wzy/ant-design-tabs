import { handleProTableRes, handleRes, isEmpty } from '@/utils/utils';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ModalForm, ProFormText, ProTable } from '@ant-design/pro-components';
import { Button, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import {
  createWhitelist,
  deleteWhitelist,
  selectPage,
  updateWhitelist,
  Whitelist,
} from './service';

const WhitelistManage: React.FC<void> = () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [modalVisit, setModalVisit] = useState<boolean>(false);
  const columns: ProColumns<Whitelist>[] = [
    {
      dataIndex: 'index',
      valueType: 'index',
      title: '序号',
      width: 48,
    },
    {
      title: 'id',
      dataIndex: 'id',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: '白名单类型',
      dataIndex: 'type',
      hideInSearch: true,
    },
    {
      title: '白名单值',
      dataIndex: 'value',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text, record) => [
        <a
          key="editable"
          onClick={() => {
            formRef?.current?.setFieldsValue(record);
            setModalVisit(true);
          }}
        >
          编辑
        </a>,
        <Popconfirm
          key="delete"
          title="确认删除吗?"
          okText="是"
          cancelText="否"
          onConfirm={() =>
            deleteWhitelist(record.type, record.value).then(() => actionRef?.current?.reload())
          }
        >
          <a style={{ color: '#ff4949' }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <>
      <ProTable<Whitelist>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={(params) => selectPage(params).then((res) => handleProTableRes(res))}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        headerTitle="白名单配置"
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              formRef?.current?.resetFields();
              setModalVisit(true);
            }}
            type="primary"
          >
            新增白名单
          </Button>,
        ]}
      />
      <ModalForm<Whitelist>
        layout="horizontal"
        width={500}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        title={isEmpty(formRef?.current?.getFieldValue('id')) ? '新增白名单' : '编辑白名单'}
        open={modalVisit}
        onOpenChange={setModalVisit}
        modalProps={{
          destroyOnClose: true,
          forceRender: true,
        }}
        formRef={formRef}
        onFinish={(values) => {
          return isEmpty(values.id)
            ? createWhitelist(values).then((res) => handleRes(res, actionRef))
            : updateWhitelist(values).then((res) => handleRes(res, actionRef));
        }}
      >
        <ProFormText
          width="md"
          name="type"
          label="白名单类型"
          placeholder="请输入白名单类型"
          rules={[{ required: true, message: '白名单类型必填' }]}
        />
        <ProFormText
          width="md"
          name="value"
          label="白名单值"
          placeholder="请输入白名单值"
          rules={[{ required: true, message: '白名单值必填' }]}
        />
        <ProFormText width="md" name="remark" label="备注" placeholder="请输入备注" />
        <ProFormText hidden name="id" label="id" />
      </ModalForm>
    </>
  );
};

export default WhitelistManage;
