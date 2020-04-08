/**
 * eadmin 弹窗组件
 */

class Window{

	constructor(dom, param, bind = true){
		// 窗口
		this.window = null;
		this.windowDom = '';
		// 选择器原始DOM名称，用来做事件绑定用
		this.dom    = dom;
		// 鼠标X轴
		this.x      = 0;
		// 鼠标Y轴
		this.y		= 0;
		// 窗口的top值
		this.top    = 0;
		// 窗口的left值
		this.left   = 0;
		// 是否绑定dom元素的点击事件，如果设置为false，则可以手动调用click来触发弹窗
		// 用在一个页面有多个相同弹窗只是参数不同的情况下，例如列表页
		this.bind   = bind;
		// 默认参数
		let _param  = {
			// 弹窗页面地址
			url     : '',
			// 每次打开都刷新
			refresh : false,
			// 模式，iframe、load
			model   : 'load',
			// 宽度
			width   : module.conf.window_width,
			// 高度
			height  : module.conf.window_height,
			// 标题
			title   : module.conf.window_title,
			// 是否可拖动
			drag    : true,
			// 按钮栏
			btn     : [],
			// 关闭回调
			close   : null,
			// 提交表单回调
			submit  : null
		}
		// 配置参数
		this.param = $.extend(true, _param, param);
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
		// 私有变量
		let v = {
			// 宽度
			width  : 0,
			// 高度
			height : 0,
			// 样式
			style  : '',
			// 拖动
			drag   : '',
			// HTML
			html   : ''
		};
		// 过滤选择器中的符号
		v.dom = _.replace(this.dom, '#', '');
		v.dom = _.replace(v.dom, '.', '');
		// 窗口原始DOM名称
		this.windowDom = '#window-' + v.dom;
		// 选择器缓存
		this.window = $(this.windowDom);
		if ( ! this.bind)
		{
			if (this.window.length > 0)
				this.window.off().remove();
		}
		// 真实宽度高度
		if (_.isInteger(this.param.width) || 
			this.param.width.indexOf('%') == -1)
		{
			v.width = this.param.width;
		}
		else
		{
			v.width = innerW() * (parseInt(this.param.width.replace('%', '')) / 100);
		}
		if (_.isInteger(this.param.height) || 
			this.param.height.indexOf('%') == -1)
		{
			v.height = this.param.height;
		}
		else
		{
			v.height = innerH() * (parseInt(this.param.height.replace('%', '')) / 100);
		}
		// 制定样式
		v.style = `style="width:${v.width}px;height:${v.height}px;margin-left:-${v.width / 2}px;margin-top:-${v.height / 2}px;"`;
		// 是否可以拖动
		if (this.param.drag)
			v.drag = ' style="cursor: move;"';
		// 窗口主体高度
		v.height -= 55;
		if (this.param.btn.length > 0)
			v.height -= 45;
		// 窗口骨架
		v.html = `<div id="window-${v.dom}" 
						data-refresh="${this.param.refresh}" 
						class="window animated faster dn" ${v.style}>
					<div class="window-loading dn">
						<i class="fa fa-spinner fa-pulse mr5"></i>页面加载中，请稍候...
					</div>
					<div class="window-close">
						<i class="fa fa-times-circle"></i>
					</div>
					<div class="title"${v.drag}>
						<span>${this.param.title}</span>
					</div>
					<div class="body" style="height:${v.height}px;"></div>`;
		// 按钮栏
		if (this.param.btn.length > 0)
		{
			v.html += `<div class="btnbar">`;
			_.each(this.param.btn, (row) => {
				let loading = (['cancel', 'refresh'].indexOf(row.action) == -1) ? ' data-loading="执行中..."' : '';
				v.html += `<button
								${_.has(row, 'highlight') ? ' class="highlight"' : ''}
								${loading}${row.action == 'submit' ? ' data-submit' : ''}>
							${row.name}
							</button>`;
			});
			v.html += `</div>`;
		}
		v.html += `</div>`;
		body.append(v.html);
		// 选择器缓存
		this.window = $(this.windowDom);
	}

