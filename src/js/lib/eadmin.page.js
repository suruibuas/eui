/**
 * eadmin 分页组件
 */

class Page{

	constructor(param){
		if (param.data == undefined)
		{
			console.log('自定义分页必须指定数据接口');
			return;
		}
		this.window = Mount.window != null ? '#' + Mount.window : null;
		// 搜索盒子
		if (param.search != undefined)
		{
			this.searchBox = this.window != null ? this.window + ' ' + param.search.boxid : param.search.boxid;
			this.searchBoxCache = $(this.searchBox);
		}
		// 分页盒子
		if (param.page != undefined)
		{
			this.pageBox = this.window != null ? this.window + ' ' + param.page.boxid : param.page.boxid;
			this.pageBoxCache = $(this.pageBox);
		}
		// 缓存KEY
		this.storeKey = md5(Eadmin.currentHref);
		// 当前页数
		this.page = 1;
		let page = store(this.storeKey + '_page');
		if (page != undefined) 
			this.page = parseInt(page);
		// 每页条数
		this.size = 10;
		// 总页数
		this.pageCount = null;
		// GET参数
		this.get = {};
		// 配置参数
		this.param = param;
		let size = store(this.storeKey + '_size');
		if (size != undefined) 
			this.param.page.size = parseInt(size);
		this.size = this.param.page.size;
		// 赋值GET默认参数
		this.get[this.param.page.page_field] = this.page;
		this.get[this.param.page.size_field] = this.size;
		this.init = false;
		this.run();
	}

	/**
	 * 运行
	 */
	run(){
		// 创建
		this._create();
		// 事件
		this._event();
	}

	/**
	 * 创建
	 */
	_create(){
		let that = this;
		// 私有方法
		let func = {
			// 搜索
			search : () => {
				if (this.param.search == undefined) return;
				let html = `<div class="table-search">
								<form>
									<div class="block-box">`;
				_.each(this.param.search.field, (v, k) => {
					html += `<div class="col-3">
								<div class="form-group">`;
					switch (v.type)
					{
						case 'input':
							html += `<div class="input-group">
										<span class="prepend">${v.name}</span>
										<input name="${k}" type="text" 
											placeholder="请输入${v.name}">
									</div>`;
						break;
						case 'datepicker':
							html += `<div class="input-group">
										<span class="prepend">${v.name}</span>
										<input 
											id="table-datepicker-${k}" 
											class="table-datepicker"
											name="${k}" 
											type="text" 
											placeholder="请选择${v.name}">
									</div>`;
						break;
						case 'citypicker':
							html += `<div class="input-group">
										<span class="prepend">${v.name}</span>
										<input 
											id="table-citypicker-${k}" 
											class="table-citypicker"
											name="${k}" 
											type="text" 
											placeholder="请选择${v.name}">
									</div>`;
						break;
						case 'select':
							html += `<select name="${k}" data-width="100%">
										<option value="${module.conf.select_default_val}">
											请选择${v.name}
										</option>`;
							_.each(v.option, (row) => {
								html += `<option value="${row.val}">
											${row.key}
										</option>`;
							});
							html += `</select>`;
						break;
					}
					html += `</div></div>`;
				});
				html += `<div class="col-3">
							<button class="search-do highlight">
								<i class="ri-search-line"></i>搜索
							</button><button class="search-refresh">
								<i class="ri-refresh-line"></i>重置
							</button>
						</div>
						</div></form></div>`;
				this.searchBoxCache.prepend(html);
				// 日历
				this.searchBoxCache.
					find('.table-datepicker').
					each(function(){
						let _this  = $(this);
						let _name  = _this.attr('name');
						let _param = {};
						if (that.param.search.field[_name].param != undefined)
							_param = that.param.search.field[_name].param;
						Eadmin.datepicker('#' + _this.attr('id'), _param);
					});
				// 地区
				this.searchBoxCache.
					find('.table-citypicker').
					each(function(){
						let _this  = $(this);
						let _name  = _this.attr('name');
						let _param = {};
						if (that.param.search.field[_name].param != undefined)
							_param = that.param.search.field[_name].param;
						Eadmin.citypicker('#' + _this.attr('id'), _param);
					});
			},
			// 分页栏
			page : () => {
				if (this.param.page == undefined) return;
				let html = `<div class="table-page">
								<span class="info">
									共<em></em>条，每页
									<select name="pagesize" data-width="70">
										<option value="10"${this.size == 10 ? ' selected' : ''}>10</option>
										<option value="30"${this.size == 30 ? ' selected' : ''}>30</option>
										<option value="50"${this.size == 50 ? ' selected' : ''}>50</option>
										<option value="100"${this.size == 100 ? ' selected' : ''}>100</option>
									</select>
									条，
									当前 <em>${this.page}</em>/<em>-</em> 页
								</span>
								<span class="prev-page"><i class="ri-arrow-left-s-line"></i></span>
								<span class="next-page"><i class="ri-arrow-right-s-line"></i></span>
								<span class="jump">
									跳转到第
									<input name="page" type="text" placeholder="页数">
									页
									<button class="highlight small">确定</button>
								</span>
							</div>`;
				this.pageBoxCache.html(html);
			}
		};
		func.search();
		func.page();
		// 构建数据
		this._loadData();
	}

