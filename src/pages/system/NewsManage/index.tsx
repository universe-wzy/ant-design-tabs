import RichText from '@/components/RichText';
import UploadImage from '@/components/UploadImage';
import { handleProTableRes, handleRes, isEmpty } from '@/utils/utils';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import {
  DrawerForm,
  ProFormDateTimePicker,
  ProFormSwitch,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Form, Image, Switch } from 'antd';
import React, { useRef, useState } from 'react';
import { createNews, enableNews, getNews, News, selectPage, updateNews } from './service';

const NewsManage: React.FC<void> = () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [modalVisit, setModalVisit] = useState<boolean>(false);
  const columns: ProColumns<News>[] = [
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
      title: '新闻标题',
      dataIndex: 'newsTitle',
      hideInSearch: true,
    },
    {
      title: '封面图',
      dataIndex: 'coverImage',
      render: (text) => <Image src={text?.toString()} width={100} />,
      hideInSearch: true,
    },
    {
      title: '作者',
      dataIndex: 'author',
      hideInSearch: true,
    },
    {
      title: '发表时间',
      dataIndex: 'releaseTime',
      hideInSearch: true,
    },
    {
      title: '启停用',
      dataIndex: 'enabled',
      hideInSearch: true,
      render: (text, record) => {
        return (
          <Switch
            checked={record.enabled}
            onChange={() => {
              enableNews(record.id).then(() => actionRef?.current?.reload());
            }}
          />
        );
      },
    },
    {
      title: '是否置顶',
      dataIndex: 'topFlag',
      hideInSearch: true,
      render: (text, record) => {
        return (
          <Switch
            checked={record.topFlag}
            onChange={(checked) => {
              record.topFlag = checked;
              updateNews(record).then(() => actionRef?.current?.reload());
            }}
          />
        );
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text, record) => [
        <a
          key="editable"
          onClick={() => {
            getNews(record.id).then((res) => formRef?.current?.setFieldsValue(res.data));
            setModalVisit(true);
          }}
        >
          编辑
        </a>,
      ],
    },
  ];

  return (
    <>
      <ProTable<News>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={(params) => selectPage(params).then((res) => handleProTableRes(res))}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        headerTitle="新闻管理"
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
            新增新闻
          </Button>,
        ]}
      />
      <DrawerForm<News>
        layout="horizontal"
        width={1000}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        title={isEmpty(formRef?.current?.getFieldValue('id')) ? '新增新闻' : '编辑新闻'}
        open={modalVisit}
        onOpenChange={setModalVisit}
        drawerProps={{
          destroyOnClose: true,
          forceRender: true,
        }}
        formRef={formRef}
        onFinish={(values) => {
          return isEmpty(values.id)
            ? createNews(values).then((res) => handleRes(res, actionRef))
            : updateNews(values).then((res) => handleRes(res, actionRef));
        }}
      >
        <ProFormText
          width="md"
          name="newsTitle"
          label="新闻标题"
          placeholder="请输入新闻标题"
          rules={[{ required: true, message: '新闻标题必填' }]}
        />
        <Form.Item
          rules={[{ required: true, message: '请上传封面图' }]}
          name="coverImage"
          label="封面图"
        >
          <UploadImage />
        </Form.Item>
        <ProFormText
          width="md"
          name="author"
          label="作者"
          placeholder="请输入作者"
          rules={[{ required: true, message: '作者必填' }]}
        />
        <ProFormDateTimePicker
          width="md"
          name="releaseTime"
          label="发表时间"
          placeholder="请输入发表时间"
          rules={[{ required: true, message: '发表时间必填' }]}
        />
        <ProFormSwitch width="md" name="enabled" label="启用状态" initialValue={true} />
        <ProFormSwitch width="md" name="topFlag" label="是否置顶" initialValue={false} />
        <Form.Item name="newsContent" label="新闻内容">
          <RichText />
        </Form.Item>
        <ProFormText hidden name="id" label="id" />
      </DrawerForm>
    </>
  );
};

export default NewsManage;