	/**
	 * 事件
	 */
	_event(){
		let that = this;
		// 私有变量
		let v  = {
			// 标题栏
			title : that.window.children('.title'),
			// 内容体
			body  : that.window.children('.body'),
			// 加载
			loading : that.window.children('.window-loading'),
			// 滚动条对象
			scroll  : null
		};
		let func = {
			close : (close = true) => {
				that.window.
					removeClass('zoomIn').
					hide();
				if (that.param.model == 'load')
					v.loading.hide();
				if (that.param.refresh)
				{
					v.body.empty();
					v.scroll.destroy();
					v.scroll = null;
				}
				Eadmin.maskHide();
				if ( ! close) return;
				// 关闭回调
				if (that.param.close != null && 
					_.isFunction(that.param.close)) 
					that.param.close();
			},
			load : () => {
				// 加载内容
				if (that.param.model == 'iframe')
				{
					let html = `<iframe 
									src="${that.param.url}" 
									width="100%" 
									height="100%" 
									frameborder="0" scrolling="auto">
								</iframe>`;
					v.body.html(html);
					return;
				}
				v.loading.show();
				// 延迟避免窗口加载过快
				setTimeout(() => {
					if (v.scroll != null)
					{
						v.scroll.destroy();
						v.scroll = null;
					}
					// 加载
					v.body.
					load(that.param.url, () => {
						// 隐藏LOADING
						v.loading.hide();
						// 表单处理
						Eadmin.form(v.body);
						// 延迟按钮
						Button.run(that.window);
						v.scroll = Eadmin.scroll(that.windowDom + ' .body');
						// 滚动条处理
						let scroll = body.find('.iscroll');
						if(scroll.length > 0)
						{
							scroll.
							each(function(){
								if ($(this).hasClass('ps')) return true;
								Eadmin.scroll($(this)[0]);
							});
						}
					});
				}, 100);
			}
		};
		// 按钮
		if (that.param.btn.length > 0)
		{
			v.btn = that.window.
						children('.btnbar').
						children('button');
		}
		// 关闭按钮
		v.close = that.window.children('.window-close');
		// 打开弹窗
		if ( ! that.bind)
		{
			that.window.
				off('animationend').
				show().
				addClass('zoomIn');
			Eadmin.mask();
			if(v.body.html() != '' && 
				! that.param.refresh)
			{
				return;
			}
			// 加载页面
			func.load();
		}
		else
		{
			box.
			on('click', that.dom, function(){
				let _var = {
					this : $(this)
				};
				_var.url = _var.this.data('window-url');
				if (_var.url == undefined || _var.url == '')
				{
					console.log('没有指定弹窗地址，打开失败');
					return;
				}
				that.param.url = _var.url;
				that.window.
					off('animationend').
					show().
					addClass('zoomIn');
				Eadmin.mask();
				if(v.body.html() != '' && 
					! that.param.refresh)
				{
					return;
				}
				// 加载页面
				func.load();
			});
		}
		// 关闭弹窗
		v.close.on('click', function(){
			func.close();
		});
		// 拖动
		if (that.param.drag)
		{
			v.title.on('mousedown', (event) => {
				let offset = that.window.offset();
				that.x     = event.clientX;
				that.y     = event.clientY;
				that.top   = offset.top;
				that.left  = offset.left;
				let ol = that.window.css('margin-left'),
					ot = that.window.css('margin-top');
				ol = parseInt(ol);
				ot = parseInt(ot);
				//鼠标移动事件
				$(document).on('mousemove', (event) => {
					let top  = that.top + (event.clientY - that.y),
						left = that.left + (event.clientX - that.x);
					top  -= ot;
					left -= ol;
					that.window.css({
						top  : top,
						left : left
					});
				});
			}).on('mouseup', () => {
				$(document).off('mousemove');
			});
		}
		if (that.param.btn.length == 0) return;
		// 自定义按钮事件
		v.btn.on('click', function(){
			let _var = {
				this : $(this)
			};
			_var.index = _var.this.index();
			// 按钮参数
			_var.param = that.param.btn[_var.index];
			// 内置事件
			if (_.isString(_var.param.action))
			{
				_var.action = [
					'cancel', 'refresh', 'submit'
				];
				if (_var.action.indexOf(_var.param.action) == -1)
				{
					console.log('没有找到内置按钮事件：' + _var.param.action);
					return;
				}
				switch (_var.param.action)
				{
					// 取消
					case 'cancel':
						func.close(false);
					break;
					// 刷新
					case 'refresh':
						v.body.empty();
						func.load();
					break;
					// 提交表单
					case 'submit':
						let _func = () => {
							v.form = v.body.find('form');
							if (v.form.length == 0)
							{
								console.log('窗体内没有找到form表单元素，提交表单失败');
								return;
							}
							v.action = v.form.attr('action');
							if (v.action == undefined)
							{
								v.action = that.param.url;
							}
							// 验证提交表单
							Validate.submit(v.form);
							if(v.form.find('span.error').length > 0)
							{
								return;
							}
							Eadmin.button.loading(_var.this);
							// 提交数据
							v.formData = v.form.serialize();
							// 调用接口
							axios.post(v.action, v.formData).
							then((response) => {
								let data = response.data;
								// 没有执行成功码则还是调用submit回调
								if (data[module.conf.http.code_field] == undefined)
								{
									console.log('接口返回结果中没有找到定义的code码字段');
									return;
								}
								let msg = '';
								if (data[module.conf.http.msg_field] != undefined)
									msg = data[module.conf.http.msg_field];
								// 执行成功
								if (data[module.conf.http.code_field] == module.conf.http.code_success)
								{
									msg = msg == '' ? '操作执行成功' : msg;
									// 加false参数表示不需要再调用窗口关闭的回调
									func.close(false);
									// 提示
									Eadmin.popup.success({
										content : msg,
										callback : () => {
											if (_var.param.refresh_on_close === true)
												Eadmin.refresh();
										}
									});
									Eadmin.button.reset(_var.this);
									return;
								}
								if (msg == '') msg = '操作执行失败';
								Eadmin.message.error({
									content : msg
								});
								Eadmin.button.reset(_var.this);
							}).
							catch((error) => {
								Eadmin.message.error({
									content : error
								});
								Eadmin.button.reset(_var.this);
							});
						}
						if (_var.param.before != undefined)
						{
							if (Method == undefined || 
								Method[_var.param.before] == undefined)
							{
								console.log('弹窗页面中没有找到指定的前置方法' + _var.param.before);
								return false;
							}
							Method[_var.param.before](_func);
							return;
						}
						_func();
					break;
				}
			}
			else
			{
				_var.param.action({
					close : () => {
						setTimeout(() => {
							Eadmin.button.reset(_var.this);
						}, 100);
						func.close();
					},
					refresh : () => {
						setTimeout(() => {
							Eadmin.button.reset(_var.this);
						}, 100);
						v.body.empty();
						func.load();
					}
				});
			}
		});
	}
	
}