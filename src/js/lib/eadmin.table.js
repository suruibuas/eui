/**
 * eadmin 表格组件
 */

class Table{

	constructor(dom, param){
		this.domCache = scope(dom);
		if (this.domCache.length == 0)
		{
			console.log('没有找到表格容器' + dom + '，创建失败');
			return;
		}
		// 窗口对象
		this.window   = Mount.window != null ? '#' + Mount.window : null;
		// 真实DOM，判断TABLE是否是在窗口内部
		this.dom      = this.window != null ? this.window + ' ' + dom : dom;
		// 缓存KEY
		this.storeKey = md5(Eadmin.currentHref);
		// 当前页数
		this.page = 1;
		let page = store(this.storeKey + '_page');
		if (page != undefined)
			this.page = +page;
		// 每页条数
		this.size = 10;
		// 总页数
		this.pageCount  = null;
		// 搜索容器
		this.searchBox  = null;
		// 按钮容器
		this.toolsBox   = null;
		// 分页容器
		this.pageBox    = null;
		// 表格
		this.table      = null;
		// 遮罩
		this.shade      = null;
		// 有没有初始化过表格
		this.init       = false;
		// 列按钮配置数据
		this.btns       = [];
		// 列弹窗配置数据
		this.columnOpen = [];
		// 选中的行数
		this.checked    = 0;
		// GET参数
		this.get 	    = {};
		// 搜索条件
		this.query      = '';
		// 容器宽度，用来做表格的宽度
		this.width      = +this.domCache.width();
		// 滚动条类实例化，用来更新横向滚动条
		this.scroll     = null;
		// 配置表头按钮ID
		this.columnId   = 'column-config-' + createId();
		// 表头列数据
		this.column     = [];
		// 表头配置信息
		this.columnConfig = store(this.storeKey + '_column');
		this.columnConfig = this.columnConfig == undefined ? {} : JSON.parse(this.columnConfig);
		// 导出EXCEL事件名
		this.exportExcel  = 'exportExcel_' + createId();
		this.excelColumn  = {};
		// 按钮颜色
		this.color = [
			'#0084ff',
			'#FF1844',			
			'#76FF02',
			'#FFFF01',
			'#FF7C00',
			'#F52394',
			'#00B2D4',
			'#800080',
			'#593110'
		];
		// 默认参数
		let _param = {
			// 基础配置
			config : {
				// 是否需要复选框
				checkbox : false,
				// 配置表头
				column_config : false,
				// 是否支持导出excel
				export_excel  : false,
				// 固定首位列
                fixed : {
                    // 首列
                    first : false,
                    // 尾列
                    last  : false
                },
				// 分页
				page : {
					// 每页条数
                    size : 10,
                    // 数字分页数目
					num  : 5,
					// 传递给后端代表页数的字段名，用来后端取值
					page_field : 'page',
					// 传递给后端代表条数的字段名，用来后端取值
					size_field : 'size'
				},
				// 数据源
				data : ''
			},
			// 按钮
			button : [],
			// 表格列编排
			column : [],
			// 搜索配置
			search : {},
			// 回调
			callback : null
		};
		// 配置参数
		this.param = $.extend(true, _param, param);
		// 判断是否需要分页
		if ( ! _.isBoolean(this.param.config.page))
		{
			let size = store(this.storeKey + '_size');
			if (size != undefined) 
				this.param.config.page.size = +size;
			this.size = this.param.config.page.size;
			// 赋值GET默认参数
			this.get[this.param.config.page.page_field] = this.page;
			this.get[this.param.config.page.size_field] = this.size;
		}
		// 遮罩
		let shade = `<div class="table-shade">
						<i class="ri-loader-4-line rotate"></i>数据加载中，请稍候...
					</div>`;
		this.domCache.addClass('table').hide().before(shade);
		this.shade = this.domCache.prev('.table-shade');
		// 是否显示左右固定浮动，用来确定表格全选是左浮动上的还是主体表格上的
		this.haveFixed = this.param.config.fixed.first;
		this.run();
	}

	/**
	 * 运行
	 */
	run(){
		if (this.param.column.length == 0)
		{
			console.log('至少为表格添加一列才可以创建表格');
			return;
		}
		// 数据源
		if (this.param.config.data == '')
			console.log('没有指定数据源地址，无法创建表格实体');
		// 创建
		this._create();
		// 事件
		this._event();
		// 窗口resize
		this._resize();
	}

	/**
	 * 表格数据刷新
	 */
	refresh()
	{
		this._loadData(false);
	}

