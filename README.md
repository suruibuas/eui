# al.js

#### 介绍
一个高性能，开箱即用的异步加载框架，基于浏览器级别的模块化设计，内置了常用的开发框架比如（JQ）和常用插件

#### 安装教程

1. clone项目到本地
2. 安装nodejs，具体安装步骤请百度
3. cd到项目目录执行npm install进行依赖的安装
4. npm install -g gulp
5. 执行 gulp

#### 目录说明
|- dist
	|- css		样式
	|- js		脚本
		|- core			核心
		|- data			数据文件存放
		|- event		事件文件存放
		|- framework	框架文件存放
		|- plugin		插件文件存放
	|- img 		图片
	|- tmp 		模版（基于art-template）

#### 使用说明

加载核心文件和初始化文件

~~~
<script src="./dist/js/core/al.load.min.js" init="./dist/js/core/al.init.min.js"></script>
~~~

编写模块配置

~~~
<script>
	// 框架初始化完成立即执行
	var init = function(){
		// 阻止继续执行
		return false;
		// 继续执行
		return true;
	}
	
	var module = {
		// 配置依赖的框架，后面是对应依赖的版本
		framework: {
			'jquery' : '1.8.3'
		},
		// 配置事件文件，事件文件可以写在单独的文件里，方便管理
		// 事件文件加载时不支持回调
		event : [
			// 首页事件
			'index.js',
			// 登录事件
			'login.js'
		],
		// 配置依赖插件，插件文件加载后提供一个立即执行的回调
		plugin : {
			// 插件文件加载完成后立即执行
			'fastclick.min.js' : function(){
				FastClick.attach(document.body);
			},
			// 仅加载依赖
			'jquery.md5.min.js' : ''
		},
		// 所有文件加载完成后提供一个通用的回调
		ready : function(){
			alert('所有文件都加载完毕');
			return;
		}
	}
</script>
~~~

#### 内置文件

###### 框架

1.jquery
版本：1.7.2、1.8.3、1.9.1、1.10.2、1.11.1、1.11.3、2.0.0、2.0.3、2.1.4、3.0.0、3.1.1、3.2.1

2.animate
版本：3.1.0

3.art-template
版本：4.12.2

4.bootstrap
版本：3.3.4

5.font-awesome
版本：4.6.0、4.7.0

6.html5
版本：3.7

7.swiper
版本：3.4.2

8.zepto
版本：1.2.0

###### 插件

1.fastclick
2.iscroll
3.lazyload
4.md5
5.store
6.velocity

###### 内置常用方法

~~~
// cookie操作
// 获取
cookie('name');
// 设置
cookie('name', 1);
// 删除
cookie('name', 'null');

// 获取地址栏参数
var id = get('id');

// 获取隐藏元素宽度高度
// @param1：dom元素
// @param2：类型  width：宽度  height：高度
hideDom($('#dom'), 'width');

// 兼容浏览器的innerWidth和innerHeight
innerW();
innerH();

// 禁用浏览器选中文本
// @param：类型 1：可选 0：禁止选中
selectTxt(1);

// 获取json长度
// @param : json对象
jsonLen(jsonData);

// 生成随机数
// @param1：随机数长度
// @param2：随机数范围

// 生成4位随机数
random(4);

// 生成1000~9999范围内的随机数
random(1000, 9999);

// unix时间戳
curtime();

// 返回年月日
// @param：格式化字符，默认为空
date('/');
~~~