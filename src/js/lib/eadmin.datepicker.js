/**
 * eadmin 日期组件
 */

class Datepikcer{

	constructor(dom, param){
		// 日期实例化对象
		this.date = new Date();
		// 日期数组，用来存放日期数据
		this._reset();
		// 今天的日期（年月日），用来加样式判断使用
		this.today 	  = parseInt(this.arr[0].y + '' + this.arr[0].m + '' + this.arr[0].d);
		// 是否需要时间（时分秒，根据param.format来确定）
		this.time     = false;
		// PICKER DOM缓存
		this.picker   = null;
		// INPUT DOM，用来给表单赋值和focus，blur事件处理
		this.input    = dom;
		// INPUT的选择器
		this.inputDom = scope(this.input);
		// 当前所在的日历的序号，左0右1
		this.index    = 0;
		// 上次所在的index，用来判断双日历写值的位置
		this.pindex   = null;
		// 已经选中的日期数量，用来判断是否需要清除所有日期选中状态，双日历会用到
		this.currentNum = 0;
		// 当前获取焦点的文本框，用来赋值
		this.focusInput = null;
		// 默认参数
		let _param   = {
			// 类型
			type    : 'date',
			// 格式化
			format  : 'Y-m-d',
			// 是否需要确认按钮
			confirm : false,
			// 回调
			change  : null,
			// 开始时间
			start   : 0,
			// 结束时间
			end     : 0,
			// 快捷选择
			quick   : false
		}
		// 配置参数
		this.param = $.extend(_param, param);
		// 校验
		if (this.inputDom.length == 0)
		{
			console.log('当前页面中不包含' + this.input + '元素，创建日历失败');
			return false;
		}
		this.run();
	}

	/**
	 * 运行控件
	 */
	run(){
		// 构建结构
		this._create();
		// 初始化
		this._init();
		// 事件执行
		this._event();
	}

	/**
	 * 创建结构
	 */
	_create(){
		let _dom = createId();
		// 组装HTML结构
		let _html = `<div id="datepicker-${_dom}" class="datepicker animated faster${(Mount.window) == null ? '' : ' ' + Mount.window}">`;
		_html += `<div class="quick">
			<span class="title">快捷选择</span>
			<span>3天内</span>
			<span>一周内</span>
			<span>15天内</span>
			<span>一月内</span>
			<span>三月内</span>
			<span>一年内</span>
		</div>
		<div class="datepicker-panel" data-index="0">
		<div class="header">
			<span class="prev-year">
				<i class="ri-arrow-left-s-line"></i>
			</span>
			<span class="prev-month">
				<i class="ri-arrow-drop-left-line"></i>
			</span>
			<span class="show-ym">
				<span class="font year" style="margin-right:5px;"></span>
				<span class="font month"></span>
			</span>
			<span class="next-year">
				<i class="ri-arrow-right-s-line"></i>
			</span>
			<span class="next-month">
				<i class="ri-arrow-drop-right-line"></i>
			</span>
		</div>
		<div class="body">
			<div class="week">
				${this._week()}
			</div>
			<div class="day"></div>`;
		_html += `<div class="y-m">
			${this._year()}
		</div>
		<div class="y-m">
			${this._month()}
		</div>`;
		if(this.param.format.indexOf(' ') != -1)
		{
			_html += `<div class="picker-time">
						${this._time()}
					</div>`;
		}
		_html += `</div></div>`;
		_html += `<div class="datepicker-panel right" data-index="1">
		<div class="header">
			<span class="prev-year">
				<i class="ri-arrow-left-s-line"></i>
			</span>
			<span class="prev-month">
				<i class="ri-arrow-drop-left-line"></i>
			</span>
			<span class="show-ym">
				<span class="font year" style="margin-right:5px;"></span>
				<span class="font month"></span>
			</span>
			<span class="next-year">
				<i class="ri-arrow-right-s-line"></i>
			</span>
			<span class="next-month">
				<i class="ri-arrow-drop-right-line"></i>
			</span>
		</div>
		<div class="body">
			<div class="week">
				${this._week()}
			</div>
			<div class="day"></div>`;
		_html += `<div class="y-m">
			${this._year(this.arr[0].m + 1)}
		</div>
		<div class="y-m">
			${this._month(this.arr[0].m + 1)}
		</div>`;
		if(this.param.format.indexOf(' ') != -1)
		{
			_html += `<div class="picker-time">
						${this._time()}
					</div>`;
		}
		_html += `</div></div>`;
		_html += `<div class="clear"></div>`;
		_html += `<div class="footer">
			<span class="font choose-time">
				选择时间
			</span>
			<span class="confirm">
				<button class="clear">清空</button>
				<button class="highlight sure">确定</button>
			</span>
		</div>`;
		_html += `</div>`;
		body.append(_html);
		// 缓存DOM
		this.picker = $('#datepicker-' + _dom);
	}

