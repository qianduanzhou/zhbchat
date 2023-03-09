import { configureStore } from '@reduxjs/toolkit';
import user from './user';//用户
import breadcrumb from './breadcrumb';//面包屑
import page from './page';//页面相关
import controlSet from './controlSet';//设置（表格字段显示及导出）


export default configureStore({//创建仓库
  reducer: {//模块化
    user,
    breadcrumb,
    page,
    controlSet
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
})