	/**
	 * 创建表格
	 */
	_create(){
		let [html, search] = ['', []];
		// 私有方法
		let func = {
			// 排序字段
			order : (order, field = '') => {
				// 排序
				let html = '';
				if (order === true)
				{
					html = `<span class="order">
								<i class="ri-arrow-up-s-line asc" data-order="${field},asc"></i>
								<i class="ri-arrow-down-s-line desc" data-order="${field},desc"></i>
							</span>`;
				}
				return html;
			},
			// 创建表头
			head : () => {
				// 表头
				html += `<thead><tr>`;
				// 全选
				html += this._checkbox();
				// 列
				_.each(this.param.column, (row, k) => {
					// 是否需要搜索
					if (row.search === true)
						search.push(k);
					// 是否隐藏该列，用在只需要搜索，列表里没有的列
					if (row.column === false)
						return true;
					// 列数据
					let [checked, disabled] = [
						true,
						k == 0 || k + 1 == this.param.column.length ? true : false
					];
					if (this.columnConfig[row.field] != undefined)
						checked = this.columnConfig[row.field];
					html += `<td class="td-${k}${checked ? '' : ' dn'}">
								${row.name}${func.order(row.order, row.field)}
							</td>`;
					this.column.push({
						name     : row.name,
						disabled : disabled,
						checked  : checked,
						click    : (data) => {
							let td = this.table.t.find('.td-' + data._index);
							data._checked ? td.show() : td.hide();
							this.columnConfig[row.field] = data._checked;
							store(this.storeKey + '_column', JSON.stringify(this.columnConfig));
						}
					});
					if (row.field != undefined)
						this.excelColumn[row.field] = row.name;
				});
				html += '</tr></thead>';
			},
			// 搜索
			search : () => {
				if (search.length == 0) 
					return;
				let [html, param] = [
					`<div class="table-search dn">
						<form>
							<div class="block-box table-search-box">`,
					[]
				];
				_.each(search, (v, k) => {
					html += `<div class="col-3"><div class="form-group">`;
					let column = this.param.column[v];
					// 默认文本框搜索
					if (this.param.search[column.field] == undefined)
					{
						html += `<div class="input-group">
									<span class="prepend">${column.name}</span>
									<input name="${column.field}" type="text" placeholder="请输入${column.name}">
								</div>`;
					}
					else
					{
						let search = this.param.search[column.field];
						switch(search.type)
						{
							// 下拉菜单
							case 'select':
								html += `<select name="${column.field}" data-width="100%">
											<option value="">
												请选择${column.name}
											</option>`;
								_.each(search.option, (row) => {
									html += `<option value="${row.val}">
												${row.key}
											</option>`;
								});
								html += `</select>`;
							break;
							case 'datepicker':
								html += `<div class="input-group">
											<span class="prepend">${column.name}</span>
											<input 
												id="table-datepicker-${k}" 
												class="table-datepicker"
												name="${column.field}" 
												data-key="${k}"
												type="text" 
												placeholder="请选择${column.name}">
										</div>`;
								param[k] = search.param;
							break;
							case 'citypicker':
								html += `<div class="input-group">
											<span class="prepend">${column.name}</span>
											<input 
												id="table-citypicker-${k}" 
												class="table-citypicker"
												name="${column.field}" 
												data-key="${k}"
												type="text" 
												placeholder="请选择${column.name}">
										</div>`;
								param[k] = search.param;
							break;
						}
					}
					html += `</div></div>`;
				});
				html += `<div class="col-3">
							<button class="search-do hl middle">
								<i class="ri-search-line"></i>搜索
							</button><button class="search-refresh middle">
								<i class="ri-refresh-line"></i>重置
							</button>
						</div>
						</div></form></div>`;
				this.domCache.before(html);
				// 搜索
				this.searchBox = this.domCache.prev('.table-search');
				// 日历
				this.searchBox.
					find('.table-datepicker').
					each(function(){
						let _this = $(this);
						Eadmin.datepicker('#' + _this.attr('id'), param[_this.data('key')]);
					});
				// 地区
				this.searchBox.
					find('.table-citypicker').
					each(function(){
						let _this = $(this);
						Eadmin.citypicker('#' + _this.attr('id'), param[_this.data('key')]);
					});
			},
			// 按钮栏
			tools : () => {
				if (this.param.button.length == 0 && 
					! this.param.config.column_config && 
					! this.param.config.export_excel)
					return;
				let html = `<div class="table-tools dn">`;
				_.each(this.param.button, (row, k) => {
					html += `<button id="table-btn-${k}" `;
					html += (k == 0) ? `class="hl middle">` : `class="middle">`;
					if (row.icon != undefined)
						html += `<i class="${row.icon}"></i>`;
					html += row.name + `</button>`;
				});
				if (this.param.config.export_excel)
					html += `<button 
								id="export-excel" 
								class="middle" 
								data-loading="数据导出中..." 
								data-do="${this.exportExcel}">
								<i class="ri-download-2-line"></i>导出excel
							</button>`;
				if (this.param.config.column_config)
					html += `<button id="${this.columnId}" class="middle mr0 fr">
								<i class="ri-settings-2-line"></i>表头
							</button>`;
				html += '</div>';
				this.domCache.before(html);
				this.toolsBox = this.domCache.prev('.table-tools');
			},
			// 分页栏
			page : () => {
				if (_.isBoolean(this.param.config.page))
					return;
				let html = `<div class="table-page dn">
								<span class="info">
									共<em></em>条，每页
									<select name="pagesize" data-width="70">
										<option value="0">请选择</option>
										<option value="10"${this.size == 10 ? ' selected' : ''}>10</option>
										<option value="30"${this.size == 30 ? ' selected' : ''}>30</option>
										<option value="50"${this.size == 50 ? ' selected' : ''}>50</option>
										<option value="100"${this.size == 100 ? ' selected' : ''}>100</option>
									</select>
									条，当前 <em>${this.page}</em>/<em>-</em> 页
								</span>
								<span class="prev-page"><i class="ri-arrow-left-s-line"></i></span>
								<span class="next-page"><i class="ri-arrow-right-s-line"></i></span>
								<span class="jump">
									跳转到第 <input name="page" type="text" placeholder="页数"> 页
									<button class="hl small">确定</button>
								</span>
							</div>`;
				this.domCache.after(html);
				this.pageBox = this.domCache.next('.table-page');
			},
			// 固定
			fixed : () => {
				let html = '';
				// 首列
				if (this.param.config.fixed.first)
				{
					html += `<div class="fixed-left"><table><thead><tr>`;
					html += this._checkbox(null, true);
					let head = _.head(this.param.column);
					html += `<td>${head.name}${func.order(head.order, head.field)}</td></tr></thead>`;
					html += `<tbody></tbody></table></div>`;
				}
				// 尾列
				if (this.param.config.fixed.last)
				{
					html += `<div class="fixed-right"><table><thead><tr>`;
					let last = _.last(this.param.column);
					html += `<td>${last.name}${func.order(last.order, last.field)}</td></tr></thead>`;
					html += `<tbody></tbody></table></div>`;
				}
				this.domCache.append(html);
			},
			// 创建表体
			body : () => {
				// 表头
				func.head();
				// 搜索
				func.search();
				// 工具
				func.tools();
				// 分页
				func.page();
				html += `<tbody></tbody></table></div>`;
				this.domCache.html(html);
				// 固定列
				func.fixed();
				// 如果没有按钮栏则增加上划线
				if (this.param.button.length == 0 && 
					! this.param.config.column_config && 
					! this.param.config.export_excel)
					this.domCache.find('thead > tr').addClass('head-border-top');
				this.table = {
					head : this.domCache.find('thead'),
					body : this.domCache.find('tbody'),
					lbox : this.domCache.find('.fixed-left'),
					rbox : this.domCache.find('.fixed-right'),
					box  : this.domCache.find('.table-box')
				};
				this.table.t = this.table.box.children('table');
				this.table.c = this.table.t.children('tbody');
				this.table.l = this.table.lbox.find('tbody');
				this.table.r = this.table.rbox.find('tbody');
			}
		};
		// 创建表格
		html = `<div class="table-box" style="width:${this.width}px;"><table style="width:${this.width}px;">`;
		// 表体
		func.body();
		// 构建数据
		this._loadData();
	}

