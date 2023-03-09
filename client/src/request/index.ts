import { instance } from './axios'
import apiList from './api'
import { DataIn } from 'assets/interface/data'


function request({ name, data: dataIn = {} } : {name: string, data?: DataIn}) {
    if(!apiList[name]) {
        throw new SyntaxError(`请在api文件注册路由:  ${name}`);
    }
    let { url, method = 'get', headers, originData } = apiList[name];
    let params = method === 'get' ? dataIn : null;
    let contentType = (headers && headers['Content-Type']) ? headers['Content-Type'] : '';
    let data: DataIn;
    let mergeData = dataIn;
    if(originData && method === 'post') {
        mergeData = Object.assign(originData, {
            data: dataIn
        })
    }
    if(method !== 'get') {
        switch (contentType) {
            case 'multipart/form-data':
                data = formDataFormat(mergeData);
                break;
            case 'application/x-www-form-urlencoded':
                data = stringify(mergeData)
                break;
            case 'application/json':
            default:
                data = mergeData;
                break;
        }
    }

    return new Promise((resolve, reject) => {
        instance({
            url,
            method,
            params,
            data,
            headers
        }).then((res: any) => {
            resolve(res)
        }).catch((err: any) => {
            reject(err)
        })
    })
}

//格式化表单类型
function stringify(data: any) {
    const params = new URLSearchParams();
    for(let key in data) {
        params.append(key, data[key]);
    }
    return params;
}

//格式化formData类型
function formDataFormat(data: any) {
    const formData = new FormData();
    for(let key in data) {
        formData.append(key, data[key]);
    }
    return formData;
}
export default request