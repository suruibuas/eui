/*
 * =================================
 * al.js
 * 用途： 初始化
 * 开发人员：surui / 317953536@qq.com
 * 版本：V1.1.2
 * =================================
 * 功能：初始化
 * =================================
 */

/**
 * 定义全局通用常量、变量
 */

// 禁止选中网页文本标识，用在滑块拖动时避免页面文字被选中使用
let selectEnabled = true;
// BODY的JQ缓存
let body;
// 是否需要清理页面
let clear  = false;
// 全局动作
let Method = {};
// 挂载点
let Mount  = {
	dropzone : [],
	window   : null,
	page     : false,
	skin     : 'dark',
	timeout  : [],
	interval : []
};
// 全局监听单选、复选、下拉启用禁用，用来响应虚拟UI的显示状态
Mount.observer = new MutationObserver((m) => {
	if(m[0].attributeName != 'disabled') return;
	let dom = m[0].target;
	dom = $(dom);
	// 单选
	if (dom.is(':radio'))
	{
		// 是不是开关
		if (dom.data('model') == 'switch')
		{
			dom.is(':disabled') ? 
				dom.next().addClass('switch-disabled') : 
				dom.next().removeClass('switch-disabled');
			return;
		}
		let _class = 'radio';
		if(dom.is(':checked'))
		{
			_class += dom.is(':disabled') ? '-disabled-checked' : '-checked';
		}
		else
		{
			_class += dom.is(':disabled') ? '-disabled' : '';
		}
		dom.parent().prop('class', _class);
		return;
	}
	// 复选
	if (dom.is(':checkbox'))
	{
		let _class = 'checkbox';
		if(dom.is(':checked'))
		{
			_class += dom.is(':disabled') ? '-disabled-checked' : '-checked';
		}
		else
		{
			_class += dom.is(':disabled') ? '-disabled' : '';
		}
		dom.parent().prop('class', _class);
		return;
	}
	// 下拉
	if(dom.is('select'))
	{
		dom.is(':disabled') ? 
			dom.next().addClass('select-disabled') : 
			dom.next().removeClass('select-disabled');
		return;
	}
});

// 默认执行异步加载过程
(function(){
	try{
		module != undefined;
		load(module);
	}catch(e){
		console.log('没有找到任何可用的module配置，框架初始化失败');
	}
})();

// 加载方法
function load(module)
{
	// 框架
	let framework = module.framework;
	// 类库
	let lib 	  = module.lib;
	// 插件
	let plugin    = module.plugin;
	// 数据配置
	let data	  = module.data;
	// 事件
	let event     = module.event;
	// 回调
	let ready     = module.ready;
	// 组装框架文件
	let file = [];
	for (let i in framework)
	{
		// 框架版本
		let version = framework[i];
		for (let j = 0; j < _fmConf[i].length; j++)
		file.push(_ROOTPATH + 'js/framework/' + i + '/' + version + '/' + _fmConf[i][j]);
	}
	loader.load(file, function(){
		body = $('body');
		let timer = setTimeout(() => {
			body.append(`<div id="resource">首次访问加载文件较多，请稍等...</div>`);
		}, 1000);
		// 加载数据配置
		if (data != undefined && data.length > 0)
		{
			file = [];
			for (let i in data)
				file.push(_ROOTPATH + 'js/data/' + data[i]);
			loader.load(file);
		}
		// 加载类库
		if (lib != undefined && lib.length > 0)
		{
			file = [];
			for (let i in lib)
				file.push(_ROOTPATH + 'js/lib/eadmin.' + lib[i] + '.min.js');
			loader.load(file);
		}
		// 加载插件
		if (plugin != undefined)
		{
			file = [];
			for (let i in plugin)
				file.push(_ROOTPATH + 'js/plugin/' + plugin[i] + '.min.js');
			loader.load(file);
		}
		// 最后加载事件，因为事件极有可能需要依赖以上的文件
		loader.ready(function(){
			let finish = () => {
				clearTimeout(timer);
				$('header').show();
				$('#container').show();
				$('#resource').remove();
			}
			if (event == undefined || 
				event.length == 0)
			{
				finish();
				if(ready != undefined) ready();
				return;
			}
			file = [];
			for (let i = 0; i < event.length; i++)
				file.push(_ROOTPATH + 'js/event/' + event[i]);
			loader.load(file, function(){
				finish();
				if(ready != undefined) ready();
			});
		});
	});
}