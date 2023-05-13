// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/api/currentUser', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取当前的用户 GET /api/fetchRoutes */
export async function fetchRoutes() {
  return request<{
    code: string;
    message: string;
    data: any;
  }>('/api/routes', {
    method: 'GET',
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login/login */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/api/login/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 新建规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'PUT',
    ...(options || {}),
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'DELETE',
    ...(options || {}),
  });
}

export type FileRes = {
  code: string;
  msg: string;
  url: string;
  fileName: string;
  requestId: string;
  securityToken: string;
  accessKeySecret: string;
  accessKeyId: string;
  bucketName: string;
  fileDir: string;
};

/**
 * 按模块上传附件
 * @param {string} moduleEnum 可用值:PORTAL,MDM,BUDGET,TPM,DMS,SFA,WORKFLOW,CODE,SMP,MEMBER,VIDEO,IO
 * @param {string} folder 文件夹
 * @param {string} params formData对象
 * @returns
 */
export async function moduleUpload(moduleEnum: string, folder: string, params: object) {
  return request<API.RestResult<FileRes>>(
    `/api/file/upload/oss/module?moduleEnum=${moduleEnum}&folder=${folder}`,
    {
      method: 'POST',
      data: params,
    },
  );
}

/**
 * 删除文件
 * @param {string} moduleEnum 可用值:PORTAL,MDM,BUDGET,TPM,DMS,SFA,WORKFLOW,CODE,SMP,MEMBER,VIDEO,IO
 * @param {string} fileUrls
 * @returns
 */
export async function deleteFile(moduleEnum: string, fileUrls: string) {
  return request<API.RestResult<void>>(
    `/api/file/upload/oss/delete?moduleEnum=${moduleEnum}&fileUrls=${fileUrls}`,
    {
      method: 'POST',
    },
  );
}
