/**
 * eadmin 下拉菜单组件
 */

class Dropdown{	

	constructor(dom, param){
		this.dom = dom;
		this.dropdown = null;
		// 默认参数
		let _param  = {
			// 自定义宽度
			width   : 0,
			// 显示方式
			trigger : 'click',
			// 是否固定不被清除
			fixed   : false,
			// 标题栏
			title   : '',
			// 数据
			data    : []
		}
		// 配置参数
		this.param = $.extend(_param, param);
		if (this.param.data.length == 0)
		{
			console.log('没有配置下拉菜单数据项，创建失败');
			return;
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
	 * 创建
	 */
	_create(){
		let [id, html, zindex] = [
			'dropdown-' + createId(),
			'',
			''
		];
		if (Mount.window != null)
		{
			zindex = $('#' + Mount.window).css('z-index');
			zindex = zindex == undefined ? '' : `z-index:${zindex};`;
		}
		html = `<div id="${id}" class="dropdown animated faster${this.param.fixed ? ' fixed' : ''}" style="`;
		if (this.param.width > 0)
			html += ` width:${this.param.width}px;${zindex}`;
		html += '">';
		if (this.param.title != '')
			html += `<div class="title">${this.param.title}</div>`;
		html += `<ul class="iscroll">`;
		_.each(this.param.data, (row) => {
			let [icon, disabled, checked] = [
				row.icon ? `<i class="${row.icon}"></i>` : '',
				row.disabled ? ' class="disabled"' : '',
				row.checked === true ? '' : ' dn'
			];
			if (row.divided)
			{
				html += `<li class="divided"></li>`;
			}
			else
			{
				html += `<li${disabled}>
						${icon}<span>${row.name}</span>
						<i class="ri-check-line checked${checked}"></i>
					</li>`;
			}
		});
		html += `</ul></div>`;
		body.append(html);
		this.dropdown = $('#' + id);
	}

	/**
	 * 事件
	 */
	_event(){
		let [that, trigger, timer] = [
			this,
			['click', 'contextMenu'].indexOf(this.param.trigger) != -1 ? 'mousedown' : 'mouseenter',
			null
		];
		body.
		// 显示下拉菜单
		on(trigger, this.dom, function(event){
			let _this = $(this);
			if (that.param.trigger == 'click' && 
				event.which != 1)
				return;
			if (that.param.trigger == 'contextMenu' && 
				event.which != 3)
			{
				return;
			}
			else
			{
				// 禁用系统右键
				_this.on('contextmenu', function(e){
					return false;
				});
			}
			fadeIn(that.dropdown, _this);
			that.dropdown.data('active', 1);
			if (trigger == 'mousedown')
				that.dropdown.trigger('focus');
			if (trigger == 'mouseenter' && timer != null)
				clearTimeout(timer);
			clear = true;
			return false;
		}).
		on('mouseleave', this.dom, () => {
			that.dropdown.data('active', 0);
			if (trigger == 'mouseenter')
			{
				timer = setTimeout(() => {
					fadeOut(that.dropdown);		
					clear = false;
				}, 500);
			}
		});
		if (trigger == 'mousedown')
		{
			that.dropdown.on('blur', function(){
				let _this = $(this);
				if (_this.data('active') == 1) return;
				fadeOut(_this);
				clear = false;
			});
		}
		if (trigger == 'mouseenter')
		{
			that.dropdown.
			on('mouseenter', () => {
				clearTimeout(timer);
			}).
			on('mouseleave', () => {
				timer = setTimeout(() => {
					fadeOut(that.dropdown);		
					clear = false;
				}, 500);
			});
		}
		that.dropdown.on('click', 'li:not(.disabled):not(.divided)', function(){
			let _this = $(this);
			let index = _this.index();
			let data  = that.param.data[index];
			// 可选中
			if (data.checked != undefined)
			{
				data.checked = data.checked ? false : true;
				data.checked ? _this.children('.checked').show() : _this.children('.checked').hide();
			}
			if( ! _.isFunction(data.click))
				return;
			let custom = data.custom || {};
			custom._index   = index;
			custom._checked = data.checked == undefined ? null : data.checked;
			data['click'](custom);
			if (data.checked == undefined)
				that.dropdown.hide();
		});
	}
	
}