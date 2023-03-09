import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import configureStore from './store';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'

import moment from "moment";
import "moment/locale/zh-cn";
moment.locale("zh-cn");
const container = document.getElementById('root');
const root = createRoot(container as Element);

root.render(
	<BrowserRouter>
		<Provider store={configureStore}>
			<ConfigProvider locale={zhCN}>
					<App />
			</ConfigProvider>
		</Provider>
	</BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
