import { request } from '@umijs/max';

// 白名单
export interface Whitelist {
  // 主键
  id?: number;
  // 白名单类型
  type?: string;
  // 白名单值
  value?: string;
  // 备注
  remark?: string;
}

// 分页查询参数接口
export interface SelectPageParams extends API.PageParams {
  // 白名单值
  value?: string;
}

/**
 * 查询白名单配置 分页
 * @param {object} params 白名单表显示层查询参数
 * @param {number} params.current 当前页码,默认为第1页
 * @param {number} params.pageSize 当前页条数,默认查询10条
 * @param {string} params.value 白名单值
 * @returns
 */
export async function selectPage(params: SelectPageParams) {
  return request<API.RestResult<API.Page<Whitelist>>>(`/api/auth/whitelist/page`, {
    method: 'POST',
    data: params,
  });
}

/**
 * 新增白名单
 * @param {object} params Whitelist
 * @param {number} params.id
 * @param {string} params.type
 * @param {string} params.value
 * @param {string} params.remark
 * @returns
 */
export async function createWhitelist(params: Whitelist) {
  return request<API.RestResult<void>>(`/api/auth/whitelist`, {
    method: 'POST',
    data: params,
  });
}

/**
 * 修改白名单配置
 * @param {object} params Whitelist
 * @param {number} params.id
 * @param {string} params.type
 * @param {string} params.value
 * @param {string} params.remark
 * @returns
 */
export async function updateWhitelist(params: Whitelist) {
  return request<API.RestResult<void>>(`/api/auth/whitelist/update`, {
    method: 'PUT',
    data: params,
  });
}

/**
 * 删除白名单配置 物理删除
 * @param {string} type
 * @param {string} value
 * @returns
 */
export async function deleteWhitelist(type: string | undefined, value: string | undefined) {
  return request<API.RestResult<void>>(`/api/auth/whitelist/delete?type=${type}&value=${value}`, {
    method: 'DELETE',
  });
}