	/**
	 * 事件
	 */
	_event(){
		let dom = [
			// 全选
			'thead .checkall',
			// 单选
			'tbody .checkall',
			// 行
			'tbody tr',
			// 搜索
			'.search-do',
			// 重置搜索
			'.search-refresh',
			// 每页条数
			'.table-page select',
			// 数字分页
			'.table-page .num-page:not(.current)',
			// 上翻页
			'.table-page .prev-page',
			// 下翻页
			'.table-page .next-page',
			// 跳转页面
			'.table-page button',
			// 按钮
			'.table-tools button',
			// 排序
			'.order i:not(.active)',
			// 开关
			'[data-model="switch"]',
			// 列按钮
			'.column-btn',
			// 列弹窗
			'.column-window'
		];
		// 私有方法
		let func = {
			jumpError : (msg) => {
				Eadmin.message.error({
					content : msg
				});
				that.pageBox.find('input').val('');
			}
		};
		let [that, _box] = [
			this, this.domCache.parent()
		];
		// 全选反选，单选
		if (that.param.config.checkbox)
		{
			_box.
			// 全选
			on('click', dom[0], function(){
				let [_this, v] = [$(this), {}];
				v.isCheck = _this.is(':checked') ? 1 : 0;
				// 全选设置选中个数为当页条数
				that.checked = v.isCheck == 1 ? that.size : 0;
				v.checkbox   = that.haveFixed ? that.table.l.find('.checkall') : that.table.t.find('.checkall');
				Form.checkbox(v.checkbox, v.isCheck);
			}).
			// 单选
			on('click', dom[1], function(){
				let [_this, isCheck] = [
					$(this), 0
				];
				that.checked += _this.is(':checked') ? 1 : -1;
				// 全选
				isCheck = that.checked == that.size ? 1 : 0;
				Form.checkbox(that.table.head.find('.checkall'), isCheck);
			});
		}
		// 移入高亮
		if (that.param.config.fixed.first || 
			that.param.config.fixed.last)
		{
			let index = 0;
			_box.
			on('mouseenter', dom[2], function(){
				index = $(this).index();
				that.table.c.
					children('tr').
					eq(index).
					addClass('tr-hover');
				that.table.l.
					children('tr').
					eq(index).
					addClass('tr-hover');
				that.table.r.
					children('tr').
					eq(index).
					addClass('tr-hover');
			}).
			on('mouseleave', dom[2], function(){
				that.table.c.
					children('tr').
					eq(index).
					removeClass('tr-hover');
				that.table.l.
					children('tr').
					eq(index).
					removeClass('tr-hover');
				that.table.r.
					children('tr').
					eq(index).
					removeClass('tr-hover');
			});
		}
		// 搜索
		if (that.searchBox != null)
		{
			_box.
			// 执行搜索
			on('click', dom[3], () => {
				that.page = 1;
				that.get[that.param.config.page.page_field] = that.page;
				_.unset(that.get, '_export');
				// 搜索表单数据
				let form = that.searchBox.children('form').serialize();
				if (form != that.query)
				{
					that.get['_search'] = 1;
					that.query = form;
				}
				let search = _.split(form, '&');
				_.each(search, (val) => {
					let param = _.split(val, '=');
					that.get[param[0]] = decodeURIComponent(param[1]);
				});
				that._loadData(true);
				return false;
			}).
			// 重置搜索
			on('click', dom[4], () => {
				// 重置输入框
				that.searchBox.find('input').val('');
				// 重置下拉菜单
				Form.select(that.searchBox);
				return false;
			});
		}
		// 工具栏
		if (that.toolsBox != null)
		{
			_.each(that.param.button, (row, k) => {
				let button = that.toolsBox.find('button').eq(k);
				// 打开弹窗
				if (row.open != undefined)
				{
					button.data('window-url', row.open.url);
					let id = button.attr('id');
					Eadmin.window('#' + id, row.open);
					return true;
				}
				// 点击调用API或者回调
				button.on('click', function(){
					// 是否需要判断复选按钮至少选中一个
					if (row.check_checked === true && 
						that.checked == 0)
					{
						Eadmin.popup.error({
							content : '请至少选择一项执行此操作'
						});
						return;
					}
					// 私有方法
					let run = () => {
						let [checkval, params, checked] = [
							[], {}
						];
						// 检测复选框选中情况
						checked = that.haveFixed ? that.table.l : that.table.c;
						checked = checked.find('.checkall:checked');
						if (checked.length > 0)
						{
							checked.each(function(){
								checkval.push($(this).val());
							});
							checkval = _.toString(checkval);
							params[that.param.config.checkbox] = checkval;
						}
						// 调用API
						if (row.api != undefined)
						{
							Eadmin.get({
								url   : row.api,
								param : params,
								popup : true,
								then  : () => {
									if (row.refresh === true) that._loadData();
								}
							});
							return true;
						}
						// 回调
						if (_.isFunction(row.callback))
						{
							row.callback(_.isArray(checkval) ? '' : checkval);
							return;
						}
						console.log('按钮操作没有指明具体操作动作，无法执行');
					};
					// 需要确认框
					if (row.confirm === true)
					{
						Eadmin.popup.confirm({
							content : '确认执行此操作吗？',
							submit  : run
						});
						return true;
					}
					run();
				});
			});
		}
		// 分页
		if ( ! _.isBoolean(this.param.config.page))
		{
			_box.
			// 切换每页条数
			on('change', dom[5], function(){
				that.page = 1;
				that.size = +$(this).val();
				store(that.storeKey + '_page', that.page.toString());
				store(that.storeKey + '_size', that.size.toString());
				that.get[that.param.config.page.page_field] = that.page;
				that.get[that.param.config.page.size_field] = that.size;
				that._loadData(true);
			}).
			// 数字分页
			on('click', dom[6], function(){
				that.page = +$(this).html();
				store(that.storeKey + '_page', that.page.toString());
				that.get[that.param.config.page.page_field] = that.page;
				that._loadData(true);
			}).
			// 上翻
			on('click', dom[7], () => {
				if (that.page == 1) return;
				that.page -= 1;
				store(that.storeKey + '_page', that.page.toString());
				that.get[that.param.config.page.page_field] = that.page;
				that._loadData(true);
			}).
			// 下翻
			on('click', dom[8], () => {
				if (that.page == that.pageCount) return;
				that.page += 1;
				store(that.storeKey + '_page', that.page.toString());
				that.get[that.param.config.page.page_field] = that.page;
				that._loadData(true);
			}).
			// 跳转
			on('click', dom[9], () => {
				let page = that.pageBox.find('input').val();
				if (page == '')
				{
					func.jumpError('跳转的页数不能为空');
					return;
				}
				if (page < 1)
				{
					func.jumpError('跳转的页数不能小于1');
					return;
				}
				if (page > that.pageCount)
				{
					func.jumpError('跳转的页数已经超出了最大页数');
					return;
				}
				if (page == that.page)
				{
					func.jumpError('已经在待跳转的页面了');
					return;
				}
				store(that.storeKey + '_page', page);
				that.page = +page;
				that.get[that.param.config.page.page_field] = that.page;
				that._loadData(true);
			});
		}
		// 排序
		_box.
		on('click', dom[11], function(){
			let _this = $(this);
			that.table.head.find('.active').removeClass('active');
			_this.addClass('active');
			that.get.order = _this.data('order');
			that._loadData(true);
		}).
		// 开关
		on('click', dom[12], function(){
			let [_this, v] = [$(this), {}];
			v.label = _this.parent('label');
			v.api   = v.label.data('api');
			v.field = v.label.data('field');
			v.val   = _this.val();
			v.param = {};
			v.param[v.field] = v.val;
			// 请求数据
			Eadmin.get({
				url   : v.api,
				param : v.param,
				popup : true
			});
		}).
		// 列按钮
		on('click', dom[13], function(){
			let [_this, v] = [$(this), {}];
			v.row = _this.data('row');
			v.key = _this.data('key');
			v.btn = that.btns[v.row][v.key];
			// 打开弹窗
			if (v.btn.open != undefined)
			{
				Eadmin.window(false, v.btn.open);
				return;
			}
			// 调用接口
			if (v.btn.api != undefined)
			{
				let run = () => {
					Eadmin.get({
						url   : v.btn.api,
						popup : true,
						then  : () => {
							if (v.btn.refresh === true) that._loadData();
						}
					});
				};
				if (v.btn.confirm === true)
				{
					Eadmin.popup.confirm({
						content : '确定执行此操作吗？',
						submit  : run
					});
					return;
				}
				run();
			}
		}).
		// 列弹窗
		on('click', dom[14], function(){
			let [_this, v] = [$(this), {}];
			v.row  = _this.data('row');
			v.key  = _this.data('key');
			v.open = that.columnOpen[v.row][v.key];
			Eadmin.window(false, v.open);
		});
		// 表格列配置
		if (this.param.config.column_config)
		{
			Eadmin.dropdown('#' + this.columnId, {
				width : 200,
				title : '表头设置',
				data  : this.column
			});
		}
		// 导出
		if (this.param.config.export_excel)
		{
			let func = {
				openDownloadDialog : (url, name) => {
					if (window.navigator && 
						window.navigator.msSaveOrOpenBlob)
					{
						window.navigator.msSaveOrOpenBlob(url, name);
					}
					else
					{
						if (typeof url == 'object' && url instanceof Blob)
							url = URL.createObjectURL(url);
						let link  = document.createElement('a');
						link.href = url;
						link.download = name || '';
						let event;
						if (window.MouseEvent) 
							event = new MouseEvent('click');
						else
						{
							event = document.createEvent('MouseEvents');
							event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
						}
						link.dispatchEvent(event);
					}
				},
				sheet2blob : (sheet) => {
					let workbook = {
						SheetNames : ['sheet1'],
						Sheets     : {}
					};
					workbook.Sheets['sheet1'] = sheet;
					// 生成excel的配置项
					let opts = {
						bookType : 'xlsx',
						bookSST  : true,
						type     : 'binary'
					};
					let wbout = XLSX.write(workbook, opts);
					let blob  = new Blob([s2ab(wbout)], {type : 'application/octet-stream'});
					function s2ab(s)
					{
						let buf  = new ArrayBuffer(s.length);
						let view = new Uint8Array(buf);
						for (let i = 0; i != s.length; ++i) 
							view[i] = s.charCodeAt(i) & 0xFF;
						return buf;
					}
					return blob;
				}
			};
			Method[this.exportExcel] = (btn) => {
				this.get['_export'] = 1;
				Eadmin.get({
					url   : this.param.config.data,
					param : this.get,
					then  : (data) => {
						data = [this.excelColumn, ...data['list']];
						let sheet = XLSX.utils.json_to_sheet(data, {
							skipHeader : true
						});
						func.openDownloadDialog(
							func.sheet2blob(sheet), 
							createId() + '.xlsx'
						);
						Eadmin.button.reset(btn);
					}
				});
			}
		}
	}

