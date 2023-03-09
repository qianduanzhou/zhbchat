class CodeVerfiy {
	public options: any;
	constructor(options: any) {
		this.options = {
			id: "", // 容器Id
			canvasId: "verifyCanvas", // canvas的id
			width: "100", // 默认canvas宽度
			height: "35", // 默认canvas高度
			type: "blend", // 图形验证码默认类型blend:数字字母混合类型、number:纯数字、letter:纯字母
			code: ""
		}

		if (Object.prototype.toString.call(options) == "[object Object]") {// 判断传入参数类型
			for (var i in options) { // 根据传入的参数，修改默认参数值
				this.options[i] = options[i];
			}
		} else {
			this.options.id = options;
		}

		this.options.numArr = "0,1,2,3,4,5,6,7,8,9".split(",");
		this.options.letterArr = this.getAllLetter();

		this.init();
		this.refresh();
	}
	init() {
		var con: any = document.getElementById(this.options.id);
		var canvas = document.createElement("canvas");
		this.options.width = Number(this.options.width) > 0 ? this.options.width : con.offsetWidth;
		this.options.height = Number(this.options.height) > 0 ? this.options.height : con.offsetHeight;
		canvas.id = this.options.canvasId;
		canvas.width = this.options.width;
		canvas.height = this.options.height;
		canvas.style.cursor = "pointer";
		//   canvas.innerHTML = "您的浏览器版本不支持canvas";
		if(con.children.length > 0) con.innerHTML = null;
		con.appendChild(canvas);
		var parent = this;
		canvas.onclick = function () {
			parent.refresh();
		}
	}

	/** 生成验证码* */
	refresh() {
		this.options.code = "";
		var canvas: any = document.getElementById(this.options.canvasId);
		if (canvas.getContext) {
			var ctx = canvas.getContext('2d');
		} else {
			return;
		}

		ctx.textBaseline = "middle";

		ctx.fillStyle = this.randomColor(180, 240);
		ctx.fillRect(0, 0, this.options.width, this.options.height);

		if (this.options.type == "blend") { // 判断验证码类型
			var txtArr = this.options.numArr.concat(this.options.letterArr);
		} else if (this.options.type == "number") {
			var txtArr = this.options.numArr;
		} else {
			var txtArr = this.options.letterArr;
		}

		for (var i = 1; i <= 4; i++) {
			var txt = txtArr[this.randomNum(0, txtArr.length)];
			this.options.code += txt;
			ctx.font = this.randomNum(this.options.height / 1.3, this.options.height) + 'px SimHei'; // 随机生成字体大小
			ctx.fillStyle = this.randomColor(50, 160); // 随机生成字体颜色
			ctx.shadowOffsetX = this.randomNum(-3, 3);
			ctx.shadowOffsetY = this.randomNum(-3, 3);
			ctx.shadowBlur = this.randomNum(-3, 3);
			ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
			var x = this.options.width / 5 * i;
			var y = this.options.height / 2;
			var deg = this.randomNum(-30, 30);
			/** 设置旋转角度和坐标原点* */
			ctx.translate(x, y);
			ctx.rotate(deg * Math.PI / 180);
			ctx.fillText(txt, 0, 0);
			/** 恢复旋转角度和坐标原点* */
			ctx.rotate(-deg * Math.PI / 180);
			ctx.translate(-x, -y);
		}
		/** 绘制干扰点* */
		for (var i = 0; i < this.options.width / 4; i++) {
			ctx.fillStyle = this.randomColor(0, 255);
			ctx.beginPath();
			ctx.arc(this.randomNum(0, this.options.width), this.randomNum(0, this.options.height), 1, 0, 2 * Math.PI);
			ctx.fill();
		}
	}

	/** 验证验证码
	 *此处可根据需求来判断字母大小写是否精准判断，我这里将字母全部转化为小写判断的
	* */
	validate(code: any) {
		var code = code.toLowerCase();
		var v_code = this.options.code.toLowerCase();
		if (code === v_code) {
			return true;
		} else {
			return false;
		}
	}
	/** 生成字母数组* */
	getAllLetter() {
		var letterStr = "a,b,c,d,e,f,g,h,i,j,k,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z";
		return letterStr.split(",");
	}
	/** 生成一个随机色* */
	randomColor(min: number, max: number) {
		var r = this.randomNum(min, max);
		var g = this.randomNum(min, max);
		var b = this.randomNum(min, max);
		return "rgb(" + r + "," + g + "," + b + ")";
	}
	/** 生成一个随机数* */
	randomNum(min: number, max: number) {
		return Math.floor(Math.random() * (max - min) + min);
	}
}
export default CodeVerfiy;