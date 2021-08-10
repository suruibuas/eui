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
			type     : 'date',
			// 格式化
			format   : 'Y-m-d',
			// 是否需要确认按钮
			confirm  : false,
			// 回调
			change   : null,
			// 开始时间
			start    : 0,
			// 结束时间
			end      : 0,
			// 快捷选择
			quick    : false,
			// unixtime
			unixtime : false,
			// 默认日期
			default  : []
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
		let [dom, zindex] = [
			createId(), ''
		];
		if (Mount.window != null)
		{
			zindex = $('#' + Mount.window).css('z-index');
			zindex = zindex == undefined ? '' : `style="z-index:${zindex};"`;
		}
		// 组装HTML结构
		let html = `<div id="datepicker-${dom}" ${zindex} class="datepicker animated faster${(Mount.window) == null ? '' : ' ' + Mount.window}">`;
		html += `<div class="quick">
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
			</span>`;
		html += `</div>
			<div class="body">
				<div class="week">
					${this._week()}
				</div>
				<div class="day"></div>`;
		html += `<div class="y-m">
			${this._year()}
		</div>
		<div class="y-m">
			${this._month()}
		</div>`;
		if(this.param.format.indexOf(' ') != -1)
		{
			html += `<div class="picker-time">
						${this._time()}
					</div>`;
		}
		html += `</div></div>`;
		html += `<div class="datepicker-panel right" data-index="1">
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
		html += `<div class="y-m">
			${this._year(parseInt(this.arr[0].m) + 1)}
		</div>
		<div class="y-m">
			${this._month(parseInt(this.arr[0].m) + 1)}
		</div>`;
		if(this.param.format.indexOf(' ') != -1)
		{
			html += `<div class="picker-time">
						${this._time()}
					</div>`;
		}
		html += `</div></div>`;
		html += `<div class="clear"></div>`;
		html += `<div class="footer">
			<span class="font choose-time">
				选择时间
			</span>
			<span class="confirm">
				<button class="clear small">清空</button>
				<button class="hl small sure">确定</button>
			</span>
		</div>`;
		html += `</div>`;
		body.append(html);
		// 缓存DOM
		this.picker = $('#datepicker-' + dom);
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
		// 默认值
		if (this.param.default.length > 0)
		{
			let format = '';
			format = _.replace(this.param.format, 'Y', '%y');
			format = _.replace(format, 'm', '%M');
			format = _.replace(format, 'd', '%d');
			if (this.time)
			{
				format = _.replace(format, 'H', '%h');
				format = _.replace(format, 'i', '%m');
				format = _.replace(format, 's', '%s');
			}
			if (this.param.unixtime)
				this.inputDom.data('default-date', _.join(this.param.default, ','));
			for (let i in this.param.default)
			{
				if (format == '')
					continue;
				this.param.default[i] = Time(this.param.default[i], format);
			}
			if ( ! this.param.unixtime)
				this.inputDom.data('default-date', _.join(this.param.default, ','));
			this.inputDom.val(_.join(this.param.default, ' - '));
		}
		// 局部变量统一定义
		let v = {
			// 文本框的内容取值
			val    : this.inputDom.val(),
			// 主日历（左侧日历，默认显示的）
			picker : this.picker.children('div').eq(1),
		};
		// 主日历头部
		v.header = v.picker.children('.header');
		// 私有方法
		let func = {
			setYear : (dom = v.header, y = this.arr[0].y) => {
				dom.find('.year').data('y', y).html(y + '年');
			},
			setMonth : (dom = v.header, m = this.arr[0].m) => {
				dom.find('.month').data('m', m).html(m + '月');
			}
		};
		// 年份显示
		func.setYear();
		// 月份显示
		func.setMonth();
		// 显示日期
		v.picker.
			find('.day').
			html(this._createYmdHtml(this.arr[0].y, this.arr[0].m));
		// 双日历处理
		if(this.param.type == 'date-range')
		{
			// 副日历
			v.range = v.picker.next();
			v.range.show();
			v.rangeHeader = v.range.children('.header');
			// 年份显示
			func.setYear(v.rangeHeader, this.arr[1].y);
			// 月份显示
			func.setMonth(v.rangeHeader, this.arr[1].m);
			// 显示日期
			v.range.
				find('.day').
				html(this._createYmdHtml(this.arr[1].y, this.arr[1].m));
		}
		// 显示底部工具栏
		if (this.param.confirm)
			this.picker.find('.footer').show();
		// 如果不需要时分秒则返回
		if ( ! this.time)
			return;
		// 选择时间按钮
		v.chooseTime = this.picker.find('.choose-time');
		// 显示选择时间按钮
		v.chooseTime.show();
		// 判断是否需要显示完整的时分秒
		v.arr = _.words(this.param.format, /[His]/g);
		if (v.arr.length < 2)
		{
			console.log('日期如果包含时间的话则至少需要时和分两个参数');
			return;
		}
		// 时分秒默认值赋值
		if (v.val != '')
		{
			v.picker.find('.h' + this.h).addClass('current');
			v.picker.find('.i' + this.i).addClass('current');
			v.picker.find('.s' + this.s).addClass('current');
		}
		// 如果不需要秒数则移除选择秒的那一栏
		if (v.arr.length == 2)
		{
			v.picker.find('.picker-time ul:last').remove();
			if (this.param.type == 'date-range')
				v.range.find('.picker-time ul:last').remove();
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
			v.y.html(this.arr[0].y + '年').data('y', this.arr[0].y);
		}
		if (v.m.data('m') != this.arr[0].m)
		{
			v.m.html(this.arr[0].m + '月').data('m', this.arr[0].m);
		}
		if (v.y != this.arr[0].y || 
			v.m != this.arr[0].m)
		{
			v.day.eq(0).html(this._createYmdHtml(this.arr[0].y, this.arr[0].m));
		}
		if (this.param.type == 'date-range')
		{
			v.y = v.ym.eq(1).children('.year');
			v.m = v.ym.eq(1).children('.month');
			if (v.y.data('y') != this.arr[1].y)
				v.y.html(this.arr[1].y + '年').data('y', this.arr[1].y);
			if (v.m.data('m') != this.arr[1].m)
				v.m.html(this.arr[1].m + '月').data('m', this.arr[1].m);
			if (v.y != this.arr[1].y || 
				v.m != this.arr[1].m)
				v.day.eq(1).html(this._createYmdHtml(this.arr[1].y, this.arr[1].m));
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
		let v = {
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
		v.firstWeekDay += 1;
		// 循环天数
		for(let i = 1; i < 43; i++)
		{
			let [current, _class, today] = [
				'', '', 0
			];
			// 如果i小于第一天的天数则用上个月的天数补足
			if (i < v.firstWeekDay)
			{
				v.realDay  = v.prevMonthDay - (v.firstWeekDay - i);
				v.realDay += 1;
				_class = ' class="next"';
			}
			else if (i - v.firstWeekDay >= v.monthDay)
			{
				if (i - v.firstWeekDay == v.monthDay) 
					v.realDay = 1;
				_class = ' class="next"';
			}
			else
			{
				// 当天日期
				today = parseInt(y + '' + m + '' + repairZero(i - v.firstWeekDay + 1));
				if (today == this.today)
					current = '<div></div>';
				if (this.param.type == 'date')
				{
					if (today == this.arr[this.index].c)
						_class = ' class="current"';
				}
				else
				{
					if (this.arr[this.index].index == this.index && 
						this.arr[this.index].c == today)
					{
						_class = ' class="current"';
					}
					let index = this.index == 1 ? 0 : 1;
					if (this.arr[index].index == this.index && 
						this.arr[index].c == today)
					{
						_class = ' class="current"';
					}
				}
				if (i == v.firstWeekDay)
					v.realDay = 1;
			}
			// 判断开始结束日期
			if ((v.start > 0 || v.end > 0) && 
				_class != ' class="next"')
			{
				if (v.start > 0)
				{
					if (today < v.start)
						_class = ' class="next"';
				}
				if (v.end > 0)
				{
					if (today > v.end)
						_class = ' class="next"';
				}
			}
			v.html += `<span${_class} data-day="${today}" data-y="${y}" data-m="${m}" data-d="${v.realDay}">
							${current}${v.realDay}
						</span>`;
			v.realDay++;
		}
		return v.html;
	}

	/**
	 * 获取当前月份的天数
	 * @param {*} y 
	 * @param {*} m 
	 */
	_getMonthDay(y = '', m = ''){
		m = (m < 0) ? 11 : m;
		// 判断当前年是不是闰年
		let Feb = (y % 4 == 0 && 
					y % 100 != 0 || 
					y % 400 == 0) ? 29 : 28,
			arr = new Array();
		arr[0]  = 31;
		arr[1]  = Feb;
		arr[2]  = 31;
		arr[3]  = 30;
		arr[4]  = 31;
		arr[5]  = 30;
		arr[6]  = 31;
		arr[7]  = 31;
		arr[8]  = 30;
		arr[9]  = 31;
		arr[10] = 30;
		arr[11] = 31;
		return arr[m];
	}

	/**
	 * 星期
	 */
	_week(){
		let html = '',
			week = [
				'日', '一', '二', '三', '四', '五', '六'
			];
		for (let i in week)
			html += `<span>${week[i]}</span>`;
		return html;
	}
	
	/**
	 * 年份
	 */
	_year(m = ''){
		let y = parseInt(this.arr[0].y);
		if (m === 12) y += 1;
		let html = '';
		for (let i = y + 1; i > (parseInt(this.arr[0].y) - 11); i--)
		{
			let active = (y == i) ? ' active' : '';
			html += `<div class="year${active}" data-y="${i}">${i}</div>`;
		}
		return html;
	}

	/**
	 * 月份
	 */
	_month(m = ''){
		let _m = (m == '') ? +this.arr[0].m : m;
		if (_m > 12) _m = 1;
		let html = '';
		for (let i = 1; i < 13; i++)
		{
			let active = (_m == i) ? ' active' : '';
			html += `<div class="month${active}" data-m="${i}">${i}月</div>`;
		}
		return html;
	}

	/**
	 * 时间
	 */
	_time(){
		let html = '<ul class="iscroll">';
		for (let i = 0; i < 24; i++)
		{
			i = repairZero(i);
			html += '<li class="h' + i + ' h">' + i + '</li>';
		}
		html += '</ul><ul class="i iscroll">';
		for (let i = 0; i < 60; i++)
		{
			i = repairZero(i);
			html += '<li class="i' + i + ' i">' + i + '</li>';
		}
		html += '</ul><ul class="s iscroll">';
		for (let i = 0; i < 60; i++)
		{
			i = repairZero(i);
			html += '<li class="s' + i + ' s">' + i + '</li>';
		}
		html += '</ul>';
		return html;
	}

	/**
	 * 交互事件
	 */
	_event(){
		// 定义需要响应事件的DOM
		let dom = [
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
		let that = this;
		// 开始监听事件
		that.inputDom.
		// 显示日期面板
		on('focus', function(){
			let _this = $(this);
			fadeIn(that.picker, _this, false);
			that.focusInput = _this;
			clear = true;
		}).
		// 隐藏日期面板
		on('blur', function(){
			fadeOut(that.picker);
			that.focusInput = null;
			clear = false;
			let _this = $(this);
			if (_this.val() != '')
				return;
			if (_this.next('input').length == 0)
				return;
			_this.next('input').val('');
		});
		this.picker.
		// 收起面板
		on('blur', function(){
			that.focusInput.blur();
			that.focusInput = null;
			fadeOut(that.picker);
			clear = false;
		}).
		// 日历索引
		on('mouseenter', '>.datepicker-panel', function(){
			that.index = $(this).data('index');
		}).
		// 上年、上月、下年、下月
		on('click', dom[0], function(){
			let _this = $(this);
			// 定义私有变量
			let v = {
				body : _this.parent().next('.body'),
				ym   : _this.siblings('.show-ym')
			};
			v.y = v.ym.children('.year').data('y');
			v.m = parseInt(v.ym.children('.month').data('m'));
			// 私有方法
			let func = {
				// 设置选中的年
				setYear : () => {
					v.ym.children('.year').data('y', v.y).html(v.y + '年');
				}
			};
			// 上一年
			if(_this.hasClass('prev-year'))
			{
				v.y -= 1;
				func.setYear();
			}
			// 上一月
			else if (_this.hasClass('prev-month'))
			{
				v.m -= 1;
				if (v.m == 0)
				{
					v.y -=1;
					v.m = 12;
					func.setYear();
				}
				v.ym.children('.month').html(repairZero(v.m) + '月').data('m', v.m);
			}
			// 下一年
			else if (_this.hasClass('next-year'))
			{
				v.y += 1;
				func.setYear();
			}
			// 下一月
			else
			{
				v.m += 1;
				if (v.m == 13)
				{
					v.y += 1;
					v.m = 1;
					func.setYear();
				}
				v.ym.children('.month').html(repairZero(v.m) + '月').data('m', v.m);
			}
			v.body.children('.day').html(that._createYmdHtml(v.y, repairZero(v.m)));
		}).
		// 切换到年、月面板
		on('click', dom[1], function(){
			let _this = $(this);
			_this.parent().children('.month').hide();
			let body = _this.parent().parent().next('.body');
			body.children('div').hide();
			let index = $(this).hasClass('year') ? 2 : 3;
			body.children().eq(index).css('display', 'flex');
		}).
		// 选择具体的年、月
		on('click', dom[2], function(){
			let _this = $(this),
				body  = _this.parent().parent(),
				head  = body.prev();
			// 选择年
			if (_this.hasClass('year'))
			{
				let y = _this.data('y');
				head.find('.year').html(y + '年').data('y', y);
				_this.parent().hide().next().css('display', 'flex');
			}
			// 选择月
			else
			{
				let y = head.find('.year').data('y');
				let m = _this.data('m');
				_this.parent().hide().siblings('.week, .day').css('display', 'flex');
				head.find('.month').html(repairZero(m) + '月').data('m', m).show();
				body.children('.day').html(that._createYmdHtml(y, repairZero(m)));
			}
			addClassExc(_this, 'active');
		}).
		// 选择日期
		on('click', dom[3], function(){
			let _this = $(this);
			// 不可点直接返回
			if (_this.hasClass('next')) return;
			// 双日历操作
			if (that.param.type == 'date-range')
			{
				let index = that.index;
				that.arr[index].y 	  = _this.data('y');
				that.arr[index].m 	  = _this.data('m');
				that.arr[index].index = that.index;
				that.currentNum += 1;
				if (that.currentNum == 3)
				{
					that.picker.find('.current').removeClass('current');
					that.currentNum = 1;
					that.pindex = null;
				}
				_this.addClass('current');
				if (that.pindex == null)
				{
					that.pindex = index;
				}
				else
				{
					// 两次选择的日期在同一个日历上则需要处理
					if (index == that.pindex)
					{
						index = (that.pindex == 0) ? 1 : 0;
						that.arr[index].y 	  = that.arr[that.pindex].y;
						that.arr[index].m 	  = that.arr[that.pindex].m;
						that.arr[index].index = that.index;
					}
				}
				// 赋值当日日期
				that.arr[index].d = repairZero(_this.data('d'));
				// 选中的日期
				that.arr[index].c = parseInt(_this.data('day'));
				if (that.currentNum == 1 || that.currentNum == 3) return;
			}
			else
			{
				that.arr[0].y = _this.data('y');
				that.arr[0].m = _this.data('m');
				// 赋值当日日期
				that.arr[0].d = repairZero(_this.data('d'));
				// 选中的日期
				that.arr[0].c = parseInt(_this.data('day'));
				addClassExc(_this, 'current');
			}
			// 如果有确认栏
			if (that.param.confirm) return;
			// 赋值
			that._setVal();
		}).
		// 底部工具栏清除
		on('click', dom[4], function(){
			that.inputDom.val('');
			that.picker.find('.current').removeClass('current');
			// 重置初始化的日期数组
			that._reset(true);
			that.focus = false;
			that.picker.trigger('blur');
		}).
		// 底部工具栏确定
		on('click', dom[5], function(){
			that._setVal();
		}).
		// 选择时间按钮点击
		on('click', dom[6], function(){
			let _this = $(this);
			if (_this.hasClass('not-allow')) 
				return false;
			let type = _this.data('type');
			if(type == undefined || type == 0)
			{
				_this.data('type', 1).html('选择日期');
				$(that.picker).
					find('.body > div').
					hide().
					siblings('.picker-time').
					css('display', 'flex');
				return;
			}
			_this.
				data('type', 0).
				html('选择时间');
			$(that.picker).
				find('.body > .week, .body > .day').
				css('display', 'flex').
				siblings('.picker-time').
				hide();
		}).
		// 选择时间
		on('click', dom[7], function(){
			let _this = $(this),
			top = _this.position().top + _this.parent()[0].scrollTop;
			if (that.time)
			{
				// 赋值
				if (_this.hasClass('h'))
					that.arr[that.index].h = _this.html();
				else if (_this.hasClass('i'))
					that.arr[that.index].i = _this.html();
				else
					that.arr[that.index].s = _this.html();
			}
			_this.
				addClass('current').
				siblings().
				removeClass('current').
				parent().
				animate({scrollTop : top}, 200);
			if (_this.parent().index() == 2)
				return;
			// 默认选中下级的第一项
			_this.parent().next('ul').children('li:first').trigger('click');
		}).
		// 快捷选择
		on('click', dom[8], function(){
			let _this = $(this);
			if (_this.index() == 0 || 
				_this.hasClass('current')) return;
			// 年
			let y   = that.date.getFullYear();
			// 月
			let m   = repairZero(that.date.getMonth() + 1);
			// 日
			let d   = that.date.getDate();
			// 需要向前的天数
			let day = 0;
			switch(_this.index())
			{
				case 1:
					day = 3;
				break;
				case 2:
					day = 7;
				break;
				case 3:
					day = 15;
				break;
				case 4:
					day = 30;
				break;
				case 5:
					day = 90;
				break;
				case 6:
					day = 365;
				break;
			}
			let unixTime = Date.parse(new Date().toString()) - 86400000 * day,
				date  	 = new Date(unixTime),
				fromY    = date.getFullYear(),
				fromM    = repairZero(date.getMonth() + 1),
				fromD    = date.getDate();
			// 私有方法，重置日历
			let func = {
				reset : (_m = 0) => {
					// 主日历
					that.index = 0;
					let day = that._createYmdHtml(fromY, fromM);
					that.picker.
						children('div').
						eq(1).
						find('.day').
						html(day);
					that.picker.
						find('.show-ym:first').
						children('.year').
						html(fromY + '年').
						data('y', fromY).
						next().
						html(fromM + '月').
						data('m', fromM);
					// 副日历
					that.index = 1;
					let __y = y;
					let __m = parseInt(m) + _m;
					if (__m > 12)
					{
						__m  = 1;
						__y += 1;
					}
					__m = repairZero(__m);
					day = that._createYmdHtml(__y, __m);
					that.picker.
						children('div').
						eq(2).
						find('.day').
						html(day);
					that.picker.
						find('.show-ym:last').
						children('.year').
						html(__y + '年').
						data('y', __y).
						next().
						html(__m + '月').
						data('m', __m);
				}
			};
			addClassExc(_this, 'current');
			that.picker.find('.day .current').removeClass('current');
			if (fromY == y && fromM == m)
			{
				that.picker.
					find('.day:first').
					children('[data-d="' + d + '"]:not(.next),[data-d="' + fromD + '"]:not(.next)').
					addClass('current');
				that.arr[0].y = fromY;
				that.arr[0].m = m;
				fromD = repairZero(fromD);
				that.arr[0].d = fromD;
				that.arr[0].c = parseInt(y + '' + m + '' + fromD);
				that.arr[1].y = y;
				that.arr[1].m = m;
				d = repairZero(d);
				that.arr[1].d = d;
				that.arr[1].c = parseInt(y + '' + m + '' + d);
				that.arr[1].index = 0;
				that.pindex = 0;
				// 重置日历
				let box = that.picker.find('.show-ym:first');
				if (box.children('.year').data('y') != y || 
					box.children('.month').data('m') != m)
				func.reset(1);
			}
			else
			{
				that.arr[0].y = fromY;
				that.arr[0].m = fromM;
				fromD = repairZero(fromD);
				that.arr[0].d = fromD;
				that.arr[0].c = parseInt(fromY + '' + fromM + '' + fromD);
				that.arr[1].y = y;
				that.arr[1].m = m;
				d = repairZero(d);
				that.arr[1].d = d;
				that.arr[1].c = parseInt(y + '' + m + '' + d);
				that.arr[1].index = 1;
				that.pindex = 1;
				func.reset();
			}
			that.currentNum = 2;
			// 如果没有确认按钮则直接赋值
			if ( ! that.param.confirm) 
				that._setVal();
		}).
		on('mousedown', (e) => {
			e.preventDefault();
		});
	}

	/**
	 * 文本框赋值
	 */
	_setVal(){
		let val  = '';
		// 私有方法
		let func = {
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
			val = func.val();
			// 兼容直接点击确定按钮，没有选择具体日期
			if (this.arr[0].c == 0)
			{
				this.arr[this.index].c = func.val(0, 1);
				this.picker.
					find('.day').
					find('span[data-d="' + parseInt(this.arr[0].d) + '"]:not(.next)').
					addClass('current');
			}
			this.focusInput.val(val);
			// 文本框赋值
			// 是否转成时间戳
			if (this.param.unixtime)
			{
				if ( ! this.time) val += ' 00:00:00';
					val = Date.parse(new Date(val)) / 1000;
			}
			if (this.focusInput.next('input').length == 0)
			{
				let name = this.focusInput.attr('name');
				if (name == undefined)
				{
					console.log('没有为日期文本框指定name属性，这将影响后端取值');
				}
				else
				{
					this.focusInput.
						removeAttr('name').
						after(`<input type="hidden" name="${name}" value="${val}">`);
				}
			}
			else
			{
				this.focusInput.next('input').val(val);
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
					this.arr[0].c = func.val(0, 1);
				if (this.arr[1].c == 0)
					this.arr[1].c = func.val(1, 1);
				this.picker.
					find('.day').
					find('span[data-d="' + parseInt(this.arr[0].d) + '"]:not(.next)').
					addClass('current');
				this.currentNum = 2;
			}
			let from = this.arr[0].c > this.arr[1].c ? func.val(1) : func.val();
			let to   = this.arr[0].c > this.arr[1].c ? func.val() : func.val(1);
			val += from + ' - ' + to;
			// 文本框赋值
			this.focusInput.val(val);
			// 是否转成时间戳
			if (this.param.unixtime)
			{
				if ( ! this.time)
				{
					from += ' 00:00:00';
					to   += ' 23:59:59';
				}
				from = Date.parse(new Date(from)) / 1000;
				to   = Date.parse(new Date(to)) / 1000;
			}
			val = from + ',' + to;
			if (this.focusInput.next('input').length == 0)
			{
				let name = this.focusInput.attr('name');
				if (name == undefined)
				{
					console.log('没有为日期文本框指定name属性，这将影响后端取值');
				}
				else
				{
					this.focusInput.
						removeAttr('name').
						after(`<input type="hidden" name="${name}" value="${val}">`);
				}
			}
			else
			{
				this.focusInput.next('input').val(val);
			}
		}
		this.focus = false;
		// 失去焦点
		this.picker.trigger('blur');
		if(this.inputDom.length > 1)
			this._reset(true);
		// 回调处理
		if (_.isFunction(this.param.change))
			this.param.change(val);
	}
	
}