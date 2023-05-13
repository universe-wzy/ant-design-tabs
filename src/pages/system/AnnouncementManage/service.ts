import { request } from '@umijs/max';

// 首页背景图配置实体
export interface Announcement {
  id: number;
  announcementTitle: string;
  author: string;
  content: string;
  enabled: boolean;
  creatorUuid: string;
  creator: string;
  createTime: Record<string, unknown>;
  modifierUuid: string;
  modifier: string;
  modifyTime: Record<string, unknown>;
}

export interface SelectPageParams extends API.PageParams {
  // 启停用
  enabled?: boolean;
}

/**
 * 查询公告 分页
 * @param {object} params 查询参数
 * @returns
 */
export async function selectPage(params: SelectPageParams) {
  return request<API.RestResult<API.Page<Announcement>>>(`/api/portal/announcement/page`, {
    method: 'POST',
    data: params,
  });
}

/**
 * 新增公告
 * @param {object} params BackgroundConfig
 * @returns
 */
export async function createAnnouncement(params: Announcement) {
  return request<API.RestResult<Announcement>>(`/api/portal/announcement/`, {
    method: 'POST',
    data: params,
  });
}

/**
 * 修改公告
 * @param {object} params BackgroundConfig
 * @returns
 */
export async function updateAnnouncement(params: Announcement) {
  return request<API.RestResult<Announcement>>(`/api/portal/announcement/`, {
    method: 'PUT',
    data: params,
  });
}

/**
 * 启用公告
 * @param {string} id id
 * @returns
 */
export async function enableAnnouncement(id?: number) {
  return request<API.RestResult<void>>(`/api/portal/announcement/enable/${id}`, {
    method: 'POST',
  });
}
/**
 * 停用公告
 * @param {string} id id
 * @returns
 */
export async function unableAnnouncement(id?: number) {
  return request<API.RestResult<void>>(`/api/portal/announcement/unable/${id}`, {
    method: 'POST',
  });
}