	/**
	 * 事件
	 */
	_event(){
		let dom = [
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
			'.table-page button'
		];
		let that = this;
		let func = {
			jumpError : (msg) => {
				Eadmin.message.error({
					content : msg
				});
				that.pageBox.
					find('input').val('');
			}
		};
		// 搜索
		if (that.param.search != undefined)
		{
			that.searchBoxCache.
			// 执行搜索
			on('click', dom[0], () => {
				that.page = 1;
				that.get[that.param.page.page_field] = that.page;
				// 搜索表单数据
				let form = that.searchBoxCache.find('form').serialize();
				let search = _.split(form, '&');
				_.each(search, (val) => {
					let param = _.split(val, '=');
					that.get[param[0]] = param[1];
				});
				that._loadData(true);
				return false;
			}).
			// 重置搜索
			on('click', dom[1], () => {
				// 重置输入框
				that.searchBoxCache.
					find('input').
					val('');
				// 重置下拉菜单
				Form.select(that.searchBoxCache);
				return false;
			});
		}
		// 分页
		if (that.param.page != undefined)
		{
			that.pageBoxCache.
			// 切换每页条数
			on('change', dom[2], function(){
				that.page = 1;
				that.size = parseInt($(this).val());
				store(that.storeKey + '_page', that.page.toString());
				store(that.storeKey + '_size', that.size.toString());
				that.get[that.param.page.page_field] = that.page;
				that.get[that.param.page.size_field] = that.size;
				that._loadData(true);
			}).
			// 数字分页
			on('click', dom[3], function(){
				that.page = parseInt($(this).html());
				store(that.storeKey + '_page', that.page.toString());
				that.get[that.param.page.page_field] = that.page;
				that._loadData(true);
			}).
			// 上翻
			on('click', dom[4], () => {
				if (that.page == 1) return;
				that.page -= 1;
				store(that.storeKey + '_page', that.page.toString());
				that.get[that.param.page.page_field] = that.page;
				that._loadData(true);
			}).
			// 下翻
			on('click', dom[5], () => {
				if (that.page == that.pageCount) return;
				that.page += 1;
				store(that.storeKey + '_page', that.page.toString());
				that.get[that.param.page.page_field] = that.page;
				that._loadData(true);
			}).
			// 跳转
			on('click', dom[6], () => {
				let page = that.pageBoxCache.find('input').val();
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
				that.page = parseInt(page);
				that.get[that.param.page.page_field] = that.page;
				that._loadData(true);
			});
		}
	}

	/**
	 * 分页处理
	 */
	_page(data, page = false){
		// 没有分页则不处理
		if (this.param.page == undefined) return;
		if ( ! _.has(data, 'count'))
		{
			console.log('数据源中未包含数据总条数count字段，创建分页失败');
			return;
		}
		if (this.window != null)
		{
			if ( ! _.startsWith(this.window, '#tab'))
				$(this.window + ' .body')[0].scrollTop = 0;
		}
		else
		{
			box[0].scrollTop = 0;
		}
		if ( ! this.init)
		{
			this.pageBoxCache.data('size', this.size);
		}
		let v = {
			// 总条数
			count : this.pageBoxCache.find('em:first'),
			// 当前页数
			page  : this.pageBoxCache.find('em').eq(1),
			// 总页数
			pageCount : this.pageBoxCache.find('em').eq(2)
		};
		if (data.count != parseInt(v.count.html()) || 
			this.size != this.pageBoxCache.data('size'))
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
			if (this.size != this.pageBoxCache.data('size'))
			{
				this.pageBoxCache.data('size', this.size);
			}
		}
		v.page.html(this.page);
		// 循环页码
		let num = 10;
		if (_.has(this.param.page, 'num'))
		{
			num = this.param.page.num;
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
		this.pageBoxCache.
			find('.num-page').
			remove();
		this.pageBoxCache.
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
		// 请求数据
		axios.get(this.param.data, {
			params : this.get
		}).
		then((response) => {
			let v = {
				data : response.data
			};
			if (v.data.count == undefined && 
				this.param.page != undefined)
			{
				console.log('返回的数据源中没有 count 字段，无法使用分页');
				return;
			}
			if (v.data.list == undefined)
			{
				console.log('数据源中没有包含list字段');
				return;
			}
			// 模版赋值
			Eadmin.template(this.param.tmp, v.data, () => {
				if (_.isFunction(this.param.callback))
					this.param.callback();
			});
			// 分页
			this._page(v.data, page);
			this.init = true;
		}).catch((e) => {
			console.log(e);
		});
	}

}