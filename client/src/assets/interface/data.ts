export interface DataIn {
  [propName: string]: any
}
export interface ApiList {
  [propName: string]: {
      url: string //请求url
      method ?: string //请求方法 get post
      headers ?: any //请求头 如{ Content-Type: 'application/x-www-form-urlencoded' }
      originData ?: any //原始请求数据
  }
}
