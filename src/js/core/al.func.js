/*
 * =================================
 * al.js
 * 用途： 常用函数封装
 * 开发人员：surui / 317953536@qq.com
 * 版本：V1.1.2
 * =================================
 * 功能：系统函数库
 * =================================
 */

// 获取隐藏元素宽度高度
function hideDom(obj, type)
{
	let v = {
		obj : obj.clone,
		return : ''
	};
	v.obj.
	appendTo('html').
	css({
		'position' : 'absolute',
		'left'     : '-9999px',
		'display'  : 'block'
	});
	if (type == undefined)
	{
		v.return = v.obj.outerWidth();
	}
	else
	{
		v.return = (type == 'width') 
					? v.obj.outerWidth() 
					: v.obj.outerHeight();
	}
	v.obj.remove();
	return v.return;
}

// 获取INNER_WIDTH
function innerW()
{
	if (window.innerWidth)
	{
		return window.innerWidth;
	}
	else if (document.documentElement.clientWidth) 
	{
		return document.documentElement.clientWidth;
	}
	else if (document.body.clientWidth)
	{
		return document.body.clientWidth;
	}
}

// 获取INNER_HEIGHT
function innerH()
{
	if (window.innerHeight)
	{
		return window.innerHeight;
	}
	else if (document.documentElement.clientHeight) 
	{
		return document.documentElement.clientHeight;
	}
	else if (document.body.clientHeight)
	{
		return document.body.clientHeight;
	}
}

// 禁止/允许页面内容选中
// 1：允许
// 0：禁止
function userselect(type)
{
	type = (type == undefined) ? 1 : 0;
	if (type == 1)
	{
		document.onselectstart = function(){return true;}
		//兼容火狐
		$('body').css('-moz-user-select','');
	}
	else
	{
		document.onselectstart = function(){return false;}
		//兼容火狐
		$('body').css('-moz-user-select','none');
	}
}

// 禁用右键
function disabledRight()
{
	$(document).on('contextmenu', function(e){
        return false;
    });
}

// 键盘输入防抖
function keyup(dom, callback)
{
	let T = null;
	dom.on('keyup', function(e){
		let _this = $(this);
		clearTimeout(T);
		T = setTimeout(function(){
			callback(_this, e);
		}, 200);
	});
}

// 获取指定元素到可视区域四个方向的距离
// @dom：指定的dom元素
// @type：方向，top、bottom、left、right
// @cut：是否减去自身宽度
function distance(dom, type, cut = true)
{
	let val;
	switch (type)
	{
		case 'top':
			val = dom.offset().top;
		break;
		case 'bottom':
			val = innerH() - dom.offset().top - dom.outerHeight() - 10;
		break;
		case 'left':
			val = dom.offset().left;
		break;
		case 'right':
			val = innerW() - dom.offset().left;
			if (cut)
				val -= dom.outerWidth(); 
		break;
	}
	return val;
}

// 全局通用显示动画效果
// @dom：需要淡入的dom
// @source：触发该次动作的来源，如果指定，则表示要自动定位在该来源的合适位置上
// @cut：是否减去自身宽度
function fadeIn(dom, source = null, cut = true)
{
	// 如果传递触发事件的原DOM，则表示需要自动定位
	if (source != null)
	{
		// 定义局部变量
		let v = {
			top  : 0,
			left : 0,
			pickerOuterHeight : dom.outerHeight(),
			pickerOuterWidth  : dom.outerWidth()
		};
		v.inputOuterHeight = source.outerHeight();
		v.inputOuterWidth  = source.outerWidth();
		v.offset = source.offset();
		v.left   = v.offset.left;
		v.top    = v.offset.top;
		// 判断显示的位置
		// 用来控制如果下方空间不够则在上方显示，反之也是
		if (distance(source, 'bottom') < v.pickerOuterHeight)
		{
			v.top -= (v.pickerOuterHeight + 5);
		}
		else
		{
			v.top += (v.inputOuterHeight + 5);
		}
		// 判断距离右侧宽度是否充足
		if (distance(source, 'right', cut) < v.pickerOuterWidth)
			v.left -= (v.pickerOuterWidth - v.inputOuterWidth);
		dom.css({
			left : v.left,
			top  : v.top
		}).attr('tabindex', 0);
	}
	dom.
		off('animationend').
		show().
		removeClass('fadeOutUp').
		addClass('fadeInDown');
}

// 全局通用隐藏效果
// @dom
// @callback：隐藏后的回调
function fadeOut(dom, callback = null)
{
	dom.
	removeClass('fadeInDown').
	addClass('fadeOutUp').
	on('animationend', function(){
		$(this).hide();
		if (_.isFunction(callback)) callback();
	});
}

