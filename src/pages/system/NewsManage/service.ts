import { request } from '@umijs/max';

// 新闻
export interface News {
  // 主键
  id?: number;
  // 新闻标题
  newsTitle?: string;
  // 封面图
  coverImage?: string;
  // 作者
  author?: string;
  // 发表时间
  releaseTime?: Record<string, unknown>;
  // 新闻内容
  newsContent?: string;
  // 启停用
  enabled?: boolean;
  // 是否置顶
  topFlag?: boolean;
}

// 分页查询参数接口
export interface SelectPageParams extends API.PageParams {
  newsTitle?: string;
}

/**
 * 分页查询新闻列表
 * @param {object} params 分页查询新闻列表查询参数
 * @param {number} params.current 当前页码,默认为第1页
 * @param {number} params.pageSize 当前页条数,默认查询10条
 * @returns
 */
export async function selectPage(params: SelectPageParams) {
  return request<API.RestResult<API.Page<News>>>(`/api/portal/news/page`, {
    method: 'POST',
    data: params,
  });
}

/**
 * 新增新闻
 * @param {object} params News
 * @returns
 */
export async function createNews(params: News) {
  return request<API.RestResult<void>>(`/api/portal/news/create`, {
    method: 'POST',
    data: params,
  });
}

/**
 * 修改新闻
 * @param {object} params News
 * @returns
 */
export async function updateNews(params: News) {
  return request<API.RestResult<void>>(`/api/portal/news/update`, {
    method: 'PUT',
    data: params,
  });
}

/**
 * 启停用新闻
 * @param {string} id id
 * @returns
 */
export async function enableNews(id?: number) {
  return request<API.RestResult<void>>(`/api/portal/news/${id}`, {
    method: 'PUT',
  });
}

/**
 * 根据id查询新闻详情
 * @param {string} id id
 * @returns
 */
export async function getNews(id?: number) {
  return request<API.RestResult<News>>(`/api/portal/news/${id}`, {
    method: 'GET',
  });
}
