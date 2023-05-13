import RichText from '@/components/RichText';
import { handleProTableRes, handleRes, isEmpty } from '@/utils/utils';
import { PlusOutlined } from '@ant-design/icons';
import {
  ActionType,
  DrawerForm,
  ProColumns,
  ProFormInstance,
  ProFormSwitch,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Form, Switch } from 'antd';
import React, { useRef, useState } from 'react';
import {
  Announcement,
  createAnnouncement,
  enableAnnouncement,
  selectPage,
  unableAnnouncement,
  updateAnnouncement,
} from './service';

const AnnouncementManage: React.FC<void> = () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [drawerVisit, setDrawerVisit] = useState<boolean>(false);
  const columns: ProColumns<Announcement>[] = [
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
      title: '公告标题',
      dataIndex: 'announcementTitle',
    },
    {
      title: '作者',
      dataIndex: 'author',
      hideInSearch: true,
    },
    {
      title: '启停用',
      dataIndex: 'enabled',
      valueEnum: {
        true: { text: '启用', status: 'success' },
        false: { text: '停用', status: 'Error' },
      },
      render: (text, record) => {
        return (
          <Switch
            checked={record.enabled}
            onChange={(checked) => {
              if (checked) {
                enableAnnouncement(record.id).then(() => actionRef?.current?.reload());
              } else {
                unableAnnouncement(record.id).then(() => actionRef?.current?.reload());
              }
            }}
          />
        );
      },
    },
    {
      title: '修改时间',
      dataIndex: 'modifyTime',
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
            setDrawerVisit(true);
          }}
        >
          编辑
        </a>,
      ],
    },
  ];

  return (
    <>
      <ProTable<Announcement>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={(params) => selectPage(params).then((res) => handleProTableRes(res))}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        headerTitle="公告管理"
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              formRef?.current?.resetFields();
              setDrawerVisit(true);
            }}
            type="primary"
          >
            新增公告
          </Button>,
        ]}
      />
      <DrawerForm<Announcement>
        layout="horizontal"
        width={1000}
        labelCol={{ span: 2 }}
        wrapperCol={{ span: 22 }}
        title={isEmpty(formRef?.current?.getFieldValue('id')) ? '新增公告' : '编辑公告'}
        open={drawerVisit}
        onOpenChange={setDrawerVisit}
        drawerProps={{
          destroyOnClose: true,
          forceRender: true,
        }}
        formRef={formRef}
        onFinish={(values) => {
          return isEmpty(values.id)
            ? createAnnouncement(values).then((res) => handleRes(res, actionRef))
            : updateAnnouncement(values).then((res) => handleRes(res, actionRef));
        }}
      >
        <ProFormText
          width="md"
          name="announcementTitle"
          label="公告标题"
          placeholder="请输入公告标题"
          rules={[{ required: true, message: '公告标题必填' }]}
        />
        <ProFormText
          width="md"
          name="author"
          label="作者"
          placeholder="请输入作者"
          rules={[{ required: true, message: '作者必填' }]}
        />
        <Form.Item
          name="content"
          label="公告内容"
          rules={[{ required: true, message: '公告内容必填' }]}
        >
          <RichText placeholder="请输入公告内容" />
        </Form.Item>
        <ProFormSwitch width="md" name="enabled" label="启用状态" initialValue={true} />
        <ProFormText hidden name="id" label="id" />
      </DrawerForm>
    </>
  );
};

export default AnnouncementManage;
