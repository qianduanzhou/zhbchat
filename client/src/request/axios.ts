import axios from 'axios';
import store from "store/index";
let { REACT_APP_NORMALURL: normalUrl, NODE_ENV } = process.env;
let baseURL = NODE_ENV === 'development' ? '/normalUrl' : String(normalUrl);
const instance = axios.create({
    baseURL,//基础url
    timeout: 30000,//请求超时时间
})

// request拦截器
instance.interceptors.request.use((config: any) => {
    //添加时间戳
    let { method } = config
    if (method === 'get') {
        config.params.timestamp = new Date().getTime();
    } else {
        config.data.timestamp = new Date().getTime();
    }
    return config
}, (err: any) => {
    Promise.reject(err)
})

// response 拦截器
instance.interceptors.response.use(
    (response: any) => {
        const res: any = response.data
        if (res.result === 'FAIL' && res.result_msg === '用户未登录，请登录') {
            window.location.href = '/login';
        }
        if (res.result === 'SUCCESS') {
            if(res.data !== undefined) {
                return res.data
            } else if(res.result_msg !== undefined) {
                return res.result_msg
            }
        } else {
            return Promise.reject(res)
        }
    },
    (error: any) => {
        console.log('err: ' + error) // for debug
        return Promise.reject(error)
    }
)

export { instance }