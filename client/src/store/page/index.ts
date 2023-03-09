import { createSlice } from '@reduxjs/toolkit'

export const counterSlice = createSlice({
  name: 'page',
  initialState: {//state，通过reducer修改
    pageParams: {
      pager: null,
      searchForm: null,
      isBack: false
    }
  },
  reducers: {//reducer写在下面
    setPageParams: (state, action) => {//设置页面参数
      state.pageParams = action.payload
    },
  }
})

export const { setPageParams } = counterSlice.actions//导出相关actions（counter/increment...）

export const selectPageParams = (state: any) => state.page.pageParams//获取state对应的值

export default counterSlice.reducer