	/**
	 * 初始化
	 */
	_init(){
		// 快捷选择
		if (this.param.quick)
			this.picker.find('.quick').show();
		// 判断是否需要显示选择时间
		// 根据format的格式来确定，如果有空格则表示有时间
		if(this.param.format.indexOf(' ') != -1)
			this.time = true;
		// 局部变量统一定义
		let _var = {
			// 文本框的内容取值
			val    : this.inputDom.val(),
			// 主日历（左侧日历，默认显示的）
			picker : this.picker.children('div').eq(1),
		};
		// 主日历头部
		_var.header = _var.picker.children('.header');
		// 私有方法
		let _func = {
			setYear : (dom = _var.header, y = this.arr[0].y) => {
				dom.
					find('.year').
					data('y', y).
					html(y + '年');
			},
			setMonth : (dom = _var.header, m = this.arr[0].m) => {
				dom.
					find('.month').
					data('m', m).
					html(m + '月');
			}
		};
		// 年份显示
		_func.setYear();
		// 月份显示
		_func.setMonth();
		// 显示日期
		_var.picker.
			find('.day').
			html(this._createYmdHtml(this.arr[0].y, this.arr[0].m));
		// 双日历处理
		if(this.param.type == 'date-range')
		{
			// 副日历
			_var.range = _var.picker.next();
			_var.range.show();
			_var.rangeHeader = _var.range.children('.header');
			// 年份显示
			_func.setYear(_var.rangeHeader, this.arr[1].y);
			// 月份显示
			_func.setMonth(_var.rangeHeader, this.arr[1].m);
			// 显示日期
			_var.range.
				find('.day').
				html(this._createYmdHtml(this.arr[1].y, this.arr[1].m));
		}
		// 显示底部工具栏
		if (this.param.confirm)
			this.picker.
				find('.footer').
				show();
		// 如果不需要时分秒则返回
		if ( ! this.time)
			return;
		// 选择时间按钮
		_var.chooseTime = this.picker.find('.choose-time');
		// 显示选择时间按钮
		_var.chooseTime.show();
		// 判断是否需要显示完整的时分秒
		_var.arr = _.words(this.param.format, /[His]/g);
		if (_var.arr.length < 2)
		{
			console.log('日期如果包含时间的话则至少需要时和分两个参数');
			return;
		}
		// 时分秒默认值赋值
		if (_var.val != '')
		{
			_var.picker.
				find('.h' + this.h).
				addClass('current');
			_var.picker.
				find('.i' + this.i).
				addClass('current');
			_var.picker.
				find('.s' + this.s).
				addClass('current');
		}
		// 如果不需要秒数则移除选择秒的那一栏
		if (_var.arr.length == 2)
		{
			_var.picker.
				find('.picker-time ul:last').
				remove();
			if (this.param.type == 'date-range')
			_var.range.
				find('.picker-time ul:last').
				remove();
		}
	}

