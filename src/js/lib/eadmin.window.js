/**
 * eadmin 弹窗组件
 */

class Window{

	constructor(dom, param){
		// 窗口
		this.window = '';
		// 窗口DOM
		this.windowDom = null;
		// 选择器原始DOM名称，如果为false，则表示不需要绑定点击事件
		// 是点击后直接调用窗口，例如表格列按钮
		this.dom    = dom == false ? false : scope(dom);
		// 鼠标X轴
		this.x      = 0;
		// 鼠标Y轴
		this.y		= 0;
		// 窗口的top值
		this.top    = 0;
		// 窗口的left值
		this.left   = 0;
		// 默认参数
		let _param  = {
			// 链接地址
			url		: '',
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
			submit  : null,
			// 弹窗风格，window、popup
			style   : 'window'
		}
		// 配置参数
		this.param = $.extend(true, _param, param);
		this.run();
	}

	/**
	 * 运行控件
	 */
	run(){
		// 事件执行
		this._event();
	}

	/**
	 * 创建结构
	 */
	_create(){
		// 私有变量
		let v = {
			id     : createId(),
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
		// 窗口原始DOM名称
		this.window = 'window-' + v.id;
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
		// 如果是弹出
		if (this.param.style == 'popup')
		{
			v.height = innerH();
		}
		else
		{
			if (_.isInteger(this.param.height) || 
			this.param.height.indexOf('%') == -1)
			{
				v.height = this.param.height;
			}
			else
			{
				v.height = innerH() * (parseInt(this.param.height.replace('%', '')) / 100);
			}
		}
		// 制定样式
		if (this.param.style == 'popup')
		{
			v.style = `style="width:${v.width}px;height:${v.height}px;top:0;right:0;left:unset;border-radius:5px 0 0 5px;"`;
		}
		else
		{
			v.style = `style="width:${v.width}px;height:${v.height}px;margin-left:-${v.width / 2}px;margin-top:-${v.height / 2}px;"`;
		}
		// 是否可以拖动
		if (this.param.drag && 
			this.param.style == 'window')
			v.drag = ' style="cursor: move;"';
		// 窗口主体高度
		v.height -= 55;
		if (this.param.btn.length > 0)
			v.height -= 50;
		// 窗口骨架
		v.html = `<div id="${this.window}" 
						class="window animated faster${(Mount.window) == null ? '' : ' ' + Mount.window} dn" ${v.style}>
					<div class="window-loading dn">
						<i class="ri-loader-4-line rotate"></i>页面加载中，请稍候...
					</div>
					<div class="window-close">
						<i class="ri-close-circle-fill"></i>
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
		this.windowDom = $('#' + this.window);
	}

	/**
	 * 事件
	 */
	_event(){
		let that = this;
		let v = {};
		let func = {
			close : () => {
				that.windowDom.remove();
				Mount.window = null;
				$('.' + that.window).remove();
				Eadmin.maskHide();
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
				let timeout = 100;
				if (that.param.style == 'popup') timeout = 200;
				// 延迟避免窗口加载过快
				setTimeout(() => {
					if (v.scroll != null)
					{
						v.scroll.destroy();
						v.scroll = null;
					}
					Mount.window = that.window;
					// 加载
					v.body.
					load(that.param.url, () => {
						// 隐藏LOADING
						v.loading.hide();
						// 表单处理
						Eadmin.form(v.body);
						// 延迟按钮
						Button.run(that.windowDom);
						// 状态
						Status.run(v.body);
						// 标签
						Tag.run(v.body);
						// 进度条
						Progress.run(v.body);
						v.scroll = Eadmin.scroll('#' + that.window + ' .body');
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
						// 块
						block(v.body);
					});
				}, timeout);
			},
			init : (dom) => {
				// 创建窗体
				that._create();
				// 私有变量
				v = {
					this    : dom,
					// 标题栏
					title   : that.windowDom.children('.title'),
					// 内容体
					body    : that.windowDom.children('.body'),
					// 加载
					loading : that.windowDom.children('.window-loading'),
					// 滚动条对象
					scroll  : null
				};
				if (dom != false)
					that.param.url = v.this.data('window-url');
				Eadmin.currentHref = that.param.url;
				if (that.param.url == undefined || 
					that.param.url == '')
				{
					console.log('没有指定弹窗地址，打开失败');
					return;
				}
				let zindex = Eadmin.mask();
				if (zindex != false)
					that.windowDom.css('z-index', zindex);
				that.windowDom.
					off('animationend').
					show().
					addClass(that.param.style == 'window' ? 'zoomIn' : 'fadeInRight');
				// 加载页面
				func.load();
				// 关闭弹窗
				that.windowDom.
					children('.window-close').
					on('click', () => {
						func.close();
					});
				// 拖动
				if (that.param.drag)
				{
					v.title.on('mousedown', (event) => {
						let offset = that.windowDom.offset();
						that.x     = event.clientX;
						that.y     = event.clientY;
						that.top   = offset.top;
						that.left  = offset.left;
						let ol = that.windowDom.css('margin-left'),
							ot = that.windowDom.css('margin-top');
						ol = parseInt(ol);
						ot = parseInt(ot);
						//鼠标移动事件
						$(document).on('mousemove', (event) => {
							let top  = that.top + (event.clientY - that.y),
								left = that.left + (event.clientX - that.x);
							top  -= ot;
							left -= ol;
							that.windowDom.css({
								top  : top,
								left : left
							});
						});
					}).on('mouseup', () => {
						$(document).off('mousemove');
					});
				}
				// 按钮
				if (that.param.btn.length == 0) return;
				// 自定义按钮事件
				that.windowDom.
					children('.btnbar').
					children('button').
					on('click', function(){
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
								func.close();
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
											// 清除编辑器的本地缓存
											let editor = v.form.find('.editor');
											if (editor.length > 0)
											{
												let storeKey = editor.data('store');
												if (storeKey != undefined)
													store.remove(storeKey);
											}
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
		};
		if (that.dom == false)
		{
			func.init(false);
			return;
		}
		that.dom.
		on('click', function(){
			func.init($(this));
		});
	}
	
}