/*
 * =================================
 * al.js
 * 用途： 全异步加载架构
 * 开发人员：surui / 317953536@qq.com
 * 版本：V1.1.2
 * =================================
 * 功能：模块编排配置
 * =================================
 */

// 定义根路径，用于加载文件
var _ROOTPATH;
// 解析路径
var _script = window.document.getElementsByTagName('script');
for (var i = 0; i < _script.length; i++)
{
    var _src = _script[i].getAttribute('src');
    if (_src == null)
    {
    	continue;
    }
    if (_src.indexOf('al.load') != -1)
    {
    	_ROOTPATH = _src.replace(/js\/core\/al.load.min.js/, '');
    	break;
    }
}
// 框架加载文件配置
var _fmConf = [];

// jquery
_fmConf['jquery'] = [
	'jquery.min.js'
];
// animate
_fmConf['animate'] = [
	'animate.min.css'
];
// bootstrap
_fmConf['bootstrap'] = [
	'bootstrap.min.css',
];
// font-awesome
_fmConf['font-awesome'] = [
	'font-awesome.min.css'
];
// html5
_fmConf['html5'] = [
	'html5shiv.min.js'
];
// swiper
_fmConf['swiper'] = [
	'swiper.min.js',
    'swiper.min.css'
];
// zepto
_fmConf['zepto'] = [
	'zepto.min.js'
];
// art-template
_fmConf['art-template'] = [
    'template-web.js'
];
// eadmin
_fmConf['eadmin'] = [
    'eadmin.min.js'
];
// lodash
_fmConf['lodash'] = [
    'lodash.min.js'
];
// axios
_fmConf['axios'] = [
    'axios.min.js'
];
// chart
_fmConf['chart'] = [
    'chart.min.js'
];