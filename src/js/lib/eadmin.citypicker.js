/**
 * eadmin 城市组件
 */

class Citypikcer{

	constructor(dom, param){
		if (typeof city_data_init === 'undefined')
		{
			console.log('没有检测到城市选择器必须的城市数据');
			return false;
		}
		// INPUT DOM，用来给表单赋值和focus，blur事件处理
		this.input  = dom;
		// PICKER DOM缓存
		this.picker = null;
		// 当前快速选择的序号
		this.index  = 0;
		// 快速选择滚动条高度，用来滚动条跟随
		this.scrollTop = 0;
		// 是否初始化数据
		this.init  = false;
		// 当前选择的层级，用在多级城市选择中
		this.level = 1;
		// 选择的省份
		this.prov  = 0;
		// 默认参数
		let _param  = {
			// 类型
			type   : 1,
			// 格式化
			format : ' / ',
			// 级联选择深度
			level  : 3,
			// 回调
			change : null
		}
		// 配置参数
		this.param = $.extend(_param, param);
		// 校验
		if ($(this.input).length == 0)
		{
			console.log('当前页面中不包含' + this.input + '元素，创建失败');
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
		// 事件执行
		this._event();
	}

	/**
	 * 创建结构
	 */
	_create(){
		// 过滤选择器中的符号
		let _dom = _.replace(this.input, '#', '');
		_dom = _.replace(_dom, '.', '');
		if ($('#citypicker-' + _dom).length > 0)
			$('#citypicker-' + _dom).remove();
		// 组装HTML结构
		let _html = '<div id="citypicker-' + _dom + '" class="citypicker animated faster dn"';
		if (this.param.type == 1)
		{
			_html += ' style="width:472px;">';
			_html += `<span class="title">Tips：输入城市拼音首字母可快速选择，例如：hf</span>
			<div class="header">
				<span class="current">热门</span>
				<span>ABC</span>
				<span>DEF</span>
				<span>GHI</span>
				<span>JKL</span>
				<span>MNO</span>
				<span>PQR</span>
				<span>STU</span>
				<span>VWX</span>
				<span>YZ</span>
			</div>
			<div class="body"></div>
			<div class="quick iscroll dn"></div>`;
		}
		else
		{
			_html += '>';
			_html += `<div class="vert iscroll"></div>`;
		}
		_html += `</div>`;
		body.append(_html);
		this.picker = $('#citypicker-' + _dom);
		if (this.param.type == 2)
			this.picker.css('padding', '5px');
	}

	/**
	 * 事件
	 */
	_event(){
		let that = this;
		// 定义需要响应事件的DOM
		let dom = [
			// 选项卡
			'.header span:not(.current):not(.not-allow)',
			// 城市
			'.body span, .quick span',
			// 多级
			'.vert span'
		];
		let v = {};
		// 私有变量
		if (that.param.type == 1)
		{
			v = {
				body   : that.picker.children('.body'),
				header : that.picker.children('.header'),
				quick  : that.picker.children('.quick')
			};
		}
		else
		{
			v = {
				body : that.picker.children('.vert')
			};
		}
		// 开始监听事件
		$(this.input).
		// 显示面板
		on('focus', function(){
			if( ! that.init)
			{
				that._formatData(v.body);
				that.init = true;
			}
			fadeIn(that.picker, $(this), false);
			clear = true;
		}).
		// 隐藏面板
		on('blur', function(){
			if (that.focus) return;
			fadeOut(that.picker);
			clear = false;
		});
		keyup(that.input, (dom, e) => {
			let _v = {
				val : dom.val(),
				key : e.keyCode
			};
			if (that.param.type == 1)
			{
				if (_v.val == '' || 
					( ! (_v.key > 64 && _v.key < 91) && 
					_v.key != 8 && 
					_v.key != 32))
				{
					if (_v.val == '') that._reset();
					return;
				}
				if (that.picker.is(':hidden'))
				{
					fadeIn(that.picker, dom, false);
				}
				if (v.quick.is(':hidden'))
				{
					that.picker.
						data('left', that.picker.css('left')).
						css('left', dom.offset().left).
						width(158).
						children('.title').
						html(' ↑ ↓ 键快速选择城市');
					that.picker.
						children('.header, .body').
						hide();
					that.picker.
						children('.quick').
						show();
				}
				_v.html = '';
				$.each(cp_b, function(i, item){
					if (item.indexOf(_v.val) != -1)
					{
						let _arr = item.split('@');
						_v.html += `<span>${_arr[0]}</span>`;
					}
				});
				that.picker.
					children('.quick').
					html(_v.html);
				return;
			}
			that.level = 1;
			that.picker.
				children('.vert:first').
				nextAll('.vert').
				remove();
			if (_v.val == '')
			{
				that._formatData(v.body);
				return;
			}
			_v.html = '';
			_v.icon = '';
			if (that.param.type == 2 && 
				that.param.level > 1)
			{
				_v.icon = `<i class="fa fa-angle-right"></i>`;
			}
			$.each(cp_d, function(i, item){
				if (item.indexOf(_v.val) != -1)
				{
					let _arr = item.split('@');
					_v.html += `<span data-c="${_arr[0]}" data-i="${i}">${_arr[0]}${_v.icon}</span>`;
				}
			});
			that.picker.
				children('.vert:first').
				html(_v.html);
		});
		if (that.param.type == 1)
		{
			$(that.input).
			on('keydown', function(event){
				if (_.indexOf([13, 38, 40], event.keyCode) == -1 || 
					v.quick.is(':hidden'))
				{
					return;
				}
				let _span = v.quick.children('span');
				// 回车
				if (event.keyCode == 13)
				{
					that._setVal(_span.eq(that.index).html());
					return;
				}
				// 上
				if (event.keyCode == 38)
				{
					if (that.index < 0)
						that.index = _span.length - 1;
					that.index -= 1;
				}
				// 下
				if (event.keyCode == 40)
				{
					if (that.index == (_span.length - 1) || 
						v.quick.children('.current').length == 0) 
						that.index = -1;
					that.index += 1;
				}
				if (that.index < 0)
				{
					that.scrollTop = v.quick[0].scrollHeight - v.quick.height();
					v.quick.scrollTop(that.scrollTop);
				}
				if (that.index == 0)
				{
					that.scrollTop = 0;
					v.quick.scrollTop(0);
				}
				_span.
					eq(that.index).
					addClass('current').
					siblings().
					removeClass('current');
				// 滚动条跟随
				let _pt = _span.eq(that.index).position().top;
				if (_pt > 200 && that.index >= 0)
				{
					that.scrollTop += 215;
					v.quick.
						scrollTop(that.scrollTop);
				}
				else if (_pt <= 0)
				{
					that.scrollTop -= 215;
					v.quick.
						scrollTop(that.scrollTop);
				}
			});
		}
		that.picker.
		// 收起面板
		on('blur', function(){
			$(that.input).blur();
			fadeOut(that.picker);
			clear = false;
		}).
		// 选项卡切换
		on('click', dom[0], function(){
			let _v = {
				this : $(this)
			};
			_v.city = cp_a[_v.this.index()];
			addClassExc(_v.this, 'current');
			that._formatData(v.body, _v.city);
		}).
		// 选择城市
		on('click', dom[1], function(){
			// 单城市
			that._setVal($(this).html());
		}).
		// 多级
		on('click', dom[2], function(){
			let _v = {
				this : $(this)
			};
			_v.val = _v.this.data('c');
			if (that.param.level == 1)
			{
				that._setVal(_v.val);
				return;
			}
			addClassExc(_v.this, 'current');
			_v.parent  = _v.this.parent();
			that.level = _v.parent.index() + 1;
			if (that.level == that.param.level)
			{
				_v.val = '';
				_v.doc = '';
				that.picker.find('.current').each(function(){
					_v.val += _v.doc + $(this).data('c');
					_v.doc = that.param.format; 
				});
				that._setVal(_v.val);
				return;
			}
			else
			{
				_v.parent.
					nextAll('.vert').
					remove();
			}
			_v.index = _v.this.data('i');
			_v.next  = _v.parent.next('.vert');
			if (_v.next.length == 0)
			{
				that.level += 1;
				that.picker.append(`<div class="vert ml5"></div>`);
				_v.next = that.picker.children('.vert:last');
				Eadmin.scroll(_v.next[0]);
			}
			_v.source = null;
			if (that.level == 2)
			{
				that.prov = _v.index;
				_v.source = cp_c[_v.index].sub;
			}
			else
			{
				_v.source = cp_c[that.prov].sub[_v.index].sub;
			}
			that._formatData(_v.next, _v.source, true);
		}).
		on('mousedown', (e) => {
			e.preventDefault();
		});
	}

	/**
	 * 格式化输出需要的城市数据
	 */
	_formatData(box, source = null, format = false){
		let _source;
		if (source != null)
		{
			_source = [];
			if ( ! format)
			{
				_source = source;
			}
			else
			{
				for (let _c in source)
					_source[_c] = source[_c].name;
			}
		}
		else
		{
			if (this.param.type == 1)
			{
				_source = cp_a[0];
			}
			else
			{
				_source = [];
				for (let _c in cp_c)
					_source[_c] = cp_c[_c].name;
			}
		}
		let _html = '';
		let _icon = '';
		if (this.param.type == 2 && 
			this.level < this.param.level)
		{
			_icon = `<i class="fa fa-angle-right"></i>`;
		}
		for (let _i in _source)
		{
			_html += `<span data-c="${_source[_i]}" data-i="${_i}">${_source[_i]}${_icon}</span>`;
		}
		box.html(_html);
	}

	/**
	 * 赋值选择器
	 */
	_setVal(val = '')
	{
		$(this.input).val(val);
		this.focus = false;
		this.picker.trigger('blur');
		// 回调
		this._callback(val);
		if (this.param.type == 2)
		{
			return;
		}
		if (this.picker.children('.quick').is(':hidden'))
		{
			return;
		}
		setTimeout(() => {
			this._reset();
		}, 500);
	}

	/**
	 * 重置选择器
	 */
	_reset()
	{
		this.picker.
			width(450).
			children('.title').
			html('Tips：输入城市拼音首字母可快速选择，例如：hf');
		if (this.picker.data('left') != undefined)
			this.picker.
				css('left', this.picker.data('left'));
		this.picker.
			children('.header, .body').
			show();
		this.picker.
			children('.quick').
			hide();
	}

	/**
	 * 回调处理
	 */
	_callback(val){
		// 回调处理
		if (this.param.change != null && 
			_.isFunction(this.param.change))
			this.param.change(val);
	}
	
}