	/**
	 * 重置初始化日期
	 */
	_reset(ym = false){
		this.arr = [
			{
				// 年
				y : this.date.getFullYear(),
				// 月
				m : this.date.getMonth(),
				// 日
				d : this.date.getDate(),
				// 时
				h : '00',
				// 分
				i : '00',
				// 秒
				s : '00',
				// 当前日历选中的日期
				c : 0,
				// 当前选择的日历序号
				index : 0
			},
			{
				// 年
				y : this.date.getFullYear(),
				// 月
				m : this.date.getMonth(),
				// 日
				d : this.date.getDate(),
				// 时
				h : '00',
				// 分
				i : '00',
				// 秒
				s : '00',
				// 当前日历选中的日期
				c : 0,
				// 当前选择的日历序号
				index : 1
			}
		];
		this.arr[1].m += 1;
		if (this.arr[1].m == 12)
		{
			this.arr[1].y += 1;
			this.arr[1].m = 0;
		}
		this.arr[0].m = repairZero(parseInt(this.arr[0].m) + 1);
		this.arr[0].d = repairZero(this.arr[0].d);
		this.arr[1].m = repairZero(parseInt(this.arr[1].m) + 1);
		this.arr[1].d = repairZero(this.arr[1].d);
		if ( ! ym) return;
		let v = {
			ym  : this.picker.find('.show-ym'),
			day : this.picker.find('.day')
		};
		v.y = v.ym.eq(0).children('.year');
		v.m = v.ym.eq(0).children('.month');
		if (v.y.data('y') != this.arr[0].y)
		{
			v.y.
				html(this.arr[0].y + '年').
				data('y', this.arr[0].y);
		}
		if (v.m.data('m') != this.arr[0].m)
		{
			v.m.
				html(this.arr[0].m + '月').
				data('m', this.arr[0].m);
		}
		if (v.y != this.arr[0].y || 
			v.m != this.arr[0].m)
		{
			v.day.eq(0).
				html(this._createYmdHtml(this.arr[0].y, this.arr[0].m));
		}
		if (this.param.type == 'date-range')
		{
			v.y = v.ym.eq(1).children('.year');
			v.m = v.ym.eq(1).children('.month');
			if (v.y.data('y') != this.arr[1].y)
			{
				v.y.
					html(this.arr[1].y + '年').
					data('y', this.arr[1].y);
			}
			if (v.m.data('m') != this.arr[1].m)
			{
				v.m.
					html(this.arr[1].m + '月').
					data('m', this.arr[1].m);
			}
			if (v.y != this.arr[1].y || 
				v.m != this.arr[1].m)
			{
				v.day.eq(1).
					html(this._createYmdHtml(this.arr[1].y, this.arr[1].m));
			}
		}
	}
	
	/**
	 * 根据年月生成HTML
	 * @param {*} y 
	 * @param {*} m 
	 */
	_createYmdHtml(y = '', m = ''){
		let realM = parseInt(m) - 1;
		// 定义私有变量
		let _var = {
			// 获取当月第一天是星期几
			firstWeekDay : new Date(y, realM, 1).getDay(),
			// 获取当月天数
			monthDay     : this._getMonthDay(y, realM),
			// 获取上个月的天数
			prevMonthDay : this._getMonthDay(y, realM - 1),
			// 实际的天数
			realDay	  	 : 1,
			// 开始时间
			start 		 : ! this.param.start ? 0 : parseInt(this.param.start),
			// 结束时间
			end			 : ! this.param.end ? 0 : parseInt(this.param.end),
			// 结构
			html		 : ''
		};
		_var.firstWeekDay += 1;
		// 循环天数
		for(let _i = 1; _i < 43; _i++)
		{
			// 今天的特殊结构
			let _current = '';
			// 样式，用于控制不能选中的日期
			let _class   = '';
			// 循环内当天日期，只有有效的日期才会赋值
			let _today   = 0;
			// 如果i小于第一天的天数则用上个月的天数补足
			if (_i < _var.firstWeekDay)
			{
				_var.realDay  = _var.prevMonthDay - (_var.firstWeekDay - _i);
				_var.realDay += 1;
				_class = ' class="next"';
			}
			else if (_i - _var.firstWeekDay >= _var.monthDay)
			{
				if (_i - _var.firstWeekDay == _var.monthDay) 
					_var.realDay = 1;
				_class = ' class="next"';
			}
			else
			{
				// 当天日期
				_today = parseInt(y + '' + m + '' + repairZero(_i - _var.firstWeekDay + 1));
				if (_today == this.today)
					_current = '<div></div>';
				if (this.param.type == 'date')
				{
					if (_today == this.arr[this.index].c)
						_class = ' class="current"';
				}
				else
				{
					if (this.arr[this.index].index == this.index && 
						this.arr[this.index].c == _today)
					{
						_class = ' class="current"';
					}
					let _index = this.index == 1 ? 0 : 1;
					if (this.arr[_index].index == this.index && 
						this.arr[_index].c == _today)
					{
						_class = ' class="current"';
					}
				}
				if (_i == _var.firstWeekDay)
					_var.realDay = 1;
			}
			// 判断开始结束日期
			if ((_var.start > 0 || _var.end > 0) && 
				_class != ' class="next"')
			{
				if (_var.start > 0)
				{
					if (_today < _var.start)
						_class = ' class="next"';
				}
				if (_var.end > 0)
				{
					if (_today > _var.end)
						_class = ' class="next"';
				}
			}
			_var.html += `<span${_class} data-day="${_today}" data-y="${y}" data-m="${m}" data-d="${_var.realDay}">
							${_current}${_var.realDay}
						</span>`;
			_var.realDay++;
		}
		return _var.html;
	}

