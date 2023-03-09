import { createSlice } from '@reduxjs/toolkit'

export const counterSlice = createSlice({
  name: 'controlSet',
  initialState: {//state，通过reducer修改
    controlMaps: <any>{}
  },
  reducers: {//reducer写在下面
    setControlMaps: (state, action) => {
      state.controlMaps = action.payload
    },
    setControlMapsByKey: (state, action) => {
      state.controlMaps[action.payload.key] = action.payload.value;
      localStorage.setItem('controlMaps', JSON.stringify(state.controlMaps))
    }
  }
})

export const { setControlMaps, setControlMapsByKey } = counterSlice.actions//导出相关actions（counter/increment...）


export const selectControlMaps = (state: any) => state.controlSet.controlMaps//获取state对应的值

export default counterSlice.reducer