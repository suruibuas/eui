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

// 禁止选中网页文本标识
let selectEnabled = true;
// BODY的JQ缓存
let body;
// 是否需要清理页面
let clear  = false;
// 全局动作
let Method = {};
// 挂载点
let Mount  = {
	dropzone : []
};

// 默认执行异步加载过程
(function(){
	try{
		module != undefined;
		load(module);
	}catch(e){
		console.log('没有找到任何可用的module配置，框架初始化失败');
	}
})();

function load(module)
{
	// 框架
	let _framework = module.framework;
	// 类库
	let _lib 	   = module.lib;
	// 插件
	let _plugin    = module.plugin;
	// 数据配置
	let _data	   = module.data;
	// 事件
	let _event     = module.event;
	// 回调
	let _ready     = module.ready;
	// 组装框架文件
	let _file = [];
	for (let i in _framework)
	{
		// 框架版本
		let _version = _framework[i];
		for (let j = 0; j < _fmConf[i].length; j++)
		_file.push(_ROOTPATH + 'framework/' + i + '/' + _version + '/' + _fmConf[i][j]);
	}
	loader.load(_file, function(){
		body = $('body');
		// 加载数据配置
		if (_data != undefined && _data.length > 0)
		{
			for (let i in _data)
				loader.load(_ROOTPATH + 'data/' + _data[i]);
		}
		// 加载类库
		if (_lib != undefined && _lib.length > 0)
		{
			for (let i in _lib)
				loader.load(_ROOTPATH + 'lib/eadmin.' + _lib[i] + '.min.js');
		}
		// 加载插件
		if (_plugin != undefined)
		{
			for (let i in _plugin)
				loader.load(_ROOTPATH + 'plugin/' + _plugin[i] + '.min.js');
		}
		// 最后加载事件，因为事件极有可能需要依赖以上的文件
		loader.ready(function(){
			if (_event == undefined || 
				_event.length == 0)
			{
				if(_ready != undefined) _ready();
				return;
			}
			var _file = [];
			for (let i = 0; i < _event.length; i++)
			_file.push(_ROOTPATH + 'event/' + _event[i]);
			loader.load(_file, function(){
				if(_ready != undefined) _ready();
			});
		});
	});
}