	/**
	 * 获取当前月份的天数
	 * @param {*} y 
	 * @param {*} m 
	 */
	_getMonthDay(y = '', m = ''){
		m = (m < 0) ? 11 : m;
		// 判断当前年是不是闰年
		let _Feb = (y % 4 == 0 && 
					y % 100 != 0 || 
					y % 400 == 0) ? 29 : 28,
			_arr = new Array();
		_arr[0]  = 31;
		_arr[1]  = _Feb;
		_arr[2]  = 31;
		_arr[3]  = 30;
		_arr[4]  = 31;
		_arr[5]  = 30;
		_arr[6]  = 31;
		_arr[7]  = 31;
		_arr[8]  = 30;
		_arr[9]  = 31;
		_arr[10] = 30;
		_arr[11] = 31;
		return _arr[m];
	}

	/**
	 * 星期
	 */
	_week(){
		let _html = '',
			_week = [
				'日', '一', '二', '三', '四', '五', '六'
			];
		for (let _i in _week)
			_html += `<span>${_week[_i]}</span>`;
		return _html;
	}
	
	/**
	 * 年份
	 */
	_year(m = ''){
		let _y;
		if (m == '')
		{
			_y = this.arr[0].y;
		}
		else
		{
			if (m == 12) _y = this.arr[0].y + 1;
		}
		let _html = '';
		for (let _i = this.arr[0].y + 1; _i > (this.arr[0].y - 11); _i--)
		{
			let _active = (_y == _i) ? ' active' : '';
			_html += `<div class="year${_active}" data-y="${_i}">${_i}</div>`;
		}
		return _html;
	}

	/**
	 * 月份
	 */
	_month(m = ''){
		let _m = (m == '') ? parseInt(this.arr[0].m) : m;
		if (_m > 12) _m = 1;
		let _html = '';
		for (let _i = 1; _i < 13; _i++)
		{
			let _active = (_m == _i) ? ' active' : '';
			_html += `<div class="month${_active}" data-m="${_i}">${_i}月</div>`;
		}
		return _html;
	}

	/**
	 * 时间
	 */
	_time(){
		let _html = '<ul class="iscroll">';
		for (let _i = 0; _i < 24; _i++)
		{
			_i = repairZero(_i);
			_html += '<li class="h'+_i+' h">' + _i + '</li>';
		}
		_html += '</ul><ul class="i iscroll">';
		for (let _i = 0; _i < 60; _i++)
		{
			_i = repairZero(_i);
			_html += '<li class="i'+_i+' i">' + _i + '</li>';
		}
		_html += '</ul><ul class="s iscroll">';
		for (let _i = 0; _i < 60; _i++)
		{
			_i = repairZero(_i);
			_html += '<li class="s'+_i+' s">' + _i + '</li>';
		}
		_html += '</ul>';
		return _html;
	}

