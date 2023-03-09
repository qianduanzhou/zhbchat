import { createSlice } from '@reduxjs/toolkit'

export const counterSlice = createSlice({
  name: 'user',
  initialState: {//state，通过reducer修改
    userInfo: null
  },
  reducers: {//reducer写在下面
    setUserInfo: (state, action) => {
      state.userInfo = action.payload
    },
  }
})

export const { setUserInfo } = counterSlice.actions//导出相关actions（counter/increment...）

export const selectUserInfo = (state: any) => state.user.userInfo//获取state对应的值

export default counterSlice.reducer