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
		// INPUT选择器
		this.inputDom = scope(this.input);
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
		if (this.inputDom.length == 0)
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
		let [dom, zindex] = [
			createId(), ''
		];
		if (Mount.window != null)
		{
			zindex = $('#' + Mount.window).css('z-index');
			zindex = zindex == undefined ? '' : `z-index:${zindex};`;
		}
		// 组装HTML结构
		let html = `<div id="citypicker-${dom}" class="citypicker animated faster${(Mount.window) == null ? '' : ' ' + Mount.window}"`;
		if (this.param.type == 1)
		{
			html += ` style="width:472px;${zindex}">`;
			html += `<span class="title">Tips：输入城市拼音首字母可快速选择，例如：hf</span>
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
			html += `style="${zindex}"><div class="vert iscroll"></div>`;
		}
		html += `</div>`;
		body.append(html);
		this.picker = $('#citypicker-' + dom);
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
		let [_body, quick] = [
			that.picker.children('.body'),
			that.picker.children('.quick')
		];
		// 私有变量
		if (that.param.type != 1)
			_body = that.picker.children('.vert');
		// 开始监听事件
		this.inputDom.
		// 显示面板
		on('focus', function(){
			if( ! that.init)
			{
				that._formatData(_body);
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
		// 搜索
		keyup(this.inputDom, (dom, e) => {
			let v = {
				val  : dom.val(),
				key  : e.keyCode,
				html : ''
			};
			if (that.param.type == 1)
			{
				if (v.val == '' || 
					( ! (v.key > 64 && v.key < 91) && 
					v.key != 8 && 
					v.key != 32))
				{
					if (v.val == '') that._reset();
					return;
				}
				if (that.picker.is(':hidden'))
				{
					fadeIn(that.picker, dom, false);
				}
				if (quick.is(':hidden'))
				{
					that.picker.
						data('left', that.picker.css('left')).
						css('left', dom.offset().left).
						width(158).
						children('.title').
						html(' ↑ ↓ 键快速选择城市');
					that.picker.children('.header, .body').hide();
					quick.show();
				}
				$.each(cp_b, function(i, item){
					if (item.indexOf(v.val) != -1)
					{
						let arr = item.split('@');
						v.html += `<span>${arr[0]}</span>`;
					}
				});
				quick.html(v.html);
				return;
			}
			that.level = 1;
			_body.eq(0).nextAll('.vert').remove();
			if (v.val == '')
			{
				that._formatData(_body);
				return;
			}
			v.html = v.icon = '';
			if (that.param.type == 2 && 
				that.param.level > 1)
				v.icon = `<i class="ri-arrow-right-s-line"></i>`;
			$.each(cp_d, function(i, item){
				if (item.indexOf(v.val) != -1)
				{
					let arr = item.split('@');
					v.html += `<span data-c="${arr[0]}" data-i="${i}">${arr[0]}${v.icon}</span>`;
				}
			});
			_body.eq(0).html(v.html);
		});
		if (that.param.type == 1)
		{
			that.inputDom.
			on('keydown', function(event){
				if (_.indexOf([13, 38, 40], event.keyCode) == -1 || 
					quick.is(':hidden')) return;
				let span = quick.children('span');
				// 回车
				if (event.keyCode == 13)
				{
					that._setVal(span.eq(that.index).html());
					return;
				}
				// 上
				if (event.keyCode == 38)
				{
					if (that.index < 0)
						that.index = span.length - 1;
					that.index -= 1;
				}
				// 下
				if (event.keyCode == 40)
				{
					if (that.index == (span.length - 1) || 
						quick.children('.current').length == 0) 
						that.index = -1;
					that.index += 1;
				}
				if (that.index < 0)
				{
					that.scrollTop = quick[0].scrollHeight - quick.height();
					quick.scrollTop(that.scrollTop);
				}
				if (that.index == 0)
				{
					that.scrollTop = 0;
					quick.scrollTop(0);
				}
				span.
					eq(that.index).
					addClass('current').
					siblings().
					removeClass('current');
				// 滚动条跟随
				let pt = span.eq(that.index).position().top;
				if (pt > 200 && that.index >= 0)
				{
					that.scrollTop += 215;
					quick.scrollTop(that.scrollTop);
				}
				else if (pt <= 0)
				{
					that.scrollTop -= 215;
					quick.scrollTop(that.scrollTop);
				}
			});
		}
		that.picker.
		// 收起面板
		on('blur', function(){
			that.inputDom.blur();
			fadeOut(that.picker);
			clear = false;
		}).
		// 选项卡切换
		on('click', dom[0], function(){
			let _this = $(this);
			addClassExc(_this, 'current');
			that._formatData(_body, cp_a[_this.index()]);
		}).
		// 选择城市
		on('click', dom[1], function(){
			// 单城市
			that._setVal($(this).html());
		}).
		// 多级
		on('click', dom[2], function(){
			let [_this, v] = [$(this), {}];
			v.val = _this.data('c');
			if (that.param.level == 1)
			{
				that._setVal(v.val);
				return;
			}
			addClassExc(_this, 'current');
			v.parent   = _this.parent();
			that.level = v.parent.index() + 1;
			if (that.level == that.param.level)
			{
				v.val = v.doc = '';
				that.picker.find('.current').each(function(){
					v.val += v.doc + $(this).data('c');
					v.doc  = that.param.format; 
				});
				that._setVal(v.val);
				return;
			}
			else
			{
				v.parent.nextAll('.vert').remove();
			}
			v.index = _this.data('i');
			v.next  = v.parent.next('.vert');
			if (v.next.length == 0)
			{
				that.level += 1;
				that.picker.append(`<div class="vert"></div>`);
				v.next = that.picker.children('.vert:last');
				Eadmin.scroll(v.next[0]);
			}
			v.source = null;
			if (that.level == 2)
			{
				that.prov = v.index;
				v.source = cp_c[v.index].sub;
			}
			else
			{
				v.source = cp_c[that.prov].sub[v.index].sub;
			}
			that._formatData(v.next, v.source, true);
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
				for (let c in source)
					_source[c] = source[c].name;
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
				for (let c in cp_c)
					_source[c] = cp_c[c].name;
			}
		}
		let [html, icon] = ['', ''];
		if (this.param.type == 2 && 
			this.level < this.param.level)
		{
			icon = `<i class="ri-arrow-right-s-line"></i>`;
		}
		for (let i in _source)
		{
			html += `<span data-c="${_source[i]}" data-i="${i}">${_source[i]}${icon}</span>`;
		}
		box.html(html);
	}

	/**
	 * 赋值选择器
	 */
	_setVal(val = '')
	{
		this.inputDom.val(val);
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
		if (_.isFunction(this.param.change))
			this.param.change(val);
	}
	
}