	/**
	 * 交互事件
	 */
	_event(){
		// 定义需要响应事件的DOM
		let _dom = [
			// 上下年、上下月
			'.prev-year, .prev-month, .next-year, .next-month',
			// 年面板、月面板
			'.show-ym .year, .show-ym .month',
			// 选择年月
			'.y-m div',
			// 选择日期
			'.day span',
			// 清除
			'.footer .clear',
			// 确认
			'.footer .sure',
			// 选择时间
			'.footer .choose-time',
			// 选择具体时间
			'.picker-time li',
			// 快捷选择
			'.quick span'
		];
		let _that = this;
		// 开始监听事件
		_that.inputDom.
		// 显示日期面板
		on('focus', function(){
			let v = {
				this : $(this)
			};
			fadeIn(_that.picker, v.this, false);
			_that.focusInput = v.this;
			clear = true;
		}).
		// 隐藏日期面板
		on('blur', function(){
			fadeOut(_that.picker);
			_that.focusInput = null;
			clear = false;
		});
		this.picker.
		// 收起面板
		on('blur', function(){
			_that.focusInput.blur();
			_that.focusInput = null;
			fadeOut(_that.picker);
			clear = false;
		}).
		// 日历索引
		on('mouseenter', '>.datepicker-panel', function(){
			_that.index = $(this).data('index');
		}).
		// 上年、上月、下年、下月
		on('click', _dom[0], function(){
			let _this = $(this);
			// 定义私有变量
			let _var = {
				body : _this.parent().next('.body'),
				ym   : _this.siblings('.show-ym')
			};
			_var.y = _var.ym.children('.year').data('y');
			_var.m = parseInt(_var.ym.children('.month').data('m'));
			// 私有方法
			let _func = {
				// 设置选中的年
				setYear : () => {
					_var.ym.
						children('.year').
						data('y', _var.y).
						html(_var.y + '年');
				}
			};
			// 上一年
			if(_this.hasClass('prev-year'))
			{
				_var.y -= 1;
				_func.setYear();
			}
			// 上一月
			else if (_this.hasClass('prev-month'))
			{
				_var.m -= 1;
				if (_var.m == 0)
				{
					_var.y -=1;
					_var.m = 12;
					_func.setYear();
				}
				_var.ym.
					children('.month').
					html(repairZero(_var.m) + '月').
					data('m', _var.m);
			}
			// 下一年
			else if ($(this).hasClass('next-year'))
			{
				_var.y += 1;
				_func.setYear();
			}
			// 下一月
			else
			{
				_var.m += 1;
				if (_var.m == 13)
				{
					_var.y += 1;
					_var.m = 1;
					_func.setYear();
				}
				_var.ym.
					children('.month').
					html(repairZero(_var.m) + '月').
					data('m', _var.m);
			}
			_var.body.
				children('.day').
				html(_that._createYmdHtml(_var.y, repairZero(_var.m)));
		}).
		// 切换到年、月面板
		on('click', _dom[1], function(){
			let _this = $(this);
			_this.
				parent().
				children('.month').
				hide();
			let _body = _this.
							parent().
							parent().
							next('.body');
			_body.
				children('div').
				hide();
			let _index = $(this).hasClass('year') ? 2 : 3;
			_body.
				children().
				eq(_index).
				css('display', 'flex');
		}).
		// 选择具体的年、月
		on('click', _dom[2], function(){
			let _this = $(this),
				_body = _this.parent().parent(),
				_head = _body.prev();
			// 选择年
			if (_this.hasClass('year'))
			{
				let _y = _this.data('y');
				_head.
					find('.year').
					html(_y + '年').
					data('y', _y);
				_this.
					parent().
					hide().
					next().
					css('display', 'flex');
			}
			// 选择月
			else
			{
				let _y = _head.find('.year').data('y');
				let _m = _this.data('m');
				_this.
					parent().
					hide().
					siblings('.week, .day').
					css('display', 'flex');
				_head.
					find('.month').
					html(repairZero(_m) + '月').
					data('m', _m).
					show();
				_body.
					children('.day').
					html(_that._createYmdHtml(_y, repairZero(_m)));
			}
			_this.
				addClass('active').
				siblings().
				removeClass('active');
		}).
		// 选择日期
		on('click', _dom[3], function(){
			let _this = $(this);
			// 不可点直接返回
			if (_this.hasClass('next')) return;
			// 双日历操作
			if (_that.param.type == 'date-range')
			{
				let _index = _that.index;
				_that.arr[_index].y = _this.data('y');
				_that.arr[_index].m = _this.data('m');
				_that.arr[_index].index = _that.index;
				_that.currentNum += 1;
				if (_that.currentNum == 3)
				{
					_that.picker.
						find('.current').
						removeClass('current');
					_that.currentNum = 1;
					_that.pindex = null;
				}
				_this.addClass('current');
				if (_that.pindex == null)
				{
					_that.pindex = _index;
				}
				else
				{
					// 两次选择的日期在同一个日历上则需要处理
					if (_index == _that.pindex)
					{
						_index = (_that.pindex == 0) ? 1 : 0;
						_that.arr[_index].y = _that.arr[_that.pindex].y;
						_that.arr[_index].m = _that.arr[_that.pindex].m;
						_that.arr[_index].index = _that.index;
					}
				}
				// 赋值当日日期
				_that.arr[_index].d = repairZero(_this.data('d'));
				// 选中的日期
				_that.arr[_index].c = parseInt(_this.data('day'));
				if (_that.currentNum == 1 || _that.currentNum == 3) return;
			}
			else
			{
				_that.arr[0].y = _this.data('y');
				_that.arr[0].m = _this.data('m');
				// 赋值当日日期
				_that.arr[0].d = repairZero(_this.data('d'));
				// 选中的日期
				_that.arr[0].c = parseInt(_this.data('day'));
				_this.
					addClass('current').
					siblings().
					removeClass('current');
			}
			// 如果有确认栏
			if (_that.param.confirm) return;
			// 赋值
			_that._setVal();
		}).
		// 底部工具栏清除
		on('click', _dom[4], function(){
			_that.inputDom.val('');
			_that.picker.
				find('.current').
				removeClass('current');
			// 重置初始化的日期数组
			_that._reset(true);
			_that.focus = false;
			_that.picker.trigger('blur');
		}).
		// 底部工具栏确定
		on('click', _dom[5], function(){
			_that._setVal();
		}).
		// 选择时间按钮点击
		on('click', _dom[6], function(){
			let _this = $(this);
			if (_this.hasClass('not-allow')) 
				return false;
			let _type = _this.data('type');
			if(_type == undefined || _type == 0)
			{
				_this.
					data('type', 1).
					html('选择日期');
				$(_that.picker).
					find('.body > div').
					hide().
					siblings('.picker-time').
					css('display', 'flex');
				return;
			}
			_this.
				data('type', 0).
				html('选择时间');
			$(_that.picker).
				find('.body > .week, .body > .day').
				css('display', 'flex').
				siblings('.picker-time').
				hide();
		}).
		// 选择时间
		on('click', _dom[7], function(){
			let _this = $(this),
			_top = _this.position().top + _this.parent()[0].scrollTop;
			if (_that.time)
			{
				// 赋值
				if (_this.hasClass('h'))
					_that.arr[_that.index].h = _this.html();
				else if (_this.hasClass('i'))
					_that.arr[_that.index].i = _this.html();
				else
					_that.arr[_that.index].s = _this.html();
			}
			_this.
				addClass('current').
				siblings().
				removeClass('current').
				parent().
				animate({
					scrollTop : _top
				}, 200);
			if (_this.parent().index() == 2)
				return;
			// 默认选中下级的第一项
			_this.
				parent().
				next('ul').
				children('li:first').
				trigger('click');
		}).
		// 快捷选择
		on('click', _dom[8], function(){
			let _this = $(this);
			if (_this.index() == 0 || 
				_this.hasClass('current')) return;
			// 年
			let _y = _that.date.getFullYear();
			// 月
			let _m = repairZero(_that.date.getMonth() + 1);
			// 日
			let _d = _that.date.getDate();
			// 需要向前的天数
			let _day = 0;
			switch(_this.index())
			{
				case 1:
					_day = 3;
				break;
				case 2:
					_day = 7;
				break;
				case 3:
					_day = 15;
				break;
				case 4:
					_day = 30;
				break;
				case 5:
					_day = 90;
				break;
				case 6:
					_day = 365;
				break;
			}
			let _unixTime = Date.parse(new Date().toString()) - 86400000 * _day,
				_date  = new Date(_unixTime),
				_fromY = _date.getFullYear(),
				_fromM = repairZero(_date.getMonth() + 1),
				_fromD = _date.getDate();
			// 私有方法，重置日历
			let _func = {
				reset : (m = 0) => {
					// 主日历
					_that.index = 0;
					let _day = _that._createYmdHtml(_fromY, _fromM);
					_that.picker.
						children('div').
						eq(1).
						find('.day').
						html(_day);
					_that.picker.
						find('.show-ym:first').
						children('.year').
						html(_fromY + '年').
						data('y', _fromY).
						next().
						html(_fromM + '月').
						data('m', _fromM);
					// 副日历
					_that.index = 1;
					let __y = _y;
					let __m = parseInt(_m) + m;
					if (__m > 12)
					{
						__m  = 1;
						__y += 1;
					}
					__m = repairZero(__m);
					_day = _that._createYmdHtml(__y, __m);
					_that.picker.
						children('div').
						eq(2).
						find('.day').
						html(_day);
					_that.picker.
						find('.show-ym:last').
						children('.year').
						html(__y + '年').
						data('y', __y).
						next().
						html(__m + '月').
						data('m', __m);
				}
			};
			_this.
				addClass('current').
				siblings().
				removeClass('current');
			_that.picker.
				find('.day .current').
				removeClass('current');
			if (_fromY == _y && _fromM == _m)
			{
				_that.picker.
					find('.day:first').
					children('[data-d="' + _d + '"]:not(.next),[data-d="' + _fromD + '"]:not(.next)').
					addClass('current');
				_that.arr[0].y = _fromY;
				_that.arr[0].m = _m;
				_fromD = repairZero(_fromD);
				_that.arr[0].d = _fromD;
				_that.arr[0].c = parseInt(_y + '' + _m + '' + _fromD);
				_that.arr[1].y = _y;
				_that.arr[1].m = _m;
				_d = repairZero(_d);
				_that.arr[1].d = _d;
				_that.arr[1].c = parseInt(_y + '' + _m + '' + _d);
				_that.arr[1].index = 0;
				_that.pindex = 0;
				// 重置日历
				let _box = _that.picker.find('.show-ym:first');
				if (_box.children('.year').data('y') != _y || 
					_box.children('.month').data('m') != _m)
				_func.reset(1);
			}
			else
			{
				_that.arr[0].y = _fromY;
				_that.arr[0].m = _fromM;
				_that.arr[0].d = _fromD;
				_that.arr[0].c = parseInt(_fromY + '' + _fromM + '' + repairZero(_fromD));
				_that.arr[1].y = _y;
				_that.arr[1].m = _m;
				_that.arr[1].d = _d;
				_that.arr[1].c = parseInt(_y + '' + _m + '' + repairZero(_d));
				_that.arr[1].index = 1;
				_that.pindex = 1;
				_func.reset();
			}
			_that.currentNum = 2;
			// 如果没有确认按钮则直接赋值
			if ( ! _that.param.confirm) 
				_that._setVal();
		}).
		on('mousedown', (e) => {
			e.preventDefault();
		});
	}

