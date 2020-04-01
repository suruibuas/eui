/**
 * eadmin 表格组件
 */

class Table{

	constructor(dom, param){
		// 容器缓存
		this.domCache = $(dom);
		if (this.domCache.length == 0)
		{
			console.log('没有找到表格容器' + dom + '，创建失败');
			return;
		}
		// 真实DOM
		this.dom  = dom;
		// 当前页数
		this.page = 1;
		// 每页条数
		this.size = 10;
		// 总页数
		this.pageCount = null;
		// 搜索容器
		this.searchBox = null;
		// 按钮容器
		this.toolsBox  = null;
		// 分页容器
		this.pageBox   = null;
		// 表格
		this.table     = null;
		// 遮罩
		this.shade     = null;
		// 有没有初始化过表格
		this.init      = false;
		// 选中的个数
		this.checked   = 0;
		// GET参数
		this.get = {};
		// 容器宽度，用来做表格的宽度
		this.width = parseInt(this.domCache.width());
		// 按钮颜色
		this.color = [
			'#0084ff',
			'#FF2A1E',			
			'#4dd13a',
			'#8368ee',
			'#1dd0d7',
			'#f67f1b',
			'#ff6384'
		];
		// 默认参数
		let _param = {
			// 基础配置
			config : {
				// 是否需要复选框
				checkbox : false,
				// 固定首位列
                fixed : {
                    // 首列
                    first : false,
                    // 尾列
                    last  : false
                },
				// 按钮
				button : [],
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
				data   : ''
			},
			// 表格列编排
			column : [],
			// 搜索配置
			search : {}
		};
		// 配置参数
		this.param = $.extend(true, _param, param);
		if (_.has(this.param.config.page, 'size'))
			this.size = this.param.config.page.size;
		// 赋值GET默认参数
		this.get[this.param.config.page.page_field] = this.page;
		this.get[this.param.config.page.size_field] = this.size;
		let shade = `<div class="table-shade">
						<i class="fa fa-spinner fa-pulse mr5"></i>数据加载中，请稍候...
					</div>`;
		this.domCache.
			addClass('table').
			before(shade);
		this.shade = this.domCache.prev('.table-shade');
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
		{
			console.log('没有指定数据源地址，无法创建表格');
			return;
		}
		// 创建
		this._create();
		// 事件
		this._event();
	}

