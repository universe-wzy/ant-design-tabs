import { request } from '@umijs/max';

// 首页背景图配置实体
export interface BackgroundConfig {
  id?: number;
  backgroundUrl?: string;
  backgroundTitle?: string;
  enabled?: boolean;
  darkTopic?: boolean;
  tenantCode?: string;
  modifyTime?: Record<string, unknown>;
}

/**
 * 查询首页背景图配置 分页
 * @param {object} params 查询参数
 * @returns
 */
export async function selectPage(params: API.PageParams) {
  return request<API.RestResult<API.Page<BackgroundConfig>>>(`/api/portal/backgroundConfig/page`, {
    method: 'POST',
    data: params,
  });
}

/**
 * 新增背景图配置
 * @param {object} params BackgroundConfig
 * @returns
 */
export async function createBackgroundConfig(params: BackgroundConfig) {
  return request<API.RestResult<BackgroundConfig>>(`/api/portal/backgroundConfig/`, {
    method: 'POST',
    data: params,
  });
}

/**
 * 修改背景图配置
 * @param {object} params BackgroundConfig
 * @returns
 */
export async function updateBackgroundConfig(params: BackgroundConfig) {
  return request<API.RestResult<BackgroundConfig>>(`/api/portal/backgroundConfig/`, {
    method: 'PUT',
    data: params,
  });
}

/**
 * 启用背景图配置
 * @param {string} id id
 * @returns
 */
export async function enableBackgroundConfig(id?: number) {
  return request<API.RestResult<void>>(`/api/portal/backgroundConfig/enable/${id}`, {
    method: 'POST',
  });
}