	/**
	 * 文本框赋值
	 */
	_setVal(){
		let _val  = '';
		// 私有方法
		let _func = {
			val : (index = 0, type = 0) => {
				let v = {
					index : this.arr[index],
					val : ''
				};
				v.m = v.index.m;
				v.d = v.index.d;
				if (type == 0)
				{
					// 获取真实日期
					v.val = _.replace(this.param.format, 'Y', v.index.y);
					v.val = _.replace(v.val, 'm', v.m);
					v.val = _.replace(v.val, 'd', v.d);
					// 如果有时间则继续处理真实日期
					if (this.time)
					{
						v.val = _.replace(v.val, 'H', v.index.h);
						v.val = _.replace(v.val, 'i', v.index.i);
						v.val = _.replace(v.val, 's', v.index.s);
					}
					return v.val;
				}
				v.val = v.index.y + '' + v.m + '' + v.d;
				return parseInt(v.val);
			}
		};
		// 单日历赋值
		if (this.param.type == 'date')
		{
			// 获取格式化后的日期值
			_val = _func.val();
			// 兼容直接点击确定按钮，没有选择具体日期
			if (this.arr[0].c == 0)
			{
				this.arr[this.index].c = _func.val(0, 1);
				this.picker.
					find('.day').
					find('span[data-d="' + parseInt(this.arr[0].d) + '"]:not(.next)').
					addClass('current');
			}
		}
		// 双日历赋值
		else
		{
			this.pindex = null;
			// 兼容直接点击确定按钮，没有选择具体日期
			if (this.arr[0].c == 0 || 
				this.arr[1].c == 0)
			{
				if (this.arr[0].c == 0)
					this.arr[0].c = _func.val(0, 1);
				if (this.arr[1].c == 0)
					this.arr[1].c = _func.val(1, 1);
				this.picker.
					find('.day').
					find('span[data-d="' + parseInt(this.arr[0].d) + '"]:not(.next)').
					addClass('current');
				this.currentNum = 2;
			}
			_val += (this.arr[0].c > this.arr[1].c) ? _func.val(1) : _func.val();
			_val += ' - ';
			_val += (this.arr[0].c > this.arr[1].c) ? _func.val() : _func.val(1);
		}
		this.focus = false;
		// 文本框赋值
		this.focusInput.val(_val);
		// 失去焦点
		this.picker.trigger('blur');
		if(this.inputDom.length > 1)
			this._reset(true);
		// 回调处理
		if (this.param.change != null && 
			_.isFunction(this.param.change))
			this.param.change(_val);
	}
	
}