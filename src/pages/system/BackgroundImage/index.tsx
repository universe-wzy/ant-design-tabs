import UploadImage from '@/components/UploadImage';
import { handleProTableRes, handleRes, isEmpty } from '@/utils/utils';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ModalForm, ProFormSwitch, ProFormText, ProTable } from '@ant-design/pro-components';
import { Button, Form, Image, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import {
  BackgroundConfig,
  createBackgroundConfig,
  enableBackgroundConfig,
  selectPage,
  updateBackgroundConfig,
} from './service';

const BackgroundImage: React.FC<void> = () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [modalVisit, setModalVisit] = useState<boolean>(false);
  const columns: ProColumns<BackgroundConfig>[] = [
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
      title: '背景图标题',
      dataIndex: 'backgroundTitle',
    },
    {
      title: '背景图',
      dataIndex: 'backgroundUrl',
      render: (text) => <Image src={text?.toString()} width={100} />,
      hideInSearch: true,
    },
    {
      title: '启停用',
      dataIndex: 'enabled',
      hideInSearch: true,
      valueEnum: {
        true: { text: '启用', status: 'success' },
        false: { text: '停用', status: 'Error' },
      },
    },
    {
      title: '主题模式',
      dataIndex: 'darkTopic',
      hideInSearch: true,
      valueEnum: {
        true: { text: '深色' },
        false: { text: '亮色' },
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
            setModalVisit(true);
          }}
        >
          编辑
        </a>,
        !record.enabled ? (
          <Popconfirm
            key="enable"
            title="确认启用吗?"
            okText="是"
            cancelText="否"
            onConfirm={() =>
              enableBackgroundConfig(record.id).then(() => actionRef?.current?.reload())
            }
          >
            <a>启用</a>
          </Popconfirm>
        ) : (
          ''
        ),
      ],
    },
  ];

  return (
    <>
      <ProTable<BackgroundConfig>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={(params) => selectPage(params).then((res) => handleProTableRes(res))}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        headerTitle="首页背景图配置"
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
            新增首页背景图
          </Button>,
        ]}
      />
      <ModalForm<BackgroundConfig>
        layout="horizontal"
        width={600}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        title={isEmpty(formRef?.current?.getFieldValue('id')) ? '新增首页背景图' : '编辑首页背景图'}
        open={modalVisit}
        onOpenChange={setModalVisit}
        modalProps={{
          destroyOnClose: true,
          forceRender: true,
        }}
        formRef={formRef}
        onFinish={(values) => {
          return isEmpty(values.id)
            ? createBackgroundConfig(values).then((res) => handleRes(res, actionRef))
            : updateBackgroundConfig(values).then((res) => handleRes(res, actionRef));
        }}
      >
        <ProFormText
          width="md"
          name="backgroundTitle"
          label="背景图标题"
          placeholder="请输入背景图标题"
          rules={[{ required: true, message: '背景图标题必填' }]}
        />
        <Form.Item
          rules={[{ required: true, message: '请上传背景图' }]}
          name="backgroundUrl"
          label="背景图"
          tooltip="背景图推荐大小（2880*1232），大小不能超过1M"
        >
          <UploadImage />
        </Form.Item>
        <ProFormSwitch width="md" name="enabled" label="启用状态" initialValue={true} />
        <ProFormSwitch width="md" name="darkTopic" label="是否深色主题" initialValue={false} />
        <ProFormText hidden name="id" label="id" />
      </ModalForm>
    </>
  );
};

export default BackgroundImage;
