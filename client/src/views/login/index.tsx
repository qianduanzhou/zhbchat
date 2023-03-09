import styles from './index.module.scss';
import { Md5 } from "ts-md5/dist/md5";
import request from 'request/index'
import { useNavigate } from 'react-router-dom';
import { Checkbox, Form, Input, Button, Select, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, UserSwitchOutlined, EllipsisOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUserInfo } from 'store/user';
import { CodeVerfiy } from 'utils/index';
const { Option } = Select;

const roleOpions = [{
  label: '公司用户',
  value: "0"
}, {
  label: '油站用户',
  value: "1"
}, {
  label: '公司超级管理员',
  value: "10"
}, {
  label: '油站超级管理员',
  value: "11"
}]

export default function Login() {
  console.log('Md5', Md5.hashStr('123'));
  let navigate = useNavigate()
  let dispatch = useDispatch();
  let [loading, setLoading] = useState(false);
  let [isFormCache, setIsFormCache] = useState(false);//是否从缓存拿
  let [verfiycode, setVerfiycode] = useState<any>();//验证码实例
  const [form] = Form.useForm();
  useEffect(() => {//初始化表格
    let user_form = localStorage.getItem('user_form');
    if (user_form) {
      form.setFieldsValue(JSON.parse(user_form))
      setIsFormCache(true)
    }
  }, [])

  //验证码
  useEffect(() => {
    setVerfiycode(new CodeVerfiy({
      id: 'verfiyCodeDom',
      type: 'blend',
      width: '120',
      height: '60'
    }))
  }, [])


  const onFinish = async (values: any) => {//登录
    setLoading(true);
    let { user_name, user_pass, user_type, isSaved } = values
    if(!['100001', '10000100001', '10000100002', '10000100003'].includes(user_name) && !isFormCache) user_pass = Md5.hashStr(user_pass);//非原始账号需md5加密
    try {
      await request({
        name: 'login', data: {
          user_name,
          user_pass,
          user_type
        }
      })
      if (isSaved) {
        localStorage.setItem('user_form', JSON.stringify({
          user_name, user_pass, user_type, isSaved
        }))
      } else {
        let user_form = localStorage.getItem('user_form');
        if (user_form) localStorage.removeItem('user_form')
      }
      await getUserInfo(user_name);
      navigate('/home');
      message.success('登陆成功');
      setLoading(false);
    } catch (err: any) {
      message.error(`登录失败：${err.result_msg || JSON.stringify(err)}`)
      setLoading(false);
    }
  };

  //获取用户信息
  function getUserInfo(user_name: string) {
    let userInfo = {}
    switch (user_name) {
      case '100001':
      case '10000100001':
      case '10000100002':
      case '10000100003':
        userInfo = {
          name: user_name,
          company_id: "100001",
          company_name: "智付车车公司"
        }
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
        dispatch(setUserInfo(userInfo))
        break;
      default:
        let data = {
          name: user_name
        }
        request({ name: 'read_user_Info', data }).then((res: any) => {
          userInfo = res.record_list[0]
          localStorage.setItem('userInfo', JSON.stringify(userInfo))
          dispatch(setUserInfo(userInfo))
          return Promise.resolve()
        }).catch((err: any) => {
          return Promise.reject(err)
        })
        break;
    }
  }

  //密码框change
  function changePass() {
    setIsFormCache(false);
  }
  
  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className={styles.login}>
      <div className={styles.loginBlock}>
        <p className={styles.title}>登录账户</p>
        <b className={styles.tip}>登录账户以继续使用云平台进行系统的操作</b>
        <Form
          className={styles.form}
          name="basic"
          wrapperCol={{ span: 24 }}
          form={form}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          size='large'
        >
          <Form.Item
            name="user_name"
            labelAlign="left"
            rules={[{ required: true, message: '*账户输入不正确，请正确填写有效的登录账户' }]}
          >
            <Input className={styles.input} placeholder='请输入登录账户' prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            name="user_pass"
            labelAlign="left"
            rules={[{ required: true, message: '*密码输入不正确，请正确填写有效的登录密码' }]}
          >
            <Input.Password className={styles.input} placeholder='请输入登录密码' prefix={<LockOutlined />} onChange={changePass}/>
          </Form.Item>

          <Form.Item
            labelAlign="left"
            className={styles.selectForm}

          >
            <Form.Item
              name="user_type"
              labelAlign="left"
              rules={[{ required: true, message: '*请选择用户类型' }]}
            >
              <Select className={styles.select} placeholder="请选择用户类型">
                {
                  roleOpions.map(v => {
                    return (
                      <Option key={v.value} value={v.value}>{v.label}</Option>
                    )
                  })
                }
              </Select>
            </Form.Item>
            <UserSwitchOutlined className={styles.selectIcon} />
          </Form.Item>

          <Form.Item
            labelAlign="left"
            className={styles.selectForm}
          >
            <Form.Item
              name="checkCord"
              labelAlign="left"
              rules={[{
                required: true, message: '*校验不正确，请正确填写有效的校验码', validator: (rule, value) => {
                  console.log('value', value)
                  if (!verfiycode.validate(value)) {
                    return Promise.reject();
                  } else {
                    return Promise.resolve();
                  }
                }
              }]}
            >
              <Input className={styles.input} placeholder='请输入右边图片上的数字' prefix={<EllipsisOutlined />} />
            </Form.Item>
            <div className="login-verifycode" id='verfiyCodeDom'></div>
          </Form.Item>

          <Form.Item
            name="isSaved"
            labelAlign="left"
            valuePropName="checked"
          >
            <Checkbox>记住选择</Checkbox>
          </Form.Item>

          <Form.Item wrapperCol={{ span: 24 }} className={styles.operatorContainer}>
            <Spin spinning={loading}>
              <Button type="primary" htmlType="submit" className={styles.themeBtn} disabled={loading}>
                确认
              </Button>
            </Spin>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}