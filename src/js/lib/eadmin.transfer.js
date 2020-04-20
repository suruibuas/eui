/**
 * eadmin 穿梭框组件
 */

class Transfer{

	constructor(dom, param){
		// 原始DOM名称
		this.dom = dom;
		// DOM缓存
		this.domCache = scope(this.dom);
		if (this.domCache.length == 0)
		{
			console.log('没有找到' + this.dom + '穿梭框容器，创建失败');
			return;
		}
		// 判断参数
		if (param == undefined || 
			param.data == undefined)
		{
			console.log('穿梭框' + this.dom + '没有指定数据源：data，创建失败');
			return;
		}
		// 默认参数
		let _param   = {
			// 数据源
			data   : {},
			// 支持搜索
			search : false,
			// 自定义宽度
			width  : 0,
			// 自定义高度
			height : 0
		}
		// 数据源
		if (_.isString(param.data))
		{
			if ( ! _.startsWith(param.data, 'http'))
			{
				param.data = module.conf.http.baseURL + param.data;
			}
			$.ajax({
				url      : param.data,
				type     : 'get',
				async    : false,
				dataType : 'json',
				success  : (data) => {
					param.data = data;
				}
			});
		}
		if (param.data.length == 0)
		{
			console.log('穿梭框' + this.dom + '数据源为空，创建失败');
			return;
		}
		// 配置参数
		this.param = $.extend(_param, param);
		this.domCache.addClass('transfer-box');
		// 运行
		this.run();
	}

	/**
	 * 运行
	 */
	run(){
		this._create();
		this._event();
	}

	/**
	 * 创建结构
	 */
	_create(){
		// 私有变量
		let v = {
			// 左侧数据
			from   : [],
			// 右侧数据
			to     : [],
			// 主体默认高度
			height : 226,
			// 自定义样式
			style  : ' style="',
			// 搜索HTML代码
			search : '',
			// 完整HTML
			html   : ''
		};
		// 组装数据
		for (let i in this.param.data)
		{
			let data = this.param.data[i];
			if (data.checked == undefined || ! 
				data.checked)
			{
				v.from.push(data);
			}
			else
			{
				v.to.push(data);
			}
		}
		// 自定义宽度
		if (this.param.width > 0)
		{
			v.style += 'width:' + this.param.width + 'px;';
		}
		// 自定义高度
		if (this.param.height > 0)
		{
			v.style += 'height:' + this.param.height + 'px;';
			v.height = this.param.height - 34;
		}
		v.style += `"`;
		// 搜索
		if (this.param.search)
		{
			v.search = ' transfer-body-search';
			v.height -= 32;
		}
		v.html = `<div class="transfer-box-list"${v.style}>
			<div class="transfer-header">
				<label>
					<input type="checkbox" data-num="0"> 源列表
				</label>
				<span class="count">
					<em>0</em> / <em>${v.from.length}</em>
				</span>
			</div>
			<div class="iscroll transfer-body${v.search}" style="height:${v.height}px;">
				<ul>`;
		for (let i in v.from)
		{
			let d = (v.from[i].disabled == true) ? 'disabled' : '';
			v.html += `<li class="${d}">
							<label>
								<input name="${v.from[i].name}" data-num="0" value="${v.from[i].val}" type="checkbox" ${d}> ${v.from[i].txt}
							</label>
						</li>`;
		}
		v.html += `</ul></div>`;
		if (this.param.search)
		{
			v.html += `<div class="transfer-search">
							<label>
								<input data-num="0" class="search-input" type="text" placeholder="请输入搜索内容" data-icon="search|right">
							</label>
						</div>`;
		}
		v.html += `</div><div class="transfer-operation">
						<button disabled class="highlight" data-num="0">
							<i class="fa fa-angle-left"></i>
						</button>
						<button disabled class="highlight" data-num="1">
							<i class="fa fa-angle-right"></i>
						</button>
					</div>`;
		v.html += `<div class="transfer-box-list"${v.style}>
					<div class="transfer-header">
						<label>
							<input type="checkbox" data-num="1"> 目标列表
						</label>
						<span class="count"><em>0</em> / <em>${v.to.length}</em></span>
					</div>
					<div class="iscroll transfer-body${v.search}" style="height:${v.height}px;"><ul>`;
		for (let i in v.to)
		{
			let d = (v.to[i].disabled == true) ? 'disabled' : '';
			v.html += `<li class="${d}">
							<label>
								<input name="${v.to[i].name}" data-num="1" value="${v.to[i].val}" type="checkbox" ${d}> ${v.to[i].txt}
							</label>
						</li>`;
		}
		v.html += `</ul></div>`;
		if (this.param.search)
		{
			v.html += `<div class="transfer-search">
							<label>
								<input data-num="1" class="search-input" type="text" placeholder="请输入搜索内容" data-icon="search|right">
							</label>
						</div>`;
		}
		v.html += `</div>`;
		this.domCache.html(v.html);
	}