/**
 * 不足10自动补0，用在日历组件中
 * @param {*} num 
 */
function repairZero(num)
{
	return (num < 10) ? '0' + num : num;
}

// 同级别排他增加class
function addClassExc(dom, classname)
{
	dom.
	addClass(classname).
	siblings().
	removeClass(classname);
}

// 真实作用域，主要用来区分直接页面还是WINDOW中，避免DOM元素的ID冲突
function scope(dom)
{
	if (dom === false) return false;
	if (Mount.window == null)
	{
		return $(dom);
	}
	else
	{
		return $('#' + Mount.window).find(dom);
	}
}

// 生成唯一ID
function createId()
{
	return (new Date()).valueOf() + Math.random().toString().slice(-6);
}

// 缺省图加载
function defaultImg(box)
{
	if (module.conf.error_default_img == '')
		return;
	box.find('img').each(function(){
		let _this = $(this);
		_this.on('error', () => {
			_this.attr('src', module.conf.error_default_img);
		});
	});
}

// 处理块元素特殊情况
function block(dom)
{
	// 自适应列宽
	col(dom);
	// 块标题
	dom.find('.block-title').
	each(function(){
		let [_this, v] = [$(this), {}];
		// 自定义图标
		v.icon = _this.data('icon');
		if (v.icon == undefined)
		{
			_this.prepend('<span></span>');
		}
		else
		{
			v.color = _this.data('icon-color');
			if (v.color != undefined)
				v.icon += ' font-color-' + v.color;
			_this.css('padding-left', 0).prepend(`<i class="${v.icon}"></i>`);
		}
	});
	// 块
	dom.find('.block-data').
	each(function(){
		let [_this, v] = [$(this), {}];
		_this.addClass('block-data');
		v.small = _this.data('small');
		if (v.small != undefined)
			_this.addClass('block-data-small');
		v.color = _this.data('color');
		if (v.color != undefined)
		{
			v.color = 'font-color-' + v.color;
			_this.find('.num').addClass(v.color);
		}
		else
		{
			v.color = '';
		}
		v.icon = _this.data('icon');
		if (v.icon != undefined)
		{
			_this.children('h5').prepend(`<i class="${v.icon} ${v.color}"></i>`);
		}
	});
}

// 自适应
function col(dom)
{
	// 自适应
	dom.find("[class*='col-']").
	each(function(){
		let [_this, v] = [$(this), {}];
		v.class = _this.attr('class');
		v.class.replace(/col-([\d]+)/g, function(){
			v.col = parseInt(arguments[1]);
			switch (v.col)
			{
				case 1:
					v.class = 'col-xl-1 col-lg-1 col-md-2 col-sm-3';
				break;
				case 2:
					v.class = 'col-xl-2 col-lg-2 col-md-3 col-sm-4';
				break;
				case 3:
					v.class = 'col-xl-3 col-lg-3 col-md-4 col-sm-6';
				break;
				case 4:
					v.class = 'col-xl-4 col-lg-4 col-md-6 col-sm-6';
				break;
				case 5:
					v.class = 'col-xl-5 col-lg-5 col-md-5 col-sm-5';
				break;
				case 6:
					v.class = 'col-xl-6 col-lg-6 col-md-6 col-sm-12';
				break;
				case 7:
					v.class = 'col-xl-7 col-lg-7';
				break;
				case 8:
					v.class = 'col-xl-8 col-lg-8';
				break;
				case 9:
					v.class = 'col-xl-9 col-lg-9';
				break;
				case 10:
					v.class = 'col-xl-10 col-lg-10';
				break;
				case 11:
					v.class = 'col-xl-11 col-lg-11';
				break;
				case 12:
					v.class = 'col-xl-12 col-lg-12';
				break;
			}
			_this.removeClass('col-' + v.col).addClass(v.class);
		});
	});
}

// 设置路由
function setRoute(url = '')
{
	window.history.pushState(null, null, '#' + url);
}

// 获取路由
function getRoute(homepage = true)
{
	let hash = window.location.hash;
	if (hash == '')
	{
		return false;
	}
	let arr = hash.split('#');
	if (arr[2] != undefined && homepage)
	{
		return false;
	}
	return arr[1];
}

// 获取URL参数
function query(url, qs = false)
{
	let arr;
	if (url.indexOf('?') != -1)
	{
		arr = url.split('?');
		if (arr.length == 1)
			return '';
		arr = arr[1].split('&');
	}
	else
	{
		arr = url.split('&');
	}
	let query = {};
	for (let i in arr)
	{
		let get = arr[i].split('=');
		query[get[0]] = get[1];
	}
	return qs ? query : JSON.stringify(query);
}