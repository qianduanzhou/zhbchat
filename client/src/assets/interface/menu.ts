import type { MenuProps } from 'antd';
export type MenuItem = Required<MenuProps>['items'][number];

export interface Common {
  label: string //名称
  key: string //路由路径
  fkey?: string //父路由路径
  id?: string | number//id
  fid?: string | number //父key
}


export interface MenuData extends Common {//菜单
  icon?: React.ReactNode //图标
  isRoute?: boolean//是否是路由
  children?: MenuData[] //子列表
}
export interface RoleData extends Common {//权限
  isCheck?: boolean//是否全选
  indeterminate?: boolean//是否半选
  children?: RoleData[] //子列表
}