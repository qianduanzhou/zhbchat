import { Pager } from 'assets/interface/pager';
import CodeVerfiy from './codeVerfiy';
import exportExcel from './exportExcel';
function getOriginPager({ current = 1, pageSize = 10, total = 0, pageSizeOptions = [1, 10, 20, 50, 100] }: Pager) {
	return {
		current,
		pageSize,
		total,
		defaultPageSize: pageSize || pageSizeOptions[0],
		pageSizeOptions
	}
}

//获取补充div的数量
function getFixDom(count: number, lstLength: number): number[] {
	let len = lstLength % count === 0 ? 0 : count - (lstLength % count);
	let fixList = []
	for (let i = 0; i < len; i++) {
		fixList.push(i)
	}
	return fixList;
}

function isObject(v: any) {
	return typeof v === 'object' && v !== null
}

/**
 * 深拷贝
 * @param target 目标对象
 * @param map 
 * @returns 
 */
function deepClone(target: any, map = new WeakMap()) {
	if (map.get(target)) {
		return target;
	}
	// 获取当前值的构造函数：获取它的类型
	let constructor = target?.constructor;
	if(constructor) {
		// 检测当前对象target是否与正则、日期格式对象匹配
		if (/^(RegExp|Date|Moment)$/i.test(constructor.name)) {
			// 创建一个新的特殊对象(正则类/日期类)的实例
			return new constructor(target);
		}
	}
	if (isObject(target)) {
		map.set(target, true);  // 为循环引用的对象做标记
		const cloneTarget: any = Array.isArray(target) ? [] : {};
		for (let prop in target) {
			if (target.hasOwnProperty(prop)) {
				cloneTarget[prop] = deepClone(target[prop], map);
			}
		}
		return cloneTarget;
	} else {
		return target;
	}
}

//去重空格
function trimFunc(v: any) {
	if (isObject(v)) {
		let obj = deepClone(v);
		for (let key in obj) {
			if (typeof obj[key] === 'string') obj[key] = obj[key].trim();

		}
		return obj;
	} else {
		if (typeof v === 'string') {
			v.trim();
		} else {
			return v;
		}
	}
}

export { getFixDom, getOriginPager, trimFunc, exportExcel, CodeVerfiy }