	/**
	 * 复选框统一处理
	 */
	_checkbox(data = null){
		// 判断是否需要全选反选
		if (this.param.config.checkbox === false)
			return '';
		// 标题栏的全选框，不需要赋值
		if (data == null)
		{
			return `<td class="td-checkbox"><div>
						<label class="checkall-box">
							<input type="checkbox" class="checkall">
						</label>
					</div></td>`;
		}
		if (data[this.param.config.checkbox] == undefined)
		{
			console.log('复选框绑定的字段' + this.param.config.checkbox + '不存在');
			return '';
		}
		return `<td class="td-checkbox"><div>
					<label class="checkall-box">
						<input type="checkbox" class="checkall" value="${data[this.param.config.checkbox]}">
					</label>
				</div></td>`;
	}

	/**
	 * 分页处理
	 */
	_page(data, page = false){
		// 没有分页则不处理
		if (_.isBoolean(this.param.config.page)) return;
		if ( ! _.has(data, 'count'))
		{
			console.log('数据源中未包含数据总条数count字段，创建分页失败');
			return;
		}
		if ( ! this.init)
			this.pageBox.data('size', this.size);
		let v = {
			// 总条数
			count : this.pageBox.find('em:first'),
			// 当前页数
			page  : this.pageBox.find('em').eq(1),
			// 总页数
			pageCount : this.pageBox.find('em').eq(2)
		};
		if (data.count != +v.count.html() || 
			this.size != this.pageBox.data('size'))
		{
			// 计算总页数
			if (data.count < this.size)
			{
				this.pageCount = 1;
			}
			else if (data.count % this.size === 0)
			{
				this.pageCount = data.count / this.size;
			}
			else
			{
				this.pageCount = parseInt(data.count / this.size) + 1;
			}
			v.count.html(data.count);
			v.pageCount.html(this.pageCount);
			if (this.size != this.pageBox.data('size'))
				this.pageBox.data('size', this.size);
		}
		v.page.html(this.page);
		// 循环页码
		let num = 10;
		if (_.has(this.param.config.page, 'num'))
		{
			num = this.param.config.page.num;
			if (num < 3) num = 3;
			if (num > 10) num = 10;
		}
		let html = '';
		let from = this.page;
		let endCut = 0;
		from -= _.floor(num / 2);
		if (from < 1)
		{
			from = 1;
			endCut = 0;
		}
		else
		{
			endCut = this.page - _.floor(num / 2) - 1;
		}
		let end = num + endCut;
		if (end > this.pageCount) 
			end = this.pageCount;
		if (end - from < num - 1) 
			from -= num - (end - from) - 1;
		if (from < 1) 
			from = 1;
		for (let i = from; i <= end; i++)
			html += `<span class="num-page${i == this.page ? ' current' : ''}" data-page="${i}">${i}</span>`;
		this.pageBox.find('.num-page').remove();
		this.pageBox.find('.prev-page').after(html);
		if (this.init && 
			page && 
			module.conf.page_show_message)
		{
			Eadmin.message.success({
				content  : '当前第 ' + this.page + ' 页，共 ' + this.pageCount + ' 页'
			});
		}
	}

