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
	var _obj = obj.clone();
	_obj.
	appendTo('html').
	css({
		'position' : 'absolute',
		'left'     : '-9999px',
		'display'  : 'block'
	});
	var _return;
	if (type == undefined)
	{
		_return = _obj.outerWidth();
	}
	else
	{
		_return = (type == 'width') 
					? _obj.outerWidth() 
					: _obj.outerHeight();
	}
	_obj.remove();
	return _return;
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

// 禁止选中，type：1可选，0不可选
function selectText(type)
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
	$(document).bind('contextmenu', function(e){
        return false;
    });
}

/**
 * 键盘输入防抖
 */
function keyup(dom, callback)
{
	var T = null;
	dom.on('keyup', function(e){
		var _this = $(this);
		clearTimeout(T);
		T = setTimeout(function(){
			callback(_this, e);
		}, 200);
	});
}

/**
 * 获取指定元素到可视区域四个方向的距离
 */
function distance(dom, type, cut = true)
{
	var _val;
	switch (type)
	{
		case 'top':
			_val = dom.offset().top;
		break;
		case 'bottom':
			_val = innerH() - dom.offset().top - dom.outerHeight() - 10;
		break;
		case 'left':
			_val = dom.offset().left;
		break;
		case 'right':
			_val = innerW() - dom.offset().left;
			if (cut)
				_val -= dom.outerWidth(); 
		break;
	}
	return _val;
}

/**
 * 全局通用显示
 */
function fadeIn(dom, source = null, cut = true)
{
	// 如果传递触发事件的原DOM，则表示需要自动定位
	if (source != null)
	{
		// 定义局部变量
		var _var = {
			top  : 0,
			left : 0,
			pickerOuterHeight : dom.outerHeight(),
			pickerOuterWidth  : dom.outerWidth()
		};
		_var.inputOuterHeight = source.outerHeight();
		_var.inputOuterWidth  = source.outerWidth();
		_var.offset = source.offset();
		_var.left   = _var.offset.left;
		_var.top    = _var.offset.top;
		// 判断显示的位置
		// 用来控制如果下方空间不够则在上方显示，反之也是
		if (distance(source, 'bottom') < _var.pickerOuterHeight)
		{
			_var.top -= (_var.pickerOuterHeight + 5);
		}
		else
		{
			_var.top += (_var.inputOuterHeight + 5);
		}
		// 判断距离右侧宽度是否充足
		if (distance(source, 'right', cut) < _var.pickerOuterWidth)
			_var.left -= (_var.pickerOuterWidth - _var.inputOuterWidth);
		dom.css({
			left : _var.left,
			top  : _var.top
		}).attr('tabindex', 0);
	}
	dom.
		off('animationend').
		show().
		removeClass('fadeOutUp').
		addClass('fadeInDown');
}

/**
 * 全局通用隐藏
 */
function fadeOut(dom, callback = null)
{
	dom.
		removeClass('fadeInDown').
		addClass('fadeOutUp').
		on('animationend', function(){
			$(this).hide();
			if (callback != null) callback();
		});
}

/**
 * 不足10自动补0
 * @param {*} num 
 */
function repairZero(num)
{
	return (num < 10) ? '0' + num : num;
}

/**
 * 同级别排他增加class
 */
function addClassExc(dom, classname)
{
	dom.
		addClass(classname).
		siblings().
		removeClass(classname);
}

/**
 * 作用域
 */
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

/**
 * 生成唯一ID
 */
function createId()
{
	return (new Date()).valueOf() + Math.random().toString().slice(-6);
}

/**
 * 缺省图加载
 */
function defaultImg(box)
{
	if (module.conf.error_default_img == '')
		return;
	box.
		find('img').
		each(function(){
			let v = {
				this : $(this)
			}
			v.this.on('error', () => {
				v.this.attr('src', module.conf.error_default_img);
			});
	});
}

/**
 * 块标题
 */
function block(dom)
{
	// 块标题
	dom.find('.block-title').each(function(){
		let v = {
			this : $(this)
		};
		v.icon = v.this.data('icon');
		if (v.icon == undefined)
		{
			v.this.prepend('<span></span>');
		}
		else
		{
			v.color = v.this.data('icon-color');
			if (v.color != undefined)
				v.icon += ' color-' + v.color;
			v.this.
				css('padding-left', 0).
				prepend(`<i class="${v.icon}"></i>`);
		}
	});
	// 块
	dom.find('.block').each(function(){
		let v = {this : $(this)};
		if (v.this.data('block-data') != undefined)
		{
			v.this.addClass('block-data');
			v.color = v.this.data('color');
			if (v.color != undefined)
			{
				v.color = 'color-' + v.color;
				v.this.
					find('.num').
					addClass(v.color);
			}
			else
			{
				v.color = '';
			}
			v.icon = v.this.data('icon');
			if (v.icon != undefined)
			{
				v.this.
					children('h5').
					prepend(`<i class="${v.icon} ${v.color}"></i>`);
			}
		}
		if (v.this.data('block-href') != undefined)
		{
			v.this.addClass('block-href');
			v.color = v.this.data('color');
			if (v.color != undefined)
			{
				v.color = 'color-' + v.color;
			}
			else
			{
				v.color = '';
			}
			v.icon = v.this.data('icon');
			if (v.icon != undefined)
				v.this.prepend(`<i class="${v.icon} ${v.color}"></i>`);
		}
	});
	// 自适应
	col(dom);
}

/**
 * 自适应
 */
function col(dom)
{
	// 自适应
	dom.find("[class*='col-']").each(function(){
		let v = {
			this : $(this)
		};
		v.class = v.this.attr('class');
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
			v.this.
				removeClass('col-' + v.col).
				addClass(v.class);
		});
	});
}