	/**
	 * 事件监听
	 */
	_event(){
		let dom = [
			// 全选反选
			'.transfer-header :checkbox',
			// 单选
			'.transfer-body :checkbox',
			// 左右移动
			'.transfer-operation button'
		];
		let that = this;
		// 私有变量
		let v  = {
			body      : this.domCache.find('.transfer-body'),
			header    : this.domCache.find('.transfer-header'),
			operation : this.domCache.find('.transfer-operation')
		};
		this.domCache.
		// 全选反选
		on('click', dom[0], function(){
			let _v = {
				this : $(this)
			};
			_v.eq = parseInt(_v.this.data('num'));
			_v.checkbox = v.body.
							eq(_v.eq).
							find(':checkbox').
							not(':disabled');
			if (_v.this.is(':checked'))
			{
				Form.checkbox(_v.checkbox, 1);
				// 总数
				v.header.
					eq(_v.eq).
					find('em:first').
					html(_v.checkbox.length);
				// 右移按钮
				v.operation.
					children('button').
					eq(_v.eq == 1 ? 0 : 1).
					prop('disabled', false);
			}
			else
			{
				Form.checkbox(_v.checkbox, 0);
				// 总数
				v.header.
					eq(_v.eq).
					find('em:first').
					html(0);
				// 右移按钮
				v.operation.
					children('button').
					eq(_v.eq == 1 ? 0 : 1).
					prop('disabled', true);
			}
		}).
		// 单选
		on('click', dom[1], function(){
			let _v = {
				this : $(this)
			};
			_v.eq = parseInt(_v.this.data('num'));
			_v.checkbox = v.body.eq(_v.eq).find(':checkbox').length;
			_v.checked  = v.body.eq(_v.eq).find(':checkbox:checked').length;
			_v.checkall = v.header.eq(_v.eq).find(':checkbox');
			// 总数
			v.header.
				eq(_v.eq).
				find('em:first').
				html(_v.checked);
			// 全选按钮
			Form.checkbox(_v.checkall, _v.checked == _v.checkbox ? 1 : 0);
			// 移动按钮
			if (_v.checked == 1)
			{
				v.operation.
					children('button').
					eq(_v.eq == 1 ? 0 : 1).
					prop('disabled', false);
			}
			else if (_v.checked == 0)
			{
				v.operation.
					children('button').
					eq(_v.eq == 1 ? 0 : 1).
					prop('disabled', true);
			}
		}).
		// 左右移动
		on('click', dom[2], function(){
			let _v = {
				this : $(this)
			};
			_v.eq = parseInt(_v.this.data('num'));
			_v.this.prop('disabled', true);
			_v.checked = v.body.
							eq(_v.eq == 1 ? 0 : 1).
							find(':checkbox:checked').
							parent().
							parent();
			// 选中选项的克隆对象
			_v.clone = _v.checked.clone();
			_v.checkbox = _v.clone.find(':checkbox');
			// 复位克隆对象复选框
			_v.checkbox.data('num', _v.eq);
			Form.checkbox(_v.checkbox, 0);
			// 移动
			v.body.
				eq(_v.eq).
				children('ul').
				prepend(_v.clone);
			// 删除原始
			_v.checked.remove();
			// 总数复位
			v.header.
				eq(_v.eq == 1 ? 0 : 1).
				find('em:first').
				html(0);
			v.header.
				eq(_v.eq == 1 ? 0 : 1).
				find('em:last').
				html(v.body.eq(_v.eq == 1 ? 0 : 1).find(':checkbox').length);
			v.header.
				eq(_v.eq).
				find('em:last').
				html(v.body.eq(_v.eq).find(':checkbox').length);
			// 全选按钮复位
			_v.checkbox = v.header.
								eq(_v.eq == 1 ? 0 : 1).
								find(':checkbox');
			Form.checkbox(_v.checkbox, 0);
			// 复位搜索结果
			if(that.param.search)
			{
				that.domCache.
					find('.search-input').
					eq(_v.eq == 1 ? 0 : 1).
					val('');
				v.body.
					eq(_v.eq == 1 ? 0 : 1).
					find('li').
					show();
			}
		});
		if ( ! that.param.search) return;
		// 搜索
		keyup(that.domCache.find('.search-input'), (_this) => {
			let _v = {
				eq   : parseInt(_this.data('num')),
				val  : _this.val(),
				body : that.domCache.find('.transfer-body')
			};
			if (_v.val == '')
			{
				_v.body.
					eq(_v.eq).
					find('li').
					show();
				return;
			}
			_v.body.
				eq(_v.eq).
				find('li').
				each(function(){
					let _this = $(this);
					if(_this.text().indexOf(_v.val) == -1)
					{
						_this.hide();
						return;
					}
					_this.show();
				});
		});
	}

}