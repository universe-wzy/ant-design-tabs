import { Routes } from '@/services/api';
import { request } from '@umijs/max';

export interface MenuVO {
  id: number;
}

export interface DndParams<T> {
  dragKey?: T;
  dropKey?: T;
  parentKey?: T;
}

/** 获得菜单树 */
export async function getMenuTree() {
  return request<API.RestResult<Routes>>('/api/portal/menu/tree');
}

/** 查询菜单详情 */
export async function getMenu(id: number) {
  return request<API.RestResult<MenuVO>>(`/api/portal/menu/${id}`);
}

/** 新增菜单 */
export async function addMenu(values: MenuVO) {
  return request<API.RestResult<MenuVO>>('/api/portal/menu/', {
    method: 'POST',
    data: values,
  });
}

/** 修改菜单 */
export async function updateMenu(values: MenuVO) {
  return request<API.RestResult<void>>('/api/portal/menu/', {
    method: 'PUT',
    data: values,
  });
}

/** 删除菜单 */
export async function delMenu(id: number) {
  return request<API.RestResult<void>>(`/api/portal/menu/${id}`, {
    method: 'DELETE',
  });
}

/** 菜单拖拽 */
export async function dndMenu(dndParams: DndParams<number>) {
  return request<API.RestResult<void>>('/api/portal/menu/dnd', {
    method: 'PUT',
    data: dndParams,
  });
}
