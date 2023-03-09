import { createSlice } from '@reduxjs/toolkit'

export const counterSlice = createSlice({
  name: 'breadcrumb',
  initialState: {//state，通过reducer修改
    breadcrumbList: <any>[]
  },
  reducers: {//reducer写在下面
    setBreadcrumbList: (state, action) => {//设置面包屑
      state.breadcrumbList = action.payload
    },
    popBreadcrumbList: state => {
      state.breadcrumbList.pop();
    }
  }
})

export const { setBreadcrumbList, popBreadcrumbList } = counterSlice.actions//导出相关actions（counter/increment...）

export const selectBreadcrumbList = (state: any) => state.breadcrumb.breadcrumbList//获取state对应的值

export default counterSlice.reducer