	/**
	 * 加载数据
	 */
	_loadData(page = false){
		let that = this;
		this.checked = 0;
		this.btns = [];
		this.columnOpen = [];
		this.shade.css('display', 'flex');
		this.table.lbox.hide();
		this.table.rbox.hide();
		if (this.searchBox != null)
			this.searchBox.hide();
		if (this.toolsBox != null)
		this.toolsBox.hide();
		this.domCache.hide();
		if (this.param.config.page !== false)
			this.pageBox.hide();
		this.table.c.empty();
		if (page)
		{
			if (this.window != null)
			{
				if ( ! _.startsWith(this.window, '#tab'))
					$(this.window + ' .body')[0].scrollTop = 0;
			}
			else
			{
				box[0].scrollTop = 0;
			}
		}
		let run = (data) => {
			let v = {
				data : data,
				html : '',
				fl   : '',
				fr   : ''
			};
			let func = {
				// 标签
				tag : (c, r) => {
					return c.tag === true ? ` data-tag="${r[c.field]}"` : '';
				},
				// 开关
				switch : (c, r) => {
					let api = '';
					if ( ! _.isFunction(c.api))
						console.log('没有指定保存开关状态的API地址');
					else
						api = c.api(r);
					return `<label class="no-padding" data-api="${api}" data-field="${c.field}">
								<input type="radio" data-model="switch" value="${r[c.field]}">
							</label>`;
				},
				// 按钮
				button : (c, r, row_key) => {
					let btn  = c.button(r);
					that.btns.push(btn);
					let html = '';
					_.each(btn, (b, btn_key) => {
						let [icon, id] = [
							b.icon != undefined ? `<i class="${b.icon}"></i>` : '',
							`table-column-btn-${row_key}-${btn_key}`
						];
						let disabled = b.disabled === true ? ' disabled' : '';
						html += `<button 
									id="${id}" 
									${disabled}
									data-row="${row_key}" 
									data-key="${btn_key}" 
									class="small column-btn" 
									style="background:${that.color[btn_key]}; border-color:${that.color[btn_key]};"
									>
									${icon} ${b.name}
								</button>`;
					});
					return html;
				},
				// 图片
				img : (c, r) => {
					let html = '';
					html += `<img src="${_.isFunction(c.format) ? c.format(r) : r[c.field]}"`;
					if (c.head === true) 
						html += ' class="table-img-head"';
					if (c.style != undefined)
						html += ' style="' + c.style + '"';
					html += '>';
					return html;
				},
				// 格式化
				format : (c, r) => {
					let data = _.isFunction(c.format) ? c.format(r) : r[c.field];
					let get  = that.get[c.field];
					// 处理搜索结果高亮
					if (c.hl === true && 
						get != undefined && 
						get != '')
						data = _.replace(data, get, `<span style="color:red;">${get}</span>`);
					return data;
				},
				// 链接
				href : (c, r) => {
					if ( ! _.isFunction(c.link))
						return '';
					if (_.isBoolean(r) && r)
						return '</a>';
					let link = c.link(r);
					let html = `<a href="${link.href}" data-native`;
					if (link.target != undefined)
						html += ` target="${link.target}"`;
					html += '>';
					return html;
				}
			};
			if (v.data.count == undefined && 
				this.param.config.page !== false)
			{
				console.log('返回的数据源中没有 count 字段，无法使用分页，请在配置中设置 page 为 false');
				return;
			}
			if (v.data.list == undefined)
			{
				console.log('数据源中没有包含list字段，创建表格失败');
				return;
			}
			this.domCache.show();
			if (this.searchBox != null)
				this.searchBox.show();
			if (this.toolsBox != null)
				this.toolsBox.show();
			if (this.param.config.page !== false)
				this.pageBox.show();
			if (v.data.list.length > 0)
			{
				// 构建表格
				_.each(v.data.list, (row, row_key) => {
					v.fl   += `<tr>`;
					v.fr   += `<tr>`;
					v.html += `<tr>`;
					// 全选
					v.html += this._checkbox(row);
					v.fl   += this._checkbox(row, true);
					let ck = 0;
					_.each(this.param.column, (c, k) => {
						// 是否隐藏该列，用在只需要搜索，列表里没有的列
						if (c.column === false)
							return true;
						let window = '';
						if (c.open != undefined)
						{
							window = ' column-window';
							if (that.columnOpen[row_key] == undefined)
								that.columnOpen[row_key] = [];
							that.columnOpen[row_key].push(c.open(row));
						}
						let html = `<td`;
						// 标签
						html += func.tag(c, row);
						let checked = true;
						if (this.columnConfig[c.field] != undefined)
							checked = this.columnConfig[c.field];
						html += ` class="td-${k}${window}${checked ? '' : ' dn'}"`;
						if (window != '')
						{
							html += ` data-row="${row_key}" data-key="${ck}"`;
							ck++;
						}
						html += '>';
						// 开关
						if (c.switch === true)
							html += func.switch(c, row);
						// 按钮
						else if (_.isFunction(c.button))
							html += func.button(c, row, row_key);
						else
						{
							if (window != '')
							{
								html += '<a href="javascript:;">';
							}
							else
							{
								// 链接
								html += func.href(c, row);
							}

							html += c.img === true ? func.img(c, row) : func.format(c, row);

							if (window != '')
							{
								html += '</a>';
							}
							else
							{
								// 链接闭合
								html += func.href(c, true);
							}
						}
						html += `</td>`;
						// 首列
						if (k == 0) v.fl += html;
						v.html += html;
						// 尾列
						if (k + 1 == this.param.column.length) 
							v.fr += html;
					});
					v.fl   += `</tr>`;
					v.html += `</tr>`;
					v.fr   += `</tr>`;
				});
				this.table.c.html(v.html);
				// 缺省图处理
				defaultImg(this.table.c);
				// 标签
				Tag.run(this.table.c);
				if (this.table.t.width() <= this.width)
				{
					this.table.lbox.remove();
					this.table.rbox.remove();
					this.haveFixed = false;
				}
				else
				{
					// 首列
					if (this.param.config.fixed.first === true)
					{
						this.table.head.eq(0).find('.checkall-box').remove();
						this.table.c.find('.checkall-box').remove();
						this.table.l.html(v.fl);
						Eadmin.form(this.table.l);
					}
					// 尾列
					if (this.param.config.fixed.last === true)
					{
						this.table.r.html(v.fr);
						Eadmin.form(this.table.r);
					}
				}
				// 表单
				Eadmin.form(this.table.c);
				// 进度条
				Progress.run(this.table.c);
				// 分页
				this._page(v.data, page);
				let checkall = this.table.head.find(':checkbox');
				if (checkall.is(':checked'))
					Form.checkbox(checkall, false);
				this.table.lbox.show();
				this.table.rbox.show();
				let empty = this.domCache.find('.empty');
				if (empty.length > 0) 
					empty.hide();
			}
			else
			{
				if (this.param.config.page !== false)
					this.pageBox.hide();
				let empty = this.domCache.find('.empty');
				if (empty.length == 0)
				{
					this.domCache.append('<div class="empty">该列表暂无更多数据~</div>');
				}
				else
				{
					empty.show();
				}
			}
			// 隐藏遮罩
			this.shade.hide();
			// 回调
			if (this.param.callback != null)
				this.param.callback(v.data);
			this.get['_search'] = 0;
			if (this.init) return;
			// 校验最小宽度
			this.scroll = Eadmin.scroll(this.dom + ' .table-box', 'x');
			if (this.table.t.width() <= this.width)
			{
				this.table.t.width(this.width);
			}
			else
			{
				this.domCache.children('.table-box').css('padding-bottom', '18px');
			}
			this.init = true;
		}
		if (this.param.config.data == '')
		{
			let data = {
				count : 0,
				list  : []
			};
			run(data);
			return;
		}
		// 请求数据
		Eadmin.get({
			url   : this.param.config.data,
			param : this.get,
			then  : (data) => {
				run(data);
			}
		});
	}

	/**
	 * 窗口resize操作
	 */
	_resize(){
		$(window).on('resize', _.debounce(() => {
			this.width = +this.domCache.width();
			this.table.box.width(this.width);
			if (this.table.t.width() <= this.width)
			{
				this.table.t.width(this.width);
				this.domCache.children('.table-box').css('padding-bottom', 0);
			}
			else
			{
				this.domCache.children('.table-box').css('padding-bottom', '18px');
			}
			if (this.scroll != null) this.scroll.update();
        }, 100));
	}

}