	/**
	 * 创建表格
	 */
	_create(){
		// 私有变量
		let v = {
			html   : '',
			// 搜索字段
			search : []
		};
		// 私有方法
		let func = {
			// 排序字段
			order : (order, field = '') => {
				// 排序
				let _order = '';
				if (order === true)
				{
					_order = `<span class="order">
								<i class="fa fa-caret-up asc" data-order="${field},asc"></i>
								<i class="fa fa-caret-down desc" data-order="${field},desc"></i>
							</span>`;
				}
				return _order;
			},
			// 创建表头
			head : () => {
				// 表头
				v.html += `<thead><tr>`;
				// 全选
				v.html += this._checkbox();
				// 列
				_.each(this.param.column, (row, k) => {
					v.html += `<td>${row.name}${func.order(row.order, row.field)}</td>`;
					// 是否需要搜索
					if (row.search === true)
						v.search.push(k);
				});
				v.html += '</tr></thead>';
			},
			// 搜索
			search : () => {
				let html = `<div class="table-search"><form><div class="block-box">`;
				let param = [];
				_.each(v.search, (v, k) => {
					html += `<div class="col-lg-3 col-md-3"><div class="form-group">`;
					let column = this.param.column[v];
					// 默认文本框搜索
					if (this.param.search[column.field] == undefined)
					{
						html += `<div class="input-group">
									<span class="prepend">${column.name}</span>
									<input name="${column.field}" type="text" 
										placeholder="请输入${column.name}">
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
											<option value="${module.conf.select_default_val}">
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
				html += `<div class="col-lg-3 col-md-3">
							<button class="search-do highlight mr10">
								<i class="fa fa-search"></i>
								搜索
							</button>
							<button class="search-refresh" data-for="${this.dom}">
								<i class="fa fa-refresh"></i>
								重置
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
				if (this.param.config.button.length == 0)
				{
					return;
				}
				v.tools = `<div class="table-tools">`;
				_.each(this.param.config.button, (row, k) => {
					v.tools += (k == 0) ? `<button class="highlight">` : `<button>`;
					if (row.icon != undefined)
						v.tools += `<i class="fa ${row.icon}"></i>`;
					v.tools += row.name + `</button>`;
				});
				v.tools += '</div>';
				this.domCache.before(v.tools);
				this.toolsBox = this.domCache.prev('.table-tools');
			},
			// 分页栏
			page : () => {
				if (_.isBoolean(this.param.config.page))
					return;
				let html = `<div class="table-page">
								<span class="info">
									共<em></em>条，每页
									<select name="pagesize" data-width="60">
										<option value="10"${this.size == 10 ? ' selected' : ''}>10</option>
										<option value="30"${this.size == 30 ? ' selected' : ''}>30</option>
										<option value="50"${this.size == 50 ? ' selected' : ''}>50</option>
										<option value="100"${this.size == 100 ? ' selected' : ''}>100</option>
									</select>
									条，
									当前 <em>${this.page}</em>/<em>-</em> 页
								</span>
								<span class="prev-page"><i class="fa fa-angle-left"></i></span>
								<span class="next-page"><i class="fa fa-angle-right"></i></span>
								<span class="jump">
									跳转到第
									<input name="page" type="text" placeholder="页数">
									页
									<button class="highlight small">确定</button>
								</span>
							</div>`;
				this.domCache.after(html);
				this.pageBox = this.domCache.next('.table-page');
			},
			// 固定
			fixed : () => {
				v.fixed = '';
				// 首列
				if (this.param.config.fixed.first)
				{
					v.fixed += `<div class="fixed-left">
									<table>
										<thead><tr>`;
					v.fixed += this._checkbox(null, true);
					let head = _.head(this.param.column);
					v.fixed += `<td>${head.name}${func.order(head.order, head.field)}</td>
								</tr></thead>`;
					v.fixed += `<tbody></tbody>
								</table></div>`;
				}
				// 尾列
				if (this.param.config.fixed.last)
				{
					v.fixed += `<div class="fixed-right">
									<table>
										<thead><tr>`;
					let last = _.last(this.param.column);
					v.fixed += `<td>${last.name}${func.order(last.order, last.field)}</td>
								</tr></thead>`;
					v.fixed += `<tbody></tbody>
								</table></div>`;
				}
				this.domCache.append(v.fixed);
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
				v.html += `<tbody></tbody></table></div>`;
				this.domCache.html(v.html);
				// 固定列
				func.fixed();
				// 如果没有按钮栏则增加上划线
				if (this.param.config.button.length == 0)
				{
					this.domCache.
						find('thead > tr').
						addClass('head-border-top');
				}
				this.table = {
					head : this.domCache.find('thead'),
					body : this.domCache.find('tbody'),
					l    : this.domCache.find('.fixed-left').find('tbody'),
					r    : this.domCache.find('.fixed-right').find('tbody'),
					box  : this.domCache.find('.table-box')
				};
				this.table.t = this.table.box.children('table');
				this.table.c = this.table.t.children('tbody');
			}
		};
		this.shade.css('display', 'flex');
		// 创建表格
		v.html = `<div class="table-box" style="width:${this.width}px;">
				  	<table>`;
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
			this.dom + ' thead .checkall',
			// 单选
			this.dom + ' tbody .checkall',
			// 行
			this.dom + ' tbody tr',
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
			this.dom + ' .order i:not(.active)',
			// 开关
			this.dom + ' .checkbox-switch'
		];
		let that = this;
		let func = {
			jumpError : (msg) => {
				Eadmin.message.error({
					content : msg
				});
				that.pageBox.
					find('input').val('');
			},
			result : (data, callback = null) => {
				// 没有执行成功码
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
					// 提示
					let param = {
						content : msg
					};
					if (callback != null)
					{
						param['callback'] = callback;
					}
					Eadmin.popup.success(param);
					return;
				}
				if (msg == '') msg = '操作执行失败';
				Eadmin.popup.error({
					content : msg
				});
			}
		};
		// 全选反选，单选
		if (that.param.config.checkbox)
		{
			// 全选
			box.
			on('click', dom[0], function(){
				let _v = {
					this : $(this)
				};
				_v.isCheck = _v.this.is(':checked') ? 1 : 0;
				// 全选设置选中个数为当页条数
				that.checked = (_v.isCheck == 1) ? that.size : 0;
				if (that.param.config.fixed.first)
				{
					_v.checkbox = that.table.l.find('.checkall');
				}
				else
				{
					_v.checkbox = that.table.t.find('.checkall');
				}
				Form.checkbox(_v.checkbox, _v.isCheck);
			}).
			// 单选
			on('click', dom[1], function(){
				let _v = {
					this : $(this)
				};
				that.checked += _v.this.is(':checked') ? 1 : -1;
				_v.checkall = that.table.head.find('.checkall');
				// 全选
				_v.isCheck = that.checked == that.size ? 1 : 0;
				Form.checkbox(_v.checkall, _v.isCheck);
			});
		}
		// 移入高亮
		if (that.param.config.fixed.first || 
			that.param.config.fixed.last)
		{
			let index = 0;
			box.
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
			box.
			// 执行搜索
			on('click', dom[3], () => {
				that.page = 1;
				that.get[that.param.config.page.page_field] = that.page;
				// 搜索表单数据
				let form = that.searchBox.children('form').serialize();
				let search = _.split(form, '&');
				_.each(search, (val) => {
					let param = _.split(val, '=');
					that.get[param[0]] = param[1];
				});
				that._loadData(true);
				return false;
			}).
			// 重置搜索
			on('click', dom[4], () => {
				// 重置输入框
				that.searchBox.
					find('input').
					val('');
				// 重置下拉菜单
				Form.select(that.searchBox);
				return false;
			});
		}
		// 工具栏
		if (that.toolsBox != null)
		{
			_.each(that.param.config.button, (row, k) => {
				// 打开窗口
				if (row.open != undefined)
				{
					// 生成ID
					let id = 'table-btn-open-window-' + k;
					that.toolsBox.
						find('button').
						eq(k).
						attr('id', id).
						data('window-url', row.open.url);
					Eadmin.window('#' + id, row.open);
					return true;
				}
				that.toolsBox.find('button').eq(k).
				on('click', () => {
					if (row.check_checked === true && 
						that.checked == 0)
					{
						Eadmin.popup.error({
							content : '请至少选择一项执行此操作'
						});
						return;
					}
					let _func = () => {
						let checkval = [],
							params = {};
						// 检测复选框选中情况
						let checked;
						if (that.param.config.fixed.first)
						{
							checked = that.table.l.find('.checkall:checked');
						}
						else
						{
							checked = that.table.c.find('.checkall:checked');
						}
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
							axios.get(row.api, {
								params : params
							}).
							then((response) => {
								let data = response.data;
								func.result(data, () => {
									if (row.refresh === true)
									that._loadData();
								});
							});
							return;
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
							content  : '确认执行此操作吗？',
							callback : _func
						});
						return;
					}
					_func();
				});
			});
		}
		// 分页
		if ( ! _.isBoolean(this.param.config.page))
		{
			box.
			// 切换每页条数
			on('change', dom[5], function(){
				that.page = 1;
				that.size = parseInt($(this).val());
				that.get[that.param.config.page.size_field] = that.size;
				that._loadData(true);
			}).
			// 数字分页
			on('click', dom[6], function(){
				let v = {
					this : $(this)
				};
				that.page = parseInt($(this).html());
				that.get[that.param.config.page.page_field] = that.page;
				that._loadData(true);
			}).
			// 上翻
			on('click', dom[7], () => {
				if (that.page == 1) return;
				that.page -= 1;
				that.get[that.param.config.page.page_field] = that.page;
				that._loadData(true);
			}).
			// 下翻
			on('click', dom[8], () => {
				if (that.page == that.pageCount) return;
				that.page += 1;
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
				that.page = parseInt(page);
				that.get[that.param.config.page.page_field] = that.page;
				that._loadData(true);
			});
		}
		// 排序
		box.
		on('click', dom[11], function(){
			let v = {
				this : $(this)
			};
			that.table.head.
				find('.active').
				removeClass('active');
			v.this.addClass('active');
			that.get.order = v.this.data('order');
			that._loadData();
		}).
		// 开关
		on('click', dom[12], function(){
			let v = {
				this : $(this)
			};
			v.label = v.this.prev('label');
			v.api   = v.label.data('api');
			v.field = v.label.data('field');
			v.val   = v.label.children().val() == 1 ? 0 : 1;
			v.param = {};
			v.param[v.field] = v.val;
			// 请求数据
			axios.get(v.api, {
				params : v.param
			}).
			then((response) => {
				let data = response.data;
				func.result(data);
			}).catch((e) => {
				console.log(e);
			});
		});
		// 列按钮
		let key = _.findIndex(this.param.column, function(o){return o.button != undefined;});
		if (key != -1)
		{
			_.each(this.param.column[key].button, (row, key) => {
				// 打开弹窗
				if (row.open != undefined)
				{
					Eadmin.window('.column-btn-' + key, row.open);
					return true;
				}
				// 指定API
				if (row.api != undefined)
				{
					box.on('click', '.column-btn-' + key, function(){
						let api = $(this).data('api');
						let _func = () => {
							axios.get(api).
							then((response) => {
								let data = response.data;
								func.result(data, () => {
									if (row.refresh === true) that._loadData();
								});
							});
						};
						if (row.confirm === true)
						{
							Eadmin.popup.confirm({
								content  : '确定执行此操作吗？',
								callback : _func
							});
							return;
						}
						_func();
					});
				}
			});
		}
	}

	/**
	 * 复选框统一处理
	 */
	_checkbox(data = null, fixed = false){
		// 判断是否需要全选反选
		if (this.param.config.checkbox === false)
		{
			return '';
		}
		if (this.param.config.fixed.first && ! fixed)
		{
			return `<td class="td-checkbox"><div></div></td>`;
		}
		// 标题栏的全选框，不需要赋值
		if (data == null)
		{
			return `<td class="td-checkbox"><div>
						<label>
							<input type="checkbox" class="checkall">
						</label>
					</div></td>`;
		}
		if (data[this.param.config.checkbox] == undefined)
		{
			console.log('复选框绑定的字段' + this.param.config.checkbox + '不存在');
			return '';
		}
		return `<td class="td-checkbox"></div>
					<label>
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
		box[0].scrollTop = 0;
		if ( ! this.init)
		{
			this.pageBox.data('size', this.size);
		}
		let v = {
			// 总条数
			count : this.pageBox.find('em:first'),
			// 当前页数
			page  : this.pageBox.find('em').eq(1),
			// 总页数
			pageCount : this.pageBox.find('em').eq(2)
		};
		if (data.count != parseInt(v.count.html()) || 
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
			{
				this.pageBox.data('size', this.size);
			}
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
		if (end > this.pageCount) end = this.pageCount;
		if (end - from < num - 1) from -= num - (end - from) - 1;
		if (from < 1) from = 1;
		for (let i = from; i <= end; i++)
			html += `<span class="num-page${i == this.page ? ' current' : ''}" data-page="${i}">${i}</span>`;
		this.pageBox.
			find('.num-page').
			remove();
		this.pageBox.
			find('.prev-page').
			after(html);
		if (this.init && page)
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
		this.checked = 0;
		this.shade.css('display', 'flex');
		// 请求数据
		axios.get(this.param.config.data, {
			params : this.get
		}).
		then((response) => {
			let v = {
				data : response.data,
				html : '',
				fl   : '',
				fr   : ''
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
			// 构建表格
			_.each(v.data.list, (row) => {
				v.fl += `<tr>`;
				v.html += `<tr>`;
				v.fr += `<tr>`;
				// 全选
				v.html += this._checkbox(row);
				v.fl += this._checkbox(row, true);
				_.each(this.param.column, (c, k) => {
					let _html = `<td>`;
					if (c.switch === true)
					{
						let api = c.api;
						if (api == undefined)
						{
							console.log('没有指定保存开关状态的API地址');
						}
						api = _.replace(api, /\$(\w+)/g, (key) => {
							key = _.replace(key, '$', '');
							return row[key];
						});
						_html += `<label class="no-padding" data-api="${api}" data-field="${c.field}">
									<input type="checkbox" data-model="switch"${row[c.field] == 1 ? ' checked' : ''}>
								</label>`;
					}
					else if(_.isArray(c.button))
					{
						_.each(c.button, (b, btn_key) => {
							let icon = '';
							if (b.icon != undefined) icon = `<i class="fa ${b.icon}"></i>`;
							let api = '';
							if (b.api != undefined)
							{
								api = _.replace(b.api, /\$(\w+)/g, (key) => {
									key = _.replace(key, '$', '');
									return row[key];
								});
							}
							let url = "";
							if (b.open != undefined)
							{
								url = _.replace(b.open.url, /\$(\w+)/g, (key) => {
									key = _.replace(key, '$', '');
									return row[key];
								});
							}
							_html += `<button 
										data-api="${api}" 
										data-window-url="${url}"
										class="small mr5 column-btn-${btn_key}" 
										style="background:${this.color[btn_key]};"
										>
										${icon} ${b.name}
									</button>`;
						});
					}
					else
					{
						_html += row[c.field];
					}
					_html += `</td>`;
					// 首列
					if (k == 0)
					{
						v.fl += _html;
					}
					v.html += _html;
					// 尾列
					if (k + 1 == this.param.column.length)
					{
						v.fr += _html;
					}
				});
				v.fl += `</tr>`;
				v.html += `</tr>`;
				v.fr += `</tr>`;
			});
			this.table.c.html(v.html);
			Eadmin.form(this.table.c);
			// 首列
			if (this.param.config.fixed.first === true)
			{
				this.table.l.html(v.fl);
				Eadmin.form(this.table.l);
			}
			// 尾列
			if (this.param.config.fixed.last === true)
			{
				this.table.r.html(v.fr);
				Eadmin.form(this.table.r);
			}
			// 分页
			this._page(v.data, page);
			let checkall = this.table.head.find(':checkbox');
			if (checkall.is(':checked'))
				Form.checkbox(checkall, false);
			// 隐藏遮罩
			this.shade.hide();
			if (this.init)
			{
				return;
			}
			// 校验最小宽度
			if (this.table.t.width() <= this.width)
			{
				this.table.t.width(this.width);
			}
			else
			{
				this.domCache.
					children('.table-box').
					css('padding-bottom', '18px');
				// 横向滚动条
				Eadmin.scroll(this.dom + ' .table-box', 'x');
			}
			this.init = true;
		}).catch((e) => {
			console.log(e);
		});
	}

}