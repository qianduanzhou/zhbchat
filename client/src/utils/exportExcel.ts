import * as XLSX from 'xlsx';
export default function exportExcel(rs: any, tableName: any, dom: any) {
  // 点击导出按钮
  let data: any = [{}];
  //rs代指表格数据
  for (let k in rs[0]) {
    data[0][k] = k
  }
  //data[0][0]~data[0][k]设置了所有列的属性
  //concat数组连接
  data = data.concat(rs);
  downloadExl(data, tableName, dom);
  //data等同表格数据
}
function downloadExl(json: any, downName: any, dom: any, type?: any) {  // 导出到excel
  let keyMap: any = [] // 获取键
  for (let k in json[0]) {//json[0]所有列的属性
    keyMap.push(k);
  }
  console.info('keyMap', keyMap, json)
  let tmpdata: any = [] // 用来保存转换好的json
  json.map((v: any, i: number) => keyMap.map((k: any, j: number) => Object.assign({}, {
    v: v[k],
    position: (j > 25 ? getCharCol(j) : String.fromCharCode(65 + j)) + (i + 1)
  }))).reduce((prev: any, next: any) => prev.concat(next)).forEach(function (v: any) {
    if (v.v != null) {
      tmpdata[v.position] = {
        v: v.v
      }
    } else {
      tmpdata[v.position] = {
        v: ''
      }
    }
  })
  let outputPos = Object.keys(tmpdata);  // 设置区域,比如表格从A1到D10
  let tmpWB = {
    SheetNames: ['监测数据'], // 保存的表标题
    Sheets: {
      '监测数据': Object.assign({},
        tmpdata, // 内容
        {
          '!ref': outputPos[0] + ':' + outputPos[outputPos.length - 1] // 设置填充区域
        })
    }
  }
  let tmpDown: any = new Blob([s2ab(XLSX.write(tmpWB,
    { bookType: (type === undefined ? 'xlsx' : type), bookSST: false, type: 'binary' } // 这里的数据是用来定义导出的格式类型
  ))], {
    type: ''
  })  // 创建二进制对象写入转换好的字节流
  var href = URL.createObjectURL(tmpDown)  // 创建对象超链接
  dom.download = downName + '.xlsx'  // 下载名称
  dom.href = href  // 绑定a标签
  dom.click()  // 模拟点击实现下载
  setTimeout(function () {  // 延时释放
    URL.revokeObjectURL(tmpDown) // 用URL.revokeObjectURL()来释放这个object URL
  }, 100)
}

function s2ab(s: any) { // 字符串转字符流
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i !== s.length; ++i) {
    view[i] = s.charCodeAt(i) & 0xFF
  }
  return buf
}
function getCharCol(n: any) { // 将指定的自然数转换为26进制表示。映射关系：[0-25] -> [A-Z]。
  //注意，n代表的不是字符，是字符串
  let s = '';
  let m = 0;
  while (n > 0) {
    m = n % 26 + 1
    s = String.fromCharCode(m + 64) + s;
    /*fromCharCode根据unicode数值返回字符*/
    n = (n - m) / 26;
  }
  return s
}